// ═══════════════════════════════════════════════════════════════
// SITA OS — GDPR Data Export Edge Function
// Exports all user data as JSON for GDPR compliance
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { requireAuth } from "../_shared/auth.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const logger = new EdgeLogger("gdpr-export");

const USER_TABLES = [
  "profiles", "user_ai_budgets", "user_preferences",
  "advisor_configs", "advisor_feedback", "advisor_knowledge", "advisor_memories",
  "approval_queue", "audit_logs", "notifications_queue",
  "sita_receipts", "sita_proof_records", "sita_memory_entries",
  "os_event_log", "os_memory_scoped", "os_policy_evaluations", "os_action_lineage",
  "personal_operating_graph_nodes", "personal_operating_graph_edges",
  "intent_resolutions", "command_orchestrations", "priority_stacks",
  "trust_weighted_actions", "action_escalations", "operating_modes",
  "relationship_contexts", "human_obligations", "boundary_policies",
  "digest_compilations", "opportunity_signals",
  "ai_cost_ledger", "ai_token_usage", "ai_task_requests",
  "connected_devices", "device_trust_records", "presence_states",
];

const QueryParamsSchema = z.object({
  format: z.enum(["json", "csv"]).optional().default("json"),
});

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  // Rate limiting
  const clientId = req.headers.get("authorization")?.slice(-10) || "anon";
  const rl = checkRateLimit(`gdpr-export:${clientId}`, 10, 60000);
  if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

  // Auth
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  // Validate query params
  const url = new URL(req.url);
  const paramsParsed = QueryParamsSchema.safeParse({ format: url.searchParams.get("format") || "json" });
  if (!paramsParsed.success) {
    return corsError("Invalid query parameters", 400);
  }

  try {
    logger.info("GDPR export initiated", { userId: auth.user.id });

    const exportData: Record<string, unknown[]> = {};
    const errors: string[] = [];

    for (const table of USER_TABLES) {
      try {
        const { data, error } = await auth.supabase.from(table).select("*").eq("user_id", auth.user.id).limit(10000);
        if (error) { errors.push(`${table}: ${error.message}`); continue; }
        if (data && data.length > 0) exportData[table] = data;
      } catch {
        errors.push(`${table}: query failed`);
      }
    }

    const result = {
      export_type: "gdpr_data_export",
      user_id: auth.user.id,
      email: auth.user.email,
      exported_at: new Date().toISOString(),
      tables_exported: Object.keys(exportData).length,
      total_records: Object.values(exportData).reduce((sum, arr) => sum + arr.length, 0),
      data: exportData,
      ...(errors.length > 0 ? { warnings: errors } : {}),
    };

    logger.info("GDPR export completed", { userId: auth.user.id, tables: Object.keys(exportData).length });

    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Content-Disposition": "attachment; filename=sita-data-export.json" },
    });
  } catch (err) {
    logger.error("GDPR export failed", err);
    return corsError(err instanceof Error ? err.message : "Unknown error", 500);
  }
});
