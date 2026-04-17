// ═══════════════════════════════════════════════════════════════
// app-update-check — installed vs latest version comparison
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

    const { data: installed, error: instErr } = await supabase
      .from("installed_apps")
      .select("app_id,version_installed,install_status")
      .eq("user_id", userId)
      .neq("install_status", "not_installed");
    if (instErr) return json({ error: instErr.message }, 500);

    const appIds = (installed ?? []).map((r) => r.app_id);
    if (appIds.length === 0) return json({ updates: [], total: 0 });

    const { data: catalog, error: catErr } = await supabase
      .from("apps")
      .select("app_id,name,latest_version,update_channel,icon_url")
      .in("app_id", appIds);
    if (catErr) return json({ error: catErr.message }, 500);

    const catalogMap = new Map((catalog ?? []).map((a) => [a.app_id, a]));
    const updates = (installed ?? []).flatMap((row) => {
      const cat = catalogMap.get(row.app_id);
      if (!cat) return [];
      if (row.version_installed && cat.latest_version !== row.version_installed) {
        return [
          {
            app_id: row.app_id,
            name: cat.name,
            icon_url: cat.icon_url,
            installed_version: row.version_installed,
            latest_version: cat.latest_version,
            channel: cat.update_channel,
          },
        ];
      }
      return [];
    });

    return json({ updates, total: updates.length });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
