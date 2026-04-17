// ═══════════════════════════════════════════════════════════════
// trace-ingest (Phase 20.B)
// Receives batched span exports from the frontend APM exporter
// and writes trace_spans rows. Drops oversized batches.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-correlation-id, traceparent",
};

interface IncomingSpan {
  trace_id: string;
  span_id: string;
  parent_span_id?: string | null;
  service: string;
  operation: string;
  start_ts: string;
  end_ts: string;
  duration_ms: number;
  status?: "ok" | "error" | "timeout" | "cancelled";
  http_status?: number | null;
  correlation_id?: string | null;
  tags?: Record<string, string>;
  error?: string | null;
}

const MAX_SPANS = 100;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method-not-allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    return new Response(JSON.stringify({ error: "server-not-configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let userId: string | null = null;
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      });
      const { data: u } = await userClient.auth.getUser();
      userId = u?.user?.id ?? null;
    } catch { /* anonymous ok */ }
  }

  let body: { spans?: IncomingSpan[] };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "invalid-json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const spans = Array.isArray(body.spans) ? body.spans.slice(0, MAX_SPANS) : [];
  if (spans.length === 0) {
    return new Response(JSON.stringify({ ok: true, inserted: 0 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const rows = spans
    .filter((s) => s?.trace_id && s?.span_id && s?.service && s?.operation && s?.start_ts && s?.end_ts)
    .map((s) => ({
      trace_id: String(s.trace_id).slice(0, 64),
      span_id: String(s.span_id).slice(0, 32),
      parent_span_id: s.parent_span_id ? String(s.parent_span_id).slice(0, 32) : null,
      service: String(s.service).slice(0, 80),
      operation: String(s.operation).slice(0, 160),
      start_ts: s.start_ts,
      end_ts: s.end_ts,
      duration_ms: Math.max(0, Math.min(600_000, Math.round(Number(s.duration_ms) || 0))),
      status: (["ok", "error", "timeout", "cancelled"].includes(s.status ?? "ok") ? s.status : "ok") as string,
      http_status: typeof s.http_status === "number" ? s.http_status : null,
      user_id: userId,
      correlation_id: s.correlation_id ?? s.trace_id,
      tags: s.tags ?? {},
      error: s.error ?? null,
    }));

  if (rows.length === 0) {
    return new Response(JSON.stringify({ ok: true, inserted: 0 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { error } = await admin.from("trace_spans").insert(rows);
  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, inserted: rows.length }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
