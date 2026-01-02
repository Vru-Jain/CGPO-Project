import streamlit as st
import pandas as pd
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
import random
import time
from datetime import datetime

# --- Page Config ---
st.set_page_config(
    page_title="CGPO Terminal",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# --- Constants & Theme ---
COLOR_BG = "#050505"
COLOR_TEXT_MAIN = "#FF9900"  # Amber/Orange
COLOR_TEXT_SEC = "#00FFFF"   # Cyan
COLOR_RISK = "#CC3333"       # Muted Red
COLOR_BORDER = "#333333"
FONT_MONO = '"Courier New", Courier, monospace'

# --- CSS Injection ---
def inject_custom_css():
    st.markdown(f"""
        <style>
            /* Force Background */
            .stApp {{
                background-color: {COLOR_BG};
            }}
            
            /* Global Font Settings */
            html, body, [class*="css"] {{
                font-family: {FONT_MONO};
                color: {COLOR_TEXT_MAIN};
            }}
            
            /* Remove default header/footer/menu */
            header[data-testid="stHeader"] {{
                visibility: hidden;
            }}
            footer {{
                visibility: hidden;
            }}
            #MainMenu {{
                visibility: hidden;
            }}
            
            /* Headers */
            h1, h2, h3, h4, h5, h6 {{
                color: {COLOR_TEXT_SEC} !important;
                font-family: {FONT_MONO} !important;
                font-weight: bold;
                letter-spacing: 1px;
                text-transform: uppercase;
            }}

            /* Container Styling (Bento Grid) */
            .css-1r6slb0, .css-12oz5g7 {{ /* Try to target containers generally - highly version dependent */
                border: 1px solid {COLOR_BORDER};
                padding: 10px;
                border_radius: 0px;
            }}
            
            /* Streamlit columns often don't have direct borders easily, 
               so we might wrap content in custom HTML/markdown divs if needed.
               For now, we'll try to style text areas and metrics. */
            
            /* Metrics */
            [data-testid="stMetricValue"] {{
                color: {COLOR_TEXT_SEC} !important;
                font-family: {FONT_MONO} !important;
            }}
            [data-testid="stMetricLabel"] {{
                color: #888888 !important;
            }}
            [data-testid="stMetricDelta"] svg {{
                fill: {COLOR_TEXT_MAIN} !important;
            }}
            
            /* Custom Scrollbars */
            ::-webkit-scrollbar {{
                width: 8px;
                height: 8px;
            }}
            ::-webkit-scrollbar-track {{
                background: {COLOR_BG};
            }}
            ::-webkit-scrollbar-thumb {{
                background: {COLOR_BORDER};
            }}
            ::-webkit-scrollbar-thumb:hover {{
                background: {COLOR_TEXT_MAIN};
            }}

            /* Custom Container Class */
            .neo-container {{
                border: 1px solid {COLOR_BORDER};
                padding: 1rem;
                background-color: #0a0a0a;
                margin-bottom: 1rem;
                height: 100%;
            }}
            
            .terminal-text {{
                color: #00FF00; /* Classic Terminal Green */
            }}
            
            .warning-text {{
                color: {COLOR_TEXT_MAIN};
            }}
            
            .risk-text {{
                color: {COLOR_RISK};
            }}
        </style>
    """, unsafe_allow_html=True)

# --- Mock Data Functions ---

def get_market_graph():
    # Generate a random graph to simulate market connections
    G = nx.erdos_renyi_graph(15, 0.2)
    tickers = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "JPM", "V", "WMT", "PG", "XOM", "BAC", "MA", "HD"]
    mapping = {i: t for i, t in enumerate(tickers[:15])}
    G = nx.relabel_nodes(G, mapping)
    return G

def get_earnings_signals():
    return [
        {"time": "14:02", "source": "NVDA Earnings", "text": "AI demand continues to outpace supply...", "sentiment": 0.95, "tone": "Confident"},
        {"time": "13:45", "source": "JPM Call", "text": "Consumer spending remains resilient but...", "sentiment": 0.15, "tone": "Cautious"},
        {"time": "13:10", "source": "News Wire", "text": "Fed official hints at rate pause...", "sentiment": 0.60, "tone": "Neutral"},
        {"time": "12:55", "source": "AAPL Transcript", "text": "Services revenue hit all-time high...", "sentiment": 0.88, "tone": "Optimistic"},
        {"time": "12:30", "source": "Market Rumor", "text": "Potential merger talks in energy sector...", "sentiment": 0.40, "tone": "Speculative"},
    ]

def get_agent_logs():
    return [
        {"ts": datetime.now().strftime("%H:%M:%S"), "action": "BUY", "asset": "NVDA", "conf": "92%"},
        {"ts": datetime.now().strftime("%H:%M:%S"), "action": "HOLD", "asset": "AAPL", "conf": "65%"},
        {"ts": datetime.now().strftime("%H:%M:%S"), "action": "SELL", "asset": "TSLA", "conf": "78%"},
        {"ts": datetime.now().strftime("%H:%M:%S"), "action": "SCAN", "asset": "MARKET", "conf": "N/A"},
    ]

# --- Modules ---

def render_module_a_graph():
    st.markdown("### SYSTEMIC RISK MAP (GL-STN)")
    st.markdown('<div class="neo-container">', unsafe_allow_html=True)
    
    # Use NetworkX + Matplotlib for robust mock visualization without external strict dependencies issues
    # but style it to look "Neo-Bloomberg"
    G = get_market_graph()
    
    fig, ax = plt.subplots(figsize=(8, 6))
    fig.patch.set_facecolor(COLOR_BG)
    ax.set_facecolor(COLOR_BG)
    
    pos = nx.spring_layout(G, seed=42)
    
    # Draw nodes
    nx.draw_networkx_nodes(G, pos, node_color=COLOR_BG, edgecolors=COLOR_TEXT_SEC, node_size=1000, linewidths=2, ax=ax)
    
    # Draw edges (glowing cyan effect simulated by high opacity/bright color)
    nx.draw_networkx_edges(G, pos, edge_color=COLOR_TEXT_SEC, alpha=0.6, width=1.5, ax=ax)
    
    # Draw labels
    nx.draw_networkx_labels(G, pos, font_color=COLOR_TEXT_MAIN, font_family="monospace", font_size=10, ax=ax)
    
    plt.axis("off")
    st.pyplot(fig)
    
    st.markdown('</div>', unsafe_allow_html=True)

def render_module_b_feed():
    st.markdown("### MULTIMODAL FEED")
    with st.container():
        st.markdown(f'<div class="neo-container" style="height: 500px; overflow-y: auto;">', unsafe_allow_html=True)
        
        signals = get_earnings_signals()
        for sig in signals:
            color = "#00FF00" if sig['sentiment'] > 0.5 else COLOR_RISK
            st.markdown(f"""
            <div style="border-bottom: 1px dashed #333; padding-bottom: 10px; margin-bottom: 10px;">
                <span style="color: #666; font-size: 0.8em;">[{sig['time']}] {sig['source']}</span><br/>
                <span style="color: {COLOR_TEXT_MAIN};">{sig['text']}</span><br/>
                <span style="color: {color}; font-size: 0.9em;">SENTIMENT: {sig['sentiment']} | TONE: {sig['tone']}</span>
                <div style="height: 20px; background: linear-gradient(90deg, {COLOR_BG} 0%, {color} 50%, {COLOR_BG} 100%); opacity: 0.5; margin-top: 5px;"></div>
            </div>
            """, unsafe_allow_html=True)
            
        st.markdown('</div>', unsafe_allow_html=True)

def render_module_c_log():
    st.markdown("### AGENT COMMAND LOG")
    with st.container():
        st.markdown(f'<div class="neo-container" style="height: 500px; overflow-y: auto; font-family: monospace;">', unsafe_allow_html=True)
        
        logs = get_agent_logs()
        for log in logs:
            action_color = "#00FF00" if log['action'] == "BUY" else (COLOR_RISK if log['action'] == "SELL" else COLOR_TEXT_MAIN)
            st.markdown(f"""
            <div style="margin-bottom: 5px;">
                <span style="color: #444;">[{log['ts']}]</span> 
                <span style="color: {action_color}; font-weight: bold;">{log['action']}</span> 
                >> {log['asset']} 
                >> <span style="color: {COLOR_TEXT_SEC};">CONF: {log['conf']}</span>
            </div>
            """, unsafe_allow_html=True)
            
        st.markdown("</div>", unsafe_allow_html=True)

def render_module_d_metrics():
    st.markdown("### PERFORMANCE BENCHMARKS")
    
    # Custom HTML metrics to ensure rigid styling
    metrics = [
        {"label": "SHARPE RATIO", "value": "2.14", "delta": "+0.45", "color": "#00FF00"},
        {"label": "MAX DRAWDOWN", "value": "-4.2%", "delta": "+1.2% vs SPX", "color": COLOR_RISK},
        {"label": "TOTAL RETURN", "value": "+18.7%", "delta": "+5.3% YTD", "color": "#00FF00"},
        {"label": "ALPHA", "value": "1.89", "delta": "High", "color": COLOR_TEXT_SEC},
    ]
    
    cols = st.columns(4)
    for i, col in enumerate(cols):
        m = metrics[i]
        with col:
            st.markdown(f"""
            <div style="border: 1px solid {COLOR_BORDER}; padding: 15px; background-color: #0a0a0a;">
                <div style="color: #666; font-size: 0.8em; letter-spacing: 1px;">{m['label']}</div>
                <div style="color: {COLOR_TEXT_SEC}; font-size: 1.8em; font-weight: bold;">{m['value']}</div>
                <div style="color: {m['color']}; font-size: 0.9em;">{m['delta']} ▲</div>
            </div>
            """, unsafe_allow_html=True)

# --- Layout ---

inject_custom_css()

st.title("COGNITIVE GRAPH PORTFOLIO OPTIMIZER")
st.markdown("---")

# Main Content
col_left, col_center, col_right = st.columns([1, 2, 1])

with col_left:
    render_module_b_feed()

with col_center:
    render_module_a_graph()

with col_right:
    render_module_c_log()

st.markdown("---")

# Bottom Row
render_module_d_metrics()
