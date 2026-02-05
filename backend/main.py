from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import pandas as pd
import numpy as np
import uvicorn
import os
import threading

# Core Logic Imports
from core.data_loader import MarketDataLoader
from core.graph_engine import GraphEngine
from core.agent import Agent
from core.market_env import MarketGraphEnv

app = FastAPI(title="CGPO API", description="Cognitive Graph Portfolio Optimizer Backend")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State (InMemory for prototype consistency)
state = {
    "loader": None,
    "engine": None,
    "agent": None,
    "tickers": ["AAPL", "NVDA", "MSFT", "GOOG", "AMZN", "TSLA", "META", "AMD", "QCOM", "INTC"],  # Default
    # Training Status
    "is_training": False,
    "training_episode": 0,
    "training_total": 0,
    "training_last_reward": 0.0,
}

# Simple lock to protect concurrent access to the in-memory state
state_lock = threading.RLock()

# --- Pydantic Models ---
class TickerList(BaseModel):
    tickers: List[str]

class InferenceResponse(BaseModel):
    tickers: List[str]
    weights: Dict[str, float]
    graph_data: Dict # Edge list and node features
    metrics: Dict

class TrainingRequest(BaseModel):
    episodes: int = 50

# --- Helper to Init Resources ---
def get_or_init_resources(tickers: List[str] = None):
    """
    Lazily (re)initialise shared resources.
    Protected by a re-entrant lock so multiple requests can't trample state.
    """
    with state_lock:
        # If tickers provided and different, re-init
        if tickers:
            current_set = set(state["tickers"])
            new_set = set(tickers)
            if current_set != new_set or state["loader"] is None:
                print(f"Initializing AI for {len(tickers)} tickers...")
                state["tickers"] = tickers
                state["loader"] = MarketDataLoader(tickers)
                state["engine"] = GraphEngine(tickers, correlation_threshold=0.3)
                state["agent"] = Agent(num_features=4, num_assets=len(tickers))
                # Try load model
                try:
                    state["agent"].load_model()
                except Exception:
                    # If no saved model yet, we just start fresh.
                    pass

        # If not init at all, initialise with current tickers
        if state["loader"] is None:
            print(f"Initializing AI for default tickers ({len(state['tickers'])})...")
            tks = state["tickers"]
            state["loader"] = MarketDataLoader(tks)
            state["engine"] = GraphEngine(tks, correlation_threshold=0.3)
            state["agent"] = Agent(num_features=4, num_assets=len(tks))
            try:
                state["agent"].load_model()
            except Exception:
                pass

        loader = state["loader"]
        engine = state["engine"]
        agent = state["agent"]

    return loader, engine, agent

# --- Endpoints ---

@app.get("/")
def root():
    return {
        "message": "Welcome to the CGPO API Backend 🤖",
        "status": "operational",
        "frontend_url": "http://localhost:3000",
        "documentation": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "operational", "service": "CGPO-AI"}

@app.post("/config/tickers")
def set_tickers(payload: TickerList):
    """Update the asset universe."""
    if not payload.tickers:
        raise HTTPException(status_code=400, detail="Ticker list cannot be empty")
    
    # Re-initialise resources for the new universe.
    get_or_init_resources(payload.tickers)
    return {"status": "updated", "count": len(payload.tickers), "tickers": payload.tickers}

@app.get("/market/news")
def get_news():
    loader, _, _ = get_or_init_resources()
    news = loader.fetch_news(limit=10)
    return news

@app.get("/market/benchmark")
def get_benchmark(period: str = "1mo"):
    """
    Returns benchmark performance data for comparison.
    Period options: 1d, 5d, 1mo, 3mo, 6mo, 1y
    """
    loader, _, _ = get_or_init_resources()
    try:
        performance = loader.get_benchmark_performance(period)
    except Exception as e:
        # Surface a clear error rather than fabricating simulated data.
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch live benchmark data: {e}",
        )

    return {
        "period": period,
        "benchmarks": performance
    }

@app.post("/ai/inference")
def run_inference():
    """Runs the full GNN + RL pipeline."""
    loader, engine, agent = get_or_init_resources()
    
    # 1. Fetch Data
    # For inference we need enough data for the window
    data = loader.fetch_history(period="6mo")
    if data.empty:
        raise HTTPException(status_code=500, detail="Failed to fetch market data")
    
    # 2. Build Graph
    # Use last window
    try:
        x, edge_index = engine.build_graph(data, window_size=20)
        
        obs = {
            'x': x.cpu().numpy(),
            'edge_index': edge_index.cpu().numpy()
        }
        
        # 3. Agent Action
        action_weights, _, _ = agent.get_action(obs, training=False)
        
        # Format response
        weights_dict = {t: float(w) for t, w in zip(state["tickers"], action_weights)}
        
        # Graph Data for Frontend Visualization
        # We need to send edges as [source, target] list
        edges = []
        srcs = obs['edge_index'][0]
        dsts = obs['edge_index'][1]
        for u, v in zip(srcs, dsts):
            if u < v: # Undirected assumption for visual cleanliness
                edges.append({"source": state["tickers"][int(u)], "target": state["tickers"][int(v)]})
                
        # Node metadata (e.g. return for coloring)
        nodes = []
        for i, t in enumerate(state["tickers"]):
            ret = float(obs['x'][i][0]) # Feature 0 is return
            nodes.append({"id": t, "return": ret})
            
        # Metrics Calculation
        # Extract close prices properly for metrics
        if isinstance(data.columns, pd.MultiIndex):
            close_prices = data.xs('Close', level=1, axis=1)
        else:
            close_prices = data['Close']
        
        recent_returns = close_prices.pct_change().tail(20).mean() * 252
        recent_vol = close_prices.pct_change().tail(20).std() * np.sqrt(252)
        
        port_ret = 0.0
        port_vol = 0.0
        
        for t, w in weights_dict.items():
            if t in recent_returns.index:
                port_ret += w * recent_returns[t]
                port_vol += w * recent_vol[t]
                
        metrics = {
            "expected_return": float(port_ret),
            "volatility": float(port_vol),
            "sharpe_ratio": float(port_ret / port_vol) if port_vol > 0 else 0.0
        }

        return {
            "tickers": state["tickers"],
            "weights": weights_dict,
            "graph": {
                "nodes": nodes,
                "edges": edges
            },
            "metrics": metrics
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference Error: {str(e)}")

@app.post("/ai/train")
def train_agent(payload: TrainingRequest, background_tasks: BackgroundTasks):
    """Triggers background training."""
    # Ensure only one training job runs at a time
    with state_lock:
        if state["is_training"]:
            return {
                "status": "already_training",
                "episode": state["training_episode"],
                "total": state["training_total"],
            }
        # Mark training as started
        state["is_training"] = True
        state["training_episode"] = 0
        state["training_total"] = payload.episodes
        state["training_last_reward"] = 0.0

    loader, _, agent = get_or_init_resources()

    # Fetch Data synchronously (could be slow, but safe)
    data = loader.fetch_history(period="1y")

    def _train_task():
        print("Starting Background Training...")
        env = MarketGraphEnv(state["tickers"], data, window_size=20)
        
        # Custom training loop with status updates
        agent.policy.train()
        for ep in range(payload.episodes):
            obs, _ = env.reset()
            done = False
            total_reward = 0
            log_probs, values, rewards = [], [], []
            
            while not done:
                action, log_prob, value = agent.get_action(obs, training=True)
                next_obs, reward, terminated, truncated, _ = env.step(action)
                done = terminated or truncated
                log_probs.append(log_prob)
                values.append(value)
                rewards.append(reward)
                obs = next_obs
                total_reward += reward
            
            # Calculate returns
            returns = []
            R = 0
            for r in reversed(rewards):
                R = r + agent.gamma * R
                returns.insert(0, R)
            
            import torch
            import torch.nn.functional as F
            returns = torch.tensor(returns, dtype=torch.float32).to(agent.device)
            if len(returns) > 1:
                returns = (returns - returns.mean()) / (returns.std() + 1e-8)
            
            loss = 0
            for log_prob, val, R in zip(log_probs, values, returns):
                advantage = R - val.item()
                actor_loss = -log_prob * advantage
                critic_loss = F.mse_loss(val.squeeze(), torch.tensor(R, device=agent.device))
                loss += actor_loss + 0.5 * critic_loss
            
            agent.optimizer.zero_grad()
            loss.backward()
            agent.optimizer.step()
            
            # Update status (protected by lock)
            with state_lock:
                state["training_episode"] = ep + 1
                state["training_last_reward"] = total_reward
            print(f"Episode {ep+1}/{payload.episodes}: Reward: {total_reward:.4f}")
        
        agent.save_model()
        with state_lock:
            state["is_training"] = False
        print(f"Training Complete!")
        
    background_tasks.add_task(_train_task)
    
    return {"status": "training_started", "episodes": payload.episodes}

@app.get("/ai/training-status")
def get_training_status():
    """Returns current training status."""
    with state_lock:
        return {
            "is_training": state["is_training"],
            "episode": state["training_episode"],
            "total": state["training_total"],
            "last_reward": state["training_last_reward"],
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

