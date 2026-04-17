// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function ↔ Table I/O Map (Phase 18.1)
//
// Authoritative declaration of which DB tables every edge function
// READS from and WRITES to. Source: static scan of
// `supabase/functions/*/index.ts` for `.from("table").<verb>` patterns,
// then hand-curated to include orchestration helpers and dynamic ops.
//
// HARD RULE: every active edge function MUST appear here. Wrappers
// (admin-api, admin-gateway, api-gateway, main) and stubs are exempt.
//
// Used by:
//   - src/lib/db/table-writer-reader-map.ts (inverse map per table)
//   - scripts/architecture/checks/check-db-reality.ts (CI Gate 29)
//   - admin DbTruthExplorer "Writers & Readers" tab
// ═══════════════════════════════════════════════════════════════

export interface EdgeFunctionTableIO {
  /** Tables this function may INSERT/UPDATE/DELETE/UPSERT into. */
  readonly writes: readonly string[];
  /** Tables this function SELECTs from. */
  readonly reads: readonly string[];
  /** True for legacy wrappers/stubs that proxy to other functions; exempt from boundary checks. */
  readonly wrapper?: boolean;
}

export const EDGE_FUNCTION_TABLE_IO: Record<string, EdgeFunctionTableIO> = {
  // ── ADMIN BFF ────────────────────────────────────────────────
  "admin-bff-gateway": {
    writes: ["cloud_audit_events"],
    reads: ["admin_safety_actions", "cloud_audit_events", "cloud_blobs", "cloud_conflicts", "cloud_devices", "cloud_sync_jobs", "cloud_worker_jobs", "platform_notifications", "profiles", "support_cases"],
  },

  // ── PUBLIC BFFs ──────────────────────────────────────────────
  "user-bff-gateway": {
    writes: ["support_case_events"],
    reads: ["cloud_devices", "platform_notifications", "profiles", "support_cases"],
  },
  "intelligence-api": {
    writes: ["ai_learning_patterns", "ai_prompt_families", "engine_events"],
    reads: ["ai_efficiency_scores", "engine_events", "intelligence_assets_library"],
  },
  "support-gateway": {
    writes: ["admin_action_audit", "support_case_events", "support_cases"],
    reads: ["support_cases"],
  },
  "license-gateway": {
    writes: ["license_activations", "license_audit_log"],
    reads: ["license_activations"],
  },

  // ── Legacy wrappers (exempt from boundary checks) ────────────
  "main": { writes: [], reads: [], wrapper: true },
  "api-gateway": {
    writes: ["admin_action_confirmations", "cloud_devices", "managed_apps", "notification_preferences", "os_command_events", "os_commands", "os_policies"],
    reads: ["admin_action_audit", "admin_action_confirmations", "ai_inference_receipts", "ai_workforce_invocations", "ai_workforce_recommendations", "client_capability_matrix", "cloud_abuse_events", "cloud_activity_journal", "cloud_audit_events", "cloud_devices", "cloud_sync_conflicts", "cloud_sync_ledger", "managed_apps", "notification_preferences", "os_command_events", "os_commands", "os_policies", "platform_notifications", "profiles", "user_roles"],
    wrapper: true,
  },
  "admin-api": {
    writes: ["admin_action_audit"],
    reads: [],
    wrapper: true,
  },
  "admin-gateway": {
    writes: ["admin_action_audit"],
    reads: [],
    wrapper: true,
  },

  // ── ORCHESTRATION FUNCTIONS ──────────────────────────────────
  "agent-executor": {
    writes: ["agent_action_receipts", "agent_signals", "agent_telemetry", "ai_cost_ledger", "command_steps", "timeline_events"],
    reads: ["agent_action_receipts", "agent_schedules", "agent_signals", "agent_telemetry", "command_steps", "runtime_agents"],
  },
  "brain-core": {
    writes: ["advisor_requests", "advisor_responses", "approval_decisions", "command_memory"],
    reads: ["advisor_requests", "command_memory"],
  },
  "scheduler-dispatch": {
    writes: ["agent_schedules", "command_steps"],
    reads: ["agent_schedules"],
  },
  "advisor-agent-loop": {
    writes: ["advisor_board_actions", "advisor_board_memory", "advisor_memories"],
    reads: ["advisor_agents", "advisor_autonomy_policies", "advisor_board_memory", "advisor_memories"],
  },
  "advisor-deep-intelligence": {
    writes: ["advisor_board_memory", "advisor_board_recommendations"],
    reads: ["advisor_agents", "advisor_board_memory", "advisor_knowledge"],
  },
  "event-processor": {
    writes: ["approval_decisions", "timeline_events", "command_steps"],
    reads: ["timeline_events"],
  },
  "digital-twin-engine": {
    writes: ["timeline_events"],
    reads: ["profiles"],
  },
  "simulation-engine-api": {
    writes: ["timeline_events"],
    reads: [],
  },
  "admin-ai-workforce-run": {
    writes: ["ai_usage_ledger", "ai_workforce_approval_queue", "ai_workforce_invocations", "ai_workforce_outputs", "ai_workforce_role_health"],
    reads: ["ai_workforce_roles", "ai_workforce_task_types"],
  },
  "agent-scheduler": {
    writes: ["agent_schedules"],
    reads: ["agent_schedules"],
  },
  "agent-signal": {
    writes: ["agent_signals"],
    reads: ["agent_signals"],
  },
  "ecosystem-operations": {
    writes: ["ecosystem_devices", "ecosystem_health_consents", "ecosystem_launch_readiness", "ecosystem_push_routes", "ecosystem_trust_records", "ecosystem_wearable_configs"],
    reads: ["ecosystem_devices", "ecosystem_health_consents", "ecosystem_launch_readiness", "ecosystem_push_routes", "ecosystem_trust_records", "ecosystem_wearable_configs"],
  },
  "ambient-os-operations": {
    writes: ["ambient_launch_readiness", "ambient_notification_routes", "assistant_role_presences", "connected_devices", "device_families", "device_trust_records", "handoff_sessions", "presence_states", "readiness_states", "user_device_graph_edges", "wearable_providers"],
    reads: ["connected_devices", "device_families", "device_trust_records", "interruption_policies", "presence_states", "readiness_states", "user_device_graph_edges", "wearable_providers", "wearable_signals"],
  },
  "advisor-weekly-report": {
    writes: ["advisor_board_recommendations"],
    reads: ["advisor_agents", "advisor_memories", "timeline_events"],
  },

  // ── CONNECTOR / WEBHOOK FUNCTIONS ────────────────────────────
  "connector-batch": {
    writes: ["admin_action_audit", "connector_sync_runs"],
    reads: ["connector_tokens"],
  },
  "connector-discover": {
    writes: ["admin_action_audit"],
    reads: ["connector_accounts", "connector_configs", "connector_registry"],
  },
  "connector-health": {
    writes: ["connector_health_records"],
    reads: ["connector_accounts", "connector_tokens"],
  },
  "connector-oauth": {
    writes: ["connector_accounts", "connector_oauth_flows", "connector_oauth_tokens", "connector_receipts", "connector_tokens", "consent_ledger", "consent_scope_records"],
    reads: ["connector_oauth_flows"],
  },
  "connector-operations": {
    writes: ["connector_accounts", "connector_demo_bindings", "connector_health_records", "connector_launch_readiness", "connector_oauth_tokens", "connector_policies", "connector_receipts", "connector_registry", "connector_sync_runs"],
    reads: ["connector_accounts", "connector_oauth_tokens", "connector_registry", "connector_sync_runs"],
  },
  "connector-proxy": {
    writes: ["connector_receipts"],
    reads: ["connector_tokens", "connector_accounts"],
  },
  "connector-sync": {
    writes: ["connector_sync_runs"],
    reads: ["connector_accounts", "connector_tokens"],
  },
  "connector-transform": {
    writes: ["admin_action_audit"],
    reads: [],
  },
  "crm-sync": {
    writes: ["admin_action_audit", "customers", "leads", "opportunities"],
    reads: ["customers", "leads", "opportunities"],
  },
  "provider-family-operations": {
    writes: ["integration_launch_honesty", "oauth_client_registry", "permission_drift_records", "provider_capabilities", "provider_families", "scope_policy_matrix", "scope_recommendations"],
    reads: ["connected_service_links", "identity_provider_links", "provider_capabilities", "provider_families", "scope_policy_matrix", "unified_account_edges", "unified_account_nodes"],
  },
  "agent-heartbeat": {
    writes: ["agent_telemetry"],
    reads: [],
  },

  // ── RUNTIME / SYSTEM FUNCTIONS ───────────────────────────────
  "os-command": {
    writes: ["agent_signals", "admin_action_audit", "os_commands", "os_command_events"],
    reads: ["os_commands"],
  },
  "os-status": {
    writes: ["device_statuses"],
    reads: ["device_statuses"],
  },
  "os-agent-channel": {
    writes: ["cloud_activity_journal", "communication_metrics", "os_command_events"],
    reads: [],
  },
  "runtime-probes": {
    writes: [],
    reads: ["agent_schedules", "profiles"],
  },
  "device-telemetry": {
    writes: ["device_statuses", "system_update_devices"],
    reads: [],
  },
  "system-updates": {
    writes: ["system_update_log"],
    reads: [],
  },
  "self-healing": {
    writes: ["agent_telemetry", "incidents"],
    reads: [],
  },

  // ── DOMAIN FUNCTIONS — finance ───────────────────────────────
  "cashflow-calculate": {
    writes: [],
    reads: ["financial_accounts", "invoices"],
  },
  "cost-alert": {
    writes: ["timeline_events"],
    reads: ["ai_usage_ledger"],
  },
  "invoice-generate": {
    writes: ["admin_action_audit", "communication_log", "invoices", "receipts"],
    reads: ["invoices"],
  },
  "msa-operations": {
    writes: ["architecture_boundary_records", "capability_definitions", "capability_surface_bindings", "experience_grammars", "shell_implementations", "surface_adapters", "surface_readiness_records", "surface_types"],
    reads: ["shell_implementations", "surface_adapters", "surface_readiness_records", "surface_types"],
  },
  "payment-process": {
    writes: ["approval_decisions", "admin_action_audit", "receipts"],
    reads: [],
  },
  "payment-kill-switch": {
    writes: ["admin_action_audit"],
    reads: [],
  },
  "tax-estimate": {
    writes: [],
    reads: ["financial_accounts", "invoices"],
  },
  "revenue-caller": {
    writes: ["communication_log"],
    reads: [],
  },
  "booking-manage": {
    writes: ["admin_action_audit", "appointments", "receipts"],
    reads: ["appointments"],
  },

  // ── DOMAIN FUNCTIONS — advisor / ai ──────────────────────────
  "advisor-avatar-generate": {
    writes: ["advisor_profiles"],
    reads: ["advisor_profiles"],
  },
  "advisor-conversation": {
    writes: ["advisor_memories"],
    reads: ["advisor_agents", "advisor_memories"],
  },
  "advisor-knowledge-manage": {
    writes: ["advisor_knowledge"],
    reads: ["advisor_knowledge"],
  },
  "ai-gateway": {
    writes: ["ai_budget_alerts", "ai_fallback_events", "ai_inference_receipts", "ai_receipt_records", "ai_usage_ledger"],
    reads: [],
  },
  "ai-health": {
    writes: [],
    reads: ["ai_usage_ledger", "ai_inference_receipts"],
  },
  "check-ai-budget": {
    writes: [],
    reads: ["ai_usage_ledger", "ai_workforce_budget_classes"],
  },
  "chat-advisor": {
    writes: ["advisor_responses"],
    reads: ["advisor_agents"],
  },
  "personal-brain": {
    writes: [],
    reads: [],
  },
  "business-advisor-intelligence": {
    writes: ["ai_inference_receipts"],
    reads: [],
  },
  "business-board-api": {
    writes: ["advisor_board_recommendations"],
    reads: ["advisor_autonomy_policies", "advisor_board_actions", "advisor_board_recommendations"],
  },

  // ── DOMAIN FUNCTIONS — admin / agent ─────────────────────────
  "admin-intelligence": {
    writes: [],
    reads: ["admin_action_audit", "advisor_responses"],
  },
  "admin-users": {
    writes: ["admin_action_audit", "user_roles"],
    reads: ["user_roles"],
  },
  "agent-intelligence": {
    writes: [],
    reads: ["advisor_responses", "agent_action_receipts", "agent_signals", "agent_telemetry"],
  },

  // ── DOMAIN FUNCTIONS — cloud ─────────────────────────────────
  "cloud-admin-api": {
    writes: ["cloud_storage_usage", "cloud_sync_jobs", "cloud_user_plans"],
    reads: ["cloud_blobs", "cloud_conflicts", "cloud_devices", "cloud_files", "cloud_storage_usage", "cloud_sync_changes", "cloud_trash"],
  },
  "cloud-device-api": {
    writes: ["cloud_device_sessions", "cloud_devices"],
    reads: ["cloud_devices"],
  },
  "cloud-lifecycle-api": {
    writes: ["cloud_account_closure_requests", "cloud_archive_jobs", "cloud_compliance_hooks", "cloud_import_export_jobs", "cloud_reconciliation_runs"],
    reads: [],
  },
  "cloud-storage-api": {
    writes: ["cloud_blobs", "cloud_file_versions", "cloud_files", "cloud_folders", "cloud_storage_usage", "cloud_trash"],
    reads: ["cloud_files", "cloud_folders"],
  },
  "cloud-sync-api": {
    writes: ["cloud_conflicts", "cloud_sync_changes", "cloud_sync_checkpoints", "cloud_sync_objects"],
    reads: [],
  },
  "cloud-tenant-api": {
    writes: ["cloud_shared_workspaces", "cloud_tenant_memberships", "cloud_tenant_policies", "cloud_tenant_quotas", "cloud_tenants"],
    reads: ["cloud_tenant_memberships"],
  },
  "cloud-worker-api": {
    writes: ["cloud_worker_jobs"],
    reads: ["cloud_worker_jobs"],
  },

  // ── DOMAIN FUNCTIONS — notification / push ───────────────────
  "push-dispatch": {
    writes: ["device_push_tokens", "notification_delivery_receipts"],
    reads: ["device_push_tokens"],
  },
  "push-track": {
    writes: ["notification_delivery_receipts"],
    reads: [],
  },
  "vapid-public-key": {
    writes: [],
    reads: [],
  },
  "communications-api": {
    writes: ["communication_log"],
    reads: ["communication_log"],
  },
  "file-ingestion": {
    writes: ["file_metadata", "platform_notifications"],
    reads: [],
  },

  // ── DOMAIN FUNCTIONS — apps / tasks / misc ───────────────────
  "app-store-api": { writes: [], reads: [] },
  "tasks-workflow-api": { writes: [], reads: [] },
  "investment-portfolio-api": { writes: [], reads: [] },
  "get-weather": { writes: [], reads: [] },
  "health-check": { writes: [], reads: [] },
  "advisor-agent-loop-orchestrator": { writes: [], reads: [], wrapper: true },

  // ── COMPLIANCE / SECURITY DOMAIN ─────────────────────────────
  "gdpr-delete": {
    writes: ["admin_action_audit"],
    reads: ["profiles"],
  },
  "gdpr-export": {
    writes: ["admin_action_audit"],
    reads: ["profiles"],
  },
  "verification-recorder": {
    writes: ["verification_blockers", "verification_evidence", "verification_runs"],
    reads: [],
  },

  // ── INTROSPECTION / SEED ─────────────────────────────────────
  "db-truth-introspect": { writes: [], reads: [] },
  "seed-user-data": {
    writes: ["approval_decisions", "admin_action_audit", "appointments", "communication_log", "customers", "invoices", "leads", "opportunities", "tasks_workflow"],
    reads: ["leads"],
  },
};

/** All function names declared in the I/O map. */
export function listIOMappedFunctions(): readonly string[] {
  return Object.keys(EDGE_FUNCTION_TABLE_IO);
}

/** Returns the list of edge functions that WRITE to a given table. */
export function getWritersFor(table: string): readonly string[] {
  return Object.entries(EDGE_FUNCTION_TABLE_IO)
    .filter(([, io]) => io.writes.includes(table))
    .map(([fn]) => fn)
    .sort();
}

/** Returns the list of edge functions that READ from a given table. */
export function getReadersFor(table: string): readonly string[] {
  return Object.entries(EDGE_FUNCTION_TABLE_IO)
    .filter(([, io]) => io.reads.includes(table))
    .map(([fn]) => fn)
    .sort();
}

/** Aggregate counts for dashboards / CI reports. */
export function ioMapStats() {
  const total = Object.keys(EDGE_FUNCTION_TABLE_IO).length;
  const wrappers = Object.values(EDGE_FUNCTION_TABLE_IO).filter((io) => io.wrapper).length;
  const writers = Object.values(EDGE_FUNCTION_TABLE_IO).filter((io) => io.writes.length > 0).length;
  const readers = Object.values(EDGE_FUNCTION_TABLE_IO).filter((io) => io.reads.length > 0).length;
  return { total, wrappers, writers, readers };
}
