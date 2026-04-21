import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { withCors } from "../_shared/cors.ts";

Deno.serve(withCors("admin-reset-user-setup", async (req, ctx) => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const authHeader = req.headers.get("authorization") ?? "";
  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (authError || !user) return ctx.error("Unauthorized", 401);

  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
  if (!roles || roles.length === 0) return ctx.error("Admin role required", 403);

  const { target_user_id } = await req.json();
  if (!target_user_id) return ctx.error("target_user_id required", 400);

  const { error: resetError } = await supabase.from("accounts").update({ status: "pending_setup", metadata: {} }).eq("user_id", target_user_id);
  if (resetError) return ctx.error(resetError.message, 500);

  await supabase.from("admin_action_audit").insert({
    actor_user_id: user.id, action: "reset_user_setup", target_type: "user", target_id: target_user_id,
    plane: "admin", severity: "high", justification: "Admin-initiated user setup reset",
    metadata: { _requestId: ctx.requestId },
  });

  return ctx.json({ success: true, target_user_id });
}));