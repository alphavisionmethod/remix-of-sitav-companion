// ═══════════════════════════════════════════════════════════════
// health-beat (Phase 20.C)
// Receives client/monitor heartbeats and writes uptime_heartbeats.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("method-not-allowed", { status: 405, headers: corsHeaders });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    return new Response("server-not-configured", { status: 500, headers: corsHeaders });
  }

  let body: {
    subsystem?: string;
    status?: "healthy" | "degraded" | "down" | "unknown";
    latency_ms?: number;
    region?: string;
    metadata?: Record<string, unknown>;
    source?: "client" | "monitor" | "cron" | "external";
  };
  try { body = await req.json(); } catch {
    return new Response("invalid-json", { status: 400, headers: corsHeaders });
  }

  const subsystem = String(body.subsystem ?? "frontend").slice(0, 80);
  const status = (["healthy", "degraded", "down", "unknown"].includes(body.status ?? "healthy") ? body.status : "healthy") as string;
  const latency_ms = typeof body.latency_ms === "number" ? Math.max(0, Math.round(body.latency_ms)) : null;
  const source = (["client", "monitor", "cron", "external"].includes(body.source ?? "client") ? body.source : "client") as string;

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await admin.from("uptime_heartbeats").insert({
    subsystem,
    status,
    latency_ms,
    region: body.region ?? null,
    metadata: body.metadata ?? {},
    source,
  });

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
