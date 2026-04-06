// ═══════════════════════════════════════════════════════════════
// SITA OS — GDPR Data Deletion Edge Function
// Deletes all user data for GDPR right to erasure
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { requireAuth } from "../_shared/auth.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const logger = new EdgeLogger("gdpr-delete");

const DELETABLE_TABLES = [
  "advisor_feedback", "advisor_knowledge", "advisor_memories", "advisor_performance",
  "advisor_requests", "advisor_responses",
  "agent_action_receipts", "agent_schedules", "agent_signals", "agent_telemetry",
  "ai_cost_ledger", "ai_token_usage", "ai_task_requests", "ai_inference_receipts",
  "notifications_queue", "approval_queue",
  "sita_receipts", "sita_proof_records", "sita_memory_entries", "sita_memory_forget_log",
  "os_event_log", "os_memory_scoped", "os_policy_evaluations", "os_action_lineage",
  "personal_operating_graph_edges", "personal_operating_graph_nodes",
  "intent_resolutions", "command_orchestrations", "priority_stacks",
  "attention_decisions", "trust_weighted_actions", "action_escalations",
  "cai_continuity_sessions", "handoff_contexts",
  "assistant_role_states", "coordinated_assistant_sessions",
  "timing_intelligence_decisions", "relationship_contexts", "human_obligations",
  "digest_compilations", "operating_modes", "opportunity_signals",
  "memory_governance_records", "memory_corrections",
  "boundary_policies", "experience_signature_rules",
  "connected_devices", "device_trust_records", "presence_states",
  "audit_logs",
  "profiles",
];

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  // Rate limiting
  const clientId = req.headers.get("authorization")?.slice(-10) || "anon";
  const rl = checkRateLimit(`gdpr-delete:${clientId}`, 5, 60000);
  if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

  if (req.method !== "POST") {
    return corsError("Method not allowed", 405);
  }

  // Auth
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  // Zod validation
  const BodySchema = z.object({ confirm: z.literal("DELETE_ALL_MY_DATA") });
  let body: any;
  try {
    body = await req.json();
  } catch {
    return corsError("Invalid JSON body", 400);
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return corsResponse({
      error: "Confirmation required",
      message: 'Send { "confirm": "DELETE_ALL_MY_DATA" } to proceed',
    }, 400);
  }

  try {
    logger.info("GDPR delete initiated", { userId: auth.user.id });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    const results: Record<string, string> = {};
    for (const table of DELETABLE_TABLES) {
      try {
        const { error } = await adminClient.from(table).delete().eq("user_id", auth.user.id);
        results[table] = error ? `error: ${error.message}` : "deleted";
      } catch {
        results[table] = "error: query failed";
      }
    }

    // Delete storage files
    try {
      const { data: files } = await adminClient.storage.from("documents").list(auth.user.id);
      if (files && files.length > 0) {
        await adminClient.storage.from("documents").remove(files.map(f => `${auth.user.id}/${f.name}`));
        results["storage:documents"] = "deleted";
      }
    } catch {
      results["storage:documents"] = "error";
    }

    logger.info("GDPR delete completed", { userId: auth.user.id });

    return corsResponse({
      status: "completed",
      user_id: auth.user.id,
      deleted_at: new Date().toISOString(),
      results,
    });
  } catch (err) {
    logger.error("GDPR delete failed", err);
    return corsError(err instanceof Error ? err.message : "Unknown error", 500);
  }
});
