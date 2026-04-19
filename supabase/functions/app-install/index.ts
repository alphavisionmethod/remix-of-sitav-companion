// ═══════════════════════════════════════════════════════════════
// app-install — install (or re-enable) an app for current user
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { EdgeLogger } from "../_shared/logger.ts";
const logger = new EdgeLogger("app-install");
logger.info("boot", { ts: Date.now() });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

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

    const body = await req.json().catch(() => ({}));
    const appId = (body.app_id || body.appId || "").toString().trim();
    if (!appId || appId.length > 200) return json({ error: "app_id required" }, 400);

    const sourceChannel = (body.source_channel || "store").toString().slice(0, 50);
    const permsGranted = body.permissions_granted ?? {};

    // Validate the app exists in catalog
    const { data: catalogApp, error: catalogErr } = await supabase
      .from("apps")
      .select("app_id,latest_version,installability,enabled,permissions_required")
      .eq("app_id", appId)
      .maybeSingle();
    if (catalogErr) return json({ error: catalogErr.message }, 500);
    if (!catalogApp || !catalogApp.enabled)
      return json({ error: "app_not_in_catalog" }, 404);

    if (catalogApp.installability === "unavailable")
      return json({ error: "app_unavailable" }, 409);

    const { data, error } = await supabase
      .from("installed_apps")
      .upsert(
        {
          user_id: userId,
          app_id: appId,
          install_status: "installed",
          enabled: true,
          version_installed: catalogApp.latest_version,
          permissions_granted: permsGranted,
          source_channel: sourceChannel,
        },
        { onConflict: "user_id,app_id" },
      )
      .select("*")
      .maybeSingle();
    if (error) return json({ error: error.message }, 500);

    return json({ ok: true, installed: data });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
