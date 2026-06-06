# Portal OTP + gated scholarships — manual E2E checklist

Prerequisites: `DATABASE_URL`, `JWT_SECRET`, and `alembic upgrade head` applied through revision **`20260605_0014`** (includes `0007` otp_challenges, lead notification prefs, learning hub unlock, blog_posts). For email delivery configure **SMTP** (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`) or optionally `RESEND_API_KEY`. Without either, OTP codes are logged on the backend console.

**Production (Render):** Build runs `alembic upgrade head`. After deploy, confirm `GET /health` returns `"dbRevision": "20260605_0014"`. If `/api/auth/me` returns **503** or the portal shows “temporarily unavailable”, trigger a **Manual Deploy** on Render and check logs for migration errors (`UndefinedColumn`, missing `otp_challenges`, etc.).

OTP emails are sent as **HTML + plain text** (Paystack-style card). Set `PUBLIC_SITE_URL` so the logo loads from `/email/logo.png` (file in `frontend/public/email/logo.png`). Without `PUBLIC_SITE_URL`, the logo is embedded inline from `backend/app/static/email/logo.png`.

**SMTP notes:** Port `587` + `SMTP_USE_TLS=true` (STARTTLS) is typical. For port `465`, set `SMTP_PORT=465`, `SMTP_USE_SSL=true`, `SMTP_USE_TLS=false`. `OTP_EMAIL_FROM` must be allowed by your SMTP provider (for Gmail, use the same address as `SMTP_USER`).

**Gmail:** Create an [App Password](https://support.google.com/accounts/answer/185833) and set `SMTP_PASSWORD` to that 16-character value (normal Gmail password will fail with `535 BadCredentials`).

**Registered email only:** OTP is sent only if the address exists in the `leads` table (same email used on `/register` or the scholarships register form). Using a different address returns HTTP 200 with a generic message but **no email** — check uvicorn logs for `OTP not sent — no matching registration`.

Restart uvicorn after changing `backend/.env` (settings are loaded at process start).

**Production sign-in (Vercel + Render):** The frontend calls the API on a different domain. You must allow the frontend origin in **`CORS_ORIGINS`** (custom domain) and/or **`CORS_ORIGIN_REGEX`** (e.g. `https://.*\.vercel\.app` for all Vercel preview deploys). Set `PORTAL_COOKIE_SAMESITE=none` and `PORTAL_COOKIE_SECURE=true` on the API host, and include your marketing domain in `CORS_ORIGINS`. Without CORS, the browser blocks `POST /api/auth/otp/request` before the request reaches the API. Without cookie settings, OTP verify may succeed but the session cookie is not sent on later requests, so the portal stays logged out.

**`CORS_ORIGINS` format:** Comma-separated origins only — `scheme://host`, **no trailing slash**, **no path**. Include both apex and `www` if both serve the site, e.g. `https://germanursingpathway.com,https://www.germanursingpathway.com`. After changing env vars on Render, redeploy (or restart) the API so uvicorn reloads settings. On startup, logs should show `CORS allow_origins: [...]` with your production hosts.

### CORS error in console but OTP still works

If sign-in succeeds but DevTools **Console** still shows `No 'Access-Control-Allow-Origin' header` for `otp/request`, the failure is usually **harmless or stale**:

1. **Stale console entry** — Chrome keeps errors until you clear the console or disable “Preserve log”. Clear the console, hard-refresh (`Ctrl+Shift+R`), run OTP once, and check whether a **new** error appears.
2. **Earlier failed attempt** — A click before `CORS_ORIGINS` was fixed, or while Render was cold-starting, can log a CORS error even though a later attempt returned 200.
3. **Render cold start** — The first request after spin-up may get a **502/503** from Render’s edge (no CORS headers). The browser reports that as a CORS failure. Retry after ~30s or click “Send code” again once the service is warm.

**What to verify in the Network tab** (filter: `otp`):

| Request | Expect on success |
|--------|-------------------|
| `OPTIONS …/api/auth/otp/request` (preflight) | Status **200**; response headers include `access-control-allow-origin: https://www.germanursingpathway.com` (or your exact page origin) |
| `POST …/api/auth/otp/request` | Status **200**; same `access-control-allow-origin` header |
| `POST …/api/auth/otp/verify` | Status **200**; `Set-Cookie: portal_session=…` |

If the **successful** POST shows the allow-origin header but Console still lists a failed `otp/request` line (red, often `(failed)` or 502/503), ignore the failed line — it is from an earlier attempt. If the **successful** POST lacks `access-control-allow-origin`, fix `CORS_ORIGINS` on Render and redeploy.

**Not the cause:** The service worker (`frontend/public/sw.js`) ignores `/api/` URLs. OTP uses a single `fetch` per button click (`frontend/src/lib/api/auth.ts`); there is no duplicate `otp/request` from prefetch or analytics.

## Guest (not signed in)

- [ ] `GET /api/auth/me` returns **200** `{"authenticated":false}` (not 503/500 — if you see those, run migrations on the API host).
- [ ] Open `/scholarships` — hero + intro visible; register gate shown; **no** `GET /api/scholarships` in Network tab.
- [ ] Submit register form on `/scholarships` — `POST /api/leads` succeeds; still no scholarship list.
- [ ] Open `/scholarships/{slug}` directly — redirected to `/scholarships` (no detail fetch).
- [ ] `curl` / browser `GET /api/scholarships` without session cookie — **401**.

## OTP request

- [ ] `POST /api/auth/otp/request` with unknown email — **200** generic message; no email / no usable code (check logs only if Resend unset).
- [ ] Same for email **in** `leads` — email sent (or code in server log); rate limit after 3 requests/hour.

## Sign in

- [ ] `POST /api/auth/otp/verify` with valid code — `portal_session` httpOnly cookie set.
- [ ] `GET /api/auth/me` with cookie — `{ email, fullName }`.
- [ ] `/portal` — OTP login UI when logged out; dashboard + scholarship preview when logged in.

## Authenticated

- [ ] `/scholarships` — filters + grid; `GET /api/scholarships` includes cookie (`credentials: include`).
- [ ] `/scholarships/{slug}` — detail loads.
- [ ] `/portal` — scholarship list from same API.

## Logout

- [ ] `POST /api/auth/logout` — cookie cleared; `/scholarships` shows gate again; API list returns **401**.
