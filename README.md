# CGPO — Cognitive Graph Portfolio Optimizer

CGPO is a research and demonstration system for data-driven portfolio
allocation. It models a universe of stocks as a graph, where each asset is a
node and statistically correlated assets are connected by edges, and uses a
graph neural network (GNN) together with a reinforcement-learning (RL) agent to
decide how to weight the portfolio. The agent is trained to outperform a chosen
market benchmark, and every allocation it produces is shown alongside the
reasoning, the live market graph, and a side-by-side comparison against major
US and Indian indices.

The project is a full-stack application: a Next.js web client deployed on
Vercel, and a FastAPI inference/training service deployed on Modal with a GPU.

---

## What the system does

- **Builds a market graph.** For a selected set of tickers, CGPO downloads
  recent price history, computes per-asset features (return, volatility,
  momentum, RSI), and connects assets whose returns are correlated. This graph
  is the input to the model.
- **Allocates the portfolio.** A graph neural network reads the graph and
  produces a per-asset score; these scores become portfolio weights. The
  allocation is deterministic at inference time, so the same market state always
  yields the same weights.
- **Learns to beat a benchmark.** An Advantage Actor-Critic (A2C) agent is
  rewarded for excess return over a benchmark (for example the S&P 500), with a
  volatility penalty discouraging erratic allocations. Training runs on the GPU
  and the resulting model is persisted so it survives restarts.
- **Explains and compares.** The dashboard surfaces the agent's top allocations
  and reductions with plain-language reasoning, renders the asset graph, reports
  expected return / volatility / Sharpe ratio, and charts the portfolio against
  benchmarks across multiple time windows.

This is a demonstration of the approach, not investment advice.

---

## Who it is for and how it is used

CGPO is intended for people evaluating the GNN-plus-RL approach to allocation:
researchers, reviewers of the accompanying paper, and technical readers who want
to interact with the model directly. The typical workflow is:

1. **Open the site.** The public landing page explains the system and links to
   the dashboard.
2. **Sign in.** The dashboard is gated behind authentication (Clerk), so using
   the tool requires an account. The landing page remains public.
3. **Choose an asset universe.** Pick a built-in preset (for example Tech
   Giants, Finance, Healthcare, India Bluechips) or enter a custom set of
   tickers.
4. **Run inference.** The agent produces portfolio weights, the asset graph, and
   risk/return metrics for the current market state.
5. **Train (optional).** Trigger a training run from the dashboard. Training
   executes on the GPU backend, reports live progress, and refreshes the
   allocation when it completes. The trained model is saved and reused on
   subsequent visits.
6. **Compare.** Switch benchmarks (S&P 500, Nasdaq 100, Dow Jones, Nifty 50,
   Sensex) and time ranges to see how the portfolio tracks against the market.

---

## Architecture

```
Browser ──► Next.js frontend (Vercel) ──► FastAPI backend (Modal, T4 GPU)
            - Public landing page (/)        - Per-IP rate limiting
            - Auth-gated dashboard            - Optional API-key check
              (/dashboard, Clerk)             - Security headers, CORS
                                              │
                                  ┌───────────┼────────────┐
                              GNN engine   A2C agent    Market data
                            (PyTorch        (reward =    (yfinance prices,
                             Geometric +     excess        news + sentiment)
                             NetworkX)       return)
                                              │
                                       Modal Volume
                                  (persists trained weights
                                   across cold starts)
```

The backend scales to zero when idle and cold-starts on demand. Trained weights
are written to a Modal Volume so they persist between container restarts.

---

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| UI / charts | Radix UI, Recharts, Framer Motion |
| Auth | Clerk (gates the dashboard) |
| Analytics | Vercel Web Analytics |
| Backend | FastAPI, Uvicorn (ASGI) |
| ML | PyTorch, PyTorch Geometric (GCN), Gymnasium, NetworkX |
| Market data | yfinance, TextBlob (news sentiment), `ta` (indicators) |
| Hosting | Vercel (frontend), Modal with a T4 GPU (backend) |

---

## Project structure

```
CGPO-Project/
├── backend/
│   ├── core/
│   │   ├── agent.py            # A2C agent (training loop, deterministic readout)
│   │   ├── data_loader.py      # yfinance price/news fetch with caching + retries
│   │   ├── graph_engine.py     # Graph construction + cross-sectional features
│   │   ├── market_env.py       # Gymnasium env (reward, precomputed observations)
│   │   └── models.py           # GNN policy/value network (GCN + skip connection)
│   ├── main.py                 # FastAPI app: endpoints, auth, rate limiting
│   ├── modal_app.py            # Modal deployment (image, GPU, Volume, secrets)
│   ├── requirements.txt        # Full Python dependencies (local/dev)
│   ├── requirements-modal.txt  # Slimmed dependency set baked into the container
│   └── requirements-dev.txt    # Local deploy tooling (the modal CLI)
├── frontend/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (ClerkProvider, analytics, fonts)
│   │   ├── page.tsx            # Public landing page
│   │   └── dashboard/page.tsx  # Authenticated dashboard
│   ├── components/             # Header, Sidebar, charts, graph, metrics, logs
│   ├── hooks/                  # useAgentInsights, market region, etc.
│   ├── lib/api.ts              # Fetch wrapper (key injection, 15s timeout)
│   └── proxy.ts                # Clerk route protection for /dashboard
├── docs/                       # Deployment and design notes
└── README.md
```

---

## Getting started (local development)

### Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local   # then fill in the values (see Environment variables)
npm run dev
# Landing page:  http://localhost:3000
# Dashboard:     http://localhost:3000/dashboard
```

The dashboard requires Clerk keys. Without them the build/runtime will report a
missing publishable key; populate `frontend/.env.local` first.

### Backend

The production backend runs on Modal. To iterate locally without the GPU:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Then point the frontend at the local backend by setting
`NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000` (or via the sidebar connection
settings).

---

## Deployment

### Frontend (Vercel)

The frontend deploys automatically on every push to `main`. Before the first
deploy, set the environment variables below in the Vercel project settings
(scope: All Environments), or the build will fail on the missing Clerk keys.

### Backend (Modal)

The backend is deployed manually; a `git push` does not redeploy it.

```bash
# One-time setup
pip install -r backend/requirements-dev.txt   # installs the modal CLI
python -m modal token new
python -m modal secret create cgpo-secrets CGPO_API_KEY=your-key

# Deploy (from the repository root)
python -m modal deploy backend/modal_app.py
```

On Windows, prefix the deploy command with `PYTHONUTF8=1` so Modal's console
output does not fail on a Unicode character in the legacy code page:

```bash
PYTHONUTF8=1 python -m modal deploy backend/modal_app.py
```

---

## Environment variables

A complete template is provided in `.env.example`. Copy it to
`frontend/.env.local` for local development; set the same values in Vercel for
production. Never commit real keys.

### Frontend (Vercel / `frontend/.env.local`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | Yes | Modal backend URL the client calls |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key (public by design) |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key (server-side only; no `NEXT_PUBLIC_` prefix) |
| `NEXT_PUBLIC_API_KEY` | Optional | Sent as `X-API-Key`; must match the backend key |

### Backend (Modal secret `cgpo-secrets`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `CGPO_API_KEY` | Optional | If set, non-public endpoints require a matching `X-API-Key` |
| `ALLOWED_ORIGINS` | Optional | Comma-separated CORS origins (defaults to `*`) |

`CGPO_MODEL_DIR` and `CGPO_MODEL_VOLUME` are configured in `modal_app.py` and
back the Modal Volume that persists the trained model; they are not set by hand.

---

## API reference

Base URL: the Modal deployment URL.

| Method | Endpoint | Notes |
| --- | --- | --- |
| `GET` | `/` | Service info (public) |
| `GET` | `/health` | Health check (public) |
| `GET` | `/docs` | Swagger UI (public) |
| `POST` | `/ai/inference` | Run portfolio inference. Rate limited to 60/min per IP |
| `POST` | `/ai/train` | Start a background training run. Rate limited to 3/hour per IP |
| `GET` | `/ai/training-status` | Poll training progress |
| `GET` | `/market/benchmark` | Benchmark performance for a ticker and period |
| `GET` | `/market/news` | Latest news with sentiment per asset |
| `POST` | `/config/tickers` | Set the active asset universe (blocked during training) |
| `GET` | `/system/logs` | Recent backend execution trace |

When `CGPO_API_KEY` is configured, all endpoints except the public ones require
a matching `X-API-Key` header. When it is unset, that check is skipped.

---

## Security

- **Authentication.** The dashboard route is gated by Clerk; the landing page is
  public.
- **Rate limiting.** The GPU-backed endpoints (`/ai/train`, `/ai/inference`) are
  throttled per client IP to limit abuse and cost, since the backend URL is
  public.
- **Optional API key.** A shared `X-API-Key` can be required on non-public
  endpoints. Note that any key exposed to the browser (a `NEXT_PUBLIC_` value)
  is not a true secret and serves only as a light deterrent.
- **Transport hardening.** Responses set `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, and `Cache-Control`; CORS is restricted
  to `GET`/`POST` with a scoped set of headers.
- **Secret handling.** `.env*` files, `service_account.json`, and trained model
  weights (`*.pth`) are gitignored.

---

## Disclaimer

CGPO is a research and demonstration project. It does not constitute financial
advice, and its outputs should not be used to make investment decisions.
