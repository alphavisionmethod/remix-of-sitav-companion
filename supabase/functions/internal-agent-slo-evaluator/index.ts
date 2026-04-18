// ═══════════════════════════════════════════════════════════════
// Phase 7A — SLO Evaluator + Anomaly Detector
// Periodic job that summarizes the agent loop into SLO snapshots
// and raises anomaly signals when thresholds are breached.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SLO = {
  successRateMin: 0.85,
  p95LatencyMaxMs: 12_000,
  escalationRateMax: 0.25,
  costSpikeMultiplier: 3,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const auth = req.headers.get("Authorization") ?? "";
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });

    const windowEnd = new Date();
    const windowStart = new Date(windowEnd.getTime() - 60 * 60 * 1000); // last hour

    // Pull recent receipts as the SLO source.
    const { data: receipts } = await supabase
      .from("ai_action_receipts")
      .select("status, confidence, executed_at, created_at, metadata")
      .eq("user_id", user.id)
      .gte("created_at", windowStart.toISOString());

    const list = receipts ?? [];
    const total = list.length || 1;
    const okCount = list.filter((r: any) => r.status === "executed" || r.status === "completed").length;
    const escalations = list.filter((r: any) => (r.metadata as any)?.escalated).length;
    const latencies = list
      .filter((r: any) => r.executed_at && r.created_at)
      .map((r: any) => new Date(r.executed_at).getTime() - new Date(r.created_at).getTime())
      .sort((a, b) => a - b);
    const p95 = latencies.length ? latencies[Math.floor(latencies.length * 0.95)] ?? 0 : 0;
    const p50 = latencies.length ? latencies[Math.floor(latencies.length * 0.5)] ?? 0 : 0;
    const successRate = okCount / total;
    const escalationRate = escalations / total;

    const sloStatus =
      successRate < SLO.successRateMin || p95 > SLO.p95LatencyMaxMs || escalationRate > SLO.escalationRateMax
        ? "breach"
        : successRate < SLO.successRateMin + 0.05
          ? "warn"
          : "ok";

    const { error: snapErr } = await supabase.from("internal_agent_slo_snapshots").insert({
      user_id: user.id,
      window_start: windowStart.toISOString(),
      window_end: windowEnd.toISOString(),
      success_rate: Number(successRate.toFixed(4)),
      p50_latency_ms: p50,
      p95_latency_ms: p95,
      escalation_rate: Number(escalationRate.toFixed(4)),
      action_count: list.length,
      slo_status: sloStatus,
    });
    if (snapErr) throw snapErr;

    // Anomaly detection
    const anomalies: Array<{ kind: string; severity: string; payload: any }> = [];
    if (sloStatus === "breach") {
      anomalies.push({
        kind: successRate < SLO.successRateMin ? "error_burst" : "cost_spike",
        severity: "crit",
        payload: { successRate, p95, escalationRate },
      });
    }
    if (escalationRate > SLO.escalationRateMax) {
      anomalies.push({ kind: "council_deadlock", severity: "warn", payload: { escalationRate } });
    }

    for (const a of anomalies) {
      await supabase.from("internal_agent_anomaly_signals").insert({
        user_id: user.id,
        signal_kind: a.kind,
        severity: a.severity,
        metric_payload: a.payload,
      });
    }

    return new Response(
      JSON.stringify({ ok: true, slo_status: sloStatus, anomalies: anomalies.length, action_count: list.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
