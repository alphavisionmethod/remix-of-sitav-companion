// ═══════════════════════════════════════════════════════════════
// SITA OS — GDPR Data Deletion Edge Function
// Deletes all user data for GDPR right to erasure
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    return new Response(null, { headers: corsHeaders });
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
