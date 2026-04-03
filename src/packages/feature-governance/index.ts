// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Governance Package
// Constitutional layer: risk tiers, autonomy tiers, feature
// metadata, kill-switches, compliance validation
// ═══════════════════════════════════════════════════════════════

// ── Risk Tiers (R0–R5) ──────────────────────────────────────

export const RISK_TIERS = {
  R0: { level: 0, label: "R0", description: "Informational only" },
  R1: { level: 1, label: "R1", description: "Recommendation / drafting only" },
  R2: { level: 2, label: "R2", description: "Simulation / approval-ready, no execution" },
  R3: { level: 3, label: "R3", description: "Constrained side effects with approval" },
  R4: { level: 4, label: "R4", description: "High-value or trust-sensitive execution" },
  R5: { level: 5, label: "R5", description: "Recurring delegated / enterprise-critical / financial-sensitive" },
} as const;

export type FeatureRiskTier = keyof typeof RISK_TIERS;

export const riskTierLevel = (tier: FeatureRiskTier): number => RISK_TIERS[tier].level;
export const isHighRisk = (tier: FeatureRiskTier): boolean => riskTierLevel(tier) >= 3;

// ── Autonomy Tiers (7 canonical levels) ─────────────────────

export const AUTONOMY_TIERS = {
  observe: { level: 0, label: "Observe", description: "Read-only monitoring" },
  recommend: { level: 1, label: "Recommend", description: "Suggest actions to user" },
  draft: { level: 2, label: "Draft", description: "Prepare artifacts for review" },
  simulate: { level: 3, label: "Simulate", description: "Run what-if scenarios" },
  "approval-ready": { level: 4, label: "Approval-Ready", description: "Queued for human approval" },
  "constrained-auto": { level: 5, label: "Constrained Auto-Run", description: "Execute within policy bounds" },
  "delegated-recurring": { level: 6, label: "Delegated Recurring", description: "Ongoing autonomous execution" },
} as const;

export type AutonomyTier = keyof typeof AUTONOMY_TIERS;

export const autonomyLevel = (tier: AutonomyTier): number => AUTONOMY_TIERS[tier].level;
export const requiresApproval = (tier: AutonomyTier): boolean => autonomyLevel(tier) >= 4;

// ── Feature Type Taxonomy (16 types) ────────────────────────

export const FEATURE_TYPES = [
  "ui-interaction",
  "governed-workflow",
  "boardroom",
  "advisor-runtime",
  "connector",
  "notification",
  "billing-entitlement",
  "support-diagnostics",
  "memory",
  "graph-identity",
  "policy-approval",
  "analytics-reporting",
  "pack-template",
  "simulation",
  "projection-read-model",
  "release-fleet",
] as const;

export type FeatureType = typeof FEATURE_TYPES[number];

// ── Kill-Switch Classes ─────────────────────────────────────

export const KILL_SWITCH_CLASSES = ["instant", "graceful", "scheduled"] as const;
export type KillSwitchClass = typeof KILL_SWITCH_CLASSES[number];

// ── Status Enums ────────────────────────────────────────────

export const LAUNCH_STATUSES = ["planning", "development", "alpha", "beta", "ga", "sunset", "retired"] as const;
export type LaunchStatus = typeof LAUNCH_STATUSES[number];

export const IMPLEMENTATION_STATUSES = ["not-started", "in-progress", "contract-complete", "architecture-complete", "launch-complete", "production-complete"] as const;
export type ImplementationStatus = typeof IMPLEMENTATION_STATUSES[number];

export const ROLLOUT_STATUSES = ["not-started", "canary", "gradual", "full", "paused", "rolled-back"] as const;
export type RolloutStatus = typeof ROLLOUT_STATUSES[number];

// ── Data Sensitivity ────────────────────────────────────────

export const DATA_SENSITIVITY_TIERS = ["public", "internal", "confidential", "restricted", "sovereign"] as const;
export type DataSensitivityTier = typeof DATA_SENSITIVITY_TIERS[number];

// ── Domain Alignment ────────────────────────────────────────

export type DomainAlignment = "business" | "finance" | "concierge" | "system" | "cross-domain";

// ── Feature Metadata (17 required fields) ───────────────────

export interface FeatureMetadata {
  readonly featureId: string;
  readonly name: string;
  readonly type: FeatureType[];
  readonly primaryOwner: string;
  readonly secondaryOwners: string[];
  readonly capabilityIds: string[];
  readonly surfaceIds: string[];
  readonly domainAlignment: DomainAlignment;
  readonly riskTier: FeatureRiskTier;
  readonly autonomyTier: AutonomyTier;
  readonly dataSensitivityTier: DataSensitivityTier;
  readonly launchStatus: LaunchStatus;
  readonly implementationStatus: ImplementationStatus;
  readonly rolloutStatus: RolloutStatus;
  readonly killSwitchClass: KillSwitchClass;
  readonly supportOwner: string;
  readonly productOwner: string;
  readonly engineeringOwner: string;
}

// ── Compliance Report ───────────────────────────────────────

export interface FeatureComplianceReport {
  readonly featureId: string;
  readonly compliant: boolean;
  readonly errors: string[];
  readonly warnings: string[];
  readonly checkedAt: number;
}

export const validateFeatureMetadata = (meta: Partial<FeatureMetadata>): string[] => {
  const errors: string[] = [];

  if (!meta.featureId) errors.push("Missing featureId");
  if (!meta.name) errors.push("Missing name");
  if (!meta.type || meta.type.length === 0) errors.push("Missing or empty type");
  if (meta.type) {
    for (const t of meta.type) {
      if (!(FEATURE_TYPES as readonly string[]).includes(t)) errors.push(`Invalid feature type: ${t}`);
    }
  }
  if (!meta.primaryOwner) errors.push("Missing primaryOwner");
  if (!meta.domainAlignment) errors.push("Missing domainAlignment");
  if (!meta.riskTier) errors.push("Missing riskTier");
  else if (!(meta.riskTier in RISK_TIERS)) errors.push(`Invalid riskTier: ${meta.riskTier}`);
  if (!meta.autonomyTier) errors.push("Missing autonomyTier");
  else if (!(meta.autonomyTier in AUTONOMY_TIERS)) errors.push(`Invalid autonomyTier: ${meta.autonomyTier}`);
  if (!meta.killSwitchClass) errors.push("Missing killSwitchClass");
  else if (!(KILL_SWITCH_CLASSES as readonly string[]).includes(meta.killSwitchClass)) errors.push(`Invalid killSwitchClass: ${meta.killSwitchClass}`);
  if (!meta.dataSensitivityTier) errors.push("Missing dataSensitivityTier");
  if (!meta.launchStatus) errors.push("Missing launchStatus");
  if (!meta.implementationStatus) errors.push("Missing implementationStatus");
  if (!meta.rolloutStatus) errors.push("Missing rolloutStatus");
  if (!meta.supportOwner) errors.push("Missing supportOwner");
  if (!meta.productOwner) errors.push("Missing productOwner");
  if (!meta.engineeringOwner) errors.push("Missing engineeringOwner");
  if (!meta.capabilityIds || meta.capabilityIds.length === 0) errors.push("Missing or empty capabilityIds");
  if (!meta.surfaceIds) errors.push("Missing surfaceIds");

  return errors;
};

export const checkCompliance = (meta: FeatureMetadata): FeatureComplianceReport => {
  const errors = validateFeatureMetadata(meta);
  const warnings: string[] = [];

  if (isHighRisk(meta.riskTier) && meta.killSwitchClass !== "instant") {
    warnings.push("High-risk features should use instant kill-switch");
  }
  if (requiresApproval(meta.autonomyTier) && meta.riskTier === "R0") {
    warnings.push("Approval-level autonomy with R0 risk may be over-governed");
  }

  return { featureId: meta.featureId, compliant: errors.length === 0, errors, warnings, checkedAt: Date.now() };
};

// ── Feature Registry ────────────────────────────────────────

const registry = new Map<string, FeatureMetadata>();

export const registerFeature = (meta: FeatureMetadata): string[] => {
  const errors = validateFeatureMetadata(meta);
  if (errors.length === 0) registry.set(meta.featureId, meta);
  return errors;
};

export const getFeature = (id: string): FeatureMetadata | undefined => registry.get(id);
export const getAllFeatures = (): FeatureMetadata[] => Array.from(registry.values());
export const getFeaturesByDomain = (domain: DomainAlignment): FeatureMetadata[] =>
  getAllFeatures().filter(f => f.domainAlignment === domain);
export const getFeaturesByRisk = (tier: FeatureRiskTier): FeatureMetadata[] =>
  getAllFeatures().filter(f => f.riskTier === tier);

// ── Re-export sub-modules ───────────────────────────────────
export * from "./ownership";
export * from "./intake";
export * from "./spec-template";
export * from "./sample-specs";
export * from "./capability-protocol";
export * from "./contract-schema-protocol";
