// ═══════════════════════════════════════════════════════════════
// SITA OS — Distributed Tracing
// Trace context propagation for cross-service requests
// ═══════════════════════════════════════════════════════════════

export interface TraceSpan {
  readonly traceId: string;
  readonly spanId: string;
  readonly parentSpanId: string | null;
  readonly operation: string;
  readonly service: string;
  readonly startTime: number;
  endTime: number | null;
  duration: number | null;
  status: "ok" | "error" | "timeout";
  tags: Record<string, string>;
  events: SpanEvent[];
}

export interface SpanEvent {
  readonly name: string;
  readonly timestamp: number;
  readonly attributes?: Record<string, string>;
}

export interface TraceContext {
  readonly traceId: string;
  readonly spanId: string;
  readonly sampled: boolean;
}

// ── Trace ID generation ────────────────────────────────────

function generateId(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function generateTraceId(): string { return generateId(16); }
export function generateSpanId(): string { return generateId(8); }

// ── W3C Trace Context ──────────────────────────────────────

export function toTraceparent(ctx: TraceContext): string {
  return `00-${ctx.traceId}-${ctx.spanId}-${ctx.sampled ? "01" : "00"}`;
}

export function parseTraceparent(header: string): TraceContext | null {
  const parts = header.split("-");
  if (parts.length !== 4 || parts[0] !== "00") return null;
  return {
    traceId: parts[1],
    spanId: parts[2],
    sampled: parts[3] === "01",
  };
}

// ── Tracer ──────────────────────────────────────────────────

class DistributedTracer {
  private activeSpans = new Map<string, TraceSpan>();
  private completedSpans: TraceSpan[] = [];
  private currentContext: TraceContext | null = null;
  private sampleRate: number;
  private maxCompletedSpans: number;

  constructor(opts?: { sampleRate?: number; maxCompletedSpans?: number }) {
    this.sampleRate = opts?.sampleRate ?? 1.0; // Sample 100% by default
    this.maxCompletedSpans = opts?.maxCompletedSpans ?? 500;
  }

  startTrace(operation: string, service = "sita-frontend"): TraceSpan {
    const traceId = generateTraceId();
    const spanId = generateSpanId();
    const sampled = Math.random() < this.sampleRate;

    this.currentContext = { traceId, spanId, sampled };
    return this.startSpan(operation, service);
  }

  startSpan(operation: string, service = "sita-frontend", parentSpanId?: string): TraceSpan {
    const ctx = this.currentContext;
    const traceId = ctx?.traceId ?? generateTraceId();
    const spanId = generateSpanId();

    const span: TraceSpan = {
      traceId,
      spanId,
      parentSpanId: parentSpanId ?? ctx?.spanId ?? null,
      operation,
      service,
      startTime: performance.now(),
      endTime: null,
      duration: null,
      status: "ok",
      tags: {},
      events: [],
    };

    this.activeSpans.set(spanId, span);
    return span;
  }

  endSpan(span: TraceSpan, status: TraceSpan["status"] = "ok") {
    span.endTime = performance.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;
    this.activeSpans.delete(span.spanId);
    this.completedSpans.push(span);

    if (this.completedSpans.length > this.maxCompletedSpans) {
      this.completedSpans = this.completedSpans.slice(-this.maxCompletedSpans);
    }
  }

  addEvent(span: TraceSpan, name: string, attributes?: Record<string, string>) {
    span.events.push({ name, timestamp: performance.now(), attributes });
  }

  setTag(span: TraceSpan, key: string, value: string) {
    span.tags[key] = value;
  }

  // Get headers for propagation
  getTraceHeaders(): Record<string, string> {
    if (!this.currentContext) return {};
    return { traceparent: toTraceparent(this.currentContext) };
  }

  // Wrap a fetch call with tracing
  async tracedFetch(url: string, init?: RequestInit, spanName?: string): Promise<Response> {
    const operation = spanName ?? `HTTP ${init?.method ?? "GET"} ${new URL(url, window.location.origin).pathname}`;
    const span = this.startSpan(operation, "sita-frontend");
    this.setTag(span, "http.url", url);
    this.setTag(span, "http.method", init?.method ?? "GET");

    try {
      const headers = { ...(init?.headers as Record<string, string>), ...this.getTraceHeaders() };
      const response = await fetch(url, { ...init, headers });
      this.setTag(span, "http.status_code", String(response.status));
      this.endSpan(span, response.ok ? "ok" : "error");
      return response;
    } catch (err) {
      this.setTag(span, "error", String(err));
      this.endSpan(span, "error");
      throw err;
    }
  }

  getActiveSpans(): TraceSpan[] {
    return Array.from(this.activeSpans.values());
  }

  getCompletedSpans(limit = 100): TraceSpan[] {
    return this.completedSpans.slice(-limit);
  }

  getTraceSpans(traceId: string): TraceSpan[] {
    return this.completedSpans.filter(s => s.traceId === traceId);
  }

  getCurrentContext(): TraceContext | null {
    return this.currentContext;
  }
}

export const tracer = new DistributedTracer();
