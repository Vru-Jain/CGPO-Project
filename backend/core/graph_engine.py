import torch
import numpy as np
import pandas as pd
import networkx as nx
from typing import Tuple, List
from ta.momentum import RSIIndicator
from ta.trend import MACD
from ta.volatility import BollingerBands

class GraphEngine:
    def __init__(self, tickers: List[str], correlation_threshold: float = 0.5, min_neighbors: int = 2):
        self.tickers = tickers
        self.threshold = correlation_threshold
        self.min_neighbors = min_neighbors  # Guarantee at least this many connections per node
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    def build_graph(self, market_data: pd.DataFrame, window_size: int = 20) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        Constructs the graph from market data.
        
        Args:
            market_data: MultiIndex DataFrame (Ticker -> [Open, High, Low, Close, Volume])
            window_size: Lookback period for correlation and features.
            
        Returns:
            x (Node Features): [Num_Tickers, Num_Features]
            edge_index (Edge List): [2, Num_Edges]
            edge_attr (Edge Weights): [Num_Edges] - correlation strength
        """
        n_tickers = len(self.tickers)
        
        # Calculate returns
        close_prices = market_data.xs('Close', level=1, axis=1) if isinstance(market_data.columns, pd.MultiIndex) else market_data['Close']
        
        # Make sure we have enough data
        if len(close_prices) < window_size:
            return (
                torch.zeros((n_tickers, 4), device=self.device),
                torch.empty((2, 0), dtype=torch.long, device=self.device),
                torch.empty((0,), dtype=torch.float32, device=self.device)
            )

        # Current features based on the last window
        window_closes = close_prices.iloc[-window_size:]
        
        # Feature 1: Returns (last step)
        returns = window_closes.pct_change().iloc[-1].fillna(0).values
        
        # Feature 2: Volatility (std dev of returns over window)
        volatility = window_closes.pct_change().std().fillna(0).values
        
        # Feature 3: Momentum (total return over window)
        momentum = (window_closes.iloc[-1] / window_closes.iloc[0] - 1).fillna(0).values

        # Feature 4: RSI (Relative Strength Index)
        rsi_values = []
        for ticker in self.tickers:
             try:
                 ticker_close = close_prices[ticker] if isinstance(close_prices, pd.DataFrame) else close_prices
                 rsi_ind = RSIIndicator(close=ticker_close, window=14)
                 rsi = rsi_ind.rsi().iloc[-1]
                 rsi_values.append(rsi if not np.isnan(rsi) else 50.0) 
             except Exception:
                 rsi_values.append(50.0)
        rsi_values = np.array(rsi_values) / 100.0  # Normalize 0-1

        # Stack features: [Returns, Volatility, Momentum, RSI]
        x = np.column_stack((returns, volatility, momentum, rsi_values))
        x = torch.tensor(x, dtype=torch.float32, device=self.device)
        
        # 2. Compute Edges (Correlation with k-NN guarantee)
        corr_matrix = window_closes.pct_change().corr().fillna(0).values
        abs_corr = np.abs(corr_matrix)
        
        # Use threshold but guarantee min_neighbors via k-NN fallback
        rows_list = []
        cols_list = []
        weights_list = []
        
        for i in range(n_tickers):
            # Find nodes above threshold
            above_threshold = np.where((abs_corr[i] > self.threshold) & (np.arange(n_tickers) != i))[0]
            
            if len(above_threshold) >= self.min_neighbors:
                # Threshold produced enough neighbors
                neighbors = above_threshold
            else:
                # Fallback to k-NN: pick top `min_neighbors` by correlation
                sorted_indices = np.argsort(abs_corr[i])[::-1]  # Descending
                neighbors = [j for j in sorted_indices if j != i][:self.min_neighbors]
            
            for j in neighbors:
                rows_list.append(i)
                cols_list.append(j)
                weights_list.append(corr_matrix[i, j])  # Actual correlation (can be negative)
        
        edge_index = torch.tensor([rows_list, cols_list], dtype=torch.long, device=self.device)
        edge_attr = torch.tensor(weights_list, dtype=torch.float32, device=self.device)
        
        return x, edge_index, edge_attr

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
    x, edge_index, edge_attr = engine.build_graph(df)
    
    print("Node Features Shape:", x.shape)
    print("Edge Index Shape:", edge_index.shape)
    print("Edges:", edge_index)
