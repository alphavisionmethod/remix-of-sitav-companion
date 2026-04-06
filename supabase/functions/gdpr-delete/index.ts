// ═══════════════════════════════════════════════════════════════
// SITA OS — GDPR Data Deletion Edge Function
// Deletes all user data for GDPR right to erasure
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { z } from "https://esm.sh/zod@3.23.8";

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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders }

  // Rate limiting
  const clientId = req.headers.get("authorization")?.slice(-10) || "anon";
  const rl = checkRateLimit(`gdpr-delete:${clientId}`, 60, 60000);
  if (!rl.allowed) {
    return rateLimitResponse(rl, corsHeaders);
  }

  // Input validation
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    try {
  const BodySchema = z.object({ user_id: z.string().uuid().optional(), confirm: z.boolean().optional() });
      const body = await req.json();
      const parsed = BodySchema.safeParse(body);
      if (!parsed.success) {
        return new Response(JSON.stringify({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    } catch (_) {
      // Non-JSON body or GET request - continue
    }
  });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Parse body for confirmation
    const body = await req.json().catch(() => ({}));
    if (body.confirm !== "DELETE_ALL_MY_DATA") {
      return new Response(JSON.stringify({
        error: "Confirmation required",
        message: "Send { \"confirm\": \"DELETE_ALL_MY_DATA\" } to proceed",
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user identity with anon key
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Use service role for deletion
    const adminClient = createClient(supabaseUrl, serviceKey);

    const results: Record<string, string> = {};
    for (const table of DELETABLE_TABLES) {
      try {
        const { error } = await adminClient.from(table).delete().eq("user_id", user.id);
        results[table] = error ? `error: ${error.message}` : "deleted";
      } catch {
        results[table] = "error: query failed";
      }
    }

    // Delete storage files
    try {
      const { data: files } = await adminClient.storage.from("documents").list(user.id);
      if (files && files.length > 0) {
        await adminClient.storage.from("documents").remove(files.map(f => `${user.id}/${f.name}`));
        results["storage:documents"] = "deleted";
      }
    } catch {
      results["storage:documents"] = "error";
    }

    return new Response(JSON.stringify({
      status: "completed",
      user_id: user.id,
      deleted_at: new Date().toISOString(),
      results,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
