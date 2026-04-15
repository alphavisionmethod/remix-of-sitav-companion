import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate auth
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

    // Check admin role
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { route, action, params, justification } = body;

    // Check granular permission if route requires one
    if (action) {
      const { data: hasPermission } = await supabase.rpc("has_admin_permission", {
        _user_id: user.id,
        _permission: action,
      });

      if (!hasPermission) {
        // Log denied attempt
        await supabase.from("admin_action_audit").insert({
          actor_user_id: user.id,
          action: `denied:${action}`,
          target_type: route,
          plane: "control",
          justification,
          severity: "warning",
          metadata: { params, denied: true },
        });

        return new Response(JSON.stringify({ error: `Forbidden: missing permission ${action}` }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Log the admin action
    await supabase.from("admin_action_audit").insert({
      actor_user_id: user.id,
      action: action || route || "unknown",
      target_type: params?.targetType || route,
      target_id: params?.targetId,
      plane: "control",
      justification,
      severity: "info",
      metadata: { params, route },
    });

    return new Response(JSON.stringify({
      success: true,
      message: `Admin action ${action} on ${route} authorized and logged`,
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
