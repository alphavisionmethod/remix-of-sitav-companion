// ═══════════════════════════════════════════════════════════════
// app-permissions-sync — read/write per-user permission overrides
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);
    const userId = userData.user.id;

    if (req.method === "GET") {
      const url = new URL(req.url);
      const appId = url.searchParams.get("app_id");
      let q = supabase.from("app_permissions_overrides").select("*").eq("user_id", userId);
      if (appId) q = q.eq("app_id", appId);
      const { data, error } = await q;
      if (error) return json({ error: error.message }, 500);
      return json({ permissions: data ?? [] });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const appId = (body.app_id || "").toString().trim();
      const grants = Array.isArray(body.grants) ? body.grants : [];
      if (!appId) return json({ error: "app_id required" }, 400);
      if (grants.length === 0) return json({ ok: true, updated: 0 });

      const rows = grants
        .map((g: { key?: string; granted?: boolean; value?: unknown }) => ({
          user_id: userId,
          app_id: appId,
          permission_key: (g.key || "").toString().slice(0, 100),
          granted: !!g.granted,
          permission_value: g.value ?? {},
        }))
        .filter((r) => r.permission_key.length > 0);

      const { error, count } = await supabase
        .from("app_permissions_overrides")
        .upsert(rows, { onConflict: "user_id,app_id,permission_key", count: "exact" });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, updated: count ?? rows.length });
    }

    return json({ error: "method_not_allowed" }, 405);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
