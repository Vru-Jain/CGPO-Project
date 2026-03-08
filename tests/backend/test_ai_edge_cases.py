"""
Robust edge-case tests for the CGPO AI pipeline.

Covers:
  1. Graph Engine with suspended / illiquid tickers
  2. Graph Engine with NaN / missing data
  3. Graph Engine with zero-volatility assets
  4. RL Environment with benchmark date mismatches
  5. Inference stability under extreme market crashes
"""

import pytest
import numpy as np
import pandas as pd
import torch

import sys, os

# Allow imports from backend root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from core.graph_engine import GraphEngine
from core.agent import Agent


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _make_multi_index_data(tickers, n_days=30, flat=False, inject_nan=False, crash_day=None):
    """
    Build a synthetic MultiIndex DataFrame mimicking yfinance output.

    Parameters
    ----------
    flat       : if True, all close prices are constant (zero volatility).
    inject_nan : if True, sprinkle NaN values into the data.
    crash_day  : if set to an int, simulate a 90% crash on that day.
    """
    dates = pd.bdate_range(end=pd.Timestamp.today(), periods=n_days)
    arrays = {}
    for t in tickers:
        base = 100.0 + np.random.randn()  # slightly different starting price
        if flat:
            close = np.full(n_days, base)
        else:
            close = base + np.cumsum(np.random.randn(n_days) * 0.5)

        if crash_day is not None and 0 <= crash_day < n_days:
            close[crash_day] = close[crash_day - 1] * 0.10  # 90 % drop

        if inject_nan:
            nan_indices = np.random.choice(n_days, size=max(1, n_days // 10), replace=False)
            close[nan_indices] = np.nan

        arrays[(t, "Open")] = close * 0.99
        arrays[(t, "High")] = close * 1.01
        arrays[(t, "Low")] = close * 0.98
        arrays[(t, "Close")] = close
        arrays[(t, "Volume")] = np.random.randint(0, 10_000, n_days).astype(float)

    df = pd.DataFrame(arrays, index=dates)
    df.columns = pd.MultiIndex.from_tuples(df.columns)
    return df


# ─── 1. Suspended / Illiquid Stocks (0 volume, flat prices) ─────────────────

class TestGraphEngineEdgeCases:
    """Ensure the GraphEngine produces valid tensors under adversarial data."""

    def test_flat_prices_zero_volatility(self):
        """All stocks have perfectly flat prices ⇒ volatility = 0."""
        tickers = ["AAA", "BBB", "CCC"]
        data = _make_multi_index_data(tickers, n_days=30, flat=True)
        engine = GraphEngine(tickers, correlation_threshold=0.3)

        x, edge_index, edge_attr = engine.build_graph(data, window_size=20)

        assert x.shape == (3, 4), f"Expected node features (3,4), got {x.shape}"
        assert not torch.isnan(x).any(), "Node features contain NaN"
        assert not torch.isinf(x).any(), "Node features contain Inf"

    def test_missing_nan_data(self):
        """Some prices are NaN ⇒ should be filled/handled, no crash."""
        tickers = ["AAA", "BBB"]
        data = _make_multi_index_data(tickers, n_days=30, inject_nan=True)
        engine = GraphEngine(tickers, correlation_threshold=0.3)

        x, edge_index, edge_attr = engine.build_graph(data, window_size=20)

        assert x.shape[0] == 2
        assert not torch.isnan(x).any(), "NaN propagated to node features"

    def test_single_ticker(self):
        """Only 1 asset ⇒ graph has no edges, but should not crash."""
        tickers = ["SOLO"]
        data = _make_multi_index_data(tickers, n_days=30)
        engine = GraphEngine(tickers, correlation_threshold=0.3, min_neighbors=0)

        x, edge_index, edge_attr = engine.build_graph(data, window_size=20)

        assert x.shape == (1, 4)
        # Edge index may be empty; that's fine
        assert edge_index.shape[0] == 2

    def test_insufficient_window(self):
        """Data shorter than window_size ⇒ should return zeroed tensors."""
        tickers = ["AAA", "BBB"]
        data = _make_multi_index_data(tickers, n_days=5)
        engine = GraphEngine(tickers, correlation_threshold=0.3)

        x, edge_index, edge_attr = engine.build_graph(data, window_size=20)

        # Should return zero tensor gracefully
        assert x.shape == (2, 4)
        assert torch.allclose(x, torch.zeros_like(x))


# ─── 2. Inference Stability Under Extreme Crashes ───────────────────────────

class TestInferenceStability:
    """Feed extreme data through Agent.get_action() and verify valid weights."""

    def test_weights_sum_to_one_normal(self):
        """Normal data ⇒ Dirichlet weights should sum ≈ 1."""
        tickers = ["A", "B", "C"]
        data = _make_multi_index_data(tickers, n_days=40)
        engine = GraphEngine(tickers)

        x, edge_index, edge_attr = engine.build_graph(data, window_size=20)
        obs = {
            "x": x.cpu().numpy(),
            "edge_index": edge_index.cpu().numpy(),
            "edge_attr": edge_attr.cpu().numpy(),
        }

        agent = Agent(num_features=4, num_assets=3)
        weights, _, _, _ = agent.get_action(obs, training=False)

        assert weights.shape == (3,)
        assert not np.isnan(weights).any(), "Weights contain NaN"
        assert abs(weights.sum() - 1.0) < 1e-4, f"Weights don't sum to 1: {weights.sum()}"

    def test_weights_after_crash(self):
        """90 % crash on one day ⇒ agent should still produce valid weights."""
        tickers = ["X", "Y", "Z"]
        data = _make_multi_index_data(tickers, n_days=40, crash_day=25)
        engine = GraphEngine(tickers)

        x, edge_index, edge_attr = engine.build_graph(data, window_size=20)
        obs = {
            "x": x.cpu().numpy(),
            "edge_index": edge_index.cpu().numpy(),
            "edge_attr": edge_attr.cpu().numpy(),
        }

        agent = Agent(num_features=4, num_assets=3)
        weights, _, _, _ = agent.get_action(obs, training=False)

        assert weights.shape == (3,)
        assert not np.isnan(weights).any(), "Weights contain NaN after crash"
        assert abs(weights.sum() - 1.0) < 1e-4, f"Weights don't sum to 1: {weights.sum()}"
        assert (weights >= 0).all(), "Negative weight produced"

    def test_flat_input_dirichlet_stability(self):
        """All-zero node features ⇒ softplus + 1  keeps Dirichlet stable."""
        agent = Agent(num_features=4, num_assets=3)
        obs = {
            "x": np.zeros((3, 4), dtype=np.float32),
            "edge_index": np.array([[0, 1, 2], [1, 2, 0]], dtype=np.int64),
            "edge_attr": np.array([1.0, 1.0, 1.0], dtype=np.float32),
        }
        weights, _, _, _ = agent.get_action(obs, training=False)

        assert not np.isnan(weights).any(), "NaN from flat input"
        assert abs(weights.sum() - 1.0) < 1e-4


# ─── 3. Benchmark Date Mismatch ─────────────────────────────────────────────

class TestBenchmarkMismatch:
    """Ensure MarketGraphEnv handles mismatched trading calendars."""

    def test_mismatched_dates_return_zero(self):
        """
        If the benchmark has no data for the current step's date,
        _get_benchmark_return() should gracefully return 0.0.
        """
        from core.market_env import MarketGraphEnv

        tickers = ["AAA", "BBB"]
        data = _make_multi_index_data(tickers, n_days=50)

        env = MarketGraphEnv(tickers, data, window_size=20, benchmark="SPY")
        # Monkey-patch benchmark prices to be nearly empty
        env.benchmark_prices = pd.Series(dtype=float)
        env.benchmark_daily_returns = pd.Series(dtype=float)

        ret = env._get_benchmark_return()
        assert ret == 0.0, f"Expected 0.0 for missing benchmark, got {ret}"


# ─── Run ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
