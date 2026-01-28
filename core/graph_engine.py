import torch
import numpy as np
import pandas as pd
import networkx as nx
from typing import Tuple, List

class GraphEngine:
    def __init__(self, tickers: List[str], correlation_threshold: float = 0.5):
        self.tickers = tickers
        self.threshold = correlation_threshold
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    def build_graph(self, market_data: pd.DataFrame, window_size: int = 20) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Constructs the graph from market data.
        
        Args:
            market_data: MultiIndex DataFrame (Ticker -> [Open, High, Low, Close, Volume])
            window_size: Lookback period for correlation and features.
            
        Returns:
            x (Node Features): [Num_Tickers, Num_Features]
            edge_index (Edge List): [2, Num_Edges]
        """
        # Ensure data is sorted
        # We assume market_data contains the full history needed for the current step
        # Ideally, we pass in a window of data ending at the current step.
        
        # 1. Compute Node Features
        # Features: [Return, Volatility, RSI (maybe), Volume Change]
        # For simplicity: Return (1d), Volatility (window), Relative Volume
        
        # Calculate returns
        close_prices = market_data.xs('Close', level=1, axis=1) if isinstance(market_data.columns, pd.MultiIndex) else market_data['Close']
        
        # Make sure we have enough data
        if len(close_prices) < window_size:
            # Return zeros or handle error
            return torch.zeros((len(self.tickers), 3)), torch.empty((2, 0), dtype=torch.long)

        # Current features based on the last window
        window_closes = close_prices.iloc[-window_size:]
        
        # Feature 1: Returns (last step)
        returns = window_closes.pct_change().iloc[-1].fillna(0).values
        
        # Feature 2: Volatility (std dev of returns over window)
        volatility = window_closes.pct_change().std().fillna(0).values
        
        # Feature 3: Momentum (Slope of linreg or just total return over window)
        momentum = (window_closes.iloc[-1] / window_closes.iloc[0] - 1).fillna(0).values

        # Stack features
        x = np.column_stack((returns, volatility, momentum))
        x = torch.tensor(x, dtype=torch.float32, device=self.device)
        
        # 2. Compute Edges (Correlation)
        # Compute correlation matrix of returns over the window
        corr_matrix = window_closes.pct_change().corr().fillna(0).values
        
        # Check against threshold
        # We want edges where |corr| > threshold (and not self-loops usually, though GNNs might like self-loops)
        # Let's use simple thresholding
        
        rows, cols = np.where(np.abs(corr_matrix) > self.threshold)
        
        # Remove self-loops
        mask = rows != cols
        rows = rows[mask]
        cols = cols[mask]
        
        edge_index = np.array([rows, cols])
        edge_index = torch.tensor(edge_index, dtype=torch.long, device=self.device)
        
        return x, edge_index

if __name__ == "__main__":
    # Test stub
    # Mock data
    tickers = ["AAPL", "MSFT", "GOOG"]
    dates = pd.date_range(start="2023-01-01", periods=100)
    data = {}
    for t in tickers:
        prices = np.random.randn(100).cumsum() + 100
        data[(t, 'Close')] = prices
        data[(t, 'Volume')] = np.random.randint(100, 1000, 100)
        
    df = pd.DataFrame(data)
    df.columns = pd.MultiIndex.from_tuples(df.columns)
    
    engine = GraphEngine(tickers)
    x, edge_index = engine.build_graph(df)
    
    print("Node Features Shape:", x.shape)
    print("Edge Index Shape:", edge_index.shape)
    print("Edges:", edge_index)
