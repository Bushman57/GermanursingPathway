# Chat prompts

Edit the markdown files in this folder to change assistant behavior without changing Python code.

## Layout

| Path | Used by |
|------|---------|
| `pathway/system_rules.md` | Landing page Q&A bot |
| `pathway/knowledge.md` | Facts injected into pathway bot |
| `scholarship/system_rules.md` | Scholarship assistant |

Scholarship program data lives in `../data/scholarships.json` (sync from `frontend/src/lib/scholarships.ts` via `npm run export:scholarships` at repo root). Load into Postgres with `npm run db:load-scholarships`.

## Local testing

1. Start API: `npm run dev:api` from repo root
2. Change a `.md` file
3. With `PROMPT_RELOAD=true` in `backend/.env`, changes apply on the next message
