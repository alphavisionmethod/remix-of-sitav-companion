// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Service Registry
// ~45 services. This is the ONLY authority on what services exist.
// Any service not listed here is either:
//   - a capability handler inside a canonical service
//   - a Temporal workflow
//   - a worker
//   - a pure package (no I/O)
//   - a feature module inside a canonical service
// ═══════════════════════════════════════════════════════════════

export type ServiceTier = "sovereign" | "core" | "domain" | "infrastructure" | "surface";

export interface CanonicalService {
  id: string;
  name: string;
  tier: ServiceTier;
  purpose: string;
  ownsCapabilities: string[];
  absorbs?: string[];  // former standalone services now folded in
}

// ── SOVEREIGN LAYER (1 service) ─────────────────────────────
// The single brain. No other service may interpret intent or arbitrate.

const SOVEREIGN: CanonicalService[] = [
  {
    id: "brain-core",
    name: "Brain Core",
    tier: "sovereign",
    purpose: "Sole authority for intent interpretation, advisor arbitration, plan assembly, execution authorization",
    ownsCapabilities: [
      "intent-classification", "advisor-routing", "plan-assembly",
      "execution-authorization", "council-synthesis", "multi-advisor-orchestration",
      "briefing-assembly", "confidence-arbitration",
    ],
    absorbs: [
      "decision-intelligence", "predictive-intent", "ai-workforce",
      "auto-proposal", "prompt-assembler", "os-awareness",
      "companion-engine", "nlp-companion", "feature-proposal-engine",
      "life-intelligence-engine", "productivity-engine",
    ],
  },
];

// ── GOVERNANCE ORGANS (6 services) ──────────────────────────
// Adjacent to brain-core, not embedded. Enforce boundaries.

const GOVERNANCE: CanonicalService[] = [
  {
    id: "policy-engine",
    name: "Policy Engine",
    tier: "core",
    purpose: "Runtime policy evaluation, boundary enforcement, risk classification",
    ownsCapabilities: ["policy-evaluation", "risk-classification", "boundary-check", "autonomy-mode"],
    absorbs: ["trust-governor", "trust-state-service"],
  },
  {
    id: "constitution-engine",
    name: "Constitution Engine",
    tier: "core",
    purpose: "Compile and enforce constitutional rules, ethical boundaries, hard limits",
    ownsCapabilities: ["constitution-compile", "ethical-boundary", "hard-limit-enforcement"],
  },
  {
    id: "approval-service",
    name: "Approval Service",
    tier: "core",
    purpose: "Approval queue, escalation, delegation, approval-proof generation",
    ownsCapabilities: ["approval-queue", "escalation", "delegation-check", "approval-proof"],
    absorbs: ["approval-engine"],
  },
  {
    id: "simulator",
    name: "Simulator",
    tier: "core",
    purpose: "Safe simulation of policy changes, capability impacts, what-if scenarios",
    ownsCapabilities: ["policy-simulation", "impact-preview", "what-if"],
    absorbs: ["governance-simulator"],
  },
  {
    id: "council-orchestrator",
    name: "Council Orchestrator",
    tier: "core",
    purpose: "Coordinate advisor councils, manage quorum, synthesize multi-advisor output",
    ownsCapabilities: ["council-coordination", "quorum-management", "advisor-synthesis"],
  },
  {
    id: "advisor-registry",
    name: "Advisor Registry",
    tier: "core",
    purpose: "Canonical registry of all advisors, their contracts, capabilities, and trust thresholds",
    ownsCapabilities: ["advisor-registration", "advisor-contracts", "trust-threshold-management"],
  },
];

// ── EXECUTION & PROOF (5 services) ──────────────────────────

const EXECUTION: CanonicalService[] = [
  {
    id: "executor-service",
    name: "Executor Service",
    tier: "core",
    purpose: "SOLE choke point for external actions. Envelope validation, signature, policy hash, approval proof, budget, idempotency, receipt, connector delegation",
    ownsCapabilities: [
      "envelope-validation", "signature-check", "policy-hash-verify",
      "approval-proof-verify", "budget-check", "idempotency",
      "receipt-emission", "connector-delegation",
    ],
    absorbs: ["payment-execution-service", "payment-execution", "emergency-halt"],
  },
  {
    id: "capability-router",
    name: "Capability Router",
    tier: "core",
    purpose: "Route authorized intents to correct capability handlers",
    ownsCapabilities: ["capability-routing", "handler-resolution", "tenant-scoping"],
  },
  {
    id: "audit-ledger",
    name: "Audit Ledger",
    tier: "core",
    purpose: "Immutable audit trail, proof orchestration, receipt storage",
    ownsCapabilities: [
      "audit-write", "proof-orchestration", "receipt-storage",
      "refusal-receipt", "evidence-bundle", "immutable-event",
    ],
    absorbs: ["audit-trail-timeline", "proof-orchestrator", "receipt-service"],
  },
  {
    id: "event-bus",
    name: "Event Bus",
    tier: "core",
    purpose: "Cross-system event distribution, pub/sub, event replay",
    ownsCapabilities: ["event-publish", "event-subscribe", "event-replay"],
  },
  {
    id: "workflow-engine",
    name: "Workflow Engine",
    tier: "core",
    purpose: "Multi-step workflow orchestration, Temporal-style durable execution",
    ownsCapabilities: ["workflow-definition", "workflow-execution", "step-retry", "compensation"],
    absorbs: ["action-queue"],
  },
];

// ── MEMORY & IDENTITY (3 services) ──────────────────────────

const MEMORY_IDENTITY: CanonicalService[] = [
  {
    id: "memory-service",
    name: "Memory Service",
    tier: "core",
    purpose: "Unified governed memory: episodic, semantic, procedural, preference, refusal, regret. Source attribution, evidence grades, conflict detection, privacy tiers, expiration, correction, forget",
    ownsCapabilities: [
      "episodic-memory", "semantic-memory", "procedural-memory",
      "preference-memory", "refusal-memory", "regret-memory",
      "source-attribution", "evidence-grading", "conflict-detection",
      "privacy-tiers", "expiration", "correction", "forget-control",
    ],
    absorbs: ["advisor-memory", "ai-memory-graph", "advisor-knowledge"],
  },
  {
    id: "entity-graph",
    name: "Entity & Relationship Graph",
    tier: "core",
    purpose: "Foundational identity/relationship infrastructure: household, org, roles, delegated authority, device ownership, permissions, inheritance, revocation",
    ownsCapabilities: [
      "household-graph", "org-graph", "role-management",
      "delegated-authority", "shared-private-boundaries",
      "device-ownership", "entity-permissions", "inheritance", "revocation",
    ],
    absorbs: ["identity-graph", "relationship-intelligence", "data-scope-model"],
  },
  {
    id: "projection-service",
    name: "Projection Service",
    tier: "core",
    purpose: "Read model materialization, replayable projections, staleness tracking",
    ownsCapabilities: ["projection-rebuild", "staleness-detection", "cache-management"],
    absorbs: ["projections"],
  },
];

// ── DOMAIN MODULES (3 services — pure, no execution) ────────

const DOMAINS: CanonicalService[] = [
  {
    id: "finance-os",
    name: "Finance OS",
    tier: "domain",
    purpose: "Financial reasoning, evaluation, proposals. Submodules: money-center, investment-office, tax-planning, insurance",
    ownsCapabilities: [
      "financial-analysis", "cash-flow-reasoning", "investment-reasoning",
      "budget-evaluation", "tax-planning", "insurance-evaluation",
      "capital-allocation", "wealth-projection",
    ],
    absorbs: ["capital-allocation", "sovereign-calculation", "revenue-ticker"],
  },
  {
    id: "business-os",
    name: "Business OS",
    tier: "domain",
    purpose: "Business reasoning, evaluation, proposals. Submodules: revenue-office, digital-presence, CRM, pipeline, invoicing",
    ownsCapabilities: [
      "lead-evaluation", "pipeline-reasoning", "revenue-analysis",
      "digital-presence-evaluation", "client-health-scoring",
      "competitive-analysis", "pricing-reasoning",
    ],
    absorbs: [
      "revenue-autopilot", "revenue-growth", "revenue-leak-detector",
      "competitive-intelligence", "client-sentiment",
      "autonomous-negotiation", "website-management",
    ],
  },
  {
    id: "concierge-os",
    name: "Concierge OS",
    tier: "domain",
    purpose: "Household/life reasoning, evaluation, proposals. Submodules: calendar, tasks, providers, household, logistics",
    ownsCapabilities: [
      "household-reasoning", "calendar-evaluation", "task-reasoning",
      "provider-evaluation", "logistics-planning",
      "life-quality-scoring", "routine-optimization",
    ],
    absorbs: ["booking-scheduling", "time-wealth", "personal-operating-model", "compound-life-score"],
  },
];

// ── INFRASTRUCTURE (11 services) ────────────────────────────

const INFRASTRUCTURE: CanonicalService[] = [
  {
    id: "api-gateway",
    name: "API Gateway",
    tier: "infrastructure",
    purpose: "Central API routing, rate limiting, tenant resolution",
    ownsCapabilities: ["api-routing", "rate-limiting", "tenant-resolution"],
  },
  {
    id: "auth-service",
    name: "Auth Service",
    tier: "infrastructure",
    purpose: "Authentication, session management, MFA, device trust",
    ownsCapabilities: ["authentication", "session", "mfa", "device-trust"],
    absorbs: ["biometric-auth", "trusted-device", "duress-detection"],
  },
  {
    id: "connector-control-plane",
    name: "Connector Control Plane",
    tier: "infrastructure",
    purpose: "External connector lifecycle, health, sync orchestration",
    ownsCapabilities: ["connector-lifecycle", "sync-orchestration", "health-monitoring"],
    absorbs: ["connector-runners"],
  },
  {
    id: "billing-service",
    name: "Billing Service",
    tier: "infrastructure",
    purpose: "Subscription management, metering, invoicing",
    ownsCapabilities: ["subscription", "metering", "invoicing"],
    absorbs: ["ai-economics"],
  },
  {
    id: "notification-service",
    name: "Notification Service",
    tier: "infrastructure",
    purpose: "Push, email, SMS, in-app notifications",
    ownsCapabilities: ["push", "email", "sms", "in-app"],
    absorbs: ["communication-service", "realtime-gateway"],
  },
  {
    id: "search-fabric",
    name: "Search Fabric",
    tier: "infrastructure",
    purpose: "Full-text search, semantic search, entity resolution",
    ownsCapabilities: ["full-text-search", "semantic-search", "entity-resolution"],
  },
  {
    id: "document-engine",
    name: "Document Engine",
    tier: "infrastructure",
    purpose: "Document storage, parsing, signature, versioning",
    ownsCapabilities: ["document-storage", "parsing", "signature", "versioning"],
    absorbs: ["document-signature", "file-ingestion"],
  },
  {
    id: "analytics-service",
    name: "Analytics Service",
    tier: "infrastructure",
    purpose: "Usage analytics, attribution, telemetry aggregation",
    ownsCapabilities: ["usage-analytics", "attribution", "telemetry"],
    absorbs: ["attribution-analytics", "performance-monitor"],
  },
  {
    id: "admin-service",
    name: "Admin Service",
    tier: "infrastructure",
    purpose: "Admin operations, configuration, feature flags, operator preferences",
    ownsCapabilities: ["admin-config", "feature-flags", "operator-preferences"],
    absorbs: ["owner-control-room", "sita-modes"],
  },
  {
    id: "self-healing-engine",
    name: "Self-Healing Engine",
    tier: "infrastructure",
    purpose: "Autonomous maintenance, rule-based remediation, verification, learning",
    ownsCapabilities: ["heal-rules", "auto-remediation", "heal-verification", "heal-learning"],
    absorbs: ["self-healing", "self-learning", "error-patrol"],
  },
  {
    id: "edge-device-runtime",
    name: "Edge Device Runtime",
    tier: "infrastructure",
    purpose: "Local trust anchor, offline-first, device-level execution",
    ownsCapabilities: ["offline-sync", "local-trust", "device-execution"],
    absorbs: ["cloud-control-plane-infra", "cloud-sync-manager"],
  },
];

// ── SURFACE SERVICES (3 services) ───────────────────────────

const SURFACES: CanonicalService[] = [
  {
    id: "web-surface",
    name: "Web Surface",
    tier: "surface",
    purpose: "Main operating surface — React SPA shell",
    ownsCapabilities: ["web-rendering", "shell-management", "route-management"],
    absorbs: ["surface-detection", "widget-marketplace"],
  },
  {
    id: "admin-surface",
    name: "Admin Surface",
    tier: "surface",
    purpose: "Mission control surface for operators",
    ownsCapabilities: ["admin-rendering", "mission-control-shell"],
  },
  {
    id: "mobile-surface",
    name: "Mobile Surface",
    tier: "surface",
    purpose: "Trust, continuity, and approval surface",
    ownsCapabilities: ["mobile-rendering", "approval-ui", "continuity"],
  },
];

// ── SUPPORT SERVICES (5 services) ───────────────────────────

const SUPPORT: CanonicalService[] = [
  {
    id: "tenant-firewall",
    name: "Tenant Firewall",
    tier: "infrastructure",
    purpose: "Tenant isolation, cross-tenant prevention, scope enforcement",
    ownsCapabilities: ["tenant-isolation", "scope-enforcement"],
  },
  {
    id: "role-permission-engine",
    name: "Role & Permission Engine",
    tier: "infrastructure",
    purpose: "RBAC, ABAC, permission evaluation, role hierarchy",
    ownsCapabilities: ["rbac", "abac", "permission-eval"],
  },
  {
    id: "service-registry",
    name: "Service Registry",
    tier: "infrastructure",
    purpose: "Service discovery, health aggregation, dependency map",
    ownsCapabilities: ["service-discovery", "health-aggregation"],
    absorbs: ["support-diagnostics"],
  },
  {
    id: "sovereign-exporter",
    name: "Sovereign Exporter",
    tier: "infrastructure",
    purpose: "Data portability, sovereign export, backup, migration",
    ownsCapabilities: ["data-export", "backup", "migration"],
    absorbs: ["digital-legacy-vault"],
  },
  {
    id: "verification-engine",
    name: "Verification Engine",
    tier: "infrastructure",
    purpose: "Multi-gate verification: typecheck, lint, test, build, policy, security, a11y",
    ownsCapabilities: ["typecheck", "lint", "test-run", "build-verify", "policy-check"],
    absorbs: ["accuracy-classifier"],
  },
];

// ── FULL REGISTRY ───────────────────────────────────────────

export const CANONICAL_SERVICES: CanonicalService[] = [
  ...SOVEREIGN,
  ...GOVERNANCE,
  ...EXECUTION,
  ...MEMORY_IDENTITY,
  ...DOMAINS,
  ...INFRASTRUCTURE,
  ...SURFACES,
  ...SUPPORT,
];

export const SERVICE_COUNT = CANONICAL_SERVICES.length; // Target: ~45

// ── Queries ─────────────────────────────────────────────────

export function getService(id: string): CanonicalService | undefined {
  return CANONICAL_SERVICES.find(s => s.id === id);
}

export function getServicesByTier(tier: ServiceTier): CanonicalService[] {
  return CANONICAL_SERVICES.filter(s => s.tier === tier);
}

export function getAbsorbedServices(): string[] {
  return CANONICAL_SERVICES.flatMap(s => s.absorbs ?? []);
}

export function isCanonicalService(id: string): boolean {
  return CANONICAL_SERVICES.some(s => s.id === id);
}

export function getCanonicalOwner(absorbedServiceId: string): CanonicalService | undefined {
  return CANONICAL_SERVICES.find(s => s.absorbs?.includes(absorbedServiceId));
}

// ── Validation ──────────────────────────────────────────────

export function validateServiceCount(): { count: number; target: number; ok: boolean } {
  return { count: SERVICE_COUNT, target: 45, ok: SERVICE_COUNT <= 50 };
}
