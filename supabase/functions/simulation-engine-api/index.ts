// ═══════════════════════════════════════════════════════════════
// SITA OS — Simulation Engine API
// Scenario creation, parameter mutation, projection runs
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, corsResponse, corsError } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

import { checkKillSwitchOrReject } from "../_shared/kill-switch.ts";


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

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  // Phase 27 — Kill-switch enforcement (KS-SIMULATIONS)
  const killed = await checkKillSwitchOrReject("KS-SIMULATIONS", auth.supabase);
  if (killed) return killed;

  try {
    const body = req.method === "GET" ? { action: "list-scenarios" } : await req.json();
    const { action, ...params } = body;

    switch (action) {
      case "list-scenarios": {
        const { data, error } = await auth.supabase
          .from("simulation_scenarios")
          .select("*")
          .eq("user_id", auth.user.id)
          .order("created_at", { ascending: false });
        if (error) return corsError(error.message, 400);
        return corsResponse({ scenarios: data });
      }

      case "create-scenario": {
        const { data, error } = await auth.supabase
          .from("simulation_scenarios")
          .insert({
            user_id: auth.user.id,
            name: params.name,
            description: params.description,
            parameters: params.parameters || {},
            status: "draft",
          })
          .select()
          .single();
        if (error) return corsError(error.message, 400);
        return corsResponse({ scenario: data }, 201);
      }

      case "run-projection": {
        const { data: scenario } = await auth.supabase
          .from("simulation_scenarios")
          .select("*")
          .eq("id", params.scenario_id)
          .eq("user_id", auth.user.id)
          .single();

        if (!scenario) return corsError("Scenario not found", 404);

        // Record projection run
        const { data, error } = await auth.supabase
          .from("simulation_runs")
          .insert({
            user_id: auth.user.id,
            scenario_id: params.scenario_id,
            parameters: scenario.parameters,
            status: "completed",
            results: { projected: true, timestamp: new Date().toISOString() },
          })
          .select()
          .single();
        if (error) return corsError(error.message, 400);
        return corsResponse({ run: data }, 201);
      }

      case "mutate-parameters": {
        const { data, error } = await auth.supabase
          .from("simulation_scenarios")
          .update({ parameters: params.parameters })
          .eq("id", params.scenario_id)
          .eq("user_id", auth.user.id)
          .select()
          .single();
        if (error) return corsError(error.message, 400);
        return corsResponse({ scenario: data });
      }

      default:
        return corsError("Unknown action", 400);
    }
  } catch (err) {
    console.error("[SimulationEngineAPI]", err);
    return corsError("Internal server error", 500);
  }
});
