// ═══════════════════════════════════════════════════════════════
// app-launch-resolve — return launch instruction + log launch event
// Structured logging via canonical EdgeLogger (Phase 33 cleanup).
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { EdgeLogger } from "../_shared/logger.ts";
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
  const correlationId = req.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const log = new EdgeLogger("app-launch-resolve", correlationId);
  const t0 = performance.now();

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    log.warn("method_not_allowed", { method: req.method, failure_class: "bad_method" });
    return json({ error: "method_not_allowed" }, 405);
  }

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) {
      log.warn("missing_auth", { failure_class: "auth_missing" });
      return json({ error: "unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      log.warn("auth_failed", { failure_class: "auth_invalid" });
      return json({ error: "unauthorized" }, 401);
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const appId = (body.app_id || body.appId || "").toString().trim();
    const surface = (body.surface || "desktop").toString().slice(0, 32);
    const launchContext = body.launch_context ?? {};
    const launchResult = (body.launch_result || "success").toString();

    if (!appId) {
      log.warn("invalid_input", { failure_class: "bad_request", actor: userId });
      return json({ error: "app_id required" }, 400);
    }

    const [{ data: app }, { data: installed }] = await Promise.all([
      supabase.from("apps").select("*").eq("app_id", appId).eq("enabled", true).maybeSingle(),
      supabase
        .from("installed_apps")
        .select("*")
        .eq("user_id", userId)
        .eq("app_id", appId)
        .maybeSingle(),
    ]);

    if (!app) {
      log.warn("app_not_found", { failure_class: "not_found", actor: userId, target: appId });
      return json({ error: "app_not_found" }, 404);
    }

    // Auto-install preinstalled apps on first launch
    let installState = installed;
    if (!installState && app.installability === "preinstalled") {
      const { data: created } = await supabase
        .from("installed_apps")
        .upsert(
          {
            user_id: userId,
            app_id: appId,
            install_status: "installed",
            version_installed: app.latest_version,
            source_channel: "preinstalled",
          },
          { onConflict: "user_id,app_id" },
        )
        .select("*")
        .maybeSingle();
      installState = created;
    }

    // Log launch event (telemetry, append-only)
    await supabase.from("app_launch_events").insert({
      user_id: userId,
      app_id: appId,
      surface,
      launch_result: ["success", "degraded", "failed", "cancelled"].includes(launchResult)
        ? launchResult
        : "success",
      launch_context: launchContext,
    });

    // Increment launch count + last_launched_at
    if (installState) {
      await supabase
        .from("installed_apps")
        .update({
          launch_count: (installState.launch_count ?? 0) + 1,
          last_launched_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("app_id", appId);
    }

    log.complete(200, Math.round(performance.now() - t0), {
      event_type: "app_launch", actor: userId, target: appId, surface,
      result: launchResult, launch_count: (installState?.launch_count ?? 0) + 1,
    });
    return json({ ok: true, app, installed: installState });
  } catch (e) {
    log.error("unhandled_exception", { failure_class: "internal_error", error: (e as Error).message });
    return json({ error: (e as Error).message }, 500);
  }
});
