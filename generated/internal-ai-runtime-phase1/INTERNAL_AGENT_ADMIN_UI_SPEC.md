# Internal Agent Admin UI — Specification

**Routes:**
- `/admin/ai-runtime/internal-agents` → `src/pages/admin/ai-runtime/InternalAgentsBoard.tsx` (492 LOC)
- `/admin/ai-runtime/councils` → `src/pages/admin/ai-runtime/CouncilsBoard.tsx` (334 LOC)

Both are mounted in `AIRuntimeHome` modules and gated by the `ai-runtime.read` admin permission.

## `/admin/ai-runtime/internal-agents`

### Page contract

| Section | Source | Behaviour |
|---|---|---|
| Header | `NightlyProofBadge` + manual-trigger button | Shows latest nightly proof timestamp; manual trigger POSTs to `internal-agent-loop` with `{trigger:"manual"}`. |
| Filters | Council, status, autonomy, maturity | Client-side filter over real query result. |
| Agent table | `internal_agent_definitions ⋈ internal_agent_runtime_state` | One row per agent; columns: name, council, status, autonomy (current/max), trust score (0–1), last run, last success, consecutive failures, schedule. |
| Row click | Opens drilldown drawer | Loads `AIRuntimeDrilldownPanel` (canonical, 259 LOC) with Actions / Budget / Health tabs scoped to the agent. |
| Per-row actions | Suspend, resume, downgrade autonomy, run-now | Each writes a `supervisor_decisions` row with `supervisor_key='meta-supervisor'` (operator-as-meta) and updates `internal_agent_runtime_state`. |
| Drawer "Recent escalations" | `council_escalations` filtered by `source_agent_id` | Deep-link to `/admin/ai-gateway/receipts/:id` for each linked receipt. |

### Drilldown tabs (canonical primitive)

`AIRuntimeDrilldownPanel`:
- **Actions** — `internal_agent_actions` rows with status badges; deep-link to `ai_action_receipts` row.
- **Budget** — derived from `ai_workforce_invocations.cost_cents` filtered by `role_key=agent_id`; renders today / 7d / 30d.
- **Health** — runtime_state snapshot: trust score, consecutive failures, cooldown, suspension reason, suspended_by.

## `/admin/ai-runtime/councils`

### Page contract

| Section | Source | Behaviour |
|---|---|---|
| Header | Council count, total agents, open escalations across councils | Aggregated client-side. |
| Council cards (6) | One per council key | Each shows: agent count, active vs paused/suspended, recent actions (24h), open escalations, supervisor key, supervisor's recent decisions. |
| Card "View agents" | Filters `/internal-agents` by council | URL query `?council=...`. |
| Card "Recent escalations" | `council_escalations` filtered by `source_council` | Click opens escalation detail with rationale + evidence. |
| Cross-council banner | If any escalation has `status='escalated_to_meta'` | Routes to meta-supervisor view. |

## UX guarantees (audited)

- ✅ No placeholder cards — every panel reads real DB rows.
- ✅ No mocked counts — aggregations run against `internal_agent_*` and `ai_workforce_invocations`.
- ✅ Operator-usable under pressure — answers "what is running, what failed, what escalated, what is paused, what needs attention" in ≤2 clicks.
- ✅ Integrated with admin shell, AI runtime navigation, and role-based access (`has_admin_permission`).
- ✅ Reuses canonical `ConnectorStateBadge` / `AIRuntimeDrilldownPanel` / `NightlyProofBadge` — no duplicate primitives.

## Validator coverage

`scripts/validation/check-admin-ai-runtime-drilldowns.ts` asserts that `InternalAgentsBoard` imports both `AIRuntimeDrilldownPanel` and `NightlyProofBadge`.  
`scripts/validation/check-internal-agent-admin-pages.ts` asserts that `AIRuntimeHome` registers both `internal-agents` and `councils` modules and the routes resolve.
