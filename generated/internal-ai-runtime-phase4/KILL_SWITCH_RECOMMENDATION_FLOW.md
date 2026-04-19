# Kill-Switch Recommendation Flow

## Principle

AI agents **recommend**. Admins **arm**. No exceptions.

## Flow

```
security agent (e.g., st-fraud-abuse, st-security-monitor)
        │
        │ detects threshold breach (e.g., 100× admin action burst)
        ▼
calls security-kill-switch-recommender  (POST)
        │
        ▼
propose_kill_switch_recommendation RPC
        │
        │ creates kill_switch_recommendations row, status=pending
        │ recommendation_id returned to caller
        ▼
/admin/ai-runtime/kill-switch-recommendations  (board, audit.view-gated)
        │
        │ admin reviews evidence packet
        │ if intent to arm:
        ▼
/admin/health/kill-switches  (existing canonical console)
        │
        │ admin opens existing dual-admin approval flow
        │ pastes recommendation_id into justification
        ▼
kill_switch_approvals  (existing table, dual-admin enforced)
        │
        ▼
arm_kill_switch (canonical action — NEVER called by Phase 4 functions)
```

## Recommendation packet

| Field | Type | Purpose |
|---|---|---|
| `switch_id` | text | Which kill switch to arm |
| `source_finding_id` | uuid? | Link to `security_council_findings` |
| `source_agent_id` | text | Proposer agent |
| `severity` | enum | low/medium/high/critical |
| `recommended_action` | enum | activate / deactivate |
| `reason` | text | Human-readable rationale |
| `evidence` | jsonb | Triggering evidence (action counts, timestamps, etc.) |
| `blast_radius` | enum | unknown / single-tenant / single-service / multi-service / platform-wide |
| `urgency` | enum | low / normal / high / critical |
| `status` | enum | pending → acknowledged → approved_for_arming \| rejected \| superseded |
| `approval_id` | uuid? | Set when admin links to a `kill_switch_approvals` row |

## Hard guardrails (CI-enforced)

| Gate | What it forbids |
|---|---|
| `kill-switch-recommendation-flow` | `arm_kill_switch`, `activate_kill_switch`, `kill_switch_state`, `set_kill_switch_active` calls in recommender |
| `no-direct-security-auto-apply` | Same, plus DDL bans |

## Receipts & visibility

- Recommendation row itself is the audit anchor (created_at, source_agent_id, evidence).
- When the admin acts, the existing `kill_switch_audit_log` captures the actual arming.
- The two are linked via `approval_id` → `kill_switch_approvals.id`.

## Why a separate table from `ai_implementation_suggestions`

Kill-switch arming is operationally distinct from code/policy proposals:
- Different reviewer (operations team vs engineering team)
- Different urgency profile (often minutes, not days)
- Different audit chain (links to `kill_switch_approvals`, not migrations)
- Different blast-radius semantics

Reusing the suggestions table would conflate two workflows. The `kill_switch_recommendations`
table is **the** canonical AI→ops handoff — there is no parallel system.
