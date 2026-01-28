import gymnasium as gym
from gymnasium import spaces
import numpy as np
import pandas as pd
import torch
from typing import Tuple, Dict, Any

from core.graph_engine import GraphEngine

class MarketGraphEnv(gym.Env):
    metadata = {'render.modes': ['human']}

    def __init__(self, tickers: list, data: pd.DataFrame, window_size: int = 20):
        super(MarketGraphEnv, self).__init__()
        
        self.tickers = tickers
        self.data = data
        self.window_size = window_size
        self.n_assets = len(tickers)
        
        # Determine max steps
        # We need at least window_size data points to start
        self.max_steps = len(data) - window_size - 1
        
        # Action Space: Portfolio weights for each asset
        # We allow the agent to output raw scores, which we softmax later, 
        # but for the env interface we expect values between 0 and 1 (or -1, 1).
        # Let's say the agent outputs desired weights directly.
        self.action_space = spaces.Box(low=0, high=1, shape=(self.n_assets,), dtype=np.float32)
        
        # Observation Space: Graph data is complex.
        # We will return a Dict space containing 'x' and 'edge_index'.
        # Note: edge_index size varies, so it's hard to define a static box. 
        # We might just expose the raw numpy arrays in the keys.
        self.observation_space = spaces.Dict({
            'x': spaces.Box(low=-np.inf, high=np.inf, shape=(self.n_assets, 3), dtype=np.float32),
            # Edge index is dynamic, so we can't easily spec it in Gym without a specialized wrapper.
            # We'll punt on the strict shape check for edge_index or use a large buffer.
            # For now, we will just document that it returns 'edge_index'.
        })
        
        self.graph_engine = GraphEngine(tickers)
        
        self.current_step = window_size
        self.portfolio_value = 10000.0
        self.current_weights = np.ones(self.n_assets) / self.n_assets

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.current_step = self.window_size
        self.portfolio_value = 10000.0
        self.current_weights = np.ones(self.n_assets) / self.n_assets
        
        return self._get_observation(), {}

    def _get_observation(self):
        # Slice data from (current_step - window_size) to current_step
        # Note: yfinance data usually has Ticker as top level columns if multiple tickers
        # We need to construct the window properly.
        
        # Simplified slicing:
        window_data = self.data.iloc[self.current_step - self.window_size : self.current_step]
        
        x, edge_index = self.graph_engine.build_graph(window_data, self.window_size)
        
        return {
            'x': x.cpu().numpy(),
            'edge_index': edge_index.cpu().numpy()
        }

    def step(self, action):
        # Normalize action to sum to 1 (long only portfolio)
        weights = np.array(action)
        if np.sum(weights) > 0:
            weights = weights / np.sum(weights)
        else:
            weights = np.ones(self.n_assets) / self.n_assets
            
        self.current_weights = weights
        
        # Calculate return from current_step to current_step + 1
        # Get prices at t and t+1
        # using 'Close' prices
        if isinstance(self.data.columns, pd.MultiIndex):
            prices_t = self.data.xs('Close', level=1, axis=1).iloc[self.current_step]
            prices_t1 = self.data.xs('Close', level=1, axis=1).iloc[self.current_step + 1]
        else:
            prices_t = self.data['Close'].iloc[self.current_step]
            prices_t1 = self.data['Close'].iloc[self.current_step + 1]
            
        # Asset returns
        asset_returns = (prices_t1 - prices_t) / prices_t
        asset_returns = asset_returns.values # ensure numpy array
        
        # Portfolio return
        port_return = np.dot(weights, asset_returns)
        
        self.portfolio_value *= (1 + port_return)
        
        # Reward
        reward = port_return
        
        # Advance time
        self.current_step += 1
        terminated = self.current_step >= len(self.data) - 1
        truncated = False
        
        observation = self._get_observation()
        info = {
            'portfolio_value': self.portfolio_value,
            'return': port_return,
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
