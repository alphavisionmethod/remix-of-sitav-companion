// ═══════════════════════════════════════════════════════════════
// SITA OS — Request Context Propagation (Phase 20.B)
// Attaches `x-correlation-id` and W3C `traceparent` to every
// supabase.functions.invoke and fetch call so backend spans
// can be linked to the originating user action.
// ═══════════════════════════════════════════════════════════════

import { generateTraceId, generateSpanId, toTraceparent } from "./distributed-tracing";

let currentCorrelationId: string | null = null;
let currentTraceId: string | null = null;

export function newCorrelationId(): string {
  return generateTraceId();
}

export function withCorrelationId<T>(correlationId: string, fn: () => T): T {
  const prev = currentCorrelationId;
  const prevTrace = currentTraceId;
  currentCorrelationId = correlationId;
  currentTraceId = correlationId;
  try {
    return fn();
  } finally {
    currentCorrelationId = prev;
    currentTraceId = prevTrace;
  }
}

export function getCurrentCorrelationId(): string | null {
  return currentCorrelationId;
}

export function ensureCorrelationId(): string {
  if (!currentCorrelationId) {
    currentCorrelationId = newCorrelationId();
    currentTraceId = currentCorrelationId;
  }
  return currentCorrelationId;
}

export function getPropagationHeaders(): Record<string, string> {
  const cid = ensureCorrelationId();
  const traceId = currentTraceId || cid;
  const spanId = generateSpanId();
  return {
    "x-correlation-id": cid,
    traceparent: toTraceparent({ traceId, spanId, sampled: true }),
  };
}

let installed = false;

/**
 * Install global fetch interceptor that auto-attaches propagation headers
 * to same-origin and supabase functions calls. Idempotent.
 */
export function installFetchInterceptor() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const origFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      // Only enrich same-origin or Supabase function calls
      const shouldEnrich =
        url.startsWith("/") ||
        url.includes(window.location.host) ||
        url.includes("/functions/v1/") ||
        url.includes("supabase.co");

      if (!shouldEnrich) return origFetch(input as RequestInfo, init);

      const headers = new Headers(init?.headers || {});
      const prop = getPropagationHeaders();
      if (!headers.has("x-correlation-id")) headers.set("x-correlation-id", prop["x-correlation-id"]);
      if (!headers.has("traceparent")) headers.set("traceparent", prop.traceparent);

      return origFetch(input as RequestInfo, { ...init, headers });
    } catch {
      return origFetch(input as RequestInfo, init);
    }
  };
}
