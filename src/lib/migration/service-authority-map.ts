// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Authority Map
// Machine-readable classification of every service directory into
// one of the 5 canonical layers of the Service Layer Constitution.
//
// Layers:
//   L1 PLATFORM_CANONICAL       — platform/infrastructure organs
//   L2 DOMAIN_CANONICAL         — business/domain logic
//   L3 INTEGRATION_ADAPTER      — external provider adapters
//   L4 PROJECTION_CANONICAL     — read-model / query shaping
//   L5 UI_CLIENT                — UI-facing data clients (mode-aware CRUD)
//
// Special states:
//   WRAPPER_COMPAT_ONLY         — thin re-export, scheduled for removal
//   DUPLICATE_MERGE_REQUIRED    — overlapping owner needs consolidation
//   SPLIT_REQUIRED              — multi-responsibility, must split
//   REMOVE_AFTER_SAFE_MIGRATION — slated for deletion
// ═══════════════════════════════════════════════════════════════

export type ServiceLayer =
  | "PLATFORM_CANONICAL"
  | "DOMAIN_CANONICAL"
  | "INTEGRATION_ADAPTER"
  | "PROJECTION_CANONICAL"
  | "UI_CLIENT"
  | "WRAPPER_COMPAT_ONLY"
  | "DUPLICATE_MERGE_REQUIRED"
  | "SPLIT_REQUIRED"
  | "REMOVE_AFTER_SAFE_MIGRATION";

export type ServiceRoot =
  | "src/lib/core-services"
  | "src/lib/services"
  | "src/lib/data-services"
  | "src/lib/engines"
  | "src/lib/boardroom"
  | "src/lib/ai"
  | "src/lib/advisor-intelligence"
  | "src/lib/domain-engines";

export interface ServiceAuthorityEntry {
  /** Directory or file name (relative to its root). */
  id: string;
  /** Owning root folder. */
  root: ServiceRoot;
  /** Canonical layer assignment. */
  layer: ServiceLayer;
  /** Domain/responsibility (e.g. "approval", "ai-routing", "boardroom"). */
  family: string;
  /** Plain-English purpose. */
  purpose: string;
  /** True when this entry IS the canonical owner of `family`. */
  canonical: boolean;
  /** When non-canonical, points to the canonical entry id. */
  redirectTo?: string;
  /** Notes on migration / mutation status. */
  notes?: string;
}

// ── Layer 1 — Platform Canonical (core-services) ───────────────
export const PLATFORM_AUTHORITY: ServiceAuthorityEntry[] = [
  { id: "policy-engine", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "policy", purpose: "Tenant policy evaluation + enforcement", canonical: true },
  { id: "executor-service", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "execution", purpose: "Sole canonical execution choke point", canonical: true },
  { id: "receipt-service", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "proof", purpose: "Receipt + proof emission", canonical: true },
  { id: "workflow-engine", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "workflow", purpose: "Workflow state-machine runtime", canonical: true },
  { id: "event-bus", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "events", purpose: "Domain event bus", canonical: true },
  { id: "approval-engine", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "approval", purpose: "Platform approval primitives", canonical: true },
  { id: "approval-service", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "approval-runtime", purpose: "Approval lifecycle service", canonical: true },
  { id: "trust-state-service", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "trust", purpose: "Trust-state authority", canonical: true },
  { id: "verification-engine", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "verification", purpose: "Verification pipeline", canonical: true },
  { id: "api-gateway", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "api-gateway", purpose: "Internal API gateway", canonical: true },
  { id: "capability-router", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "capability-routing", purpose: "Capability resolution + routing", canonical: true },
  { id: "memory-service", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "memory", purpose: "Memory abstraction", canonical: true },
  { id: "identity-graph", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "identity", purpose: "Identity graph kernel", canonical: true },
  { id: "identity-auth", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "auth", purpose: "Auth/session foundation", canonical: true },
  { id: "biometric-auth", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "biometric", purpose: "Biometric credential service", canonical: true },
  { id: "entity-graph", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "entity-graph", purpose: "Entity graph kernel", canonical: true },
  { id: "role-permission-engine", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "rbac", purpose: "Role/permission evaluation", canonical: true },
  { id: "brain-core", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "ai-runtime", purpose: "Generic reasoning/orchestration runtime", canonical: true },
  { id: "model-router", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "model-routing", purpose: "AI model router (sole canonical)", canonical: true },
  { id: "inference-gateway", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "inference", purpose: "Inference gateway", canonical: true },
  { id: "ai-gateway", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "ai-gateway", purpose: "Sovereign AI gateway", canonical: true },
  { id: "conscience-gate", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "conscience", purpose: "Conscience/safety gate", canonical: true },
  { id: "trust-governor", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "trust-governor", purpose: "Trust-tier governor", canonical: true },
  { id: "lease-manager", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "lease", purpose: "Lease/lock management", canonical: true },
  { id: "mnemosyne", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "mnemosyne", purpose: "Long-term memory store", canonical: true },
  { id: "constitution-compiler", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "constitution", purpose: "Constitution rule compiler", canonical: true },
  { id: "fraud-sentinel", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "fraud", purpose: "Fraud detection sentinel", canonical: true },
  { id: "self-healing", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "self-healing", purpose: "Self-healing + immune controller + fleet health", canonical: true },
  { id: "epistemic-firewall", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "epistemic", purpose: "Epistemic firewall", canonical: true },
  { id: "search-fabric", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "search", purpose: "Cross-domain search fabric", canonical: true },
  { id: "agent-orchestrator", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "orchestration", purpose: "Agent orchestrator (subordinate to OrchestrationFacade)", canonical: true },
  { id: "canonical-execution-path", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "execution-path", purpose: "Canonical execution path tracker", canonical: true },
  { id: "canonical-chain-orchestrator", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "execution-chain", purpose: "Canonical chain orchestrator", canonical: true },
  { id: "canonical-pipeline", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "pipeline", purpose: "Canonical pipeline runtime", canonical: true },
  { id: "executor-service-dir", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "execution-runtime", purpose: "Executor service runtime helpers", canonical: true },
  { id: "service-tier-manifest", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "service-registry", purpose: "Service tier manifest authority", canonical: true },
  { id: "manifest-generator", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "manifests", purpose: "Manifest generation runtime", canonical: true },
  { id: "kernel", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "kernel", purpose: "Kernel infra helpers", canonical: true },
  { id: "frontend", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "frontend-runtime", purpose: "Frontend runtime helpers", canonical: true },
  { id: "handoff", root: "src/lib/core-services", layer: "PLATFORM_CANONICAL", family: "handoff", purpose: "Cross-runtime handoff", canonical: true },
];

// ── Layer 2 — Domain Canonical (services + engines) ────────────
export const DOMAIN_AUTHORITY: ServiceAuthorityEntry[] = [
  { id: "boardroom-service", root: "src/lib/services", layer: "DOMAIN_CANONICAL", family: "boardroom", purpose: "Boardroom domain service", canonical: true },
  { id: "business-os", root: "src/lib/services", layer: "DOMAIN_CANONICAL", family: "business", purpose: "Business OS domain logic", canonical: true },
  { id: "concierge-os", root: "src/lib/services", layer: "DOMAIN_CANONICAL", family: "concierge", purpose: "Concierge OS domain logic", canonical: true },
  { id: "finance-os", root: "src/lib/services", layer: "DOMAIN_CANONICAL", family: "money", purpose: "Money/finance domain", canonical: true },
  { id: "communication-service", root: "src/lib/services", layer: "DOMAIN_CANONICAL", family: "communications", purpose: "Communication domain", canonical: true },
  { id: "advisor-knowledge", root: "src/lib/services", layer: "DOMAIN_CANONICAL", family: "advisor-knowledge", purpose: "Advisor knowledge domain", canonical: true },
  { id: "advisor-memory", root: "src/lib/services", layer: "DOMAIN_CANONICAL", family: "advisor-memory", purpose: "Advisor memory domain", canonical: true },
  { id: "advisor-feedback", root: "src/lib/services", layer: "DOMAIN_CANONICAL", family: "advisor-feedback", purpose: "Advisor feedback domain", canonical: true },
  { id: "ai-economics", root: "src/lib/services", layer: "DOMAIN_CANONICAL", family: "ai-economics", purpose: "AI economics domain", canonical: true },
  { id: "engines/*", root: "src/lib/engines", layer: "DOMAIN_CANONICAL", family: "domain-engines", purpose: "All 60 domain engines (lead-scoring, planning, profitability, advisor-orchestration, etc.)", canonical: true, notes: "Classified as domain logic; pure functions over canonical state" },
  { id: "boardroom/*", root: "src/lib/boardroom", layer: "DOMAIN_CANONICAL", family: "boardroom-packets", purpose: "Boardroom packet generation", canonical: true },
  { id: "advisor-intelligence/*", root: "src/lib/advisor-intelligence", layer: "DOMAIN_CANONICAL", family: "advisor-intelligence", purpose: "Advisor evaluation + recommendation intelligence", canonical: true },
  { id: "domain-engines/*", root: "src/lib/domain-engines", layer: "DOMAIN_CANONICAL", family: "domain-os-adapters", purpose: "Domain OS adapter engines", canonical: true },
];

// ── Layer 3 — Integration Adapters ─────────────────────────────
export const INTEGRATION_AUTHORITY: ServiceAuthorityEntry[] = [
  { id: "connector-runners", root: "src/lib/core-services", layer: "INTEGRATION_ADAPTER", family: "connector-runtime", purpose: "Connector execution runtime", canonical: true },
  { id: "connector-control", root: "src/lib/core-services", layer: "INTEGRATION_ADAPTER", family: "connector-control", purpose: "Connector control plane primitives", canonical: true },
  { id: "connector-health-service", root: "src/lib/core-services", layer: "INTEGRATION_ADAPTER", family: "connector-health", purpose: "Connector health probes", canonical: true },
  { id: "google-provider-family", root: "src/lib/core-services", layer: "INTEGRATION_ADAPTER", family: "google-providers", purpose: "Google provider family adapters", canonical: true },
  { id: "integration-hub", root: "src/lib/core-services", layer: "INTEGRATION_ADAPTER", family: "integration-hub", purpose: "Integration hub adapter", canonical: true },
  { id: "connector-control-plane", root: "src/lib/services", layer: "INTEGRATION_ADAPTER", family: "connector-control-plane", purpose: "Connector control-plane facade", canonical: true },
  { id: "connector-runners-svc", root: "src/lib/services", layer: "INTEGRATION_ADAPTER", family: "connector-runners-svc", purpose: "Higher-level connector runner facade", canonical: true },
  { id: "connector-truth", root: "src/lib/services", layer: "INTEGRATION_ADAPTER", family: "connector-truth", purpose: "Connector truth registry", canonical: true },
  { id: "cloud-control-plane-infra", root: "src/lib/services", layer: "INTEGRATION_ADAPTER", family: "cloud-infra", purpose: "Cloud control-plane infra adapters", canonical: true },
];

// ── Layer 4 — Projection / Read-Model ──────────────────────────
export const PROJECTION_AUTHORITY: ServiceAuthorityEntry[] = [
  { id: "projection-service", root: "src/lib/core-services", layer: "PROJECTION_CANONICAL", family: "projection-runtime", purpose: "Projection runtime primitives", canonical: true },
  { id: "projection-service-svc", root: "src/lib/services", layer: "PROJECTION_CANONICAL", family: "projections", purpose: "Domain projection services (boardroom, money, business, …)", canonical: true },
  { id: "audit-trail-timeline", root: "src/lib/services", layer: "PROJECTION_CANONICAL", family: "audit-projections", purpose: "Audit trail read model", canonical: true },
  { id: "truth-indices", root: "src/lib/services", layer: "PROJECTION_CANONICAL", family: "truth-indices", purpose: "Truth-index projections", canonical: true },
];

// ── Layer 5 — UI Clients (data-services) ───────────────────────
export const CLIENT_AUTHORITY: ServiceAuthorityEntry[] = [
  { id: "data-services/*", root: "src/lib/data-services", layer: "UI_CLIENT", family: "ui-data-clients", purpose: "33 mode-aware Supabase CRUD clients (fetchCustomers, fetchInvestments, …)", canonical: true, notes: "These are NOT services — they are UI data clients (Layer 5)" },
];

// ── Wrappers (compat-only re-exports) ──────────────────────────
export const WRAPPER_REGISTRY: ServiceAuthorityEntry[] = [
  { id: "approval-engine", root: "src/lib/services", layer: "WRAPPER_COMPAT_ONLY", family: "approval", purpose: "Re-export of core-services/approval-engine", canonical: false, redirectTo: "core-services/approval-engine" },
  { id: "brain-core", root: "src/lib/services", layer: "WRAPPER_COMPAT_ONLY", family: "ai-runtime", purpose: "Re-export of core-services/brain-core", canonical: false, redirectTo: "core-services/brain-core" },
  { id: "conscience-gate", root: "src/lib/services", layer: "WRAPPER_COMPAT_ONLY", family: "conscience", purpose: "Re-export of core-services/conscience-gate", canonical: false, redirectTo: "core-services/conscience-gate" },
  { id: "constitution-compiler", root: "src/lib/services", layer: "WRAPPER_COMPAT_ONLY", family: "constitution", purpose: "Re-export of core-services/constitution-compiler", canonical: false, redirectTo: "core-services/constitution-compiler" },
  { id: "immune-controller", root: "src/lib/services", layer: "WRAPPER_COMPAT_ONLY", family: "self-healing", purpose: "Re-export from core-services/self-healing", canonical: false, redirectTo: "core-services/self-healing" },
  { id: "inference-gateway", root: "src/lib/services", layer: "WRAPPER_COMPAT_ONLY", family: "inference", purpose: "Re-export of core-services/inference-gateway", canonical: false, redirectTo: "core-services/inference-gateway" },
  { id: "lease-manager", root: "src/lib/services", layer: "WRAPPER_COMPAT_ONLY", family: "lease", purpose: "Re-export of core-services/lease-manager", canonical: false, redirectTo: "core-services/lease-manager" },
  { id: "mnemosyne", root: "src/lib/services", layer: "WRAPPER_COMPAT_ONLY", family: "mnemosyne", purpose: "Re-export of core-services/mnemosyne", canonical: false, redirectTo: "core-services/mnemosyne" },
  { id: "model-router", root: "src/lib/services", layer: "WRAPPER_COMPAT_ONLY", family: "model-routing", purpose: "Re-export of core-services/model-router", canonical: false, redirectTo: "core-services/model-router" },
  { id: "trust-governor", root: "src/lib/services", layer: "WRAPPER_COMPAT_ONLY", family: "trust-governor", purpose: "Re-export of core-services/trust-governor", canonical: false, redirectTo: "core-services/trust-governor" },
];

// ── Composite registry ─────────────────────────────────────────
export const SERVICE_AUTHORITY_MAP: ServiceAuthorityEntry[] = [
  ...PLATFORM_AUTHORITY,
  ...DOMAIN_AUTHORITY,
  ...INTEGRATION_AUTHORITY,
  ...PROJECTION_AUTHORITY,
  ...CLIENT_AUTHORITY,
  ...WRAPPER_REGISTRY,
];

export function getCanonicalOwner(family: string): ServiceAuthorityEntry | undefined {
  return SERVICE_AUTHORITY_MAP.find(e => e.family === family && e.canonical);
}

export function getAuthorityByLayer(layer: ServiceLayer): ServiceAuthorityEntry[] {
  return SERVICE_AUTHORITY_MAP.filter(e => e.layer === layer);
}

export const SERVICE_AUTHORITY_SUMMARY = {
  totalEntries: SERVICE_AUTHORITY_MAP.length,
  platformCanonical: PLATFORM_AUTHORITY.length,
  domainCanonical: DOMAIN_AUTHORITY.length,
  integrationAdapter: INTEGRATION_AUTHORITY.length,
  projectionCanonical: PROJECTION_AUTHORITY.length,
  uiClient: CLIENT_AUTHORITY.length,
  wrapperCompat: WRAPPER_REGISTRY.length,
};
