# CGPO — working notes for whoever's running this session

README.md covers what the system does and how it's used — read that first.
The global `~/.claude/CLAUDE.md` playbook governs how to work (root-cause
fixes, verification before claiming done, git discipline); this file only
adds what's specific to this repo.

## Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4,
  framer-motion. Deployed on Vercel; every push to `main` auto-deploys.
- **Backend**: FastAPI on Modal (T4 GPU), PyTorch + PyTorch Geometric GNN, A2C
  RL agent, yfinance market data. Deploy is **manual**, not push-triggered:
  `PYTHONUTF8=1 python -m modal deploy backend/modal_app.py` from the repo
  root. The `PYTHONUTF8=1` prefix is required on Windows or Modal's console
  output crashes on a Unicode character in the legacy code page.
- **Auth**: Clerk gates only `/dashboard`. The landing page (`/`) is public
  and intentionally has no auth.
- **Tests**: `tests/backend/` (pytest) and `tests/frontend/` — small, not
  comprehensive. No CI is configured; verification before pushing is manual
  (`npx tsc --noEmit` in `frontend/`, run relevant tests directly).

## Hard rules

- Never commit real secrets. `.env*`, `service_account.json`, `*.pth` are
  gitignored — keep it that way.
- `CLERK_SECRET_KEY` must never get a `NEXT_PUBLIC_` prefix — that ships it to
  the browser.
- No `.bat` files anywhere in this repo — confusing to work with, avoid them
  even as a quick fix.
- The backend API has no auth of its own beyond an optional shared
  `X-API-Key` (`CGPO_API_KEY`). Treat every endpoint as public and reachable
  by anyone when reasoning about abuse, cost, or rate limits.

## Repo-specific conventions

- Run `npx tsc --noEmit` in `frontend/` after any TypeScript change, before
  committing. There is no CI — this manual check is the only gate.
- Pushing to `main` deploys the frontend immediately (Vercel). The backend
  never deploys on push; it needs the manual Modal command above.
- Commit types seen in history: feat/fix/chore/perf/docs/redesign.

## Landing page design history — don't regress silently

`frontend/app/page.tsx` went through three redesigns before landing on the
current direction:

1. Dark terminal aesthetic, amber accent — rejected as illegible and the
   wrong tone.
2. Dark navy + electric blue — rejected as "still the same," because only the
   palette changed and the underlying template (dark bg, abstract hero graph,
   card grids) didn't.
3. **Current, accepted**: light mode (`#f7f9ff` background, `#1a56db` royal
   blue accent, `#0d1a38` navy text). The hero's abstract animated graph was
   replaced with a live-looking "Portfolio Allocation" product preview panel
   (real tickers, weight bars, per-asset returns) so the page demonstrates the
   actual product instead of an abstract network metaphor.

If asked to redesign this page again: a palette swap alone will not satisfy
feedback like "still the same" — check whether the page's actual *structure*
is changing, not just its colors, before shipping another iteration.

## Known backend security gaps (audited, not yet fixed)

- `/config/tickers` has no rate limit despite triggering GPU allocation and
  Modal Volume reads on every call.
- `/ai/train` can get stuck permanently "in progress" if the background task
  throws before resetting `is_training` — no `try`/`finally` around it.
- The per-IP rate limiter trusts the first `X-Forwarded-For` value as-is;
  spoofable unless Modal's edge is confirmed to overwrite (not append to)
  that header.
- `episodes` on the training request has no upper bound, so a large value can
  pin the single GPU container for the full Modal timeout.

Fix these before treating the backend as hardened against abuse. Lower-
severity items (`torch.load` without `weights_only=True`, `!=` instead of
`hmac.compare_digest` for the API key check, raw exception text returned to
clients) are cheap wins whenever those files are already being touched.
