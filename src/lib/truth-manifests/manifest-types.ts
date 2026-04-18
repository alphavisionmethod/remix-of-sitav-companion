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

/** Drift severity — how loud failure must be */
export type DriftSeverity = "low" | "medium" | "high" | "critical";

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
  /** Real authoritative inputs — must NOT be other generated manifests unless explicitly derived */
  sourceInputs: string[];
  /** Path to the script that generates this artifact */
  validator: string | null;
  /** CI gate / workflow name that fails on drift */
  ciGate: string | null;
  freshnessPolicy: FreshnessPolicy;
  /** What breaks at runtime if this manifest is wrong */
  runtimeConsequence: string;
  /** What breaks at release/deploy if this manifest is wrong */
  releaseConsequence: string;
  /** What support sees / cannot diagnose if this manifest is wrong */
  supportConsequence?: string;
  /** Severity of drift — drives CI gate behavior */
  driftSeverity?: DriftSeverity;
  /** Surfaces / scripts / docs that consume this artifact */
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
