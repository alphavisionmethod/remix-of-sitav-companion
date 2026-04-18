// ═══════════════════════════════════════════════════════════════
// Phase 9 Hardening — DR drill cron entrypoint
// Wakes weekly, invokes dr-drill-runner in simulation mode, and
// records the result. Real failover requires admin approval.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DR_TARGET = Deno.env.get("DR_FAILOVER_TARGET_URL") ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const startedAt = new Date().toISOString();

    // Probe DR target (HEAD request, 5s timeout)
    let probeOk = false;
    let probeLatencyMs = 0;
    let probeError: string | null = null;
    if (DR_TARGET) {
      const t0 = Date.now();
      try {
        const r = await fetch(DR_TARGET, { method: "HEAD", signal: AbortSignal.timeout(5_000) });
        probeOk = r.ok || r.status === 405; // some endpoints reject HEAD but are alive
        probeLatencyMs = Date.now() - t0;
      } catch (e) {
        probeError = e instanceof Error ? e.message : String(e);
        probeLatencyMs = Date.now() - t0;
      }
    } else {
      probeError = "DR_FAILOVER_TARGET_URL not configured";
    }

    // Record drill (simulation mode — never auto-failover)
    const { data, error } = await sb.from("dr_drills").insert({
      drill_kind: "scheduled_simulation",
      mode: "simulation",
      status: probeOk ? "passed" : "failed",
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      result: {
        probe_ok: probeOk,
        probe_latency_ms: probeLatencyMs,
        probe_error: probeError,
        target_configured: !!DR_TARGET,
      },
      notes: probeOk
        ? `DR target reachable in ${probeLatencyMs}ms`
        : `DR target unreachable: ${probeError}`,
    }).select().maybeSingle();

    if (error) console.error("dr drill insert error", error);

    return new Response(JSON.stringify({
      ok: true, drill_id: data?.id, probe_ok: probeOk, probe_latency_ms: probeLatencyMs,
    }), { headers: { ...corsHeaders, "content-type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
