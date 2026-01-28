
import pandas as pd
import numpy as np
from core.data_loader import MarketDataLoader
from core.metrics import PortfolioMetrics

def test_news():
    print("\n>>> Testing News Feed...")
    loader = MarketDataLoader(["AAPL", "TSLA"]) # Volatile stocks usually have news
    news = loader.fetch_news(limit=3)
    
    if not news:
        print("[WARNING] No news fetched. Check internet or yfinance version.")
    else:
        print(f"[SUCCESS] Fetched {len(news)} news items.")
        for n in news:
            print(f" - [{n['ts']}] {n['src']}: {n['msg'][:50]}... ({n['sent']})")

def test_metrics():
    print("\n>>> Testing Metrics...")
    # Create synthetic returns
    returns = np.random.normal(0.001, 0.02, 100) # Mean 0.1%, Std 2%
    market = np.random.normal(0.0005, 0.015, 100)
    prices = 100 * np.cumprod(1 + returns)
    
    sharpe = PortfolioMetrics.calculate_sharpe(returns)
    beta = PortfolioMetrics.calculate_alpha_beta(returns, market)[1]
    dd = PortfolioMetrics.calculate_max_drawdown(prices)
    
    print(f"Sharpe: {sharpe:.2f}")
    print(f"Beta: {beta}")
    print(f"Max Drawdown: {dd}")
    
    if sharpe != 0 and dd != "0.0%":
        print("[SUCCESS] Metrics calculated correctly.")
    else:
        print("[FAIL] Metrics seem suspicious (zeros).")

if __name__ == "__main__":
    test_news()
    test_metrics()
