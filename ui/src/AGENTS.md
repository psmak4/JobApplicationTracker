# UI Source

React 19 frontend with Vite. Mounts at `/app` basename.

## STRUCTURE

```
src/
├── App.tsx            # Router entry
├── main.tsx           # React bootstrap
├── pages/             # Route components (Dashboard, Pipeline, Archive, Auth)
├── components/
│   ├── ui/            # shadcn/ui components
│   ├── dashboard/     # Dashboard-specific (Table, Grid, Toolbar)
│   └── layout/        # SiteHeader, AdminLayout
├── hooks/             # React Query hooks (useApplications, useCalendar, etc.)
├── lib/               # api-client, auth-client, schemas, queryKeys, utils
├── constants/        # APPLICATION_STATUS_OPTIONS, WORK_TYPE_OPTIONS
└── types/            # TypeScript types
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add page | `src/pages/` | Add route in `App.tsx` |
| Add dashboard component | `src/components/dashboard/` | Memoized with React.memo |
| API hooks | `src/hooks/` | TanStack Query wrappers |
| Form validation | `src/lib/schemas.ts` | Zod schemas |

## CONVENTIONS

- Imports: `@/` alias (e.g., `@/components/ui`)
- Constants: `src/constants/index.ts`
- Query keys: `src/lib/queryKeys.ts`
- Hooks before conditional returns

## ANTI-PATTERNS

- No relative imports
- No hardcoded statuses
- No hooks after conditionals
