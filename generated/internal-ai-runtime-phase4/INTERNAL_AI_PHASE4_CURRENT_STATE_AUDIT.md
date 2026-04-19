# Internal AI Phase 4 — Current State Audit

**Generated:** 2026-04-19
**Phase:** AI Workforce Phase 4 — Security Council Reality

## Pre-existing assets (reused)

| Asset | Path / identifier | Reuse |
|---|---|---|
| 7 security agents (definitions) | `src/lib/internal-agents/agents/security-trust.ts` | ✅ wired into runtime tick |
| Internal agent loop runtime | `supabase/functions/internal-agent-loop` | ✅ unchanged |
| Phase 3 suggestions pipeline | `ai_implementation_suggestions` + `propose_implementation_suggestion` | ✅ policy gaps route here |
| Kill-switch dual approval | `kill_switch_approvals` + `kill_switch_audit_log` | ✅ canonical arming path preserved |
| Secret rotation orchestrator | `supabase/functions/secret-rotation-orchestrator` | ✅ called dry-run only |
| Policy architect (drafts only) | `internal-agent-policy-architect` | ✅ canonical policy proposer |
| Admin AI runtime shell | `AdminControlPlaneShell` + `audit.view` permission | ✅ all Phase 4 boards gated |
| EWMA trust governance | `record_internal_agent_reflection` RPC | ✅ trust writes still funneled here |

## Net new in Phase 4

| Component | Path | Type |
|---|---|---|
| `security_council_findings` | DB table | Persistent finding store |
| `kill_switch_recommendations` | DB table | AI-proposed switch arming packets |
| `secret_rotation_triggers` | DB table | Anomaly-driven rotation packets (dry-run only) |
| `record_security_finding` | RPC | Idempotent finding recorder |
| `propose_kill_switch_recommendation` | RPC | Idempotent recommendation creator |
| `trigger_anomaly_secret_rotation` | RPC | Idempotent trigger persister |
| `summarize_security_council` | RPC | Aggregate read for UI |
| `security-council-tick` | edge fn | Hourly orchestrator of all 7 agents |
| `security-kill-switch-recommender` | edge fn | Threshold breach → recommendation |
| `security-anomaly-rotation-trigger` | edge fn | Anomaly → orchestrator dry-run + persist |
| `SecurityCouncilBoard` | admin UI | `/admin/ai-runtime/security-council` |
| `KillSwitchRecommendationsBoard` | admin UI | `/admin/ai-runtime/kill-switch-recommendations` |
| `AnomalyRotationsBoard` | admin UI | `/admin/ai-runtime/anomaly-rotations` |
| 6 BLOCK validators | scripts/validation/check-security-* | CI gates |
| pg_cron `sita-security-council-tick` | DB schedule | Hourly tick |
| RB-SECURITY-COUNCIL | runbook | Operator playbook |

## Acceptance map

| Phase 4 acceptance criterion | Status |
|---|---|
| All 7 security agents are real scheduled runtime agents | ✅ via `security-council-tick` hourly |
| Each agent has real observation scope | ✅ each queries a real signal source |
| Security policy gaps generate structured proposals | ✅ via `propose_implementation_suggestion` |
| Proposals enter `ai_implementation_suggestions` | ✅ Phase 3 surface |
| Security policy changes require dual approval | ✅ via existing approval workflow (drafts only) |
| Dry-run success required before approved policy application | ✅ via `internal-agent-policy-architect` (existing) |
| Threshold breaches generate kill-switch arming recommendations | ✅ via `security-kill-switch-recommender` |
| Recommendations route through existing approval pattern | ✅ link out to `kill_switch_approvals` |
| Kill switches not armed directly by agents | ✅ enforced by `kill-switch-recommendation-flow` gate |
| Anomaly-driven secret rotation wired to existing orchestrator | ✅ via `security-anomaly-rotation-trigger` (dry-run) |
| Rotations generate receipts/logging and operator visibility | ✅ persisted to `secret_rotation_triggers` + UI |
| No duplicate governance/security systems introduced | ✅ all paths reuse existing canonicals |

## Constraints upheld

- L3 hard autonomy ceiling preserved
- EWMA trust governance untouched
- All write paths use `SECURITY DEFINER` RPCs with idempotency keys
- All admin boards gated by `audit.view` (AI engineering team scope)
- Zero direct DDL, zero direct kill-switch arming, zero live rotation in Phase 4 paths
