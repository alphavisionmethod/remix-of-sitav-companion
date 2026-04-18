// ═══════════════════════════════════════════════════════════════
// SITA OS — Tenant Self-Service BFF (Phase 9B)
// Tenant-scoped read+limited-write API for the self-service console.
// Always operates as the calling user; admin actions go elsewhere.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_ACTION_KINDS = new Set([
  "kill_switch_toggle", "quota_change", "federation_optin", "federation_optout",
  "webhook_subscribe", "webhook_unsubscribe", "api_key_create", "api_key_revoke",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const auth = req.headers.get("Authorization") ?? "";
    const client = createClient(url, anon, { global: { headers: { Authorization: auth } } });

    const { data: u } = await client.auth.getUser();
    if (!u?.user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { method } = req;
    const body = method !== "GET" ? await req.json().catch(() => ({})) : {};
    const op = body.op ?? new URL(req.url).searchParams.get("op") ?? "summary";

    if (op === "summary") {
      const [{ data: actions }, { data: quotas }] = await Promise.all([
        client.from("tenant_self_service_actions").select("*").order("created_at", { ascending: false }).limit(20),
        client.from("tenant_quotas").select("*"),
      ]);
      return new Response(JSON.stringify({ ok: true, actions, quotas }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (op === "record_action") {
      const action_kind = String(body.action_kind ?? "");
      if (!ALLOWED_ACTION_KINDS.has(action_kind)) {
        return new Response(JSON.stringify({ error: "invalid action_kind" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { data, error } = await client.from("tenant_self_service_actions").insert({
        user_id: u.user.id,
        action_kind,
        target_ref: String(body.target_ref ?? ""),
        before_state: body.before_state ?? null,
        after_state: body.after_state ?? null,
        justification: body.justification ?? null,
      }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, action: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (op === "update_quota") {
      const quota_key = String(body.quota_key ?? "");
      const quota_value = Number(body.quota_value ?? 0);
      if (!quota_key) return new Response(JSON.stringify({ error: "quota_key required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const { data, error } = await client.from("tenant_quotas").update({
        quota_value, updated_at: new Date().toISOString(),
      }).eq("user_id", u.user.id).eq("quota_key", quota_key).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, quota: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "unknown op" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
