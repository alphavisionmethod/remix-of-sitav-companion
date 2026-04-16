// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest Types
// Classification system for all generated artifacts
// ═══════════════════════════════════════════════════════════════

/** Primary classification of a generated artifact */
export type ManifestClass =
  | "structural"     // Defines system architecture (route-manifest, service-manifest)
  | "contract"       // Enforces behavioral agreements (contract-manifest, capability-policy)
  | "runtime"        // Describes runtime behavior (runtime-conformance, boot-chain)
  | "compliance"     // Audit/governance artifacts (security-review, architecture-compliance)
  | "informational"; // Reference-only (scorecards, drift reports, dashboards)

/** Authority level — determines how seriously drift is treated */
export type ManifestAuthority =
  | "authoritative"  // Source of truth — drift = build break or incident
  | "derived"        // Generated from authoritative sources — drift = warning
  | "informational"; // For human consumption only — drift = low priority

/** Freshness requirement */
export type FreshnessPolicy =
  | "real-time"      // Must be regenerated on every build
  | "daily"          // Regenerated daily
  | "weekly"         // Regenerated weekly
  | "on-change"      // Regenerated when source inputs change
  | "manual";        // Regenerated manually

/** Owner domain for an artifact */
export type ManifestOwnerDomain =
  | "architecture"
  | "runtime"
  | "security"
  | "operations"
  | "ai-workforce"
  | "deployment"
  | "governance"
  | "support"
  | "platform"
  | "integrations"
  | "launch";

/** Full manifest entry in the registry */
export interface ManifestRegistryEntry {
  id: string;
  path: string;
  filename: string;
  class: ManifestClass;
  authority: ManifestAuthority;
  owner: ManifestOwnerDomain;
  description: string;
  sourceInputs: string[];
  validator: string | null;
  ciGate: string | null;
  freshnessPolicy: FreshnessPolicy;
  runtimeConsequence: string;
  releaseConsequence: string;
  consumers: string[];
  tags: string[];
}

/** Health status for a single manifest */
export interface ManifestHealthStatus {
  id: string;
  exists: boolean;
  hasValidator: boolean;
  hasCiGate: boolean;
  hasOwner: boolean;
  hasConsumers: boolean;
  stale: boolean;
  issues: string[];
}

/** Aggregate health summary */
export interface ManifestHealthSummary {
  totalManifests: number;
  healthyManifests: number;
  unhealthyManifests: number;
  missingValidators: string[];
  missingCiGates: string[];
  missingOwners: string[];
  staleManifests: string[];
  orphanedManifests: string[];
}
