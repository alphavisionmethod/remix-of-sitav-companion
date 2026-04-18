# Agent → Primitive Wiring Map — Phase 2

The 3 priority agents are bridged to constrained primitives by dedicated
bridge functions inside `supabase/functions/internal-agent-loop/index.ts`.
Each bridge runs once per scheduled tick (after the per-agent observe/diagnose
loop) and routes signals through the canonical executor — never directly.

## aw-incident-response
| Signal source | Trigger condition | Action class | Confidence | Routing |
|---|---|---|---|---|
| `incidents` (status=open, agent_id=null) | `metadata.lock_holder` present | `clear_stale_lock` | 0.78–0.88 | executor → 7 gates → execute or escalate |
| `incidents` (status=open, agent_id=null) | otherwise | `restart_workflow` | 0.78–0.88 | executor → 7 gates |

**On denial:** writes `council_escalations` row → `reliability-ops-supervisor`.
**Autonomy:** `constrained_action_ready` (auto-execute when gates pass).

## aw-ai-spend-control
| Signal source | Trigger condition | Action class | Confidence | Routing |
|---|---|---|---|---|
| `ai_budget_alerts` (state='critical') | last 1h | `disable_unhealthy_connector` | 0.72 (sub-threshold) | executor → 7 gates → **approval_pending** |
| `ai_fallback_events` | last 1h, used as evidence | n/a | n/a | feeds `precondition_evidence` |

**Confidence 0.72 < 0.80 threshold:** every spend-control action is approval-gated. No silent execution.
**Autonomy:** `constrained_action_ready` (gated by approval threshold).

## aw-security-monitor
| Signal source | Trigger condition | Action | Routing |
|---|---|---|---|
| `kill_switch_audit_log` | ≥3 toggles/h on same switch | escalate | `council_escalations` → `security-trust-supervisor` |
| `admin_action_audit` | UTC 02:00–06:00 with >5 actions/h | escalate | `council_escalations` → `security-trust-supervisor` |

**Phase 2 scope:** escalate-only. No execution rights. Severity inferred from frequency.
**Autonomy:** `recommend` (Phase 3 will upgrade to action after track record).

## Wiring Invariants
- Every bridge calls `internal-agent-execute-action` (HTTP) or writes `council_escalations` (direct insert) — nothing else.
- Bridges respect kill-switches and rate limits transitively (the executor enforces them).
- Bridge failures never crash the loop; they collect errors into the response payload.
