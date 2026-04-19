// Phase 6: Connector Reauth UX — records prompt + resolution events.
// POST { provider, trigger_reason, action: "prompted"|"resolved"|"failed", reauth_id? }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.45.0/cors";
import { z } from "https://esm.sh/zod@3.23.8";

const Body = z.object({
  provider: z.string().min(1).max(64),
  trigger_reason: z.string().min(1).max(128),
  action: z.enum(["prompted", "resolved", "failed"]),
  reauth_id: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userClient = createClient(supabaseUrl, anon, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = userData.user.id;

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  const { provider, trigger_reason, action, reauth_id, metadata } = parsed.data;

  try {
    if (action === "prompted") {
      const { data, error } = await userClient
        .from("connector_reauth_events")
        .insert({
          user_id: userId,
          provider,
          trigger_reason,
          resolution_state: "pending",
          attempts: 1,
          metadata: metadata ?? {},
        })
        .select("id")
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, reauth_id: data!.id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      if (!reauth_id) {
        return new Response(JSON.stringify({ error: "reauth_id_required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: existing, error: fetchErr } = await userClient
        .from("connector_reauth_events")
        .select("attempts")
        .eq("id", reauth_id)
        .eq("user_id", userId)
        .single();
      if (fetchErr || !existing) {
        return new Response(JSON.stringify({ error: "not_found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error: updErr } = await userClient
        .from("connector_reauth_events")
        .update({
          resolution_state: action === "resolved" ? "resolved" : "failed",
          resolved_at: new Date().toISOString(),
          attempts: (existing.attempts ?? 0) + (action === "failed" ? 1 : 0),
        })
        .eq("id", reauth_id)
        .eq("user_id", userId);
      if (updErr) throw updErr;
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String((err as Error).message ?? err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
