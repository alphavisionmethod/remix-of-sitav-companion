// ═══════════════════════════════════════════════════════════════
// SITA OS — Budget Enforcement Edge Function
// Gates AI invocations by calling check_ai_budget_policies DB fn
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

    const body = await req.json();
    const capabilityKey = body.capability_key ?? "unknown";
    const estimatedCostUsd = body.estimated_cost_usd ?? 0.01;

    // Call the DB function
    const { data, error } = await supabase.rpc("check_ai_budget_policies", {
      p_user_id: user.id,
      p_capability_key: capabilityKey,
      p_estimated_cost_usd: estimatedCostUsd,
    });

    if (error) {
      console.error("Budget check error:", error);
      // Fail open — allow the request but log
      return new Response(
        JSON.stringify({ allowed: true, reason: "policy_check_error", error: error.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const result = data as Record<string, unknown>;

    return new Response(
      JSON.stringify({
        allowed: result.allowed ?? true,
        reason: result.reason ?? "no_policy",
        should_downgrade: result.should_downgrade ?? false,
        should_block: result.should_block ?? false,
        fallback_model_id: result.fallback_model_id ?? null,
        policy_key: result.policy_key ?? null,
        pct: result.pct ?? null,
        alert_state: result.alert_state ?? null,
        premium_blocked: result.premium_blocked ?? false,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Budget enforcement error:", err);
    return new Response(
      JSON.stringify({ allowed: true, reason: "enforcement_error", error: String(err) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
