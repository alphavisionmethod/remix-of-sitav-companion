// ═══════════════════════════════════════════════════════════════
// SITA OS — workflow-replay (Phase 23.D)
// Admin-gated: replay a previous run by creating a new run with
// replayed_from link and re-invoking workflow-execute.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  run_id: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(url, serviceKey);

    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: auth } } });
    const { data: userData } = await userClient.auth.getUser();
    const adminId = userData?.user?.id;
    if (!adminId) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", adminId).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "validation_failed", details: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { run_id, reason } = parsed.data;

    const { data: prev, error: prevErr } = await supabase.from("workflow_runs").select("*").eq("id", run_id).maybeSingle();
    if (prevErr || !prev) {
      return new Response(JSON.stringify({ error: "run_not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Create a fresh run linked to the previous one
    const { data: newRun, error: newErr } = await supabase.from("workflow_runs").insert({
      user_id: prev.user_id,
      workflow_id: prev.workflow_id,
      status: "pending",
      context: prev.context,
      replayed_from: run_id,
      correlation_id: prev.correlation_id,
    }).select().single();
    if (newErr || !newRun) throw new Error(newErr?.message ?? "replay_create_failed");

    await supabase.from("workflow_state_transitions").insert({
      user_id: prev.user_id, run_id: newRun.id,
      from_state: null, to_state: "pending",
      reason: reason ?? `replay of ${run_id}`, actor: `admin:${adminId}`,
    });

    // Invoke executor (fire-and-forget; admin can poll the new run)
    fetch(`${url}/functions/v1/workflow-execute`, {
      method: "POST",
      headers: { Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ workflow_id: prev.workflow_id, context: prev.context, correlation_id: prev.correlation_id, triggered_by: `replay:${adminId}` }),
    }).catch(() => { /* ignore */ });

    return new Response(JSON.stringify({ status: "ok", new_run_id: newRun.id, replayed_from: run_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
