

## Phase 2 — Safe Autonomous Actions (Admin AI Engineering only)

### Reality check (what already exists vs. what's missing)

**Already real (verified via DB + code search):**
- `internal_agent_actions`, `internal_agent_runtime_state`, `internal_agent_definitions`, `council_escalations`, `supervisor_decisions` — 5 tables, 40 agents seeded, runtime loop scheduled every 5min via pg_cron
- `internal-agent-loop` edge function (611 LOC) — does observe/diagnose/recommend, writes action rows, respects budget + kill-switches
- Canonical primitives present: `ai_workforce_invocations`, `ai_action_receipts`, `ai_usage_ledger`, `ai_provider_health`, `ai_fallback_events`, `ai_budget_alerts`, `automation_kill_switches`, `kill_switch_audit_log`, incident/self-healing services
- `ro-incident-response`, `rc-cost-sentinel`, `st-security-monitor` exist as **definitions only** — Phase 1 routes them through observe/diagnose; they cannot execute.

**The actual Phase 2 gap:**
1. No constrained-action edge function — agents have no way to *act*.
2. No safe-action whitelist or 7-gate safety pipeline for internal agents.
3. No rollback ledger linking action → reverse-action plan.
4. No `/admin/health/error-patrol` triage page.
5. The 3 priority agents have no signal-to-action bridge wired into the runtime loop.

---

### Five deployable phases

---

### Phase 1 — DB foundation (one migration)
- New table `internal_agent_action_intents`: pre-execution intent rows (precondition snapshot, rollback plan, gate results, status: `pending|executing|executed|rolled_back|failed|denied`). Links to `internal_agent_actions.id` once executed. RLS: admin-only via `has_role(_, 'admin')`.
- New table `internal_agent_action_whitelist`: `(action_class, max_autonomy_required, requires_approval_above_confidence, rate_limit_per_hour, requires_rollback, target_resource_type, gate_function_name)`. Seeded with the 6 canonical classes only (`restart_workflow`, `replay_workflow`, `clear_stale_lock`, `rotate_expired_token`, `disable_unhealthy_connector`, `trigger_safe_repair_path`).
- New table `error_patrol_detections`: `(pattern_key, severity, subsystem, first_seen, last_seen, frequency, status, linked_incident_id, linked_agent_action_id, follow_up_recommendation)`. Backed by triggers from existing self-healing/incident emitters — **no new event source, only aggregation**.
- One read-only view `error_patrol_triage_view` joining detections → agent actions → receipts → rollback availability for the UI.
- New SECURITY DEFINER RPC `evaluate_action_safety_gates(_agent_id, _action_class, _target_id, _confidence, _precondition_evidence)` returns `{allowed, gate_results[], denial_reason, rollback_plan, requires_approval}`. Centralizes all 7 gates so both edge function and admin UI use one truth.

### Phase 2 — `internal-agent-execute-action` edge function
- New edge function (deno) — sole constrained-action entry point. Accepts `{agent_id, action_class, target_id, confidence, precondition_evidence, correlation_id}`.
- Pipeline: validate JWT/service-role → load agent + whitelist row → call `evaluate_action_safety_gates` RPC → if `requires_approval` route to existing `ai_workforce_approval_queue` (no new approval system) → if allowed, write `internal_agent_action_intents` row with rollback plan → execute the action class via existing primitive (workflow runner / connector pause / token rotation client) → write `internal_agent_actions` + `ai_action_receipts` rows → update intent to `executed` with receipt id.
- 6 action handlers, each calling existing primitives:
  - `restart_workflow` → existing workflow-runner repair endpoint
  - `replay_workflow` → existing workflow replay service
  - `clear_stale_lock` → DB update on `workflow_locks` (lock_holder cleared, audit row)
  - `rotate_expired_token` → existing connector token refresh path
  - `disable_unhealthy_connector` → `connector_accounts.status = 'paused'` + `timeline_events` emit
  - `trigger_safe_repair_path` → invokes self-healing service `runRepairPath(repair_key)`
- Hard caps: rate limit 10/hour/agent, kill-switch `KS-INTERNAL-AGENTS-EXECUTE` checked first, autonomy must be ≥ `constrained_action_ready` (L6 in the existing rights model).
- `verify_jwt = false` + in-code admin check for human-triggered calls; service-role bypass for runtime-loop calls.

### Phase 3 — Wire the 3 priority agents into the runtime loop
- Extend `internal-agent-loop` agent handlers (no new loop):
  - **`ro-incident-response`**: subscribes to `incidents` rows where `status='open'` AND `agent_id IS NULL`. Selects safest matching action class from whitelist; calls `internal-agent-execute-action`. Failure → escalation row.
  - **`rc-cost-sentinel`**: queries `ai_budget_alerts` where `state IN ('warning','critical')` last 1h + `ai_fallback_events` last 1h. Allowed actions: `disable_unhealthy_connector` (only for non-critical capability classes), and approval-bound `trigger_safe_repair_path` for budget-policy review.
  - **`st-security-monitor`**: queries `kill_switch_audit_log` + `admin_action_audit_log` for anomalies (rapid switch toggles, off-hours admin actions). Phase-2 scope: **escalate only**, no execute. Writes `council_escalations` row to `security-trust-supervisor` with evidence.
- Each agent uses the existing `evaluate_action_safety_gates` RPC — zero duplicate gating.
- Agent definition updates via `seed_internal_agents_from_json`: bump `current_autonomy_level` of incident-response and cost-sentinel to `constrained_action_ready`; security-monitor stays at `recommend` for Phase 2.

### Phase 4 — `/admin/health/error-patrol` triage UI
- New route in admin shell under Health domain (existing `AdminControlPlaneShell`, gated by `has_admin_permission(_, 'health.view')`).
- Single page `ErrorPatrolBoard.tsx` reading `error_patrol_triage_view`:
  - Top: severity-bucketed counters (critical / high / medium / low) + `KillSwitchAwareBadge` for `KS-INTERNAL-AGENTS-EXECUTE` state.
  - Main table: pattern, severity, subsystem, frequency, last seen, agent that acted, action class, rollback availability badge (`available | none | already_rolled_back`), receipt link.
  - Row drilldown drawer (reuses `AIRuntimeDrilldownPanel` shape — no duplicate fetcher): tabs **Detection** (raw signal + precondition evidence) / **Action** (intent row + executed action + gate results) / **Receipt & Rollback** (receipt deep-link, rollback button if `available` and operator has `health.repair`).
  - Actions: "Acknowledge", "Trigger rollback" (calls `internal-agent-execute-action` with reverse class), "Open linked incident", "Mute pattern 24h".
- Add `/admin/health/error-patrol` to `ADMIN_ROUTE_REGISTRY` and the Health domain hub modules array.

### Phase 5 — Validators + deliverables + aggregator bump
- 6 BLOCK validators (each emits `GateReport` via `emitGateReport`):
  - `check-internal-agent-execute-action.ts` — function exists, has 6 handlers, calls gate RPC.
  - `check-autonomous-action-safety-gates.ts` — `evaluate_action_safety_gates` RPC exists, all 7 gate checks present.
  - `check-agent-primitive-wiring.ts` — `internal-agent-loop` references the 3 agent handlers + safety gate RPC.
  - `check-error-patrol-triage-page.ts` — `ErrorPatrolBoard` imports the view + reuses `AIRuntimeDrilldownPanel`; route registered.
  - `check-autonomous-action-receipts.ts` — every `internal_agent_actions` row with `action_type IN whitelist` has matching `ai_action_receipts.id`.
  - `check-autonomous-action-rollback-coverage.ts` — every executed intent has non-null `rollback_plan` for reversible classes.
- 9 deliverables in `generated/internal-ai-runtime-phase2/` (the exact filenames listed in the prompt, including the 3 status JSONs).
- Aggregator bump 58 → 64 in `check-os-release-readiness.ts`; add `phase2:run-all` to `package.json`.

---

### Cross-cutting (enforced every phase)
- **Zero duplicate stacks**: all execution flows through the existing receipt/budget/kill-switch/approval tables. No second action ledger.
- **Zero stubs**: every handler invokes a real primitive that exists today.
- **Zero unsafe autonomy**: 6-class whitelist is the only allowed surface; security-monitor is escalate-only in Phase 2.
- **Reuse, not rebuild**: `evaluate_action_safety_gates` RPC is the single safety brain; both edge function and UI rollback button use it.
- **Operator visibility first**: every executed action is queryable from `/admin/health/error-patrol` with full lineage in ≤2 clicks.
- **Rollback-first**: `internal_agent_action_intents.rollback_plan` populated *before* execution for all reversible classes; non-reversible classes blocked unless approval-routed.

