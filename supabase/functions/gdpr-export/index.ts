// ═══════════════════════════════════════════════════════════════
// SITA OS — GDPR Data Export Edge Function
// Exports all user data as JSON for GDPR compliance
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { z } from "https://esm.sh/zod@3.23.8";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders }

  // Rate limiting
  const clientId = req.headers.get("authorization")?.slice(-10) || "anon";
  const rl = checkRateLimit(`gdpr-export:${clientId}`, 60, 60000);
  if (!rl.allowed) {
    return rateLimitResponse(rl, corsHeaders);
  }

  // Input validation
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    try {
  const BodySchema = z.object({ user_id: z.string().uuid().optional(), format: z.string().optional() });
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

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const exportData: Record<string, unknown[]> = {};
    const errors: string[] = [];

    for (const table of USER_TABLES) {
      try {
        const { data, error } = await supabase.from(table).select("*").eq("user_id", user.id).limit(10000);
        if (error) { errors.push(`${table}: ${error.message}`); continue; }
        if (data && data.length > 0) exportData[table] = data;
      } catch {
        errors.push(`${table}: query failed`);
      }
    }

    const result = {
      export_type: "gdpr_data_export",
      user_id: user.id,
      email: user.email,
      exported_at: new Date().toISOString(),
      tables_exported: Object.keys(exportData).length,
      total_records: Object.values(exportData).reduce((sum, arr) => sum + arr.length, 0),
      data: exportData,
      ...(errors.length > 0 ? { warnings: errors } : {}),
    };

    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Content-Disposition": "attachment; filename=sita-data-export.json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
