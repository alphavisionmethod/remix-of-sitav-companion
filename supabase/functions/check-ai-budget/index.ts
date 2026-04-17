// ═══════════════════════════════════════════════════════════════
// SITA OS — Budget Enforcement Edge Function
// Thin HTTP wrapper around the canonical checkAIBudget helper.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { checkAIBudget } from "../_shared/ai-budget-check.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ allowed: false, reason: "no_auth" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user from JWT
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await anonClient.auth.getUser(token);
    if (authErr || !user) {
      return new Response(
        JSON.stringify({ allowed: false, reason: "invalid_auth" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const capabilityKey = body.capability_key ?? "unknown";
    const estimatedCostUsd = Number(body.estimated_cost_usd ?? 0.01);

    const decision = await checkAIBudget(
      supabase,
      user.id,
      capabilityKey,
      estimatedCostUsd,
      // strict:false here because callers use this to *advise* the UI
      { strict: false },
    );

    return new Response(
      JSON.stringify({
        allowed: decision.allowed,
        reason: decision.reason,
        should_downgrade: decision.shouldDowngrade,
        should_block: decision.shouldBlock,
        fallback_model_id: decision.fallbackModelId,
        policy_key: decision.policyKey,
        pct: decision.pct,
        alert_state: decision.alertState,
        premium_blocked: decision.premiumBlocked,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[check-ai-budget] enforcement error:", err);
    return new Response(
      JSON.stringify({ allowed: true, reason: "enforcement_error", error: String(err) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
