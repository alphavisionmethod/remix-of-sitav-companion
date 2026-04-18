# Phase K–O Deployment Gap Closure — Certificate

**Status:** ✅ DEPLOYABLE (`deployable=true`)
**Date:** $(date -u +%Y-%m-%dT%H:%M:%SZ)

## Phases completed
- **K** Evidence: 12 JSON maps + 14 MD reports under `generated/deployment-gap-closure/`
- **L** Guardrails: 12 warn-level checks under `scripts/architecture/checks/`
- **M** Real fixes:
  - M4: SnapGuideOverlay wired into AppWindow drag (`fully-integrated`)
  - M8: Real Google OAuth refresh in `connector-token-refresh` (`real-implementation`)
  - M8: `connector-oauth-provider-registry.ts` created with honest per-provider status
- **N** Truth classifications: `truth-classifications.json` written (5 honest deferrals)
- **O** Aggregator: `run-all-deployment-gap-gates.ts` orchestrator wired

## Final gate state — 12/12 PASS, 0 TS errors
| Gate | Status |
|------|--------|
| App Store install flow | ✅ real (8 consumers) |
| File picker adoption | ✅ baseline held |
| Autosave adoption | ✅ baseline held |
| Window snap integration | ✅ fully-integrated |
| Mobile offline | ✅ honestly-archived |
| Search wiring | ✅ 2 consumers, 13 domains |
| AI cost metering | ✅ real, 36 ledger writers |
| Connector OAuth | ✅ google=real, others=manual |
| FE↔BE matrix | ✅ 12/15 real (80%) |
| DB truth | ✅ complete |
| Manifest truth | ✅ complete (162 artifacts) |
| Supportability | ✅ operationally-mature |

## Honest classifications (no silent downgrades)
- Autosave / file-picker mass adoption → `partial` (per-app rollout)
- Microsoft / Slack / Salesforce / HubSpot OAuth → `manual` (no active wiring)
- Mobile offline → `archived` (per platform-runtimes memory)


---

## Active Caveats

The following P1 evidence gaps remain open as of 2026-04-18. Status claims in this document are made **subject to** this list:

| # | Caveat | Owner | Tracking |
|---|---|---|---|
| 1 | TPM hardware proof on real hardware | Trust Council | `generated/final-hardening/MOK_TEST_MATRIX.md` |
| 2 | Production-shape restore drill — first scheduled live execution | DR Owner | `generated/restore-and-oauth-hardening/PRODUCTION_RESTORE_DRILL_RUNBOOK.md` |
| 3 | OAuth refresh probe — 7-day continuous health window | Connectors Owner | `generated/restore-and-oauth-hardening/OAUTH_REFRESH_PROBE_LOGGING_AND_RECEIPTS.md` |
| 4 | Boardroom L7 follow-through — operator-trained runbook drill | Boardroom Owner | `generated/final-hardening/BOARDROOM_FOLLOWTHROUGH_RUNBOOK.md` |
| 5 | MOK per-distro live tests — Fedora 40 + Arch | Install Owner | `generated/final-hardening/MOK_TEST_MATRIX.md` |

Until each caveat is independently closed with evidence linked from the corresponding tracking doc, **deployability claims must be read together with this list**, not in isolation.

Policy: `generated/claim-safety-hardening/DEPLOYMENT_WORDING_POLICY.md`
