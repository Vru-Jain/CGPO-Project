# Quick Deploy Guide

## Fastest Path to Production (5 minutes)

### 1. Deploy Backend (Railway - Free Tier)

```bash
# Option A: Via Railway Dashboard
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo, set root directory to `backend`
4. Railway auto-detects Dockerfile
5. Deploy → Copy the public URL (e.g., https://xxx.up.railway.app)
```

```bash
# Option B: Via Railway CLI
npm i -g @railway/cli
railway login
railway init
railway up
railway domain  # Get your public URL
```

### 2. Deploy Frontend (Vercel - Free Tier)

```bash
# Option A: Via Vercel Dashboard
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repo
4. Set Root Directory: `frontend`
5. Add Environment Variable:
   - Key: NEXT_PUBLIC_BACKEND_URL
   - Value: <your-railway-backend-url>
6. Deploy
```

```bash
# Option B: Via Vercel CLI
npm i -g vercel
cd frontend
vercel
# Follow prompts, set NEXT_PUBLIC_BACKEND_URL when asked
```

### 3. Update Backend CORS (Optional but Recommended)

In Railway dashboard, add environment variable:
- `ALLOWED_ORIGINS`: `https://your-frontend.vercel.app`

Redeploy backend.

---

## That's It! 🚀

Your app should now be live:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.up.railway.app`

---

## Test Your Deployment

1. Visit your Vercel frontend URL
2. Open browser console (F12)
3. Click "RUN INFERENCE"
4. Check that:
   - Graph loads
   - Execution logs appear
   - No CORS errors in console

---

## Common Issues

**Backend not connecting?**
- Check `NEXT_PUBLIC_BACKEND_URL` is set correctly in Vercel
- Verify backend URL is accessible (try `/health` endpoint)

**CORS errors?**
- Add `ALLOWED_ORIGINS` env var in Railway with your Vercel URL

**Build fails?**
- Check Railway/Vercel build logs
- Ensure all dependencies are in `requirements.txt` / `package.json`
