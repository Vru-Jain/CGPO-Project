import sys
import pandas as pd
import numpy as np
import yfinance as yf

# Point Python to the backend modules
sys.path.append("backend")

from core.data_loader import MarketDataLoader
from core.market_env import MarketGraphEnv
from core.agent import Agent
from core.metrics import PortfolioMetrics

def run_empirical_evaluation():
    # 7-asset technology universe referenced in the topological analysis
    tickers = ["NVDA", "GOOG", "AAPL", "AMZN", "MSFT", "META", "TSLA"]
    
    print(">>> 1. Fetching Market Data...")
    data = yf.download(tickers, start="2025-06-01", end="2025-12-31", interval="1d", auto_adjust=True, progress=False)
    
    # Align Pandas MultiIndex structure for market_env.py
    if isinstance(data.columns, pd.MultiIndex) and 'Close' in data.columns.get_level_values(0):
        data.columns = data.columns.swaplevel(0, 1)
        data.sort_index(axis=1, inplace=True)
    
    # We need 104 evaluation days + 20 days for the initial lookback window
    required_days = 124
    if len(data) < required_days:
        print(f"Warning: Only {len(data)} trading days available in this window.")
    else:
        data = data.tail(required_days)
        
    print(f"Dataset ready. Evaluating over the {len(data) - 20} trading days.")

    print("\n>>> 2. Initializing AI Agent & Environment...")
    env = MarketGraphEnv(tickers, data, window_size=20)
    agent = Agent(num_features=4, num_assets=len(tickers))
    
    try:
        agent.load_model("backend/models/agent.pth")
        print("Successfully loaded trained GNN model weights.")
    except Exception as e:
        print("Running with initialized (untrained) weights.")

    print("\n>>> 3. Executing Deterministic Forward Pass...")
    obs, _ = env.reset()
    done = False
    portfolio_returns = []

    # Run the evaluation
    while not done:
        action, _, _, _ = agent.get_action(obs, training=False)
        obs, reward, terminated, truncated, info = env.step(action)
        portfolio_returns.append(info['agent_return'])
        done = terminated or truncated

    print("\n>>> 4. Calculating Metrics...")
    returns_array = np.array(portfolio_returns)
    sharpe = PortfolioMetrics.calculate_sharpe(returns_array)
    max_dd = PortfolioMetrics.calculate_max_drawdown(100 * np.cumprod(1 + returns_array))
    
    print("-" * 40)
    print("EMPIRICAL EVALUATION RESULTS")
    print("-" * 40)
    print(f"Total Trading Days : {len(portfolio_returns)}")
    print(f"Annualized Sharpe  : {sharpe:.2f}")
    print(f"Maximum Drawdown   : {max_dd}")
    print(f"Cumulative Return  : {(np.prod(1 + returns_array) - 1) * 100:.2f}%")
    print("-" * 40)

if __name__ == "__main__":
    run_empirical_evaluation()