# German Nursing Pathway

Monorepo layout for separate frontend and backend hosting.

```text
germany-bound/
├── frontend/   # Vite + React (deploy to Vercel)
├── backend/    # FastAPI + Postgres (deploy to Render, Railway, etc.)
└── scripts/    # Shared tooling
```

## Local development

1. **Backend** — copy `backend/.env.example` to `backend/.env`, set `DATABASE_URL` and API keys.

   ```bash
   cd backend
   pip install -r requirements.txt
   alembic upgrade head
   ```

2. **Frontend** — copy `frontend/.env.example` to `frontend/.env` if needed (optional `VITE_API_URL` in dev; Vite proxies `/api` to port 8000).

   ```bash
   cd frontend
   npm install
   ```

3. **From repo root** — run both:

   ```bash
   npm install
   npm run dev:all
   ```

   - Site: http://localhost:8080  
   - API: http://127.0.0.1:8000  
   - Health: http://127.0.0.1:8000/health  

Other root scripts: `npm run build`, `npm run db:migrate`, `npm run export:scholarships`, `npm run lint`.

## Deploy frontend (Vercel)

| Setting | Value |
|---------|--------|
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm ci` |

**Environment variable (required for chat, leads, payments):**

```env
VITE_API_URL=https://api.germanursingpathway.com
```

Use your real API host (no trailing slash). Without this, `/api/*` requests hit the static site and fail (405 / HTML instead of JSON).

**Custom domain:** point `germanursingpathway.com` (and `www` if used) to Vercel.

## Deploy backend (API host)

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Start command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

Optional (gunicorn + uvicorn workers): `gunicorn app:create_app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --workers 2` — requires `gunicorn` in `requirements.txt`.

**Important:** Set **Root Directory** to `backend`. Do not commit a pip-freeze `requirements.txt` without `gunicorn` if your start command uses gunicorn.

Set at minimum:

```env
DATABASE_URL=postgresql://...
CORS_ORIGINS=https://germanursingpathway.com,https://www.germanursingpathway.com,http://localhost:8080
```

For M-Pesa STK Push, see `backend/.env.example` (KCB keys, `KCB_CALLBACK_BASE_URL` = this API’s public HTTPS base, `PAYMENT_AMOUNT_KES`).

Run migrations on deploy: `alembic upgrade head`.

**Recommended DNS:** `api.germanursingpathway.com` → API host; marketing domain → Vercel.

## Sync scholarship data

After editing `frontend/src/lib/scholarships.ts`:

```bash
npm run export:scholarships
```

Writes `backend/data/scholarships.json` for the chat service.

Load that file into Postgres (`scholarships` table):

```bash
npm run db:load-scholarships
```

Options (from `backend/`): `--dry-run`, `--prune-stale` (remove DB rows not in JSON), `--file path/to.json`.
