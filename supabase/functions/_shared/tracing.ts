// ═══════════════════════════════════════════════════════════════
// Shared — Trace wrapper for edge functions (Phase 20.B)
// withTrace(req, service, operation, handler) wraps an edge fn
// handler. Reads inbound x-correlation-id / traceparent, emits
// a trace_spans row on completion via service-role client.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId: string | null;
  correlationId: string;
}

function genHex(len: number): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function parseTraceparent(header: string | null): { traceId: string; spanId: string } | null {
  if (!header) return null;
  const parts = header.split("-");
  if (parts.length !== 4 || parts[0] !== "00") return null;
  return { traceId: parts[1], spanId: parts[2] };
}

function extractContext(req: Request): TraceContext {
  const traceparent = req.headers.get("traceparent");
  const correlationId = req.headers.get("x-correlation-id") || genHex(16);
  const parsed = parseTraceparent(traceparent);
  return {
    traceId: parsed?.traceId ?? correlationId,
    spanId: genHex(8),
    parentSpanId: parsed?.spanId ?? null,
    correlationId,
  };
}

let _admin: ReturnType<typeof createClient> | null = null;
function getAdmin() {
  if (_admin) return _admin;
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}

export interface TraceLogger {
  info: (msg: string, attrs?: Record<string, unknown>) => void;
  warn: (msg: string, attrs?: Record<string, unknown>) => void;
  error: (msg: string, attrs?: Record<string, unknown>) => void;
  setTag: (k: string, v: string) => void;
  setUser: (userId: string | null) => void;
}

export interface TraceSpanState {
  ctx: TraceContext;
  tags: Record<string, string>;
  userId: string | null;
}

export async function withTrace<T extends Response>(
  req: Request,
  service: string,
  operation: string,
  handler: (logger: TraceLogger, state: TraceSpanState) => Promise<T>,
): Promise<T> {
  const ctx = extractContext(req);
  const tags: Record<string, string> = {
    "http.method": req.method,
    "correlation.id": ctx.correlationId,
  };
  const state: TraceSpanState = { ctx, tags, userId: null };
  const start = performance.now();
  const startWall = new Date().toISOString();

  const logger: TraceLogger = {
    info: (msg, attrs) => console.log(`[${service}:${operation}] ${msg}`, attrs ?? ""),
    warn: (msg, attrs) => console.warn(`[${service}:${operation}] ${msg}`, attrs ?? ""),
    error: (msg, attrs) => console.error(`[${service}:${operation}] ${msg}`, attrs ?? ""),
    setTag: (k, v) => { tags[k] = v; },
    setUser: (uid) => { state.userId = uid; },
  };

  let httpStatus = 200;
  let status: "ok" | "error" | "timeout" | "cancelled" = "ok";
  let errorMsg: string | null = null;

  try {
    const res = await handler(logger, state);
    httpStatus = res.status;
    if (res.status >= 500) status = "error";
    return res;
  } catch (err) {
    status = "error";
    errorMsg = err instanceof Error ? err.message : String(err);
    throw err;
  } finally {
    const endMs = performance.now();
    const duration = Math.max(0, Math.round(endMs - start));
    const endWall = new Date().toISOString();

    // Fire-and-forget span insert
    const admin = getAdmin();
    if (admin) {
      admin.from("trace_spans").insert({
        trace_id: ctx.traceId,
        span_id: ctx.spanId,
        parent_span_id: ctx.parentSpanId,
        service,
        operation,
        start_ts: startWall,
        end_ts: endWall,
        duration_ms: duration,
        status,
        http_status: httpStatus,
        user_id: state.userId,
        correlation_id: ctx.correlationId,
        tags,
        error: errorMsg,
      }).then(() => {}, () => {});
    }
  }
}

export function getCorrelationId(req: Request): string {
  return req.headers.get("x-correlation-id") || genHex(16);
}
