// ═══════════════════════════════════════════════════════════════
// SITA OS — APM Metrics Ingest Edge Function
// Receives batched frontend performance spans and writes to
// observability_metrics table.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

interface IncomingSpan {
  trace_id: string;
  span_id: string;
  service: string;
  operation: string;
  start_ts: string;
  end_ts: string;
  duration_ms: number;
  status: string;
  http_status: number | null;
  correlation_id: string | null;
  tags: Record<string, string>;
  error: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { spans } = (await req.json()) as { spans?: IncomingSpan[] };
    if (!spans || !Array.isArray(spans) || spans.length === 0) {
      return new Response(JSON.stringify({ ok: true, ingested: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Derive web vitals and API latency metrics from spans
    const metrics: Array<{
      metric_key: string;
      metric_value: number;
      unit: string;
      source: string;
      metadata: Record<string, unknown>;
      recorded_at: string;
    }> = [];

    for (const span of spans.slice(0, 50)) {
      const op = span.operation?.toLowerCase() ?? "";

      // Web vitals from tagged spans
      if (span.tags?.["web.vital"]) {
        metrics.push({
          metric_key: `web.${span.tags["web.vital"]}`,
          metric_value: span.duration_ms,
          unit: "ms",
          source: "apm-frontend",
          metadata: { trace_id: span.trace_id, service: span.service },
          recorded_at: span.end_ts,
        });
      }

      // API latency from fetch spans
      if (op.startsWith("fetch") || op.startsWith("api.")) {
        metrics.push({
          metric_key: "api.latency",
          metric_value: span.duration_ms,
          unit: "ms",
          source: "apm-frontend",
          metadata: {
            trace_id: span.trace_id,
            operation: span.operation,
            status: span.http_status,
            error: span.error,
          },
          recorded_at: span.end_ts,
        });
      }

      // Error spans
      if (span.status === "error" || span.error) {
        metrics.push({
          metric_key: "error.count",
          metric_value: 1,
          unit: "count",
          source: "apm-frontend",
          metadata: {
            trace_id: span.trace_id,
            operation: span.operation,
            error: span.error,
          },
          recorded_at: span.end_ts,
        });
      }
    }

    if (metrics.length > 0) {
      const { error } = await supabase.from("observability_metrics").insert(metrics);
      if (error) console.error("[apm-metrics-ingest] insert error:", error.message);
    }

    return new Response(
      JSON.stringify({ ok: true, ingested: metrics.length, spans_received: spans.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[apm-metrics-ingest] error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});