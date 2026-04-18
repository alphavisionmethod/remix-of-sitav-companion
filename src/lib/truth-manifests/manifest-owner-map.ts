// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest Owner Map
// Domain owner for each artifact
// ═══════════════════════════════════════════════════════════════

import { MANIFEST_REGISTRY } from "./manifest-registry";
import type { ManifestOwnerDomain } from "./manifest-types";

export interface OwnerEntry {
  manifestId: string;
  owner: ManifestOwnerDomain;
  ownerDescription: string;
}

const OWNER_DESCRIPTIONS: Record<ManifestOwnerDomain, string> = {
  architecture: "Architecture team — structural integrity, contracts, ownership",
  runtime: "Runtime team — boot, kernel, services, lifecycle",
  security: "Security team — trust zones, policies, compliance",
  operations: "Operations team — metrics, health, recovery",
  "ai-workforce": "AI Workforce team — agents, advisors, prompts",
  deployment: "Deployment team — infrastructure, ingress, packaging",
  governance: "Governance team — policy, receipts, drift, validation",
  support: "Support team — admin visibility, incident response",
  platform: "Platform team — shell, surfaces, performance, accessibility",
  integrations: "Integrations team — connectors, OAuth, providers",
  launch: "Launch team — readiness, gates, maturity",
};

/** Build the owner map */
export function buildOwnerMap(): OwnerEntry[] {
  return MANIFEST_REGISTRY.map((entry) => ({
    manifestId: entry.id,
    owner: entry.owner,
    ownerDescription: OWNER_DESCRIPTIONS[entry.owner],
  }));
}

/** Get manifests by owner domain */
export function getManifestsByOwnerDomain(domain: ManifestOwnerDomain): string[] {
  return MANIFEST_REGISTRY.filter((m) => m.owner === domain).map((m) => m.id);
}

/** Get owner distribution summary */
export function getOwnerDistribution(): Record<ManifestOwnerDomain, number> {
  const dist = {} as Record<ManifestOwnerDomain, number>;
  for (const entry of MANIFEST_REGISTRY) {
    dist[entry.owner] = (dist[entry.owner] || 0) + 1;
  }
  return dist;
}
