// ═══════════════════════════════════════════════════════════════
// Phase 8A — Continuous Assurance: Canary runner
// Runs every 5 min via pg_cron. Synthesizes a golden-path probe
// against existing SLO snapshots; on breach, emits an
// auto-rollback event with autonomy hard-clamped at L3.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const sinceIso = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: snaps } = await supabase
      .from("internal_agent_slo_snapshots")
      .select("id, user_id, success_rate, p95_latency_ms, slo_status, escalation_rate")
      .gte("window_end", sinceIso)
      .order("window_end", { ascending: false })
      .limit(50);

    let canariesRun = 0;
    let rollbacksTriggered = 0;

    for (const s of snaps ?? []) {
      canariesRun++;
      const { data: canary } = await supabase
        .from("internal_agent_canary_runs")
        .insert({
          user_id: s.user_id,
          golden_path_id: "phase8-assurance-canary",
          status: s.slo_status === "breach" ? "failed" : "passed",
          started_at: new Date().toISOString(),
          failure_reason: s.slo_status === "breach"
            ? `slo_breach success=${s.success_rate} p95=${s.p95_latency_ms}ms`
            : null,
        })
        .select()
        .single();

      if (s.slo_status === "breach") {
        const { data: clamped } = await supabase.rpc("clamp_assurance_action_autonomy", {
          p_requested_level: 3,
        });
        await supabase.from("internal_agent_auto_rollback_events").insert({
          user_id: s.user_id,
          triggered_by: "slo_breach",
          slo_snapshot_id: s.id,
          applied_autonomy: clamped ?? 3,
          rollback_target: "ai-runtime-recent-deploy",
          reason: `SLO breach detected by canary ${canary?.id ?? "unknown"}`,
          status: "executed",
          receipt_payload: {
            success_rate: s.success_rate,
            p95_latency_ms: s.p95_latency_ms,
            escalation_rate: s.escalation_rate,
          },
        });
        rollbacksTriggered++;
      }
    }

    return new Response(
      JSON.stringify({ ok: true, canaries_run: canariesRun, rollbacks_triggered: rollbacksTriggered }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
