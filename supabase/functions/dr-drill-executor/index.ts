// DR Drill Executor — admin-triggered DR drill recording with RTO/RPO.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const VALID_KINDS = ["region-failover", "db-restore", "edge-function-failover", "storage-failover", "full-stack"] as const;
const VALID_OUTCOMES = ["pending", "success", "partial", "failed"] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: roleRow } = await admin.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) return new Response(JSON.stringify({ error: "admin_required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const { drill_kind, rto_seconds, rpo_seconds, outcome, failover_target, evidence } = body ?? {};
    if (!drill_kind || !VALID_KINDS.includes(drill_kind)) {
      return new Response(JSON.stringify({ error: "invalid drill_kind", allowed: VALID_KINDS }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (outcome && !VALID_OUTCOMES.includes(outcome)) {
      return new Response(JSON.stringify({ error: "invalid outcome", allowed: VALID_OUTCOMES }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const completedAt = outcome && outcome !== "pending" ? new Date().toISOString() : null;
    const { data, error } = await admin.from("dr_drill_executions").insert({
      drill_kind, triggered_by: user.id,
      completed_at: completedAt,
      rto_seconds: rto_seconds ?? null, rpo_seconds: rpo_seconds ?? null,
      outcome: outcome ?? "pending",
      failover_target: failover_target ?? null,
      evidence: evidence ?? {},
    }).select().single();
    if (error) throw error;
    return new Response(JSON.stringify({ ok: true, drill: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
