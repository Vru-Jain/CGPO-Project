# CGPO UML Diagrams (Mermaid)

Copy and paste these blocks into [Mermaid Live](https://mermaid.live) to generate the diagrams for your Blackbook.

## 1. Deployment Diagram
Shows the physical cloud infrastructure: User Browser → Vercel CDN → Modal GPU.

```mermaid
flowchart TD
    subgraph Client ["Client Tier"]
        B[User Browser\n(Web Client)]
    end

    subgraph Vercel ["Vercel Edge Network"]
        UI[Next.js Frontend Dashboard]
        API_Route[Next.js API Routes]
    end

    subgraph Modal ["Modal Cloud GPU Infrastructure"]
        direction TB
        subgraph Container ["Debian Linux Container (T4 GPU)"]
            FASTAPI[FastAPI Server\nmain.py]
            PyG[Graph Engine\nPyTorch Geometric]
            Agent[RL Agent Model\nPyTorch]
        end
    end

    subgraph External ["External Services"]
        YF[Yahoo Finance API\n(Market Data)]
    end

    B -- HTTPS --> UI
    UI -- HTTPS (X-API-Key) --> FASTAPI
    FASTAPI -- Internal Logic --> PyG
    FASTAPI -- Inference --> Agent
    FASTAPI -- HTTP REST --> YF
```

## 2. Component Diagram
Shows the modular structure of your React frontend and Python backend.

```mermaid
flowchart LR
    subgraph Frontend ["Next.js Frontend (React)"]
        LP[Landing Page\npage.tsx]
        DB[Dashboard\n/dashboard/page.tsx]
        SB[Sidebar.tsx]
        GM[GraphModule.tsx]
        CC[ComparisonChart.tsx]
        API_Lib[Fetch Wrapper\napi.ts]
        
        LP --> DB
        DB --> SB
        DB --> GM
        DB --> CC
        DB -.-> API_Lib
    end

    subgraph Backend ["FastAPI Backend (Python)"]
        API[main.py\nRouting & Security]
        DL[data_loader.py\nMarketDataLoader]
        GE[graph_engine.py\nGraphEngine]
        AG[agent.py\nAgent A2C]
        ENV[market_env.py\nMarketGraphEnv]
        
        API --> DL
        API --> GE
        API --> AG
        API --> ENV
    end

    API_Lib == HTTPS Requests ==> API
```

## 3. Sequence Diagram (Inference Flow)
Shows the step-by-step chronological execution when a user asks for AI allocations.

```mermaid
sequenceDiagram
    actor User
    participant Browser as Next.js Dashboard
    participant API as FastAPI Backend
    participant Loader as MarketDataLoader
    participant Graph as GraphEngine
    participant Agent as RL Agent

    User->>Browser: Click "Run Inference"
    Browser->>API: POST /ai/inference (X-API-Key)
    API->>Loader: fetch_history(tickers)
    Loader-->>API: returns DataFrame
    API->>Graph: build_graph(DataFrame, corr_threshold=0.5)
    Graph-->>API: returns PyG Data Object
    API->>Agent: get_action(Data Object)
    Agent-->>API: returns Softmax Weights
    API-->>Browser: JSON {nodes, edges, weights}
    Browser->>Browser: Update GraphModule & Charts
    Browser-->>User: Render Dashboard Updates
```

## 4. Activity Diagram (Training Loop)
Shows the logic flow inside the backend when the RL Agent is being trained in the background.

```mermaid
stateDiagram-v2
    [*] --> StartTraining
    StartTraining --> FetchMarketData: Download Ticker History
    FetchMarketData --> InitEnv: Create MarketGraphEnv
    InitEnv --> EpochLoop: Start Epochs
    
    state EpochLoop {
        [*] --> ResetState
        ResetState --> BuildGraph: Generator
        BuildGraph --> ForwardPass: Agent views graph
        ForwardPass --> CalculateReward: Sharpe Ratio = Return / Variance
        CalculateReward --> CalcAdvantage: Advantage = Reward - Critic Baseline
        CalcAdvantage --> Backprop: Compute Gradients & Update Weights
        Backprop --> CheckDone: End of timeframe?
        CheckDone --> BuildGraph: No
        CheckDone --> [*]: Yes
    }
    
    EpochLoop --> SaveModel: torch.save(agent.pth)
    SaveModel --> UpdateLog: Broadcast Success
    UpdateLog --> [*]
```

## 5. Class Diagram (Backend Core)
Shows the Object-Oriented design of your Python AI logic.

```mermaid
classDiagram
    class MarketDataLoader {
        +_cache: Dict
        +fetch_history(tickers: List[str], period: str, interval: str) pd.DataFrame
        +fetch_news(tickers: List[str]) List[Dict]
        +get_benchmark_performance(benchmark: str, period: str) pd.Series
    }

    class GraphEngine {
        +lookback: int
        +corr_threshold: float
        +build_graph(df: pd.DataFrame, current_step: int) Data
        -_calculate_node_features()
        -_calculate_edge_index()
    }

    class Agent {
        +shared_conv: GCNConv
        +actor: Sequential
        +critic: Sequential
        +forward(data: Data) Tuple[Tensor, Tensor]
        +get_action(data: Data) np.ndarray
        +load_model()
        +save_model()
    }

    class MarketGraphEnv {
        +df: pd.DataFrame
        +step(action: np.ndarray) Tuple
        +reset() Data
        -_calculate_reward(weights) float
    }

    MarketDataLoader --> GraphEngine : Feeds Data
    GraphEngine --> MarketGraphEnv : Provides States
    Agent ..> MarketGraphEnv : Interacts
```

## 6. Use Case Diagram
Shows what actions the User and the API can perform in the system.

```mermaid
usecaseDiagram
    actor User as Investor
    actor ExternalSystem as Yahoo Finance System

    package "CGPO Software System" {
        usecase "Modify Portfolio Configuration" as UC1
        usecase "Run Real-time AI Inference" as UC2
        usecase "Initiate RL Agent Training" as UC3
        usecase "View Neural Graph Visualization" as UC4
        usecase "Compare Returns vs Benchmarks" as UC5
        usecase "View Live Execution Trace" as UC6
        usecase "Fetch Market Prices & News" as UC7
    }

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    
    UC2 ..> UC7 : <<includes>>
    UC3 ..> UC7 : <<includes>>
    UC5 ..> UC7 : <<includes>>
    
    ExternalSystem --> UC7
```

## 7. State Machine Diagram (Backend Server States)
Shows how your Modal server handles requests and background tasks.

```mermaid
stateDiagram-v2
    [*] --> ContainerCold: Modal Spawns Container
    ContainerCold --> WakingUp: HTTP Request Received
    WakingUp --> Idle: Load PyTorch Model & Inits
    
    Idle --> ProcessingInference: POST /ai/inference
    ProcessingInference --> Idle: Return JSON Weights
    
    Idle --> TrainingMode: POST /ai/train
    TrainingMode --> Idle: Save Checkpoint (.pth)
    
    Idle --> ServingData: GET /market/benchmark
    ServingData --> Idle: Return DataFrame JSON
    
    Idle --> ContainerCold: Timeout (Scale to 0)
```

## 8. Package Diagram
Shows the directory isolation of your repository structure.

```mermaid
graph TD
    subgraph frontend ["Frontend Layer (Next.js)"]
        A[app/]
        C[components/]
        L[lib/api]
        A -.-> C
        C -.-> L
    end

    subgraph backend ["Backend Layer (FastAPI)"]
        API[main.py (Controllers)]
        subgraph core ["Core Logic (ML Pipeline)"]
            DL[data_loader.py]
            GE[graph_engine.py]
            AG[agent.py]
            ENV[market_env.py]
        end
        API -.-> core
    end
    
    L == X-API-Key HTTP ==> API
```
