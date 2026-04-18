# Internal AI Runtime — Phase 2 Closure Audit (Final)

**Status: PHASE 2 CLOSED — DEPLOYABLE**
Generated: 2026-04-18

## Scope (what Phase 2 actually delivers)

Constrained autonomous action execution for the internal AI workforce, gated by 7 hard safety checks, with full operator visibility and one-click rollback for every reversible class.

**In scope:**
- 3 priority agents wired signal→action: `aw-incident-response`, `aw-ai-spend-control`, `aw-security-monitor`
- 8 reversible action classes through `internal-agent-execute-action`
- Single safety brain via `evaluate_action_safety_gates` RPC
- Master kill-switch `KS-INTERNAL-AGENTS-EXECUTE` backfilled for every admin
- Operator triage at `/admin/health/error-patrol`
- AI Engineer intent timeline at `/admin/ai-runtime/internal-agent-intents`

**Explicitly out of scope (Phase 3+):**
- Self-modifying RLS policies
- Cross-tenant remediation
- Autonomous code changes

## 8 BLOCK validators (release gate)

| # | Gate | Verifies |
|---|------|---------|
| 1 | `internal-agent-execute-action` | Edge function exists, calls safety RPC, persists intent |
| 2 | `autonomous-action-safety-gates` | 7 named gates present in migration |
| 3 | `autonomous-action-receipts` | Every executed intent writes `ai_action_receipts` |
| 4 | `autonomous-action-rollback-coverage` | Every reversible class has handler + persisted plan |
| 5 | `error-patrol-triage-page` | Operator surface routed and admin-only |
| 6 | `agent-primitive-wiring` | Loop references all 4 action surfaces |
| 7 | `priority-bridge-wiring` | 3 agents bridged via 3 helper RPCs, no executor bypass |
| 8 | `kill-switch-backfill` | Master switch + helpers seeded with service-role grants |

Aggregator gate count: **64 → 72**.

## Architecture (single safety brain)

```
agent loop (every 5min)
  └─ list_*_RPC()          ← service-role-only helpers
       └─ runPriorityAgentBridges()
            └─ POST /internal-agent-execute-action
                 └─ evaluate_action_safety_gates() ← THE choke point
                      ├─ kill-switch (KS-INTERNAL-AGENTS-EXECUTE)
                      ├─ whitelist
                      ├─ precondition
                      ├─ rollback_plan
                      ├─ rate_limit
                      ├─ autonomy
                      └─ approval_threshold → ai_workforce_approval_queue
                 └─ handler (clear_stale_lock | disable_unhealthy_connector | …)
                 └─ ai_action_receipts INSERT
                 └─ internal_agent_action_intents UPDATE (executed | denied)
```

Every UI rollback button calls the *same* edge function with the reverse class. There is no second path.

## Operator surfaces

- `/admin/health/error-patrol` — triage live detections, ack/mute/resolve, trigger reverse
- `/admin/ai-runtime/internal-agent-intents` — full timeline with gate strip, lifecycle, raw JSON, reverse button

Both are admin-permission gated; both stream via Realtime.

## Confidence policy (signal→action bridges)

| Agent | Action class | Confidence | Routing |
|-------|--------------|------------|---------|
| aw-incident-response | clear_stale_lock | 0.85 | direct execute |
| aw-incident-response | restart_workflow | 0.85 | direct execute |
| aw-ai-spend-control | disable_unhealthy_connector | 0.72 | forced approval queue |
| aw-security-monitor | (escalate-only) | n/a | council_escalations |

Spend-control is intentionally below the 0.80 auto-execute threshold so every disable goes through human approval — matches the "no autonomous money / connector kills" governance constraint.

## What is *not* automated

- Code edits, schema changes, RLS policy mutations — all manual
- Connector enable (only disable is automated; re-enable always human)
- Anything not on `internal_agent_action_whitelist`

## Verification commands

```bash
npm run phase2:run-all          # 8 BLOCK validators
npm run release:readiness:full  # full 72-gate aggregator
```

All 8 Phase 2 gates **GREEN**. Deployable.

## Active Caveats

- Autonomous actions are clamped to `safe_class IN ('safe','reversible')` — destructive classes always require human approval and never auto-execute.
- Trust score and autonomy ceiling are governed by the EWMA reflection RPC; no surface in the codebase may write `trust_score` directly.
- Rollback paths are required per action; missing rollback metadata fails the `autonomous-action-rollback-coverage` gate.
- All Phase 2 receipts are append-only and signed; the bridge status contract is enforced by `check-bridge-status-contract.ts`.
