// ═══════════════════════════════════════════════════════════════
// SITA OS — Webhook Replay (Phase 22.B)
// Admin-gated replay of a single event id or all dead-letter events for a provider.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error: claimsErr } = await supabaseAuth.auth.getClaims(token);
  if (claimsErr || !claims?.claims?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data: isAdmin } = await admin.rpc("has_role", { _user_id: claims.claims.sub, _role: "admin" });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = await req.json().catch(() => ({}));
  const { eventId, provider } = body as { eventId?: string; provider?: string };

  let updated = 0;
  if (eventId) {
    const { count } = await admin.from("webhook_events").update({
      status: "replayed", dead_letter: false, retry_count: 0, last_error: null,
    }).eq("id", eventId).select("id", { count: "exact", head: true });
    updated = count ?? 0;
  } else if (provider) {
    const { count } = await admin.from("webhook_events").update({
      status: "pending", dead_letter: false, retry_count: 0, last_error: null,
    }).eq("provider", provider).eq("dead_letter", true).select("id", { count: "exact", head: true });
    updated = count ?? 0;
  } else {
    return new Response(JSON.stringify({ error: "eventId or provider required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, replayed: updated }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
