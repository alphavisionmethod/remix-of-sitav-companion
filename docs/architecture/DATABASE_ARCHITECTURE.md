# Database Architecture — SITA OS

> **Source of truth:** `supabase/migrations/*.sql` (DDL) + live `pg_tables` / `pg_policies` (state)
> **Derived artifacts:** `src/lib/db/*.ts` registries, `generated/*.json` manifests, `supabase/schema/*.sql` per-domain dumps

## 1. Architecture Plane

The database is a **first-class architecture plane** in SITA OS, governed by:

- **201 tables** + **4 views** in the `public` schema
- **358 RLS policies** across **100% of tables** (zero unprotected tables)
- **163 migrations** under append-only timestamp ordering
- **6 SECURITY DEFINER functions** for role/tenant/admin gating

## 2. Bounded Contexts (14 domains)

| Domain | Purpose | Tables |
|---|---|---|
| `auth-identity` | Users, profiles, sessions, devices, biometrics | ~12 |
| `admin-governance` | Admin sessions, audit, role permissions, safety actions | ~8 |
| `advisor-intelligence` | Advisor agents, knowledge, memory, board actions | ~12 |
| `ai-workforce` | AI roles, tasks, invocations, recommendations, scoring | ~16 |
| `boardroom` | Boardroom sessions, items, recommendations, evidence | ~10 |
| `business-crm` | Contacts, deals, leads, opportunities | ~8 |
| `cloud-infrastructure` | Cloud tenants, memberships, billing | ~6 |
| `connector-fabric` | Connector tokens, webhooks, sync state | ~10 |
| `finance` | Invoices, payments, transactions | ~6 |
| `notification` | Push, VAPID keys, channels | ~5 |
| `os-kernel` | Runtime agents, command steps, capabilities | ~8 |
| `platform-core` | Approvals, proofs, simulations, timeline events | ~12 |
| `compliance` | Audit logs, policy evaluations, attestations | ~6 |
| `user-experience` | Wallpapers, preferences, onboarding | ~5 |

See `DB_OWNERSHIP_MATRIX.md` for the canonical table-to-domain mapping.

## 3. Schema Classes

Every table is classified into one of five schema classes:

- **`write`** — Canonical write models (the system writes here)
- **`read`** — Read models / projections
- **`log`** — Append-only audit / event logs
- **`config`** — Configuration / lookup tables
- **`system`** — Internal platform state

## 4. Truth Layer (`src/lib/db/`)

| File | Purpose |
|---|---|
| `schema-registry.ts` | All 201 tables with domain, class, RLS state, tenancy |
| `migration-registry.ts` | All 163 migrations classified by category + risk |
| `rls-policy-registry.ts` | All 201 tables with RLS pattern verdict |
| `tenancy-boundary-map.ts` | Per-table tenancy model + admin/service exceptions |
| `table-ownership-map.ts` | Canonical writer/reader services per table |
| `db-truth-registry.ts` | Aggregated DB truth manifest |
| `db-runtime-consequence-map.ts` | Runtime impact when table missing/drifting |
| `db-dependency-map.ts` | Cross-table dependencies |
| `db-audit-registry.ts` | Audit/proof tables enumeration |
| `db-health-engine.ts` | Live DB health computation |

All registries are **AUTO-GENERATED** — never hand-edit. Regenerate via `scripts/db/generate/`.

## 5. Generators

```bash
npx tsx scripts/db/generate/generate-schema-registry.ts        # tables + classes
npx tsx scripts/db/generate/generate-migration-registry.ts     # 163 migrations
npx tsx scripts/db/generate/generate-rls-policy-registry.ts    # RLS + tenancy
npx tsx scripts/db/generate/generate-persistence-audit.ts      # 9-domain coverage
npx tsx scripts/db/generate/synthesize-domain-schemas.ts       # per-domain SQL
```

## 6. CI Gates (`scripts/db/checks/`)

| Check | Fails on |
|---|---|
| `check-schema-registry` | Live table missing from registry |
| `check-migration-ownership` | Migration file missing from registry |
| `check-rls-coverage` | Live policy count differs from registry |
| `check-rls-policy-registry` | Schema table missing from RLS registry |
| `check-tenancy-boundary-map` | Tenant column unmapped |
| `check-tenancy-firewall` | Tenant boundary violation |
| `check-table-ownership` | Table without canonical owner |
| `check-persistence-coverage` | Persistence-critical domain has 0 tables |
| `schema-compliance` | Schema convention drift |

## 7. Admin Visibility

Five admin pages expose DB truth to operators (under existing `Health` and `Trust-Security` Admin Control Plane domains):

- `/admin/db/schema-explorer` — 201-table searchable grid
- `/admin/db/rls-coverage` — Pattern coverage + drift radar
- `/admin/db/migration-timeline` — 163-row timeline
- `/admin/db/tenancy-explorer` — Tenant-key inspector
- `/admin/db/drift-radar` — Live drift summary

Backed by read-only edge function `db-truth-introspect`.

## 8. Related Documents

- `TENANCY_AND_RLS_MODEL.md` — RLS patterns, security definers, admin-exception model
- `MIGRATION_POLICY_AND_ROLLOUTS.md` — Naming, ownership, rollback policy
- `PERSISTENCE_AND_RECOVERY_MODEL.md` — Backup, restore, recovery
- `SCHEMA_TRUTH_REGISTRY.md` — Canonical schema authority
- `DB_OWNERSHIP_MATRIX.md` — Table-to-domain mapping
