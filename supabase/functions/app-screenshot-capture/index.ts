// ═══════════════════════════════════════════════════════════════
// app-screenshot-capture — capture homepage screenshot via external service
// Honest degradation: if no provider key, marks job as `degraded`.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function captureViaMicrolink(url: string): Promise<Uint8Array | null> {
  // Microlink free tier — no key required, rate-limited.
  try {
    const api = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
    const res = await fetch(api, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.startsWith("image/")) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

async function captureViaBrowserless(url: string, key: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(`https://chrome.browserless.io/screenshot?token=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, options: { type: "png", fullPage: false } }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const BROWSERLESS = Deno.env.get("BROWSERLESS_API_KEY");

    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: auth } } });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return json({ error: "unauthorized" }, 401);

    const svc = createClient(SUPABASE_URL, SERVICE);
    const { data: isAdmin } = await svc.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "admin_required" }, 403);

    const body = await req.json().catch(() => ({}));
    const url = String(body?.url ?? "").trim();
    const appId = String(body?.app_id ?? "").trim() || null;
    if (!url) return json({ error: "url_required" }, 400);

    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return json({ error: "invalid_protocol" }, 400);

    const { data: job } = await svc
      .from("app_ingestion_jobs")
      .insert({ source_url: url, job_type: "screenshot", status: "running", requested_by: u.user.id, app_id: appId })
      .select("id").single();

    try {
      let bytes: Uint8Array | null = null;
      let provider = "none";
      if (BROWSERLESS) {
        bytes = await captureViaBrowserless(url, BROWSERLESS);
        provider = "browserless";
      }
      if (!bytes) {
        bytes = await captureViaMicrolink(url);
        provider = "microlink";
      }

      if (!bytes) {
        await svc.from("app_ingestion_jobs").update({
          status: "degraded",
          error_json: { reason: "no_provider_available", provider_attempted: provider },
        }).eq("id", job!.id);
        return json({
          ok: false,
          degraded: true,
          reason: "Screenshot provider unavailable. Set BROWSERLESS_API_KEY for reliable capture.",
          job_id: job!.id,
        });
      }

      const slug = parsed.host.replace(/[^a-z0-9]/gi, "-").toLowerCase();
      const path = `screenshots/${slug}/shot-${Date.now()}.png`;
      const { error: upErr } = await svc.storage.from("app-assets").upload(path, bytes, {
        contentType: "image/png",
        upsert: true,
      });
      if (upErr) throw upErr;

      await svc.from("app_assets").insert({
        app_id: appId,
        asset_type: "screenshot",
        storage_path: path,
        source_url: url,
        mime_type: "image/png",
      });

      const result = { provider, storage_path: path, source_url: url };
      await svc.from("app_ingestion_jobs").update({
        status: "completed",
        result_json: result as unknown as Record<string, unknown>,
      }).eq("id", job!.id);

      return json({ ok: true, job_id: job!.id, result });
    } catch (e) {
      await svc.from("app_ingestion_jobs").update({
        status: "failed",
        error_json: { message: (e as Error).message },
      }).eq("id", job!.id);
      return json({ ok: false, error: (e as Error).message, job_id: job!.id }, 500);
    }
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
