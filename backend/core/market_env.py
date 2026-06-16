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
        
        # Fetch benchmark data for the same period
        self._load_benchmark()
        
        # Determine max steps
        self.max_steps = len(data) - window_size - 1
        
        # Action Space: Portfolio weights for each asset
        self.action_space = spaces.Box(low=0, high=1, shape=(self.n_assets,), dtype=np.float32)
        
        # Observation Space
        self.observation_space = spaces.Dict({
            'x': spaces.Box(low=-np.inf, high=np.inf, shape=(self.n_assets, 3), dtype=np.float32),
        })
        
        self.graph_engine = GraphEngine(tickers)
        
        self.current_step = window_size
        self.portfolio_value = 10000.0
        self.benchmark_value = 10000.0
        self.current_weights = np.ones(self.n_assets) / self.n_assets
        
        # Track cumulative performance
        self.agent_returns = []
        self.benchmark_returns = []

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

            # Align to the training calendar; forward-fill non-overlapping days
            # so a benchmark price exists for every step the agent takes.
            close = close.reindex(self.data.index, method='ffill')
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
                return float(ret.iloc[0]) if hasattr(ret, 'iloc') else float(ret)
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
        
        # Get prices at t and t+1
        if isinstance(self.data.columns, pd.MultiIndex):
            prices_t = self.data.xs('Close', level=1, axis=1).iloc[self.current_step]
            prices_t1 = self.data.xs('Close', level=1, axis=1).iloc[self.current_step + 1]
        else:
            prices_t = self.data['Close'].iloc[self.current_step]
            prices_t1 = self.data['Close'].iloc[self.current_step + 1]
            
        # Asset returns
        asset_returns = (prices_t1 - prices_t) / prices_t
        asset_returns = asset_returns.values
        
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



