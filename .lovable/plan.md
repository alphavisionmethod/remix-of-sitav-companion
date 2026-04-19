
The user wants Phase 4 — Security Council Runtime. Let me audit what already exists vs. what needs to be built.

Existing assets (from memory + file excerpts):
- 7 security-trust agents already defined in `src/lib/internal-agents/agents/security-trust.ts` (st-security-monitor, st-permission-drift, st-policy-review, st-trust-threshold, st-fraud-abuse, st-audit-completeness, st-privacy-boundary)
- `internal-agent-loop` runtime + `internal_agent_runtime_state` + `internal_agent_action_intents` tables
- `ai_implementation_suggestions` table + `propose_implementation_suggestion` RPC (Phase 3)
- `kill_switch_approvals` + `kill_switch_audit_log` + dual-approval workflow
- `secret-rotation-orchestrator` edge function + RB-SECRET-ROTATION runbook
- `admin_action_audit`, `ai_action_receipts`, `ai_inference_receipts` tables
- `pg_policies`, `user_roles`, `admin_role_permissions` tables
- `internal-agent-policy-architect` edge function (drafts only, never auto-applies — gate `policy-draft-never-auto-apply` enforces this)
- Phase 3 EWMA trust enforcement via `record_internal_agent_reflection` RPC
- Admin AI runtime shell with audit.view gating
- 117/124 BLOCK gates green
- `error_patrol_detections`, `ai_budget_alerts` for anomaly signals

Missing / to-build:
1. A real scheduled invocation path that exercises ALL 7 security agents (currently the loop picks agents generically; need a security-council-tick that ensures each runs on cadence with real observation queries)
2. New table `security_council_findings` for durable per-agent findings with evidence
3. New table `kill_switch_recommendations` (separate from suggestions — these are recommendation packets that route into existing `kill_switch_approvals` workflow without arming)
4. New table `secret_rotation_triggers` for anomaly-driven rotation packets
5. Edge function `security-council-tick` (orchestrates 7 agents per cadence, produces findings, routes to suggestions/recommendations/rotations)
6. Edge function `security-kill-switch-recommender` (validates threshold breach, creates recommendation, posts to existing approval queue)
7. Edge function `security-anomaly-rotation-trigger` (validates anomaly, calls existing `secret-rotation-orchestrator` with dryRun=true, persists receipt)
8. RPC `record_security_finding` (service-role only, idempotent)
9. RPC `propose_kill_switch_recommendation` (idempotent, links into existing kill_switch approval)
10. RPC `trigger_anomaly_secret_rotation` (idempotent, invokes orchestrator)
11. 3 admin pages: `/admin/ai-runtime/security-council`, `/admin/ai-runtime/kill-switch-recommendations`, `/admin/ai-runtime/anomaly-rotations` (audit.view gated, AI engineering team only)
12. AIRuntimeHome tile additions for the 3 boards
13. 6 BLOCK validators (gates #125–#130) + registry registration
14. pg_cron schedule: `sita-security-council-tick` hourly
15. 11 generated/internal-ai-runtime-phase4/ artifacts
16. Runbook `docs/runbooks/security-council-operations.md`

Constraint compliance:
- All policy changes → drafts only via existing `internal-agent-policy-architect` (already gate-enforced)
- Kill-switch: recommendations only, route into existing `kill_switch_approvals` (dual approval preserved)
- Secret rotation: invoke existing `secret-rotation-orchestrator` with `dryRun: true` only — actual execution still requires existing dual-admin flow
- L3 ceiling preserved
- EWMA trust governance preserved
- All write paths use service-role RPCs with idempotency keys
- All admin pages use `audit.view` permission gate (AI engineering team scope)

## Phase 4 plan — 5 sequential phases

### Phase 4.1 — Database foundations
Migration creating:
- `security_council_findings` (id, agent_id, finding_type, severity, evidence jsonb, source_signal_ref UNIQUE, status, created_at)
- `kill_switch_recommendations` (id, switch_id, source_finding_id FK, severity, evidence jsonb, status, approval_id FK→kill_switch_approvals nullable, created_at)
- `secret_rotation_triggers` (id, secret_scope, source_finding_id FK, anomaly_evidence jsonb, orchestrator_dryrun_result jsonb, status, receipt_id, created_at)
- RLS: admin SELECT (audit.view), service-role-only INSERT
- RPCs: `record_security_finding`, `propose_kill_switch_recommendation`, `trigger_anomaly_secret_rotation` (all SECURITY DEFINER, idempotent)
- Indexes on agent_id, source_signal_ref, severity, created_at

### Phase 4.2 — Security council edge functions
- `security-council-tick`: scheduled tick, runs all 7 agents in turn against real signals (admin_action_audit for monitor/fraud, user_roles+admin_role_permissions for drift, pg_policies for policy-review, internal_agent_runtime_state+reflections for trust-threshold, ai_action_receipts coverage for audit-completeness, cross-tenant query patterns for privacy-boundary). Each finding goes through `record_security_finding`. Severity-tiered findings auto-route via `propose_implementation_suggestion` (Phase 3) for policy gaps.
- `security-kill-switch-recommender`: validates threshold breach, calls `propose_kill_switch_recommendation`, posts into `kill_switch_approvals` queue with `proposed_by_agent` flag (no arming).
- `security-anomaly-rotation-trigger`: validates anomaly, calls existing `secret-rotation-orchestrator` with `dryRun: true`, persists result, requires human to execute via existing runbook.

### Phase 4.3 — Admin UI (AI engineering team only)
- `/admin/ai-runtime/security-council` — board listing findings by agent/severity with evidence drilldown
- `/admin/ai-runtime/kill-switch-recommendations` — pending recommendations with link to existing approval queue
- `/admin/ai-runtime/anomaly-rotations` — anomaly triggers with dryRun results and link to RB-SECRET-ROTATION
- All gated by `audit.view` permission, registered in admin route registry, tiles on AIRuntimeHome
- Uses canonical RPC reads (`summarize_security_findings`); no direct table writes from UI

### Phase 4.4 — Validators + scheduling
6 BLOCK validators using shared `emit-gate-report`:
- `check-security-council-runtime` — table+RLS+RPC presence
- `check-security-agent-scheduling` — pg_cron job exists; tick function references all 7 agent IDs
- `check-security-policy-proposal-path` — tick function routes policy findings via `propose_implementation_suggestion` (Phase 3 RPC)
- `check-kill-switch-recommendation-flow` — recommender never calls `arm_kill_switch` directly; only `kill_switch_approvals` insert
- `check-anomaly-driven-secret-rotation` — trigger function calls `secret-rotation-orchestrator` with `dryRun: true` only
- `check-no-direct-security-auto-apply` — no security edge function executes DDL or arms kill switches

Register all 6 in `check-os-release-readiness.ts` and `package.json` `phase4:run-all`.

Install pg_cron schedule `sita-security-council-tick` hourly via supabase insert tool.

### Phase 4.5 — Outputs + runbook
- 11 files in `generated/internal-ai-runtime-phase4/` (5 specs, audit, final verification, 4 status JSONs)
- `docs/runbooks/security-council-operations.md` — operator playbook for triaging findings, approving recommendations, executing rotations
- Append "Active Caveats" to maintain `launch-honesty-alignment` gate
- Run full release readiness; expect 117 → **123 BLOCK gates GREEN**

## Files touched (estimated)
- 1 migration (3 tables, 3 RPCs, RLS, indexes)
- 3 edge functions
- 3 admin pages + 3 tile registrations
- 6 validators + aggregator + package.json
- 11 generated/internal-ai-runtime-phase4/ artifacts
- 1 runbook
- 1 cron via supabase insert

After deployment: **123 BLOCK gates GREEN**, full Phase 4 acceptance criteria met, zero duplicates, zero stubs, recommendation-only autonomy, real scheduled security observation.
