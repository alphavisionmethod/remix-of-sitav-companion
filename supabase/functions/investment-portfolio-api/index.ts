// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment Portfolio API
// Portfolio CRUD, holdings management, performance tracking
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
    const body = req.method === "GET" ? { action: "list" } : await req.json();
    const { action, ...params } = body;

    switch (action) {
      case "list": {
        const { data, error } = await auth.supabase
          .from("investment_portfolios")
          .select("*")
          .eq("user_id", auth.user.id)
          .order("created_at", { ascending: false });
        if (error) return corsError(error.message, 400);
        return corsResponse({ portfolios: data });
      }

      case "get": {
        const { data, error } = await auth.supabase
          .from("investment_portfolios")
          .select("*, investment_holdings(*)")
          .eq("id", params.portfolio_id)
          .eq("user_id", auth.user.id)
          .single();
        if (error) return corsError(error.message, 404);
        return corsResponse({ portfolio: data });
      }

      case "create": {
        const { data, error } = await auth.supabase
          .from("investment_portfolios")
          .insert({ ...params, user_id: auth.user.id })
          .select()
          .single();
        if (error) return corsError(error.message, 400);
        return corsResponse({ portfolio: data }, 201);
      }

      case "performance": {
        const { data, error } = await auth.supabase
          .from("investment_performance_snapshots")
          .select("*")
          .eq("portfolio_id", params.portfolio_id)
          .order("snapshot_date", { ascending: false })
          .limit(params.limit || 30);
        if (error) return corsError(error.message, 400);
        return corsResponse({ snapshots: data });
      }

      default:
        return corsError("Unknown action", 400);
    }
  } catch (err) {
    console.error("[InvestmentPortfolioAPI]", err);
    return corsError("Internal server error", 500);
  }
});
