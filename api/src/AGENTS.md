# API Source

Express 5 backend with Drizzle ORM + Better Auth.

## STRUCTURE

```
src/
├── index.ts           # Express bootstrap (port 4000)
├── auth.ts            # Better Auth server config
├── db/
│   ├── schema.ts      # Drizzle tables
│   └── index.ts       # DB connection
├── routes/            # API endpoints
│   ├── applications.ts
│   ├── calendar.ts
│   ├── events.ts
│   ├── notes.ts
│   ├── parser.ts
│   └── admin.ts
├── controllers/       # Business logic (applications, events, notes, parser)
├── services/         # Parsers, notifications
├── middleware/       # auth, rateLimiter, errorHandler, requireAdmin
├── config/           # env, logger
├── utils/            # responses, request, htmlEscape
├── types/            # express.d.ts (Request extension)
└── emails/           # Email templates
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| New endpoint | `src/routes/` | Register in `index.ts` |
| Schema change | `src/db/schema.ts` | Run `npm run db:push` |
| Auth config | `src/auth.ts` | Better Auth setup |
| Job parsing | `src/services/parsers/` | Glassdoor, LinkedIn, Indeed |

## CONVENTIONS

- Request typing: Extend `Request` in `types/express.d.ts`
- NEVER use `(req as any)`
- Validation: Zod schemas in route handlers

## ANTI-PATTERNS

- No type suppression with `as any`
- No empty catch blocks
