
import sys
import os
import pandas as pd
import numpy as np

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from core.agent import Agent
from core.market_env import MarketGraphEnv

def test_optimization():
    print("Testing RL Optimization...")
    
    # 1. Setup Dummy Data
    tickers = ["AAPL", "MSFT"]
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
    
    # 2. Init Environment and Agent
    env = MarketGraphEnv(tickers, df, window_size=20)
    agent = Agent(num_features=4, num_assets=len(tickers), entropy_coef=0.01)
    
    # 3. Test One Step
    obs, _ = env.reset()
    action, log_prob, val, entropy = agent.get_action(obs, training=True)
    
    print("Action:", action)
    print("Entropy:", entropy)
    
    # 4. Test Training Loop
    print("\nRunning Training Loop (2 episodes)...")
    try:
        rewards = agent.train(env, episodes=2)
        print("Training completed successfully.")
        print("Rewards:", rewards)
    except Exception as e:
        print(f"Training Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_optimization()
