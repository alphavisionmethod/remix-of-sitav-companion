import { handleCors, corsResponse, corsError } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const cors = handleCors(req);
  if (cors) return cors;

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  const { user, supabase } = auth;

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "";

  try {
    // LIST my tenants
    if (action === "list" || (req.method === "GET" && !action)) {
      const { data: memberships } = await supabase.from("cloud_tenant_memberships")
        .select("*, cloud_tenants(*)").eq("user_id", user.id);
      return corsResponse({ tenants: memberships || [] });
    }

    const body = await req.json().catch(() => ({}));

    // CREATE tenant
    if (action === "create") {
      const { name, type, slug } = body;
      if (!name) return corsError("name required", 400);

      const tenantSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 50);

      const { data: tenant, error } = await supabase.from("cloud_tenants").insert({
        name, type: type || "team", slug: tenantSlug, owner_user_id: user.id,
      }).select().single();

      if (error) return corsError(error.message, 500);

      // Add creator as owner member
      await supabase.from("cloud_tenant_memberships").insert({
        tenant_id: tenant.id, user_id: user.id, role: "owner",
      });

      // Create default quota
      await supabase.from("cloud_tenant_quotas").insert({
        tenant_id: tenant.id, quota_bytes: 10737418240,
      });

      return corsResponse({ tenant });
    }

    // INVITE member
    if (action === "invite") {
      const { tenant_id, target_user_id, role } = body;
      if (!tenant_id || !target_user_id) return corsError("tenant_id and target_user_id required", 400);

      const { data, error } = await supabase.from("cloud_tenant_memberships").insert({
        tenant_id, user_id: target_user_id, role: role || "member", invited_by: user.id,
      }).select().single();

      if (error) return corsError(error.message, 500);
      return corsResponse({ membership: data });
    }

    // SET POLICY
    if (action === "policy") {
      const { tenant_id, policy_key, display_name, value_json, enforced, category } = body;
      if (!tenant_id || !policy_key) return corsError("tenant_id and policy_key required", 400);

      const { data, error } = await supabase.from("cloud_tenant_policies").upsert({
        tenant_id, policy_key,
        display_name: display_name || policy_key,
        value_json: value_json || {},
        enforced: enforced ?? true,
        category: category || "general",
      }, { onConflict: "tenant_id,policy_key" }).select().single();

      if (error) return corsError(error.message, 500);
      return corsResponse({ policy: data });
    }

    // USAGE — tenant-wide storage
    if (action === "usage") {
      const { tenant_id } = body;
      if (!tenant_id) return corsError("tenant_id required", 400);

      const { data: quota } = await supabase.from("cloud_tenant_quotas")
        .select("*").eq("tenant_id", tenant_id).maybeSingle();
      const { data: members } = await supabase.from("cloud_tenant_memberships")
        .select("user_id").eq("tenant_id", tenant_id);

      return corsResponse({
        quota: quota || { used_bytes: 0, quota_bytes: 10737418240, file_count: 0 },
        member_count: members?.length || 0,
      });
    }

    // CREATE WORKSPACE
    if (action === "workspace") {
      const { tenant_id, name, description, visibility } = body;
      if (!tenant_id || !name) return corsError("tenant_id and name required", 400);

      const { data, error } = await supabase.from("cloud_shared_workspaces").insert({
        tenant_id, name, description: description || "",
        owner_user_id: user.id, visibility: visibility || "internal",
      }).select().single();

      if (error) return corsError(error.message, 500);
      return corsResponse({ workspace: data });
    }

    return corsError("Unknown action", 400);
  } catch (err) {
    return corsError(err instanceof Error ? err.message : "Internal error", 500);
  }
});
