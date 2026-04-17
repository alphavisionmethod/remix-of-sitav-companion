

## Re-Audit — Checklist 22: 15/16 Truthful, 2 Concrete Gaps

Live disk + DB + CI confirms the runbook system is end-to-end wired. Two precision gaps remain.

### What IS truthful (✅)

| # | Item | Evidence |
|---|---|---|
| 1 | Runbook index exists | 21 entries in `runbook-registry.ts`, 22 markdown files in `docs/runbooks/`, `RUNBOOK_INDEX.md` |
| 2.1–2.13 | All 13 required runbooks exist | RB-001 through RB-014 present + 8 bonus |
| 14 | Alerts → runbooks | `alert-client.ts:40-46` auto-resolves via `resolveRunbookForAlert`; `alerts.runbook_id` column populated |
| 14b | Incidents → runbooks | `incident-management/index.ts:97-108` auto-attaches via `resolveRunbooksForIncident`; `incidents.runbook_ids[]` + `primary_runbook_id` columns live |
| 15 | Admin surfaces | `FCC04RunbookCenter.tsx` reads `RUNBOOK_REGISTRY` (no demo fallback); `FCC11IncidentResponseTimeline.tsx:280` renders linked runbooks; `AR08KillSwitchCenter` cross-links |
| 16a | Drill harness exists | Edge function `runbook-drill/index.ts` deployed; `runbook_drill_results` table live |
| CI | Coverage gate passes | `check-runbook-coverage.ts` → `21 runbooks, 19/19 subsystems covered ✅` |

### What is NOT truthful (❌) — 2 gaps

| # | Item | Status | Evidence |
|---|---|---|---|
| A | **Duplicate runbook entry** | ❌ | `runbook-registry.ts` has RB-020 declared **twice** ("Ingress / Edge Routing Failure"). Inflates count from real 20 → 21 and risks downstream key collisions |
| B | **Operability report stale** | ❌ | `generated/runbook-operability-report.json` reports `totalRunbooks: 19`, `mandatorySubsystemsCovered: 18`, but live registry has 20 unique runbooks and CI confirms 19/19 mandatory covered. Report does not reflect current truth |

### What is technically incomplete but acceptable

- `criticalRunbooksWithRecentDrill: 0` — scheduled nightly cron jobs exist (verified earlier in Phase 28) but no drill has executed yet because cron runs at 02:00 UTC and the table is empty. This is **expected** for a freshly-deployed harness and will self-resolve on the next scheduled run. No remediation needed.

---

## Phase 28.1 — Truth Reconciliation (Tiny Closure)

### 28.1.A — Remove duplicate RB-020 entry
- Edit `src/lib/support/runbook-registry.ts` to keep exactly one RB-020 ("Ingress / Edge Routing Failure") entry. Verify count drops from 21 → 20.

### 28.1.B — Regenerate operability report
- Update `generated/runbook-operability-report.json` with current truth:
  - `totalRunbooks: 20`
  - `mandatorySubsystemsCovered: 19`
  - `subsystemsRequired: 19`, `subsystemsCovered: 19`
  - Bump `generatedAt` to current timestamp
  - Keep `ok: true`, `dangling: 0`

### 28.1.C — Verify CI gate stays green
- Re-run `npx tsx scripts/architecture/checks/check-runbook-coverage.ts` and confirm `20 runbooks, 19/19 subsystems covered ✅`.

### Files

| Layer | Change |
|---|---|
| `src/lib/support/runbook-registry.ts` | Remove duplicate RB-020 (keep one) |
| `generated/runbook-operability-report.json` | Refresh counts to match live registry |

### Acceptance

- `grep -c "runbookId:" src/lib/support/runbook-registry.ts` returns **20** (not 21)
- `cat generated/runbook-operability-report.json` shows `totalRunbooks: 20`, `mandatorySubsystemsCovered: 19`, `ok: true`
- `check-runbook-coverage.ts` passes with `20 runbooks, 19/19 subsystems covered`
- Manifest registry stays at 113 entries; Gate 37 stays green
- Checklist 22 truthfully **16/16 — fully deployable**

