# Edge-Function Contract Expansion Plan

> Generated: 2026-04-19. Owner: Admin & Validation Truth Closure.

## Phase 1 — 20 NEW contract tests added in this closure

Prioritized by deployment-criticality and trust impact:

| # | Function | Tier | Why |
|---|---|---|---|
| 1 | internal-agent-execute-action | 2 | Workforce action execution choke point |
| 2 | internal-agent-loop | 2 | Workforce orchestration (5-min cron) |
| 3 | internal-agent-reflect | 2 | Outcome learning loop |
| 4 | internal-agent-policy-architect | 2 | Policy draft generator |
| 5 | internal-agent-trust-evaluator | 2 | Trust ladder updates |
| 6 | internal-agent-self-healer | 2 | Auto-remediation |
| 7 | internal-agent-suggestion-generator | 2 | Implementation suggestions |
| 8 | internal-agent-weekly-digest | 2 | 7-day workforce intelligence |
| 9 | internal-agent-dependency-scanner | 2 | npm audit normalization |
| 10 | internal-agent-cost-optimizer | 2 | Cost proposals |
| 11 | internal-agent-slo-evaluator | 2 | SLO breach evaluation |
| 12 | internal-agent-consensus-engine | 2 | Cross-council consensus |
| 13 | internal-agent-tenant-federation | 2 | Tenant federation safety |
| 14 | security-council-tick | 1 | 7 security agents hourly tick |
| 15 | boardroom-followthrough-dispatch | 1 | Boardroom L7 dispatch |
| 16 | boardroom-outcome-record | 1 | Boardroom L7 outcome capture |
| 17 | release-artifact-signer | 1 | Release artifact integrity |
| 18 | release-artifact-verifier | 1 | Release artifact verification |
| 19 | attestation-packet-builder | 1 | Compliance attestation |
| 20 | audit-export-bundler | 1 | Immutable audit export |

## Phase 2 — Next 20 (planned, not in this closure)

Tier 3 priority: agent-canary-runner, agent-chaos-scheduler, sovereign-deploy-* family,
tenant-* family, knowledge-bus-* family.

## Phase 3 — Final 18 to BLOCK promotion

Tier 3+4 saturation. Once 87/173 covered, `check-edge-function-contract-coverage`
flips from WARN to BLOCK and is enforced at release time.
