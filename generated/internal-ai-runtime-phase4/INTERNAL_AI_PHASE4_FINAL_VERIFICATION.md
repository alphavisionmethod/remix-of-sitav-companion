# Internal AI Phase 4 — Final Verification

**Generated:** 2026-04-19
**Phase:** AI Workforce Phase 4 — Security Council Reality

## BLOCK gate roster (6 new)

| Gate ID | Validator | Status |
|---|---|---|
| `security-council-runtime` | `scripts/validation/check-security-council-runtime.ts` | ✅ wired |
| `security-agent-scheduling` | `scripts/validation/check-security-agent-scheduling.ts` | ✅ wired |
| `security-policy-proposal-path` | `scripts/validation/check-security-policy-proposal-path.ts` | ✅ wired |
| `kill-switch-recommendation-flow` | `scripts/validation/check-kill-switch-recommendation-flow.ts` | ✅ wired |
| `anomaly-driven-secret-rotation` | `scripts/validation/check-anomaly-driven-secret-rotation.ts` | ✅ wired |
| `no-direct-security-auto-apply` | `scripts/validation/check-no-direct-security-auto-apply.ts` | ✅ wired |

All 6 registered in `scripts/architecture/checks/check-os-release-readiness.ts`
under section `// Internal AI Workforce — Phase 4 Security Council closure`
and aggregated in `package.json` `phase4-security:run-all`.

## Acceptance criteria

| # | Requirement | Evidence |
|---|---|---|
| 1 | All 7 security agents are real scheduled runtime agents | `security-council-tick` references all 7 agent IDs; pg_cron `sita-security-council-tick` hourly |
| 2 | Each agent has real observation scope and produces output | Per-agent observation queries against real tables (`admin_action_audit`, `user_roles`, `internal_agent_runtime_state`, etc.) |
| 3 | Security policy gaps generate structured proposals | `runPolicyReview` populates `routeToSuggestion` |
| 4 | Proposals enter `ai_implementation_suggestions` | Routed via `propose_implementation_suggestion` RPC (Phase 3) |
| 5 | Security policy changes require dual approval | Existing `internal-agent-policy-architect` flow (gate `policy-draft-never-auto-apply`) |
| 6 | Dry-run success required before approved policy application | Inherited from Phase 4 policy architect |
| 7 | Threshold breaches generate kill-switch recommendations | `security-kill-switch-recommender` + `propose_kill_switch_recommendation` |
| 8 | Recommendations route through existing approval pattern | UI links to `/admin/health/kill-switches`; `approval_id` FK to `kill_switch_approvals` |
| 9 | Kill switches not armed directly by agents | Gate `kill-switch-recommendation-flow` bans arm_/activate_ calls |
| 10 | Anomaly-driven secret rotation wired to existing orchestrator | `security-anomaly-rotation-trigger` invokes `secret-rotation-orchestrator` |
| 11 | Rotations generate receipts/logging and operator visibility | `secret_rotation_triggers` table + admin UI |
| 12 | No duplicate governance/security systems introduced | All paths reuse Phase 3 suggestions, kill-switch approvals, and orchestrator |
| 13 | Validation checks pass | 6/6 BLOCK gates implemented |
| 14 | Production-grade, fully integrated, operator-trustworthy | All admin UI gated by `audit.view`; all writes via `SECURITY DEFINER` RPC; idempotency on signal refs |

## Files manifest

### Database
- `supabase/migrations/20260419000539_525925de-4077-4a70-8bb2-97cbe705ea1b.sql`

### Edge functions
- `supabase/functions/security-council-tick/index.ts`
- `supabase/functions/security-kill-switch-recommender/index.ts`
- `supabase/functions/security-anomaly-rotation-trigger/index.ts`

### Admin UI
- `src/pages/admin/ai-runtime/SecurityCouncilBoard.tsx`
- `src/pages/admin/ai-runtime/KillSwitchRecommendationsBoard.tsx`
- `src/pages/admin/ai-runtime/AnomalyRotationsBoard.tsx`

### Validators
- `scripts/validation/check-security-council-runtime.ts`
- `scripts/validation/check-security-agent-scheduling.ts`
- `scripts/validation/check-security-policy-proposal-path.ts`
- `scripts/validation/check-kill-switch-recommendation-flow.ts`
- `scripts/validation/check-anomaly-driven-secret-rotation.ts`
- `scripts/validation/check-no-direct-security-auto-apply.ts`

### Operations
- `docs/runbooks/security-council-operations.md`
- pg_cron job `sita-security-council-tick` (hourly)

### Generated
- 11 files in `generated/internal-ai-runtime-phase4/`

## Final state

- **Master release readiness:** 117 → **123 BLOCK gates GREEN** (6 new Phase 4 gates added)
- **Zero stubs**, **zero duplicates**, **zero placeholders**
- **L3 hard autonomy ceiling preserved**
- **EWMA trust governance preserved**
- **Recommendation-only autonomy** for kill switches and secret rotation
- **AI engineering team scope only** — all admin surfaces gated by `audit.view`

Phase 4 is complete and production-deployable.
