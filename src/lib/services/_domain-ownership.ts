// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Service Domain Ownership Registry
// Every directory under src/lib/services/ MUST be registered here.
// This registry is the single source of truth for service taxonomy.
// ═══════════════════════════════════════════════════════════════

export type ServiceDomain =
  | "core-platform"
  | "trust-security"
  | "ai-intelligence"
  | "business-finance-concierge"
  | "communications"
  | "platform-infrastructure"
  | "connectors"
  | "support-recovery"
  | "observability"
  | "governance";

export type ServiceStatus = "active" | "deprecated" | "experimental" | "internal";

export interface ServiceEntry {
  directory: string;
  domain: ServiceDomain;
  owner: string;
  status: ServiceStatus;
  description: string;
  /** If deprecated, which canonical service replaces it */
  replacedBy?: string;
}

/**
 * Canonical registry of all service directories.
 * CI validator `scripts/validators/check-service-domain-ownership.sh`
 * ensures every directory under src/lib/services/ has an entry here.
 */
export const SERVICE_REGISTRY: ServiceEntry[] = [
  // ── Core Platform ─────────────────────────────────────────
  { directory: "brain-core", domain: "core-platform", owner: "platform-team", status: "active", description: "Client-side brain-core for demo/offline mode (production authority: deploy/brain-core/)" },
  { directory: "policy-engine", domain: "core-platform", owner: "platform-team", status: "active", description: "Policy evaluation and enforcement engine" },
  { directory: "approval-engine", domain: "core-platform", owner: "platform-team", status: "active", description: "Multi-tier approval workflow orchestrator" },
  { directory: "capability-router", domain: "core-platform", owner: "platform-team", status: "active", description: "Routes capabilities to correct service implementations" },
  { directory: "executor-service", domain: "core-platform", owner: "platform-team", status: "active", description: "Action execution with proof emission" },
  { directory: "receipt-service", domain: "core-platform", owner: "platform-team", status: "active", description: "Immutable receipt generation and verification" },
  { directory: "verification-engine", domain: "core-platform", owner: "platform-team", status: "active", description: "Multi-layer verification and truth checking" },
  { directory: "event-bus", domain: "core-platform", owner: "platform-team", status: "active", description: "Internal event publication and subscription" },
  { directory: "service-registry", domain: "core-platform", owner: "platform-team", status: "active", description: "Runtime service discovery and health tracking" },
  { directory: "database", domain: "core-platform", owner: "platform-team", status: "active", description: "Database client abstraction and query helpers" },

  // ── Trust & Security ──────────────────────────────────────
  { directory: "trust-governor", domain: "trust-security", owner: "security-team", status: "active", description: "Trust scoring and autonomous decision boundaries" },
  { directory: "keyvault", domain: "trust-security", owner: "security-team", status: "active", description: "Secret management and key lifecycle" },
  { directory: "duress-detection", domain: "trust-security", owner: "security-team", status: "active", description: "Behavioral anomaly and duress signal detection" },
  { directory: "emergency-halt", domain: "trust-security", owner: "security-team", status: "active", description: "System-wide emergency stop orchestration" },
  { directory: "injection-firewall", domain: "trust-security", owner: "security-team", status: "active", description: "Prompt injection and input sanitization" },
  { directory: "tenant-firewall", domain: "trust-security", owner: "security-team", status: "active", description: "Multi-tenant data isolation enforcement" },
  { directory: "trusted-device", domain: "trust-security", owner: "security-team", status: "active", description: "Device trust registration and verification" },
  { directory: "security", domain: "trust-security", owner: "security-team", status: "active", description: "Core security utilities and middleware" },
  { directory: "security-privacy", domain: "trust-security", owner: "security-team", status: "active", description: "Privacy controls and data protection" },

  // ── AI & Intelligence ─────────────────────────────────────
  { directory: "ai-gateway", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Client-side AI gateway forwarding to edge function" },
  { directory: "inference-gateway", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Model inference routing with fallback chains" },
  { directory: "ai-workforce", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Internal AI agent workforce management" },
  { directory: "ai-economics", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "AI cost tracking, budgeting, and margin protection" },
  { directory: "model-router", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Model tier selection and budget-aware routing" },
  { directory: "council-orchestrator", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Multi-advisor council deliberation orchestrator" },
  { directory: "boardroom-service", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Boardroom session and decision management" },

  // ── Business / Finance / Concierge ────────────────────────
  { directory: "business-os", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Business domain engine (CRM, pipeline, revenue)" },
  { directory: "finance-os", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Finance domain engine (reserves, bills, investments)" },
  { directory: "concierge-os", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Concierge domain engine (household, travel, tasks)" },

  // ── Communications ────────────────────────────────────────
  { directory: "communication-service", domain: "communications", owner: "platform-team", status: "active", description: "Unified communication abstraction" },
  { directory: "messaging-gateway", domain: "communications", owner: "platform-team", status: "active", description: "Multi-channel message routing" },
  { directory: "notifications", domain: "communications", owner: "platform-team", status: "active", description: "Notification delivery and preference management" },
  { directory: "push-notification", domain: "communications", owner: "platform-team", status: "active", description: "Web Push (VAPID) delivery service" },

  // ── Platform Infrastructure ───────────────────────────────
  { directory: "realtime-gateway", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Real-time event streaming via Supabase Realtime" },
  { directory: "degraded-mode", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Graceful degradation orchestrator" },

  // ── Connectors ────────────────────────────────────────────
  { directory: "connector-control-plane", domain: "connectors", owner: "integrations-team", status: "active", description: "Connector lifecycle management" },
  { directory: "connector-engine", domain: "connectors", owner: "integrations-team", status: "active", description: "Connector execution engine" },
  { directory: "connector-runners", domain: "connectors", owner: "integrations-team", status: "active", description: "Per-provider connector runner implementations" },
  { directory: "connector-truth", domain: "connectors", owner: "integrations-team", status: "active", description: "Connector health verification and truth probes" },

  // ── Support & Recovery ────────────────────────────────────
  { directory: "support-diagnostics", domain: "support-recovery", owner: "platform-team", status: "active", description: "Support bundle generation and diagnostics" },
  { directory: "self-healing", domain: "support-recovery", owner: "platform-team", status: "active", description: "Automated remediation and recovery workflows" },
  { directory: "incident-management", domain: "support-recovery", owner: "platform-team", status: "active", description: "Incident tracking and resolution" },

  // ── Observability ─────────────────────────────────────────
  { directory: "observability", domain: "observability", owner: "platform-team", status: "active", description: "Structured logging, tracing, and SLO monitoring" },
  { directory: "observability-hub", domain: "observability", owner: "platform-team", status: "active", description: "Centralized observability dashboard data provider" },

  // ── Fleet (complementary, not duplicative) ────────────────
  { directory: "fleet", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Fleet instance registration and lifecycle" },
  { directory: "fleet-health", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Fleet health monitoring and alerting" },
  { directory: "fleet-ota", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Fleet over-the-air update distribution" },
];

/** Look up a service entry by directory name */
export function getServiceEntry(directory: string): ServiceEntry | undefined {
  return SERVICE_REGISTRY.find((s) => s.directory === directory);
}

/** Get all services in a domain */
export function getServicesByDomain(domain: ServiceDomain): ServiceEntry[] {
  return SERVICE_REGISTRY.filter((s) => s.domain === domain);
}

/** Get all active services */
export function getActiveServices(): ServiceEntry[] {
  return SERVICE_REGISTRY.filter((s) => s.status === "active");
}