import streamlit as st
import streamlit as st
import random
import numpy as np
import pandas as pd
from datetime import datetime
from typing import List, Tuple, Dict, Any

# Core AI Imports
from core.data_loader import MarketDataLoader
from core.graph_engine import GraphEngine
from core.agent import Agent
from core.metrics import PortfolioMetrics

# --- CONFIGURATION & CONSTANTS ---
PAGE_TITLE = "CGPO Terminal"
LAYOUT = "wide"
TICKERS = ["AAPL", "NVDA", "MSFT", "GOOG", "AMZN", "TSLA", "META", "AMD", "QCOM", "INTC"]

# Palette: Deep Space Theme
THEME = {
    "bg": "#050505",
    "card_bg": "#0A0A0A",
    "primary": "#FF9900",  # Amber
    "secondary": "#00F0FF", # Cyber Cyan
    "danger": "#FF3333",    # Alert Red
    "success": "#33FF57",   # Terminal Green
    "border": "#222222",
    "text_dim": "#888888",
    "font_mono": '"IBM Plex Mono", "Roboto Mono", "Courier New", monospace'
}

CUSTOM_CSS = f"""
    <style>
        /* --- RESET & BASICS --- */
        .stApp {{ background-color: {THEME['bg']}; }}
        html, body, [class*="css"] {{ font-family: {THEME['font_mono']}; color: #E0E0E0; }}
        
        /* Remove Streamlit Defaults */
        header[data-testid="stHeader"], footer, #MainMenu {{ visibility: hidden; display: none; }}
        
        /* --- TYPOGRAPHY --- */
        h1, h2, h3 {{ text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 0.5rem; }}
        h1 {{ color: {THEME['primary']}; font-size: 1.8rem; margin-top: -1rem; }}
        h3 {{ color: {THEME['secondary']}; font-size: 1.1rem; border-bottom: 1px solid {THEME['border']}; padding-bottom: 5px; }}
        
        /* --- NEO-CONTAINERS --- */
        .neo-card {{
            background-color: {THEME['card_bg']};
            border: 1px solid {THEME['border']};
            border-radius: 4px;
            padding: 15px;
            height: 100%;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            transition: border-color 0.3s ease;
        }}
        .neo-card:hover {{ border-color: #444; }}
        
        /* --- COMPONENT STYLES --- */
        .feed-item {{
            background: rgba(255, 255, 255, 0.02);
            border-left: 2px solid {THEME['border']};
            padding: 10px; margin-bottom: 8px;
        }}
        .feed-item:hover {{
            border-left-color: {THEME['primary']};
            background: rgba(255, 255, 255, 0.05);
        }}
        
        .log-entry {{
            font-size: 0.85rem; padding: 4px 0;
            border-bottom: 1px solid #111;
            display: flex; justify-content: space-between;
        }}
        .log-entry:last-child {{ border-bottom: none; }}
        
        .badge {{
            padding: 2px 6px; border-radius: 3px;
            font-size: 0.7rem; font-weight: bold; text-transform: uppercase;
        }}
        .badge-buy {{ background: rgba(51, 255, 87, 0.1); color: {THEME['success']}; border: 1px solid {THEME['success']}; }}
        .badge-sell {{ background: rgba(255, 51, 51, 0.1); color: {THEME['danger']}; border: 1px solid {THEME['danger']}; }}
        .badge-neu {{ background: rgba(255, 255, 255, 0.1); color: #FFF; border: 1px solid #555; }}
        
        /* Scrollbar */
        ::-webkit-scrollbar {{ width: 6px; }}
        ::-webkit-scrollbar-track {{ background: {THEME['bg']}; }}
        ::-webkit-scrollbar-thumb {{ background: #333; border-radius: 3px; }}
        ::-webkit-scrollbar-thumb:hover {{ background: {THEME['primary']}; }}
    </style>
"""

# --- SETUP FUNCTIONS ---

def setup_page():
    """Initializes standard Streamlit page settings."""
    st.set_page_config(page_title=PAGE_TITLE, layout=LAYOUT, initial_sidebar_state="collapsed")
    st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

# --- AI & DATA LAYER ---

@st.cache_resource
def get_ai_resources():
    """Initializes and caches the AI components."""
    print("Initializing AI resources...")
    loader = MarketDataLoader(TICKERS)
    engine = GraphEngine(TICKERS, correlation_threshold=0.3) # Lower threshold to see more edges
    # Agent with 3 features (Return, Vol, Momentum)
    agent = Agent(num_features=3, num_assets=len(TICKERS))
    return loader, engine, agent

@st.cache_data(ttl=3600)  # Cache data for 1 hour
def fetch_market_data(_loader):
    """Fetches real market data."""
    return _loader.fetch_history(period="6mo")

def run_ai_inference(loader, engine, agent, data):
    """Runs a single inference step to get the current graph and agent actions."""
    
    # Build Graph
    x, edge_index = engine.build_graph(data, window_size=20)
    
    # Create Observation dict
    obs = {
        'x': x.cpu().numpy(),
        'edge_index': edge_index.cpu().numpy()
    }
    
    # Get Agent Action
    # false = deterministic (mean)
    action_weights, _, _ = agent.get_action(obs, training=False)
    
    return obs, action_weights

# --- DATA SERVICE LAYER ---

from pyvis.network import Network
import streamlit.components.v1 as components
import tempfile
import os

# ... (Previous imports remaining the same, just removing streamlit_agraph)

def get_graph_html(obs, tickers):
    """
    Generates PyVis Graph HTML.
    """
    # Create Network
    net = Network(height="450px", width="100%", bgcolor=THEME['card_bg'], font_color="white", notebook=False)
    
    # Physics Options
    net.force_atlas_2based()
    
    # obs['x'] is [Num_Tickers, Features]
    x = obs['x']
    edge_index = obs['edge_index']
    
    for i, ticker in enumerate(tickers):
        ret = x[i][0]
        
        # Color Logic
        if ret > 0.01:
            color = THEME['success']
        elif ret < -0.01:
            color = THEME['danger']
        else:
            color = THEME['secondary']
            
        net.add_node(i, label=ticker, title=ticker, color=color, size=20)
    
    # Edges
    srcs = edge_index[0]
    dsts = edge_index[1]
    
    seen_edges = set()
    for u, v in zip(srcs, dsts):
        u, v = int(u), int(v) # Ensure python ints
        if u < v:
            if (u, v) not in seen_edges:
                net.add_edge(u, v, color=THEME['text_dim'])
                seen_edges.add((u, v))
                
    # Generate HTML
    try:
        # Save to temp file and read back
        with tempfile.NamedTemporaryFile(delete=False, suffix=".html", mode='w+', encoding='utf-8') as tmp:
            net.save_graph(tmp.name)
            tmp.seek(0)
            html_content = tmp.read()
        
        # Cleanup
        try:
            os.remove(tmp.name)
        except:
            pass
            
        return html_content
    except Exception as e:
        return f"<div>Error generating graph: {str(e)}</div>"


def get_feed_data() -> List[Dict[str, str]]:
    """Fetches the latest mock multimodal signals (Static for now)."""
    return [
        {"ts": "14:05", "src": "EARNINGS", "msg": "NVDA: Data center revenue beats exp by 15%.", "sent": "POS"},
        {"ts": "13:50", "src": "TRANSCRIPT", "msg": "JPM CEO: 'Storm clouds are clearing'.", "sent": "POS"},
        {"ts": "13:42", "src": "MACRO", "msg": "FED: Rates likely to remain elevated.", "sent": "NEG"},
        {"ts": "13:15", "src": "NEWS", "msg": "AAPL: Supply chain disruption in Vietnam.", "sent": "NEG"},
        {"ts": "12:55", "src": "RUMOR", "msg": "Potential acquisition in Semi sector.", "sent": "NEU"},
    ]

# --- UI COMPONENT RENDERERS ---

def render_header():
    """Renders the main dashboard header."""
    c1, c2 = st.columns([3, 1])
    with c1:
        cl1, cl2 = st.columns([0.15, 0.85])
        with cl1:
            st.image("assets/logo.png", width=80)
        with cl2:
            st.markdown(f"<h1 style='margin-top:5px;'>CGPO // <span style='color:white; font-size:1rem; opacity:0.7;'>COGNITIVE GRAPH PORTFOLIO OPTIMIZER</span></h1>", unsafe_allow_html=True)
    with c2:
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        st.markdown(f"<div style='text-align:right; font-size:0.8rem; color:{THEME['text_dim']}; padding-top:10px;'>{current_time}</div>", unsafe_allow_html=True)
    st.write("") # Spacer


def render_graph_module(obs):
    """Renders the interactive Graph Map (Module A)."""
    st.markdown(f"""
    <div class="neo-card">
        <h3>GL-STN SYSTEMIC RISK MAP</h3>
        <p style="font-size: 0.8rem; color: {THEME['text_dim']}; margin-bottom: 10px;">
            Dynamic Topology // Real-time Propagation
        </p>
    """, unsafe_allow_html=True)
    
    html_graph = get_graph_html(obs, TICKERS)
    components.html(html_graph, height=450)
    
    st.markdown("</div>", unsafe_allow_html=True)

def render_feed_module(news_feed):
    """Renders the Signal Feed (Module B)."""
    st.markdown(f"""<div class="neo-card"><h3>MULTIMODAL INTELLIGENCE</h3>""", unsafe_allow_html=True)
    
    for item in news_feed:
        badge_cls = "badge-buy" if item['sent'] == "POS" else ("badge-sell" if item['sent'] == "NEG" else "badge-neu")
        
        st.markdown(f"""
        <div class="feed-item">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span class="badge {badge_cls}">{item['src']}</span>
                <span style="color:{THEME['text_dim']}; font-size:0.7rem;">{item['ts']}</span>
            </div>
            <div style="font-size:0.85rem; line-height:1.4;">{item['msg']}</div>
        </div>
        """, unsafe_allow_html=True)
        
    st.markdown("</div>", unsafe_allow_html=True)

def render_log_module(weights, tickers):
    """Renders the Agent Action Log (Module C)."""
    st.markdown(f"""<div class="neo-card"><h3>AGENT COMMAND STREAM</h3>""", unsafe_allow_html=True)
    
    # weights is a numpy array of shape [num_assets] summing to 1
    # Let's interpret meaningful changes or top allocations
    
    # Create action list from weights
    actions = []
    
    # Sort indices by weight desc
    sorted_indices = np.argsort(weights)[::-1]
    
    for idx in sorted_indices[:5]: # Top 5
        w = weights[idx]
        tik = tickers[idx]
        
        # Simple heuristic for Buy/Hold/Sell/Wait just for display
        # In reality, this is just a portfolio allocation.
        # Let's map high weight to BUY, med to HOLD, low to SELL/IGNORE
        
        if w > 0.15:
            act = "BUY"
        elif w > 0.05:
            act = "HOLD"
        else:
            act = "SELL" # or Reduce
            
        conf = f"{w*100:.1f}%"
        actions.append((act, tik, conf))
    
    for act, tik, conf in actions:
        cls = "badge-buy" if act == "BUY" else ("badge-sell" if act == "SELL" else "badge-neu")
        st.markdown(f"""
        <div class="log-entry">
            <span class="badge {cls}" style="width: 50px; text-align:center;">{act}</span>
            <span style="color: {THEME['secondary']}; font-weight:bold;">{tik}</span>
            <span style="color: {THEME['text_dim']};">{conf}</span>
        </div>
        """, unsafe_allow_html=True)
        
    st.markdown("</div>", unsafe_allow_html=True)

def render_metrics_module(metrics_data: Dict[str, Any]):
    """Renders the Bottom KPI Row (Module D)."""
    # metrics_data is a dict with keys: sharpe, beta, alpha, max_dd
    
    metrics = [
        ("SHARPE", f"{metrics_data['sharpe']:.2f}", "ANNUAL", THEME['success']),
        ("BETA", metrics_data['beta'], "market", THEME['secondary']),
        ("ALPHA", metrics_data['alpha'], "vs SPY", THEME['success']),
        ("MAX DD", metrics_data['max_dd'], "Drawdown", THEME['danger']),
    ]
    
    cols = st.columns(4)
    for i, (label, val, delta, color) in enumerate(metrics):
        with cols[i]:
            st.markdown(f"""
            <div class="neo-card" style="text-align: center; padding: 10px;">
                <div style="color: {THEME['text_dim']}; font-size: 0.75rem; letter-spacing: 1px;">{label}</div>
                <div style="font-size: 2rem; font-weight: bold; color: #FFF; margin: 5px 0;">{val}</div>
                <div style="color: {color}; font-size: 0.9rem; font-weight: bold;">{delta}</div>
            </div>
            """, unsafe_allow_html=True)

# --- MAIN EXECUTION ---

def main():
    """Main Application Entry Point."""
    setup_page()
    
    # Initialize AI
    loader, engine, agent = get_ai_resources()
    
    # Load Data (Cached)
    try:
        data = fetch_market_data(loader)
        if data.empty:
            st.error("No data fetched from yfinance.")
            return
            
        # Run Inference
        obs, action_weights = run_ai_inference(loader, engine, agent, data)
        
    except Exception as e:
        st.error(f"AI System Failure: {str(e)}")
        # Fallback to empty/mock if critical failure
        return

    render_header()
    
    # Main Grid Layout
    col_feed, col_graph, col_log = st.columns([1, 2, 1])
    
    with col_feed:
        # Fetch Real News
        news_feed = loader.fetch_news(limit=5)
        render_feed_module(news_feed)
    
    with col_graph:
        render_graph_module(obs)
    
    with col_log:
        render_log_module(action_weights, TICKERS)
        
    st.write("") # Spacer
    
    # Calculate Metrics
    # We need returns. Data has all tickers.
    # Synthesize a Portfolio Return (Equal weighted for prototype)
    if isinstance(data.columns, pd.MultiIndex):
        closes = data.xs('Close', level=1, axis=1)
    else:
        closes = data['Close'] # Should be handled if single ticker, but we have multiple
        
    returns = closes.pct_change().mean(axis=1).fillna(0).values 
    # Just using mean of all assets as "Portfolio" for display
    
    # Needs Benchmark. Let's use SPY or just use random standard for validation if SPY not in list.
    # Ideally should fetch SPY. For now, let's assume market matches portfolio trend + noise or just 0.
    market_returns = returns + np.random.normal(0, 0.005, size=len(returns)) # Mock Benchmark for prototype
    
    metrics_data = {
        "sharpe": PortfolioMetrics.calculate_sharpe(returns),
        "max_dd": PortfolioMetrics.calculate_max_drawdown(closes.mean(axis=1).values),
    }
    alpha, beta = PortfolioMetrics.calculate_alpha_beta(returns, market_returns)
    metrics_data["alpha"] = alpha
    metrics_data["beta"] = beta
    
    render_metrics_module(metrics_data)

if __name__ == "__main__":
    main()


