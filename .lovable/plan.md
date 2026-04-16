

# Database Architecture Truth — Phased Plan

## Reality Check
The DB truth layer is ~40% built. `src/lib/db/` (11 files), `supabase/{schema,policies,seed,docs}/`, 9 DB checks, 4 generators, and a `BackendTopologyDashboard` already exist. Major gaps:

| Gap | Current | Target |
|---|---|---|
| `schema-registry.ts` | 80 tables hand-coded | All 201 live tables, auto-regenerated |
| `migration-registry.ts` | 7 sample entries | All 163 migrations classified |
| `rls-policy-registry.ts` | 13 explicit | All 201 with pattern verdict |
| Architecture docs | 0/5 of the required DB docs | 5 canonical docs |
| Admin DB surfaces | 1 page (topology) | 5 dedicated views |
| Persistence-critical domain audit | partial | full inventory + gap report |
| CI validators | 9 checks, mostly count-only | 9 hardened + 4 new |
| Per-domain `supabase/schema/*.sql` files | only READMEs | bounded-context split (synthesized from migrations) |

## Final 6 Phases (each independently deployable)

### Phase 1 — Live Schema Truth Regeneration
- Rewrite `scripts/db/generate/generate-schema-registry.ts` to read directly from `pg_tables` + `information_schema.columns` (via the Supabase tool plumbing) instead of hand-curated lists.
- Regenerate `src/lib/db/schema-registry.ts` to cover all **201 tables** with: `domain`, `hasRls`, `tenancyColumn`, `schemaClass` (`write` / `read` / `log` / `config` / `system`), `sensitiveData` flag, `runtimeConsequence` ref.
- Harden `check-schema-registry.ts`: fails when on-disk migrations contain `CREATE TABLE` statements absent from registry, or when registry contains phantom tables.
- **Deployable**: pure metadata, zero runtime change.

### Phase 2 — Migration Truth Registry
- Rewrite `generate-migration-registry.ts` to scan all 163 SQL files: detect category (`table-creation` / `rls-policy` / `function-trigger` / `index` / `enum` / `view` / `data` / `alter`), affected tables, destructive ops, owner from header comments.
- Replace `migration-registry.ts` with the full 163-entry registry plus per-migration: `boundedContext`, `rollbackRisk`, `releaseConsequence`, `dataSensitivity`, `tenancyImpact`.
- Harden `check-migration-ownership.ts`: fail when any migration lacks header comment + bounded context tag.
- Add `MIGRATION_POLICY_AND_ROLLOUTS.md` defining naming, ownership comment template, and rollback policy.

### Phase 3 — RLS & Tenancy Truth
- Regenerate `rls-policy-registry.ts` to cover all 201 tables by querying `pg_policies`, classifying each into one of the 12 existing `RlsPattern` values.
- Expand `tenancy-boundary-map.ts` to declare for every tenant-scoped table: `tenantKey`, `adminException`, `serviceRoleException`, `crossTenantPolicy`.
- Harden `check-rls-coverage.ts` and `check-rls-policy-registry.ts`: fail on any table whose live `pg_policies` count differs from registry expectation, or any `tenancyColumn` table without a registered policy of the right pattern.
- Add `TENANCY_AND_RLS_MODEL.md` documenting the 12 patterns, the security definer function model (`has_role`, `is_org_member`, `is_tenant_member`, `has_admin_permission`), and the admin-exception path.

### Phase 4 — Persistence-Critical Domain Audit & Gap Closure
- Generator script `generate-persistence-audit.ts` cross-references the 9 domains in section 7 of the prompt against `schema-registry.ts` and produces `generated/persistence-audit.json` listing presence/absence of: setup checkpoints, environment/device registry, prompt versions, model-routing config, feature flags, OAuth-token refresh state, workflow-runtime state, memory persistence, action/proof/reversal trail.
- For each genuine gap (after audit shows what's truly missing — most of these likely already exist with different names), emit a SQL migration template under `supabase/migrations/` plus `app_role`-aware RLS scaffold; otherwise update registry mappings.
- New script `check-persistence-coverage.ts` blocks deployment when any persistence-critical domain has 0 backing tables.
- Add `PERSISTENCE_AND_RECOVERY_MODEL.md`.

### Phase 5 — Admin DB Visibility Surfaces
Five new admin pages wired into the existing 12-domain Admin Control Plane (under the **Health** and **Config** domains, not new top-level entries):
1. `SchemaRegistryExplorer` — searchable 201-table grid: domain, RLS, tenancy column, owner, sensitive flag, dependency edges.
2. `RlsCoverageDashboard` — live `pg_policies` vs registry diff, drift list, pattern coverage chart.
3. `MigrationTimelineViewer` — 163-row timeline with category, rollback risk, bounded context, applied date.
4. `TenancyAndOwnershipExplorer` — tenant-key inspector + ownership matrix.
5. `DbDriftRadar` — live drift summary (schema vs registry, RLS vs registry, missing-from-migration tables).

All five use a new read-only edge function `db-truth-introspect` (DOMAIN_FUNCTION, admin-bff caller only) that runs whitelisted introspection queries against `pg_tables`/`pg_policies`/`information_schema`.

### Phase 6 — Docs, CI Wiring, Final Hardening
- Write the 3 remaining docs: `DATABASE_ARCHITECTURE.md`, `SCHEMA_TRUTH_REGISTRY.md`, `DB_OWNERSHIP_MATRIX.md`.
- Wire all DB checks into `scripts/validate-all.ts` aggregator (already partially wired) and Manifest Truth Framework's `manifest-schema-registry` authoritative entry.
- Synthesize per-domain `supabase/schema/{auth,boardroom,business,finance,...}.sql` files from existing migrations for human readability (read-only artifacts; migrations remain source of truth).
- 4 new vitest suites: schema-registry completeness, RLS-pattern integrity, migration-ownership integrity, persistence-domain coverage.
- Final pass: `tsc --noEmit` clean, all DB checks green, all 5 new admin pages route-tested, app boots.

## Deliverables
- 201-table schema registry, 163-migration registry, 201-table RLS registry — all auto-generated and CI-enforced
- 5 architecture docs + 1 migration policy doc
- 5 admin DB visibility pages + 1 read-only introspection edge function
- 4 hardened CI checks + 4 new vitest suites
- Per-domain `supabase/schema/*.sql` files synthesized from migrations
- Persistence-critical domain audit with gap-closure migrations where needed

## Non-Negotiable Rules
- Source of truth is migrations + live `pg_*`; registries are derived artifacts
- Every change preserves Manifest Truth Framework + Backend Topology Hardening + Admin Control Plane consolidation
- No hand-curated drift — generators replace stale data, never add to it
- Each phase ends with: `tsc --noEmit` clean, all governance checks green, app boots, no regressions
- New admin pages register in the existing 12-domain IA, never as top-level navigation entries

## Starting Point
Phase 1 — Live Schema Truth Regeneration — in the next message after approval.

