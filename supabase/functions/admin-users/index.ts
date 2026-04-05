import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, corsResponse, corsError } from "../_shared/cors.ts";
import { requireAdmin, getServiceClient } from "../_shared/auth.ts";
import { validateBody } from "../_shared/validate.ts";

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const auth = await requireAdmin(req);
    if (auth instanceof Response) return auth;

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
      const body = await req.json();
      const { action: postAction, target_user_id } = body;

      if (!target_user_id) {
        return new Response(JSON.stringify({ error: "target_user_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (postAction === "suspend") {
        const { error } = await adminClient.auth.admin.updateUserById(target_user_id, {
          ban_duration: "876000h",
        });
        if (error) throw error;

        await adminClient.from("audit_logs").insert({
          user_id: user.id, action: "suspend_user", category: "admin",
          actor: "admin", target_type: "user", target_id: target_user_id, severity: "high",
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (postAction === "unsuspend") {
        const { error } = await adminClient.auth.admin.updateUserById(target_user_id, {
          ban_duration: "none",
        });
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (postAction === "assign_role") {
        const { role } = body;
        if (!role) {
          return new Response(JSON.stringify({ error: "role required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { error } = await adminClient.from("user_roles").upsert(
          { user_id: target_user_id, role },
          { onConflict: "user_id,role" }
        );
        if (error) throw error;

        await adminClient.from("audit_logs").insert({
          user_id: user.id, action: "assign_role", category: "admin",
          actor: "admin", target_type: "user", target_id: target_user_id, severity: "high",
          details: { role },
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (postAction === "revoke_role") {
        const { role } = body;
        const { error } = await adminClient.from("user_roles")
          .delete().eq("user_id", target_user_id).eq("role", role);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("admin-users error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
