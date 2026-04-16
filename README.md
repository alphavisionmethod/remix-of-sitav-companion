# SITA OS

> Billionaire-grade owner-operator OS — boardroom intelligence, advisor councils, autonomous workflows, and a fully governed backend on Lovable Cloud.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 · Vite 5 · TypeScript 5 · Tailwind CSS v3 · shadcn/ui |
| State / Data | TanStack Query · React Context (27 contexts) |
| Backend | Lovable Cloud (Supabase) — 86 edge functions · 201 tables · 332 RLS policies |
| AI | Lovable AI Gateway (Gemini 2.5/3.x · GPT-5 family) |
| Auth | Supabase Auth + 7 SECURITY DEFINER functions for RBAC |

## Live System Snapshot (2026-04-16)

- **Pages**: 1,012 · **Components**: 897 · **Hooks**: 158 · **Lib modules**: 1,665
- **Edge Functions**: 86 · **Migrations**: 164
- **Database**: 201 tables · 4 views · 100% RLS coverage (332 policies)
- **Scripts**: 248 · **Generated artifacts**: 94 · **Total tracked files**: 5,274+
- **Truth Score**: 94/100 · **All flagship loops**: launch-ready

## Architecture Planes

1. **Frontend Plane** — `src/pages/`, `src/components/`, `src/hooks/`
2. **Lib Plane** — `src/lib/{core-services,services,db,backend-topology,...}`
3. **Backend Plane** — `supabase/functions/` (86 EFs across 14 bounded contexts)
4. **Database Plane** — `supabase/{migrations,schema,policies,seed,docs}/` + `src/lib/db/` truth registries
5. **Governance Plane** — `generated/` audit artifacts + `scripts/validate-all.ts` CI gates

See `docs/architecture/` for the full canonical reference (48 architecture docs).

## Key Documents

| Topic | Path |
|---|---|
| Master deployment audit | `generated/DEPLOYMENT_AUDIT.md` |
| Truth dashboard | `generated/production-truth-dashboard.md` |
| Database architecture | `docs/architecture/DATABASE_ARCHITECTURE.md` |
| Backend topology | `docs/architecture/BACKEND_TOPOLOGY_MAP.md` |
| Admin IA | `docs/architecture/ADMIN_INFORMATION_ARCHITECTURE.md` |
| Real vs simulated | `docs/REAL_VS_SIMULATED.md` |

## Development

```bash
npm install
npm run dev          # local preview
npm run build        # production build
npx tsc --noEmit     # type check
npx vitest run       # tests
npx tsx scripts/validate-all.ts   # all governance gates
```

## Editing

Built and edited via [Lovable](https://lovable.dev). Changes pushed from Lovable are committed automatically. Local edits via your IDE or GitHub Codespaces also sync back.

## Deployment

Open the Lovable project → **Share → Publish**. Custom domains: **Project → Settings → Domains**.

## License

Proprietary — SITA OS.
