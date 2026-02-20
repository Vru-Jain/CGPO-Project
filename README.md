# CGPO — Cognitive Graph Portfolio Optimizer

An agentic AI system for financial portfolio optimization, powered by **Graph Neural Networks (GNN)** and **Reinforcement Learning (RL)**. The agent builds a live market graph, runs inference to allocate portfolio weights, and competes against major US & Indian benchmarks.

## 🏗️ Architecture

```
Browser (Vercel)  ──►  Next.js Frontend  ──►  FastAPI Backend (Modal GPU)
                                                      │
                                         ┌────────────┼────────────┐
                                     GNN Engine   RL Agent   Market Data
                                   (PyG + NetworkX) (A2C)  (yfinance + news)
```

## 📁 Project Structure

```
CGPO-Project/
│
├── backend/
│   ├── core/
│   │   ├── agent.py          # A2C Reinforcement Learning agent
│   │   ├── data_loader.py    # Parallel market data + news fetcher
│   │   ├── graph_engine.py   # GNN graph builder (node/edge features)
│   │   └── market_env.py     # RL market simulation environment
│   ├── main.py               # FastAPI app (all API endpoints)
│   ├── modal_app.py          # Modal cloud deployment config (GPU)
│   └── requirements.txt      # Python dependencies
│
├── frontend/
│   ├── app/
│   │   └── page.tsx          # Main dashboard page
│   ├── components/
│   │   ├── Sidebar.tsx       # Left sidebar (controls + training progress)
│   │   ├── ComparisonChart.tsx # Benchmark chart (S&P, Nifty, Sensex...)
│   │   ├── GraphModule.tsx   # Neural asset graph visualisation
│   │   ├── MetricsPanel.tsx  # Sharpe ratio, volatility, return cards
│   │   ├── ExecutionLog.tsx  # Live backend execution trace
│   │   ├── TickerModal.tsx   # Custom portfolio ticker input
│   │   └── backend-connection-manager.tsx  # Backend URL + health check
│   ├── lib/
│   │   └── api.ts            # Global fetch wrapper (Modal bypass header)
│   └── package.json
│
├── tests/
│   ├── test_benchmark_api.py
│   ├── test_rl_optimization.py
│   └── test_training_speed.py
│
├── LogBook/                  # Project documentation & mentor sync logs
└── README.md
```

## 🚀 Quick Start

### Local Frontend Dev
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
# Connects to the live Modal cloud backend automatically
```

### Deploy Backend to Modal
```bash
# One-time setup
pip install modal
modal token new

# Deploy (from project root)
python -m modal deploy backend/modal_app.py
# → https://vrushabhjain2016--cgpo-backend-serve.modal.run
```

### Local Backend Dev
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Then set the URL in the sidebar settings to http://localhost:8000
```

## 🌐 Live Deployment

| Service | URL |
|---------|-----|
| **Frontend** | [cgpo-project.vercel.app](https://cgpo-project.vercel.app) |
| **Backend API** | `https://vrushabhjain2016--cgpo-backend-serve.modal.run` |
| **API Docs** | `.../docs` (FastAPI Swagger) |
| **Modal Dashboard** | [modal.com/apps/vrushabhjain2016](https://modal.com/apps/vrushabhjain2016/main/deployed/cgpo-backend) |

## 🧠 Key Features

- **Neural Asset Graph** — stocks become nodes, correlations become edges; the GNN reads this graph to infer portfolio allocation
- **RL Agent Training** — A2C-style training with Sharpe-ratio-based reward; train directly from the dashboard
- **Multi-Benchmark Comparison** — AI portfolio vs S&P 500, Nasdaq, Dow Jones, Nifty 50, Sensex
- **Beats the Market Alert** — 🏆 toast fires automatically when the AI outperforms the benchmark
- **Portfolio Presets** — One-click presets: Tech Giants, Crypto, Finance, Healthcare, Energy, **India Bluechips**, **India IT**
- **Live Signal Intelligence** — Real-time news with sentiment (POS/NEG/NEU) for each asset

## 📦 Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/ai/inference` | Run portfolio inference |
| `POST` | `/ai/train` | Start background training |
| `GET` | `/ai/training-status` | Poll training progress |
| `GET` | `/market/benchmark` | Fetch benchmark returns |
| `GET` | `/market/news` | Fetch latest news + sentiment |
| `POST` | `/config/tickers` | Set active portfolio tickers |

## 🔒 Security

- Do not commit `.env` files or `service_account.json`
- Trained model weights (`*.pth`) are gitignored
- Set `ALLOWED_ORIGINS` in Modal secrets for CORS restriction in production
