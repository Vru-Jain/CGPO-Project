# Deployment Guide for CGPO Application

This guide covers deploying both the **Next.js frontend** and **FastAPI backend** to production.

## Architecture

- **Frontend**: Next.js app (deploy to Vercel)
- **Backend**: FastAPI app (deploy to Railway/Render/Fly.io)

---

## Option 1: Vercel (Frontend) + Railway (Backend) - Recommended

### Step 1: Deploy Backend to Railway

1. **Sign up/Login** to [Railway](https://railway.app)
2. **Create New Project** → "Deploy from GitHub repo"
3. **Select your repository** and choose the `backend` folder as the root
4. Railway will auto-detect the Dockerfile
5. **Set Environment Variables** (if needed):
   - `PORT=8000` (Railway sets this automatically)
6. **Deploy** → Railway will build and deploy
7. **Copy the public URL** (e.g., `https://your-app.up.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. **Sign up/Login** to [Vercel](https://vercel.com)
2. **Import your GitHub repository**
3. **Configure Project**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. **Environment Variables**:
   - `NEXT_PUBLIC_BACKEND_URL`: Set to your Railway backend URL (e.g., `https://your-app.up.railway.app`)
5. **Deploy** → Vercel will build and deploy

### Step 3: Update Vercel Rewrites

After deployment, update `vercel.json` (or use Vercel dashboard):
- Replace `YOUR_BACKEND_URL` with your actual Railway URL
- Redeploy if needed

---

## Option 2: Vercel (Frontend) + Render (Backend)

### Step 1: Deploy Backend to Render

1. **Sign up/Login** to [Render](https://render.com)
2. **New** → **Web Service**
3. **Connect GitHub** and select your repo
4. **Configure**:
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Set Environment Variables**:
   - `PORT`: Auto-set by Render
6. **Deploy** → Copy the public URL

### Step 2: Deploy Frontend to Vercel

Same as Option 1, Step 2, but use your Render backend URL.

---

## Option 3: Docker Compose (Self-Hosted)

If you have a VPS/server:

```bash
# Clone repo
git clone <your-repo>
cd <repo-name>

# Build and run
docker-compose up -d
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_BACKEND_URL=http://backend:8000
    depends_on:
      - backend
    restart: unless-stopped
```

---

## Environment Variables

### Backend (Railway/Render)
- `PORT`: Usually auto-set by platform
- `ALLOWED_ORIGINS`: Comma-separated list of frontend URLs (e.g., `https://your-app.vercel.app,https://www.yourdomain.com`)
  - If not set, defaults to `*` (allows all origins - OK for dev, restrict in production)

### Frontend (Vercel)
- `NEXT_PUBLIC_BACKEND_URL`: Your backend public URL

---

## Post-Deployment Checklist

- [ ] Backend is accessible (test `/health` endpoint)
- [ ] Frontend can reach backend (check browser console)
- [ ] CORS is configured correctly (backend allows frontend domain)
- [ ] Environment variables are set
- [ ] SSL/HTTPS is enabled (both platforms do this automatically)

---

## Troubleshooting

### CORS Issues
If you see CORS errors, set the `ALLOWED_ORIGINS` environment variable in your backend platform:
- **Railway/Render**: Add `ALLOWED_ORIGINS=https://your-frontend.vercel.app` to environment variables
- The backend will automatically use this to restrict CORS to your frontend domain

### Backend Not Found
- Check `NEXT_PUBLIC_BACKEND_URL` is set correctly in Vercel
- Verify backend URL is publicly accessible
- Check Railway/Render logs for errors

### Build Failures
- Check `requirements.txt` for all dependencies
- Ensure Python version matches (3.11 recommended)
- Check build logs in deployment platform

---

## Quick Deploy Commands

### Railway CLI
```bash
railway login
railway init
railway up
```

### Vercel CLI
```bash
npm i -g vercel
cd frontend
vercel
```

---

## Notes

- **Free Tiers**: Both Vercel and Railway offer free tiers suitable for development/testing
- **Cold Starts**: Railway/Render may have cold starts on free tier
- **Model Files**: Ensure `backend/models/agent.pth` is committed or uploaded separately
- **Rate Limits**: yfinance API calls are rate-limited; caching helps but monitor usage
