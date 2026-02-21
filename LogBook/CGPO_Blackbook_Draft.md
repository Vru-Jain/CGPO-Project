# CGPO Blackbook Draft (Technical Expansion)

---

## 1. Abstract
The Cognitive Graph Portfolio Optimizer (CGPO) is an agentic artificial intelligence system engineered for autonomous financial portfolio optimization. The system integrates Graph Neural Networks (GNN) and Reinforcement Learning (RL) to analyze live market graphs and execute inference for dynamic portfolio weight allocation. By tracking real-time price variances and correlations, the RL agent operates iteratively to maximize risk-adjusted returns against major United States and Indian financial benchmarks (e.g., S&P 500, Nifty 50). The architecture ensures low-latency, scalable processing through a FastAPI backend deployed on Modal serverless GPU infrastructure, coupled with a React-based Next.js frontend for decision support, parameter tuning, and execution transparency.

## 2. Problem Statement Formulation
Traditional portfolio allocation models, such as Markowitz Mean-Variance Optimization, rely heavily on static sample covariance matrices that fail to capture the complex, non-linear, and non-stationary correlations between global assets during volatile market regimes. Furthermore, standard algorithmic models lack the geometric framing required to process the interconnected dependencies (the "spillover" effect) of modern financial markets at scale. There is a critical operational gap for a system capable of modeling these multidimensional relationships geometrically as a graph and executing high-speed, data-driven optimization while retaining human oversight for strategic execution approval.

## 3. Introduction
### 3.1 Brief description of the project / Synopsis
CGPO is a full-stack, machine learning application featuring a Next.js frontend delivered via Vercel and a PyTorch-based FastAPI backend deployed on Modal cloud GPU infrastructure. The application simulates a live market environment where an Advantage Actor-Critic (A2C) reinforcement learning agent is trained to allocate capital dynamically across a localized network of user-defined asset tickers.

### 3.2 Background and context
The integration of Graph Neural Networks (GNN) in financial technology allows individual securities to be represented mathematically as nodes in a graph $G = (V, E)$, with their temporal and statistical correlations represented as connecting edges $E$. This graph topology provides a superior, non-Euclidean data structure for reinforcement learning algorithms to identify systemic trends and contagion risks compared to standard independent tabular formats.

### 3.3 Motivation for the project
The primary motivation for CGPO is the democratization of institutional-grade, deep-learning-based portfolio optimization tools. By providing accessible portfolio presets (including Tech Giants, Crypto, India Bluechips, and India IT) alongside a transparent graph visualization, the project bridges the technical divide between complex AI architectures and retail investing interfaces.

### 3.4 Key features and objectives
The fundamental objectives and features of the CGPO platform include:
- **Neural Asset Graph:** Transformation of raw security time-series into a PyTorch Geometric (PyG) `Data` object, where stocks are nodes and Pearson correlations exceeding a given threshold form edges.
- **RL Agent Training:** A2C-style on-policy training optimized by a Sharpe-ratio-based reward function.
- **Multi-Benchmark Comparison:** Continuous empirical evaluation against indices like the S&P 500, Nasdaq, Dow Jones, Nifty 50, and Sensex.
- **Live Execution Trace:** Real-time visibility into the backend's inference and training loops.

## 4. Field Survey and Market Analysis
To validate the architectural decisions and practical utility of the CGPO system, a primary field survey was executed.

### 4.1 Data Overload and Risk Tracking
The dataset comprises 36 respondents classified as Students, Active Investors, and Finance Professionals. The data highlights a severe operational bottleneck in processing interconnected market risks. When evaluating systemic risk, the overwhelming majority categorized the difficulty level as "Very Difficult". This empirical data validates the implementation of our structural correlation methodology.

### 4.2 Data Visualization Preferences
Respondents were presented with a choice between traditional data representation (Standard List) and advanced visual representation (Network Map). While beginners leaned toward standard tabular lists, advanced active investors and data-focused respondents demonstrated a strong preference for Network Maps. This validates the decision to build the `GraphModule.tsx` component and utilize a Neural Asset Graph visualization using `recharts` and force-directed layouts.

### 4.3 AI Autonomy and Execution Speed
The survey results dictate a uniform demand for "Real-time" processing capabilities. Furthermore, when evaluating trust in AI autonomy, over 90 percent of the surveyed demographic stated: "No, I want final approval (Decision Support)" rather than a "fully automated (Black Box)" system. The CGPO dashboard directly addresses this constraint by functioning as an *"Agent in the Loop"* system—an advisory interface that outputs continuous optimization weights for human review.

## 5. Scope of Work
### 5.1 Solution overview
The solution encompasses a trilateral pipeline:
1. **Data Layer (`data_loader.py`):** Fetches parallel market metrics via the `yfinance` integration with exponential backoff and localized caching.
2. **Algorithmic Processing Layer (`graph_engine.py` & `agent.py`):** Constructs the graph using `PyG` and `NetworkX`, structuring the state space for the A2C reinforcement learning agent which executes localized convolutions (`GCNConv`).
3. **Delivery Layer (`Next.js`):** A React-based interface providing interactive visualization and agent training controls, protected by strict API authentication boundaries.

### 5.2 Features and benefits of the proposed solution
By utilizing GPU-accelerated cloud infrastructure via Modal (`modal_app.py`), the system dynamically scales and guarantees low-latency inference on NVIDIA T4 tensors without incurring fixed "always-on" costs. The inclusion of the `ExecutionLog.tsx` component provides a live backend trace, ensuring absolute transparency of the AI's compute loop.

## 6. System Design
### 6.1 Description of the system design
The system architecture routes client HTTP requests from the Vercel-hosted browser interface to the FastAPI backend. Within the backend (`main.py`), requests are authorized via an `X-API-Key` middleware and then processed by internal routing logic which interfaces with PyTorch RL models. 

### 6.2 System Architecture mapping
The specific data control flow is defined sequentially:
1. Client configures tickers via `POST /config/tickers`.
2. Backend triggers `MarketDataLoader.fetch_history()` to pull a unified `pandas` DataFrame of adjusted close prices and computes rolling variances.
3. `GraphEngine.build_graph()` computes the Pearson correlation matrix $C$. If $|C_{i,j}| > \theta$ (where $\theta = 0.5$), a bidirectional edge is formed in the `edge_index` tensor.
4. The A2C `Agent` processes the resulting PyG `Data` structure.
5. Softmax-normalized weights $W$ are returned to the frontend and rendered in `MetricsPanel.tsx` and `ComparisonChart.tsx`.

## 7. Methodology
### 7.1 Mathematical & Algorithmic Foundations
The CGPO methodology utilizes a custom reinforcement learning environment conforming to the `gymnasium` API, defined in `market_env.py`.

#### Graph Construction (`graph_engine.py`)
At timestep $t$, the state is represented as a directed graph. The node features $x_i$ for asset $i$ consist of historical return vectors and volatility. The edge index is constructed based on the Pearson correlation coefficient:
$$ \rho_{X,Y} = \frac{\text{cov}(X,Y)}{\sigma_{X}\sigma_{Y}} $$
An edge $e_{i,j}$ exists if $|\rho_{i,j}| > 0.5$. This isolates strong dependencies and filters out market noise.

#### The Advantage Actor-Critic (A2C) Model (`agent.py`)
A2C is an on-policy gradient algorithm. The architecture trains two neural network heads originating from a shared Graph Convolutional Network (GCN) backbone:

**1. The Actor Network (Policy $\pi_\theta$):**
Maps the graph-based state embedding to a probability distribution. To ensure the portfolio is fully invested (sum of weights = 100%) and long-only (no short selling), the final layer applies a Softmax activation:
$$ w_i = \text{Softmax}(z_i) = \frac{e^{z_i}}{\sum_{j} e^{z_j}} $$
where $z_i$ represents the raw logit output for the $i$-th asset.

**2. The Critic Network (Value $V_\phi$):**
Estimates the expected future reward from the current state $s_t$. It outputs a single scalar value $V(s_t)$.

**Optimization Math:**
The *Advantage* $A_t$ denotes how much better a specific action $a_t$ was compared to the average expected value $V(s_t)$.
$$ A_t = R_t - V_\phi(s_t) $$

The Actor is updated to increase the probability of actions that yielded a positive Advantage (Policy Loss):
$$ L_{\text{actor}} = -\log \pi_\theta(a_t | s_t) \cdot A_t $$

To encourage exploration and prevent premature convergence on a sub-optimal portfolio, an Entropy regularization penalty $H(\pi)$ is subtracted from the loss:
$$ L_{\text{actor\_final}} = L_{\text{actor}} - \beta H(\pi_\theta(\cdot | s_t)) $$

The Critic is updated by minimizing the Mean Squared Error (MSE) between the predicted value and the actual observed returns:
$$ L_{\text{critic}} = \frac{1}{2} (R_t - V_\phi(s_t))^2 $$

#### Reward Function Formulation (`market_env.py`)
The environment must aggressively penalize uncompensated risk. Thus, the step reward $R_t$ is heavily biased toward the Sharpe Ratio approximation. 
If $\mu_p$ is the portfolio return and $\sigma_p$ is the portfolio volatility:
$$ \text{Sharpe} = \frac{\mu_p - R_f}{\sigma_p} $$
In `market_env.py`, the reward formulation is simplified computationally at the episode level as `portfolio_return - penalty_factor * portfolio_variance`, guiding the gradient descent explicitly toward structurally safe allocations.

## 8. Implementation and Codebase Mapping
### 8.1 Architectural Modules
The backend repository is cleanly compartmentalized to enforce Separation of Concerns.
- **`core/agent.py`:** Initializes the PyTorch `nn.Module` containing two `GCNConv` layers. Provides `get_action(state)` for inference and tracks gradients during episodic updates.
- **`core/data_loader.py`:** Manages multithreaded downloading using `yfinance`. Implements aggressive internal caching (`_cache` dict) to minimize network I/O and evade rate limits.
- **`core/graph_engine.py`:** Transforms raw financial data tensors into the highly specialized PyG `Data(x, edge_index, edge_attr)` payloads for the GCN.
- **`core/market_env.py`:** Houses the `MarketGraphEnv` class, overriding standard `gym` methods (`reset`, `step`) to feed the graph state sequentially over a historical window.
- **`main.py`:** The FastAPI root. Utilizes thread-safe locks (`threading.RLock`) for the global `state` dictionary to handle concurrent requests on the single-worker Modal GPU instance securely.
- **`modal_app.py`:** Contains the infrastructure-as-code (IaC) definition for the Modal container, injecting API secrets (`modal.Secret`) and installing `requirements.txt` into a Debian base image.

## 9. Testing and Validation
To guarantee mathematical precision and API reliability, the system relies on isolated tests. 
- **Data Integrity:** Validates that `MarketDataLoader` correctly formats NaN values and gracefully falls back during partial Yahoo Finance API outages.
- **Model Convergence:** Verifies the mathematical integrity of the A2C actor by initiating a localized dummy environment and ensuring the actor loss gradients are properly backpropagating to the Softmax output layer.
- **Performance Profiling:** Ensures the inference loop (Data Fetch $\rightarrow$ Graph Build $\rightarrow$ Forward Pass $\rightarrow$ JSON Serialization) executes well beneath a 2.0-second threshold to comply with real-time UI constraints.

## 10. Experimental Setup
### 10.1 Cloud Hardware & Software Toolchain
The model training and inference pipelines are hosted on Modal, executing inside an ephemeral Dockerized Linux container provisioned with an **NVIDIA T4 Tensor Core GPU**. 
The client interface is a Next.js `15` application utilizing React hooks (`useState`, `useEffect`) and responsive CSS flexbox/grid layouts governed by `Tailwind CSS`. It is edge-cached and distributed globally on the Vercel CDN. Trained model weights (`agent.pth`) are dynamically loaded into VRAM on container cold-starts.

## 11. Results and Discussions
### 11.1 Presentation of results
The outputs of the AI are continually evaluated against institutional benchmarks using raw percentage return over synchronized periods. Using the `ComparisonChart.tsx` block powered by `recharts`, the dashboard overlays the dynamic RL portfolio's trace directly against proxies like the S&P 500 (SPY), Nasdaq (QQQ), or Nifty 50 (^NSEI).

### 11.2 In-depth Analysis
The analytical success of the system is proven when the portfolio maintains a mathematically superior Sharpe ratio compared to static equal-weight proxy indices. The dynamic nature of the GCN allows the agent to recognize correlation breakdowns (e.g., when previously uncorrelated tech and banking sectors suddenly move in tandem during a macro shock) and immediately adjust capital away from the densest points of edge connectivity in the network. A programmatic heuristic in the UI triggers a `toast` notification ("Beats the Market") directly alerting the user when alpha is successfully generated.

## 12. Conclusion
The Cognitive Graph Portfolio Optimizer successfully merges non-Euclidean topological data representation with deep reinforcement learning. It processes high-dimensional, real-time financial data sets into executable capital allocations natively within a web browser. By providing interactive visual network maps (`GraphModule.tsx`) and an advisory "Agent-in-the-loop" execution paradigm, CGPO resolves the major friction points associated with opaque, black-box algorithmic trading systems.

## 13. Future Scope and Potential Advancements
Subsequent iterations of the CGPO architecture must transcend classical equities to include fixed-income securities, global commodities, and cryptocurrency liquidity pools. Furthermore, the GNN engine is structurally capable of absorbing alternative multivariate data streams—such as NLP sentiment analysis gathered directly from the `MarketDataLoader.fetch_news()` pipeline—by appending them statically to the node feature matrices $x_i$, establishing a truly multimodal intelligence network.
