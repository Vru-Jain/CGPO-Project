# CGPO // Cognitive Graph Portfolio Optimizer

An agentic AI system for financial analysis, powered by Graph Neural Networks (GNN) and Reinforcement Learning (RL).

## Architecture

This project maps a Full Stack architecture:

-   **Backend (`/backend`)**: Python (FastAPI). Handles data fetching (YFinance), AI Inference (PyTorch Geometric), and Agent Logic.
-   **Frontend (`/frontend`)**: Next.js (React) + Tailwind CSS. A modern "Neo-Bloomberg" terminal for visualizing the market graph and agent decisions.

## Prerequisites

-   **Python 3.10+** (with `virtualenv` recommended)
-   **Node.js 18+**

## Quick Start

The project includes a unified launcher for Windows:

```powershell
./start.ps1
```

This will launch:
1.  **Backend API**: http://localhost:8000
    -   Docs: http://localhost:8000/docs
2.  **Frontend App**: http://localhost:3000

## Manual Setup

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Security
-   Do not commit `service_account.json` or `.env` files.
-   The backend allows CORS `["*"]` for development convenience.
