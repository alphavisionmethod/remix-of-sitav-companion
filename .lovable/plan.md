

# SITA OS — Backend Topology + DB Truth Layer Implementation

## Status: Both layers are **completely missing** — 0/19 files exist

Neither `src/lib/backend-topology/` nor `src/lib/db/` directories exist. The `supabase/` directory also lacks `schema/`, `policies/`, `seed/`, and `docs/` subdirectories.

## What Will Be Created

### Layer 6: Backend Topology (9 files + barrel)

All files follow the established registry pattern (typed constants + query functions).

| File | Purpose |
|------|---------|
| `edge-function-registry.ts` | Master registry of all 74 edge functions with name, path, runtime, status |
| `edge-function-categories.ts` | Category classification (admin, advisor, agent, ai, cloud, connector, finance, notification, os, platform, user) |
| `edge-function-bounded-contexts.ts` | Maps each function to its owning bounded context/domain |
| `edge-function-auth-map.ts` | Auth requirements per function (JWT, anon, service-role, webhook-secret) |
| `edge-function-contract-map.ts` | Input/output contract references per function |
| `edge-function-owner-map.ts` | Team/domain ownership for each function |
| `edge-function-runtime-consequence-map.ts` | Failure impact classification per function |
| `edge-function-migration-map.ts` | Maps functions to DB tables they read/write |
| `edge-function-topology-validator.ts` | Validation queries (orphan detection, missing auth, ownership gaps) |
| `index.ts` | Barrel export |

### Layer 7: DB Truth Layer (10 files + barrel)

| File | Purpose |
|------|---------|
| `schema-registry.ts` | Master registry of all 198 tables with domain, description, column count |
| `table-ownership-map.ts` | Maps each table to owning domain/team |
| `tenancy-boundary-map.ts` | Classifies tables by tenancy model (user_id, org_id, tenant_id, global, admin) |
| `rls-policy-registry.ts` | Documents RLS policy patterns per table |
| `migration-registry.ts` | Maps all 161 migrations with purpose classification |
| `db-truth-registry.ts` | Canonical truth assertions (which tables are authoritative for which concepts) |
| `db-runtime-consequence-map.ts` | Impact of table unavailability on system |
| `db-dependency-map.ts` | Foreign key and logical dependency graph |
| `db-audit-registry.ts` | Which tables have audit trail requirements |
| `db-health-engine.ts` | Health queries and scoring functions |
| `index.ts` | Barrel export |

### Supabase Directory Structure (4 new directories with README files)

| Directory | Content |
|-----------|---------|
| `supabase/schema/README.md` | Schema documentation reference |
| `supabase/policies/README.md` | RLS policy documentation reference |
| `supabase/seed/README.md` | Seed data documentation reference |
| `supabase/docs/README.md` | Database documentation reference |

## Implementation Details

- All TypeScript files use `as const` readonly arrays/records with typed interfaces
- Each file exports query/lookup functions (e.g., `getTablesByDomain()`, `getFunctionsByCategory()`)
- The 74 edge functions and 198 tables are fully enumerated from verified data
- No imports from UI layers — pure data/type files
- Follows exact pattern established by `src/lib/surfaces/`, `src/lib/devices/`, `src/lib/deployment/`

## Summary

| Action | Count |
|--------|-------|
| New TypeScript files | 22 (10 + barrel per layer) |
| New Supabase directories | 4 (with README) |
| Files modified | 0 |
| Total new files | **26** |

