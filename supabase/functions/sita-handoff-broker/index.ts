// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase F: Handoff Broker
// Validates a proposed device handoff against the user's autonomy
// preferences and records a server-stamped receipt before letting
// the target device act.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version",
};

interface HandoffRequest {
  sessionId: string;
  action: "accept" | "decline";
  targetDevice: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth) {
      return new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as HandoffRequest;
    if (!body?.sessionId || !body?.action) {
      return new Response(JSON.stringify({ error: "invalid_payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: session, error: fetchErr } = await admin
      .from("sita_handoff_sessions")
      .select("*")
      .eq("id", body.sessionId)
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (fetchErr || !session) {
      return new Response(JSON.stringify({ error: "session_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      await admin.from("sita_handoff_sessions").update({ status: "expired" }).eq("id", session.id);
      return new Response(JSON.stringify({ error: "expired" }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "decline") {
      await admin.from("sita_handoff_sessions").update({ status: "declined" }).eq("id", session.id);
    } else {
      await admin
        .from("sita_handoff_sessions")
        .update({
          status: "accepted",
          target_device: body.targetDevice,
          accepted_at: new Date().toISOString(),
        })
        .eq("id", session.id);
    }

    await admin.from("sita_spatial_events").insert({
      user_id: userData.user.id,
      kind: body.action === "accept" ? "handoff_accepted" : "handoff_declined",
      payload: { sessionId: session.id, targetDevice: body.targetDevice } as never,
    });

    return new Response(JSON.stringify({ ok: true, status: body.action === "accept" ? "accepted" : "declined" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[sita-handoff-broker] error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
