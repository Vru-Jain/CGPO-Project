"""
generate_table_iv.py  --  FINAL ablation script for the CGPO paper (Table IV)

Reproducible comparison: GNN agent vs flattened-MLP baseline vs SPY benchmark
on the pinned late-2025 window (104 evaluation days), 15 episodes, seed 42.

This version fixes the earlier bug where the "MLP" arm silently instantiated
the GNN again (core.agent.Agent hardcodes GNNPolicy). A genuine MLPPolicy is
defined below and swapped into the agent. A sanity guard aborts the table if
the two arms ever produce identical results again.

Run from the repository root:
    python generate_table_iv.py
"""

import sys
import random

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
import yfinance as yf

# Point Python to the backend modules
sys.path.append("backend")

from core.market_env import MarketGraphEnv
from core.agent import Agent

# PortfolioMetrics lives in the local repo; fall back to standard formulas
# (identical definitions) if the module is unavailable.
try:
    from core.metrics import PortfolioMetrics
except ImportError:
    class PortfolioMetrics:
        @staticmethod
        def calculate_sharpe(daily_returns, periods_per_year=252):
            std = np.std(daily_returns, ddof=1)
            if std == 0:
                return float("nan")
            return float(np.mean(daily_returns) / std * np.sqrt(periods_per_year))

        @staticmethod
        def calculate_max_drawdown(value_series):
            values = np.asarray(value_series, dtype=float)
            peaks = np.maximum.accumulate(values)
            return float(((values - peaks) / peaks).min())


# ============================================================
# CONFIGURATION
# ============================================================
TICKERS = ["NVDA", "GOOG", "AAPL", "AMZN", "MSFT", "META", "TSLA"]
START, END = "2025-06-01", "2025-12-31"
WINDOW = 20
REQUIRED_DAYS = 124          # 124 - 20 warm-up = 104 evaluation days
EPISODES = 15
SEED = 42
INITIAL_VALUE = 10000.0


def set_deterministic_seeds(seed=SEED):
    """Lock all RNGs so each arm trains from a reproducible initialization."""
    torch.manual_seed(seed)
    np.random.seed(seed)
    random.seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False


# ============================================================
# MLP BASELINE POLICY (the fix)
# ============================================================
class MLPPolicy(nn.Module):
    """Flattened baseline for the ablation. Mirrors GNNPolicy's forward
    signature (accepts and ignores edge_index / edge_attr), so the existing
    Agent training loop runs unchanged. Same input features, same hidden
    width, same actor/critic heads, no graph structure."""

    def __init__(self, num_node_features, num_assets, hidden_dim=64):
        super().__init__()
        self.fc1 = nn.Linear(num_node_features * num_assets, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        self.actor_head = nn.Linear(hidden_dim, num_assets)
        self.critic_head = nn.Linear(hidden_dim, 1)

    def forward(self, x, edge_index=None, edge_attr=None, batch=None):
        h = x.reshape(1, -1)                  # flatten: discards topology
        h = F.relu(self.fc1(h))
        h = F.dropout(h, p=0.1, training=self.training)
        h = F.relu(self.fc2(h))
        action_logits = self.actor_head(h).squeeze(0)   # [N]
        value = self.critic_head(h)                     # [1, 1]
        return action_logits, value


def make_agent(arch, n_assets):
    """Construct a freshly seeded agent of the requested architecture."""
    set_deterministic_seeds(SEED)
    agent = Agent(num_features=4, num_assets=n_assets)
    if arch == "mlp":
        agent.policy = MLPPolicy(4, n_assets).to(agent.device)
        agent.optimizer = torch.optim.Adam(agent.policy.parameters(), lr=0.001)
    print(f"    policy class in use: {type(agent.policy).__name__}")
    return agent


def deterministic_eval(agent, env, capture_benchmark=False):
    """Roll the trained policy through the window once, deterministically."""
    agent.policy.eval()
    obs, _ = env.reset()
    done = False
    agent_returns, bench_returns, max_weights = [], [], []
    while not done:
        with torch.no_grad():
            action, _, _, _ = agent.get_action(obs, training=False)
        obs, _, terminated, truncated, info = env.step(action)
        done = terminated or truncated
        agent_returns.append(info["agent_return"])
        max_weights.append(float(np.max(info["weights"])))
        if capture_benchmark:
            bench_returns.append(info["benchmark_return"])
    return np.array(agent_returns), np.array(bench_returns), max_weights


def summarize(daily_returns, max_weights=None):
    values = INITIAL_VALUE * np.cumprod(np.concatenate([[1.0], 1.0 + daily_returns]))
    dd = PortfolioMetrics.calculate_max_drawdown(values)
    dd = float(str(dd).rstrip("%")) / 100 if isinstance(dd, str) else float(dd)
    return {
        "Sharpe": PortfolioMetrics.calculate_sharpe(daily_returns),
        "MaxDD": dd,
        "CumRet": float(np.prod(1.0 + daily_returns) - 1.0),
        "Final": float(values[-1]),
        "AvgMaxW": float(np.mean(max_weights)) if max_weights else float("nan"),
    }


def run_pipeline():
    # ---------------- 1. Data ----------------
    print(">>> 1. Fetching Historical Market Data (Late 2025 Window)...")
    data = yf.download(TICKERS, start=START, end=END, interval="1d",
                       auto_adjust=True, progress=False)

    # Align MultiIndex structure for market_env.py: 'Close' at level 1
    if isinstance(data.columns, pd.MultiIndex) and "Close" in data.columns.get_level_values(0):
        data.columns = data.columns.swaplevel(0, 1)
        data.sort_index(axis=1, inplace=True)
    data = data.dropna()

    if len(data) < REQUIRED_DAYS:
        print(f"Warning: only {len(data)} trading days available; "
              f"evaluation window will be {len(data) - WINDOW} days.")
    else:
        data = data.tail(REQUIRED_DAYS)
    print(f"Dataset locked. Evaluation window: {len(data) - WINDOW} trading days.")

    results = {}

    # ---------------- 2. GNN arm ----------------
    print(f"\n>>> 2. Training GNN Agent ({EPISODES} Episodes, Seed {SEED})...")
    agent_gnn = make_agent("gnn", len(TICKERS))
    env_gnn = MarketGraphEnv(TICKERS, data, window_size=WINDOW)
    agent_gnn.train(env_gnn, episodes=EPISODES)
    print("Executing GNN Deterministic Evaluation...")
    gnn_ret, bench_ret, gnn_w = deterministic_eval(agent_gnn, env_gnn,
                                                   capture_benchmark=True)
    results["GNN"] = summarize(gnn_ret, gnn_w)

    # ---------------- 3. MLP arm ----------------
    print(f"\n>>> 3. Training MLP Baseline Agent ({EPISODES} Episodes, Seed {SEED})...")
    agent_mlp = make_agent("mlp", len(TICKERS))
    env_mlp = MarketGraphEnv(TICKERS, data, window_size=WINDOW)
    agent_mlp.train(env_mlp, episodes=EPISODES)
    print("Executing MLP Deterministic Evaluation...")
    mlp_ret, _, mlp_w = deterministic_eval(agent_mlp, env_mlp)
    results["MLP"] = summarize(mlp_ret, mlp_w)

    # ---------------- 4. Benchmark ----------------
    print("\n>>> 4. Calculating S&P 500 Benchmark Metrics...")
    results["SPY"] = summarize(bench_ret)

    # ---------------- Sanity guard ----------------
    if np.isclose(results["GNN"]["CumRet"], results["MLP"]["CumRet"], atol=1e-9):
        print("\n" + "!" * 70)
        print("!!! GNN and MLP results are IDENTICAL. The MLP swap did not")
        print("!!! take effect. DO NOT use these numbers in the paper.")
        print("!" * 70)
        sys.exit(1)

    # ---------------- Output ----------------
    print("\n" + "=" * 92)
    print(" TABLE IV: EMPIRICAL PERFORMANCE METRICS "
          f"({len(data) - WINDOW} trading days, {EPISODES} episodes, seed {SEED})")
    print("=" * 92)
    print(f"{'Model':<7} | {'Ann. Sharpe':>11} | {'Max Drawdown':>12} | "
          f"{'Cum. Return':>11} | {'Final Value':>12} | {'Avg Max Weight':>14}")
    print("-" * 92)
    for model in ("GNN", "MLP", "SPY"):
        m = results[model]
        amw = f"{m['AvgMaxW']:.3f}" if np.isfinite(m["AvgMaxW"]) else "-"
        print(f"{model:<7} | {m['Sharpe']:>11.2f} | {m['MaxDD']:>12.1%} | "
              f"{m['CumRet']:>11.2%} | ${m['Final']:>11,.2f} | {amw:>14}")
    print("=" * 92)
    print("Avg max weight near 0.143 (= 1/7) means a uniform, diversified allocation;")
    print("values near 1.0 mean concentration in a single asset.")


if __name__ == "__main__":
    run_pipeline()
