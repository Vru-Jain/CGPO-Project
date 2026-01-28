import pandas as pd
from core.data_loader import MarketDataLoader
from core.market_env import MarketGraphEnv
from core.agent import Agent

def run_test():
    print(">>> 1. Fetching Data...")
    tickers = ["AAPL", "MSFT", "GOOG"]
    loader = MarketDataLoader(tickers)
    # Fetch 6 months of data
    data = loader.fetch_history(period="6mo")
    print("Data Shape:", data.shape)
    
    print("\n>>> 2. Initializing Environment...")
    env = MarketGraphEnv(tickers, data, window_size=10)
    obs, _ = env.reset()
    print("Initial Observation Keys:", obs.keys())
    print("Node Features shape:", obs['x'].shape)
    
    print("\n>>> 3. Initializing Agent...")
    # Features = 3 (Return, Vol, Momentum)
    agent = Agent(num_features=3, num_assets=len(tickers))
    
    print("\n>>> 4. Starting Training (Simulation)...")
    rewards = agent.train(env, episodes=2)
    print("Training Complete. Rewards:", rewards)
    
    print("\n>>> SYSTEM CHECK: PASS")

if __name__ == "__main__":
    run_test()
