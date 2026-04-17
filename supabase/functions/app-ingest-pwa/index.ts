// ═══════════════════════════════════════════════════════════════
// app-ingest-pwa — fetch + parse PWA manifest.json, download icons
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

interface PwaManifest {
  name?: string;
  short_name?: string;
  description?: string;
  start_url?: string;
  scope?: string;
  display?: string;
  theme_color?: string;
  background_color?: string;
  orientation?: string;
  icons?: Array<{ src: string; sizes?: string; type?: string; purpose?: string }>;
}

async function downloadAndStore(
  svc: ReturnType<typeof createClient>,
  url: string,
  slug: string,
  kind: string,
): Promise<{ storage_path: string; mime: string; size_bytes: number } | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "SitaOS-Ingest/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > 5 * 1024 * 1024) return null;
    const mime = res.headers.get("content-type")?.split(";")[0].trim() ?? "image/png";
    const ext = mime.includes("png") ? "png" : mime.includes("svg") ? "svg" : mime.includes("jpeg") ? "jpg" : "bin";
    const path = `icons/${slug}/${kind}-${Date.now()}.${ext}`;
    const { error } = await svc.storage.from("app-assets").upload(path, buf, { contentType: mime, upsert: true });
    if (error) return null;
    return { storage_path: path, mime, size_bytes: buf.byteLength };
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

    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: auth } } });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return json({ error: "unauthorized" }, 401);

    const svc = createClient(SUPABASE_URL, SERVICE);
    const { data: isAdmin } = await svc.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "admin_required" }, 403);

    const body = await req.json().catch(() => ({}));
    const manifestUrl = String(body?.manifest_url ?? "").trim();
    if (!manifestUrl) return json({ error: "manifest_url_required" }, 400);

    const parsedUrl = new URL(manifestUrl);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) return json({ error: "invalid_protocol" }, 400);

    const { data: job } = await svc
      .from("app_ingestion_jobs")
      .insert({ source_url: manifestUrl, job_type: "pwa", status: "running", requested_by: u.user.id })
      .select("id").single();

    try {
      const res = await fetch(manifestUrl, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`manifest_fetch_${res.status}`);
      const manifest = (await res.json()) as PwaManifest;

      const slug = parsedUrl.host.replace(/[^a-z0-9]/gi, "-").toLowerCase();
      const storedIcons: Array<{ source_url: string; storage_path: string; size: number | null; mime: string; purpose: string }> = [];

      for (const icon of manifest.icons ?? []) {
        const absoluteUrl = new URL(icon.src, manifestUrl).toString();
        const sizeNum = icon.sizes?.split(/\s+/)[0]?.match(/(\d+)/)?.[1];
        const stored = await downloadAndStore(svc, absoluteUrl, slug, `pwa-${sizeNum ?? "any"}`);
        if (stored) {
          storedIcons.push({
            source_url: absoluteUrl,
            storage_path: stored.storage_path,
            size: sizeNum ? parseInt(sizeNum, 10) : null,
            mime: stored.mime,
            purpose: icon.purpose ?? "any",
          });
          await svc.from("app_assets").insert({
            asset_type: "icon",
            storage_path: stored.storage_path,
            source_url: absoluteUrl,
            width: sizeNum ? parseInt(sizeNum, 10) : null,
            height: sizeNum ? parseInt(sizeNum, 10) : null,
            mime_type: stored.mime,
          });
        }
      }

      // Store the raw manifest too
      const manifestBytes = new TextEncoder().encode(JSON.stringify(manifest, null, 2));
      const manifestPath = `manifests/${slug}/manifest-${Date.now()}.json`;
      await svc.storage.from("app-assets").upload(manifestPath, manifestBytes, {
        contentType: "application/json",
        upsert: true,
      });
      await svc.from("app_assets").insert({
        asset_type: "manifest",
        storage_path: manifestPath,
        source_url: manifestUrl,
        mime_type: "application/json",
      });

      const result = {
        manifest_url: manifestUrl,
        name: manifest.name ?? null,
        short_name: manifest.short_name ?? null,
        description: manifest.description ?? null,
        start_url: manifest.start_url ? new URL(manifest.start_url, manifestUrl).toString() : null,
        scope: manifest.scope ? new URL(manifest.scope, manifestUrl).toString() : null,
        display: manifest.display ?? null,
        theme_color: manifest.theme_color ?? null,
        background_color: manifest.background_color ?? null,
        orientation: manifest.orientation ?? null,
        icons: storedIcons,
        manifest_storage_path: manifestPath,
      };

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
