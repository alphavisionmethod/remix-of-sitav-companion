// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Domain Map
// Maps every service to its owning domain
// ═══════════════════════════════════════════════════════════════

export type ServiceDomain =
  | "platform"
  | "business"
  | "finance"
  | "concierge"
  | "orchestration"
  | "trust"
  | "proof"
  | "intelligence"
  | "integration"
  | "admin";

export interface ServiceDomainEntry {
  serviceId: string;
  domain: ServiceDomain;
  /** Whether this service is shared across domains */
  crossDomain: boolean;
  /** Human-readable owner */
  owner: string;
}

export const SERVICE_DOMAIN_MAP: ServiceDomainEntry[] = [
  // ── Platform ──
  { serviceId: "event-bus", domain: "platform", crossDomain: true, owner: "Platform Core" },
  { serviceId: "memory-service", domain: "platform", crossDomain: true, owner: "Platform Core" },

  // ── Trust & Policy ──
  { serviceId: "policy-engine", domain: "trust", crossDomain: true, owner: "Trust & Safety" },
  { serviceId: "trust-state-service", domain: "trust", crossDomain: true, owner: "Trust & Safety" },
  { serviceId: "fraud-sentinel", domain: "trust", crossDomain: false, owner: "Trust & Safety" },

  // ── Orchestration ──
  { serviceId: "workflow-engine", domain: "orchestration", crossDomain: true, owner: "Orchestration Core" },
  { serviceId: "executor-service", domain: "orchestration", crossDomain: true, owner: "Orchestration Core" },
  { serviceId: "brain-core", domain: "orchestration", crossDomain: true, owner: "AI Core" },

  // ── Proof ──
  { serviceId: "receipt-service", domain: "proof", crossDomain: true, owner: "Proof & Audit" },

  // ── Intelligence ──
  { serviceId: "search-fabric", domain: "intelligence", crossDomain: true, owner: "Intelligence Layer" },
  { serviceId: "projection-service", domain: "finance", crossDomain: false, owner: "Finance OS" },

  // ── Integration ──
  { serviceId: "connector-control", domain: "integration", crossDomain: true, owner: "Integration Hub" },
  { serviceId: "file-ingestion", domain: "integration", crossDomain: false, owner: "Integration Hub" },
];

export function getServiceDomain(serviceId: string): ServiceDomain | undefined {
  return SERVICE_DOMAIN_MAP.find((s) => s.serviceId === serviceId)?.domain;
}

export function getServicesByDomain(domain: ServiceDomain): ServiceDomainEntry[] {
  return SERVICE_DOMAIN_MAP.filter((s) => s.domain === domain);
}

export function getCrossDomainServices(): ServiceDomainEntry[] {
  return SERVICE_DOMAIN_MAP.filter((s) => s.crossDomain);
}
