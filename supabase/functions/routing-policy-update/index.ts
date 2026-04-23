// ═══════════════════════════════════════════════════════════════
// SITA OS — Routing Policy Update (Phase 21.E)
// Admin-gated edits to ai_capability_routing + proof receipt
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsResponse, corsError } from "../_shared/cors.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader ?? "" } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return corsError("Unauthorized", 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: adminCheck } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!adminCheck) return corsError("Admin role required", 403);

    const { capabilityKey, primaryModel, fallbackChain, riskTier, budgetClass, rationale } = await req.json();
    if (!capabilityKey || !primaryModel) return corsError("capabilityKey and primaryModel required", 400);

    // Capture prior state for proof
    const { data: prior } = await admin.from("ai_capability_routing")
      .select("*").eq("capability_key", capabilityKey).maybeSingle();

    const { data: updated, error } = await admin.from("ai_capability_routing")
      .upsert({
        capability_key: capabilityKey,
        display_name: prior?.display_name ?? capabilityKey,
        primary_model: primaryModel,
        fallback_chain: fallbackChain ?? [],
        risk_tier: riskTier ?? prior?.risk_tier ?? "R1",
        budget_class: budgetClass ?? prior?.budget_class ?? "standard",
        is_active: true,
      }, { onConflict: "capability_key" })
      .select().single();

    if (error) return corsError(error.message, 400);

    // Emit proof receipt (non-blocking — table may not exist in all envs)
    try {
      await admin.from("proof_records").insert({
        user_id: user.id,
        record_type: "routing-policy-update",
        payload: {
          capabilityKey,
          before: prior,
          after: updated,
          rationale: rationale ?? null,
          actorUserId: user.id,
        },
      });
    } catch (e) {
      console.warn("proof_records insert skipped:", e);
    }

    return corsResponse({ updated, prior });
  } catch (e) {
    console.error("routing-policy-update error:", e);
    return corsError(e instanceof Error ? e.message : "Internal error", 500);
  }
});
