// ═══════════════════════════════════════════════════════════════
// SITA OS — App Store API
// Catalog listing, install tracking, ratings & reviews
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, corsResponse, corsError } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const cors = handleCors(req);
  if (cors) return cors;

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const body = req.method === "GET" ? { action: "list-catalog" } : await req.json();
    const { action, ...params } = body;

    switch (action) {
      case "list-catalog": {
        const { data, error } = await auth.supabase
          .from("app_catalog")
          .select("*")
          .eq("status", "published")
          .order("install_count", { ascending: false })
          .limit(params.limit || 50);
        if (error) return corsError(error.message, 400);
        return corsResponse({ apps: data });
      }

      case "get-app": {
        const { data, error } = await auth.supabase
          .from("app_catalog")
          .select("*, app_reviews(*)")
          .eq("id", params.app_id)
          .single();
        if (error) return corsError(error.message, 404);
        return corsResponse({ app: data });
      }

      case "install": {
        const { data, error } = await auth.supabase
          .from("app_installations")
          .upsert({
            user_id: auth.user.id,
            app_id: params.app_id,
            installed_at: new Date().toISOString(),
            status: "active",
          })
          .select()
          .single();
        if (error) return corsError(error.message, 400);
        return corsResponse({ installation: data }, 201);
      }

      case "uninstall": {
        const { error } = await auth.supabase
          .from("app_installations")
          .update({ status: "uninstalled" })
          .eq("user_id", auth.user.id)
          .eq("app_id", params.app_id);
        if (error) return corsError(error.message, 400);
        return corsResponse({ success: true });
      }

      case "rate": {
        if (!params.rating || params.rating < 1 || params.rating > 5) {
          return corsError("Rating must be between 1 and 5", 400);
        }
        const { data, error } = await auth.supabase
          .from("app_reviews")
          .upsert({
            user_id: auth.user.id,
            app_id: params.app_id,
            rating: params.rating,
            review_text: params.review_text,
          })
          .select()
          .single();
        if (error) return corsError(error.message, 400);
        return corsResponse({ review: data }, 201);
      }

      case "my-apps": {
        const { data, error } = await auth.supabase
          .from("app_installations")
          .select("*, app_catalog(*)")
          .eq("user_id", auth.user.id)
          .eq("status", "active");
        if (error) return corsError(error.message, 400);
        return corsResponse({ installations: data });
      }

      default:
        return corsError("Unknown action", 400);
    }
  } catch (err) {
    console.error("[AppStoreAPI]", err);
    return corsError("Internal server error", 500);
  }
});
