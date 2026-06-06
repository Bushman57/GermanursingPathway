# Portal OTP + gated scholarships — manual E2E checklist

Prerequisites: `DATABASE_URL`, `JWT_SECRET`, and `alembic upgrade head` applied through revision **`20260605_0014`** (includes `0007` otp_challenges, lead notification prefs, learning hub unlock, blog_posts). For email delivery configure **SMTP** (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`) or optionally `RESEND_API_KEY`. Without either, OTP codes are logged on the backend console.

**Production (Render):** Build runs `alembic upgrade head`. After deploy, confirm `GET /health` returns `"dbRevision": "20260605_0014"`. If `/api/auth/me` returns **503** or the portal shows “temporarily unavailable”, trigger a **Manual Deploy** on Render and check logs for migration errors (`UndefinedColumn`, missing `otp_challenges`, etc.).

OTP emails are sent as **HTML + plain text** (Paystack-style card). Set `PUBLIC_SITE_URL` so the logo loads from `/email/logo.png` (file in `frontend/public/email/logo.png`). Without `PUBLIC_SITE_URL`, the logo is embedded inline from `backend/app/static/email/logo.png`.

**SMTP notes:** Port `587` + `SMTP_USE_TLS=true` (STARTTLS) is typical. For port `465`, set `SMTP_PORT=465`, `SMTP_USE_SSL=true`, `SMTP_USE_TLS=false`. `OTP_EMAIL_FROM` must be allowed by your SMTP provider (for Gmail, use the same address as `SMTP_USER`).

**Gmail:** Create an [App Password](https://support.google.com/accounts/answer/185833) and set `SMTP_PASSWORD` to that 16-character value (normal Gmail password will fail with `535 BadCredentials`).

**Registered email only:** OTP is sent only if the address exists in the `leads` table (same email used on `/register` or the scholarships register form). Using a different address returns HTTP 200 with a generic message but **no email** — check uvicorn logs for `OTP not sent — no matching registration`.

Restart uvicorn after changing `backend/.env` (settings are loaded at process start).

**Production sign-in (Vercel + Render):** The frontend calls the API on a different domain. Set `PORTAL_COOKIE_SAMESITE=none` and `PORTAL_COOKIE_SECURE=true` on the API host, and include your marketing domain in `CORS_ORIGINS`. Without this, OTP verify may succeed but the session cookie is not sent on later requests, so the portal stays logged out.

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
