// ═══════════════════════════════════════════════════════════════
// SITA OS — APM Span Exporter (Phase 20.B)
// Buffered exporter that batches completed in-memory spans from
// `tracer` to the `trace-ingest` edge function every 15s.
// ═══════════════════════════════════════════════════════════════

import { tracer } from "@/lib/observability/distributed-tracing";
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_NAME } from "./release";

const FLUSH_INTERVAL_MS = 15_000;
const MAX_BATCH = 50;

let flushTimer: ReturnType<typeof setInterval> | null = null;
let started = false;
let lastExportedIndex = 0;

interface ExportedSpan {
  trace_id: string;
  span_id: string;
  parent_span_id: string | null;
  service: string;
  operation: string;
  start_ts: string;
  end_ts: string;
  duration_ms: number;
  status: "ok" | "error" | "timeout" | "cancelled";
  http_status: number | null;
  correlation_id: string | null;
  tags: Record<string, string>;
  error: string | null;
}

function snapshot(): ExportedSpan[] {
  const all = tracer.getCompletedSpans(500);
  const fresh = all.slice(lastExportedIndex);
  lastExportedIndex = all.length;
  if (lastExportedIndex > 400) {
    // Keep memory bounded; tracer ring is 500.
    lastExportedIndex = Math.max(0, all.length - 100);
  }

  const nowMs = Date.now();
  const perfNow = performance.now();
  return fresh.slice(0, MAX_BATCH).map((s) => {
    const startWall = new Date(nowMs - (perfNow - s.startTime)).toISOString();
    const endWall = new Date(nowMs - (perfNow - (s.endTime ?? s.startTime))).toISOString();
    return {
      trace_id: s.traceId,
      span_id: s.spanId,
      parent_span_id: s.parentSpanId,
      service: s.service || SERVICE_NAME,
      operation: s.operation,
      start_ts: startWall,
      end_ts: endWall,
      duration_ms: Math.max(0, Math.round(s.duration ?? 0)),
      status: (s.status === "ok" || s.status === "error" || s.status === "timeout" ? s.status : "ok") as ExportedSpan["status"],
      http_status: s.tags["http.status_code"] ? Number(s.tags["http.status_code"]) : null,
      correlation_id: s.tags["correlation.id"] || s.traceId,
      tags: s.tags,
      error: s.tags.error || null,
    };
  });
}

async function flushSpans() {
  const spans = snapshot();
  if (spans.length === 0) return;
  try {
    await supabase.functions.invoke("trace-ingest", { body: { spans } });
  } catch {
    // Drop silently — losing observability data must never block the app.
  }
}

export function startSpanExporter() {
  if (started || typeof window === "undefined") return;
  started = true;

  flushTimer = setInterval(flushSpans, FLUSH_INTERVAL_MS);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushSpans();
  });
  window.addEventListener("beforeunload", () => {
    flushSpans();
  });
}

export function stopSpanExporter() {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  started = false;
}
