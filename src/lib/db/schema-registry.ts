// ═══════════════════════════════════════════════════════════════
// SITA OS — DB Schema Registry
// Master registry of all database tables with domain classification
// ═══════════════════════════════════════════════════════════════

export type DbDomain =
  | "auth-identity"
  | "admin-governance"
  | "advisor-intelligence"
  | "ai-workforce"
  | "boardroom"
  | "business-crm"
  | "cloud-infrastructure"
  | "connector-fabric"
  | "finance"
  | "notification"
  | "os-kernel"
  | "platform-core"
  | "compliance"
  | "user-experience";

export interface TableRegistryEntry {
  readonly name: string;
  readonly domain: DbDomain;
  readonly description: string;
  readonly hasRls: boolean;
  readonly tenancyColumn: string | null;
}

export const DB_SCHEMA_REGISTRY: readonly TableRegistryEntry[] = [
  // auth-identity
  { name: "profiles", domain: "auth-identity", description: "User profile data", hasRls: true, tenancyColumn: "user_id" },
  { name: "user_roles", domain: "auth-identity", description: "Role assignments (RBAC)", hasRls: true, tenancyColumn: "user_id" },
  { name: "biometric_credentials", domain: "auth-identity", description: "WebAuthn/biometric credentials", hasRls: true, tenancyColumn: "user_id" },
  { name: "os_user_accounts", domain: "auth-identity", description: "OS-level user accounts", hasRls: true, tenancyColumn: "user_id" },
  { name: "user_memory", domain: "auth-identity", description: "Per-user memory/preferences", hasRls: true, tenancyColumn: "user_id" },

  // admin-governance
  { name: "admin_action_audit", domain: "admin-governance", description: "Admin action audit trail", hasRls: true, tenancyColumn: "actor_user_id" },
  { name: "admin_action_confirmations", domain: "admin-governance", description: "Dual-approval action confirmations", hasRls: true, tenancyColumn: "actor_user_id" },
  { name: "admin_role_permissions", domain: "admin-governance", description: "Admin role-permission matrix", hasRls: true, tenancyColumn: null },
  { name: "admin_safety_actions", domain: "admin-governance", description: "Safety-classified admin actions", hasRls: true, tenancyColumn: null },
  { name: "admin_sessions", domain: "admin-governance", description: "Admin session management", hasRls: true, tenancyColumn: "user_id" },
  { name: "action_safety_classifications", domain: "admin-governance", description: "Action safety classifications", hasRls: true, tenancyColumn: "user_id" },

  // advisor-intelligence
  { name: "advisor_agents", domain: "advisor-intelligence", description: "Advisor agent configurations", hasRls: true, tenancyColumn: "user_id" },
  { name: "advisor_action_queue", domain: "advisor-intelligence", description: "Advisor action queue", hasRls: true, tenancyColumn: "user_id" },
  { name: "advisor_autonomy_policies", domain: "advisor-intelligence", description: "Advisor autonomy policies", hasRls: true, tenancyColumn: "user_id" },
  { name: "advisor_board_actions", domain: "advisor-intelligence", description: "Board-level advisor actions", hasRls: true, tenancyColumn: "user_id" },
  { name: "advisor_board_memory", domain: "advisor-intelligence", description: "Advisor board memory", hasRls: true, tenancyColumn: "user_id" },
  { name: "advisor_board_recommendations", domain: "advisor-intelligence", description: "Board recommendations", hasRls: true, tenancyColumn: "user_id" },
  { name: "advisor_board_reflections", domain: "advisor-intelligence", description: "Board reflections/learnings", hasRls: true, tenancyColumn: "user_id" },
  { name: "advisor_board_tool_executions", domain: "advisor-intelligence", description: "Tool execution records", hasRls: true, tenancyColumn: "user_id" },
  { name: "advisor_feedback", domain: "advisor-intelligence", description: "User feedback on advisors", hasRls: true, tenancyColumn: "user_id" },
  { name: "advisor_knowledge", domain: "advisor-intelligence", description: "Advisor knowledge base", hasRls: true, tenancyColumn: "user_id" },
  { name: "advisor_memories", domain: "advisor-intelligence", description: "Advisor working memory", hasRls: true, tenancyColumn: "user_id" },
  { name: "advisor_profiles", domain: "advisor-intelligence", description: "Advisor visual profiles", hasRls: true, tenancyColumn: "user_id" },

  // ai-workforce
  { name: "ai_inference_receipts", domain: "ai-workforce", description: "AI inference cost/usage receipts", hasRls: true, tenancyColumn: "user_id" },
  { name: "ai_workforce_approval_queue", domain: "ai-workforce", description: "AI workforce approval queue", hasRls: true, tenancyColumn: "user_id" },
  { name: "ai_workforce_budget_classes", domain: "ai-workforce", description: "AI budget class definitions", hasRls: true, tenancyColumn: "user_id" },
  { name: "ai_workforce_cached_outputs", domain: "ai-workforce", description: "Cached AI outputs", hasRls: true, tenancyColumn: "user_id" },
  { name: "ai_workforce_invocations", domain: "ai-workforce", description: "AI invocation records", hasRls: true, tenancyColumn: "user_id" },
  { name: "ai_workforce_launch_honesty", domain: "ai-workforce", description: "Launch honesty audits", hasRls: true, tenancyColumn: "user_id" },
  { name: "ai_workforce_outputs", domain: "ai-workforce", description: "AI workforce outputs", hasRls: true, tenancyColumn: "user_id" },
  { name: "ai_workforce_recommendation_scores", domain: "ai-workforce", description: "Recommendation scoring", hasRls: true, tenancyColumn: "user_id" },
  { name: "ai_workforce_recommendations", domain: "ai-workforce", description: "AI recommendations", hasRls: true, tenancyColumn: "user_id" },
  { name: "ai_workforce_role_health", domain: "ai-workforce", description: "Role health metrics", hasRls: true, tenancyColumn: "user_id" },
  { name: "ai_workforce_role_task_permissions", domain: "ai-workforce", description: "Role-task permission matrix", hasRls: true, tenancyColumn: "user_id" },
  { name: "ai_workforce_roles", domain: "ai-workforce", description: "AI workforce role definitions", hasRls: true, tenancyColumn: "user_id" },
  { name: "ai_workforce_task_types", domain: "ai-workforce", description: "AI task type definitions", hasRls: true, tenancyColumn: "user_id" },

  // boardroom
  { name: "boardroom_decision_receipts", domain: "boardroom", description: "Decision receipts with proof", hasRls: true, tenancyColumn: "user_id" },
  { name: "boardroom_evidence", domain: "boardroom", description: "Evidence for boardroom items", hasRls: true, tenancyColumn: "user_id" },
  { name: "boardroom_items", domain: "boardroom", description: "Boardroom agenda items", hasRls: true, tenancyColumn: "user_id" },
  { name: "boardroom_recommendations", domain: "boardroom", description: "Boardroom recommendations", hasRls: true, tenancyColumn: "user_id" },
  { name: "boardroom_sessions", domain: "boardroom", description: "Boardroom sessions", hasRls: true, tenancyColumn: "user_id" },

  // business-crm
  { name: "business_health_scores", domain: "business-crm", description: "Business health scoring", hasRls: true, tenancyColumn: "user_id" },
  { name: "customers", domain: "business-crm", description: "Customer records", hasRls: true, tenancyColumn: "user_id" },
  { name: "deals", domain: "business-crm", description: "Deal/opportunity tracking", hasRls: true, tenancyColumn: "user_id" },
  { name: "leads", domain: "business-crm", description: "Lead records", hasRls: true, tenancyColumn: "user_id" },
  { name: "opportunities", domain: "business-crm", description: "Sales opportunities", hasRls: true, tenancyColumn: "user_id" },
  { name: "quotes", domain: "business-crm", description: "Quote documents", hasRls: true, tenancyColumn: "user_id" },
  { name: "communications", domain: "business-crm", description: "Communication records", hasRls: true, tenancyColumn: "user_id" },

  // cloud-infrastructure
  { name: "cloud_admin_role_assignments", domain: "cloud-infrastructure", description: "Cloud admin role assignments", hasRls: true, tenancyColumn: "user_id" },
  { name: "cloud_admin_roles", domain: "cloud-infrastructure", description: "Cloud admin role definitions", hasRls: true, tenancyColumn: null },
  { name: "cloud_devices", domain: "cloud-infrastructure", description: "Registered cloud devices", hasRls: true, tenancyColumn: "user_id" },
  { name: "cloud_sync_queue", domain: "cloud-infrastructure", description: "Cloud sync queue", hasRls: true, tenancyColumn: "user_id" },
  { name: "cloud_tenant_memberships", domain: "cloud-infrastructure", description: "Tenant membership records", hasRls: true, tenancyColumn: "user_id" },
  { name: "cloud_tenants", domain: "cloud-infrastructure", description: "Tenant definitions", hasRls: true, tenancyColumn: "owner_id" },
  { name: "cloud_workers", domain: "cloud-infrastructure", description: "Cloud worker registrations", hasRls: true, tenancyColumn: "user_id" },
  { name: "device_attestations", domain: "cloud-infrastructure", description: "Device attestation records", hasRls: true, tenancyColumn: "user_id" },

  // connector-fabric
  { name: "connector_configs", domain: "connector-fabric", description: "Connector configurations", hasRls: true, tenancyColumn: "user_id" },
  { name: "connector_credentials", domain: "connector-fabric", description: "Connector credentials (encrypted)", hasRls: true, tenancyColumn: "user_id" },
  { name: "connector_tokens", domain: "connector-fabric", description: "OAuth/API tokens for connectors", hasRls: true, tenancyColumn: "user_id" },
  { name: "sync_logs", domain: "connector-fabric", description: "Sync operation logs", hasRls: true, tenancyColumn: "user_id" },

  // finance
  { name: "bills", domain: "finance", description: "Bill/expense records", hasRls: true, tenancyColumn: "user_id" },
  { name: "budgets", domain: "finance", description: "Budget allocations", hasRls: true, tenancyColumn: "user_id" },
  { name: "financial_documents", domain: "finance", description: "Financial document storage", hasRls: true, tenancyColumn: "user_id" },
  { name: "invoices", domain: "finance", description: "Invoice records", hasRls: true, tenancyColumn: "user_id" },
  { name: "reserves", domain: "finance", description: "Financial reserves", hasRls: true, tenancyColumn: "user_id" },
  { name: "subscriptions", domain: "finance", description: "Subscription tracking", hasRls: true, tenancyColumn: "user_id" },

  // notification
  { name: "push_subscriptions", domain: "notification", description: "Web push subscriptions", hasRls: true, tenancyColumn: "user_id" },
  { name: "vapid_keys", domain: "notification", description: "VAPID keys for push", hasRls: true, tenancyColumn: "user_id" },

  // os-kernel
  { name: "capabilities", domain: "os-kernel", description: "OS capability definitions", hasRls: true, tenancyColumn: null },
  { name: "command_steps", domain: "os-kernel", description: "Command execution steps", hasRls: true, tenancyColumn: "user_id" },
  { name: "execution_envelopes", domain: "os-kernel", description: "Execution envelope records", hasRls: true, tenancyColumn: "user_id" },
  { name: "incidents", domain: "os-kernel", description: "Incident records", hasRls: true, tenancyColumn: "user_id" },
  { name: "projections", domain: "os-kernel", description: "Read-model projections", hasRls: true, tenancyColumn: "user_id" },
  { name: "receipts", domain: "os-kernel", description: "Operation receipts", hasRls: true, tenancyColumn: "user_id" },
  { name: "runtime_agents", domain: "os-kernel", description: "Runtime agent registrations", hasRls: true, tenancyColumn: "user_id" },
  { name: "trust_state", domain: "os-kernel", description: "Trust state records", hasRls: true, tenancyColumn: "user_id" },

  // platform-core
  { name: "api_gateway_routes", domain: "platform-core", description: "API gateway route definitions", hasRls: true, tenancyColumn: null },
  { name: "approval_decisions", domain: "platform-core", description: "Approval decision records", hasRls: true, tenancyColumn: "user_id" },
  { name: "graph_edges", domain: "platform-core", description: "Entity relationship graph edges", hasRls: true, tenancyColumn: "user_id" },
  { name: "organizations", domain: "platform-core", description: "Organization records", hasRls: true, tenancyColumn: "owner_id" },
  { name: "org_members", domain: "platform-core", description: "Organization membership", hasRls: true, tenancyColumn: "user_id" },
  { name: "policies", domain: "platform-core", description: "Platform policy definitions", hasRls: true, tenancyColumn: "user_id" },
  { name: "simulations", domain: "platform-core", description: "Simulation runs", hasRls: true, tenancyColumn: "user_id" },
  { name: "tasks", domain: "platform-core", description: "Task tracking", hasRls: true, tenancyColumn: "user_id" },
  { name: "timeline_events", domain: "platform-core", description: "Timeline event records", hasRls: true, tenancyColumn: "user_id" },
  { name: "workflows", domain: "platform-core", description: "Workflow definitions", hasRls: true, tenancyColumn: "user_id" },
  { name: "workflow_runs", domain: "platform-core", description: "Workflow execution runs", hasRls: true, tenancyColumn: "user_id" },
  { name: "workflow_steps", domain: "platform-core", description: "Workflow step definitions", hasRls: true, tenancyColumn: "user_id" },

  // compliance
  { name: "audit_logs", domain: "compliance", description: "System audit logs (append-only)", hasRls: true, tenancyColumn: "user_id" },
  { name: "proof_records", domain: "compliance", description: "Proof/evidence records", hasRls: true, tenancyColumn: "user_id" },
  { name: "tenant_firewall_logs", domain: "compliance", description: "Tenant firewall audit logs", hasRls: true, tenancyColumn: "user_id" },

  // user-experience
  { name: "appointments", domain: "user-experience", description: "Appointment scheduling", hasRls: true, tenancyColumn: "user_id" },
  { name: "bookings", domain: "user-experience", description: "Booking records", hasRls: true, tenancyColumn: "user_id" },
  { name: "events", domain: "user-experience", description: "Calendar events", hasRls: true, tenancyColumn: "user_id" },
] as const;

export function getTablesByDomain(domain: DbDomain): readonly TableRegistryEntry[] {
  return DB_SCHEMA_REGISTRY.filter(t => t.domain === domain);
}

export function getTable(name: string): TableRegistryEntry | undefined {
  return DB_SCHEMA_REGISTRY.find(t => t.name === name);
}

export function getDomainCounts(): Record<DbDomain, number> {
  const counts = {} as Record<DbDomain, number>;
  for (const t of DB_SCHEMA_REGISTRY) {
    counts[t.domain] = (counts[t.domain] || 0) + 1;
  }
  return counts;
}

export function getTablesWithoutRls(): readonly TableRegistryEntry[] {
  return DB_SCHEMA_REGISTRY.filter(t => !t.hasRls);
}
