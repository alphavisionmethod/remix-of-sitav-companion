// ═══════════════════════════════════════════════════════════════
// SITA OS — Cost Alert Edge Function
// Checks AI budgets and returns users near spending limits
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const logger = new EdgeLogger("cost-alert");

const QuerySchema = z.object({
  threshold_pct: z.coerce.number().min(0).max(100).optional().default(80),
});

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const clientId = req.headers.get("authorization")?.slice(-10) || "anon";
  const rl = checkRateLimit(`cost-alert:${clientId}`, 30, 60000);
  if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

  // Admin only
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  // Validate query params
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({ threshold_pct: url.searchParams.get("threshold_pct") });
  if (!parsed.success) {
    return corsError("Invalid threshold_pct parameter", 400);
  }

  const threshold = parsed.data.threshold_pct / 100;

  try {
    logger.info("Cost alert check", { threshold: parsed.data.threshold_pct });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: budgets, error } = await admin
      .from("user_ai_budgets")
      .select("*")
      .eq("period", "monthly");

    if (error) throw error;

    const alerts = (budgets || [])
      .filter((b: any) => b.limit_cost_cents > 0 && (b.used_cost_cents / b.limit_cost_cents) >= threshold)
      .map((b: any) => ({
        user_id: b.user_id,
        used_cents: b.used_cost_cents,
        limit_cents: b.limit_cost_cents,
        usage_pct: Math.round((b.used_cost_cents / b.limit_cost_cents) * 100),
        over_budget: b.used_cost_cents >= b.limit_cost_cents,
        hard_limit: b.hard_limit,
        auto_downgrade: b.auto_downgrade_model,
      }));

    logger.info("Cost alert results", { total: budgets?.length, alerts: alerts.length });

    return corsResponse({
      timestamp: new Date().toISOString(),
      threshold_pct: parsed.data.threshold_pct,
      total_budgets: budgets?.length || 0,
      alerts_count: alerts.length,
      alerts,
    });
  } catch (err) {
    logger.error("Cost alert error", err);
    return corsError(err instanceof Error ? err.message : "Unknown error", 500);
  }
});
