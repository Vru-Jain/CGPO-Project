import yfinance as yf
import pandas as pd
from typing import List, Dict, Optional

class MarketDataLoader:
    def __init__(self, tickers: List[str]):
        self.tickers = tickers

    def fetch_history(self, period: str = "1y", interval: str = "1d") -> pd.DataFrame:
        """
        Fetches historical data for the tickers.
        Returns a MultiIndex DataFrame (Ticker, Price Info).
        """
        print(f"Fetching data for {len(self.tickers)} tickers...")
        # group_by='ticker' ensures we can easily access data per stock
        data = yf.download(self.tickers, period=period, interval=interval, group_by='ticker', auto_adjust=True)
        
        # If only one ticker, yfinance doesn't return a MultiIndex, so we force it or handle it
        if len(self.tickers) == 1:
            # Reconstruct columns to look like MultiIndex if needed, or just keep it simple
            # For now, let's just return as is, but users of this class should handle it.
            pass
            
        print("Data fetch complete.")
        return data

    def get_latest_prices(self) -> Dict[str, float]:
        """Returns the most recent closing price for each ticker."""
        # Use a shorter period for speed
        data = yf.download(self.tickers, period="5d", interval="1d", group_by='ticker', auto_adjust=True, progress=False)
        latest_prices = {}
        for ticker in self.tickers:
            if len(self.tickers) > 1:
                df = data[ticker]
            else:
                df = data
            
            if not df.empty:
                latest_prices[ticker] = df['Close'].iloc[-1]
            else:
                latest_prices[ticker] = 0.0
        return latest_prices

    def fetch_news(self, limit: int = 5) -> List[Dict[str, str]]:
        """
        Fetches news for all tickers and returns a sorted list of signals.
        """
        all_news = []
        import datetime
        
        print("Fetching news...")
        for ticker in self.tickers:
            try:
                t = yf.Ticker(ticker)
                # yfinance news is a list of dicts: 
                # {'uuid': ..., 'title': ..., 'publisher': ..., 'link': ..., 'providerPublishTime': ...}
                news_items = t.news
                
                for item in news_items:
                    # Handle new yfinance structure where data is in 'content'
                    content = item.get('content', item)
                    
                    title = content.get('title', 'No Title')
                    
                    # Time extraction
                    if 'providerPublishTime' in item:
                        # Old format or different provider
                        ts = item['providerPublishTime']
                        dt = datetime.datetime.fromtimestamp(ts)
                    elif 'pubDate' in content:
                        # ISO Format: 2024-01-28T14:38:35Z
                        try:
                            # Simple parse or use dateutil if available, but let's stick to standard lib if possible
                            # Python 3.7+ supports fromisoformat but might fail on Z.
                            pub_date = content['pubDate'].replace('Z', '+00:00')
                            dt = datetime.datetime.fromisoformat(pub_date)
                        except:
                            dt = datetime.datetime.now()
                    else:
                        dt = datetime.datetime.now()
                        
                    time_str = dt.strftime('%H:%M')
                    
                    # Simple heuristic for Sentiment
                    title_lower = title.lower()
                    if any(x in title_lower for x in ['surge', 'jump', 'beat', 'growth', 'record', 'bull', 'up', 'high']):
                        sent = "POS"
                    elif any(x in title_lower for x in ['drop', 'fall', 'miss', 'declin', 'bear', 'down', 'warn', 'low']):
                        sent = "NEG"
                    else:
                        sent = "NEU"
                        
                    all_news.append({
                        "ts": time_str,
                        "src": ticker,
                        "msg": title,
                        "sent": sent,
                        "dt": dt # For sorting
                    })
            except Exception as e:
                print(f"Error fetching news for {ticker}: {e}")
                
        # Sort by datetime desc
        all_news.sort(key=lambda x: x['dt'], reverse=True)
        
        # Limit and clean up
        return all_news[:limit]

if __name__ == "__main__":
    # Simple test
    loader = MarketDataLoader(["AAPL", "MSFT", "NVDA"])
    df = loader.fetch_history(period="1mo")
    print(df.head())
    print("Latest:", loader.get_latest_prices())
