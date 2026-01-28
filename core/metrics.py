import numpy as np
import pandas as pd
from typing import Tuple, List, Dict

class PortfolioMetrics:
    """
    Calculates standard financial metrics for the portfolio or assets.
    """
    
    @staticmethod
    def calculate_sharpe(returns: np.ndarray, risk_free_rate: float = 0.04, periods: int = 252) -> float:
        """
        Calculates Annualized Sharpe Ratio.
        Args:
            returns: Array of daily returns.
            risk_free_rate: Annualized risk free rate.
            periods: Trading days in a year.
        """
        if len(returns) < 2:
            return 0.0
            
        excess_returns = returns - (risk_free_rate / periods)
        std_dev = np.std(returns)
        
        if std_dev == 0:
            return 0.0
            
        sharpe = np.mean(excess_returns) / std_dev
        return sharpe * np.sqrt(periods)

    @staticmethod
    def calculate_max_drawdown(prices: np.ndarray) -> str:
        """
        Calculates Maximum Drawdown from a price series.
        Returns percentage string.
        """
        if len(prices) < 2:
            return "0.0%"
            
        peak = prices[0]
        max_dd = 0.0
        
        for p in prices:
            if p > peak:
                peak = p
            dd = (peak - p) / peak
            if dd > max_dd:
                max_dd = dd
                
        return f"-{max_dd*100:.1f}%"

    @staticmethod
    def calculate_alpha_beta(asset_returns: np.ndarray, benchmark_returns: np.ndarray) -> Tuple[str, str]:
        """
        Calculates Beta and Alpha (Jensen's Alpha) relative to benchmark.
        """
        if len(asset_returns) != len(benchmark_returns) or len(asset_returns) < 2:
            return "0.0%", "0.00"
            
        # Covariance matrix: [[Var(BM), Cov(A, BM)], [Cov(A, BM), Var(A)]] if stacked? 
        # Actually np.cov(x, y) returns [[Var(X), Cov(X,Y)], [Cov(Y,X), Var(Y)]]
        
        covariance = np.cov(asset_returns, benchmark_returns)
        beta = covariance[0, 1] / covariance[1, 1] # Cov(Asset, Mkt) / Var(Mkt)
        
        # Alpha = R_p - [Rf + Beta * (R_m - Rf)]
        # Simplifying assuming Rf is small/negligible for daily or using CAPM intercept
        # Alpha is basically the intercept of the regression
        
        # Simple Linear Regression
        A = np.vstack([benchmark_returns, np.ones(len(benchmark_returns))]).T
        m, c = np.linalg.lstsq(A, asset_returns, rcond=None)[0]
        
        # m is Beta, c is Alpha (daily)
        # Annualize Alpha
        alpha_annual = (1 + c)**252 - 1
        
        return f"{alpha_annual*100:.1f}%", f"{beta:.2f}"
