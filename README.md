# CGPO — Cognitive Graph Portfolio Optimizer

An agentic AI system for financial portfolio optimization, powered by **Graph Neural Networks (GNN)** and **Reinforcement Learning (RL)**. The agent builds a live market graph, runs inference to allocate portfolio weights, and competes against major US & Indian benchmarks.

## 🏗️ Architecture

```
Browser (Vercel)  ──►  Next.js Frontend  ──►  FastAPI Backend (Modal GPU)
                       │                         │
                  Landing Page (/)          API Key Auth (X-API-Key)
                  Dashboard (/dashboard)    Security Headers
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
│   ├── main.py               # FastAPI app (endpoints + API key auth)
│   ├── modal_app.py          # Modal cloud deployment config (GPU)
│   └── requirements.txt      # Python dependencies
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Landing page (hero + features)
│   │   └── dashboard/
│   │       └── page.tsx      # Main AI dashboard
│   ├── components/
│   │   ├── Sidebar.tsx       # Responsive sidebar (mobile/tablet/desktop)
│   │   ├── ComparisonChart.tsx # Benchmark chart (S&P, Nifty, Sensex...)
│   │   ├── GraphModule.tsx   # Neural asset graph visualisation
│   │   ├── MetricsPanel.tsx  # Sharpe ratio, volatility, return cards
│   │   ├── ExecutionLog.tsx  # Live backend execution trace
│   │   ├── TickerModal.tsx   # Custom portfolio ticker input
│   │   └── backend-connection-manager.tsx  # Backend URL + health check
│   ├── lib/
│   │   └── api.ts            # API fetch wrapper (key injection + timeout)
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
# → http://localhost:3000 (landing page)
# → http://localhost:3000/dashboard (AI dashboard)
```

### Deploy Backend to Modal
```bash
# One-time setup
pip install modal
modal token new

# Create API key secret
modal secret create cgpo-secrets CGPO_API_KEY=your-secret-key

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
| **Landing Page** | [cgpo-project.vercel.app](https://cgpo-project.vercel.app) |
| **Dashboard** | [cgpo-project.vercel.app/dashboard](https://cgpo-project.vercel.app/dashboard) |
| **Backend API** | `https://vrushabhjain2016--cgpo-backend-serve.modal.run` |
| **API Docs** | `.../docs` (FastAPI Swagger) |
| **Modal Dashboard** | [modal.com/apps/vrushabhjain2016](https://modal.com/apps/vrushabhjain2016/main/deployed/cgpo-backend) |

## 🔐 Environment Variables

### Modal (backend)
| Variable | Purpose |
|----------|---------|
| `CGPO_API_KEY` | API key for authenticating frontend requests |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins (optional) |

### Vercel / `.env.local` (frontend)
| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_KEY` | Must match `CGPO_API_KEY` above |
| `NEXT_PUBLIC_BACKEND_URL` | Modal backend URL |

## 🧠 Key Features

- **Landing Page** — Professional hero section with project overview, feature grid, and architecture diagram
- **Neural Asset Graph** — Stocks become nodes, correlations become edges; the GNN reads this graph to infer portfolio allocation
- **RL Agent Training** — A2C-style training with Sharpe-ratio-based reward; train directly from the dashboard
- **Multi-Benchmark Comparison** — AI portfolio vs S&P 500, Nasdaq, Dow Jones, Nifty 50, Sensex
- **Beats the Market Alert** — 🏆 Toast fires automatically when the AI outperforms the benchmark
- **Portfolio Presets** — One-click presets: Tech Giants, Crypto, Finance, Healthcare, Energy, **India Bluechips**, **India IT**
- **Live Signal Intelligence** — Real-time news with sentiment (POS/NEG/NEU) for each asset
- **Responsive Design** — Mobile drawer, tablet icon-strip, desktop full sidebar
- **API Key Authentication** — All non-public endpoints require `X-API-Key` header

## 📦 Backend API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ❌ | Service info |
| `GET` | `/health` | ❌ | Health check |
| `GET` | `/docs` | ❌ | Swagger docs |
| `POST` | `/ai/inference` | ✅ | Run portfolio inference |
| `POST` | `/ai/train` | ✅ | Start background training |
| `GET` | `/ai/training-status` | ✅ | Poll training progress |
| `GET` | `/market/benchmark` | ✅ | Fetch benchmark returns |
| `GET` | `/market/news` | ✅ | Fetch latest news + sentiment |
| `POST` | `/config/tickers` | ✅ | Set active portfolio tickers |
| `GET` | `/system/logs` | ✅ | Execution trace logs |

## 🔒 Security

- **API Key Auth** — All protected endpoints require `X-API-Key` header
- **HTTP Security Headers** — `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Cache-Control`
- **CORS Locked** — Only `GET`/`POST` methods, scoped headers
- **15s Request Timeout** — Frontend aborts hanging requests to prevent GPU waste
- `.env` files and `service_account.json` are gitignored
- Trained model weights (`*.pth`) are gitignored
