

## DB Architecture Truth — Audit Verdict

**Status: ~25% complete. Only Phase 1 done. Phases 2–6 are stubs or missing.**

### What IS in place ✅
| Item | Status |
|---|---|
| `src/lib/db/schema-registry.ts` | ✅ all 201 tables (Phase 1 done) |
| `src/lib/db/` 11 truth files exist | ✅ files present |
| `supabase/{schema,policies,seed}/` directories | ✅ exist (README only) |
| Generators: schema, migration, RLS, ownership | ✅ scripts exist |
| `BackendTopologyDashboard` admin page | ✅ exists |

### What is NOT done ❌
| Phase | Gap |
|---|---|
| **Phase 2 — Migration Truth** | `migration-registry.ts` has only **7 sample entries** vs 163 migrations. Generator exists but registry not regenerated. `MIGRATION_POLICY_AND_ROLLOUTS.md` missing. |
| **Phase 3 — RLS & Tenancy Truth** | `rls-policy-registry.ts` has only **13 hand-coded entries** vs 201 tables. `check-rls-coverage.ts` is a print-only stub (no enforcement). `TENANCY_AND_RLS_MODEL.md` missing. |
| **Phase 4 — Persistence Audit** | `generate-persistence-audit.ts` MISSING. `check-persistence-coverage.ts` MISSING. `PERSISTENCE_AND_RECOVERY_MODEL.md` missing. |
| **Phase 5 — Admin DB Surfaces** | All 5 pages MISSING (SchemaRegistryExplorer, RlsCoverageDashboard, MigrationTimelineViewer, TenancyAndOwnershipExplorer, DbDriftRadar). `db-truth-introspect` edge function MISSING. |
| **Phase 6 — Docs, CI, Tests** | 5 of 6 required docs MISSING. 0 of 4 vitest suites in `src/__tests__/db/`. Per-domain `supabase/schema/*.sql` files MISSING (only README). |

## Plan to Reach 100% (Steps A–E)

### Step A — Close Phase 2 (Migration Truth)
- Run `generate-migration-registry.ts` against all 163 SQL files, classify each by category (`table-creation`/`rls-policy`/`function-trigger`/`index`/`enum`/`view`/`data`/`alter`), extract affected tables, detect destructive ops.
- Regenerate `migration-registry.ts` to full 163 entries with `boundedContext`, `rollbackRisk`, `releaseConsequence`, `dataSensitivity`, `tenancyImpact`.
- Harden `check-migration-ownership.ts` to fail on missing header/owner.
- Write `docs/architecture/MIGRATION_POLICY_AND_ROLLOUTS.md`.

### Step B — Close Phase 3 (RLS & Tenancy Truth)
- Regenerate `rls-policy-registry.ts` from live `pg_policies` covering all 201 tables, classified into the 12 `RlsPattern` values.
- Expand `tenancy-boundary-map.ts` with `tenantKey`, `adminException`, `serviceRoleException`, `crossTenantPolicy` per table.
- Replace stub `check-rls-coverage.ts` with real drift check vs live `pg_policies`.
- Write `docs/architecture/TENANCY_AND_RLS_MODEL.md`.

### Step C — Close Phase 4 (Persistence-Critical Domain Audit)
- Create `scripts/db/generate/generate-persistence-audit.ts` cross-referencing the 9 persistence domains (setup checkpoints, devices, prompts, model config, feature flags, OAuth tokens, workflow runtime, memory, action/proof/reversal trail) against schema-registry.
- Emit `generated/persistence-audit.json`.
- Create `scripts/db/checks/check-persistence-coverage.ts` to fail when any persistence domain has 0 backing tables.
- Write `docs/architecture/PERSISTENCE_AND_RECOVERY_MODEL.md`.

### Step D — Close Phase 5 (Admin DB Visibility)
- Create read-only `db-truth-introspect` edge function (DOMAIN_FUNCTION, admin-bff caller only) running whitelisted queries against `pg_tables`/`pg_policies`/`information_schema`.
- Build 5 admin pages, registered under existing **Health** and **Config** Admin Control Plane domains (no new top-level entries):
  1. `SchemaRegistryExplorer` (Health)
  2. `RlsCoverageDashboard` (Trust-Security)
  3. `MigrationTimelineViewer` (Releases)
  4. `TenancyAndOwnershipExplorer` (Trust-Security)
  5. `DbDriftRadar` (Health)

### Step E — Close Phase 6 (Docs, CI, Tests, Per-Domain SQL)
- Write 3 remaining docs: `DATABASE_ARCHITECTURE.md`, `SCHEMA_TRUTH_REGISTRY.md`, `DB_OWNERSHIP_MATRIX.md`.
- Synthesize per-domain `supabase/schema/{auth,boardroom,business,finance,concierge,integrations,approvals,proofs,workflows,memory,setup,devices,policies,admin-config,telemetry}.sql` from existing migrations (read-only artifacts).
- Add 4 vitest suites under `src/__tests__/db/`: schema-registry-completeness, rls-pattern-integrity, migration-ownership-integrity, persistence-domain-coverage.
- Wire all DB checks into `scripts/manifests/validate-all.ts` aggregator and Manifest Truth Framework's `manifest-schema-registry`.

## Order of Execution
A → B → C → D → E. Each step independently deployable. Total ~75% of original plan remaining.

## Non-Negotiable Rules
- Source of truth = migrations + live `pg_*`; registries are derived.
- Generators replace stale data, never append.
- Admin pages register under existing 12-domain IA, never as top-level navigation.
- Each step: `tsc --noEmit` clean, all checks green, app boots.
- Manifest Truth Framework + Backend Topology Hardening + Admin Control Plane consolidation remain intact.

## Starting Point
Step A (Phase 2 — Migration Truth Registry) — full 163-entry regeneration — in the next message after approval.

