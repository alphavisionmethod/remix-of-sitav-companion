# Deployment Gap Backlog

_Generated: 2026-04-18T13:03:48.664Z_

This backlog merges all admitted P0/P1 gaps with hidden risks discovered during audit.

## Severity legend
- **P0** — blocks deployment certification
- **P1** — degrades launch honesty if unresolved
- **P2** — hardening / future-proofing

## Gap inventory
| # | Gap | Severity | Status | Phase |
|---|-----|----------|--------|-------|
| 1 | App Store install flow real | P0 | RESOLVED — already real (11 edge fns) | K-audit |
| 2 | File picker adoption | P1 | 6 ad-hoc inputs vs 2 canonical | M2 |
| 3 | Draft autosave adoption | P1 | 2 consumers — adoption gap | M3 |
| 4 | Window snap integration | P1 | INTEGRATED | M4 |
| 5 | Mobile offline queue | P0 | RESOLVED — mobile archived, web on IndexedDB | M5 (truth-classify) |
| 6 | Unified search wired to shells | P1 | 2 canonical consumers | M6 |
| 7 | AI cost metering live | P0 | RESOLVED — real ledger + 7 consumers | K-audit |
| 8 | Connector OAuth rotation | P1 | Google real / others manual | M8 |
| 9–14 | Operator maturity (health UI, backup verify, biometric, updater, support diag, replay) | P2 | Multi-component — see SUPPORTABILITY_AND_OPERATOR_READINESS.md | guardrails |
| H1 | Frontend↔backend matrix | P1 | 15 actions mapped, 12 real | K-audit |
| H2 | DB truth closure | P0 | RESOLVED — 7/7 components present | K-audit |
| H3 | Manifest truth closure | P0 | RESOLVED — 6/6 governance components | K-audit |
| H4 | Supportability closure | P1 | 7 runbook files + classifier + kill-switch | K-audit |

## Phase mapping
- **K** Evidence (this pass)
- **L** 12 warn-level guardrail checks
- **M** Targeted real fixes
- **N** Truth classification of residuals
- **O** Aggregator wiring + verify
- **P** Re-seal + sign + npm scripts

