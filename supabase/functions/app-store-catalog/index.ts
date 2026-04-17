// ═══════════════════════════════════════════════════════════════
// app-store-catalog — public catalog (list / search / filter / detail)
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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const url = new URL(req.url);
    const op = url.searchParams.get("op") ?? "list";
    const appId = url.searchParams.get("app_id");
    const slug = url.searchParams.get("slug");
    const category = url.searchParams.get("category");
    const appType = url.searchParams.get("app_type");
    const surface = url.searchParams.get("surface");
    const featured = url.searchParams.get("featured");
    const search = url.searchParams.get("search");
    const limitParam = parseInt(url.searchParams.get("limit") ?? "200", 10);
    const limit = Math.min(Math.max(limitParam || 200, 1), 500);

    if (op === "detail") {
      if (!appId && !slug) return json({ error: "app_id or slug required" }, 400);
      const q = supabase.from("apps").select("*").eq("enabled", true).limit(1);
      const { data, error } = appId
        ? await q.eq("app_id", appId).maybeSingle()
        : await q.eq("slug", slug!).maybeSingle();
      if (error) return json({ error: error.message }, 500);
      if (!data) return json({ error: "not_found" }, 404);

      const [{ data: versions }, { data: sources }] = await Promise.all([
        supabase
          .from("app_versions")
          .select("version,release_notes,published_at,is_latest")
          .eq("app_id", data.app_id)
          .order("published_at", { ascending: false })
          .limit(20),
        supabase.from("app_sources").select("*").eq("app_id", data.app_id),
      ]);

      return json({ app: data, versions: versions ?? [], sources: sources ?? [] });
    }

    if (op === "featured") {
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .eq("enabled", true)
        .eq("featured", true)
        .order("sort_order", { ascending: true })
        .limit(limit);
      if (error) return json({ error: error.message }, 500);
      return json({ apps: data ?? [] });
    }

    // op === "list" with optional filters/search
    let q = supabase.from("apps").select("*").eq("enabled", true);
    if (category) q = q.eq("category", category);
    if (appType) q = q.eq("app_type", appType);
    if (surface) q = q.contains("supported_surfaces", [surface]);
    if (featured === "true") q = q.eq("featured", true);
    if (search) {
      const s = search.replace(/[%_]/g, "\\$&");
      q = q.or(
        `name.ilike.%${s}%,publisher.ilike.%${s}%,description.ilike.%${s}%,short_name.ilike.%${s}%`,
      );
    }
    const { data, error } = await q.order("sort_order", { ascending: true }).limit(limit);
    if (error) return json({ error: error.message }, 500);
    return json({ apps: data ?? [], count: data?.length ?? 0 });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
