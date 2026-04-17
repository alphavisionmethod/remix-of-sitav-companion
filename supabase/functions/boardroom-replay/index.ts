// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Replay edge function (Phase 24.D)
// Reconstructs a past session: items, evidence, recommendations,
// decisions, with proof-trail integrity check.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return jsonResponse({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    const { session_id } = (await req.json()) as { session_id?: string };
    if (!session_id) return jsonResponse({ error: "session_id required" }, 400);

    const [{ data: session }, { data: items }, { data: evidence }, { data: recommendations }, { data: receipts }] =
      await Promise.all([
        supabase.from("boardroom_sessions").select("*").eq("id", session_id).eq("user_id", userId).maybeSingle(),
        supabase.from("boardroom_items").select("*").eq("session_id", session_id).eq("user_id", userId),
        supabase.from("boardroom_evidence").select("*").eq("user_id", userId),
        supabase.from("boardroom_recommendations").select("*").eq("user_id", userId),
        supabase.from("boardroom_decision_receipts").select("*").eq("session_id", session_id).eq("user_id", userId),
      ]);

    if (!session) return jsonResponse({ error: "Session not found" }, 404);

    const integrity = {
      receipts_present: (receipts?.length ?? 0) > 0,
      every_receipt_has_proof_trail: (receipts ?? []).every(
        (r) => r.proof_trail && Object.keys(r.proof_trail).length > 0,
      ),
      every_decision_has_evidence_snapshot: (receipts ?? []).every(
        (r) => Array.isArray(r.evidence_snapshot),
      ),
    };

    return jsonResponse({
      ok: true,
      session,
      items: items ?? [],
      evidence: evidence ?? [],
      recommendations: recommendations ?? [],
      receipts: receipts ?? [],
      integrity,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
