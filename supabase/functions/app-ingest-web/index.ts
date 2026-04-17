// ═══════════════════════════════════════════════════════════════
// app-ingest-web — fetch URL, parse HTML metadata + icons + manifest link
// Admin-only. Stores discovered icons in app-assets bucket.
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

interface IngestResult {
  source_url: string;
  canonical_url: string;
  title: string | null;
  description: string | null;
  theme_color: string | null;
  publisher: string | null;
  manifest_url: string | null;
  og_image: string | null;
  icons: Array<{ source_url: string; storage_path: string; size: number | null; mime: string }>;
  apple_touch_icon: { source_url: string; storage_path: string } | null;
  app_id_suggestion: string;
}

function pickAttr(tag: string, attr: string): string | null {
  const re = new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, "i");
  const m = tag.match(re);
  return m ? m[1] : null;
}

function findAll(html: string, re: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) out.push(m[0]);
  return out;
}

function parseHtml(html: string, baseUrl: string) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  const metas = findAll(html, /<meta\s[^>]*>/gi);
  const links = findAll(html, /<link\s[^>]*>/gi);

  let description: string | null = null;
  let themeColor: string | null = null;
  let ogImage: string | null = null;
  let ogTitle: string | null = null;
  let ogSiteName: string | null = null;
  let appName: string | null = null;

  for (const m of metas) {
    const name = pickAttr(m, "name")?.toLowerCase() ?? pickAttr(m, "property")?.toLowerCase();
    const content = pickAttr(m, "content");
    if (!name || !content) continue;
    if (name === "description" && !description) description = content;
    if (name === "theme-color" && !themeColor) themeColor = content;
    if (name === "og:image" && !ogImage) ogImage = content;
    if (name === "og:title" && !ogTitle) ogTitle = content;
    if (name === "og:site_name" && !ogSiteName) ogSiteName = content;
    if (name === "application-name" && !appName) appName = content;
  }

  const icons: Array<{ href: string; sizes: string | null; type: string | null }> = [];
  let appleTouch: string | null = null;
  let manifestUrl: string | null = null;
  let canonical: string | null = null;

  for (const l of links) {
    const rel = pickAttr(l, "rel")?.toLowerCase() ?? "";
    const href = pickAttr(l, "href");
    if (!href) continue;
    if (rel === "manifest" && !manifestUrl) manifestUrl = new URL(href, baseUrl).toString();
    if (rel === "canonical" && !canonical) canonical = new URL(href, baseUrl).toString();
    if (rel === "apple-touch-icon" || rel === "apple-touch-icon-precomposed") {
      if (!appleTouch) appleTouch = new URL(href, baseUrl).toString();
    }
    if (rel.includes("icon")) {
      icons.push({
        href: new URL(href, baseUrl).toString(),
        sizes: pickAttr(l, "sizes"),
        type: pickAttr(l, "type"),
      });
    }
  }

  return {
    title: ogTitle ?? title,
    description,
    themeColor,
    ogImage: ogImage ? new URL(ogImage, baseUrl).toString() : null,
    publisher: ogSiteName ?? appName,
    icons,
    appleTouch,
    manifestUrl,
    canonical: canonical ?? baseUrl,
  };
}

function suggestAppId(host: string): string {
  const parts = host.toLowerCase().replace(/^www\./, "").split(".");
  return parts.reverse().join(".") || `web.${host}`;
}

function pickLargestIcon(icons: Array<{ href: string; sizes: string | null }>): { href: string; size: number | null } | null {
  if (icons.length === 0) return null;
  let best = { href: icons[0].href, size: 0 };
  for (const i of icons) {
    const m = i.sizes?.match(/(\d+)x\d+/);
    const s = m ? parseInt(m[1], 10) : 0;
    if (s > best.size) best = { href: i.href, size: s };
  }
  return { href: best.href, size: best.size || null };
}

async function downloadAndStore(
  svc: ReturnType<typeof createClient>,
  url: string,
  appIdSlug: string,
  kind: string,
): Promise<{ storage_path: string; mime: string; size_bytes: number } | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "SitaOS-Ingest/1.0 (+https://sita.os)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > 5 * 1024 * 1024) return null;
    const mime = res.headers.get("content-type")?.split(";")[0].trim() ?? "application/octet-stream";
    const ext = mime.includes("png") ? "png" : mime.includes("svg") ? "svg" : mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : mime.includes("ico") ? "ico" : "bin";
    const path = `icons/${appIdSlug}/${kind}-${Date.now()}.${ext}`;
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
    const sourceUrl = String(body?.url ?? "").trim();
    if (!sourceUrl) return json({ error: "url_required" }, 400);

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(sourceUrl);
    } catch {
      return json({ error: "invalid_url" }, 400);
    }
    if (!["http:", "https:"].includes(parsedUrl.protocol)) return json({ error: "invalid_protocol" }, 400);

    // Create job
    const { data: job, error: jobErr } = await svc
      .from("app_ingestion_jobs")
      .insert({ source_url: sourceUrl, job_type: "web", status: "running", requested_by: u.user.id })
      .select("id").single();
    if (jobErr) return json({ error: jobErr.message }, 500);

    try {
      const res = await fetch(sourceUrl, {
        headers: { "User-Agent": "SitaOS-Ingest/1.0 (+https://sita.os)", Accept: "text/html" },
        signal: AbortSignal.timeout(15000),
        redirect: "follow",
      });
      if (!res.ok) throw new Error(`fetch_failed_${res.status}`);
      const html = await res.text();
      const baseUrl = res.url || sourceUrl;
      const meta = parseHtml(html, baseUrl);

      const appIdSlug = parsedUrl.host.replace(/[^a-z0-9]/gi, "-").toLowerCase();
      const appId = suggestAppId(parsedUrl.host);

      // Download main icon (favicon)
      const fallbackIco = new URL("/favicon.ico", baseUrl).toString();
      const iconCandidates = meta.icons.length > 0 ? meta.icons : [{ href: fallbackIco, sizes: null, type: null }];
      const largest = pickLargestIcon(iconCandidates);

      const storedIcons: IngestResult["icons"] = [];
      if (largest) {
        const stored = await downloadAndStore(svc, largest.href, appIdSlug, "icon");
        if (stored) {
          storedIcons.push({ source_url: largest.href, storage_path: stored.storage_path, size: largest.size, mime: stored.mime });
        }
      }

      // Apple touch icon
      let appleTouchStored: IngestResult["apple_touch_icon"] = null;
      if (meta.appleTouch) {
        const stored = await downloadAndStore(svc, meta.appleTouch, appIdSlug, "apple-touch");
        if (stored) appleTouchStored = { source_url: meta.appleTouch, storage_path: stored.storage_path };
      }

      // OG image
      if (meta.ogImage) {
        const stored = await downloadAndStore(svc, meta.ogImage, appIdSlug, "og");
        if (stored) {
          await svc.from("app_assets").insert({
            asset_type: "og_image",
            storage_path: stored.storage_path,
            source_url: meta.ogImage,
            mime_type: stored.mime,
            checksum: null,
          });
        }
      }

      // Persist asset rows
      for (const i of storedIcons) {
        await svc.from("app_assets").insert({
          asset_type: "icon",
          storage_path: i.storage_path,
          source_url: i.source_url,
          width: i.size,
          height: i.size,
          mime_type: i.mime,
        });
      }
      if (appleTouchStored) {
        await svc.from("app_assets").insert({
          asset_type: "apple_touch_icon",
          storage_path: appleTouchStored.storage_path,
          source_url: appleTouchStored.source_url,
          mime_type: "image/png",
        });
      }

      const result: IngestResult = {
        source_url: sourceUrl,
        canonical_url: meta.canonical,
        title: meta.title,
        description: meta.description,
        theme_color: meta.themeColor,
        publisher: meta.publisher,
        manifest_url: meta.manifestUrl,
        og_image: meta.ogImage,
        icons: storedIcons,
        apple_touch_icon: appleTouchStored,
        app_id_suggestion: appId,
      };

      await svc.from("app_ingestion_jobs").update({
        status: "completed",
        result_json: result as unknown as Record<string, unknown>,
      }).eq("id", job.id);

      return json({ ok: true, job_id: job.id, result });
    } catch (e) {
      await svc.from("app_ingestion_jobs").update({
        status: "failed",
        error_json: { message: (e as Error).message },
      }).eq("id", job.id);
      return json({ ok: false, error: (e as Error).message, job_id: job.id }, 500);
    }
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
