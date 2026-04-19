// Owner Copilot Session Tracker — opens/closes read-only owner copilot sessions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

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

    const body = await req.json().catch(() => ({}));
    const { action, session_id, tenant_id, copilot_kind, prompt_count, evidence } = body ?? {};
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (action === "start") {
      const { data, error } = await admin.from("owner_copilot_sessions").insert({
        user_id: user.id, tenant_id: tenant_id ?? null,
        copilot_kind: copilot_kind ?? "owner", read_only_verified: true,
        evidence: evidence ?? {},
      }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, session: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (action === "end" && session_id) {
      const { data, error } = await admin.from("owner_copilot_sessions").update({
        session_ended_at: new Date().toISOString(),
        prompt_count: prompt_count ?? 0,
      }).eq("id", session_id).eq("user_id", user.id).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, session: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "action must be 'start' or 'end'" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
