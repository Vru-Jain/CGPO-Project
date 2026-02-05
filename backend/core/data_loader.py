import time
import threading

import yfinance as yf
import pandas as pd
from typing import List, Dict, Optional


class MarketDataLoader:
    """
    Thin wrapper around yfinance with:
    - simple in-memory caching to avoid hammering upstream APIs (rate-limit friendly)
    - strictly live-data semantics (no random/simulated fallbacks)
    """

    # Cache time-to-live (seconds)
    HISTORY_TTL = 300        # 5 minutes – history changes slowly
    PRICES_TTL = 60          # 1 minute – latest prices
    NEWS_TTL = 60            # 1 minute – news stream
    BENCHMARK_TTL = 300      # 5 minutes – benchmark curves

    def __init__(self, tickers: List[str]):
        self.tickers = tickers

        # Simple in-memory caches keyed by request parameters
        self._lock = threading.RLock()
        self._history_cache: Dict = {}
        self._latest_prices_cache: Optional[Dict] = None
        self._latest_prices_ts: float = 0.0
        self._news_cache: Optional[List[Dict]] = None
        self._news_ts: float = 0.0
        self._benchmark_cache: Dict[str, Dict] = {}

    def _is_fresh(self, ts: float, ttl: int) -> bool:
        return ts > 0 and (time.time() - ts) < ttl

    def fetch_history(self, period: str = "1y", interval: str = "1d") -> pd.DataFrame:
        """
        Fetches historical data for the tickers from live yfinance.
        Returns a MultiIndex DataFrame (Ticker, Price Info).
        Uses a short-lived cache to reduce rate limiting and improve latency.
        """
        cache_key = (tuple(self.tickers), period, interval)
        now = time.time()

        with self._lock:
            ts, cached = self._history_cache.get(cache_key, (0.0, None))
            if cached is not None and self._is_fresh(ts, self.HISTORY_TTL):
                return cached

        print(f"Fetching data for {len(self.tickers)} tickers (period={period}, interval={interval})...")
        # group_by='ticker' ensures we can easily access data per stock
        data = yf.download(
            self.tickers,
            period=period,
            interval=interval,
            group_by="ticker",
            auto_adjust=True,
            progress=False,
        )

        # If only one ticker, yfinance doesn't return a MultiIndex, so we force it or handle it
        if len(self.tickers) == 1:
            # For now, just return as-is; callers already handle both shapes.
            pass

        print("Data fetch complete.")

        with self._lock:
            # Only cache non-empty responses; if upstream failed we don't want to mask recovery.
            if not data.empty:
                self._history_cache[cache_key] = (now, data)

        return data

    def get_latest_prices(self) -> Dict[str, float]:
        """Returns the most recent closing price for each ticker."""
        now = time.time()

        with self._lock:
            if (
                self._latest_prices_cache is not None
                and self._is_fresh(self._latest_prices_ts, self.PRICES_TTL)
            ):
                return dict(self._latest_prices_cache)

        # Use a shorter period for speed
        data = yf.download(
            self.tickers,
            period="5d",
            interval="1d",
            group_by="ticker",
            auto_adjust=True,
            progress=False,
        )

        latest_prices: Dict[str, float] = {}
        for ticker in self.tickers:
            if len(self.tickers) > 1:
                df = data.get(ticker, pd.DataFrame())
            else:
                df = data

            if not df.empty and "Close" in df.columns:
                latest_prices[ticker] = float(df["Close"].iloc[-1])
            else:
                latest_prices[ticker] = 0.0

        with self._lock:
            self._latest_prices_cache = dict(latest_prices)
            self._latest_prices_ts = now

        return latest_prices

    def fetch_news(self, limit: int = 5) -> List[Dict[str, str]]:
        """
        Fetches news for all tickers and returns a sorted list of signals.
        Uses a short-lived cache to avoid hitting the upstream news endpoint too frequently.
        """
        now = time.time()

        with self._lock:
            if self._news_cache is not None and self._is_fresh(self._news_ts, self.NEWS_TTL):
                # Return a shallow copy so callers can't mutate internal cache
                return list(self._news_cache)[:limit]

        all_news: List[Dict[str, str]] = []
        import datetime
        from textblob import TextBlob

        print("Fetching news...")
        for ticker in self.tickers:
            try:
                t = yf.Ticker(ticker)
                # yfinance news is a list of dicts:
                # {'uuid': ..., 'title': ..., 'publisher': ..., 'link': ..., 'providerPublishTime': ...}
                news_items = t.news or []

                for item in news_items:
                    # Handle new yfinance structure where data is in 'content'
                    content = item.get("content", item)

                    title = content.get("title", "No Title")

                    # Time extraction
                    if "providerPublishTime" in item:
                        ts = item["providerPublishTime"]
                        dt = datetime.datetime.fromtimestamp(ts)
                    elif "pubDate" in content:
                        # ISO Format: 2024-01-28T14:38:35Z
                        try:
                            pub_date = content["pubDate"].replace("Z", "+00:00")
                            dt = datetime.datetime.fromisoformat(pub_date)
                        except Exception:
                            dt = datetime.datetime.now()
                    else:
                        dt = datetime.datetime.now()

                    time_str = dt.strftime("%H:%M")

                    # TextBlob for Sentiment
                    blob = TextBlob(title)
                    polarity = blob.sentiment.polarity

                    if polarity > 0.1:
                        sent = "POS"
                    elif polarity < -0.1:
                        sent = "NEG"
                    else:
                        sent = "NEU"

                    all_news.append(
                        {
                            "ts": time_str,
                            "src": ticker,
                            "msg": title,
                            "sent": sent,
                            "dt": dt,  # For sorting
                        }
                    )
            except Exception as e:
                print(f"Error fetching news for {ticker}: {e}")

        # Sort by datetime desc
        all_news.sort(key=lambda x: x["dt"], reverse=True)

        # Limit and clean up
        trimmed = all_news[:limit]

        with self._lock:
            self._news_cache = list(trimmed)
            self._news_ts = now

        return trimmed

    def fetch_benchmark(self, period: str = "6mo") -> pd.DataFrame:
        """
        Fetches benchmark index data (SPY, QQQ) for comparison from live yfinance.
        Returns DataFrame with daily returns for both indices.
        Uses caching to avoid repeated remote calls.
        """
        benchmarks = ["SPY", "QQQ"]
        cache_key = period
        now = time.time()

        with self._lock:
            ts, cached = self._benchmark_cache.get(cache_key, (0.0, None))
            if cached is not None and self._is_fresh(ts, self.BENCHMARK_TTL):
                return cached

        print(f"Fetching benchmark data ({', '.join(benchmarks)}) for period={period}...")
        data = yf.download(
            benchmarks,
            period=period,
            interval="1d",
            group_by="ticker",
            auto_adjust=True,
            progress=False,
        )

        result: Dict[str, pd.Series] = {}
        for bench in benchmarks:
            if len(benchmarks) > 1:
                if bench not in data:
                    continue
                close = data[bench]["Close"]
            else:
                close = data["Close"]
            result[bench] = close
            result[f"{bench}_return"] = close.pct_change()

        df = pd.DataFrame(result)

        with self._lock:
            if not df.empty:
                self._benchmark_cache[cache_key] = (now, df)

        return df

    def get_benchmark_performance(self, period: str = "1mo") -> Dict:
        """
        Returns cumulative performance of benchmarks over given period.
        This method no longer fabricates mock/simulated data – if live
        data is unavailable, the caller should handle the error.
        """
        df = self.fetch_benchmark(period)

        performance: Dict[str, Dict] = {}
        for bench in ["SPY", "QQQ"]:
            return_col = f"{bench}_return"
            if return_col in df.columns:
                returns = df[return_col].dropna()
                if returns.empty:
                    continue

                cumulative = (1 + returns).cumprod()
                performance[bench] = {
                    "total_return": float((cumulative.iloc[-1] - 1) * 100) if len(cumulative) > 0 else 0.0,
                    "daily_returns": returns.tolist(),
                    "dates": [d.strftime("%Y-%m-%d") for d in returns.index],
                    "cumulative": cumulative.tolist(),
                }

        if not performance:
            raise ValueError("No benchmark data found from live source")

        return performance


if __name__ == "__main__":
    # Simple test using only live data (no mock/simulated paths)
    loader = MarketDataLoader(["AAPL", "MSFT", "NVDA"])
    df = loader.fetch_history(period="1mo")
    print(df.head())
    print("Latest:", loader.get_latest_prices())
    print("Benchmark:", loader.get_benchmark_performance("1mo"))

