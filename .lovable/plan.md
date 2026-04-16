

## DB Architecture Truth — Final Wiring Audit

### What IS Done ✅
| Item | Status |
|---|---|
| `schema-registry.ts` | ✅ 203 entries, all 201 live tables |
| `migration-registry.ts` | ✅ 164 entries (all 163 migrations) |
| `rls-policy-registry.ts` | ✅ 201 tables classified |
| `tenancy-boundary-map.ts` | ✅ Full coverage with admin/service exceptions |
| 6 architecture docs | ✅ All present |
| `DbTruthExplorer` admin page | ✅ Built (167 lines, 5 tabs) |
| `db-truth-introspect` edge function | ✅ Exists |
| 11 per-domain SQL files | ✅ Synthesized |
| Persistence audit + check | ✅ `generated/persistence-audit.json` |
| 1 vitest suite | ✅ `db-truth-registries.test.ts` |
| DB checks in `validate-all.ts` | ✅ 8 checks wired |

### What is BROKEN or MISSING ❌

1. **`/admin/db-truth-explorer` route NOT registered** in `src/routes/AdminRoutes.tsx` — page exists but is unreachable.
2. **`db-truth-introspect` edge function uses fake query** — `.from("pg_tables")` via PostgREST won't reach system catalogs. Returns empty data. Needs an SQL RPC instead.
3. **`check-persistence-coverage.ts` NOT wired** into `scripts/validate-all.ts` aggregator (file exists; gate not active).
4. **3 missing per-domain SQL files**: `finance.sql`, `business-crm` ✅ exists but missing `user-experience.sql`, `admin-governance.sql`, `finance.sql` (registry has 14 domains, only 11 SQL files).
5. **3 missing vitest suites** (plan called for 4): rls-pattern-integrity, migration-ownership-integrity, persistence-domain-coverage.
6. **`check-backend-registry-completeness.ts` missing from `validate-all.ts`** db block.
7. **Edge function `db-truth-introspect` not registered** in backend topology registry (`edge-function-registry.ts`) — would fail `check-edge-function-ownership`.

### Final Step F — Close Wiring Gaps (single message, deployment-ready)

**F1. Register admin route**
- Add lazy import + route entry in `src/routes/AdminRoutes.tsx` for `/admin/db-truth-explorer` under existing Backend Topology block, gated by `audit.view`.

**F2. Fix `db-truth-introspect` edge function**
- Create one SQL RPC `public.get_db_truth_snapshot()` (SECURITY DEFINER, admin-only via `has_role`) returning JSON: tables, policies-per-table, sensitive flags, drift summary.
- Migration: define the function with `has_role(auth.uid(), 'admin')` gate inside the function body; revoke from public, grant to authenticated.
- Rewrite `supabase/functions/db-truth-introspect/index.ts` to call this single RPC and shape the response per `op` parameter.
- Wire `db-truth-introspect` into `edge-function-registry.ts` + `edge-function-categories.ts` + `edge-function-auth-map.ts` + `edge-function-owner-map.ts` + `edge-function-bounded-contexts.ts` + `edge-function-contract-map.ts` + `edge-function-migration-map.ts` (DOMAIN_FUNCTION, owner: `platform-db`, callers: `admin-bff-gateway` only).
- Update `DbTruthExplorer` to optionally fetch live drift via this function (cached `useQuery`, falls back to static registry on error).

**F3. Wire CI gates**
- Add to `scripts/validate-all.ts` `db` block: `scripts/db/checks/check-persistence-coverage.ts` and `scripts/runtime/edge-functions/check-backend-registry-completeness.ts`.

**F4. Synthesize 3 missing per-domain SQL files**
- Run/extend `scripts/db/generate/synthesize-domain-schemas.ts` to emit `finance.sql`, `user-experience.sql`, `admin-governance.sql` (and any other registry domains lacking a schema file).

**F5. Add 3 missing vitest suites** under `src/__tests__/db/`:
- `rls-pattern-integrity.test.ts` — every `tenancy_column != null` table has a non-`no_policies`, non-`public_read` pattern.
- `migration-ownership-integrity.test.ts` — every migration has `boundedContext` mapped to a real domain in `schema-registry.ts`.
- `persistence-domain-coverage.test.ts` — load `generated/persistence-audit.json`; assert `summary.missing === 0` and every domain has ≥ 1 backing table.

**F6. Final verification**
- `npx tsc --noEmit` clean.
- Run `scripts/validate-all.ts db` block — all 10 checks green.
- Run vitest on `src/__tests__/db/` — all 4 suites green.
- Manually load `/admin/db-truth-explorer` to confirm render.

### Non-Negotiable Rules (still in force)
- Source of truth = migrations + live `pg_*`; registries derived only.
- `db-truth-introspect` is read-only, admin-gated, registered DOMAIN_FUNCTION, called only by admin-bff.
- No new top-level admin nav — route lives under existing Backend Topology / Health domain.
- Manifest Truth + Backend Topology + Admin Control Plane consolidation remain intact.

### Deliverables After Step F
- 1 admin route registered
- 1 SQL migration (security definer RPC for safe introspection)
- 1 hardened edge function + 7 registry entries
- 2 new CI gates wired into aggregator
- 3 synthesized per-domain SQL files
- 3 vitest suites
- Full `tsc` + db-check + vitest green

This is the final batch. After Step F: 100% deployment-ready, zero stubs, zero unwired components.

