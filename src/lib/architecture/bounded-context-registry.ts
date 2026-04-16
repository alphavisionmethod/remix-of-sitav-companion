// ═══════════════════════════════════════════════════════════════
// SITA OS — Bounded Context Registry
// 13 canonical bounded contexts, each backed by real code artifacts.
// THIS IS THE FOUNDATION every other meta-architecture registry binds to.
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
    description: "CRM, leads, customer pipeline, sales intelligence, and revenue operations.",
    owner: "business-team",
    primarySurface: "web",
    sourceOfTruth: ["src/features/business", "supabase/functions/business-board-api"],
    canonicalApis: ["business-board-api", "crm-sync"],
    readModels: ["v_recommendation_closure_summary"],
    writeModels: ["leads", "lead_inbox_items", "crm_pipeline_stages", "crm_tasks"],
    externalDependencies: ["salesforce", "hubspot", "pipedrive"],
    edgeFunctions: ["business-board-api", "crm-sync", "business-advisor-intelligence"],
    services: ["customer-service", "lead-service", "pipeline-service"],
    tables: ["leads", "lead_inbox_items", "crm_pipeline_stages", "crm_tasks", "advisor_board_recommendations"],
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
    description: "Cashflow, invoicing, payments, tax, MSA, investment portfolio mechanics.",
    owner: "finance-team",
    primarySurface: "web",
    sourceOfTruth: ["src/features/finance", "supabase/functions/cashflow-calculate"],
    canonicalApis: ["cashflow-calculate", "invoice-generate", "payment-process", "tax-estimate"],
    readModels: [],
    writeModels: ["ai_inference_receipts"],
    externalDependencies: ["stripe", "plaid", "quickbooks"],
    edgeFunctions: [
      "cashflow-calculate", "invoice-generate", "payment-process", "tax-estimate",
      "msa-operations", "investment-portfolio-api", "cost-alert", "payment-kill-switch",
      "revenue-caller",
    ],
    services: ["finance-engine", "invoice-service", "payment-service"],
    tables: ["ai_inference_receipts"],
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
    description: "Household, family, appointments, transportation, life-admin tasks.",
    owner: "concierge-team",
    primarySurface: "web",
    sourceOfTruth: ["src/features/concierge", "supabase/functions/booking-manage"],
    canonicalApis: ["booking-manage", "communications-api", "tasks-workflow-api", "get-weather"],
    readModels: [],
    writeModels: ["appointments", "crm_tasks", "remediation_tasks"],
    externalDependencies: ["google-calendar", "weather-api"],
    edgeFunctions: ["booking-manage", "communications-api", "tasks-workflow-api", "get-weather"],
    services: ["concierge-orchestrator", "booking-service"],
    tables: ["appointments", "crm_tasks", "remediation_tasks"],
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
    description: "Strategic decision intake, advisor consensus, simulation review, formal approvals.",
    owner: "boardroom-team",
    primarySurface: "web",
    sourceOfTruth: ["src/features/boardroom", "supabase/functions/business-board-api"],
    canonicalApis: ["business-board-api", "simulation-engine-api"],
    readModels: ["v_recommendation_closure_summary"],
    writeModels: [
      "boardroom_items", "boardroom_evidence", "boardroom_decision_receipts",
      "advisor_board_recommendations", "advisor_board_actions",
    ],
    externalDependencies: [],
    edgeFunctions: ["business-board-api", "simulation-engine-api", "brain-core"],
    services: ["boardroom-service", "advisor-orchestrator"],
    tables: [
      "boardroom_items", "boardroom_evidence", "boardroom_decision_receipts",
      "advisor_board_recommendations", "advisor_board_actions",
      "advisor_board_memory", "advisor_board_reflections", "advisor_board_tool_executions",
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
    description: "Owner-facing pulse, alerts, daily intelligence, action queue.",
    owner: "platform-team",
    primarySurface: "web",
    sourceOfTruth: ["src/features/mission-control", "supabase/functions/intelligence-api"],
    canonicalApis: ["intelligence-api", "personal-brain"],
    readModels: [],
    writeModels: ["advisor_action_queue"],
    externalDependencies: [],
    edgeFunctions: [
      "intelligence-api", "personal-brain", "agent-intelligence",
      "advisor-deep-intelligence", "advisor-weekly-report",
      "advisor-agent-loop", "advisor-avatar-generate", "advisor-conversation",
      "advisor-knowledge-manage", "chat-advisor",
    ],
    services: ["intelligence-service", "alert-service"],
    tables: ["advisor_action_queue", "advisor_agents"],
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
    description: "Authentication, onboarding, profile bootstrap, biometric credentials.",
    owner: "identity-team",
    primarySurface: "web",
    sourceOfTruth: ["src/features/auth", "supabase/functions/seed-user-data"],
    canonicalApis: ["seed-user-data", "license-gateway"],
    readModels: [],
    writeModels: ["profiles", "user_roles", "biometric_credentials"],
    externalDependencies: ["supabase-auth", "google-oauth"],
    edgeFunctions: ["seed-user-data", "license-gateway"],
    services: ["auth-service", "onboarding-service"],
    tables: ["profiles", "user_roles", "biometric_credentials", "admin_sessions"],
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
    tables: [],
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
    writeModels: ["connector_oauth_flows", "connector_sync_runs"],
    externalDependencies: ["oauth-providers", "webhook-providers"],
    edgeFunctions: [
      "connector-batch", "connector-discover", "connector-health", "connector-oauth",
      "connector-operations", "connector-proxy", "connector-sync", "connector-transform",
      "crm-sync", "provider-family-operations",
    ],
    services: ["connector-service", "webhook-service", "sync-service"],
    tables: ["connector_oauth_flows", "connector_sync_runs"],
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
    description: "Receipts, attestations, verification recorder, GDPR, epistemic firewall.",
    owner: "trust-team",
    primarySurface: "web",
    sourceOfTruth: ["src/features/proof", "supabase/functions/verification-recorder"],
    canonicalApis: ["verification-recorder", "gdpr-export", "gdpr-delete"],
    readModels: [],
    writeModels: ["ai_inference_receipts", "approval_decisions"],
    externalDependencies: [],
    edgeFunctions: ["verification-recorder", "gdpr-export", "gdpr-delete", "health-check", "support-gateway"],
    services: ["audit-service", "ai-receipt-service", "epistemic-firewall"],
    tables: ["ai_inference_receipts", "admin_action_audit", "approval_decisions"],
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
    description: "OS kernel: agent runtime, ambient operations, command bus, status, self-healing.",
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
      "ai-gateway", "ai-health", "check-ai-budget", "brain-core",
      "file-ingestion", "main", "scheduler-dispatch",
      "app-store-api", "digital-twin-engine", "ecosystem-operations",
      "event-processor", "simulation-engine-api", "push-dispatch", "push-track",
      "vapid-public-key", "provider-family-operations", "user-bff-gateway",
    ],
    services: ["ai-gateway", "ai-budget-service", "advisor-orchestrator", "health-monitor"],
    tables: ["ai_inference_receipts", "ai_workforce_invocations"],
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
    description: "Mobile PWA, iOS/Android shells, push notifications, offline sync.",
    owner: "mobile-team",
    primarySurface: "mobile-pwa",
    sourceOfTruth: ["src/features/mobile", "supabase/functions/push-dispatch"],
    canonicalApis: ["push-dispatch", "push-track", "vapid-public-key", "user-bff-gateway"],
    readModels: [],
    writeModels: ["notification_delivery_receipts", "notification_preferences", "platform_notifications"],
    externalDependencies: ["fcm", "vapid-web-push"],
    edgeFunctions: ["push-dispatch", "push-track", "vapid-public-key", "user-bff-gateway"],
    services: ["push-service", "communication-service"],
    tables: ["notification_delivery_receipts", "notification_preferences", "platform_notifications", "notifications"],
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
    description: "Operator control plane: users, audit, kill-switches, runbooks, releases.",
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

export function getAllContextIds(): readonly BoundedContextId[] {
  return BOUNDED_CONTEXT_REGISTRY.map((c) => c.contextId);
}

export function getContextSummary(): {
  total: number;
  byOwner: Record<string, number>;
  bySurface: Record<string, number>;
  totalTables: number;
  totalEdgeFunctions: number;
  totalServices: number;
} {
  const byOwner: Record<string, number> = {};
  const bySurface: Record<string, number> = {};
  let totalTables = 0;
  let totalEdgeFunctions = 0;
  let totalServices = 0;
  for (const c of BOUNDED_CONTEXT_REGISTRY) {
    byOwner[c.owner] = (byOwner[c.owner] || 0) + 1;
    bySurface[c.primarySurface] = (bySurface[c.primarySurface] || 0) + 1;
    totalTables += c.tables.length;
    totalEdgeFunctions += c.edgeFunctions.length;
    totalServices += c.services.length;
  }
  return {
    total: BOUNDED_CONTEXT_REGISTRY.length,
    byOwner,
    bySurface,
    totalTables,
    totalEdgeFunctions,
    totalServices,
  };
}
