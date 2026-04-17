// ═══════════════════════════════════════════════════════════════
// app-manifest-sync — admin-only manifest validate + upsert
// (Future hook for publisher onboarding / signed manifests)
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

const ALLOWED_TYPES = new Set(["internal", "web", "pwa", "external_desktop", "pack"]);
const ALLOWED_STRATEGIES = new Set([
  "internal_route",
  "embedded_webview",
  "external_browser",
  "pwa_window",
  "native_binary",
  "deep_link",
  "electron_child_process",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "unauthorized" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);

    // admin gate
    const { data: roleRow } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const m = body.manifest;
    if (!m || typeof m !== "object")
      return json({ error: "manifest_required" }, 400);

    // Validation
    const errors: string[] = [];
    if (!m.app_id || typeof m.app_id !== "string") errors.push("app_id required");
    if (!m.slug || typeof m.slug !== "string") errors.push("slug required");
    if (!m.name || typeof m.name !== "string") errors.push("name required");
    if (!ALLOWED_TYPES.has(m.app_type)) errors.push(`app_type invalid (${m.app_type})`);
    if (!ALLOWED_STRATEGIES.has(m.launch_strategy))
      errors.push(`launch_strategy invalid (${m.launch_strategy})`);
    if (errors.length > 0) return json({ error: "validation_failed", details: errors }, 400);

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const row = {
      app_id: m.app_id,
      slug: m.slug,
      name: m.name,
      short_name: m.short_name ?? null,
      description: m.description ?? null,
      publisher: m.publisher ?? null,
      app_type: m.app_type,
      launch_strategy: m.launch_strategy,
      launch_target: m.launch_target ?? {},
      category: m.category ?? null,
      tags: m.tags ?? [],
      icon_url: m.icon_url ?? null,
      banner_url: m.banner_url ?? null,
      screenshots: m.screenshots ?? [],
      permissions_required: m.permissions_required ?? [],
      supported_surfaces: m.supported_surfaces ?? ["desktop"],
      installability: m.installability ?? "installable",
      verification_status: m.verification_status ?? "unverified",
      trust_level: m.trust_level ?? "standard",
      version: m.version ?? "1.0.0",
      latest_version: m.latest_version ?? m.version ?? "1.0.0",
      update_channel: m.update_channel ?? "stable",
      enabled: m.enabled ?? true,
      featured: m.featured ?? false,
      pinned_default: m.pinned_default ?? false,
      sort_order: m.sort_order ?? 0,
      requires_auth: m.requires_auth ?? true,
      requires_shell: m.requires_shell ?? true,
      offline_support: m.offline_support ?? "none",
      window_defaults: m.window_defaults ?? {},
      manifest_json: m,
    };

    const { data, error } = await adminClient
      .from("apps")
      .upsert(row, { onConflict: "app_id" })
      .select("*")
      .maybeSingle();
    if (error) return json({ error: error.message }, 500);

    // Insert version record if new
    if (m.latest_version || m.version) {
      const v = m.latest_version ?? m.version;
      await adminClient
        .from("app_versions")
        .upsert(
          {
            app_id: row.app_id,
            version: v,
            release_notes: m.release_notes ?? null,
            manifest_json: m,
            is_latest: true,
          },
          { onConflict: "app_id,version" },
        );
      // Demote older versions
      await adminClient
        .from("app_versions")
        .update({ is_latest: false })
        .eq("app_id", row.app_id)
        .neq("version", v);
    }

    return json({ ok: true, app: data });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
