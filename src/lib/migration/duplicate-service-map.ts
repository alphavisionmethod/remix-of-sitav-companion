// ═══════════════════════════════════════════════════════════════
// SITA OS — Duplicate Service Family Map
// One row per family that appears in BOTH core-services/ and services/.
// Each row names the canonical winner and the merge strategy.
// ═══════════════════════════════════════════════════════════════

export type MergeStrategy =
  | "WRAPPER_REEXPORT"     // services/ keeps a thin re-export from core-services/
  | "DOMAIN_SPLIT"         // core-services/ owns infra; services/ owns domain logic
  | "PLATFORM_OWNER"       // core-services/ is sole owner; services/ entry should be removed
  | "DOMAIN_OWNER"         // services/ is sole owner; core-services/ entry is platform-only sibling
  | "ALREADY_CONSOLIDATED" // duplication is benign (e.g. __tests__, index.ts shells)
  | "NEEDS_AUDIT";         // requires manual classification

export interface DuplicateFamilyEntry {
  family: string;
  coreServicesPath: string;
  servicesPath: string;
  canonicalWinner: "core-services" | "services" | "BOTH";
  strategy: MergeStrategy;
  rationale: string;
}

export const DUPLICATE_SERVICE_MAP: DuplicateFamilyEntry[] = [
  // ── Pure wrapper families (services/ re-exports core-services/) ──
  { family: "approval-engine",         coreServicesPath: "core-services/approval-engine",         servicesPath: "services/approval-engine",         canonicalWinner: "core-services", strategy: "WRAPPER_REEXPORT", rationale: "Platform approval primitives — services/ is a thin re-export shim." },
  { family: "brain-core",              coreServicesPath: "core-services/brain-core",              servicesPath: "services/brain-core",              canonicalWinner: "core-services", strategy: "WRAPPER_REEXPORT", rationale: "Generic AI runtime — single source of truth in core-services." },
  { family: "conscience-gate",         coreServicesPath: "core-services/conscience-gate",         servicesPath: "services/conscience-gate",         canonicalWinner: "core-services", strategy: "WRAPPER_REEXPORT", rationale: "Safety gate is platform infra." },
  { family: "constitution-compiler",   coreServicesPath: "core-services/constitution-compiler",   servicesPath: "services/constitution-compiler",   canonicalWinner: "core-services", strategy: "WRAPPER_REEXPORT", rationale: "Constitution compilation is platform-level." },
  { family: "inference-gateway",       coreServicesPath: "core-services/inference-gateway",       servicesPath: "services/inference-gateway",       canonicalWinner: "core-services", strategy: "WRAPPER_REEXPORT", rationale: "Single inference gateway." },
  { family: "lease-manager",           coreServicesPath: "core-services/lease-manager",           servicesPath: "services/lease-manager",           canonicalWinner: "core-services", strategy: "WRAPPER_REEXPORT", rationale: "Single lease manager." },
  { family: "mnemosyne",               coreServicesPath: "core-services/mnemosyne",               servicesPath: "services/mnemosyne",               canonicalWinner: "core-services", strategy: "WRAPPER_REEXPORT", rationale: "Single long-term memory store." },
  { family: "model-router",            coreServicesPath: "core-services/model-router",            servicesPath: "services/model-router",            canonicalWinner: "core-services", strategy: "WRAPPER_REEXPORT", rationale: "Single canonical model router." },
  { family: "trust-governor",          coreServicesPath: "core-services/trust-governor",          servicesPath: "services/trust-governor",          canonicalWinner: "core-services", strategy: "WRAPPER_REEXPORT", rationale: "Single trust governor." },
  { family: "immune-controller",       coreServicesPath: "core-services/self-healing/immune-controller", servicesPath: "services/immune-controller",       canonicalWinner: "core-services", strategy: "WRAPPER_REEXPORT", rationale: "Embedded inside self-healing cluster." },

  // ── Domain split families (both keep distinct responsibilities) ──
  { family: "ai-gateway",              coreServicesPath: "core-services/ai-gateway",              servicesPath: "services/ai-gateway",              canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "core-services/: gateway runtime; services/: domain helpers." },
  { family: "ai-workforce",            coreServicesPath: "core-services/ai-workforce",            servicesPath: "services/ai-workforce",            canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Platform workforce engine vs domain workforce orchestration." },
  { family: "biometric-auth",          coreServicesPath: "core-services/biometric-auth",          servicesPath: "services/biometric-auth",          canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Auth primitives vs biometric domain integration." },
  { family: "capability-router",       coreServicesPath: "core-services/capability-router",       servicesPath: "services/capability-router",       canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Routing engine vs capability registry consumers." },
  { family: "event-bus",               coreServicesPath: "core-services/event-bus",               servicesPath: "services/event-bus",               canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Bus primitives vs domain pub/sub helpers." },
  { family: "executor-service",        coreServicesPath: "core-services/executor-service",        servicesPath: "services/executor-service",        canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Sole choke point + domain wrappers." },
  { family: "memory-service",          coreServicesPath: "core-services/memory-service",          servicesPath: "services/memory-service",          canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Memory abstraction + domain memory facets." },
  { family: "policy-engine",           coreServicesPath: "core-services/policy-engine",           servicesPath: "services/policy-engine",           canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Engine vs domain policy bindings." },
  { family: "projection-service",      coreServicesPath: "core-services/projection-service",      servicesPath: "services/projection-service",      canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Projection runtime vs domain projections." },
  { family: "receipt-service",         coreServicesPath: "core-services/receipt-service",         servicesPath: "services/receipt-service",         canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Proof emitter vs domain receipt helpers." },
  { family: "verification-engine",     coreServicesPath: "core-services/verification-engine",     servicesPath: "services/verification-engine",     canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Pipeline + domain verifications." },
  { family: "workflow-engine",         coreServicesPath: "core-services/workflow-engine",         servicesPath: "services/workflow-engine",         canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "State machine + domain workflows." },
  { family: "identity-auth",           coreServicesPath: "core-services/identity-auth",           servicesPath: "services/identity-auth",           canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Auth primitives + identity domain." },
  { family: "security",                coreServicesPath: "core-services/security",                servicesPath: "services/security",                canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Security infra (firewall/vault) + domain security clients." },
  { family: "self-healing",            coreServicesPath: "core-services/self-healing",            servicesPath: "services/self-healing",            canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Healing engine + domain self-healing facets." },
  { family: "epistemic-firewall",      coreServicesPath: "core-services/epistemic-firewall",      servicesPath: "services/epistemic-firewall",      canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Firewall engine + domain integrations." },

  // ── Platform-owner families (services/ should defer) ──
  { family: "ci-launch-gate-service",  coreServicesPath: "core-services/ci-launch-gate-service",  servicesPath: "services/ci-launch-gate-service.ts", canonicalWinner: "core-services", strategy: "PLATFORM_OWNER", rationale: "CI gate is platform infra." },
  { family: "connector-health-service",coreServicesPath: "core-services/connector-health-service",servicesPath: "services/connector-health-service.ts", canonicalWinner: "core-services", strategy: "PLATFORM_OWNER", rationale: "Health probes are platform infra." },

  // ── Already-consolidated / structural ──
  { family: "__tests__",               coreServicesPath: "core-services/__tests__",               servicesPath: "services/__tests__",               canonicalWinner: "BOTH",          strategy: "ALREADY_CONSOLIDATED", rationale: "Test trees are intentionally co-located." },
  { family: "index.ts",                coreServicesPath: "core-services/index.ts",                servicesPath: "services/index.ts",                canonicalWinner: "BOTH",          strategy: "ALREADY_CONSOLIDATED", rationale: "Barrel files are intentionally co-located." },
  { family: "architecture",            coreServicesPath: "core-services/architecture",            servicesPath: "services/architecture",            canonicalWinner: "BOTH",          strategy: "ALREADY_CONSOLIDATED", rationale: "Architecture helpers split by concern." },
  { family: "canonical-pipeline",      coreServicesPath: "core-services/canonical-pipeline",      servicesPath: "services/canonical-pipeline",      canonicalWinner: "core-services", strategy: "PLATFORM_OWNER", rationale: "Pipeline runtime is platform-owned." },
  { family: "finance-os",              coreServicesPath: "core-services/finance-os",              servicesPath: "services/finance-os",              canonicalWinner: "services",      strategy: "DOMAIN_OWNER", rationale: "Money is a domain — services/ owns it." },
  { family: "flagship-loops",          coreServicesPath: "core-services/flagship-loops",          servicesPath: "services/flagship-loops",          canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Loop runtime + domain loop bindings." },
  { family: "frontend",                coreServicesPath: "core-services/frontend",                servicesPath: "services/frontend",                canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Frontend platform helpers + domain UI services." },
  { family: "google-provider-family",  coreServicesPath: "core-services/google-provider-family",  servicesPath: "services/google-provider-family",  canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Provider adapter + domain google integrations." },
  { family: "handoff",                 coreServicesPath: "core-services/handoff",                 servicesPath: "services/handoff",                 canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Cross-runtime handoff + domain handoffs." },
  { family: "integration-hub",         coreServicesPath: "core-services/integration-hub",         servicesPath: "services/integration-hub",         canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Hub adapter + domain integration consumers." },
  { family: "launch-readiness",        coreServicesPath: "core-services/launch-readiness",        servicesPath: "services/launch-readiness",        canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Readiness scoring + domain readiness probes." },
  { family: "life-simulation",         coreServicesPath: "core-services/life-simulation",         servicesPath: "services/life-simulation",         canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Simulation runtime + domain simulations." },
  { family: "recommendation-execution",coreServicesPath: "core-services/recommendation-execution",servicesPath: "services/recommendation-execution",canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Execution engine + domain rec execution." },
  { family: "service-registry",        coreServicesPath: "core-services/service-registry",        servicesPath: "services/service-registry",        canonicalWinner: "core-services", strategy: "PLATFORM_OWNER", rationale: "Registry is platform infra." },
  { family: "system-updates",          coreServicesPath: "core-services/system-updates",          servicesPath: "services/system-updates",          canonicalWinner: "BOTH",          strategy: "DOMAIN_SPLIT", rationale: "Update runtime + domain update facets." },
  { family: "truth-indices",           coreServicesPath: "core-services/truth-indices",           servicesPath: "services/truth-indices",           canonicalWinner: "services",      strategy: "DOMAIN_OWNER", rationale: "Indices are domain projections." },
];

export const DUPLICATE_FAMILY_SUMMARY = {
  totalFamilies: DUPLICATE_SERVICE_MAP.length,
  wrapperReexport: DUPLICATE_SERVICE_MAP.filter(d => d.strategy === "WRAPPER_REEXPORT").length,
  domainSplit: DUPLICATE_SERVICE_MAP.filter(d => d.strategy === "DOMAIN_SPLIT").length,
  platformOwner: DUPLICATE_SERVICE_MAP.filter(d => d.strategy === "PLATFORM_OWNER").length,
  domainOwner: DUPLICATE_SERVICE_MAP.filter(d => d.strategy === "DOMAIN_OWNER").length,
  alreadyConsolidated: DUPLICATE_SERVICE_MAP.filter(d => d.strategy === "ALREADY_CONSOLIDATED").length,
  needsAudit: DUPLICATE_SERVICE_MAP.filter(d => d.strategy === "NEEDS_AUDIT").length,
};
