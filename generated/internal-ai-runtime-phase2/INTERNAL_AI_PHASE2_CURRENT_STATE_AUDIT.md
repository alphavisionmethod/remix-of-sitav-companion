# Internal AI Phase 2 — Current State Audit

## Verified Real (post-implementation)

### Database Layer (1 migration, 0 schema duplicates)
- ✅ `internal_agent_action_intents` table — pre-execution intents with rollback_plan, gate_results, status lifecycle
- ✅ `internal_agent_action_whitelist` table — 6 canonical action classes seeded
- ✅ `error_patrol_detections` table — aggregated from existing self-healing/incident emitters
- ✅ `error_patrol_triage_view` — joins detections → actions → receipts → rollback availability
- ✅ `evaluate_action_safety_gates` RPC — 7 gates, SECURITY DEFINER, admin-guarded
- ✅ `record_error_patrol_detection`, `acknowledge_…`, `mute_…`, `resolve_…` RPCs
- ✅ `seed_master_internal_agent_kill_switch` + auto-seed trigger on admin grant

### Execution Layer
- ✅ `internal-agent-execute-action` edge function — 6 canonical handlers + 2 rollback handlers
- ✅ Calls `evaluate_action_safety_gates` (no in-function safety logic — single brain)
- ✅ Routes `requires_approval` → `ai_workforce_approval_queue` (no second approval system)
- ✅ Persists `internal_agent_action_intents` → `internal_agent_actions` → `ai_action_receipts`

### Runtime Wiring
- ✅ `internal-agent-loop` extended with 3 bridge functions (`bridgeIncidentResponse`, `bridgeSpendControl`, `bridgeSecurityMonitor`)
- ✅ Bridges call executor over HTTP (service-role auth) — never bypass safety RPC
- ✅ `aw-incident-response` and `aw-ai-spend-control` bumped to `constrained_action_ready`
- ✅ `aw-security-monitor` stays at `recommend` — escalate-only in Phase 2

### Operator Surface
- ✅ `src/pages/admin/health/ErrorPatrolBoard.tsx` — reads `error_patrol_triage_view`
- ✅ Route `/admin/health/error-patrol` registered in `src/routes/AdminRoutes.tsx` under `maintenance.view`
- ✅ 4 operator actions wired: Acknowledge, Rollback, Open incident, Mute 24h

### Validators (6 BLOCK gates, all in scripts/validation/)
- ✅ `check-internal-agent-execute-action.ts`
- ✅ `check-autonomous-action-safety-gates.ts`
- ✅ `check-agent-primitive-wiring.ts`
- ✅ `check-error-patrol-triage-page.ts`
- ✅ `check-autonomous-action-receipts.ts`
- ✅ `check-autonomous-action-rollback-coverage.ts`

### Aggregator
- ✅ `check-os-release-readiness.ts` REQUIRED_GATES bumped from 58 → 64
- ✅ `phase2:run-all` npm script added
- ✅ `release:readiness:full` includes phase2:run-all in pipeline

## Zero-Stub / Zero-Duplicate Verification
- 0 new tables outside the 4 declared (intents, whitelist, detections + view)
- 0 in-loop action handlers (loop only calls executor)
- 0 secondary receipt ledgers (uses canonical `ai_action_receipts`)
- 0 secondary approval queues (uses canonical `ai_workforce_approval_queue`)
- 0 secondary kill-switch tables (uses canonical `automation_kill_switches`)
