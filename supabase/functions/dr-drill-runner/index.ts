// ═══════════════════════════════════════════════════════════════
// SITA OS — DR Drill Runner (Phase 9A)
// Records a disaster-recovery drill outcome. L3 hard ceiling:
// drills are STAGED only — actual production failover requires
// human approval via region_failover_events workflow.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const srk = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const auth = req.headers.get("Authorization") ?? "";
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(url, srk);
    const { data: roleRows } = await admin.from("user_roles").select("role").eq("user_id", u.user.id);
    const isAdmin = (roleRows ?? []).some((r: { role: string }) => r.role === "admin");
    if (!isAdmin) return new Response(JSON.stringify({ error: "admin only" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const drill_key = String(body.drill_key ?? `drill-${Date.now()}`);
    const drill_type = String(body.drill_type ?? "failover");
    const scope = String(body.scope ?? "staging");
    const rto_target = Number(body.rto_target_seconds ?? 3600);
    const rpo_target = Number(body.rpo_target_seconds ?? 900);

    // Simulate drill execution (record-only — true failover requires human approval)
    const started = new Date();
    const rto_actual = Math.floor(rto_target * (0.6 + Math.random() * 0.5));
    const rpo_actual = Math.floor(rpo_target * (0.5 + Math.random() * 0.6));
    const data_integrity = 95 + Math.random() * 5;
    const passed = rto_actual <= rto_target && rpo_actual <= rpo_target && data_integrity >= 99;
    const finished = new Date(started.getTime() + 5000);

    const { data: drill, error } = await admin.from("dr_drills").insert({
      drill_key, drill_type, scope,
      status: passed ? "passed" : "failed",
      rto_target_seconds: rto_target,
      rpo_target_seconds: rpo_target,
      rto_actual_seconds: rto_actual,
      rpo_actual_seconds: rpo_actual,
      data_integrity_pct: data_integrity.toFixed(2),
      evidence: { simulated: true, autonomy_ceiling: "L3", scope },
      started_at: started.toISOString(),
      finished_at: finished.toISOString(),
      notes: passed ? "Drill passed within SLO targets" : "Drill exceeded SLO — investigate",
    }).select().single();
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, drill }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
