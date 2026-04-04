// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Tier Manifest
// Canonical classification of every service in the platform
//
// TIER 1: Canonical platform organs — permanent named services
// TIER 2: Subdomains — internal modules inside Tier 1 services
// TIER 3: Infrastructure — internal infra/utility modules
// ISOLATED: Security/safety services with strict isolation boundary
// ═══════════════════════════════════════════════════════════════

export type ServiceTier = "tier-1" | "tier-2" | "tier-3" | "isolated";

export interface ServiceManifestEntry {
  id: string;
  name: string;
  tier: ServiceTier;
  parent?: string;
  description: string;
  isolationJustification?: string;
  contractFamilies: string[];
  consumers: string[];
}

export const SERVICE_MANIFEST: ServiceManifestEntry[] = [
  // ═══ TIER 1: Canonical Platform Organs ═══════════════════════

  // Control plane & execution spine
  { id: "api-gateway", name: "API Gateway", tier: "tier-1", description: "Request ingress, auth, rate limiting, routing", contractFamilies: ["core", "capability"], consumers: ["all-apps"] },
  { id: "policy-engine", name: "Policy Engine", tier: "tier-1", description: "Policy evaluation, rule matching, constraint enforcement", contractFamilies: ["core"], consumers: ["brain-core", "approval-service", "executor-service"] },
  { id: "approval-service", name: "Approval Service", tier: "tier-1", description: "Approval lifecycle, multi-approver, delegation, expiry", contractFamilies: ["approval"], consumers: ["executor-service", "admin", "mobile"] },
  { id: "capability-router", name: "Capability Router", tier: "tier-1", description: "Capability discovery, risk classification, routing", contractFamilies: ["capability"], consumers: ["brain-core", "executor-service"] },
  { id: "executor-service", name: "Executor Service", tier: "tier-1", description: "Idempotent execution, envelope management", contractFamilies: ["execution"], consumers: ["workflow-engine", "receipt-service"] },
  { id: "receipt-service", name: "Receipt Service", tier: "tier-1", description: "Receipt chain, hash-linked proof, audit trail", contractFamilies: ["proof"], consumers: ["verification-engine", "projection-service"] },
  { id: "verification-engine", name: "Verification Engine", tier: "tier-1", description: "Postcondition verification, proof validation", contractFamilies: ["proof"], consumers: ["receipt-service", "trust-state-service"] },
  { id: "workflow-engine", name: "Workflow Engine", tier: "tier-1", description: "Workflow state machine, transitions, retry", contractFamilies: ["core"], consumers: ["executor-service", "projection-service"] },

  // Event & projection infrastructure
  { id: "event-bus", name: "Event Bus", tier: "tier-1", description: "Pub/sub event backbone, dead-letter queue", contractFamilies: ["core"], consumers: ["all-services"] },
  { id: "projection-service", name: "Projection Service", tier: "tier-1", description: "Read-model builder from event streams", contractFamilies: ["read-models"], consumers: ["all-apps"] },

  // Identity, graph & trust
  { id: "entity-graph", name: "Entity Graph", tier: "tier-1", description: "Entity relationship graph", contractFamilies: ["graph"], consumers: ["identity", "role-permission-engine"] },
  { id: "identity-graph", name: "Identity Service", tier: "tier-1", description: "User/household/org identity management", contractFamilies: ["graph"], consumers: ["api-gateway", "entity-graph"] },
  { id: "role-permission-engine", name: "Role Permission Engine", tier: "tier-1", description: "RBAC/ABAC permission evaluation", contractFamilies: ["graph", "core"], consumers: ["api-gateway", "policy-engine"] },
  { id: "trust-state-service", name: "Trust State Service", tier: "tier-1", description: "Trust posture tracking, score management", contractFamilies: ["core"], consumers: ["policy-engine", "verification-engine"] },

  // Memory
  { id: "memory-service", name: "Memory Service", tier: "tier-1", description: "Governed memory storage, retrieval, correction", contractFamilies: ["memory"], consumers: ["brain-core", "advisor-services"] },

  // Connectors
  { id: "connector-control", name: "Connector Control Plane", tier: "tier-1", description: "Connector lifecycle, health, auth management", contractFamilies: ["specialized"], consumers: ["integration-concierge", "observability"] },
  { id: "connector-runners", name: "Connector Runners", tier: "tier-1", description: "Connector execution runtime", contractFamilies: ["specialized"], consumers: ["connector-control"] },

  // Observability & support
  { id: "observability", name: "Observability", tier: "tier-1", description: "Metrics, tracing, anomaly detection", contractFamilies: ["specialized"], consumers: ["admin", "support-diagnostics"] },
  { id: "support-diagnostics", name: "Support Diagnostics", tier: "tier-1", description: "Diagnostic bundle generation, support-safe export", contractFamilies: ["specialized"], consumers: ["admin"] },

  // Admin & owner
  { id: "admin-service", name: "Admin Service", tier: "tier-1", description: "Admin command execution, session management", contractFamilies: ["admin"], consumers: ["admin-app"] },

  // Domain OS surfaces
  { id: "analytics-service", name: "Analytics Service", tier: "tier-1", description: "Cross-domain analytics and reporting", contractFamilies: ["read-models"], consumers: ["all-apps"] },
  { id: "billing-service", name: "Billing Service", tier: "tier-1", description: "Subscription, usage metering, invoicing", contractFamilies: ["specialized"], consumers: ["admin", "finance-os"] },

  // ═══ TIER 2: Subdomains (internal modules) ═══════════════════

  { id: "governance-simulator", name: "Governance Simulator", tier: "tier-2", parent: "workflow-engine", description: "Policy simulation, what-if analysis", contractFamilies: ["runtime"], consumers: ["admin", "policy-engine"] },
  { id: "agent-orchestrator", name: "Agent Orchestrator", tier: "tier-2", parent: "capability-router", description: "AI agent lifecycle and orchestration", contractFamilies: ["advisor"], consumers: ["brain-core"] },
  { id: "lease-manager", name: "Lease Manager", tier: "tier-2", parent: "capability-router", description: "Capability lease issuance and validation", contractFamilies: ["capability"], consumers: ["executor-service"] },
  { id: "constitution-compiler", name: "Constitution Compiler", tier: "tier-2", parent: "policy-engine", description: "Personal constitution rule compilation", contractFamilies: ["core"], consumers: ["policy-engine"] },
  { id: "budget-automation", name: "Budget Automation", tier: "tier-2", parent: "billing-service", description: "Budget rules, auto-allocation, alerts", contractFamilies: ["specialized"], consumers: ["finance-os"] },
  { id: "payment-execution", name: "Payment Execution", tier: "tier-2", parent: "executor-service", description: "Payment-specific execution with idempotency", contractFamilies: ["execution"], consumers: ["billing-service"] },
  { id: "manifest-generator", name: "Manifest Generator", tier: "tier-2", parent: "capability-router", description: "Capability manifest generation and validation", contractFamilies: ["capability"], consumers: ["admin"] },
  { id: "self-learning-engine", name: "Self-Learning Engine", tier: "tier-2", parent: "memory-service", description: "Outcome tracking, pattern learning, drift detection", contractFamilies: ["memory"], consumers: ["brain-core"] },
  { id: "life-intelligence-engine", name: "Life Intelligence Engine", tier: "tier-2", parent: "memory-service", description: "Personal context and life-event intelligence", contractFamilies: ["memory", "specialized"], consumers: ["concierge-os"] },
  { id: "companion-engine", name: "Companion Engine", tier: "tier-2", parent: "memory-service", description: "Conversational companion context management", contractFamilies: ["advisor"], consumers: ["web-app"] },
  { id: "nlp-companion", name: "NLP Companion", tier: "tier-2", parent: "api-gateway", description: "Natural language parsing, intent extraction", contractFamilies: ["core"], consumers: ["web-app"] },
  { id: "productivity-engine", name: "Productivity Engine", tier: "tier-2", parent: "executor-service", description: "Focus sessions, task batching, time optimization", contractFamilies: ["specialized"], consumers: ["web-app"] },
  { id: "feature-proposal-engine", name: "Feature Proposal Engine", tier: "tier-2", parent: "admin-service", description: "Feature proposal lifecycle management", contractFamilies: ["specialized"], consumers: ["admin"] },
  { id: "investment-policy-rules", name: "Investment Policy Rules", tier: "tier-2", parent: "policy-engine", description: "Investment-specific policy rule evaluation", contractFamilies: ["core"], consumers: ["finance-os"] },
  { id: "file-ingestion", name: "File Ingestion", tier: "tier-2", parent: "memory-service", description: "Document/file ingestion and indexing", contractFamilies: ["specialized"], consumers: ["web-app"] },
  { id: "cloud-sync-manager", name: "Cloud Sync Manager", tier: "tier-2", parent: "connector-control", description: "Cloud storage sync orchestration", contractFamilies: ["specialized"], consumers: ["connector-runners"] },

  // ═══ TIER 3: Infrastructure / Utility Modules ════════════════

  { id: "search-fabric", name: "Search Fabric", tier: "tier-3", description: "Cross-domain search with faceting and privacy scoping", contractFamilies: ["specialized"], consumers: ["all-apps"] },
  { id: "document-system", name: "Document System", tier: "tier-3", description: "Document storage, templates, versioning", contractFamilies: ["specialized"], consumers: ["web-app", "admin"] },

  // ═══ ISOLATED: Security & Safety Cluster ═════════════════════

  { id: "fraud-sentinel", name: "Fraud Sentinel", tier: "isolated", description: "Anomaly detection, behavioral drift, fraud rules", isolationJustification: "Security-critical: must operate independently to prevent compromise propagation; requires independent audit trail and cannot be disabled by other services", contractFamilies: ["core"], consumers: ["policy-engine", "trust-state-service"] },
  { id: "self-healing", name: "Self-Healing Service", tier: "isolated", description: "Incident response, circuit breakers, quarantine, immune system", isolationJustification: "Safety-critical: emergency halt and circuit breaker authority must remain independent of normal service governance to prevent cascade failures", contractFamilies: ["specialized"], consumers: ["observability", "support-diagnostics"] },
  { id: "error-patrol", name: "Error Patrol", tier: "isolated", description: "Continuous error scanning, pattern detection, auto-remediation", isolationJustification: "Safety-critical: error detection must not be disabled or degraded by the services it monitors; requires independent execution context", contractFamilies: ["specialized"], consumers: ["self-healing", "observability"] },
];

// ── Lookup Helpers ──────────────────────────────────────────────

export function getServiceByTier(tier: ServiceTier): ServiceManifestEntry[] {
  return SERVICE_MANIFEST.filter(s => s.tier === tier);
}

export function getServiceById(id: string): ServiceManifestEntry | undefined {
  return SERVICE_MANIFEST.find(s => s.id === id);
}

export function getChildServices(parentId: string): ServiceManifestEntry[] {
  return SERVICE_MANIFEST.filter(s => s.parent === parentId);
}

export function getIsolatedServices(): ServiceManifestEntry[] {
  return SERVICE_MANIFEST.filter(s => s.tier === "isolated");
}

export function validateServiceImport(importerId: string, importedId: string): { valid: boolean; reason?: string } {
  const importer = getServiceById(importerId);
  const imported = getServiceById(importedId);
  if (!importer || !imported) return { valid: true };

  // Tier 3 should not import from Tier 2
  if (importer.tier === "tier-3" && imported.tier === "tier-2") {
    return { valid: false, reason: `Tier 3 infra "${importerId}" must not import Tier 2 subdomain "${importedId}"` };
  }

  // Isolated services should not be imported by Tier 2/3
  if (imported.tier === "isolated" && (importer.tier === "tier-2" || importer.tier === "tier-3")) {
    return { valid: false, reason: `"${importerId}" must not directly import isolated service "${importedId}"; use cluster facade` };
  }

  return { valid: true };
}