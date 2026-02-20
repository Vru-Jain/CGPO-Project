# CGPO Project: Technical Deep Dive & Mathematical Analysis

## 1. Executive Summary
**CGPO (Cognitive Graph Portfolio Optimizer)** is an advanced financial technology system that leverages **Graph Neural Networks (GNN)** and **Reinforcement Learning (RL)** to optimize investment portfolios. Unlike traditional models (like Markowitz Mean-Variance) that treat assets in isolation or via static correlation matrices, CGPO models the market as a **dynamic graph topology** where:
-   **Nodes** are assets (stocks).
-   **Edges** represent dynamic correlations or causal relationships.
-   **Agents** learn to navigate this graph to maximize risk-adjusted returns.

---

## 2. System Architecture

The project follows a modern decoupled architecture:

### **Frontend (Visualization Layer)**
-   **Framework**: Next.js 14 (React) with TypeScript.
-   **Styling**: Tailwind CSS + Shadcn UI (Neo-brutalist/Cyberpunk aesthetic).
-   **Visualization**: 
    -   `react-force-graph-2d` for the Neural Asset Graph (Canvas rendering).
    -   `recharts` for performance comparison.
-   **State Management**: React Hooks (`useBackend` context).

### **Backend (Intelligence Layer)**
-   **Framework**: FastAPI (Python).
-   **AI Core**: PyTorch (training & inference).
-   **Data Processing**: Pandas, NumPy, TA-Lib (Technical Analysis).
-   **Market Data**: `yfinance` (Yahoo Finance API).

---

## 3. Codebase Analysis: The AI Core

The core intelligence resides in `backend/core/`. Here is the breakdown:

### **A. Graph Construction (`core/graph_engine.py`)**
This module converts raw market time-series data into a graph structure $G = (V, E)$.

*   **Node Features ($X$)**: For each asset node $i$, we extract a feature vector $x_i \in \mathbb{R}^4$:
    1.  **Returns**: $r_t = \frac{p_t - p_{t-1}}{p_{t-1}}$ (Immediate momentum).
    2.  **Volatility**: $\sigma_{window}$ (Risk metric).
    3.  **Momentum**: $\frac{p_t - p_{t-window}}{p_{t-window}}$ (Trend strength).
    4.  **RSI**: Relative Strength Index (Overbought/Oversold indicator, normalized $0-1$).

*   **Edge Construction ($E$)**:
    -   Calculates Pearson Correlation Matrix $\rho$ of returns over the lookback window.
    -   **Thresholding**: An edge $(i, j)$ exists if $|\rho_{ij}| > \text{threshold}$ (default 0.5).
    -   **k-NN Guarantee**: To prevent disconnected graphs, each node is guaranteed `min_neighbors` (default 2) connections, even if correlations are weak.

### **B. Neural Architecture (`core/models.py`)**
The `GNNPolicy` class implements a hybrid **Actor-Critic** network.

1.  **GNN Encoder (Graph Convolution)**:
    -   Uses **GCNConv** (Graph Convolutional Network) layers.
    -   **Input**: Node features $X$ and adjacency $A$.
    -   **Propagation**: Aggregates information from neighbors $j \in \mathcal{N}(i)$ to update node embedding $h_i$.
    -   **Stack**: 2 layers of GCN + ReLU + Dropout.
    
    $$ H^{(l+1)} = \sigma\left( \tilde{D}^{-\frac{1}{2}} \tilde{A} \tilde{D}^{-\frac{1}{2}} H^{(l)} W^{(l)} \right) $$

2.  **Actor Head (Policy)**:
    -   **Input**: Node Embedding $h_i$ (for each asset).
    -   **Layer**: Linear Projection $\mathbb{R}^{64} \to \mathbb{R}^1$.
    -   **Output**: Unnormalized logits $z_i$ for each asset.
    -   **Action**: A Softplus transform creates Dirichlet parameters $\alpha_i = \text{softplus}(z_i) + 1$, from which portfolio weights $w \sim \text{Dirichlet}(\alpha)$ are sampled.

3.  **Critic Head (Value Function)**:
    -   **Input**: Graph-level embedding (Global Mean Pool of all node embeddings).
    -   **Layer**: Linear Projection $\mathbb{R}^{64} \to \mathbb{R}^1$.
    -   **Output**: Scalar value $V(s)$ estimating the expected return of the current market state.

### **C. Reinforcement Learning Context (`core/agent.py` & `market_env.py`)**
-   **Algorithm**: **A2C (Advantage Actor-Critic)**.
-   **Environment**: `MarketGraphEnv` (OpenAI Gym compatible).
    -   **State**: The constructed graph (features + topology).
    -   **Constraint**: Portfolio weights must sum to 1 ($\sum w_i = 1$).
    
---

## 4. Mathematical Formulation Deep Dive

### **1. Graph Neural Network (GNN)**
**Architecture Used: GCN (Graph Convolutional Network)**

We use the **GCN** architecture (Kipf & Welling, 2017), which is the most popular and foundational type of GNN.
*   **GNN** is the broad category (like "Vehicle").
*   **GCN** is the specific model (like "Sedan").

Let $x_i^{(l)}$ be the feature vector of node $i$ at layer $l$. The update rule used (GCN) is:

$$ x_i^{(l+1)} = \sigma \left( \sum_{j \in \mathcal{N}(i) \cup \{i\}} \frac{1}{\sqrt{c_{ij}}} W^{(l)} x_j^{(l)} \right) $$
*Where $c_{ij}$ is a normalization constant (degree product).*

In this project, edge weights (correlations $\rho_{ij}$) are also potentially used to scale the message passing strength, effectively making it:
$$ x_i^{(l+1)} = \sigma \left( W^{(l)} \cdot \sum_{j \in \mathcal{N}(i)} \rho_{ij} x_j^{(l)} \right) $$

### **2. Reinforcement Learning (A2C)**
The agent maximizes the expected discounted return: $J(\pi) = \mathbb{E}_{\tau \sim \pi} \left[ \sum_{t=0}^{T} \gamma^t R_t \right]$.

#### **Loss Function**
The agent minimizes a composite loss function:
$$ \mathcal{L} = \mathcal{L}_{policy} + 0.5 \mathcal{L}_{value} - \beta \mathcal{S} $$

1.  **Policy Loss (Actor)**: Maximizes the likelihood of actions that lead to high advantage.
    $$ \mathcal{L}_{policy} = - \sum \log \pi(a_t | s_t) \cdot A_t $$
    *Where $A_t = R_t - V(s_t)$ is the Advantage (Actual Return - Expected Return).*

2.  **Value Loss (Critic)**: Minimizes prediction error of the state value.
    $$ \mathcal{L}_{value} = (R_t - V(s_t))^2 $$
    *(Uses MSE Loss).*

3.  **Entropy Bonus ($\mathcal{S}$)**: Encourages exploration by penalizing certainty.
    $$ \mathcal{S} = H(\pi(\cdot|s_t)) $$

### **3. Reward Function Design**
The reward $R_t$ drives the behavior. The specific function implemented is:
$$ R_t = 100 \cdot (\underbrace{r_{portfolio} - r_{benchmark}}_{\text{Excess Return}}) - 50 \cdot |r_{portfolio}| - 10 \cdot \sigma_{20d} + 10 \cdot \text{avg}(r_{excess, 5d}) \cdot \mathbb{I}(\text{avg} > 0) $$

*   **Goal**: Beat the benchmark (SPY).
*   **Constraint**: Minimize volatility ($\sigma$) and maximize consistency.
*   **Note**: While turnover constraint is common in portfolio theory, the current implementation focuses on volatility and excess return.

*   **Goal**: Beat the benchmark (SPY).
*   **Constraint**: Minimize volatility ($\sigma$).

---

## 5. Technical Stack Summary

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React / Next.js | UI Rendering, WebSockets, State |
| **Visualization** | D3.js (via react-force-graph) | Physics simulation of asset topology |
| **API** | FastAPI | High-performance async backend |
| **ML Framework** | PyTorch + Geometric | Graph Deep Learning |
| **Graph Logic** | NetworkX | Topology analysis, k-NN algorithms |
| **Data Source** | yfinance | Real-time market data |

This system represents a cutting-edge application of **Geometric Deep Learning** to finance, moving beyond static table-based analysis to dynamic, relational market understanding.

---

## 6. References

The theoretical and architectural foundations of this project are based on the following key works:

### **Academic Papers (AI & Finance)**
1.  **GCN Architecture**: Kipf, T. N., & Welling, M. (2017). *Semi-Supervised Classification with Graph Convolutional Networks*. ICLR 2017. [arXiv:1609.02907](https://arxiv.org/abs/1609.02907)
2.  **A2C Algorithm**: Mnih, V., et al. (2016). *Asynchronous Methods for Deep Reinforcement Learning*. ICML 2016. [arXiv:1602.01783](https://arxiv.org/abs/1602.01783)
3.  **Graph Attention Networks (Related Context)**: Veličković, P., et al. (2018). *Graph Attention Networks*. ICLR 2018. [arXiv:1710.10903](https://arxiv.org/abs/1710.10903)
4.  **Modern Portfolio Theory**: Markowitz, H. (1952). *Portfolio Selection*. The Journal of Finance, 7(1), 77-91.

### **Technical Documentation**
5.  **PyTorch Geometric**: Fey, M., & Lenssen, J. E. (2019). *Fast Graph Representation Learning with PyTorch Geometric*. [Documentation](https://pytorch-geometric.readthedocs.io/en/latest/)
6.  **OpenAI Gym / Gymnasium**: Brockman, G., et al. (2016). *OpenAI Gym*. [arXiv:1606.01540](https://arxiv.org/abs/1606.01540)
7.  **FastAPI**: Ramírez, S. (2018). *FastAPI: A modern, fast (high-performance), web framework for building APIs with Python 3.6+*. [Documentation](https://fastapi.tiangolo.com/)

### **Key Concepts**
*   **Geometric Deep Learning**: Bronstein, M. M., et al. (2017). *Geometric Deep Learning: Going beyond Euclidean data*. IEEE Signal Processing Magazine.
*   **Deep Reinforcement Learning in Finance**: Hambly, B., Xu, R., & Yang, H. (2023). *Recent Advances in Reinforcement Learning in Finance*.
