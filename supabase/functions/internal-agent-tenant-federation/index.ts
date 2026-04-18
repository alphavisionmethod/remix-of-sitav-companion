// ═══════════════════════════════════════════════════════════════
// Phase 7C — Tenant Federation Controller
// Reads/writes tenant scopes, quotas, and kill switches with
// L3 hard ceiling enforcement via clamp_tenant_action_autonomy.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });

    const body = await req.json().catch(() => ({}));
    const op = String(body.op ?? "list_scopes");

    if (op === "list_scopes") {
      const { data } = await supabase
        .from("internal_agent_tenant_scopes")
        .select("id, tenant_id, agent_id, enabled, trust_rung, updated_at")
        .order("updated_at", { ascending: false })
        .limit(200);
      return new Response(JSON.stringify({ scopes: data ?? [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (op === "set_scope") {
      const tenant_id = String(body.tenant_id ?? "");
      const agent_id = String(body.agent_id ?? "");
      const enabled = Boolean(body.enabled ?? true);
      const requested = Number(body.trust_rung ?? 0);
      if (!tenant_id || !agent_id) {
        return new Response(JSON.stringify({ error: "tenant_id + agent_id required" }), { status: 400, headers: corsHeaders });
      }
      const { data: clamped, error: clampErr } = await supabase.rpc("clamp_tenant_action_autonomy", {
        p_requested_level: requested,
      });
      if (clampErr) throw clampErr;
      const { error } = await supabase
        .from("internal_agent_tenant_scopes")
        .upsert({
          user_id: user.id,
          tenant_id,
          agent_id,
          enabled,
          trust_rung: clamped ?? 0,
          updated_at: new Date().toISOString(),
        }, { onConflict: "tenant_id,agent_id" });
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, applied_rung: clamped }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (op === "set_quota") {
      const tenant_id = String(body.tenant_id ?? "");
      if (!tenant_id) return new Response(JSON.stringify({ error: "tenant_id required" }), { status: 400, headers: corsHeaders });
      const { error } = await supabase
        .from("internal_agent_tenant_quotas")
        .upsert({
          user_id: user.id,
          tenant_id,
          daily_cents_cap: Math.max(0, Number(body.daily_cents_cap ?? 1000)),
          weekly_cents_cap: Math.max(0, Number(body.weekly_cents_cap ?? 5000)),
          max_actions_per_hour: Math.max(0, Number(body.max_actions_per_hour ?? 30)),
          updated_at: new Date().toISOString(),
        }, { onConflict: "tenant_id" });
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (op === "toggle_kill_switch") {
      const tenant_id = String(body.tenant_id ?? "");
      const switch_key = String(body.switch_key ?? "");
      const active = Boolean(body.active);
      const justification = String(body.justification ?? "");
      if (!tenant_id || !switch_key) {
        return new Response(JSON.stringify({ error: "tenant_id + switch_key required" }), { status: 400, headers: corsHeaders });
      }
      if (justification.length < 20) {
        return new Response(JSON.stringify({ error: "justification must be >= 20 chars" }), { status: 400, headers: corsHeaders });
      }
      const { error } = await supabase
        .from("internal_agent_tenant_kill_switches")
        .upsert({
          user_id: user.id,
          tenant_id,
          switch_key,
          active,
          justification,
          activated_by: active ? user.id : null,
          activated_at: active ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "tenant_id,switch_key" });
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "unsupported op" }), { status: 400, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
