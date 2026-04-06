// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Ownership Registry
// Static registry mapping domains to primary services, routes, capabilities
// ═══════════════════════════════════════════════════════════════

export interface DomainServiceEntry {
  domain: string;
  displayName: string;
  primaryService: string;
  dependentServices: string[];
  routes: string[];
  capabilities: string[];
  launchCriticality: "critical" | "high" | "medium" | "low";
  flagshipLoop: string | null;
  duplicateRisk: "low" | "medium" | "high";
  shadowServiceRisk: "low" | "medium" | "high";
  notes: string;
}

export const SERVICE_OWNERSHIP_REGISTRY: DomainServiceEntry[] = [
  {
    domain: "auth",
    displayName: "Authentication & Identity",
    primaryService: "supabase-auth + auth-context",
    dependentServices: ["profile-service", "session-service"],
    routes: ["/login", "/signup", "/forgot-password", "/reset-password"],
    capabilities: ["email_password_auth", "google_oauth", "session_management", "profile_creation"],
    launchCriticality: "critical",
    flagshipLoop: "sign-in-dashboard-pulse",
    duplicateRisk: "low",
    shadowServiceRisk: "low",
    notes: "Well-consolidated via AuthContext. Single entry point.",
  },
  {
    domain: "dashboard",
    displayName: "Dashboard & Pulse",
    primaryService: "dashboard-service",
    dependentServices: ["pulse-service", "summary-card-service"],
    routes: ["/", "/daily-pulse"],
    capabilities: ["pulse_render", "summary_cards", "quick_actions"],
    launchCriticality: "critical",
    flagshipLoop: "sign-in-dashboard-pulse",
    duplicateRisk: "medium",
    shadowServiceRisk: "medium",
    notes: "Multiple summary/card patterns exist. Consolidation opportunity.",
  },
  {
    domain: "files",
    displayName: "Files & Documents",
    primaryService: "file-service",
    dependentServices: ["storage-adapter", "document-parser"],
    routes: ["/files"],
    capabilities: ["file_upload", "file_browse", "file_preview", "document_storage"],
    launchCriticality: "high",
    flagshipLoop: "files-ai-assist",
    duplicateRisk: "low",
    shadowServiceRisk: "low",
    notes: "Clean domain boundary via Supabase storage.",
  },
  {
    domain: "assistant",
    displayName: "AI Assistant",
    primaryService: "ai-gateway-service",
    dependentServices: ["advisor-service", "prompt-family-service", "receipt-service"],
    routes: ["/advisor", "/advisor/council"],
    capabilities: ["chat_completion", "document_analysis", "strategic_synthesis"],
    launchCriticality: "high",
    flagshipLoop: "files-ai-assist",
    duplicateRisk: "medium",
    shadowServiceRisk: "medium",
    notes: "Multiple advisor/assistant patterns. Gateway unifies routing.",
  },
  {
    domain: "boardroom",
    displayName: "Boardroom & Strategy",
    primaryService: "boardroom-service",
    dependentServices: ["ai-gateway-service", "recommendation-service"],
    routes: ["/boardroom", "/boardroom/replay"],
    capabilities: ["session_creation", "strategic_summary", "decision_tracking"],
    launchCriticality: "high",
    flagshipLoop: "boardroom-summary-decision",
    duplicateRisk: "low",
    shadowServiceRisk: "low",
    notes: "Clean domain. AI gateway handles LLM calls.",
  },
  {
    domain: "connectors",
    displayName: "Connected Services",
    primaryService: "connector-service",
    dependentServices: ["oauth-service", "connector-health-service", "sync-service"],
    routes: ["/connector-hub", "/settings/google-accounts"],
    capabilities: ["google_drive_connect", "oauth_flow", "health_check", "sync_trigger"],
    launchCriticality: "high",
    flagshipLoop: "connected-services-sync",
    duplicateRisk: "medium",
    shadowServiceRisk: "medium",
    notes: "Multiple connector/integration patterns. Provider family model helps.",
  },
  {
    domain: "approvals",
    displayName: "Approvals & Governance",
    primaryService: "approval-service",
    dependentServices: ["approval-queue-service", "policy-engine"],
    routes: ["/approvals", "/approval-chamber"],
    capabilities: ["approval_queue", "policy_evaluation", "decision_trace"],
    launchCriticality: "high",
    flagshipLoop: "admin-truth-recommendation-approval",
    duplicateRisk: "low",
    shadowServiceRisk: "low",
    notes: "Well-structured approval queue with mutations.",
  },
  {
    domain: "settings",
    displayName: "Settings & Account",
    primaryService: "settings-service",
    dependentServices: ["profile-service", "preference-service"],
    routes: ["/settings", "/settings/notifications"],
    capabilities: ["profile_edit", "notification_preferences", "account_management"],
    launchCriticality: "medium",
    flagshipLoop: null,
    duplicateRisk: "low",
    shadowServiceRisk: "low",
    notes: "Standard settings pattern.",
  },
  {
    domain: "admin-truth",
    displayName: "Admin OS & Launch Truth",
    primaryService: "admin-truth-service",
    dependentServices: ["launch-readiness-service", "reality-classification-service"],
    routes: ["/admin/dashboard", "/admin/truth-registry", "/admin/launch-readiness"],
    capabilities: ["truth_inspection", "launch_gate", "reality_classification"],
    launchCriticality: "high",
    flagshipLoop: "admin-truth-recommendation-approval",
    duplicateRisk: "high",
    shadowServiceRisk: "high",
    notes: "Large surface area. Many boards share similar data patterns. Primary consolidation target.",
  },
  {
    domain: "notifications",
    displayName: "Notifications & Calm Routing",
    primaryService: "notification-service",
    dependentServices: ["push-dispatch-service", "calm-routing-service", "preference-service"],
    routes: ["/notifications", "/settings/notifications"],
    capabilities: ["push_dispatch", "calm_routing", "delivery_receipts", "preference_management"],
    launchCriticality: "medium",
    flagshipLoop: null,
    duplicateRisk: "low",
    shadowServiceRisk: "low",
    notes: "Web push via VAPID. Apple deferred. Clean architecture.",
  },
  {
    domain: "ai-runtime",
    displayName: "AI Runtime & Gateway",
    primaryService: "ai-gateway-service",
    dependentServices: ["provider-health-service", "budget-policy-service", "receipt-service", "routing-service"],
    routes: ["/admin/aig/providers", "/admin/aig/models", "/admin/aig/routing"],
    capabilities: ["provider_routing", "budget_enforcement", "fallback_handling", "receipt_tracking"],
    launchCriticality: "critical",
    flagshipLoop: "files-ai-assist",
    duplicateRisk: "medium",
    shadowServiceRisk: "medium",
    notes: "SAG + AIG boards overlap somewhat. Gateway is canonical entry.",
  },
  {
    domain: "recommendation-execution",
    displayName: "Recommendation → Execution Loop",
    primaryService: "recommendation-loop-service",
    dependentServices: ["approval-service", "remediation-program-service", "outcome-verification-service"],
    routes: ["/admin/rex/intelligence", "/admin/rex/execution", "/admin/rex/outcomes"],
    capabilities: ["lifecycle_management", "execution_binding", "outcome_verification", "remediation_programs"],
    launchCriticality: "high",
    flagshipLoop: "admin-truth-recommendation-approval",
    duplicateRisk: "low",
    shadowServiceRisk: "low",
    notes: "New domain. Clean from the start.",
  },
];

export function getDomainByKey(domain: string) {
  return SERVICE_OWNERSHIP_REGISTRY.find((d) => d.domain === domain);
}

export function getDomainsByFlagshipLoop(loopKey: string) {
  return SERVICE_OWNERSHIP_REGISTRY.filter((d) => d.flagshipLoop === loopKey);
}

export function getHighRiskDomains() {
  return SERVICE_OWNERSHIP_REGISTRY.filter(
    (d) => d.duplicateRisk === "high" || d.shadowServiceRisk === "high"
  );
}
