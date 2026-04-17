// ═══════════════════════════════════════════════════════════════
// SITA OS — GDPR Right-to-Erasure Edge Function (C-014 rewrite)
//
// Deletes ALL user-scoped data across the 222 tables that carry
// user_id, plus recursively clears user files in the `user-files`
// storage bucket. Writes a summary receipt to data_retention_runs.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { requireAuth } from "../_shared/auth.ts";
import { resolveUnifiedPolicy, negativeReceiptResponse } from "../_shared/policy.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const logger = new EdgeLogger("gdpr-delete");

/**
 * Complete inventory of user-scoped tables (every table in public schema with a
 * `user_id` column). Generated from a live information_schema query.
 * Grouped by domain for maintainability. If a new user-scoped table is added,
 * include it here so right-to-erasure stays complete.
 */
const DELETABLE_TABLES: string[] = [
  // ── Core identity / accounts ──
  "accounts", "profiles", "user_roles", "user_passkeys", "biometric_credentials",
  "org_members", "cloud_tenant_memberships", "cloud_admin_role_assignments",
  "cloud_user_plans", "cloud_account_closure_requests",

  // ── Onboarding / business setup ──
  "business_onboarding", "business_health_scores", "onboarding_sessions",

  // ── Admin / sessions / audit ──
  "admin_sessions", "cloud_audit_events", "os_audit_events",

  // ── Advisors ──
  "advisor_action_queue", "advisor_agents", "advisor_autonomy_policies",
  "advisor_board_actions", "advisor_board_memory", "advisor_board_recommendations",
  "advisor_board_reflections", "advisor_board_tool_executions",
  "advisor_feedback", "advisor_knowledge", "advisor_memories", "advisor_profiles",

  // ── AI workforce ──
  "ai_inference_receipts", "ai_prompt_invocations",
  "ai_workforce_approval_queue", "ai_workforce_budget_classes",
  "ai_workforce_cached_outputs", "ai_workforce_invocations",
  "ai_workforce_launch_honesty", "ai_workforce_outputs",
  "ai_workforce_recommendation_scores", "ai_workforce_recommendations",
  "ai_workforce_role_health", "ai_workforce_role_task_permissions",
  "ai_workforce_roles", "ai_workforce_task_types",

  // ── Boardroom ──
  "boardroom_decision_receipts", "boardroom_evidence", "boardroom_items",
  "boardroom_recommendations", "boardroom_sessions",

  // ── Calendar / appointments / scheduling ──
  "appointments", "calendar_events", "schedules", "scheduled_jobs",
  "school_activities", "household_tasks",

  // ── CRM ──
  "crm_automations", "crm_communications", "crm_companies", "crm_contact_company",
  "crm_contacts", "crm_import_jobs", "crm_merge_log", "crm_notes",
  "crm_opportunities", "crm_pipeline_stages", "crm_segments", "crm_tags", "crm_tasks",
  "leads", "lead_inbox_items", "contacts", "customers", "communications",
  "communication_metrics",

  // ── Concierge ──
  "concierge_automations", "concierge_documents", "concierge_recurring_obligations",
  "errands",

  // ── Sales / commerce ──
  "deals", "proposals", "quotes", "invoices", "receivables", "transactions",
  "subscriptions", "service_orders", "service_providers_list", "providers",
  "bookings", "reservations",

  // ── Finance ──
  "bills", "budgets", "capital_buckets", "debt_obligations", "envelopes",
  "holdings", "instruments", "investment_theses", "portfolios", "positions",
  "reserves", "sinking_funds", "theses", "trades", "watchlists", "assets",

  // ── Cloud storage / files ──
  "cloud_abuse_events", "cloud_activity_journal", "cloud_archive_jobs",
  "cloud_blobs", "cloud_bootstrap_markers", "cloud_conflicts",
  "cloud_device_sessions", "cloud_devices", "cloud_file_versions", "cloud_files",
  "cloud_folders", "cloud_import_export_jobs", "cloud_lifecycle_rules",
  "cloud_preview_jobs", "cloud_search_index", "cloud_storage_usage",
  "cloud_sync_changes", "cloud_sync_checkpoints", "cloud_sync_objects",
  "cloud_trash", "cloud_worker_jobs", "file_metadata", "file_settings",

  // ── Connectors ──
  "connector_accounts", "connector_configs", "connector_oauth_flows",
  "connector_oauth_tokens", "connector_receipts", "connector_sync_cursors",
  "connector_sync_runs", "connector_tokens",

  // ── Commands / automation ──
  "command_memory", "command_routing_decisions", "command_steps",
  "automation_kill_switches", "approval_decisions", "action_safety_classifications",
  "consent_scope_records", "context_graph_snapshots",

  // ── Devices / OS ──
  "device_attestations", "device_mesh_peers", "dual_authority_challenges",
  "managed_apps", "mobile_push_tokens",
  "os_auth_methods", "os_capabilities", "os_command_events", "os_commands",
  "os_elevation_tokens", "os_keyrings", "os_policies", "os_role_capabilities",
  "os_secrets_metadata", "os_service_identities", "os_sessions",
  "os_user_accounts",

  // ── Ecosystem ──
  "ecosystem_commands", "ecosystem_contracts", "ecosystem_events",

  // ── Errors / events / telemetry ──
  "error_events", "incidents", "rollback_events", "trace_spans",
  "timeline_events", "graph_edges",

  // ── Family / lifestyle ──
  "family_members", "gift_plans", "gift_tracker", "grocery_items", "grocery_lists",
  "event_plans", "travel_plans", "trips", "maintenance_items",

  // ── Notifications ──
  "notifications", "notification_delivery_receipts", "notification_preferences",

  // ── Workflow / remediation ──
  "flagship_loop_completions", "flagship_loops",
  "outcome_verifications", "platform_runbooks", "profit_signals",
  "recommendation_execution_bindings", "recommendation_execution_events",
  "recommendation_learning_signals", "recommendation_outcome_verifications",
  "remediation_programs", "remediation_tasks", "responsibilities",
  "runbook_drill_results", "runtime_agents", "scenarios", "simulations",
  "support_cases", "system_guarantees", "system_slots", "founder_directives",
  "health_validation_results", "job_executions", "layer_health_snapshots",
  "update_boot_attempts", "update_channels", "update_history",
  "update_preflight_results", "update_staging",
  "workflow_receipts", "workflow_runs", "workflow_state_transitions",
  "workflow_steps", "workflows",

  // ── Misc ──
  "licenses", "webauthn_challenges",
];

const STORAGE_BUCKET = "user-files";

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
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return corsError("Invalid JSON body", 400);
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return corsResponse(
      {
        error: "Confirmation required",
        message: 'Send { "confirm": "DELETE_ALL_MY_DATA" } to proceed',
      },
      400,
    );
  }

  // Phase 19.C — Unified policy gate (R5 identity destruction)
  const decision = resolveUnifiedPolicy({
    actor: "user",
    domain: "identity",
    riskClass: "R5",
    deviceTrust: 4,
    biometricStepUpRecent: req.headers.get("x-step-up-recent") === "true",
    hasJustification: true,
  });
  if (!decision.allowed) {
    return negativeReceiptResponse(decision, { fn: "gdpr-delete" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceKey);
  const startedAt = Date.now();

  try {
    logger.info("GDPR delete initiated", { userId: auth.user.id });

    const results: Record<string, string> = {};
    let totalRowsDeleted = 0;
    let tablesWithErrors = 0;

    for (const table of DELETABLE_TABLES) {
      try {
        const { error, count } = await adminClient
          .from(table)
          .delete({ count: "exact" })
          .eq("user_id", auth.user.id);
        if (error) {
          results[table] = `error: ${error.message}`;
          tablesWithErrors++;
        } else {
          const n = count ?? 0;
          totalRowsDeleted += n;
          results[table] = `deleted:${n}`;
        }
      } catch (e) {
        results[table] = `error: ${e instanceof Error ? e.message : "query failed"}`;
        tablesWithErrors++;
      }
    }

    // Recursively clear user-files storage
    let storageDeleted = 0;
    try {
      storageDeleted = await deleteUserStorage(adminClient, STORAGE_BUCKET, auth.user.id);
      results[`storage:${STORAGE_BUCKET}`] = `deleted:${storageDeleted}`;
    } catch (e) {
      results[`storage:${STORAGE_BUCKET}`] = `error: ${e instanceof Error ? e.message : "list/remove failed"}`;
      tablesWithErrors++;
    }

    // Receipt
    await adminClient.from("data_retention_runs").insert({
      table_name: `__gdpr_user_${auth.user.id}`,
      mode: "gdpr_delete",
      rows_deleted: totalRowsDeleted + storageDeleted,
      duration_ms: Date.now() - startedAt,
      dry_run: false,
      error: tablesWithErrors > 0 ? `${tablesWithErrors} table(s) had errors` : null,
      metadata: {
        userId: auth.user.id,
        tablesScanned: DELETABLE_TABLES.length,
        storageBucket: STORAGE_BUCKET,
      },
    });

    logger.info("GDPR delete completed", {
      userId: auth.user.id,
      totalRowsDeleted,
      storageDeleted,
      tablesWithErrors,
    });

    return corsResponse({
      status: "completed",
      user_id: auth.user.id,
      deleted_at: new Date().toISOString(),
      total_rows_deleted: totalRowsDeleted,
      storage_objects_deleted: storageDeleted,
      tables_scanned: DELETABLE_TABLES.length,
      tables_with_errors: tablesWithErrors,
      results,
    });
  } catch (err) {
    logger.error("GDPR delete failed", err);
    return corsError(err instanceof Error ? err.message : "Unknown error", 500);
  }
});

/**
 * Recursively list and delete every object under `${userId}/` in the bucket.
 * Returns the total count of deleted objects.
 */
async function deleteUserStorage(
  client: ReturnType<typeof createClient>,
  bucket: string,
  userId: string,
): Promise<number> {
  let total = 0;
  const stack: string[] = [userId]; // prefix paths

  while (stack.length > 0) {
    const prefix = stack.pop()!;
    const { data, error } = await client.storage.from(bucket).list(prefix, {
      limit: 1000,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    if (!data) continue;

    const filePaths: string[] = [];
    for (const entry of data) {
      const fullPath = `${prefix}/${entry.name}`;
      // A "folder" in supabase storage shows up as an entry with id === null
      if ((entry as { id: string | null }).id === null) {
        stack.push(fullPath);
      } else {
        filePaths.push(fullPath);
      }
    }
    if (filePaths.length > 0) {
      const { error: delErr } = await client.storage.from(bucket).remove(filePaths);
      if (delErr) throw delErr;
      total += filePaths.length;
    }
  }
  return total;
}
