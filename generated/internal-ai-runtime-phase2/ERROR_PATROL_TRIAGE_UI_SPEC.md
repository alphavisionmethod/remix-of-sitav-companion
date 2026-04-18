# Error Patrol Triage UI — Operator Spec

## Route
`/admin/health/error-patrol` — gated by `maintenance.view`.

## Page
`src/pages/admin/health/ErrorPatrolBoard.tsx`

## Data Source
- Read: `error_patrol_triage_view` (joins detections → actions → receipts → rollback availability)
- Mutations: 4 SECURITY DEFINER RPCs
  - `acknowledge_error_patrol_detection(_detection_id)`
  - `mute_error_patrol_pattern(_pattern_key, _hours)`
  - `resolve_error_patrol_detection(_detection_id, _notes)`
  - `record_error_patrol_detection(...)` (system-side aggregator)

## Layout
1. **Severity counters bar** — critical / high / medium / low (live counts, last 24h)
2. **Master kill-switch badge** — `KS-INTERNAL-AGENTS-EXECUTE` state via `automation_kill_switches`
3. **Triage table** — pattern, severity, subsystem, frequency, last seen, agent that acted, action class, rollback availability
4. **Drilldown drawer** with 3 tabs:
   - **Detection** — raw signal + precondition_evidence
   - **Action** — intent row + executed action + 7-gate results
   - **Receipt & Rollback** — receipt deep-link + Trigger Rollback button (when `rollback_status='available'` and operator has `health.repair`)

## Operator Actions (4)
| Action | Effect |
|---|---|
| Acknowledge | RPC sets status=acknowledged + `acknowledged_by` |
| Trigger rollback | POST to `internal-agent-execute-action` with `reverse_action_class` |
| Open linked incident | Deep-link to `/admin/health/incidents/<id>` |
| Mute pattern 24h | RPC sets status=muted + `muted_until=now()+24h` |

## Component Reuse
- `Card`, `Badge`, `Button`, `Tabs`, `Sheet` from `@/components/ui/*`
- `useAuth()` from `@/platform/auth`
- `supabase` client from `@/integrations/supabase/client`
- No duplicate fetcher — single `useEffect` reading the canonical view
