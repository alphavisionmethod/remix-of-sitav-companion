# Edge Function Logging Standardization Plan

**Generated:** 2026-04-19
**Closure:** architecture-hardening
**Inheritance:** Extends `generated/architectural-cleanup/EDGE_FUNCTION_LOGGING_STANDARDIZATION_PLAN.md`

## 1. Canonical log shape contract

Every edge function should emit at minimum the following structured fields:

| Field | Type | Required when |
|---|---|---|
| `fn` | string | Always |
| `correlationId` | string | Always (auto-generated if missing) |
| `event_type` | string | Always (e.g. `"boot"`, `"request"`, `"error"`, `"completed"`) |
| `severity` | `"info"\|"warn"\|"error"\|"debug"` | Always |
| `result` | `"success"\|"failure"\|"degraded"` | On terminal events |
| `latencyMs` | number | On `completed` / `error` events |
| `failure_class` | string | On `error` severity |
| `actor` | `{ user_id?, role? }` | When user-scoped |
| `target` | `{ type, id? }` | When mutating a resource |
| `receipt_id` | string | When emitting a receipt |
| `remediation_hint` | string | When operator action helps |

## 2. Implementation pattern (canonical)

```ts
import { EdgeLogger } from "../_shared/logger.ts";

const logger = new EdgeLogger("my-function");

Deno.serve(async (req) => {
  const correlationId = req.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const start = performance.now();
  logger.info({ fn: "my-function", correlationId, event_type: "request", severity: "info" });
  try {
    // ... work ...
    logger.info({
      fn: "my-function",
      correlationId,
      event_type: "completed",
      severity: "info",
      result: "success",
      latencyMs: Math.round(performance.now() - start),
    });
    return new Response(JSON.stringify({ ok: true }));
  } catch (err) {
    logger.error({
      fn: "my-function",
      correlationId,
      event_type: "error",
      severity: "error",
      result: "failure",
      latencyMs: Math.round(performance.now() - start),
      failure_class: err.constructor?.name ?? "UnknownError",
      remediation_hint: "Check function logs for stack trace.",
    });
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }
});
```

## 3. Migration order (recommended)

1. **High-traffic / high-risk first** — auth, payments, AI gateway, agent-executor (already done)
2. **Operator-visible** — admin-bff-gateway, error-ingest (already done)
3. **Long-running / cron** — boardroom-session, runbook-drill, compliance-evidence-cron (already done)
4. **Connector pollers** — gmail-poll, slack-poll, microsoft-graph-poll (pending)
5. **Background jobs** — digest-emitter, weekly-summary, account-deletion-cron (pending)
6. **Passthrough webhooks** — minimal logging acceptable (no migration required)

## 4. Validation strategy

Two validators in tandem:

| Validator | Behavior |
|---|---|
| `check-edge-function-structured-logging.ts` (existing) | Counts coverage; produces refactor-list |
| `check-edge-function-log-shape.ts` (NEW) | BLOCK on dead instrumentation, WARN on partial shape |

## 5. Honest WARN-tier preserved

Refactoring the remaining 27 functions is **additive future work** — does not block deployment. The validators surface honest counts so operators can prioritize.

## 6. Cross-references

- `supabase/functions/_shared/logger.ts` — `EdgeLogger` implementation
- `generated/architectural-cleanup/logging-cleanup-status.json` — coverage tracking
