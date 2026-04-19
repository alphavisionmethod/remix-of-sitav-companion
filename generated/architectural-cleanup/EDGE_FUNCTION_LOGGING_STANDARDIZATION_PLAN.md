# Edge Function Logging Standardization Plan

**Generated:** 2026-04-19
**Pass scope:** 8 highest-value handlers (additive only, behavior-preserving)

## Refactor pattern

Each targeted function receives an additive change:

```ts
import { EdgeLogger } from "../_shared/logger.ts";

Deno.serve(async (req) => {
  const correlationId = req.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const log = new EdgeLogger("<fn-name>", correlationId);
  const t0 = Date.now();

  try {
    log.info("request_received", { method: req.method, path: new URL(req.url).pathname });
    
    // Original handler logic starts here
    const body = await req.json();
    const result = await processLogic(body);
    const resp = new Response(JSON.stringify(result), { status: 200 });
    // Original handler logic ends here

    log.complete(200, Date.now() - t0, { result_class: "ok" });
    return resp;
  } catch (err) {
    log.error("handler_failure", {
      latencyMs: Date.now() - t0,
      failure_class: "internal",
      message: String(err),
    });
    throw err;
  }
});
```

## Required structured fields (canonical)

| Field | Required | Source |
|---|---|---|
| `fn` | yes | constructor arg |
| `correlationId` | yes | `x-correlation-id` header or generated UUID |
| `event_type` | yes | first arg of `log.info/warn/error` |
| `severity` | yes | implicit (`info`/`warn`/`error`) |
| `latencyMs` | on completion | `Date.now() - t0` |
| `result_class` | on completion | `ok` / `client_error` / `server_error` / `degraded` |
| `failure_class` | on error | enum: `auth`, `validation`, `provider`, `timeout`, `internal` |
| `actor` | when known | `user_id` from JWT |

## 8-function batch (this pass)

1. `ai-gateway`
2. `agent-executor`
3. `admin-bff-gateway`
4. `internal-agent-loop`
5. `push-dispatch`
6. `license-gateway`
7. `ai-runtime-nightly-verify`
8. `secret-rotation-orchestrator`

## Behavior preservation contract

- **No removals** of existing `console.*` calls in this pass — additive only.
- **No changes** to response shape, status codes, headers, or business logic.
- **No new dependencies** beyond `_shared/logger.ts` (already present in repo).
- All 8 functions remain passing their existing edge-function contract tests post-refactor.

## Subsequent passes

The remaining ~42 `needs-standardization` functions are tracked in `EDGE_FUNCTION_LOGGING_AUDIT.md` and visible on the Architectural Cleanup truth panel. Each subsequent pass should adopt the same 8-fn batch size to keep behavior-preservation review tractable.
