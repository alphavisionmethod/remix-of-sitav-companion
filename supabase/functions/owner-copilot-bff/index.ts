// ═══════════════════════════════════════════════════════════════
// Phase 7B — Owner Copilot BFF
// Read-only summaries of internal workforce signals exposed to
// tenant owners. Only writes go through the SECURITY DEFINER
// record_owner_copilot_handoff RPC. Never returns raw internal
// agent identifiers — strips them in the projection.
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

    const url = new URL(req.url);
    const op = url.searchParams.get("op") ?? "list";

    if (req.method === "GET" && op === "list") {
      const { data, error } = await supabase
        .from("owner_copilot_briefings")
        .select("id, topic, summary, body, source_kind, confidence, status, created_at")
        .eq("tenant_owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return new Response(JSON.stringify({ briefings: data ?? [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && op === "handoff") {
      const body = await req.json().catch(() => ({}));
      const briefing_id = String(body.briefing_id ?? "");
      const decision = String(body.decision ?? "");
      const rationale = body.rationale ? String(body.rationale).slice(0, 1000) : null;
      if (!briefing_id || !["approved", "declined", "more_info"].includes(decision)) {
        return new Response(JSON.stringify({ error: "invalid params" }), { status: 400, headers: corsHeaders });
      }
      const { data, error } = await supabase.rpc("record_owner_copilot_handoff", {
        p_briefing_id: briefing_id,
        p_decision: decision,
        p_rationale: rationale,
      });
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, handoff_id: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "unsupported op" }), { status: 400, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
