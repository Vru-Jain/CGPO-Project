import streamlit as st
from streamlit_agraph import agraph, Node, Edge, Config
import random
from datetime import datetime
from typing import List, Tuple, Dict, Any

# --- CONFIGURATION & CONSTANTS ---
PAGE_TITLE = "CGPO Terminal"
LAYOUT = "wide"

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

# --- DATA SERVICE LAYER ---
# In a real app, this would fetch from an API or Database.

def get_graph_data() -> Tuple[List[Node], List[Edge]]:
    """
    Generates nodes and edges for the Systemic Risk Map.
    
    Returns:
        Tuple[List[Node], List[Edge]]: The graph elements for streamlit-agraph.
    """
    nodes = []
    edges = []
    tickers = ["AAPL", "NVDA", "MSFT", "GOOG", "AMZN", "TSLA", "META", "AMD", "QCOM", "INTC"]
    
    for i, ticker in enumerate(tickers):
        # Simulate criticality via size
        size = random.randint(15, 30)
        # Simulate risk level
        risk_score = random.random()
        
        # Determine Color based on Risk
        if risk_score > 0.8:
            color = THEME['danger']
        elif risk_score < 0.4:
            color = THEME['secondary']
        else:
            color = "#DDDDDD"
            
        nodes.append(Node(
            id=ticker, 
            label=ticker, 
            size=size, 
            color=color, 
            font={'color': 'white', 'face': 'Courier New'}
        ))
    
    # Generate random edges to simulate market correlations
    for i in range(len(tickers)):
        for j in range(i + 1, len(tickers)):
            if random.random() > 0.7:  # 30% connectivity
                edges.append(Edge(
                    source=tickers[i], 
                    target=tickers[j], 
                    color=THEME['text_dim'], 
                    strokeWidth=1, 
                    type="straight"
                ))
                
    return nodes, edges

def get_feed_data() -> List[Dict[str, str]]:
    """Fetches the latest mock multimodal signals."""
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


def render_graph_module():
    """Renders the interactive Graph Map (Module A)."""
    st.markdown(f"""
    <div class="neo-card">
        <h3>GL-STN SYSTEMIC RISK MAP</h3>
        <p style="font-size: 0.8rem; color: {THEME['text_dim']}; margin-bottom: 10px;">
            Dynamic Topology // Real-time Propagation
        </p>
    """, unsafe_allow_html=True)
    
    nodes, edges = get_graph_data()
    
    config = Config(
        width="100%", 
        height=450, 
        directed=False, 
        physics=True, 
        hierarchical=False,
        nodeHighlightBehavior=True, 
        highlightColor=THEME['primary'],
        collapsible=False,
        minZoom=0.5, 
        maxZoom=2.0
    )
    
    # Note: agraph returns a React component
    agraph(nodes=nodes, edges=edges, config=config)
    
    st.markdown("</div>", unsafe_allow_html=True)

def render_feed_module():
    """Renders the Signal Feed (Module B)."""
    st.markdown(f"""<div class="neo-card"><h3>MULTIMODAL INTELLIGENCE</h3>""", unsafe_allow_html=True)
    
    feed = get_feed_data()
    for item in feed:
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

def render_log_module():
    """Renders the Agent Action Log (Module C)."""
    st.markdown(f"""<div class="neo-card"><h3>AGENT COMMAND STREAM</h3>""", unsafe_allow_html=True)
    
    actions = [
        ("BUY", "NVDA", "98%"), ("HOLD", "MSFT", "55%"), 
        ("SELL", "INTC", "82%"), ("BUY", "AMD", "74%"),
        ("WAIT", "MKT_SCAN", "---")
    ]
    
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

def render_metrics_module():
    """Renders the Bottom KPI Row (Module D)."""
    metrics = [
        ("SHARPE", "2.45", "+0.12", THEME['success']),
        ("BETA", "0.85", "-0.05", THEME['secondary']),
        ("ALPHA", "1.9%", "+0.4%", THEME['success']),
        ("MAX DD", "-5.2%", "STABLE", THEME['danger']),
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
    render_header()
    
    # Main Grid Layout
    col_feed, col_graph, col_log = st.columns([1, 2, 1])
    
    with col_feed:
        render_feed_module()
    
    with col_graph:
        render_graph_module()
    
    with col_log:
        render_log_module()
        
    st.write("") # Spacer
    
    # Metrics
    render_metrics_module()

if __name__ == "__main__":
    main()


