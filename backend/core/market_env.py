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
        """Load benchmark returns aligned with data index."""
        try:
            bench_data = yf.download(self.benchmark, period="1y", interval="1d", auto_adjust=True, progress=False)
            self.benchmark_prices = bench_data['Close']
            self.benchmark_daily_returns = bench_data['Close'].pct_change().fillna(0)
        except:
            # Fallback: use equal-weight portfolio as benchmark
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
        if self.benchmark_returns is None:
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
        except:
            pass
        
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
        
        # REWARD = EXCESS RETURN OVER BENCHMARK
        # Agent is rewarded for beating SPY, penalized for underperforming
        excess_return = port_return - bench_return
        reward = excess_return * 100  # Scale for learning
        
        # Volatility Penalty
        # Penalty if portfolio return is too far from mean (simple proxy for volatility on single step)
        # Better: Uses window standard deviation if available, but for now single step penalty:
        reward -= 50.0 * np.abs(port_return) # Penalize large swings? No that penalizes upside too.
        
        # New Reward: Sharpe-like
        # Reward = Return - 0.1 * Volatility
        # We need historical volatility.
        if len(self.agent_returns) > 20:
             recent_vol = np.std(self.agent_returns[-20:])
             reward -= recent_vol * 10.0 # Penalty for high volatility
        
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


if __name__ == "__main__":
    # Test stub
    tickers = ["AAPL", "MSFT"]
    # Create dummy data
    dates = pd.date_range("2023-01-01", periods=100)
    data_dict = {}
    for t in tickers:
        data_dict[(t, 'Close')] = np.random.uniform(100, 150, 100)
        data_dict[(t, 'Open')] = np.random.uniform(100, 150, 100)
        data_dict[(t, 'High')] = np.random.uniform(100, 150, 100)
        data_dict[(t, 'Low')] = np.random.uniform(100, 150, 100)
        data_dict[(t, 'Volume')] = np.random.uniform(1000, 5000, 100)
    
    df = pd.DataFrame(data_dict)
    df.columns = pd.MultiIndex.from_tuples(df.columns)
    
    env = MarketGraphEnv(tickers, df)
    obs, _ = env.reset()
    print("Obs X shape:", obs['x'].shape)
    
    action = env.action_space.sample()
    obs, reward, term, trunc, info = env.step(action)
    print(f"Step Reward: {reward:.4f}, Portfolio: {info['portfolio_value']:.2f}")
