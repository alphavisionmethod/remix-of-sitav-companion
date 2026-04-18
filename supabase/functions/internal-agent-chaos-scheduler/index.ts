// ═══════════════════════════════════════════════════════════════
// Phase 8A — Continuous Assurance: Chaos drill scheduler
// Weekly fault-injection scheduler. Runs whitelisted scenarios
// only and writes assurance reports. Never executes destructive
// operations directly — emits "running" markers consumed by ops.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_SCENARIOS = new Set([
  "edge-fn-latency-injection",
  "rls-policy-fuzz",
  "kill-switch-dry-run",
  "ai-gateway-fallback-probe",
  "connector-token-expiry-simulation",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: drills } = await supabase
      .from("internal_agent_chaos_drills")
      .select("id, user_id, drill_key, scenario, blast_radius, enabled, status")
      .eq("enabled", true)
      .in("status", ["scheduled", "passed", "failed"])
      .limit(50);

    let scheduled = 0;
    let rejected = 0;

    for (const d of drills ?? []) {
      if (!ALLOWED_SCENARIOS.has(d.scenario)) {
        rejected++;
        await supabase
          .from("internal_agent_chaos_drills")
          .update({
            status: "cancelled",
            last_outcome: { rejected_reason: "scenario_not_in_safe_catalogue" },
            last_run_at: new Date().toISOString(),
          })
          .eq("id", d.id);
        continue;
      }
      scheduled++;
      await supabase
        .from("internal_agent_chaos_drills")
        .update({
          status: "running",
          last_run_at: new Date().toISOString(),
          last_outcome: { scenario: d.scenario, blast_radius: d.blast_radius },
        })
        .eq("id", d.id);
    }

    // Roll up an assurance report for the trailing 7d window
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    const { data: rollbacks } = await supabase
      .from("internal_agent_auto_rollback_events")
      .select("id")
      .gte("created_at", periodStart.toISOString());
    const breachCount = rollbacks?.length ?? 0;
    const drillCount = scheduled + rejected;
    const score = drillCount === 0 ? 1 : Math.max(0, 1 - breachCount / Math.max(drillCount, 1));

    if (drills && drills.length > 0) {
      await supabase.from("internal_agent_assurance_reports").insert({
        user_id: drills[0].user_id,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        assurance_score: score,
        breach_count: breachCount,
        drill_count: drillCount,
        evidence_refs: [],
        summary: `Phase 8A weekly assurance: ${scheduled} drills run, ${rejected} rejected, ${breachCount} breaches.`,
      });
    }

    return new Response(
      JSON.stringify({ ok: true, scheduled, rejected, breach_count: breachCount, assurance_score: score }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
