# Users table vs leads table

This document describes how candidate identity and profile data are stored and updated in the German Nursing Pathway stack.

## Executive summary

| | **leads** | **users** |
|---|-----------|-----------|
| Updated by app? | Yes | No — no INSERT/UPDATE/SELECT in application code |
| Portal sign-in | Email must exist in `leads` | Not used |
| Profile in UI | Source of truth | N/A |
| Auth mechanism | Email in JWT (`sub`) + OTP | Designed for `password_hash` (unused) |

The student portal does **not** use the `users` table. Portal “users” are **email + JWT cookie**, backed by a **`leads`** row.

## Database verification (dev)

Counts from the configured `DATABASE_URL` (run via app session helpers):

| Table | Row count |
|-------|-----------|
| `leads` | 2 |
| `users` | 0 |
| `candidates` | 0 |
| `otp_challenges` | 8 |
| Distinct emails in `leads` | 2 |

`users` is empty; all portal activity is tied to `leads` and `otp_challenges`.

To re-check locally:

```bash
cd backend
./schorlaship_env/Scripts/python.exe -c "
from app.config import get_settings
from app.db.session import _normalize_database_url
from sqlalchemy import create_engine, text
e = create_engine(_normalize_database_url(get_settings().database_url))
with e.connect() as c:
    for t in ('leads', 'users', 'candidates', 'otp_challenges'):
        print(t, c.execute(text(f'SELECT COUNT(*) FROM {t}')).scalar())
"
```

## Schema

Defined in `backend/app/db/models.py` and created by `backend/alembic/versions/20260518_0001_initial_schema.py`.

### `leads` — registration / CRM

- Profile: `full_name`, `email`, `phone`, `nursing_qualification`, `german_level`, `timeline`, `message`
- Meta: `source`, `locale`, `status`, `whatsapp_joined`, `created_at`, `updated_at`
- **No unique constraint on `email`** — multiple rows per email are allowed; APIs use the **latest** row (`ORDER BY created_at DESC`).

### `users` — password account stub (unused)

- `email` (unique), `password_hash`, `role` (default `candidate`)
- No profile columns; never written by current routers.

### `candidates` — bridge table (unused)

- `lead_id` → `leads.id`, `user_id` → `users.id`, `full_name`, `email`
- Intended to link a lead to a login account; no application code writes here yet.

## How `leads` is updated

```
Register form  →  POST /api/leads           →  INSERT leads
Portal settings → PATCH /api/portal/profile →  UPDATE latest lead (name, phone, german_level)
OTP request     →  checks lead_exists(email)  →  READ leads
OTP verify      →  JWT sub = email           →  no users row
```

### Create — register

- Frontend: `frontend/src/components/register/RegisterInterestForm.tsx` → `POST /api/leads`
- Backend: `backend/app/routers/leads.py`
- `nursing_qualification` defaults to `unspecified` when omitted (see `backend/app/models/lead.py`).

### Update — portal profile

- Frontend: `frontend/src/components/portal/PortalSettings.tsx`
- Backend: `backend/app/routers/portal.py` — updates latest lead for the session email.
- Avatars: filesystem under `backend/uploads/portal/` (not in `users` or `leads`).
- Notification prefs: browser `localStorage` (`frontend/src/lib/portalPrefs.ts`), not persisted server-side.

### Read — auth

- `backend/app/services/otp_service.py` — `lead_exists()`, `latest_lead_profile()`
- `backend/app/routers/auth.py` — OTP + JWT cookie; `GET /api/auth/me`
- `backend/app/deps/portal_auth.py` — `PortalUser` holds **email only**, not `users.id`.

## How `users` is updated

**It is not.** The `User` model is never used in routers or services. Admin CMS auth uses `ADMIN_API_SECRET` (Bearer), not `users.password_hash` (`backend/app/deps/auth.py`).

## Auth comparison

| Actor | Auth | DB identity |
|--------|------|-------------|
| Student / portal | Email OTP + HTTP-only JWT | `leads.email`, `otp_challenges` |
| Admin CMS | `ADMIN_API_SECRET` Bearer | None (env) |
| Planned password users | `password_hash` on `users` | Not implemented |

## Architecture decision

**Decision: A — Keep as-is (leads as candidate source of truth).**

- Portal and registration continue to use `leads` only.
- `users` and `candidates` remain schema placeholders until a deliberate password-account or sync feature is scoped.
- Rationale: OTP portal is live; empty `users` does not block sign-in; avoids migration risk and duplicate profile stores.

Future options if requirements change:

- **B — Sync on OTP verify:** Upsert `users` + `candidates` on first successful OTP; keep editable profile on `leads`.
- **C — Consolidate:** Move profile fields off `leads` into `candidates`/`users` and migrate reads/writes.

## Practical notes for developers

1. Portal profile edits update **`leads`**, not `users`.
2. OTP requires a **`leads`** row with the same email as registration.
3. Re-registering the same email creates a **new** lead row; profile APIs follow the newest row.
4. Do not expect `SELECT * FROM users` to reflect portal activity.
