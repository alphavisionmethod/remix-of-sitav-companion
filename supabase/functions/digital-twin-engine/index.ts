// ═══════════════════════════════════════════════════════════════
// SITA OS — Digital Twin Engine
// Manages digital twin state, snapshots, and simulation triggers
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, corsResponse, corsError } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";


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

  try {
    const body = req.method === "GET" ? { action: "get-state" } : await req.json();
    const { action, ...params } = body;

    switch (action) {
      case "get-state": {
        const { data, error } = await auth.supabase
          .from("digital_twin_state")
          .select("*")
          .eq("user_id", auth.user.id)
          .single();
        if (error) return corsError(error.message, 404);
        return corsResponse({ twin: data });
      }

      case "snapshot": {
        const { data: current } = await auth.supabase
          .from("digital_twin_state")
          .select("*")
          .eq("user_id", auth.user.id)
          .single();

        const { data, error } = await auth.supabase
          .from("digital_twin_snapshots")
          .insert({
            user_id: auth.user.id,
            state_snapshot: current,
            label: params.label || "manual-snapshot",
          })
          .select()
          .single();
        if (error) return corsError(error.message, 400);
        return corsResponse({ snapshot: data }, 201);
      }

      case "update-parameters": {
        const { data, error } = await auth.supabase
          .from("digital_twin_state")
          .upsert({
            user_id: auth.user.id,
            parameters: params.parameters,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) return corsError(error.message, 400);
        return corsResponse({ twin: data });
      }

      case "list-snapshots": {
        const { data, error } = await auth.supabase
          .from("digital_twin_snapshots")
          .select("*")
          .eq("user_id", auth.user.id)
          .order("created_at", { ascending: false })
          .limit(params.limit || 20);
        if (error) return corsError(error.message, 400);
        return corsResponse({ snapshots: data });
      }

      default:
        return corsError("Unknown action", 400);
    }
  } catch (err) {
    console.error("[DigitalTwinEngine]", err);
    return corsError("Internal server error", 500);
  }
});
