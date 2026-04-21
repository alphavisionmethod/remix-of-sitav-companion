import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { withCors } from "../_shared/cors.ts";

Deno.serve(withCors("admin-revoke-session", async (req, ctx) => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const authHeader = req.headers.get("authorization") ?? "";
  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (authError || !user) return ctx.error("Unauthorized", 401);

  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
  if (!roles || roles.length === 0) return ctx.error("Admin role required", 403);

  const { target_user_id, reason } = await req.json();
  if (!target_user_id) return ctx.error("target_user_id required", 400);

  const { error: revokeError } = await supabase
    .from("admin_sessions")
    .update({ status: "revoked", revoked_at: new Date().toISOString(), revoke_reason: reason || "Admin-initiated session revocation" })
    .eq("user_id", target_user_id)
    .eq("status", "active");

  if (revokeError) return ctx.error(revokeError.message, 500);

  await supabase.from("admin_action_audit").insert({
    actor_user_id: user.id, action: "revoke_session", target_type: "user", target_id: target_user_id,
    plane: "admin", severity: "critical", justification: reason || "Admin-initiated session revocation",
    metadata: { _requestId: ctx.requestId },
  });

  return ctx.json({ success: true, target_user_id });
}));