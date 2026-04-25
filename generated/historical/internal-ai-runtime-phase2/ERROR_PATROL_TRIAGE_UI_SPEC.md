# /admin/health/error-patrol — UI Spec

## Route
`/admin/health/error-patrol` — gated by `maintenance.view`. Mounted in `AdminRoutes.tsx` under the Health hub.

## Data source
Single read-only view: `error_patrol_triage_view` (joins detections → agent actions → intents → receipts → rollback availability).

## Layout
1. **Header** — Title + master kill-switch badge (live vs. HALTED reading from `automation_kill_switches.KS-INTERNAL-AGENTS-EXECUTE`)
2. **Severity counters** — critical / high / medium / low, derived from current rows
3. **Detections table** — pattern, severity, subsystem, frequency, last seen, agent action (agent → class + status), rollback availability, inspect button
4. **Drilldown drawer** (Sheet) — three tabs:
   - **Detection** — status, target, linked incident link, follow-up recommendation, raw `precondition_evidence`
   - **Agent action** — agent id, action class, triggered_by, outcome, full `gate_results` JSON
   - **Receipt & rollback** — receipt id, intent id, reversibility, reverse class, rollback plan JSON, action buttons:
     - **Trigger rollback** — calls `internal-agent-execute-action` with `reverse_action_class` (operator-initiated)
     - **Acknowledge** — sets detection `status='acknowledged'`
     - **Mute pattern** — sets all rows of same `pattern_key` to `status='muted'`
     - **Open incident** — link to `/admin/health/incidents`

## No fake data
Empty state explicitly states "No active detections" rather than showing skeleton placeholders.
