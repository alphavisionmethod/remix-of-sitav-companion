import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, corsResponse, corsError, corsHeaders } from "../_shared/cors.ts";
import { requireAdmin, getServiceClient } from "../_shared/auth.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { zodValidate, AdminUsersActionSchema } from "../_shared/zod-validate.ts";

const logger = new EdgeLogger("admin-users");

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const auth = await requireAdmin(req);
    if (auth instanceof Response) return auth;

    const rl = checkRateLimit(`admin-users:${auth.user.id}`, 30, 60_000);
    if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);
    logger.info("admin-users request", { userId: auth.user.id });

    const adminClient = getServiceClient();
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";

    if (req.method === "GET" && action === "list") {
      const page = parseInt(url.searchParams.get("page") || "1");
      const perPage = parseInt(url.searchParams.get("per_page") || "50");
      const search = url.searchParams.get("search") || "";

      const { data: { users }, error } = await adminClient.auth.admin.listUsers({
        page, perPage,
      });
      if (error) throw error;

      let filtered = users || [];
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(u =>
          u.email?.toLowerCase().includes(s) ||
          u.user_metadata?.full_name?.toLowerCase().includes(s)
        );
      }

      // Fetch roles for all users
      const { data: roles } = await adminClient.from("user_roles").select("user_id, role");
      const roleMap: Record<string, string[]> = {};
      (roles || []).forEach((r: any) => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r.role);
      });

      const result = filtered.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.user_metadata?.full_name || null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        banned: u.banned_until ? true : false,
        roles: roleMap[u.id] || [],
      }));

      return corsResponse({ users: result, total: result.length });
    }

    if (req.method === "POST") {
      const rawBody = await req.json().catch(() => null);
      if (!rawBody) return corsError("Invalid JSON body", 400);
      const validated = zodValidate(rawBody, AdminUsersActionSchema);
      if (!validated.success) return validated.response;
      const { action: postAction, target_user_id, role } = validated.data;

      if (postAction === "suspend") {
        const { error } = await adminClient.auth.admin.updateUserById(target_user_id, {
          ban_duration: "876000h",
        });
        if (error) throw error;
        await adminClient.from("audit_logs").insert({
          user_id: auth.user.id, action: "suspend_user", category: "admin",
          actor: "admin", target_type: "user", target_id: target_user_id, severity: "high",
        });

        return corsResponse({ success: true });
      }

      if (postAction === "unsuspend") {
        const { error } = await adminClient.auth.admin.updateUserById(target_user_id, {
          ban_duration: "none",
        });
        if (error) throw error;
        return corsResponse({ success: true });
      }

      if (postAction === "assign_role") {
        if (!role) return corsError("role required", 400);
        const { error } = await adminClient.from("user_roles").upsert(
          { user_id: target_user_id, role },
          { onConflict: "user_id,role" }
        );
        if (error) throw error;

        await adminClient.from("audit_logs").insert({
          user_id: auth.user.id, action: "assign_role", category: "admin",
          actor: "admin", target_type: "user", target_id: target_user_id, severity: "high",
          details: { role },
        });

        return corsResponse({ success: true });
      }

      if (postAction === "revoke_role") {
        if (!role) return corsError("role required", 400);
        const { error } = await adminClient.from("user_roles")
          .delete().eq("user_id", target_user_id).eq("role", role);
        if (error) throw error;
        return corsResponse({ success: true });
      }

      return corsError("Unknown action", 400);
    }

    return corsError("Method not allowed", 405);
  } catch (e) {
    console.error("admin-users error:", e);
    return corsError(e instanceof Error ? e.message : "Unknown error", 500);
  }
});
