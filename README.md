# CGPO // Cognitive Graph Portfolio Optimizer

An agentic AI system for financial analysis, powered by Graph Neural Networks (GNN) and Reinforcement Learning (RL).

## 📁 Project Structure

```
📦 CGPO-Project
├── 📂 backend/         # FastAPI backend (AI engine)
├── 📂 frontend/        # Next.js dashboard
├── 📂 docs/            # Deployment & setup guides
├── 📂 notebooks/       # Colab notebooks (cloud training)
├── 📂 scripts/         # Utility scripts
├── 📂 LogBook/         # Project documentation
├── 📂 experiments/     # Research experiments
├── 📂 tests/           # Test suites
└── 📂 assets/          # Static assets (logo)
```

## Quick Start

### Option 1: Local Development
```powershell
# Run from project root
.\scripts\start.ps1
```

### Option 2: Manual Setup
```bash
# Backend
cd backend && pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

### Option 3: Docker
```bash
docker-compose up --build
```

## 📚 Documentation

| Doc | Description |
|-----|-------------|
| [Deployment Guide](docs/DEPLOYMENT.md) | Full deployment instructions |
| [Quick Deploy](docs/QUICK_DEPLOY.md) | Fast setup guide |

## 🚀 Cloud Training

Use the notebooks in `notebooks/` for GPU-accelerated training on Google Colab:
- `cloud_train.ipynb` - Offline batch training
- `colab_backend.ipynb` - Live backend with ngrok

## URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Security
- Do not commit `service_account.json` or `.env` files
- Model files (`*.pth`) are gitignored
