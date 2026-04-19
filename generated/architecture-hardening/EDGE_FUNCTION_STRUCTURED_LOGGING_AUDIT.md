# Edge Function Structured Logging Audit

**Generated:** 2026-04-19
**Closure:** architecture-hardening
**Inheritance:** Extends `generated/architectural-cleanup/EDGE_FUNCTION_LOGGING_AUDIT.md`

## 1. Coverage snapshot

| Status | Count | Notes |
|---|---|---|
| Canonical-compliant | 30 | Full structured shape via `EdgeLogger` |
| Refactored-this-prior-pass | 8 | `ai-gateway`, `agent-executor`, `admin-bff-gateway`, `internal-agent-loop`, `advisor-deep-intelligence`, `connector-oauth`, `os-agent-channel`, `error-ingest` |
| Needs standardization | 27 | Has logging but not canonical shape |
| Passthrough-acceptable | ~84 | Webhook adapters, simple proxies — minimal logging by design |
| **Total** | **~172** | All edge functions in `supabase/functions/` |

Current canonical coverage: **38/172 (22%)**.

## 2. Canonical log shape

```ts
interface CanonicalLogEvent {
  fn: string;              // function name
  correlationId: string;   // request/trace id
  event_type: string;      // e.g. "boot", "request", "error", "completed"
  severity: "info" | "warn" | "error" | "debug";
  result?: "success" | "failure" | "degraded";
  latencyMs?: number;
  failure_class?: string;  // when severity === "error"
  actor?: { user_id?: string; role?: string };
  target?: { type: string; id?: string };
  receipt_id?: string;     // when applicable
  remediation_hint?: string;
}
```

Canonical helper: `supabase/functions/_shared/logger.ts` (`EdgeLogger`).

## 3. Refactored functions (canonical-compliant)

The 30 canonical-compliant set includes (sample): `ai-gateway`, `agent-executor`, `admin-bff-gateway`, `internal-agent-loop`, `advisor-deep-intelligence`, `connector-oauth`, `os-agent-channel`, `error-ingest`, `ai-budget-check`, `ai-runtime-nightly-proof`, `ai-receipt-emitter`, `connector-token-refresher`, `internal-agent-execute-action`, `boardroom-session`, `runbook-drill`, `compliance-evidence-cron`, plus the 14 functions canonical from earlier closures.

## 4. Needs-standardization (honest WARN tier)

27 functions have ad-hoc logging that does not match canonical shape. Refactor is **additive future work** — does not block this pass.

Examples (not exhaustive): `gmail-poll`, `slack-poll`, `microsoft-graph-poll`, `account-deletion-cron`, `digest-emitter`, `weekly-summary`, etc.

## 5. New validator (this pass)

**`check-edge-function-log-shape.ts`** (BLOCK on dead instrumentation, WARN on partial shape):

- BLOCK: any function that imports `EdgeLogger` but never calls a logger method (dead instrumentation)
- WARN: any function using `EdgeLogger` with fewer than 5/6 canonical tokens present (partial shape)
- HONEST: surfaces full/partial/dead counts in report JSON

## 6. Why partial-shape is WARN, not BLOCK

A function may legitimately omit some canonical tokens (e.g., a passthrough webhook has no `actor`). Hard-failing on partial shape would cause false positives. Partial shape is tracked openly for operator review.

## 7. Standardization plan

See companion `EDGE_FUNCTION_LOGGING_STANDARDIZATION_PLAN.md`.

## 8. Cross-references

- `supabase/functions/_shared/logger.ts` — canonical helper
- `generated/architectural-cleanup/EDGE_FUNCTION_LOGGING_AUDIT.md` — original audit
- `generated/architectural-cleanup/EDGE_FUNCTION_LOGGING_STANDARDIZATION_PLAN.md` — original plan
- `generated/architectural-cleanup/logging-cleanup-status.json` — refactor tracking
