// ═══════════════════════════════════════════════════════════════
// SITA OS — workflow-repair (Phase 23.B)
// Admin-gated workflow repair: retry, force_complete, force_fail,
// rollback. Each action writes a receipt + state transition.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  run_id: z.string().uuid(),
  action: z.enum(["retry", "force_complete", "force_fail", "rollback"]),
  reason: z.string().min(1).max(500).optional(),
});

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(url, serviceKey);

    // Auth: require admin role
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: auth } } });
    const { data: userData } = await userClient.auth.getUser();
    const adminId = userData?.user?.id;
    if (!adminId) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", adminId).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "forbidden", detail: "admin_required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "validation_failed", details: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { run_id, action, reason } = parsed.data;

    const { data: run, error: runErr } = await supabase.from("workflow_runs").select("*").eq("id", run_id).maybeSingle();
    if (runErr || !run) {
      return new Response(JSON.stringify({ error: "run_not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const fromState = run.status;
    let toState = fromState;
    const updates: Record<string, unknown> = { last_progress_at: new Date().toISOString(), force_terminated_by: adminId };

    switch (action) {
      case "retry": {
        toState = "running";
        updates.status = "running";
        updates.error = null;
        updates.next_retry_at = null;
        break;
      }
      case "force_complete": {
        toState = "completed";
        updates.status = "completed";
        updates.completed_at = new Date().toISOString();
        break;
      }
      case "force_fail": {
        toState = "failed";
        updates.status = "failed";
        updates.completed_at = new Date().toISOString();
        updates.error = reason ?? "force_fail by admin";
        break;
      }
      case "rollback": {
        toState = "cancelled";
        updates.status = "cancelled";
        updates.completed_at = new Date().toISOString();
        updates.error = reason ?? "rolled back by admin";
        break;
      }
    }

    await supabase.from("workflow_runs").update(updates).eq("id", run_id);

    await supabase.from("workflow_state_transitions").insert({
      user_id: run.user_id, run_id, from_state: fromState, to_state: toState,
      reason: reason ?? `admin:${action}`, actor: `admin:${adminId}`,
    });

    const hash = await sha256Hex(JSON.stringify({ run_id, action, adminId, ts: Date.now() }));
    await supabase.from("workflow_receipts").insert({
      user_id: run.user_id, run_id, step_id: null,
      action: `repair:${action}`, hash,
      evidence: { admin_id: adminId, reason, from_state: fromState, to_state: toState },
    });

    return new Response(JSON.stringify({ status: "ok", run_id, action, from_state: fromState, to_state: toState }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
