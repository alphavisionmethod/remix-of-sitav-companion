import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPPORT_PERMISSIONS = [
  "support.view", "support.grant", "support.repair",
  "users.view", "devices.view", "sync.view",
];

const SUPPORT_ROUTES = [
  "user-lookup", "device-inspect", "sync-trace", "run-diagnostic", "safe-repair",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Must have at least support.view
    const { data: hasSupport } = await supabase.rpc("has_admin_permission", {
      _user_id: user.id,
      _permission: "support.view",
    });
    if (!hasSupport) {
      return new Response(JSON.stringify({ error: "Forbidden: support role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { route, params, justification } = body;

    if (!SUPPORT_ROUTES.includes(route)) {
      return new Response(JSON.stringify({ error: `Invalid support route: ${route}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine required permission for route
    let requiredPerm = "support.view";
    if (route === "safe-repair") requiredPerm = "support.repair";
    if (route === "run-diagnostic") requiredPerm = "support.repair";

    const { data: hasPerm } = await supabase.rpc("has_admin_permission", {
      _user_id: user.id,
      _permission: requiredPerm,
    });

    if (!hasPerm) {
      await supabase.from("admin_action_audit").insert({
        actor_user_id: user.id,
        action: `support:denied:${route}`,
        plane: "control",
        justification,
        severity: "warning",
        metadata: { route, params, denied: true },
      });
      return new Response(JSON.stringify({ error: `Missing permission: ${requiredPerm}` }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Audit the support action
    await supabase.from("admin_action_audit").insert({
      actor_user_id: user.id,
      action: `support:${route}`,
      target_type: "support",
      target_id: params?.targetUserId || params?.deviceId,
      plane: "control",
      justification: justification || "Support action",
      severity: route === "safe-repair" ? "warning" : "info",
      metadata: { route, params },
    });

    return new Response(JSON.stringify({
      success: true,
      route,
      message: `Support action ${route} authorized and logged`,
      userId: user.id,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
