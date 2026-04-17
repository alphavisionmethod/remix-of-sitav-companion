

## Re-Audit — Checklist 22: 11/16 Truthful, 5 Concrete Gaps

Live disk shows the runbook **catalogue** is real (19 runbooks, 21 markdown docs, CI gate green: `19 runbooks, 18/19 subsystems covered ✅`), but the **operator-facing wiring** has theater.

### What IS truthful (✅)

| # | Item | Evidence |
|---|---|---|
| 1 | Runbook index exists | `src/lib/support/runbook-registry.ts` — 19 entries; `docs/architecture/RUNBOOK_INDEX.md`; `scripts/support/runbooks/generate-runbook-index.ts` |
| 2.1–2.13 | All 13 required runbooks exist | `auth-outage.md` (RB-001), `provider-outage.md` (RB-002), `sync-lag.md` (RB-003), `stuck-workflow.md` (RB-004), `proof-mismatch.md` (RB-005), `generated-vs-runtime-drift.md` (RB-006), `push-failure.md` (RB-007), `vmware-boot-failure.md` (RB-008), `release-rollback.md` (RB-009), `ai-provider-degradation.md` (RB-010), `connector-token-failure.md` (RB-011), `db-restore-failure.md` (RB-012), `setup-checkpoint-corruption.md` (RB-012) — all 13 ✅ + 6 bonus runbooks |
| 14a | Alerts schema has `runbook_id` field | `alert-client.ts` accepts `runbookId`; `alerts` table column `runbook_id` exists |
| 15a | Support hub exposes Runbook tab | `SupportHome.tsx` registers `FCC04RunbookCenter` as a hub module |
| 16a | CI gate validates runbook coverage | `check-runbook-coverage.ts` returns `19 runbooks, 18/19 subsystems covered ✅` |

### What is NOT truthful (❌) — 5 gaps

| # | Item | Status | Evidence |
|---|---|---|---|
| A | **FCC04RunbookCenter reads canonical registry** | ❌ | `FCC04RunbookCenter.tsx:36` defines `DEMO_RUNBOOKS` and `:138` falls back to demo on empty DB. Zero references to `RUNBOOK_REGISTRY` from `src/lib/support`. Operators see fake runbooks, not the 19 real ones in `docs/runbooks/` |
| B | **Alerts auto-link to runbooks** | ❌ | `raiseAlert()` accepts `runbookId` as an optional param but nowhere in the codebase do alert call-sites pass it. There is no `subsystem → runbookId` resolver wired into alert raising. Result: all alerts ship with `runbook_id = null` |
| C | **Incidents link to runbooks** | ❌ | `incident-management/index.ts` `Incident` interface has zero `runbookRef` / `runbookIds[]` field. Incidents cannot reference recovery procedure |
| D | **Recovery steps tested where possible** | ❌ | All 19 runbooks have `lastTestedAt: null` (19/19). No drill harness exists. The `status: "draft"` flag on RB-008 is also unmitigated |
| E | **One mandatory subsystem uncovered** | ⚠️ | CI gate shows `18/19 subsystems covered` — one mandatory subsystem in `runbook-subsystem-map.ts` lacks a runbook. Need to identify + cover it |

---

## Phase 28 — Runbook Operationalization Closure

### 28.A — Make FCC04RunbookCenter read the canonical registry (fixes #A)
- Refactor `FCC04RunbookCenter.tsx` to import `RUNBOOK_REGISTRY` from `@/lib/support` as the **primary source**.
- Render the 19 real runbooks (id, title, severity, subsystem, kill-switch link, markdown ref, steps, lastTestedAt).
- Add a "Run Drill" button per runbook that calls a new `runbook-drill` edge function (28.D).
- Add a markdown viewer panel that fetches `markdownRef` content for the selected runbook.
- Keep `founderOrchestrator` DB-backed runbooks as a secondary "User-defined" tab. Remove the DEMO_RUNBOOKS fallback entirely.

### 28.B — Wire alerts → runbooks automatically (fixes #B)
- NEW `src/lib/support/runbook-resolver.ts` exporting `resolveRunbookForAlert({ subsystem, severity }): string | null` that consults `getRunbookForSubsystem` and falls back to severity-based defaults.
- Update `raiseAlert()` in `alert-client.ts`: if caller does not pass `runbookId`, auto-resolve from `subsystem`. Emit telemetry on resolution miss.
- Add a typed `subsystem` enum aligned with `RunbookSubsystem` to keep the link integral.

### 28.C — Wire incidents → runbooks (fixes #C)
- Extend `Incident` interface in `incident-management/index.ts` with `runbookIds: string[]` and `primaryRunbookId?: string`.
- Add migration to add `runbook_ids text[]` and `primary_runbook_id text` to the `incidents` table.
- Update `declareIncident()` to auto-attach runbooks via `resolveRunbookForAlert` over `affectedServices` → owning subsystem.
- Update `FCC11IncidentResponseTimeline` to show linked runbooks with deep-links to FCC04.

### 28.D — Add runbook drill harness (fixes #D)
- NEW edge function `supabase/functions/runbook-drill/index.ts` that accepts `{ runbookId }` and executes a **dry-run** (validate steps, simulate timeouts, no side-effects), writing a `runbook_drill_results` row.
- NEW migration: `runbook_drill_results` table (`runbook_id`, `executed_at`, `mode: 'dry-run' | 'live'`, `step_outcomes jsonb`, `passed bool`, `notes`).
- NEW `src/lib/support/runbook-drill-status.ts` reading drill results and exposing `getLastDrillForRunbook(id)` so FCC04 shows real `lastTestedAt`.
- Bonus: nightly scheduled drill via `scheduler-dispatch` for the 5 critical runbooks (RB-001, RB-009, RB-014, RB-015, RB-005).

### 28.E — Cover the missing mandatory subsystem (fixes #E)
- Identify which of the 19 mandatory subsystems lacks a runbook (CI says `18/19`). Inspect `runbook-subsystem-map.ts` vs. registry coverage and either:
  - Add the missing markdown + registry entry, OR
  - Demote the subsystem `mandatory: false` if it is truly out of scope (with justification).

### 28.F — Manifest + CI integration
- NEW `generated/runbook-operability-report.json` capturing: `totalRunbooks`, `subsystemsCovered`, `alertsAutoResolveRate`, `incidentsWithRunbookRefs`, `runbooksWithRecentDrill`, `dangling: 0`, `ok: true`.
- Register in `MANIFEST_REGISTRY` (112 → 113 entries).
- Extend `check-runbook-coverage.ts` to also assert: every `criticalIncidentClass: true` subsystem has a runbook with a drill in last 30 days; every alert source documented in `alert-source-registry` resolves to a subsystem.

### Files

| Layer | Change |
|---|---|
| `src/pages/admin/FCC04RunbookCenter.tsx` | REWRITE to read `RUNBOOK_REGISTRY` |
| `src/lib/support/runbook-resolver.ts` | NEW resolver |
| `src/lib/services/alerting/alert-client.ts` | Auto-resolve runbookId |
| `src/lib/services/incident-management/index.ts` | Add runbookIds field + auto-attach |
| `src/pages/admin/FCC11IncidentResponseTimeline.tsx` | Show linked runbooks |
| `supabase/functions/runbook-drill/index.ts` | NEW drill harness |
| `supabase/migrations/<ts>_runbook_drills.sql` | NEW drill results table + incidents columns |
| `src/lib/support/runbook-drill-status.ts` | NEW drill status API |
| `src/lib/support/runbook-registry.ts` | Add coverage for missing mandatory subsystem |
| `scripts/architecture/checks/check-runbook-coverage.ts` | Add drill-recency + alert-source assertions |
| `src/lib/truth-manifests/manifest-registry.ts` | Register operability report (112 → 113) |
| `generated/runbook-operability-report.json` | NEW baseline |

### Acceptance

- `/admin/support` → Runbooks tab shows the 19 real runbooks from `RUNBOOK_REGISTRY` (no demo content)
- `raiseAlert({ subsystem: "ai-providers", severity: "high", ... })` auto-attaches `runbook_id = "RB-002"` without explicit pass-through
- New incidents declared with `affectedServices: ["ai-gateway"]` show `runbookIds: ["RB-002", "RB-010"]` in timeline
- Calling `runbook-drill` for RB-001 in dry-run mode produces a `runbook_drill_results` row and updates `lastTestedAt` displayed in FCC04
- `check-runbook-coverage.ts` reports `19/19 subsystems covered` and `criticalRunbooksWithRecentDrill ≥ 5`
- `generated/runbook-operability-report.json` exists with `ok: true`
- Manifest registry shows 113 entries; Gate 37 stays green
- Checklist 22 truthfully **16/16 — fully deployable**

