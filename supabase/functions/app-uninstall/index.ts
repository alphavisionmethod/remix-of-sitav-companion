// ═══════════════════════════════════════════════════════════════
// app-uninstall — remove app for current user (preserve launch history)
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    if (!appId) return json({ error: "app_id required" }, 400);

    // Preinstalled apps cannot be removed — disable instead
    const { data: catalog } = await supabase
      .from("apps")
      .select("installability")
      .eq("app_id", appId)
      .maybeSingle();

    if (catalog?.installability === "preinstalled") {
      const { data, error } = await supabase
        .from("installed_apps")
        .upsert(
          {
            user_id: userId,
            app_id: appId,
            install_status: "installed",
            enabled: false,
            pinned: false,
          },
          { onConflict: "user_id,app_id" },
        )
        .select("*")
        .maybeSingle();
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, mode: "disabled", installed: data });
    }

    const { error } = await supabase
      .from("installed_apps")
      .delete()
      .eq("user_id", userId)
      .eq("app_id", appId);
    if (error) return json({ error: error.message }, 500);

    return json({ ok: true, mode: "uninstalled" });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
