// ═══════════════════════════════════════════════════════════════
// SITA OS — db-truth-introspect (DOMAIN_FUNCTION)
// Read-only DB introspection for admin Schema/RLS/Migration views.
// Caller class: admin-bff only. Whitelisted queries only.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Op = "schema" | "policies" | "tenancy" | "drift" | "summary";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "missing auth" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify caller is authenticated admin
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) return json({ error: "unauthorized" }, 401);

    const { data: hasAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!hasAdmin) return json({ error: "admin role required" }, 403);

    const { op } = (await req.json().catch(() => ({}))) as { op?: Op };

    switch (op) {
      case "schema": {
        const { data, error } = await supabase
          .from("pg_tables" as any)
          .select("tablename, rowsecurity")
          .eq("schemaname", "public")
          .order("tablename");
        if (error) return json({ error: error.message }, 500);
        return json({ tables: data });
      }
      case "summary":
      default: {
        // Return aggregate counts only (safe for any caller op)
        const stats: Record<string, number> = {};
        for (const t of ["admin_action_audit", "user_roles", "profiles"]) {
          const { count } = await supabase.from(t).select("*", { count: "exact", head: true });
          stats[t] = count ?? 0;
        }
        return json({ summary: stats, generatedAt: new Date().toISOString() });
      }
    }
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
