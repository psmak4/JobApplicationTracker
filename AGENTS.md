# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-27
**Commit:** 7718229
**Branch:** main

## OVERVIEW

Full-stack job application tracker with React 19 frontend (Vite) and Express 5 backend. PostgreSQL + Drizzle ORM. Better Auth for authentication.

## STRUCTURE

```
./
├── api/                 # Express backend (port 4000)
│   └── src/
│       ├── index.ts     # Entry point
│       ├── db/          # Drizzle schema
│       ├── routes/      # API endpoints
│       ├── controllers/
│       ├── services/    # Business logic (parsers, notifications)
│       └── middleware/  # Auth, rate limiting
├── ui/                  # React frontend (port 5173)
│   ├── index.html       # Static landing page
│   ├── app.html         # SPA shell (mounts at /app)
│   └── src/
│       ├── App.tsx      # Router with /app basename
│       ├── pages/       # Dashboard, Pipeline, Archive, Auth
│       ├── components/  # shadcn/ui + custom
│       ├── hooks/       # React Query hooks
│       └── lib/         # API client, utils, schemas
└── e2e/                 # Playwright tests
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add new API route | `api/src/routes/` | Register in `api/src/index.ts` |
| Add frontend page | `ui/src/pages/` | Add route in `ui/src/App.tsx` |
| Add shadcn component | `ui/src/components/ui/` | Use `npx shadcn@latest add` |
| Database schema | `api/src/db/schema.ts` | Run `npm run db:push` after changes |
| Auth config | `api/src/auth.ts` | Better Auth server setup |
| Constants/statuses | `ui/src/constants/index.ts` | Use instead of hardcoding |

## CODE MAP

| Symbol | Type | Location | Role |
|--------|------|----------|------|
| api/src/index.ts | server | api:4000 | Express bootstrap |
| ui/src/App.tsx | component | ui:/app | React Router entry |
| db/schema.ts | schema | api:db | Drizzle tables |

## CONVENTIONS

- **Type Safety:** Extend Express Request in `api/src/types/express.d.ts`. NEVER use `(req as any)`.
- **Imports:** Use `@/` alias in frontend (e.g., `@/components/ui`), NOT relative paths.
- **Constants:** Use `APPLICATION_STATUS_OPTIONS` and `WORK_TYPE_OPTIONS` from `ui/src/constants/index.ts`.
- **Query Keys:** Use centralized `queryKeys` from `ui/src/lib/queryKeys.ts`.
- **Form Validation:** Use shared Zod schemas from `ui/src/lib/schemas.ts`.
- **Prettier:** `singleQuote: true`, `semi: false`.

## ANTI-PATTERNS (THIS PROJECT)

- DO NOT hardcode application statuses — use centralized constants
- DO NOT use relative imports in frontend — use `@/` alias
- DO NOT use `(req as any)` — extend Request type properly
- All React hooks MUST be called before conditional returns

## UNIQUE STYLES

- **MPA/SPA Hybrid:** Landing page (`index.html`) is static MPA; app (`app.html`) is React SPA mounted at `/app`.
- **Rate Limiting:** Auth routes: 5 req/15min (strict). Create/Update: 20 req/min.
- **Status Tracking:** Direct status on application model (status_history table deprecated).
- **Dark Mode:** Via `.dark` class and oklch variables in `ui/src/index.css`.

## COMMANDS

```bash
# Backend
cd api && npm install && npm run dev     # Dev server (4000)
cd api && npm run db:push                 # Push schema
cd api && npm run db:studio               # Drizzle Studio
cd api && npm test                        # Run tests

# Frontend
cd ui && npm install && npm run dev      # Dev server (5173)
cd ui && npm run build                    # Production build

# E2E
cd e2e && npm install && npm run test    # Playwright tests
```

## NOTES

- Auth requires `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` in api/.env
- Admin access: add user ID to `ADMIN_USER_IDS` in .env
- Calendar sync via Google OAuth — requires `calendar_events` table
- Job parser supports Glassdoor + generic pages (SSRF protected)
