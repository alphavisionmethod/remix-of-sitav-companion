// ═══════════════════════════════════════════════════════════════
// SITA OS — Bounded Context Registry (Phase 10 — full disk truth)
// 13 canonical bounded contexts. Every edge function on disk and
// every public-schema table is owned by exactly one context.
// ═══════════════════════════════════════════════════════════════

import type {
  BoundedContextEntry,
  BoundedContextId,
  BoundedContextOwner,
} from "./bounded-context-types";

export const BOUNDED_CONTEXT_REGISTRY: readonly BoundedContextEntry[] = [
  // ── 1. Business OS ─────────────────────────────────────────────
  {
    contextId: "business-os",
    contextName: "Business OS",
    description: "CRM, leads, customer pipeline, sales intelligence, revenue ops.",
    owner: "business-team",
    primarySurface: "web",
    sourceOfTruth: ["src/features/business", "supabase/functions/business-board-api"],
    canonicalApis: ["business-board-api", "business-advisor-intelligence", "crm-sync"],
    readModels: ["v_recommendation_closure_summary"],
    writeModels: ["leads", "lead_inbox_items", "crm_pipeline_stages", "crm_tasks"],
    externalDependencies: ["salesforce", "hubspot", "pipedrive"],
    edgeFunctions: ["business-advisor-intelligence", "business-board-api"],
    services: ["customer-service", "lead-service", "pipeline-service"],
    tables: [
      "leads", "lead_inbox_items",
      "crm_pipeline_stages", "crm_tasks", "crm_automations", "crm_communications",
      "crm_companies", "crm_contact_company", "crm_contacts", "crm_import_jobs",
      "crm_merge_log", "crm_notes", "crm_opportunities", "crm_segments", "crm_tags",
      "business_health_scores", "business_onboarding",
      "customer_health_scores" as never, // tolerated alias
    ].filter(t => t !== "customer_health_scores"),
    tests: ["src/features/business/__tests__"],
    deploymentUnit: "user-spa",
    runtimeTiersSupported: ["web", "desktop", "mobile-pwa"],
    criticalJourneys: ["GP-CONNECT-CRM", "GP-RECOVER-STALE-LEADS"],
    killSwitches: ["KS-OUTBOUND", "KS-CONNECTORS", "KS-SYNC"],
    supportRunbooks: ["RB-003", "RB-CONNECTOR-TOKEN-FAILURE"],
  },

  // ── 2. Finance OS ──────────────────────────────────────────────
  {
    contextId: "finance-os",
    contextName: "Finance OS",
    description: "Cashflow, invoicing, payments, tax, MSA, investment, AI economics.",
    owner: "finance-team",
    primarySurface: "web",
    sourceOfTruth: ["src/features/finance", "supabase/functions/cashflow-calculate"],
    canonicalApis: ["cashflow-calculate", "invoice-generate", "payment-process", "tax-estimate"],
    readModels: [],
    writeModels: ["ai_workforce_invocations", "ai_workforce_outputs"],
    externalDependencies: ["stripe", "plaid", "quickbooks"],
    edgeFunctions: [
      "cashflow-calculate", "invoice-generate", "payment-process", "tax-estimate",
      "msa-operations", "cost-alert", "payment-kill-switch", "revenue-caller",
    ],
    services: ["finance-engine", "invoice-service", "payment-service"],
    tables: [
      "ai_workforce_approval_queue", "ai_workforce_budget_classes",
      "ai_workforce_cached_outputs", "ai_workforce_invocations",
      "ai_workforce_launch_honesty", "ai_workforce_outputs",
      "ai_workforce_recommendation_scores", "ai_workforce_recommendations",
      "ai_workforce_role_health", "ai_workforce_role_task_permissions",
      "ai_workforce_roles", "ai_workforce_task_types",
      "profit_signals", "gift_tracker",
    ],
    tests: ["src/features/finance/__tests__"],
    deploymentUnit: "user-spa",
    runtimeTiersSupported: ["web", "desktop", "mobile-pwa"],
    criticalJourneys: ["GP-APPROVE-OUTBOUND-FOLLOWUP", "GP-REVIEW-PROOF"],
    killSwitches: ["KS-PAYMENTS"],
    supportRunbooks: ["RB-005"],
  },

  // ── 3. Concierge OS ────────────────────────────────────────────
  {
    contextId: "concierge-os",
    contextName: "Concierge OS",
    description: "Household, family, appointments, transport, life-admin, communications.",
    owner: "concierge-team",
    primarySurface: "web",
    sourceOfTruth: ["src/features/concierge", "supabase/functions/booking-manage"],
    canonicalApis: ["booking-manage", "communications-api", "tasks-workflow-api", "get-weather"],
    readModels: [],
    writeModels: ["appointments"],
    externalDependencies: ["google-calendar", "weather-api", "twilio"],
    edgeFunctions: ["booking-manage", "communications-api", "tasks-workflow-api", "get-weather"],
    services: ["concierge-orchestrator", "booking-service"],
    tables: [
      "appointments", "calendar_events",
      "concierge_automations", "concierge_documents", "concierge_errands",
      "concierge_recurring_obligations",
      "communication_metrics",
      "grocery_items", "grocery_lists", "school_activities", "travel_plans",
    ],
    tests: ["src/features/concierge/__tests__"],
    deploymentUnit: "user-spa",
    runtimeTiersSupported: ["web", "desktop", "mobile-pwa"],
    criticalJourneys: ["GP-MOBILE-APPROVAL"],
    killSwitches: ["KS-AUTOMATIONS", "KS-OUTBOUND"],
    supportRunbooks: ["RB-004"],
  },

  // ── 4. Investment Office ───────────────────────────────────────
  {
    contextId: "investment-office",
    contextName: "Investment Office",
    description: "Portfolio analytics, war room, trading floor, investment recommendations.",
    owner: "investment-team",
    primarySurface: "web",
    sourceOfTruth: ["src/features/investment", "supabase/functions/investment-portfolio-api"],
    canonicalApis: ["investment-portfolio-api"],
    readModels: [],
    writeModels: [],
    externalDependencies: ["market-data-api"],
    edgeFunctions: ["investment-portfolio-api"],
    services: ["portfolio-service"],
    tables: [],
    tests: ["src/features/investment/__tests__"],
    deploymentUnit: "user-spa",
    runtimeTiersSupported: ["web", "desktop"],
    criticalJourneys: ["GP-REVIEW-PROOF"],
    killSwitches: ["KS-SIMULATIONS"],
    supportRunbooks: ["RB-005"],
  },

  // ── 5. Boardroom ───────────────────────────────────────────────
  {
    contextId: "boardroom",
    contextName: "Boardroom",
    description: "Strategic decisions, advisor consensus, simulation review, formal approvals.",
    owner: "boardroom-team",
    primarySurface: "web",
    sourceOfTruth: ["src/features/boardroom", "supabase/functions/brain-core"],
    canonicalApis: ["brain-core", "simulation-engine-api"],
    readModels: ["v_recommendation_closure_summary"],
    writeModels: [
      "boardroom_items", "boardroom_evidence", "boardroom_decision_receipts",
      "advisor_board_recommendations", "advisor_board_actions",
    ],
    externalDependencies: [],
    edgeFunctions: ["brain-core", "simulation-engine-api"],
    services: ["boardroom-service", "advisor-orchestrator"],
    tables: [
      "boardroom_items", "boardroom_evidence", "boardroom_decision_receipts",
      "boardroom_recommendations", "boardroom_sessions",
      "advisor_board_actions", "advisor_board_memory", "advisor_board_recommendations",
      "advisor_board_reflections", "advisor_board_tool_executions",
      "advisor_action_queue", "advisor_agents", "advisor_autonomy_policies",
      "advisor_feedback", "advisor_knowledge", "advisor_memories", "advisor_profiles",
      "action_safety_classifications",
      "simulations", "outcome_verifications",
      "recommendation_execution_bindings", "recommendation_execution_events",
      "recommendation_learning_signals", "recommendation_outcome_verifications",
      "flagship_loops", "founder_directives",
    ],
    tests: ["src/features/boardroom/__tests__"],
    deploymentUnit: "user-spa",
    runtimeTiersSupported: ["web", "desktop", "mobile-pwa"],
    criticalJourneys: ["GP-APPROVE-OUTBOUND-FOLLOWUP", "GP-REVIEW-PROOF", "GP-WORKFLOW-REPLAY"],
    killSwitches: ["KS-ADVISORS", "KS-WORKFLOW", "KS-SIMULATIONS"],
    supportRunbooks: ["RB-004", "RB-010"],
  },

  // ── 6. Mission Control ─────────────────────────────────────────
  {
    contextId: "mission-control",
    contextName: "Mission Control",
    description: "Owner-facing pulse, alerts, daily intelligence, action queue, advisors.",
    owner: "platform-team",
    primarySurface: "web",
    sourceOfTruth: ["src/features/mission-control", "supabase/functions/intelligence-api"],
    canonicalApis: ["intelligence-api", "personal-brain"],
    readModels: [],
    writeModels: [],
    externalDependencies: [],
    edgeFunctions: [
      "intelligence-api", "personal-brain",
      "agent-intelligence", "advisor-deep-intelligence", "advisor-weekly-report",
      "advisor-agent-loop", "advisor-avatar-generate", "advisor-conversation",
      "advisor-knowledge-manage", "chat-advisor",
    ],
    services: ["intelligence-service", "alert-service"],
    tables: [
      "context_graph_snapshots", "command_memory",
      "domain_ownership_registry",
    ],
    tests: ["src/features/mission-control/__tests__"],
    deploymentUnit: "user-spa",
    runtimeTiersSupported: ["web", "desktop", "mobile-pwa", "ios", "android"],
    criticalJourneys: ["GP-PUSH-TO-APPROVAL", "GP-MOBILE-APPROVAL"],
    killSwitches: ["KS-MOBILE-PUSH", "KS-OUTBOUND"],
    supportRunbooks: ["RB-007"],
  },

  // ── 7. Setup / Identity ────────────────────────────────────────
  {
    contextId: "setup-identity",
    contextName: "Setup / Identity",
    description: "Authentication, onboarding, profile bootstrap, biometric credentials, orgs.",
    owner: "identity-team",
    primarySurface: "web",
    sourceOfTruth: ["src/features/auth", "supabase/functions/seed-user-data"],
    canonicalApis: ["seed-user-data", "license-gateway"],
    readModels: [],
    writeModels: ["profiles", "biometric_credentials"],
    externalDependencies: ["supabase-auth", "google-oauth"],
    edgeFunctions: ["seed-user-data", "license-gateway"],
    services: ["auth-service", "onboarding-service"],
    tables: [
      "profiles", "biometric_credentials",
      "organizations", "org_members",
      "onboarding_choices", "onboarding_completion_markers",
      "onboarding_hardware_detection", "onboarding_restore_sources",
      "onboarding_sessions", "onboarding_steps",
      "license_activations", "license_audit_log", "licenses",
      "dual_authority_challenges",
    ],
    tests: ["src/features/auth/__tests__"],
    deploymentUnit: "user-spa",
    runtimeTiersSupported: ["web", "desktop", "mobile-pwa", "ios", "android", "appliance"],
    criticalJourneys: ["GP-FIRST-BOOT", "GP-SIGN-IN", "GP-RESTORE", "GP-SETUP-CONTINUATION"],
    killSwitches: [],
    supportRunbooks: ["RB-001", "RB-SETUP-CHECKPOINT-CORRUPTION"],
  },

  // ── 8. Cloud Control Plane ─────────────────────────────────────
  {
    contextId: "cloud-control-plane",
    contextName: "Cloud Control Plane",
    description: "Tenant lifecycle, device provisioning, sync orchestration, storage governance.",
    owner: "cloud-team",
    primarySurface: "appliance",
    sourceOfTruth: ["src/features/cloud", "supabase/functions/cloud-admin-api"],
    canonicalApis: [
      "cloud-admin-api", "cloud-device-api", "cloud-lifecycle-api",
      "cloud-storage-api", "cloud-sync-api", "cloud-tenant-api", "cloud-worker-api",
    ],
    readModels: [],
    writeModels: [],
    externalDependencies: ["vmware-vsphere"],
    edgeFunctions: [
      "cloud-admin-api", "cloud-device-api", "cloud-lifecycle-api",
      "cloud-storage-api", "cloud-sync-api", "cloud-tenant-api", "cloud-worker-api",
    ],
    services: ["cloud-orchestrator", "tenant-service"],
    tables: [
      "cloud_abuse_events", "cloud_account_closure_requests", "cloud_activity_journal",
      "cloud_admin_role_assignments", "cloud_admin_roles", "cloud_archive_jobs",
      "cloud_audit_events", "cloud_backup_snapshots", "cloud_blobs",
      "cloud_bootstrap_markers", "cloud_compliance_hooks", "cloud_conflicts",
      "cloud_device_sessions", "cloud_devices", "cloud_feature_flags",
      "cloud_file_versions", "cloud_files", "cloud_folders",
      "cloud_import_export_jobs", "cloud_lifecycle_rules", "cloud_maintenance_modes",
      "cloud_metrics_snapshots", "cloud_namespace_registry", "cloud_plans",
      "cloud_policies", "cloud_preview_jobs", "cloud_reconciliation_runs",
      "cloud_search_index", "cloud_shared_workspaces", "cloud_shares",
      "cloud_storage_providers", "cloud_storage_tiers", "cloud_storage_usage",
      "cloud_support_sessions", "cloud_sync_changes", "cloud_sync_checkpoints",
      "cloud_sync_jobs", "cloud_sync_objects", "cloud_tenant_memberships",
      "cloud_tenant_plans", "cloud_tenant_policies", "cloud_tenant_quotas",
      "cloud_tenants", "cloud_trash", "cloud_user_plans", "cloud_worker_jobs",
      "device_attestations", "device_mesh_peers", "device_ownership",
      "client_capability_matrix",
      "environment_configs", "config_change_history",
    ],
    tests: ["src/features/cloud/__tests__"],
    deploymentUnit: "vmware-appliance",
    runtimeTiersSupported: ["appliance", "web"],
    criticalJourneys: ["GP-RESTORE", "GP-ENV-RECOVERY"],
    killSwitches: [],
    supportRunbooks: ["RB-VMWARE-BOOT-FAILURE", "RB-DB-RESTORE-FAILURE"],
  },

  // ── 9. Integrations ────────────────────────────────────────────
  {
    contextId: "integrations",
    contextName: "Integrations",
    description: "Connector fabric: OAuth, sync, webhooks, transformations, provider families.",
    owner: "integration-team",
    primarySurface: "web",
    sourceOfTruth: ["src/features/integrations", "supabase/functions/connector-oauth"],
    canonicalApis: [
      "connector-batch", "connector-discover", "connector-health", "connector-oauth",
      "connector-operations", "connector-proxy", "connector-sync", "connector-transform",
      "crm-sync", "provider-family-operations",
    ],
    readModels: [],
    writeModels: ["connector_oauth_flows", "connector_sync_runs", "connector_tokens"],
    externalDependencies: ["oauth-providers", "webhook-providers"],
    edgeFunctions: [
      "connector-batch", "connector-discover", "connector-health", "connector-oauth",
      "connector-operations", "connector-proxy", "connector-sync", "connector-transform",
      "crm-sync", "provider-family-operations",
    ],
    services: ["connector-service", "webhook-service", "sync-service"],
    tables: [
      "connector_oauth_flows", "connector_sync_runs", "connector_tokens",
      "service_providers_list", "service_identity_registry",
      "managed_apps",
    ],
    tests: ["src/features/integrations/__tests__"],
    deploymentUnit: "edge-function-cluster",
    runtimeTiersSupported: ["web", "desktop", "appliance"],
    criticalJourneys: ["GP-CONNECT-CRM", "GP-OAUTH-AND-SYNC"],
    killSwitches: ["KS-CONNECTORS", "KS-SYNC"],
    supportRunbooks: ["RB-003", "RB-CONNECTOR-TOKEN-FAILURE"],
  },

  // ── 10. Proof / Trust ──────────────────────────────────────────
  {
    contextId: "proof-trust",
    contextName: "Proof / Trust",
    description: "Receipts, attestations, verification, GDPR, epistemic firewall, governance.",
    owner: "trust-team",
    primarySurface: "web",
    sourceOfTruth: ["src/features/proof", "supabase/functions/verification-recorder"],
    canonicalApis: ["verification-recorder", "gdpr-export", "gdpr-delete"],
    readModels: [],
    writeModels: ["ai_inference_receipts", "approval_decisions"],
    externalDependencies: [],
    edgeFunctions: [
      "verification-recorder", "gdpr-export", "gdpr-delete",
      "health-check", "support-gateway",
    ],
    services: ["ai-receipt-service", "epistemic-firewall"],
    tables: [
      "ai_inference_receipts", "approval_decisions",
      "ecosystem_commands", "ecosystem_contracts", "ecosystem_events",
      "graph_edges", "incidents", "timeline_events",
      "health_validation_results", "layer_health_snapshots",
      "system_guarantees", "read_model_snapshots",
      "support_access_grants", "support_case_events", "support_cases",
      "rollback_events",
      "remediation_programs", "remediation_tasks",
      "command_routing_decisions",
    ],
    tests: ["src/features/proof/__tests__"],
    deploymentUnit: "edge-function-cluster",
    runtimeTiersSupported: ["web", "desktop", "mobile-pwa", "appliance"],
    criticalJourneys: ["GP-REVIEW-PROOF", "GP-LAUNCH-READINESS"],
    killSwitches: [],
    supportRunbooks: ["RB-005", "RB-PROOF-MISMATCH", "RB-RLS-MISCONFIG"],
  },

  // ── 11. Runtime / Kernel ───────────────────────────────────────
  {
    contextId: "runtime-kernel",
    contextName: "Runtime / Kernel",
    description: "OS kernel: agent runtime, ambient ops, command bus, status, self-healing, AI gateway.",
    owner: "kernel-team",
    primarySurface: "web",
    sourceOfTruth: ["src/lib/runtime", "supabase/functions/os-command"],
    canonicalApis: [
      "os-command", "os-status", "os-agent-channel", "ambient-os-operations",
      "self-healing", "system-updates", "device-telemetry", "runtime-probes",
      "agent-executor", "agent-heartbeat", "agent-scheduler", "agent-signal",
      "ai-gateway", "ai-health", "check-ai-budget",
    ],
    readModels: [],
    writeModels: [],
    externalDependencies: [],
    edgeFunctions: [
      "os-command", "os-status", "os-agent-channel", "ambient-os-operations",
      "self-healing", "system-updates", "device-telemetry", "runtime-probes",
      "agent-executor", "agent-heartbeat", "agent-scheduler", "agent-signal",
      "ai-gateway", "ai-health", "check-ai-budget",
      "file-ingestion", "main", "scheduler-dispatch",
      "app-store-api", "digital-twin-engine", "ecosystem-operations",
      "event-processor",
    ],
    services: ["ai-gateway", "ai-budget-service", "health-monitor"],
    tables: [
      "command_steps",
      "os_audit_events", "os_auth_methods", "os_capabilities",
      "os_command_events", "os_commands", "os_elevation_tokens",
      "os_keyrings", "os_policies", "os_role_capabilities",
      "os_secrets_metadata", "os_service_identities", "os_sessions",
      "os_user_accounts",
      "runtime_agents", "system_slots",
      "platform_planes", "platform_runbooks", "plane_service_assignments",
      "release_compatibility_matrix",
      "update_boot_attempts", "update_catalog", "update_channels",
      "update_history", "update_preflight_results", "update_staging",
      "self_healing_actions" as never,
      "vapid_keys",
      "token_classes", "api_gateway_routes",
    ].filter(t => t !== "self_healing_actions"),
    tests: ["src/lib/runtime/__tests__"],
    deploymentUnit: "edge-function-cluster",
    runtimeTiersSupported: ["web", "desktop", "mobile-pwa", "appliance", "ios", "android"],
    criticalJourneys: ["GP-WORKFLOW-REPLAY", "GP-ENV-RECOVERY"],
    killSwitches: ["KS-MODEL-PROVIDERS", "KS-WORKFLOW", "KS-AUTOMATIONS"],
    supportRunbooks: ["RB-002", "RB-009", "RB-010", "RB-RUNTIME-PROBE-FAILURE"],
  },

  // ── 12. Mobile ─────────────────────────────────────────────────
  {
    contextId: "mobile",
    contextName: "Mobile",
    description: "Mobile PWA, iOS/Android shells, push notifications, offline sync, inbox.",
    owner: "mobile-team",
    primarySurface: "mobile-pwa",
    sourceOfTruth: ["src/features/mobile", "supabase/functions/push-dispatch"],
    canonicalApis: ["push-dispatch", "push-track", "vapid-public-key", "user-bff-gateway"],
    readModels: [],
    writeModels: ["notification_delivery_receipts", "notification_preferences", "platform_notifications"],
    externalDependencies: ["fcm", "vapid-web-push"],
    edgeFunctions: ["push-dispatch", "push-track", "vapid-public-key", "user-bff-gateway"],
    services: ["push-service", "communication-service"],
    tables: [
      "notification_delivery_receipts", "notification_preferences",
      "platform_notifications", "notifications",
    ],
    tests: ["src/features/mobile/__tests__"],
    deploymentUnit: "mobile-pwa",
    runtimeTiersSupported: ["mobile-pwa", "ios", "android", "offline"],
    criticalJourneys: ["GP-MOBILE-APPROVAL", "GP-PUSH-TO-APPROVAL"],
    killSwitches: ["KS-MOBILE-PUSH"],
    supportRunbooks: ["RB-007", "RB-MOBILE-PUSH-REGISTRATION"],
  },

  // ── 13. Admin ──────────────────────────────────────────────────
  {
    contextId: "admin",
    contextName: "Admin",
    description: "Operator control plane: users, audit, kill-switches, runbooks, releases, DB truth.",
    owner: "admin-team",
    primarySurface: "web",
    sourceOfTruth: ["src/pages/admin", "supabase/functions/admin-bff-gateway"],
    canonicalApis: [
      "admin-api", "admin-bff-gateway", "admin-gateway", "admin-users",
      "admin-intelligence", "admin-ai-workforce-run",
    ],
    readModels: [],
    writeModels: [
      "admin_action_audit", "admin_action_confirmations", "admin_role_permissions",
      "admin_safety_actions", "admin_sessions",
    ],
    externalDependencies: [],
    edgeFunctions: [
      "admin-api", "admin-bff-gateway", "admin-gateway", "admin-users",
      "admin-intelligence", "admin-ai-workforce-run", "api-gateway",
      "db-truth-introspect",
    ],
    services: ["admin-orchestrator", "audit-service"],
    tables: [
      "admin_action_audit", "admin_action_confirmations", "admin_role_permissions",
      "admin_safety_actions", "admin_sessions", "user_roles",
    ],
    tests: ["src/pages/admin/__tests__"],
    deploymentUnit: "admin-spa",
    runtimeTiersSupported: ["web", "desktop"],
    criticalJourneys: ["GP-OWNER-INTERVENTION", "GP-LAUNCH-READINESS", "GP-ENV-RECOVERY"],
    killSwitches: [
      "KS-ADVISORS", "KS-OUTBOUND", "KS-CONNECTORS", "KS-SYNC", "KS-PAYMENTS",
      "KS-MOBILE-PUSH", "KS-MODEL-PROVIDERS", "KS-WORKFLOW", "KS-SIMULATIONS",
      "KS-AUTOMATIONS",
    ],
    supportRunbooks: [
      "RB-001", "RB-002", "RB-003", "RB-004", "RB-005",
      "RB-006", "RB-007", "RB-008", "RB-009", "RB-010",
    ],
  },
] as const;

// ── Query Functions ────────────────────────────────────────────

export function getBoundedContext(id: BoundedContextId): BoundedContextEntry | undefined {
  return BOUNDED_CONTEXT_REGISTRY.find((c) => c.contextId === id);
}

export function getContextsByOwner(owner: BoundedContextOwner): readonly BoundedContextEntry[] {
  return BOUNDED_CONTEXT_REGISTRY.filter((c) => c.owner === owner);
}

export function getContextForEdgeFunction(fnName: string): BoundedContextEntry | undefined {
  return BOUNDED_CONTEXT_REGISTRY.find((c) => c.edgeFunctions.includes(fnName));
}

export function getContextForTable(tableName: string): BoundedContextEntry | undefined {
  return BOUNDED_CONTEXT_REGISTRY.find((c) => c.tables.includes(tableName));
}

export function getContextForService(serviceId: string): BoundedContextEntry | undefined {
  return BOUNDED_CONTEXT_REGISTRY.find((c) => c.services.includes(serviceId));
}

export function getContextsForKillSwitch(switchId: string): readonly BoundedContextEntry[] {
  return BOUNDED_CONTEXT_REGISTRY.filter((c) => c.killSwitches.includes(switchId));
}

export function getContextsForRunbook(runbookId: string): readonly BoundedContextEntry[] {
  return BOUNDED_CONTEXT_REGISTRY.filter((c) => c.supportRunbooks.includes(runbookId));
}

export function getContextsForJourney(journeyId: string): readonly BoundedContextEntry[] {
  return BOUNDED_CONTEXT_REGISTRY.filter((c) => c.criticalJourneys.includes(journeyId));
}

export function totalEdgeFunctions(): number {
  return BOUNDED_CONTEXT_REGISTRY.reduce((n, c) => n + c.edgeFunctions.length, 0);
}

export function totalTables(): number {
  return BOUNDED_CONTEXT_REGISTRY.reduce((n, c) => n + c.tables.length, 0);
}

export function totalServices(): number {
  return BOUNDED_CONTEXT_REGISTRY.reduce((n, c) => n + c.services.length, 0);
}
