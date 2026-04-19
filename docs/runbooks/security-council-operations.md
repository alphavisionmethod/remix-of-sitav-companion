# RB-SECURITY-COUNCIL — Security Council operations

**Owner:** Trust & Security Council
**Phase:** AI Workforce Phase 4
**Risk:** Operational, observation-only by default

## Purpose

Operate the AI Workforce Phase 4 Security Council — 7 scheduled internal agents
that observe real signals, persist evidence-backed findings, and propose
remediations through existing approval channels (no direct auto-apply).

## What's running

| Agent | Cadence | Source signals | Output |
|---|---|---|---|
| `st-security-monitor` | hourly | `admin_action_audit` (high/critical) | findings |
| `st-permission-drift` | hourly | `user_roles` (new admin grants) | findings |
| `st-policy-review` | hourly | DB truth `rls_enabled_no_policies` | findings + suggestions |
| `st-trust-threshold` | hourly | `internal_agent_runtime_state.trust_score` | findings |
| `st-fraud-abuse` | hourly | `admin_action_audit` burst patterns | findings |
| `st-audit-completeness` | hourly | `ai_invocations` vs `ai_inference_receipts` | findings + suggestions |
| `st-privacy-boundary` | hourly | `admin_action_audit` cross-tenant actions | findings |

Schedule: `sita-security-council-tick` pg_cron, hourly.
Trigger function: `security-council-tick` edge function.

## Operator surfaces (admin AI engineering team only)

- `/admin/ai-runtime/security-council` — findings board with per-agent filters
- `/admin/ai-runtime/kill-switch-recommendations` — AI-proposed switch arming (recommendation only)
- `/admin/ai-runtime/anomaly-rotations` — anomaly-driven rotation triggers (dry-run only)
- `/admin/ai-runtime/suggestions` — Phase 3 board where security policy gaps land
- `/admin/health/kill-switches` — canonical kill-switch console (dual-admin arming)

## Daily triage

1. Open `/admin/ai-runtime/security-council`.
2. Filter on **critical** + **high** for last 24h.
3. For each finding:
   - Validate evidence in the side sheet
   - If routed to a suggestion, follow it to `/admin/ai-runtime/suggestions`
   - If a kill-switch recommendation is open, evaluate via `/admin/ai-runtime/kill-switch-recommendations`
4. Acknowledge handled findings (TBD UI: directly via DB until UI write surface lands).

## Acting on a kill-switch recommendation

The Phase 4 layer **never** arms a switch. To act:

1. Read the recommendation evidence at `/admin/ai-runtime/kill-switch-recommendations`.
2. Confirm the threshold breach is still live.
3. Open `/admin/health/kill-switches` (dual-admin gated).
4. Submit the activation with the recommendation ID in the justification.
5. The existing `kill_switch_approvals` workflow handles dual approval and audit.

## Acting on an anomaly rotation trigger

1. Open `/admin/ai-runtime/anomaly-rotations`.
2. Inspect the orchestrator dry-run result.
3. Confirm provider/scope and impact via the dry-run packet.
4. Follow **RB-SECRET-ROTATION** with dual-admin approval to perform the live rotation.
5. The trigger row remains as the audit anchor linking the anomaly to the rotation.

## Safety invariants (enforced by gates)

- `security-policy-proposal-path` — tick never executes DDL
- `kill-switch-recommendation-flow` — recommender never arms switches
- `anomaly-driven-secret-rotation` — trigger only ever calls orchestrator with `dryRun: true`
- `no-direct-security-auto-apply` — cross-cutting ban on auto-apply patterns

## Failure modes

- **Tick errors recorded in response `errors[]`** — investigate per-agent.
- **No findings landing** — check pg_cron job `sita-security-council-tick`.
- **Suggestions not routing** — verify `propose_implementation_suggestion` RPC and Phase 3 wiring.
- **Dry-run failures** — orchestrator misconfiguration; consult RB-SECRET-ROTATION.

## Related

- Phase 3 — `docs/runbooks/dependency-upgrade-proposer.md`
- RB-SECRET-ROTATION — secret rotation operator runbook
- Kill switches — `/admin/health/kill-switches`
