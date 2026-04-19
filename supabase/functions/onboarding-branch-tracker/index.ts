// Onboarding Branch Tracker — records 29-screen telemetry.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const VALID_EVENTS = ["reached", "completed", "skipped", "abandoned"] as const;
const VALID_BRANCHES = ["quick", "balanced", "deep"] as const;

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
    const { screen_key, screen_index, branch_path, event_type, payload } = body ?? {};
    if (!screen_key || typeof screen_index !== "number" || screen_index < 1 || screen_index > 29) {
      return new Response(JSON.stringify({ error: "screen_key + screen_index (1..29) required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (event_type && !VALID_EVENTS.includes(event_type)) {
      return new Response(JSON.stringify({ error: "invalid event_type", allowed: VALID_EVENTS }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (branch_path && !VALID_BRANCHES.includes(branch_path)) {
      return new Response(JSON.stringify({ error: "invalid branch_path", allowed: VALID_BRANCHES }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await admin.from("onboarding_branch_events").insert({
      user_id: user.id, screen_key, screen_index,
      branch_path: branch_path ?? "balanced", event_type: event_type ?? "reached",
      payload: payload ?? {},
    }).select().single();
    if (error) throw error;
    return new Response(JSON.stringify({ ok: true, event: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
