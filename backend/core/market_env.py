import gymnasium as gym
from gymnasium import spaces
import numpy as np
import pandas as pd
import torch
import yfinance as yf
from typing import Tuple, Dict, Any

from core.graph_engine import GraphEngine

class MarketGraphEnv(gym.Env):
    metadata = {'render.modes': ['human']}

    def __init__(self, tickers: list, data: pd.DataFrame, window_size: int = 20, benchmark: str = "SPY"):
        super(MarketGraphEnv, self).__init__()
        
        self.tickers = tickers
        self.data = data
        self.window_size = window_size
        self.n_assets = len(tickers)
        self.benchmark = benchmark

        # Clean, ticker-aligned close prices used for the reward path. See
        # _extract_close — without this the partial most-recent yfinance row
        # injected a NaN on every episode's final step, poisoning the whole
        # episode's normalized returns -> NaN loss -> every update skipped.
        self.close = self._extract_close(data)

        # Fetch benchmark data for the same period
        self._load_benchmark()
        
        # Action Space: Portfolio weights for each asset
        self.action_space = spaces.Box(low=0, high=1, shape=(self.n_assets,), dtype=np.float32)
        
        # Observation Space
        self.observation_space = spaces.Dict({
            'x': spaces.Box(low=-np.inf, high=np.inf, shape=(self.n_assets, 4), dtype=np.float32),
        })
        
        self.graph_engine = GraphEngine(tickers)

        # Precompute every step's observation ONCE. The graph/features at step t
        # depend only on the fixed price window ending at t, so they're identical
        # across episodes — recomputing build_graph (~RSI/MACD/correlation) every
        # step was the training bottleneck (~6s/episode) and pushed long runs
        # past Modal's ~5-min container window, which recycled the container and
        # killed training before it could save. Caching makes episodes ~10x
        # faster so runs finish well inside the window.
        self._obs_cache = {}
        self._precompute_observations()

        self.current_step = window_size
        self.portfolio_value = 10000.0
        self.benchmark_value = 10000.0
        self.current_weights = np.ones(self.n_assets) / self.n_assets

        # Track cumulative performance
        self.agent_returns = []
        self.benchmark_returns = []

    def _precompute_observations(self):
        """Build and cache the observation for every reachable step index."""
        for t in range(self.window_size, len(self.data)):
            window_data = self.data.iloc[t - self.window_size : t]
            x, edge_index, edge_attr = self.graph_engine.build_graph(window_data, self.window_size)
            self._obs_cache[t] = {
                'x': x.cpu().numpy(),
                'edge_index': edge_index.cpu().numpy(),
                'edge_attr': edge_attr.cpu().numpy(),
            }

    def _extract_close(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Return a clean close-price DataFrame whose columns are in self.tickers
        order. yfinance returns columns in its own order, and the reward path
        does np.dot(weights, returns) where `weights` is in self.tickers order —
        so we MUST reindex to align them. We also forward/back-fill, because the
        most recent yfinance row is frequently a partial session (NaN for many
        tickers); an unfilled NaN in an episode's final step poisons the whole
        episode (NaN reward -> NaN normalized returns -> NaN loss -> skipped).
        """
        if isinstance(data.columns, pd.MultiIndex):
            if 'Close' in data.columns.get_level_values(0):
                close = data['Close']
            elif 'Close' in data.columns.get_level_values(1):
                close = data.xs('Close', level=1, axis=1)
            else:
                close = data
        else:
            close = data[['Close']] if 'Close' in data.columns else data

        if isinstance(close, pd.Series):
            close = close.to_frame()

        # A single-ticker frame comes back with a generic 'Close' column rather
        # than the ticker name; rename so the reindex aligns instead of going
        # all-NaN (which would zero every return for the whole run).
        if len(self.tickers) == 1 and close.shape[1] == 1:
            close.columns = [self.tickers[0]]

        # Align to the agent's ticker order, then surface (don't silently zero)
        # any ticker that had no data at all before filling residual gaps.
        close = close.reindex(columns=self.tickers)
        missing = [t for t in self.tickers if close[t].isna().all()]
        if missing:
            print(f"[Warning] No price data for {missing}; they will contribute 0 return.")
        close = close.ffill().bfill()
        return close

    def _load_benchmark(self):
        """
        Load benchmark prices aligned to the TRAINING data's trading calendar.

        Previously the benchmark was downloaded for a fixed period="1y" that did
        not necessarily match the index of `self.data`. When the two calendars
        disagreed (e.g. an India ticker universe vs SPY's NYSE calendar, or a
        different date range), per-step date lookups in _get_benchmark_return
        missed and returned 0.0 — so the agent was effectively rewarded on raw
        return, not excess-over-benchmark. We now fetch the exact date range and
        reindex onto self.data.index so every step has a benchmark price.
        """
        try:
            start = self.data.index[0]
            end = self.data.index[-1] + pd.Timedelta(days=1)  # yfinance end is exclusive
            bench_data = yf.download(
                self.benchmark, start=start, end=end,
                interval="1d", auto_adjust=True, progress=False,
            )
            if bench_data.empty:
                raise ValueError(f"No benchmark data returned for {self.benchmark}")

            # Extract the Close series robustly (yfinance may return a MultiIndex
            # even for a single ticker depending on version).
            if isinstance(bench_data.columns, pd.MultiIndex):
                if 'Close' in bench_data.columns.get_level_values(0):
                    close = bench_data['Close']
                else:
                    close = bench_data.xs('Close', level=1, axis=1)
                if isinstance(close, pd.DataFrame):
                    close = close.iloc[:, 0]
            else:
                close = bench_data['Close']

            # Align to the training calendar; forward- AND back-fill so a finite
            # benchmark price exists for every step, including leading dates that
            # precede the benchmark's first available price (ffill alone leaves
            # those NaN, which leaked NaN into the reward/benchmark value).
            close = close.reindex(self.data.index).ffill().bfill()
            self.benchmark_prices = close
            self.benchmark_daily_returns = close.pct_change().fillna(0)
        except Exception as e:
            print(f"[Warning] Benchmark load failed for {self.benchmark}: {e}")
            self.benchmark_prices = None
            self.benchmark_daily_returns = None

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.current_step = self.window_size
        self.portfolio_value = 10000.0
        self.benchmark_value = 10000.0
        self.current_weights = np.ones(self.n_assets) / self.n_assets
        self.agent_returns = []
        self.benchmark_returns = []
        
        return self._get_observation(), {}

    def _get_observation(self):
        # Cached (see _precompute_observations); fall back to a live build for any
        # step index outside the precomputed range.
        cached = self._obs_cache.get(self.current_step)
        if cached is not None:
            return cached
        window_data = self.data.iloc[self.current_step - self.window_size : self.current_step]
        x, edge_index, edge_attr = self.graph_engine.build_graph(window_data, self.window_size)
        return {
            'x': x.cpu().numpy(),
            'edge_index': edge_index.cpu().numpy(),
            'edge_attr': edge_attr.cpu().numpy()
        }

    def _get_benchmark_return(self):
        """Get benchmark return for current step."""
        # Guard on benchmark_prices (the Series) — benchmark_returns is the
        # accumulated list and is never None, so checking it let a failed
        # benchmark load fall through to an AttributeError below.
        if self.benchmark_prices is None:
            return 0.0

        try:
            # Align with data index
            current_date = self.data.index[self.current_step]
            next_date = self.data.index[self.current_step + 1]

            if current_date in self.benchmark_prices.index and next_date in self.benchmark_prices.index:
                price_t = self.benchmark_prices.loc[current_date]
                price_t1 = self.benchmark_prices.loc[next_date]
                # Ensure scalar return (handle Series case)
                ret = (price_t1 - price_t) / price_t
                ret = float(ret.iloc[0]) if hasattr(ret, 'iloc') else float(ret)
                return ret if np.isfinite(ret) else 0.0
        except (KeyError, IndexError, TypeError, AttributeError, ZeroDivisionError):
            pass  # Date not found / bad price — return 0.0 below

        return 0.0

    def step(self, action):
        # Normalize action to sum to 1
        weights = np.array(action)
        if np.sum(weights) > 0:
            weights = weights / np.sum(weights)
        else:
            weights = np.ones(self.n_assets) / self.n_assets
            
        self.current_weights = weights
        
        # Get aligned, cleaned prices at t and t+1. self.close is reindexed to
        # self.tickers order and ff/bf-filled, so returns line up with `weights`
        # and a partial last session can't inject a NaN.
        prices_t = self.close.iloc[self.current_step].values
        prices_t1 = self.close.iloc[self.current_step + 1].values

        # Asset returns, guarded against any residual NaN/inf (e.g. a zero price)
        with np.errstate(divide='ignore', invalid='ignore'):
            asset_returns = (prices_t1 - prices_t) / prices_t
        asset_returns = np.nan_to_num(asset_returns, nan=0.0, posinf=0.0, neginf=0.0)
        
        # Portfolio return
        port_return = np.dot(weights, asset_returns)
        self.portfolio_value *= (1 + port_return)
        
        # Benchmark return
        bench_return = self._get_benchmark_return()
        self.benchmark_value *= (1 + bench_return)
        
        # Track returns
        self.agent_returns.append(port_return)
        self.benchmark_returns.append(bench_return)
        
        # REWARD = RISK-ADJUSTED EXCESS RETURN OVER BENCHMARK
        # Agent is rewarded for beating SPY, penalized for underperforming.
        excess_return = port_return - bench_return
        reward = excess_return * 100  # Scale for learning

        # Volatility penalty: penalise sustained dispersion of portfolio returns
        # over a trailing window. This discourages erratic allocations without
        # punishing captured upside (the previous abs(port_return) term penalised
        # every move, so the agent learned to stay uniform — that is removed).
        if len(self.agent_returns) > 20:
            recent_vol = np.std(self.agent_returns[-20:])
            reward -= recent_vol * 10.0

        # Bonus for consistent outperformance
        if len(self.agent_returns) > 5:
            recent_excess = np.mean(self.agent_returns[-5:]) - np.mean(self.benchmark_returns[-5:])
            if recent_excess > 0:
                reward += recent_excess * 10  # Consistency bonus

        # Final safety net: never emit a non-finite reward (it would poison the
        # episode's normalized returns and force the NaN-guard to skip the update).
        if not np.isfinite(reward):
            reward = 0.0

        # Advance time
        self.current_step += 1
        terminated = self.current_step >= len(self.data) - 1
        truncated = False
        
        observation = self._get_observation()
        info = {
            'portfolio_value': self.portfolio_value,
            'benchmark_value': self.benchmark_value,
            'agent_return': port_return,
            'benchmark_return': bench_return,
            'excess_return': excess_return,
            'weights': weights
        }
        
        return observation, reward, terminated, truncated, info



