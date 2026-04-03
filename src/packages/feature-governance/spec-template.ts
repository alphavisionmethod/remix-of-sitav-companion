// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Feature Specification Template
// 14-section spec structure mandated by the protocol for every
// non-trivial feature in the system
// ═══════════════════════════════════════════════════════════════

import type { FeatureRiskTier, AutonomyTier, LaunchStatus, RolloutStatus, KillSwitchClass } from "./index";

// ── Section 1: Header ───────────────────────────────────────

export interface SpecHeader {
  readonly featureId: string;
  readonly title: string;
  readonly status: LaunchStatus;
  readonly owner: string;
  readonly productOwner: string;
  readonly engineeringOwner: string;
  readonly supportOwner: string;
  readonly rolloutStage: RolloutStatus;
  readonly wedgePriority: number; // 1 = highest
}

// ── Section 2: Outcome Statement ────────────────────────────

export interface SpecOutcome {
  readonly userProblem: string;
  readonly expectedValue: string;
  readonly whyNow: string;
  readonly nonGoals: readonly string[];
}

// ── Section 3: Capability Map ───────────────────────────────

export interface SpecCapabilityMap {
  readonly readOnly: readonly string[];
  readonly sideEffecting: readonly string[];
  readonly supporting: readonly string[];
  readonly advisorInvolvement: "none" | "recommend" | "draft" | "execute";
}

// ── Section 4: Owner Map ────────────────────────────────────

export interface SpecOwnerMap {
  readonly primary: string;
  readonly secondary: readonly string[];
  readonly integrations: readonly string[];
  readonly packages: readonly string[];
  readonly generatedTruth: readonly string[];
}

// ── Section 5: Surface Map ──────────────────────────────────

export interface SpecSurfaceMap {
  readonly web: readonly string[];
  readonly mobile: readonly string[];
  readonly admin: readonly string[];
  readonly notifications: readonly string[];
  readonly boardroomVisibility: boolean;
}

// ── Section 6: Contracts & Schemas ──────────────────────────

export interface SpecContracts {
  readonly requestSchemas: readonly string[];
  readonly responseSchemas: readonly string[];
  readonly eventSchemas: readonly string[];
  readonly receiptSchemas: readonly string[];
  readonly diagnosticSchemas: readonly string[];
  readonly featureFlagSchemas: readonly string[];
}

// ── Section 7: Workflow Model ───────────────────────────────

export interface SpecWorkflowModel {
  readonly family: string;
  readonly states: readonly string[];
  readonly transitions: readonly { from: string; to: string; trigger: string }[];
  readonly timeoutRules: readonly { state: string; maxDurationMs: number; escalation: string }[];
  readonly retryRules: readonly { state: string; maxRetries: number; backoffMs: number }[];
  readonly compensation: readonly { step: string; rollbackAction: string }[];
  readonly replayBehavior: "full" | "partial" | "none";
}

// ── Section 8: Policy / Approval / Trust Model ──────────────

export interface SpecPolicyModel {
  readonly riskTier: FeatureRiskTier;
  readonly autonomyTier: AutonomyTier;
  readonly policyRules: readonly string[];
  readonly approvalRequirements: readonly string[];
  readonly refusalConditions: readonly string[];
  readonly downgradeConditions: readonly string[];
  readonly simulationRequirements: readonly string[];
}

// ── Section 9: Execution Model ──────────────────────────────

export interface SpecExecutionModel {
  readonly canonicalPath: readonly string[];
  readonly connectors: readonly string[];
  readonly idempotencyStrategy: "natural-key" | "idempotency-key" | "deduplication" | "none";
  readonly postconditionVerification: readonly string[];
  readonly receiptEmission: readonly string[];
  readonly eventEmission: readonly string[];
}

// ── Section 6.10: Memory / Graph Effects ────────────────────

export interface SpecMemoryGraphEffects {
  readonly memoryWrites: readonly string[];
  readonly memoryReads: readonly string[];
  readonly graphMutations: readonly string[];
  readonly visibilityBoundaries: readonly string[];
  readonly correctionPaths: readonly string[];
  readonly forgetPaths: readonly string[];
}

// ── Section 6.11: Observability / Support Model ─────────────

export interface SpecObservabilityModel {
  readonly logs: readonly string[];
  readonly metrics: readonly string[];
  readonly traces: readonly string[];
  readonly replayPath: string;
  readonly incidentSummaryBehavior: string;
  readonly operatorRunbookLinks: readonly string[];
}

// ── Section 6.12: Testing Model ─────────────────────────────

export interface SpecTestingModel {
  readonly unitTests: readonly string[];
  readonly contractTests: readonly string[];
  readonly integrationTests: readonly string[];
  readonly replayTests: readonly string[];
  readonly degradedModeTests: readonly string[];
  readonly securityTests: readonly string[];
  readonly goldenTraceTests: readonly string[];
}

// ── Section 6.13: Rollout / Recovery Model ──────────────────

export interface SpecRolloutRecoveryModel {
  readonly featureFlags: readonly string[];
  readonly rolloutRings: readonly string[];
  readonly shadowSimProgression: readonly string[];
  readonly rollbackSteps: readonly string[];
  readonly killSwitch: string;
  readonly launchCriteria: readonly string[];
}

// ── Section 6.14: Generated Truth Updates ───────────────────

export interface SpecGeneratedTruthUpdates {
  readonly capabilityIndex: boolean;
  readonly routeManifest: boolean;
  readonly serviceManifest: boolean;
  readonly eventSubjectManifest: boolean;
  readonly connectorCatalog: boolean;
  readonly boardroomTemplateIndex: boolean;
  readonly featureIntegrationIndex: boolean;
  readonly formulaRegistry: boolean;
  readonly promptRegistry: boolean;
}

// ── Combined Feature Spec ───────────────────────────────────

export interface FeatureSpec {
  readonly header: SpecHeader;
  readonly outcome: SpecOutcome;
  readonly capabilityMap: SpecCapabilityMap;
  readonly ownerMap: SpecOwnerMap;
  readonly surfaceMap: SpecSurfaceMap;
  readonly contracts: SpecContracts;
  readonly workflowModel: SpecWorkflowModel;
  readonly policyModel: SpecPolicyModel;
  readonly executionModel: SpecExecutionModel;
  readonly memoryGraphEffects: SpecMemoryGraphEffects;
  readonly observabilityModel: SpecObservabilityModel;
  readonly testingModel: SpecTestingModel;
  readonly rolloutRecoveryModel: SpecRolloutRecoveryModel;
  readonly generatedTruthUpdates: SpecGeneratedTruthUpdates;
}

// ── Section Names (for completeness reporting) ──────────────

export const SPEC_SECTIONS = [
  "header",
  "outcome",
  "capabilityMap",
  "ownerMap",
  "surfaceMap",
  "contracts",
  "workflowModel",
  "policyModel",
  "executionModel",
  "memoryGraphEffects",
  "observabilityModel",
  "testingModel",
  "rolloutRecoveryModel",
  "generatedTruthUpdates",
] as const;

export type SpecSection = typeof SPEC_SECTIONS[number];

// ── Spec Validation ─────────────────────────────────────────

export function validateSpec(spec: Partial<FeatureSpec>): string[] {
  const errors: string[] = [];

  // Header
  if (!spec.header) {
    errors.push("Missing header section");
  } else {
    if (!spec.header.featureId) errors.push("Header: missing featureId");
    if (!spec.header.title) errors.push("Header: missing title");
    if (!spec.header.owner) errors.push("Header: missing owner");
    if (!spec.header.productOwner) errors.push("Header: missing productOwner");
    if (!spec.header.engineeringOwner) errors.push("Header: missing engineeringOwner");
    if (!spec.header.supportOwner) errors.push("Header: missing supportOwner");
    if (spec.header.wedgePriority !== undefined && spec.header.wedgePriority < 1) {
      errors.push("Header: wedgePriority must be >= 1");
    }
  }

  // Outcome
  if (!spec.outcome) {
    errors.push("Missing outcome section");
  } else {
    if (!spec.outcome.userProblem) errors.push("Outcome: missing userProblem");
    if (!spec.outcome.expectedValue) errors.push("Outcome: missing expectedValue");
    if (!spec.outcome.whyNow) errors.push("Outcome: missing whyNow");
  }

  // Capability Map
  if (!spec.capabilityMap) {
    errors.push("Missing capabilityMap section");
  }

  // Owner Map
  if (!spec.ownerMap) {
    errors.push("Missing ownerMap section");
  } else {
    if (!spec.ownerMap.primary) errors.push("OwnerMap: missing primary owner");
  }

  // Surface Map
  if (!spec.surfaceMap) {
    errors.push("Missing surfaceMap section");
  }

  // Contracts
  if (!spec.contracts) {
    errors.push("Missing contracts section");
  }

  // Workflow Model
  if (!spec.workflowModel) {
    errors.push("Missing workflowModel section");
  } else {
    if (!spec.workflowModel.family) errors.push("WorkflowModel: missing family");
    if (!spec.workflowModel.states || spec.workflowModel.states.length === 0) {
      errors.push("WorkflowModel: must define at least one state");
    }
  }

  // Policy Model
  if (!spec.policyModel) {
    errors.push("Missing policyModel section");
  } else {
    if (!spec.policyModel.riskTier) errors.push("PolicyModel: missing riskTier");
    if (!spec.policyModel.autonomyTier) errors.push("PolicyModel: missing autonomyTier");
  }

  // Execution Model
  if (!spec.executionModel) {
    errors.push("Missing executionModel section");
  } else {
    if (!spec.executionModel.canonicalPath || spec.executionModel.canonicalPath.length === 0) {
      errors.push("ExecutionModel: must define at least one step in canonicalPath");
    }
  }

  // Memory / Graph Effects (6.10)
  if (!spec.memoryGraphEffects) {
    errors.push("Missing memoryGraphEffects section");
  }

  // Observability Model (6.11)
  if (!spec.observabilityModel) {
    errors.push("Missing observabilityModel section");
  } else {
    if (!spec.observabilityModel.replayPath) errors.push("ObservabilityModel: missing replayPath");
    if (!spec.observabilityModel.incidentSummaryBehavior) errors.push("ObservabilityModel: missing incidentSummaryBehavior");
  }

  // Testing Model (6.12)
  if (!spec.testingModel) {
    errors.push("Missing testingModel section");
  } else {
    if (!spec.testingModel.unitTests || spec.testingModel.unitTests.length === 0) {
      errors.push("TestingModel: must define at least one unit test");
    }
  }

  // Rollout / Recovery Model (6.13)
  if (!spec.rolloutRecoveryModel) {
    errors.push("Missing rolloutRecoveryModel section");
  } else {
    if (!spec.rolloutRecoveryModel.killSwitch) errors.push("RolloutRecoveryModel: missing killSwitch");
    if (!spec.rolloutRecoveryModel.launchCriteria || spec.rolloutRecoveryModel.launchCriteria.length === 0) {
      errors.push("RolloutRecoveryModel: must define at least one launch criterion");
    }
  }

  // Generated Truth Updates (6.14)
  if (!spec.generatedTruthUpdates) {
    errors.push("Missing generatedTruthUpdates section");
  }

  return errors;
}

// ── Spec Completeness ───────────────────────────────────────

export function specCompleteness(spec: Partial<FeatureSpec>): {
  percentage: number;
  missingSections: SpecSection[];
  presentSections: SpecSection[];
} {
  const present: SpecSection[] = [];
  const missing: SpecSection[] = [];

  for (const section of SPEC_SECTIONS) {
    if (spec[section] !== undefined) {
      present.push(section);
    } else {
      missing.push(section);
    }
  }

  return {
    percentage: Math.round((present.length / SPEC_SECTIONS.length) * 100),
    missingSections: missing,
    presentSections: present,
  };
}

// ── Empty Spec Factory ──────────────────────────────────────

export function createEmptySpec(featureId: string, title: string, owner: string): FeatureSpec {
  return {
    header: {
      featureId,
      title,
      status: "planning",
      owner,
      productOwner: "",
      engineeringOwner: "",
      supportOwner: "",
      rolloutStage: "not-started",
      wedgePriority: 99,
    },
    outcome: {
      userProblem: "",
      expectedValue: "",
      whyNow: "",
      nonGoals: [],
    },
    capabilityMap: {
      readOnly: [],
      sideEffecting: [],
      supporting: [],
      advisorInvolvement: "none",
    },
    ownerMap: {
      primary: owner,
      secondary: [],
      integrations: [],
      packages: [],
      generatedTruth: [],
    },
    surfaceMap: {
      web: [],
      mobile: [],
      admin: [],
      notifications: [],
      boardroomVisibility: false,
    },
    contracts: {
      requestSchemas: [],
      responseSchemas: [],
      eventSchemas: [],
      receiptSchemas: [],
      diagnosticSchemas: [],
      featureFlagSchemas: [],
    },
    workflowModel: {
      family: "",
      states: [],
      transitions: [],
      timeoutRules: [],
      retryRules: [],
      compensation: [],
      replayBehavior: "none",
    },
    policyModel: {
      riskTier: "R0",
      autonomyTier: "observe",
      policyRules: [],
      approvalRequirements: [],
      refusalConditions: [],
      downgradeConditions: [],
      simulationRequirements: [],
    },
    executionModel: {
      canonicalPath: [],
      connectors: [],
      idempotencyStrategy: "none",
      postconditionVerification: [],
      receiptEmission: [],
      eventEmission: [],
    },
    memoryGraphEffects: {
      memoryWrites: [],
      memoryReads: [],
      graphMutations: [],
      visibilityBoundaries: [],
      correctionPaths: [],
      forgetPaths: [],
    },
    observabilityModel: {
      logs: [],
      metrics: [],
      traces: [],
      replayPath: "",
      incidentSummaryBehavior: "",
      operatorRunbookLinks: [],
    },
    testingModel: {
      unitTests: [],
      contractTests: [],
      integrationTests: [],
      replayTests: [],
      degradedModeTests: [],
      securityTests: [],
      goldenTraceTests: [],
    },
    rolloutRecoveryModel: {
      featureFlags: [],
      rolloutRings: [],
      shadowSimProgression: [],
      rollbackSteps: [],
      killSwitch: "",
      launchCriteria: [],
    },
    generatedTruthUpdates: {
      capabilityIndex: false,
      routeManifest: false,
      serviceManifest: false,
      eventSubjectManifest: false,
      connectorCatalog: false,
      boardroomTemplateIndex: false,
      featureIntegrationIndex: false,
      formulaRegistry: false,
      promptRegistry: false,
    },
  };
}
