# Paystack program payment

Homepage **Pay now** uses Paystack (card + M-Pesa). KCB direct STK has been removed.

## Environment (`backend/.env`)

```env
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_CALLBACK_BASE_URL=https://your-public-api-host
PAYMENT_AMOUNT_KES=235600
PAYMENT_CURRENCY_LABEL=KES
PUBLIC_SITE_URL=http://localhost:8080
```

- `PAYSTACK_CALLBACK_BASE_URL` must be the **API** origin (where uvicorn runs), reachable over HTTPS in production.
- `PUBLIC_SITE_URL` is the **frontend** origin (browser redirect after Paystack).
- Paystack dashboard → Settings → Webhooks:  
  `https://<api-host>/api/payments/paystack/webhook`

## Frontend checkout flow (required)

1. User submits email + M-Pesa phone → `POST /api/payments/initialize`
2. Backend calls Paystack `transaction/initialize` and returns `access_code` + `reference`
3. Frontend closes the payment dialog and calls **`PaystackPop.resumeTransaction(access_code)`** — do **not** use `newTransaction()` with a duplicate client-side amount/reference
4. On `onSuccess` → `POST /api/payments/verify` with `reference`
5. Show success toast + reopen dialog with confirmation UI

If the user completes checkout via Paystack redirect, the API sends them to `{PUBLIC_SITE_URL}/?payment=GNP-...`. The homepage verifies that reference and shows the same success feedback.

## Local testing

1. `alembic upgrade head` (includes `20260604_0009` paystack columns).
2. Restart uvicorn and the Vite dev server after `.env` changes.
3. For webhooks locally, expose port 8000 (e.g. `ngrok http 8000`) and set `PAYSTACK_CALLBACK_BASE_URL` to the ngrok URL.
4. Open the site → Investment section → **Pay now** → enter email + M-Pesa number.
5. Paystack popup should be fully interactive (no Radix dialog overlay on top).
6. Complete M-Pesa (Mobile Money) or card test checkout.
7. Expect: toast “Payment confirmed”, dialog success screen with reference.
8. Test card: `4084084084084081`, any future expiry, CVV `408`, PIN `0000` (Paystack docs).

### Manual checklist

| Step | Expected |
|------|----------|
| Click Pay | Toast “checkout opened”, dialog closes, Paystack popup clickable |
| M-Pesa in Paystack | Phone field editable, STK prompt on device |
| Payment success | `POST /verify` 200, success toast, dialog shows reference |
| Cancel Paystack | Error toast, dialog reopens with form |
| `/?payment=GNP-...` return | Auto-verify, success or error toast, query param cleared |

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/payments/config` | Amount + public key |
| POST | `/api/payments/initialize` | `{ "email", "phone" }` → `access_code`, `reference` |
| POST | `/api/payments/verify` | `{ "reference": "GNP-..." }` |
| POST | `/api/payments/paystack/webhook` | Paystack events |
| GET | `/api/payments/paystack/callback` | Redirect to `PUBLIC_SITE_URL/?payment=ref` |
| GET | `/api/payments/status/{id}` | Poll status by payment UUID |
| GET | `/api/payments/initialize` | Returns 405 — use POST with `email` and `phone` |

## Stale Render deploy (symptoms)

If production OpenAPI at `https://<host>/openapi.json` lists `/api/payments/stk` but **not** `/api/payments/initialize` or `/api/auth/otp/request`, Render is running an old commit. Symptoms:

- OTP: `POST /api/auth/otp/request` → **404** `Not Found` (not “email not registered”)
- Pay: `POST /api/payments/initialize` → **405** Method Not Allowed

Fix: push latest `main`, trigger **Manual Deploy** on Render (root dir `backend`, build runs `alembic upgrade head`), then rebuild the frontend.

## Production deploy (Render + Vercel)

**Render (API)** — set at minimum:

- `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_CALLBACK_BASE_URL=https://<your-render-host>` (HTTPS, no path suffix)
- `PAYMENT_AMOUNT_KES`, `DATABASE_URL`, `CORS_ORIGINS` (include your Vercel/marketing origins)
- `PUBLIC_SITE_URL` = frontend URL (Paystack browser redirect)
- Build: `alembic upgrade head` then start uvicorn

**Vercel (frontend)** — required:

```env
VITE_API_URL=https://<your-render-host>
```

Use **HTTPS**. If `VITE_API_URL` is missing, Pay now posts to the static site and fails. If it uses `http://`, redirects can turn POST into GET and hit the wrong route.

After deploy, verify:

```bash
curl -X POST "https://<api-host>/api/payments/initialize" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phone":"0712345678"}'
```

Expect JSON with `access_code` (or 503 if Paystack keys missing), not `uuid_parsing` or 405 with `allow: GET`.
