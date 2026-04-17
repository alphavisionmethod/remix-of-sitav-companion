

## Re-Audit: Database / Migration Reality Checklist (17 items) — Real Gaps Found

I checked every item against disk truth. **13 ready, 4 real gaps that block "100% deployment-ready."**

### Disk truth scorecard

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Full migration tree visible & documented | ✅ ready | 165 files in `supabase/migrations/`, `migration-registry.ts` + `MIGRATION_POLICY_AND_ROLLOUTS.md` |
| 2 | Schema registry exists | ✅ ready | `schema-registry.ts` 201 tables, auto-generated from live PG |
| 3.a | Owner per critical table | ✅ ready | `table-ownership-map.ts` via `domain → owner-team` |
| **3.b** | **Writers per table** | ⚠️ **gap** | Edge functions don't declare `tablesWritten`; no inverse `table → writer-functions` map |
| **3.c** | **Readers per table** | ⚠️ **gap** | Same — no `tablesRead` field, no inverse `table → reader-functions` map |
| 3.d | Tenant policy per table | ✅ ready | `tenancy-boundary-map.ts` 201/201 with `tenancyColumn` |
| 3.e | Sensitivity classification | ✅ ready | `schema-registry.ts` `sensitiveData: bool` (8 sensitive tables flagged) |
| 4 | RLS coverage explicit & tested | ✅ ready | 100% (358 policies), `check-rls-coverage.ts` + `check-rls-policy-registry.ts` |
| 5 | Tenancy boundary map | ✅ ready | `tenancy-boundary-map.ts` + `check-tenancy-boundary-map.ts` + `check-tenancy-firewall.ts` |
| 6 | Event log tables explicit | ✅ ready | `timeline_events`, `cloud_audit_events`, `os_audit_events`, `admin_action_audit` (8 log tables in persistence audit) |
| 7 | Approval/action/proof/reversal | ✅ ready | `approval_decisions`, `admin_action_confirmations`, `boardroom_decision_receipts`, `ai_inference_receipts`, `timeline_events` |
| 8 | Memory persistence tables | ✅ ready | `advisor_memories`, `advisor_board_memory`, `command_memory` |
| 9 | Setup checkpoint tables | ✅ ready | 8 tables incl. `onboarding_sessions`, `cloud_sync_checkpoints` |
| 10 | Connector token/refresh canonical | ✅ ready | `connector_tokens`, `connector_oauth_flows`, `connector_sync_runs` |
| 11 | Workflow runtime tables | ✅ ready | `command_steps`, `runtime_agents` |
| 12 | Feature flags/prompts/provider config | ✅ ready | `cloud_feature_flags`, `flagship_loops`, `ai_workforce_roles`, `cloud_storage_providers` |
| **13** | **Backup exists** | ⚠️ **gap** | No `scripts/db/backup/` snapshot script. `verify-backup-restore.ts` only checks restore-script existence; no actual backup-runner is on disk |
| **14** | **Restore is tested** | ⚠️ **gap** | `restore-backup.sh` is 12 LOC (`psql < $file` no validation); `disaster-recovery-drill.sh` is 5 LOC (creates a dir, prints "complete"). Neither exercises a real round-trip |
| 15 | Schema drift checks in CI | ✅ ready | `check-schema-registry.ts` + `check-rls-coverage.ts` + `db-integrity-check.sh` (no dedicated CI gate in umbrella though) |
| 16 | Services don't write outside boundary | ⚠️ partial | `check-table-ownership.ts` exists but only validates owner-domain coverage, not function→table write authorization (depends on item 3.b) |

### The 4 real gaps

**Gap A — `tablesWritten` / `tablesRead` per edge function (items 3.b, 3.c, 16).**
The 85-function registry does not declare which tables each function reads/writes. Without this, the table-ownership check cannot enforce "writer must be owned by table's domain," and we can't generate the inverse `table → [writers, readers]` map.

**Gap B — Real backup runner (item 13).**
There is no `pg_dump`-based snapshot script that produces an actual `.sql` artifact in `backups/`. The verifier checks for restore-script presence only.

**Gap C — Real restore round-trip (item 14).**
`disaster-recovery-drill.sh` is a 5-line stub. There is no script that: takes a backup → restores into a temp DB / dry-run → verifies row counts match → emits a report.

**Gap D — DB Reality CI gate (items 15, 16, plus closure).**
Nine DB-related check scripts exist but **none is registered in the CI Umbrella** (28/28 gates, zero are DB-domain). DB integrity is therefore not a release blocker.

---

## Phase 18 — Database / Migration Reality Closure (~7 files, ~700 LOC)

**18.1 — Function ↔ Table I/O map** — `src/lib/backend-topology/edge-function-table-io-map.ts` (~280 LOC)
- `EDGE_FUNCTION_TABLE_IO: Record<FunctionName, { writes: string[]; reads: string[]; }>`
- One entry per active function (≈80; wrappers/deprecated exempt).
- Sourced by static scan of `supabase/functions/*/index.ts` for `.from("table_name")` `.insert/.update/.delete/.upsert/.select` patterns, then hand-curated for orchestration helpers.
- Inverse helpers: `getWritersFor(table)`, `getReadersFor(table)`.

**18.2 — Table writer/reader registry** — `src/lib/db/table-writer-reader-map.ts` (~120 LOC)
- Computed from 18.1 + `schema-registry.ts`.
- For each of 201 tables: `{ writers: string[]; readers: string[]; ownerDomain: DbDomain; crossDomainWriters: string[] }`.
- `crossDomainWriters` flags any function writing outside its `boundedContext` mapped owner-domain (release blocker).

**18.3 — Real backup runner** — `scripts/db/backup/run-backup.sh` (~80 LOC)
- `pg_dump --schema=public --no-owner --no-acl $PGURL > backups/$(date +%Y%m%d-%H%M%S).sql`
- Falls back to `db-truth-introspect` edge function (`op: "schema-snapshot"`) when `psql` not available — captures table list, policy list, row counts as JSON.
- Records `backups/manifest.json` with timestamp, size, table count, policy count.
- Companion `.ps1` for Windows.

**18.4 — Restore round-trip drill** — `scripts/db/restore/restore-roundtrip-drill.ts` (~150 LOC)
- Takes latest backup → loads into ephemeral schema (`restore_test_<ts>`) → diffs row counts vs source → emits `generated/restore-drill-report.json` with `{ ok, tableCount, mismatches[], durationMs }`.
- When no live PG available, runs in **dry mode**: validates backup file is parseable SQL with expected `CREATE TABLE` / `INSERT` markers and matches the schema-registry table count.

**18.5 — DB Reality CI gate (Gate 29)** — `scripts/architecture/checks/check-db-reality.ts` (~180 LOC)
Asserts:
- Every table in `schema-registry.ts` has an owner domain (item 3.a).
- Every active function has an entry in `EDGE_FUNCTION_TABLE_IO` (items 3.b, 3.c).
- `crossDomainWriters` is empty or each entry has a documented exemption (item 16).
- `backups/manifest.json` exists and most-recent backup is ≤ 8 days old (item 13).
- `generated/restore-drill-report.json` exists and `ok: true` (item 14).
- Re-runs `check-schema-registry.ts` + `check-rls-coverage.ts` + `check-tenancy-boundary-map.ts` and rolls up into one verdict (item 15 + closure).
- Emits `generated/db-reality-report.json`.

**18.6 — Wire Gate 29 into CI Umbrella** — `src/lib/ci/ci-gate-registry.ts` + `ci-gate-types.ts`
- New phase `phase-18-db-reality`.
- Update `generated/ci-umbrella-manifest.json` → `gateCount: 29`.

**18.7 — Admin dashboard surfacing** — extend `src/pages/admin/DbTruthExplorer.tsx`
- New tab: **"Writers & Readers"** — for each table show owner domain · writer functions (badged green/red on cross-domain) · reader functions · backup age · last restore drill timestamp.
- Pulls from 18.2 + `db-reality-report.json`.

### Acceptance

- All 17 checklist items truthfully ready (no "honest partials" remain in the DB domain).
- `db-reality-report.json` → `ok: true, errors: 0, warnings: 0`.
- CI Umbrella reads **29/29 green**.
- Every table has explicit `owner / writers[] / readers[] / tenancy / sensitivity` queryable from one registry.
- Backup + restore round-trip drill produces a verifiable artifact.
- Writers writing outside their owner domain are caught at CI time.

### Files

| File | Change |
|---|---|
| `src/lib/backend-topology/edge-function-table-io-map.ts` | New (~280 LOC) |
| `src/lib/db/table-writer-reader-map.ts` | New (~120 LOC) |
| `scripts/db/backup/run-backup.sh` (+ `.ps1`) | New (~80 LOC) |
| `scripts/db/restore/restore-roundtrip-drill.ts` | New (~150 LOC) |
| `scripts/architecture/checks/check-db-reality.ts` | New CI Gate 29 (~180 LOC) |
| `src/lib/ci/ci-gate-registry.ts` + `ci-gate-types.ts` | +phase-18 |
| `src/pages/admin/DbTruthExplorer.tsx` | + Writers/Readers tab |
| `generated/db-reality-report.json` | New artifact |
| `generated/restore-drill-report.json` | New artifact |
| `backups/manifest.json` | New artifact |
| `generated/ci-umbrella-manifest.json` | gateCount: 29 |
| `src/lib/backend-topology/index.ts` | +1 barrel export |
| `src/lib/db/index.ts` | +1 barrel export |

After this phase the **Database / Migration Reality Checklist is truthfully 17/17, fully wired, CI-enforced, deployment-ready** — every table has a complete owner/writer/reader/tenancy/sensitivity record, backups produce real artifacts, restore is round-trip drilled, and write-outside-boundary violations block CI.

