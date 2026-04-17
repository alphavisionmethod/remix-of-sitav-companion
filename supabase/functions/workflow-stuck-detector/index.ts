// ═══════════════════════════════════════════════════════════════
// SITA OS — workflow-stuck-detector (Phase 23.B)
// Cron: every 5 min. Finds workflow_runs status='running' with
// last_progress_at older than 30 min, flips to 'stuck', writes
// transition + receipt, emits alert.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, serviceKey);

    const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: stuckRuns, error } = await supabase
      .from("workflow_runs")
      .select("id, user_id, workflow_id, started_at, last_progress_at")
      .eq("status", "running")
      .lt("last_progress_at", cutoff)
      .limit(100);

    if (error) throw new Error(error.message);

    const flipped: string[] = [];
    for (const r of stuckRuns ?? []) {
      await supabase.from("workflow_runs").update({
        status: "stuck", last_progress_at: new Date().toISOString(),
      }).eq("id", r.id);

      await supabase.from("workflow_state_transitions").insert({
        user_id: r.user_id, run_id: r.id,
        from_state: "running", to_state: "stuck",
        reason: `no progress since ${r.last_progress_at}`, actor: "workflow-stuck-detector",
      });

      const hash = await sha256Hex(JSON.stringify({ run_id: r.id, detected_at: Date.now() }));
      await supabase.from("workflow_receipts").insert({
        user_id: r.user_id, run_id: r.id,
        action: "stuck_detected", hash,
        evidence: { detector: "workflow-stuck-detector", last_progress_at: r.last_progress_at },
      });

      // Phase 20 alert (best-effort; do not break the sweep on alert failure)
      try {
        await supabase.from("alerts").insert({
          user_id: r.user_id,
          alert_key: `workflow-stuck-${r.id}`,
          severity: "warning",
          title: "Workflow run stuck",
          message: `Run ${r.id} has not progressed since ${r.last_progress_at}`,
          source: "workflow-stuck-detector",
          metadata: { run_id: r.id, workflow_id: r.workflow_id },
        });
      } catch { /* alerts table may be optional */ }

      flipped.push(r.id);
    }

    return new Response(JSON.stringify({
      status: "ok", scanned: stuckRuns?.length ?? 0, flipped: flipped.length, run_ids: flipped, cutoff,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
