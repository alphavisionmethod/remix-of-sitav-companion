// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Migration Map
// Maps functions to DB tables they read/write
// ═══════════════════════════════════════════════════════════════

export interface FunctionTableAccess {
  readonly reads: readonly string[];
  readonly writes: readonly string[];
}

export const EDGE_FUNCTION_MIGRATION_MAP: Record<string, FunctionTableAccess> = {
  "admin-ai-workforce-run": { reads: ["ai_workforce_roles", "ai_workforce_task_types", "ai_workforce_budget_classes"], writes: ["ai_workforce_invocations", "ai_workforce_outputs"] },
  "admin-api": { reads: ["profiles", "user_roles", "admin_action_audit"], writes: ["admin_action_audit"] },
  "admin-bff-gateway": { reads: ["profiles", "user_roles", "admin_sessions"], writes: [] },
  "admin-gateway": { reads: ["api_gateway_routes", "user_roles"], writes: ["admin_action_audit"] },
  "admin-intelligence": { reads: ["ai_workforce_invocations", "ai_workforce_recommendations", "business_health_scores"], writes: [] },
  "admin-users": { reads: ["profiles", "user_roles"], writes: ["profiles", "user_roles"] },
  "advisor-agent-loop": { reads: ["advisor_agents", "advisor_autonomy_policies", "advisor_board_memory"], writes: ["advisor_action_queue", "advisor_board_actions"] },
  "advisor-avatar-generate": { reads: ["advisor_profiles"], writes: ["advisor_profiles"] },
  "advisor-conversation": { reads: ["advisor_agents", "advisor_board_memory", "advisor_knowledge"], writes: ["advisor_board_memory"] },
  "advisor-deep-intelligence": { reads: ["advisor_agents", "advisor_knowledge", "business_health_scores"], writes: ["advisor_board_recommendations"] },
  "advisor-knowledge-manage": { reads: ["advisor_knowledge"], writes: ["advisor_knowledge"] },
  "advisor-weekly-report": { reads: ["advisor_agents", "advisor_board_actions", "advisor_board_recommendations"], writes: [] },
  "agent-executor": { reads: ["advisor_action_queue", "runtime_agents"], writes: ["advisor_action_queue", "command_steps"] },
  "agent-heartbeat": { reads: ["runtime_agents"], writes: ["runtime_agents"] },
  "agent-intelligence": { reads: ["advisor_agents", "advisor_board_memory"], writes: ["advisor_board_memory"] },
  "agent-scheduler": { reads: ["runtime_agents"], writes: ["runtime_agents"] },
  "agent-signal": { reads: [], writes: ["advisor_action_queue"] },
  "ai-gateway": { reads: ["ai_workforce_budget_classes", "capabilities"], writes: ["ai_inference_receipts"] },
  "ai-health": { reads: ["ai_inference_receipts"], writes: [] },
  "check-ai-budget": { reads: ["ai_workforce_budget_classes", "ai_workforce_invocations"], writes: [] },
  "ambient-os-operations": { reads: ["cloud_devices", "cloud_sync_queue"], writes: ["cloud_sync_queue"] },
  "api-gateway": { reads: ["api_gateway_routes"], writes: [] },
  "app-store-api": { reads: [], writes: [] },
  "booking-manage": { reads: ["bookings", "appointments"], writes: ["bookings", "appointments"] },
  "brain-core": { reads: ["advisor_agents", "advisor_board_memory"], writes: ["advisor_board_memory"] },
  "business-advisor-intelligence": { reads: ["business_health_scores", "deals", "invoices"], writes: ["advisor_board_recommendations"] },
  "business-board-api": { reads: ["boardroom_sessions", "boardroom_items", "boardroom_recommendations"], writes: ["boardroom_sessions", "boardroom_items"] },
  "cashflow-calculate": { reads: ["invoices", "bills", "financial_documents"], writes: ["projections"] },
  "chat-advisor": { reads: ["advisor_agents", "advisor_board_memory"], writes: ["advisor_board_memory"] },
  "cloud-admin-api": { reads: ["cloud_admin_roles", "cloud_admin_role_assignments"], writes: ["cloud_admin_role_assignments"] },
  "cloud-device-api": { reads: ["cloud_devices"], writes: ["cloud_devices", "device_attestations"] },
  "cloud-lifecycle-api": { reads: ["cloud_tenants"], writes: ["cloud_tenants"] },
  "cloud-storage-api": { reads: [], writes: [] },
  "cloud-sync-api": { reads: ["cloud_sync_queue"], writes: ["cloud_sync_queue", "sync_logs"] },
  "cloud-tenant-api": { reads: ["cloud_tenants", "cloud_tenant_memberships"], writes: ["cloud_tenants", "cloud_tenant_memberships"] },
  "cloud-worker-api": { reads: ["cloud_workers"], writes: ["cloud_workers"] },
  "communications-api": { reads: [], writes: [] },
  "connector-batch": { reads: ["connector_configs", "connector_credentials"], writes: ["sync_logs"] },
  "connector-discover": { reads: ["connector_configs"], writes: [] },
  "connector-health": { reads: ["connector_configs", "connector_credentials", "sync_logs"], writes: [] },
  "connector-oauth": { reads: ["connector_configs"], writes: ["connector_credentials", "connector_tokens"] },
  "connector-operations": { reads: ["connector_configs", "connector_credentials"], writes: ["connector_configs"] },
  "connector-proxy": { reads: ["connector_credentials"], writes: [] },
  "connector-sync": { reads: ["connector_configs", "connector_credentials"], writes: ["sync_logs"] },
  "connector-transform": { reads: [], writes: [] },
  "cost-alert": { reads: ["ai_workforce_invocations", "ai_workforce_budget_classes"], writes: [] },
  "crm-sync": { reads: ["connector_credentials", "leads", "customers"], writes: ["leads", "customers", "sync_logs"] },
  "db-truth-introspect": { reads: [], writes: [] },
  "device-telemetry": { reads: ["cloud_devices"], writes: ["cloud_devices"] },
  "digital-twin-engine": { reads: [], writes: [] },
  "ecosystem-operations": { reads: [], writes: [] },
  "event-processor": { reads: ["timeline_events"], writes: ["timeline_events"] },
  "file-ingestion": { reads: [], writes: ["financial_documents"] },
  "gdpr-delete": { reads: ["profiles"], writes: ["profiles"] },
  "gdpr-export": { reads: ["profiles", "bookings", "invoices", "deals"], writes: [] },
  "get-weather": { reads: [], writes: [] },
  "health-check": { reads: [], writes: [] },
  "intelligence-api": { reads: ["advisor_agents", "advisor_board_recommendations"], writes: [] },
  "investment-portfolio-api": { reads: [], writes: [] },
  "invoice-generate": { reads: ["invoices", "customers", "profiles"], writes: ["invoices"] },
  "license-gateway": { reads: ["profiles"], writes: [] },
  "main": { reads: [], writes: [] },
  "msa-operations": { reads: ["financial_documents"], writes: ["financial_documents"] },
  "os-agent-channel": { reads: ["runtime_agents"], writes: ["runtime_agents"] },
  "os-command": { reads: ["capabilities"], writes: ["execution_envelopes", "command_steps"] },
  "os-status": { reads: ["cloud_devices", "runtime_agents"], writes: [] },
  "payment-kill-switch": { reads: [], writes: [] },
  "payment-process": { reads: ["invoices"], writes: ["invoices", "receipts"] },
  "personal-brain": { reads: ["advisor_board_memory", "user_memory"], writes: ["advisor_board_memory"] },
  "provider-family-operations": { reads: ["connector_configs"], writes: ["connector_configs"] },
  "push-dispatch": { reads: ["push_subscriptions", "vapid_keys"], writes: [] },
  "push-track": { reads: [], writes: [] },
  "revenue-caller": { reads: ["invoices", "deals"], writes: [] },
  "runtime-probes": { reads: [], writes: [] },
  "scheduler-dispatch": { reads: [], writes: [] },
  "seed-user-data": { reads: [], writes: ["profiles", "bookings", "deals", "budgets"] },
  "self-healing": { reads: ["incidents", "cloud_devices"], writes: ["incidents"] },
  "simulation-engine-api": { reads: [], writes: [] },
  "support-gateway": { reads: ["profiles"], writes: [] },
  "system-updates": { reads: [], writes: [] },
  "tasks-workflow-api": { reads: [], writes: [] },
  "tax-estimate": { reads: ["invoices", "financial_documents"], writes: [] },
  "user-bff-gateway": { reads: ["profiles", "bookings", "deals", "budgets"], writes: [] },
  "vapid-public-key": { reads: ["vapid_keys"], writes: [] },
  "verification-recorder": { reads: [], writes: ["proof_records", "receipts"] },
} as const;

export function getTableAccessForFunction(name: string): FunctionTableAccess | undefined {
  return EDGE_FUNCTION_MIGRATION_MAP[name];
}

export function getFunctionsThatWriteTable(table: string): string[] {
  return Object.entries(EDGE_FUNCTION_MIGRATION_MAP)
    .filter(([, access]) => access.writes.includes(table))
    .map(([name]) => name);
}

export function getFunctionsThatReadTable(table: string): string[] {
  return Object.entries(EDGE_FUNCTION_MIGRATION_MAP)
    .filter(([, access]) => access.reads.includes(table))
    .map(([name]) => name);
}

export function getOrphanFunctions(): string[] {
  return Object.entries(EDGE_FUNCTION_MIGRATION_MAP)
    .filter(([, access]) => access.reads.length === 0 && access.writes.length === 0)
    .map(([name]) => name);
}
