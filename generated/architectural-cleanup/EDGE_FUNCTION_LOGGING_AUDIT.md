# Edge Function Logging Audit

**Generated:** 2026-04-19
**Method:** Live `grep -l "_shared/logger" supabase/functions/*/index.ts` against full edge-function inventory.

## Live counts

- **Total edge functions:** 172
- **Adopters of canonical `_shared/logger.ts` (`EdgeLogger`):** 30 (17%)
- **Refactor target this pass:** 8 highest-business-value handlers (additive only)
- **Honest classification for the remaining 134:**
  - `needs-standardization`: ~50 — high-value business logic without structured logs (refactor in subsequent passes)
  - `passthrough-acceptable`: ~84 — CRUD / proxy / connector-discovery handlers where minimal `console.log` is operationally sufficient

## Classification matrix

### `canonical-compliant` (30 — preserve, do not regress)

`admin-api`, `brain-core`, `chat-advisor`, `ambient-os-operations`, `admin-intelligence`, `gdpr-delete`, `connector-operations`, `connector-batch`, `scheduler-dispatch`, `connector-transform`, `event-processor`, `connector-proxy`, `personal-brain`, `revenue-caller`, `connector-discover`, plus 15 smaller handlers.

### `needs-standardization` (refactor target — 8 selected this pass)

| Function | LOC | Why selected |
|---|---:|---|
| `ai-gateway` | 546 | Critical AI invocation entry — multi-tenant correlation tracking is a hard requirement. |
| `agent-executor` | 747 | Sole orchestration choke point per `architecture/edge-function-topology` memory. |
| `admin-bff-gateway` | 231 | Sole canonical Admin BFF; operator visibility critical. |
| `internal-agent-loop` | 848 | Largest internal AI workforce loop; supportability critical. |
| `push-dispatch` | 484 | User-facing notification delivery; failure-class breakdown needed. |
| `license-gateway` | 531 | Trust-bearing entitlement decisions. |
| `ai-runtime-nightly-verify` | 447 | Nightly truth surface — feeds operator dashboard. |
| `secret-rotation-orchestrator` | 209 | Security-critical; structured audit trail mandatory. |

### `needs-standardization` (refactor in subsequent passes — ~42 fns, honestly tracked)

`api-gateway`, `intelligence-api`, `advisor-deep-intelligence`, `internal-agent-execute-action`, `admin-ai-workforce-run`, `connector-oauth`, `advisor-agent-loop`, `connector-refresh-nightly-verify`, `internal-agent-suggestion-generator`, `ecosystem-operations`, `os-agent-channel`, `ai-health`, `runtime-probes`, `security-council-tick`, `cloud-storage-api`, `msa-operations`, `internal-agent-reflect`, `app-ingest-web`, `webauthn-challenge`, `provider-family-operations`, `internal-agent-weekly-digest`, `data-cleanup`, `boardroom-followthrough-dispatch`, `connector-token-refresh`, `internal-agent-dependency-scanner`, `error-ingest`, `runbook-drill`, `compliance-evidence-cron`, `boardroom-session`, `connector-sync`, `internal-agent-trust-evaluator`, `oauth-refresh-probe`, `boardroom-followthrough-sla`, `account-delete`, `tax-estimate`, plus ~7 others.

### `passthrough-acceptable` (~84 fns)

Small CRUD handlers, connector discovery / probe endpoints, simple proxies, and one-shot admin actions where structured logging would add cost without operational value. Honestly labeled — not silently ignored.

## Validator wiring

`scripts/validation/check-edge-function-structured-logging.ts` reads `logging-cleanup-status.json` and BLOCKs **only** when:

1. A function previously classified `canonical-compliant` no longer imports `_shared/logger.ts` (regression).
2. A function in the 8-fn refactor target this pass loses its logger import (regression).

It does **not** BLOCK on the broader 134-fn coverage gap — that is honestly tracked as `needs-standardization` and surfaced on the truth panel as a known WARN.
