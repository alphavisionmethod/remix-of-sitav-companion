// Boardroom Cockpit Telemetry — records 16-tab views.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const COCKPIT_TABS = [
  "overview","radar","simulator","chat","debate","planning","clients",
  "leaderboard","journal","reflections","actions","memory","tools",
  "consensus","autonomy","outcomes",
] as const;

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
    const { tab_key, session_id, duration_ms, engagement_score, metadata } = body ?? {};
    if (!tab_key || !COCKPIT_TABS.includes(tab_key)) {
      return new Response(JSON.stringify({ error: "invalid tab_key", allowed: COCKPIT_TABS }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await admin.from("boardroom_cockpit_tab_views").insert({
      user_id: user.id, tab_key, session_id: session_id ?? null,
      duration_ms: duration_ms ?? null, engagement_score: engagement_score ?? null,
      metadata: metadata ?? {},
    }).select().single();
    if (error) throw error;
    return new Response(JSON.stringify({ ok: true, view: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
