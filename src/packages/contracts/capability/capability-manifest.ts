// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Contracts: Capability Manifest
// Registry/discovery metadata for capabilities
// ═══════════════════════════════════════════════════════════════

import type { DomainId, RiskTier } from "../_contract-scaffold";

export interface CapabilityManifestEntry {
  capabilityId: string;
  name: string;
  description: string;
  domain: DomainId;
  family: string;
  riskTier: RiskTier;
  version: string;
  isEnabled: boolean;
  isExperimental: boolean;
  tags: string[];
  dependsOn: string[];
}

export interface CapabilityManifest {
  version: string;
  generatedAt: string;
  capabilities: CapabilityManifestEntry[];
  totalCount: number;
  enabledCount: number;
}
