

## Re-Audit Verdict — Checklist 17: 7.5/10 Truthful, 3 Real Gaps

The Phase 24 report is **partially false-green**. Live DB + disk evidence:

| # | Domain | Reality |
|---|---|---|
| 1 | Business OS | ✅ 10 tables present, RLS×4 each, manifest+routes+e2e+API |
| 2 | Finance OS | ✅ 14 tables present, RLS×4 each, manifest+routes+e2e |
| 3 | **Concierge OS** | ❌ **Manifest declares 13 tables, only 2 exist** (`grocery_lists`, `school_activities`). Missing: `schedules, errands, trips, reservations, household_tasks, event_plans, gift_plans, providers, family_members, maintenance_items, responsibilities` |
| 4 | Investment Office | ✅ 7 tables present, RLS×4 each |
| 5 | Boardroom | ⚠️ 5 tables present + edge fns wired + decision-receipt writes verified, but only 1 RLS policy each (no admin-RW separation) |

### Concrete Gaps

1. **Concierge tables missing (11 of 13)** — `use-concierge-data.ts`, `family-command-center`, `life-score`, `ConciergeRuntimeBoard.tsx`, `ErrandsLogistics.tsx` all call ghost tables. Also: code uses `concierge_errands` while manifest declares `errands` — naming mismatch.
2. **Gate 35 self-cheats on dbTables check** — when `generated/db-schema-snapshot.json` is missing (it is), the gate falls back to `assumed present` and reports green. The report claim "concierge entities mapped to existing platform tables" is not enforced anywhere.
3. **Boardroom RLS missing admin-RW separation** — 1 permissive `ALL` policy per table; plan called for admin-RW + user-scoped split for governance auditability.

---

## Phase 24.1 — Concierge Reality + Gate Honesty Closure

### 24.1.A — Restore the 11 missing concierge tables (fixes #1)
DB migration creating user-scoped RLS tables matching the manifest:
- `schedules`, `trips`, `reservations`, `household_tasks`, `event_plans`, `gift_plans`, `providers`, `family_members`, `maintenance_items`, `responsibilities`
- **`errands`** as canonical; add a backward-compat view `concierge_errands` → `errands` for existing 4 hook references, then update hook to canonical name in same PR
- All tables: `id uuid pk`, `user_id uuid not null`, status enum per manifest, `created_at/updated_at` + trigger, RLS `auth.uid() = user_id` (4 policies: SELECT/INSERT/UPDATE/DELETE)
- Indexes on `user_id`, status, due/start dates

### 24.1.B — Wire concierge code to canonical names (fixes #1 cont.)
- `src/hooks/use-concierge-data.ts` — replace `concierge_errands` → `errands` (4 call sites)
- Drop the temporary compat view after the rename lands

### 24.1.C — Add admin-RW separation on boardroom tables (fixes #3)
DB migration: keep user-scoped policy; add `admin_all` policy `TO authenticated USING (has_role(auth.uid(),'admin'))` on all 5 boardroom tables for governance review.

### 24.1.D — Make Gate 35 honest (fixes #2)
- **NEW edge fn step in CI** (or local script) that calls `get_db_truth_snapshot('schema')` and writes `generated/db-schema-snapshot.json` before Gate 35 runs.
- **Update `check-domain-reality.ts`**: if snapshot file is missing, **fail** the gate instead of falling back to "assumed present". The current fallback turns the gate into a no-op.
- Re-run; assert all 5 domains genuinely green against live tables.

### 24.1.E — Refresh report
Re-emit `generated/domain-reality-report.json` with:
- `dbSnapshotSource: "live get_db_truth_snapshot RPC"` evidence field
- `concierge.dbTables` actually checked (not "mapped to existing")
- `boardroom.rlsCoverage: { user_scoped: true, admin_rw: true }`

### Files

| Layer | Change |
|---|---|
| DB migration | 11 concierge tables + RLS×4 each + indexes + updated_at triggers + 5 boardroom admin_all policies |
| `src/hooks/use-concierge-data.ts` | Rename `concierge_errands` → `errands` (4 sites) |
| `scripts/architecture/checks/check-domain-reality.ts` | Remove fallback — fail when snapshot missing; load real snapshot |
| `scripts/architecture/snapshot-db-schema.ts` | NEW — calls `get_db_truth_snapshot('schema')` and writes `generated/db-schema-snapshot.json` |
| `generated/db-schema-snapshot.json` | NEW (committed snapshot baseline) |
| `generated/domain-reality-report.json` | Refresh with real evidence |
| `src/lib/db/non-edge-table-io-sources.ts` | Register 11 new concierge tables |

### Acceptance

- `SELECT count(*) FROM pg_tables WHERE schemaname='public' AND tablename IN ('schedules','errands','trips','reservations','household_tasks','event_plans','gift_plans','providers','family_members','maintenance_items','responsibilities')` returns **11**
- `useErrands()` queries `errands` table successfully (empty OK)
- `pg_policies` for each boardroom table shows ≥2 policies (user_scoped + admin_all)
- `generated/db-schema-snapshot.json` exists and contains ≥215 tables
- Gate 35 with snapshot present: all 5 domains 10/10, **0 missing tables** in any domain's `dbTables.detail`
- Removing the snapshot causes Gate 35 to **fail** (proves no silent fallback)
- Checklist 17 truthfully **50/50 — fully deployable**

