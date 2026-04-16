/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// CI Gate — Table Membership Completeness (Phase 10)
// Reads the canonical table list from generated/db-schema-snapshot.json
// (or a fallback baked-in snapshot) and fails if any public-schema
// table is not claimed by exactly one bounded context.
// ═══════════════════════════════════════════════════════════════

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { BOUNDED_CONTEXT_REGISTRY } from "../../../src/lib/architecture/bounded-context-registry";

const SNAPSHOT_PATH = "generated/db-schema-snapshot.json";
const REPORT_PATH = "generated/table-membership-report.json";

// Fallback snapshot (captured 2026-04-16) used when live snapshot is missing.
const FALLBACK_TABLES: readonly string[] = [
  "action_safety_classifications","admin_action_audit","admin_action_confirmations",
  "admin_role_permissions","admin_safety_actions","admin_sessions",
  "advisor_action_queue","advisor_agents","advisor_autonomy_policies",
  "advisor_board_actions","advisor_board_memory","advisor_board_recommendations",
  "advisor_board_reflections","advisor_board_tool_executions","advisor_feedback",
  "advisor_knowledge","advisor_memories","advisor_profiles",
  "ai_inference_receipts","ai_workforce_approval_queue","ai_workforce_budget_classes",
  "ai_workforce_cached_outputs","ai_workforce_invocations","ai_workforce_launch_honesty",
  "ai_workforce_outputs","ai_workforce_recommendation_scores","ai_workforce_recommendations",
  "ai_workforce_role_health","ai_workforce_role_task_permissions","ai_workforce_roles",
  "ai_workforce_task_types","api_gateway_routes","appointments","approval_decisions",
  "biometric_credentials","boardroom_decision_receipts","boardroom_evidence",
  "boardroom_items","boardroom_recommendations","boardroom_sessions",
  "business_health_scores","business_onboarding","calendar_events",
  "client_capability_matrix","cloud_abuse_events","cloud_account_closure_requests",
  "cloud_activity_journal","cloud_admin_role_assignments","cloud_admin_roles",
  "cloud_archive_jobs","cloud_audit_events","cloud_backup_snapshots","cloud_blobs",
  "cloud_bootstrap_markers","cloud_compliance_hooks","cloud_conflicts",
  "cloud_device_sessions","cloud_devices","cloud_feature_flags","cloud_file_versions",
  "cloud_files","cloud_folders","cloud_import_export_jobs","cloud_lifecycle_rules",
  "cloud_maintenance_modes","cloud_metrics_snapshots","cloud_namespace_registry",
  "cloud_plans","cloud_policies","cloud_preview_jobs","cloud_reconciliation_runs",
  "cloud_search_index","cloud_shared_workspaces","cloud_shares","cloud_storage_providers",
  "cloud_storage_tiers","cloud_storage_usage","cloud_support_sessions","cloud_sync_changes",
  "cloud_sync_checkpoints","cloud_sync_jobs","cloud_sync_objects","cloud_tenant_memberships",
  "cloud_tenant_plans","cloud_tenant_policies","cloud_tenant_quotas","cloud_tenants",
  "cloud_trash","cloud_user_plans","cloud_worker_jobs","command_memory",
  "command_routing_decisions","command_steps","communication_metrics",
  "concierge_automations","concierge_documents","concierge_errands",
  "concierge_recurring_obligations","config_change_history","connector_oauth_flows",
  "connector_sync_runs","connector_tokens","context_graph_snapshots","crm_automations",
  "crm_communications","crm_companies","crm_contact_company","crm_contacts",
  "crm_import_jobs","crm_merge_log","crm_notes","crm_opportunities","crm_pipeline_stages",
  "crm_segments","crm_tags","crm_tasks","device_attestations","device_mesh_peers",
  "device_ownership","domain_ownership_registry","dual_authority_challenges",
  "ecosystem_commands","ecosystem_contracts","ecosystem_events","environment_configs",
  "flagship_loops","founder_directives","gift_tracker","graph_edges","grocery_items",
  "grocery_lists","health_validation_results","incidents","layer_health_snapshots",
  "lead_inbox_items","leads","license_activations","license_audit_log","licenses",
  "managed_apps","notification_delivery_receipts","notification_preferences",
  "notifications","onboarding_choices","onboarding_completion_markers",
  "onboarding_hardware_detection","onboarding_restore_sources","onboarding_sessions",
  "onboarding_steps","org_members","organizations","os_audit_events","os_auth_methods",
  "os_capabilities","os_command_events","os_commands","os_elevation_tokens",
  "os_keyrings","os_policies","os_role_capabilities","os_secrets_metadata",
  "os_service_identities","os_sessions","os_user_accounts","outcome_verifications",
  "plane_service_assignments","platform_notifications","platform_planes",
  "platform_runbooks","profiles","profit_signals","read_model_snapshots",
  "recommendation_execution_bindings","recommendation_execution_events",
  "recommendation_learning_signals","recommendation_outcome_verifications",
  "release_compatibility_matrix","remediation_programs","remediation_tasks",
  "rollback_events","runtime_agents","school_activities","service_identity_registry",
  "service_providers_list","simulations","support_access_grants","support_case_events",
  "support_cases","system_guarantees","system_slots","timeline_events","token_classes",
  "travel_plans","update_boot_attempts","update_catalog","update_channels",
  "update_history","update_preflight_results","update_staging","user_roles","vapid_keys",
];

function loadTables(): readonly string[] {
  if (existsSync(SNAPSHOT_PATH)) {
    try {
      const parsed = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8")) as { tables?: { tablename: string }[] };
      if (parsed.tables) return parsed.tables.map((t) => t.tablename).sort();
    } catch (e) {
      console.warn(`[warn] could not parse ${SNAPSHOT_PATH}, using fallback`);
    }
  }
  return [...FALLBACK_TABLES].sort();
}

const tables = loadTables();
const claimed = new Map<string, string[]>();
for (const ctx of BOUNDED_CONTEXT_REGISTRY) {
  for (const t of ctx.tables) {
    if (!claimed.has(t)) claimed.set(t, []);
    claimed.get(t)!.push(ctx.contextId);
  }
}

const orphans = tables.filter((t) => !claimed.has(t));
const ghosts = [...claimed.keys()].filter((t) => !tables.includes(t));
const duplicates = [...claimed.entries()]
  .filter(([, ctxs]) => ctxs.length > 1)
  .map(([t, ctxs]) => ({ table: t, ctxs }));

const report = {
  generatedAt: new Date().toISOString(),
  totalOnDb: tables.length,
  totalClaimed: claimed.size,
  orphans,
  ghosts,
  duplicates,
  ok: orphans.length === 0 && ghosts.length === 0 && duplicates.length === 0,
};

mkdirSync("generated", { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

console.log(`Tables in DB: ${tables.length}, claimed: ${claimed.size}`);
if (orphans.length > 0) {
  console.error(`❌ ${orphans.length} unclaimed tables:`);
  for (const o of orphans) console.error(`   - ${o}`);
}
if (ghosts.length > 0) {
  console.error(`❌ ${ghosts.length} ghost table claims:`);
  for (const g of ghosts) console.error(`   - ${g}`);
}
if (duplicates.length > 0) {
  console.error(`❌ ${duplicates.length} duplicate table claims:`);
  for (const d of duplicates) console.error(`   - ${d.table} → ${d.ctxs.join(", ")}`);
}

if (!report.ok) process.exit(1);
console.log("✅ Pass");
