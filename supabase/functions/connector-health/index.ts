// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Health Check Edge Function
// Pings configured connector endpoints and returns status
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { requireAuth } from "../_shared/auth.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const logger = new EdgeLogger("connector-health");

const QuerySchema = z.object({
  connector_id: z.string().uuid().optional(),
});

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const clientId = req.headers.get("authorization")?.slice(-10) || "anon";
  const rl = checkRateLimit(`connector-health:${clientId}`, 30, 60000);
  if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

  // Auth
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  // Validate query params
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({ connector_id: url.searchParams.get("connector_id") || undefined });
  if (!parsed.success) {
    return corsError("Invalid connector_id parameter", 400);
  }

  try {
    logger.info("Connector health check", { userId: auth.user.id });

    let query = auth.supabase
      .from("connector_configs")
      .select("*")
      .eq("user_id", auth.user.id);

    if (parsed.data.connector_id) {
      query = query.eq("id", parsed.data.connector_id);
    }

    const { data: connectors, error } = await query;
    if (error) throw error;

    const results = (connectors || []).map((c: any) => {
      const lastSync = c.last_sync_at ? new Date(c.last_sync_at) : null;
      const staleMs = lastSync ? Date.now() - lastSync.getTime() : Infinity;
      const isStale = staleMs > 6 * 3600000; // 6 hours

      return {
        id: c.id,
        service: c.service,
        status: c.status === "active" ? (isStale ? "degraded" : "up") : "down",
        last_sync: c.last_sync_at,
        stale: isStale,
        stale_hours: Math.round(staleMs / 3600000),
        config_updated: c.updated_at,
      };
    });

    const up = results.filter((r: any) => r.status === "up").length;
    const degraded = results.filter((r: any) => r.status === "degraded").length;
    const down = results.filter((r: any) => r.status === "down").length;

    logger.info("Connector health results", { up, degraded, down });

    return corsResponse({
      timestamp: new Date().toISOString(),
      total: results.length,
      summary: { up, degraded, down },
      overall: down > 0 ? "unhealthy" : degraded > 0 ? "degraded" : "healthy",
      connectors: results,
    });
  } catch (err) {
    logger.error("Connector health error", err);
    return corsError(err instanceof Error ? err.message : "Unknown error", 500);
  }
});
