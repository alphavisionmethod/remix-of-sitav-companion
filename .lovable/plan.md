

# Database and RLS 100/100 — Full Behavioral Verification Suite

## Summary

The project has strong structural coverage (98% schema, 100% RLS) but critically low behavioral verification (40% DB schema, 15% RLS). This plan closes both gaps to 100% by creating comprehensive test suites that verify live database state, FK integrity, RLS policy correctness per table, migration sequencing, and registry-to-live-DB synchronization. It also fixes 5 linter warnings for overly permissive policies and regenerates registries to cover all 430 live tables.

---

## What Gets Fixed

### A. Schema Registry Gap (201 registered vs 430 live tables)

The auto-generated `schema-registry.ts` only covers 201 of 430 live tables. The generator script must be re-run against the live database, then the downstream registries (RLS, tenancy boundary map) regenerated to match. The `db-truth-registries.test.ts` threshold will be raised from `>= 200` to `>= 420`.

### B. Permissive RLS Policies (5 linter warnings)

Seven policies use `USING(true)` or `WITH CHECK(true)` on non-SELECT operations. Of these:
- 6 are service-role-only (intentional) but lack explicit `auth.role() = 'service_role'` guards — these will be tightened
- 1 (`l7_sla_service_insert`) is named as service-role but needs the explicit role check added
- Public-insert tables (beta_applications, donations, waitlist_signups, investor_requests, press_inquiries) are correctly permissive for anonymous access

**Migration**: Replace `USING(true)` / `WITH CHECK(true)` with `auth.role() = 'service_role'` on: `advisor_action_proof_packs`, `compliance_evidence`, `cron_run_receipts`, `evidence_graph_edges`, `evidence_graph_nodes`, `installed_apps_receipts`, `recovery_jobs`, `boardroom_followthrough_sla_alerts`.

### C. New Behavioral Test Suites

#### 1. FK Integrity Tests (`src/__tests__/db/fk-integrity.test.ts`)
- Query `pg_constraint` for all 178 FK constraints
- Assert every FK references an existing table and column
- Assert no orphan FK chains (A->B->C where C was dropped)
- Assert FK count matches expected baseline (>= 170)

#### 2. RLS Policy Unit Tests (`src/__tests__/db/rls-policy-behavioral.test.ts`)
- For every table in `pg_tables`, assert RLS is enabled (`SELECT relrowsecurity FROM pg_class`)
- For every table with `user_id` / `org_id` tenancy column, verify the policy's `qual` expression references that column
- Verify service-role-only tables use explicit `auth.role() = 'service_role'` (not `true`)
- Verify no policy uses `USING(true)` for UPDATE/DELETE on non-service-role policies
- Assert total policy count matches live DB (>= 950)

#### 3. Migration Sequence Integrity Tests (`src/__tests__/db/migration-sequence-integrity.test.ts`)
- Assert migrations on disk match the registry count
- Assert ordinals are sequential (no gaps > 1)
- Assert every migration file physically exists in `supabase/migrations/`
- Assert no two migrations share a timestamp prefix

#### 4. Schema-Registry-to-Live-DB Sync Test (`src/__tests__/db/schema-live-sync.test.ts`)
- Query `pg_tables` for all public tables
- Compare against `DB_SCHEMA_REGISTRY` entries
- Assert every live table has a registry entry (0 unregistered)
- Assert every registry entry has a live table (0 phantom entries)
- Assert RLS policy counts in registry match live `pg_policies` counts

#### 5. Tenancy Boundary Behavioral Test (`src/__tests__/db/tenancy-behavioral.test.ts`)
- For every table in `TENANCY_BOUNDARY_MAP` with a non-null `tenantKey`, verify the column actually exists in the live schema (`information_schema.columns`)
- Verify tenant-scoped tables have policies that reference their tenant column
- Assert no table has `crossTenantPolicy: "deny"` but a policy allowing unrestricted SELECT

### D. Registry Regeneration and Threshold Updates

| File | Change |
|---|---|
| `src/lib/db/schema-registry.ts` | Regenerate to cover all 430 tables |
| `src/lib/db/rls-policy-registry.ts` | Regenerate to reflect 954 policies |
| `src/lib/db/tenancy-boundary-map.ts` | Regenerate to cover all 430 tables |
| `src/__tests__/db/db-truth-registries.test.ts` | Raise thresholds: tables >= 420, policies total >= 900, migrations >= 160 |

---

## Technical Details

### Migration for RLS Hardening

A single SQL migration will tighten 8 policies by replacing `true` with `(auth.role() = 'service_role')`:

```sql
-- advisor_action_proof_packs
DROP POLICY "Service role can manage advisor proof packs" ON advisor_action_proof_packs;
CREATE POLICY "Service role can manage advisor proof packs" ON advisor_action_proof_packs
  FOR ALL TO authenticated USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
-- ... repeated for compliance_evidence, cron_run_receipts, evidence_graph_edges/nodes, 
--     installed_apps_receipts, recovery_jobs, boardroom_followthrough_sla_alerts
```

### Test Architecture

All new tests use **live database queries** via the Supabase client to perform behavioral verification, not just registry checks. They import `supabase` from `@/integrations/supabase/client` and use `supabase.rpc()` or raw SQL to verify actual database state.

For tests that need database introspection (pg_class, pg_policies, pg_constraint), a small helper edge function `db-introspection` will be created that exposes read-only catalog queries securely.

### Files Changed

| File | Change |
|---|---|
| `src/__tests__/db/fk-integrity.test.ts` | New — 178 FK constraint behavioral tests |
| `src/__tests__/db/rls-policy-behavioral.test.ts` | New — per-table RLS correctness tests |
| `src/__tests__/db/migration-sequence-integrity.test.ts` | New — migration file/ordinal/timestamp tests |
| `src/__tests__/db/schema-live-sync.test.ts` | New — registry vs live DB synchronization tests |
| `src/__tests__/db/tenancy-behavioral.test.ts` | New — tenant column existence and policy verification |
| `src/__tests__/db/db-truth-registries.test.ts` | Updated thresholds to match 430-table reality |
| `src/lib/db/schema-registry.ts` | Regenerated from live DB |
| `src/lib/db/rls-policy-registry.ts` | Regenerated from live DB |
| `src/lib/db/tenancy-boundary-map.ts` | Regenerated from live DB |
| `supabase/functions/db-introspection/index.ts` | New — read-only catalog query helper |
| Migration SQL | Tighten 8 service-role policies from `true` to `auth.role() = 'service_role'` |

### Expected Outcome

| Dimension | Before | After |
|---|---|---|
| Database Schema Structural | 98% | 100% (all 430 tables registered) |
| Database Schema Behavioral | 40% | 100% (FK, sync, migration sequence tests) |
| RLS Policies Structural | 100% | 100% (maintained) |
| RLS Policies Behavioral | 15% | 100% (per-table policy correctness, tenancy, service-role hardening) |
| Combined Score | 63.5% | 100% |

