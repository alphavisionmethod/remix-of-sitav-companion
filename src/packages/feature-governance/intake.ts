// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Design Intake Protocol
// Structured intake questionnaire for every feature proposal,
// covering outcome, architecture, governance, supportability,
// and rollout dimensions
// ═══════════════════════════════════════════════════════════════

import type { FeatureRiskTier, AutonomyTier } from "./index";

// ── Criticality Classification ──────────────────────────────

export const CRITICALITY_CLASSES = [
  "wedge-critical",
  "trust-critical",
  "retention-critical",
  "revenue-critical",
  "option-value",
] as const;

export type CriticalityClass = typeof CRITICALITY_CLASSES[number];

// ── Environment Progression ─────────────────────────────────

export const ENVIRONMENT_PROGRESSIONS = [
  "local-only",
  "local-staging",
  "local-staging-production",
  "staging-canary-production",
  "full-progressive",
] as const;

export type EnvironmentProgression = typeof ENVIRONMENT_PROGRESSIONS[number];

// ── Section 1: Outcome Questions ────────────────────────────

export interface FeatureIntakeOutcome {
  readonly userOutcome: string;
  readonly problemSolved: string;
  readonly criticalityClass: CriticalityClass;
  readonly breakIfNotBuilt: string;
}

// ── Section 2: Architecture Questions ───────────────────────

export interface FeatureIntakeArchitecture {
  readonly primaryOwner: string;
  readonly extendsExistingService: boolean;
  readonly existingServiceExtended?: string;
  readonly touchesTrustBearing: boolean;
  readonly requiresNewContracts: boolean;
  readonly newContractDescriptions?: readonly string[];
  readonly requiresNewWorkflowStates: boolean;
  readonly workflowStateJustification?: string;
  readonly requiresConnectors: boolean;
  readonly connectorIds?: readonly string[];
  readonly requiresGeneratedTruth: boolean;
  readonly generatedTruthEntries?: readonly string[];
}

// ── Section 3: Governance Questions ─────────────────────────

export interface FeatureIntakeGovernance {
  readonly policyApplied: string;
  readonly approvalBehavior: string;
  readonly simulationRequired: boolean;
  readonly simulationDescription?: string;
  readonly refusalSemanticsRequired: boolean;
  readonly refusalConditions?: readonly string[];
  readonly autonomyTierAtLaunch: AutonomyTier;
}

// ── Section 4: Supportability Questions ─────────────────────

export interface FeatureIntakeSupportability {
  readonly diagnosisPath: string;
  readonly correlationIds: readonly string[];
  readonly replayable: boolean;
  readonly replayMechanism?: string;
  readonly rollbackPath: string;
  readonly partialFailureUX: string;
}

// ── Section 5: Rollout Questions ────────────────────────────

export interface FeatureIntakeRollout {
  readonly environmentProgression: EnvironmentProgression;
  readonly requiresFeatureFlags: boolean;
  readonly featureFlagIds?: readonly string[];
  readonly requiresShadowMode: boolean;
  readonly shadowModeDescription?: string;
  readonly killSwitchId: string;
  readonly productionMonitorOwner: string;
}

// ── Combined Intake ─────────────────────────────────────────

export interface FeatureIntake {
  readonly featureId: string;
  readonly featureName: string;
  readonly riskTier: FeatureRiskTier;
  readonly outcome: FeatureIntakeOutcome;
  readonly architecture: FeatureIntakeArchitecture;
  readonly governance: FeatureIntakeGovernance;
  readonly supportability: FeatureIntakeSupportability;
  readonly rollout: FeatureIntakeRollout;
  readonly submittedAt: number;
  readonly submittedBy: string;
}

// ── Intake Validation ───────────────────────────────────────

export function validateIntake(intake: Partial<FeatureIntake>): string[] {
  const errors: string[] = [];

  if (!intake.featureId) errors.push("Missing featureId");
  if (!intake.featureName) errors.push("Missing featureName");
  if (!intake.riskTier) errors.push("Missing riskTier");
  if (!intake.submittedBy) errors.push("Missing submittedBy");

  // Outcome validation
  if (!intake.outcome) {
    errors.push("Missing outcome section — must answer all 4 outcome questions");
  } else {
    if (!intake.outcome.userOutcome) errors.push("Outcome: missing userOutcome");
    if (!intake.outcome.problemSolved) errors.push("Outcome: missing problemSolved");
    if (!intake.outcome.criticalityClass) errors.push("Outcome: missing criticalityClass");
    else if (!(CRITICALITY_CLASSES as readonly string[]).includes(intake.outcome.criticalityClass)) {
      errors.push(`Outcome: invalid criticalityClass "${intake.outcome.criticalityClass}"`);
    }
    if (!intake.outcome.breakIfNotBuilt) errors.push("Outcome: missing breakIfNotBuilt");
  }

  // Architecture validation
  if (!intake.architecture) {
    errors.push("Missing architecture section — must answer all 7 architecture questions");
  } else {
    if (!intake.architecture.primaryOwner) errors.push("Architecture: missing primaryOwner");
    if (intake.architecture.extendsExistingService && !intake.architecture.existingServiceExtended) {
      errors.push("Architecture: extendsExistingService is true but existingServiceExtended is missing");
    }
    if (intake.architecture.requiresNewWorkflowStates && !intake.architecture.workflowStateJustification) {
      errors.push("Architecture: new workflow states require justification (usually not needed — use canonical states)");
    }
    if (intake.architecture.requiresConnectors && (!intake.architecture.connectorIds || intake.architecture.connectorIds.length === 0)) {
      errors.push("Architecture: requiresConnectors is true but no connectorIds provided");
    }
  }

  // Governance validation
  if (!intake.governance) {
    errors.push("Missing governance section — must answer all 6 governance questions");
  } else {
    if (!intake.governance.policyApplied) errors.push("Governance: missing policyApplied");
    if (!intake.governance.approvalBehavior) errors.push("Governance: missing approvalBehavior");
    if (intake.governance.simulationRequired && !intake.governance.simulationDescription) {
      errors.push("Governance: simulationRequired is true but no simulationDescription provided");
    }
    if (intake.governance.refusalSemanticsRequired &&
        (!intake.governance.refusalConditions || intake.governance.refusalConditions.length === 0)) {
      errors.push("Governance: refusalSemanticsRequired is true but no refusalConditions provided");
    }
    if (!intake.governance.autonomyTierAtLaunch) errors.push("Governance: missing autonomyTierAtLaunch");
  }

  // Supportability validation
  if (!intake.supportability) {
    errors.push("Missing supportability section — must answer all 5 supportability questions");
  } else {
    if (!intake.supportability.diagnosisPath) errors.push("Supportability: missing diagnosisPath");
    if (!intake.supportability.correlationIds || intake.supportability.correlationIds.length === 0) {
      errors.push("Supportability: missing correlationIds — every feature must have at least one");
    }
    if (!intake.supportability.rollbackPath) errors.push("Supportability: missing rollbackPath");
    if (!intake.supportability.partialFailureUX) errors.push("Supportability: missing partialFailureUX");
    if (intake.supportability.replayable && !intake.supportability.replayMechanism) {
      errors.push("Supportability: replayable is true but no replayMechanism provided");
    }
  }

  // Rollout validation
  if (!intake.rollout) {
    errors.push("Missing rollout section — must answer all 5 rollout questions");
  } else {
    if (!intake.rollout.environmentProgression) errors.push("Rollout: missing environmentProgression");
    if (intake.rollout.requiresFeatureFlags &&
        (!intake.rollout.featureFlagIds || intake.rollout.featureFlagIds.length === 0)) {
      errors.push("Rollout: requiresFeatureFlags is true but no featureFlagIds provided");
    }
    if (intake.rollout.requiresShadowMode && !intake.rollout.shadowModeDescription) {
      errors.push("Rollout: requiresShadowMode is true but no shadowModeDescription provided");
    }
    if (!intake.rollout.killSwitchId) errors.push("Rollout: missing killSwitchId");
    if (!intake.rollout.productionMonitorOwner) errors.push("Rollout: missing productionMonitorOwner");
  }

  // Cross-section validation for high-risk features
  if (intake.riskTier && ["R3", "R4", "R5"].includes(intake.riskTier)) {
    if (intake.governance && !intake.governance.simulationRequired) {
      errors.push("High-risk features (R3+) should require simulation before launch");
    }
    if (intake.rollout && intake.rollout.environmentProgression === "local-only") {
      errors.push("High-risk features (R3+) cannot use local-only environment progression");
    }
    if (intake.supportability && !intake.supportability.replayable) {
      errors.push("High-risk features (R3+) should be replayable for audit and debugging");
    }
  }

  return errors;
}

// ── Intake Completeness Score ───────────────────────────────

export function intakeCompleteness(intake: Partial<FeatureIntake>): {
  percentage: number;
  missingSections: string[];
} {
  const sections = ["outcome", "architecture", "governance", "supportability", "rollout"] as const;
  const present = sections.filter(s => intake[s] !== undefined);
  const missing = sections.filter(s => intake[s] === undefined);

  let baseScore = present.length / sections.length;

  // Bonus for having all top-level fields
  if (intake.featureId && intake.featureName && intake.riskTier && intake.submittedBy) {
    baseScore = Math.min(1, baseScore + 0.1);
  }

  return {
    percentage: Math.round(baseScore * 100),
    missingSections: missing as unknown as string[],
  };
}
