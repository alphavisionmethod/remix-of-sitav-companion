import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Admin role required" }), { status: 403, headers: corsHeaders });
    }

    const { target_user_id, reason } = await req.json();
    if (!target_user_id) {
      return new Response(JSON.stringify({ error: "target_user_id required" }), { status: 400, headers: corsHeaders });
    }

    // Revoke all active admin sessions
    const { error: revokeError } = await supabase
      .from("admin_sessions")
      .update({
        status: "revoked",
        revoked_at: new Date().toISOString(),
        revoke_reason: reason || "Admin-initiated session revocation",
      })
      .eq("user_id", target_user_id)
      .eq("status", "active");

    if (revokeError) {
      return new Response(JSON.stringify({ error: revokeError.message }), { status: 500, headers: corsHeaders });
    }

    // Audit log
    await supabase.from("admin_action_audit").insert({
      actor_user_id: user.id,
      action: "revoke_session",
      target_type: "user",
      target_id: target_user_id,
      plane: "admin",
      severity: "critical",
      justification: reason || "Admin-initiated session revocation",
    });

    return new Response(JSON.stringify({ success: true, target_user_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});