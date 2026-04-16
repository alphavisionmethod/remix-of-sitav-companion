// ═══════════════════════════════════════════════════════════════
// SITA OS — Policy Domain Map (Phase 3)
//
// Maps the canonical privileged-action domains to the bounded
// contexts that own them. Every policy entry must declare a
// PolicyDomainKey; this map ensures domain↔context coherence.
// ═══════════════════════════════════════════════════════════════

import type { BoundedContextId } from "@/lib/architecture/bounded-context-types";

export type PolicyDomainKey =
  | "business"      // CRM, leads, opportunities, outbound
  | "money"         // Finance, payments, reserves
  | "concierge"     // Tasks, household, school
  | "boardroom"     // Boardroom decisions, votes
  | "files"         // File ingestion, sensitive docs
  | "integrations"  // Connectors, webhooks, OAuth
  | "system"        // Runtime / kernel / OS commands
  | "identity"      // Auth, MFA, biometrics, roles
  | "trust"         // Proof, receipts, audit
  | "admin";        // Cross-cutting admin operations

export interface PolicyDomainBinding {
  domain: PolicyDomainKey;
  label: string;
  primaryContextId: BoundedContextId;
  /** Additional contexts that participate in policy enforcement for this domain. */
  participatingContexts: readonly BoundedContextId[];
  /** Default risk class for actions in this domain. */
  defaultRiskClass: "R0" | "R1" | "R2" | "R3" | "R4" | "R5";
}

export const POLICY_DOMAIN_MAP: readonly PolicyDomainBinding[] = [
  { domain: "business",     label: "Business OS",        primaryContextId: "business-os",        participatingContexts: ["proof-trust", "integrations"],                       defaultRiskClass: "R2" },
  { domain: "money",        label: "Finance OS",         primaryContextId: "finance-os",         participatingContexts: ["proof-trust", "integrations", "boardroom"],          defaultRiskClass: "R4" },
  { domain: "concierge",    label: "Concierge OS",       primaryContextId: "concierge-os",       participatingContexts: ["proof-trust"],                                       defaultRiskClass: "R1" },
  { domain: "boardroom",    label: "Boardroom",          primaryContextId: "boardroom",          participatingContexts: ["finance-os", "business-os", "proof-trust"],          defaultRiskClass: "R3" },
  { domain: "files",        label: "Files & Documents",  primaryContextId: "business-os",        participatingContexts: ["proof-trust", "integrations"],                       defaultRiskClass: "R2" },
  { domain: "integrations", label: "Integrations",       primaryContextId: "integrations",       participatingContexts: ["proof-trust", "cloud-control-plane"],                defaultRiskClass: "R3" },
  { domain: "system",       label: "Runtime / Kernel",   primaryContextId: "runtime-kernel",     participatingContexts: ["cloud-control-plane", "admin"],                      defaultRiskClass: "R4" },
  { domain: "identity",     label: "Identity",           primaryContextId: "setup-identity",     participatingContexts: ["proof-trust", "admin"],                              defaultRiskClass: "R3" },
  { domain: "trust",        label: "Trust & Proof",      primaryContextId: "proof-trust",        participatingContexts: ["admin", "boardroom"],                                defaultRiskClass: "R3" },
  { domain: "admin",        label: "Admin Operations",   primaryContextId: "admin",              participatingContexts: ["cloud-control-plane", "proof-trust"],                defaultRiskClass: "R4" },
] as const;

export const ALL_POLICY_DOMAINS: readonly PolicyDomainKey[] =
  POLICY_DOMAIN_MAP.map((d) => d.domain);

export function getPolicyDomain(domain: PolicyDomainKey): PolicyDomainBinding {
  const d = POLICY_DOMAIN_MAP.find((x) => x.domain === domain);
  if (!d) throw new Error(`[policy-domain-map] Unknown domain: ${domain}`);
  return d;
}

export function getDomainsForContext(contextId: BoundedContextId): PolicyDomainKey[] {
  return POLICY_DOMAIN_MAP
    .filter((d) => d.primaryContextId === contextId || d.participatingContexts.includes(contextId))
    .map((d) => d.domain);
}
