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

// ═══════════════════════════════════════════════════════════════
// Duplicate Cluster Resolutions
// ═══════════════════════════════════════════════════════════════

export type ClusterRole = "canonical" | "adapter" | "supporting" | "deprecated" | "transitional";

export interface ClusterResolution {
  clusterKey: string;
  clusterName: string;
  domain: string;
  canonical: string;
  adapters: string[];
  deprecated: string[];
  transitional: string[];
  rationale: string;
  riskLevel: "high" | "medium" | "low";
  migrationStatus: "not-started" | "in-progress" | "complete";
}

export const DUPLICATE_CLUSTER_RESOLUTIONS: ClusterResolution[] = [
  {
    clusterKey: "ai-gateway",
    clusterName: "AI Gateway / Inference",
    domain: "ai-runtime",
    canonical: "ai-gateway",
    adapters: ["brain-core", "model-router", "capability-router"],
    deprecated: ["personal-operating-model", "ai-memory-graph"],
    transitional: ["prompt-assembler"],
    rationale: "ai-gateway is the single canonical inference entry. brain-core is an edge function adapter. model-router/capability-router feed routing decisions.",
    riskLevel: "high",
    migrationStatus: "in-progress",
  },
  {
    clusterKey: "notifications",
    clusterName: "Notification Dispatch & Routing",
    domain: "notifications",
    canonical: "notifications",
    adapters: ["push-notification", "messaging-gateway"],
    deprecated: [],
    transitional: ["communication-service"],
    rationale: "notifications owns queue/routing/preferences. push-notification handles VAPID dispatch. messaging-gateway is transitional for multi-channel.",
    riskLevel: "medium",
    migrationStatus: "in-progress",
  },
  {
    clusterKey: "observability",
    clusterName: "Observability & Fleet Health",
    domain: "admin-truth",
    canonical: "observability",
    adapters: ["observability-hub", "fleet-health", "fleet"],
    deprecated: ["performance-monitor", "golden-trace-runner"],
    transitional: ["support-diagnostics"],
    rationale: "observability is the canonical telemetry layer. observability-hub is a thin re-export. fleet/fleet-health are surface adapters for admin boards.",
    riskLevel: "medium",
    migrationStatus: "not-started",
  },
  {
    clusterKey: "finance",
    clusterName: "Finance / Revenue / Billing",
    domain: "finance",
    canonical: "finance-os",
    adapters: ["billing", "revenue-growth", "payment-execution-service"],
    deprecated: ["revenue-leak-detector", "revenue-autopilot", "capital-allocation", "revenue-ticker"],
    transitional: ["sovereign-calculation", "projection-service"],
    rationale: "finance-os is the canonical financial domain. billing handles Stripe integration. Revenue-* services are speculative and should merge or deprecate.",
    riskLevel: "high",
    migrationStatus: "not-started",
  },
  {
    clusterKey: "self-healing",
    clusterName: "Self-Healing / Immune / Auto-Remediation",
    domain: "admin-truth",
    canonical: "self-healing",
    adapters: ["verification-engine", "proof-orchestrator"],
    deprecated: ["emergency-halt", "operating-autopilot"],
    transitional: ["auto-proposal"],
    rationale: "self-healing is canonical with immune-controller as re-export. verification-engine and proof-orchestrator are legitimate adapters. emergency-halt and operating-autopilot are speculative.",
    riskLevel: "medium",
    migrationStatus: "in-progress",
  },
  {
    clusterKey: "connectors",
    clusterName: "Connector / Integration / Provider",
    domain: "connectors",
    canonical: "connector-control-plane",
    adapters: ["connector-runners", "connector-truth", "google-provider-family"],
    deprecated: ["connector-health-service.ts"],
    transitional: ["connector-truth"],
    rationale: "connector-control-plane is the canonical orchestrator. google-provider-family is the identity/OAuth adapter. connector-runners execute sync. Single-file services should merge.",
    riskLevel: "medium",
    migrationStatus: "in-progress",
  },
];

export function getClusterByKey(key: string) {
  return DUPLICATE_CLUSTER_RESOLUTIONS.find((c) => c.clusterKey === key);
}

export function getHighRiskClusters() {
  return DUPLICATE_CLUSTER_RESOLUTIONS.filter((c) => c.riskLevel === "high");
}

// ═══════════════════════════════════════════════════════════════
// Anti-Sprawl Governance Rules
// ═══════════════════════════════════════════════════════════════

export interface AntiSprawlRule {
  ruleKey: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium";
  enforcementStatus: "enforced" | "advisory" | "planned";
  appliesTo: string;
}

export const ANTI_SPRAWL_RULES: AntiSprawlRule[] = [
  {
    ruleKey: "no-speculative-gateways",
    title: "No New Gateway Services Without Justification",
    description: "Do not create new gateway/router/orchestrator services. Use the canonical gateway for that domain (e.g., ai-gateway for AI, connector-control-plane for connectors).",
    severity: "critical",
    enforcementStatus: "enforced",
    appliesTo: "all domains",
  },
  {
    ruleKey: "pages-not-services",
    title: "Pages Must Not Own Domain Logic",
    description: "UI pages should orchestrate, not implement business logic. Domain logic belongs in service modules, not in page components or hooks.",
    severity: "high",
    enforcementStatus: "advisory",
    appliesTo: "all pages",
  },
  {
    ruleKey: "explicit-ownership",
    title: "Every Service Must Have an Explicit Domain Owner",
    description: "New service directories must be mapped to a domain in the ownership registry before creation. Orphan services are not acceptable.",
    severity: "high",
    enforcementStatus: "advisory",
    appliesTo: "src/lib/services/*",
  },
  {
    ruleKey: "no-direct-provider-calls",
    title: "No Direct Provider Calls from UI for Critical Flows",
    description: "Critical workflows (auth, payments, AI inference, file operations) must go through domain services, not call providers directly from components.",
    severity: "high",
    enforcementStatus: "advisory",
    appliesTo: "flagship loops",
  },
  {
    ruleKey: "canonical-entry-points",
    title: "Major Actions Need Canonical Entry Points",
    description: "Every flagship action must have exactly one canonical service entry point. Shadow paths must be documented and deprecated over time.",
    severity: "critical",
    enforcementStatus: "enforced",
    appliesTo: "flagship loops",
  },
  {
    ruleKey: "budget-compliance",
    title: "Service Count Must Not Exceed Domain Budget",
    description: "Total service directories must stay within the budget of 90. New services require justification if the budget is already exceeded.",
    severity: "medium",
    enforcementStatus: "enforced",
    appliesTo: "src/lib/services/*",
  },
];

// ═══════════════════════════════════════════════════════════════
// Service Directory Classification
// ═══════════════════════════════════════════════════════════════

export type DirectoryClass = "canonical" | "supporting" | "speculative" | "re-export" | "deprecated-candidate";

export interface ServiceDirectoryClassification {
  directory: string;
  classification: DirectoryClass;
  domain: string;
}

export const SERVICE_DIRECTORY_CLASSIFICATION: ServiceDirectoryClassification[] = [
  // ── Canonical (~30) ──
  { directory: "auth", classification: "canonical", domain: "auth" },
  { directory: "profiles", classification: "canonical", domain: "auth" },
  { directory: "ai-gateway", classification: "canonical", domain: "ai-runtime" },
  { directory: "brain-core", classification: "canonical", domain: "ai-runtime" },
  { directory: "notifications", classification: "canonical", domain: "notifications" },
  { directory: "push-notification", classification: "canonical", domain: "notifications" },
  { directory: "connector-control-plane", classification: "canonical", domain: "connectors" },
  { directory: "connector-runners", classification: "canonical", domain: "connectors" },
  { directory: "google-provider-family", classification: "canonical", domain: "connectors" },
  { directory: "boardroom-service", classification: "canonical", domain: "boardroom" },
  { directory: "finance-os", classification: "canonical", domain: "finance" },
  { directory: "billing", classification: "canonical", domain: "finance" },
  { directory: "approval-engine", classification: "canonical", domain: "approvals" },
  { directory: "recommendation-execution", classification: "canonical", domain: "recommendation-execution" },
  { directory: "self-healing", classification: "canonical", domain: "admin-truth" },
  { directory: "observability", classification: "canonical", domain: "admin-truth" },
  { directory: "verification-engine", classification: "canonical", domain: "admin-truth" },
  { directory: "flagship-loops", classification: "canonical", domain: "admin-truth" },
  { directory: "service-registry", classification: "canonical", domain: "admin-truth" },
  { directory: "truth-indices", classification: "canonical", domain: "admin-truth" },
  { directory: "admin-service", classification: "canonical", domain: "admin-truth" },
  { directory: "file-ingestion", classification: "canonical", domain: "files" },
  { directory: "document-engine", classification: "canonical", domain: "files" },
  { directory: "preferences", classification: "canonical", domain: "settings" },
  { directory: "onboarding", classification: "canonical", domain: "settings" },
  { directory: "database", classification: "canonical", domain: "platform" },
  { directory: "analytics", classification: "canonical", domain: "platform" },
  { directory: "event-bus", classification: "canonical", domain: "platform" },
  { directory: "policy-engine", classification: "canonical", domain: "platform" },
  { directory: "search-fabric", classification: "canonical", domain: "platform" },

  // ── Supporting (~25) ──
  { directory: "model-router", classification: "supporting", domain: "ai-runtime" },
  { directory: "capability-router", classification: "supporting", domain: "ai-runtime" },
  { directory: "prompt-assembler", classification: "supporting", domain: "ai-runtime" },
  // groundedness-gate — DELETED, consolidated into conscience-gate/
  { directory: "receipt-service", classification: "supporting", domain: "ai-runtime" },
  { directory: "ai-workforce", classification: "supporting", domain: "ai-runtime" },
  { directory: "ai-economics", classification: "supporting", domain: "ai-runtime" },
  { directory: "connector-truth", classification: "supporting", domain: "connectors" },
  { directory: "fleet", classification: "supporting", domain: "admin-truth" },
  { directory: "fleet-health", classification: "supporting", domain: "admin-truth" },
  { directory: "proof-orchestrator", classification: "supporting", domain: "admin-truth" },
  { directory: "launch-gate", classification: "supporting", domain: "admin-truth" },
  { directory: "demo-governance", classification: "supporting", domain: "platform" },
  { directory: "identity", classification: "supporting", domain: "auth" },
  { directory: "identity-auth", classification: "supporting", domain: "auth" },
  { directory: "session-resume", classification: "supporting", domain: "auth" },
  { directory: "messaging-gateway", classification: "supporting", domain: "notifications" },
  { directory: "payment-execution-service", classification: "supporting", domain: "finance" },
  { directory: "projection-service", classification: "supporting", domain: "finance" },
  { directory: "projections", classification: "supporting", domain: "finance" },
  { directory: "audit-ledger", classification: "supporting", domain: "platform" },
  { directory: "audit-trail-timeline", classification: "supporting", domain: "platform" },
  { directory: "keyvault", classification: "supporting", domain: "platform" },
  { directory: "i18n", classification: "supporting", domain: "platform" },
  { directory: "workflow-engine", classification: "supporting", domain: "platform" },

  // ── Re-export / Thin Wrapper (~10) ──
  { directory: "observability-hub", classification: "re-export", domain: "admin-truth" },
  { directory: "os-unification", classification: "re-export", domain: "platform" },
  { directory: "os-awareness", classification: "re-export", domain: "platform" },
  { directory: "domain-runtime", classification: "re-export", domain: "platform" },
  { directory: "sita-modes", classification: "re-export", domain: "platform" },
  { directory: "surface-detection", classification: "re-export", domain: "platform" },
  { directory: "surface-portability", classification: "re-export", domain: "platform" },
  { directory: "boot-persistence", classification: "re-export", domain: "platform" },
  { directory: "platform-readiness", classification: "re-export", domain: "platform" },
  { directory: "handoff", classification: "re-export", domain: "platform" },

  // ── Speculative (~50) ──
  { directory: "digital-twins", classification: "speculative", domain: "business-os" },
  { directory: "digital-legacy-vault", classification: "speculative", domain: "business-os" },
  { directory: "family-command-center", classification: "speculative", domain: "business-os" },
  { directory: "family-constitution", classification: "speculative", domain: "business-os" },
  { directory: "life-growth", classification: "speculative", domain: "business-os" },
  { directory: "life-score", classification: "speculative", domain: "business-os" },
  { directory: "life-simulation", classification: "speculative", domain: "business-os" },
  { directory: "compound-life-score", classification: "speculative", domain: "business-os" },
  { directory: "habit-tracker", classification: "speculative", domain: "business-os" },
  { directory: "relationship-intelligence", classification: "speculative", domain: "business-os" },
  { directory: "voice-command", classification: "speculative", domain: "platform" },
  { directory: "biometric-auth", classification: "speculative", domain: "auth" },
  { directory: "duress-detection", classification: "speculative", domain: "auth" },
  { directory: "edge-device-runtime", classification: "speculative", domain: "platform" },
  { directory: "cloud-control-plane-infra", classification: "speculative", domain: "platform" },
  { directory: "enterprise-control-plane", classification: "speculative", domain: "platform" },
  { directory: "tenant-firewall", classification: "speculative", domain: "platform" },
  { directory: "entity-graph", classification: "speculative", domain: "platform" },
  { directory: "opportunity-engine", classification: "speculative", domain: "business-os" },
  { directory: "opportunity-graph", classification: "speculative", domain: "business-os" },
  { directory: "opportunity-radar", classification: "speculative", domain: "business-os" },
  { directory: "autonomous-negotiation", classification: "speculative", domain: "business-os" },
  { directory: "competitive-intelligence", classification: "speculative", domain: "business-os" },
  { directory: "client-sentiment", classification: "speculative", domain: "business-os" },
  { directory: "booking-scheduling", classification: "speculative", domain: "business-os" },
  { directory: "website-management", classification: "speculative", domain: "business-os" },
  { directory: "widget-marketplace", classification: "speculative", domain: "platform" },
  { directory: "sovereign-time", classification: "speculative", domain: "business-os" },
  { directory: "sovereign-exporter", classification: "speculative", domain: "business-os" },
  { directory: "time-wealth", classification: "speculative", domain: "business-os" },
  { directory: "timeline-calendar", classification: "speculative", domain: "business-os" },
  { directory: "predictive-intent", classification: "speculative", domain: "ai-runtime" },
  { directory: "predictive-needs", classification: "speculative", domain: "ai-runtime" },
  { directory: "natural-language-policy", classification: "speculative", domain: "ai-runtime" },
  { directory: "multi-agent-debate", classification: "speculative", domain: "ai-runtime" },
  { directory: "council-orchestrator", classification: "speculative", domain: "ai-runtime" },
  { directory: "mnemosyne", classification: "speculative", domain: "ai-runtime" },
  { directory: "memory-service", classification: "speculative", domain: "ai-runtime" },
  { directory: "self-learning", classification: "speculative", domain: "ai-runtime" },
  { directory: "simulator", classification: "speculative", domain: "platform" },
  { directory: "governance-simulator", classification: "speculative", domain: "platform" },
  { directory: "pack-management-service", classification: "speculative", domain: "business-os" },
  { directory: "personal-operating-model", classification: "speculative", domain: "business-os" },
  { directory: "personalization-engine", classification: "speculative", domain: "platform" },
  { directory: "decision-intelligence", classification: "speculative", domain: "ai-runtime" },
  { directory: "attribution-analytics", classification: "speculative", domain: "platform" },
  { directory: "fleet-ota", classification: "speculative", domain: "platform" },
  { directory: "trusted-device", classification: "speculative", domain: "auth" },
  { directory: "document-signature", classification: "speculative", domain: "files" },

  // ── Deprecated Candidates (~20) ──
  { directory: "revenue-leak-detector", classification: "deprecated-candidate", domain: "finance" },
  { directory: "revenue-autopilot", classification: "deprecated-candidate", domain: "finance" },
  { directory: "revenue-ticker", classification: "deprecated-candidate", domain: "finance" },
  { directory: "capital-allocation", classification: "deprecated-candidate", domain: "finance" },
  { directory: "revenue-growth", classification: "deprecated-candidate", domain: "finance" },
  { directory: "emergency-halt", classification: "deprecated-candidate", domain: "admin-truth" },
  { directory: "operating-autopilot", classification: "deprecated-candidate", domain: "admin-truth" },
  { directory: "performance-monitor", classification: "deprecated-candidate", domain: "admin-truth" },
  { directory: "golden-trace-runner", classification: "deprecated-candidate", domain: "admin-truth" },
  { directory: "sovereign-calculation", classification: "deprecated-candidate", domain: "finance" },
  { directory: "ai-memory-graph", classification: "deprecated-candidate", domain: "ai-runtime" },
  { directory: "communication-service", classification: "deprecated-candidate", domain: "notifications" },
  { directory: "connector-health-service.ts", classification: "deprecated-candidate", domain: "connectors" },
  { directory: "realtime-gateway", classification: "deprecated-candidate", domain: "platform" },
  { directory: "offline-queue", classification: "deprecated-candidate", domain: "platform" },
  { directory: "offline-sync", classification: "deprecated-candidate", domain: "platform" },
  { directory: "system-updates", classification: "deprecated-candidate", domain: "platform" },
  { directory: "fraud-sentinel", classification: "deprecated-candidate", domain: "platform" },
  { directory: "intent-inbox", classification: "deprecated-candidate", domain: "ai-runtime" },
  { directory: "legacy-planning", classification: "deprecated-candidate", domain: "business-os" },
];

export function getDirectoryClassification(dir: string) {
  return SERVICE_DIRECTORY_CLASSIFICATION.find((d) => d.directory === dir);
}

export function getDirectoriesByClass(cls: DirectoryClass) {
  return SERVICE_DIRECTORY_CLASSIFICATION.filter((d) => d.classification === cls);
}

export function getClassificationSummary() {
  const counts: Record<DirectoryClass, number> = {
    canonical: 0, supporting: 0, speculative: 0, "re-export": 0, "deprecated-candidate": 0,
  };
  for (const d of SERVICE_DIRECTORY_CLASSIFICATION) {
    counts[d.classification]++;
  }
  return { ...counts, total: SERVICE_DIRECTORY_CLASSIFICATION.length, budget: 90 };
}

