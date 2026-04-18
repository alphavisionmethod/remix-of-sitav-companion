# Flagship Surface — Final Verification

## In-scope (this pass) — Admin AI Engineering team
| Surface | Status |
|---|---|
| Admin AI Runtime (`/admin/ai-runtime`) | ✅ closed |
| Admin Integrations (`/admin/integrations`) | ✅ closed |

## Deferred (operator scope decision)
The user explicitly scoped this pass to "only on the admin AI engineer team". User-facing surfaces are tracked separately:
| Surface | Status | Reason |
|---|---|---|
| Onboarding | deferred | operator-scoped to admin AI engineering team per directive |
| Boardroom Briefing | deferred | operator-scoped to admin AI engineering team per directive |
| Concierge Chat | deferred | operator-scoped to admin AI engineering team per directive |
| Communications Inbox | deferred | operator-scoped to admin AI engineering team per directive |

## Aggregator
`scripts/architecture/checks/check-os-release-readiness.ts` updated: 50 → 58 required gates (6 internal-agent + 2 admin-flagship).

## NPM scripts added
- `internal-agents:run-all` — runs the 6 BLOCK validators
- `flagship-closure:run-all` — runs the 2 admin-scoped validators
- `release:readiness:full` — now chains both bundles before the aggregator
