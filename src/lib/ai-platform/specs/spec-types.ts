// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Advisor Build Spec Contract
//
// Typed, machine-readable representation of the 23-section build
// specification every Business System advisor must satisfy.
//
// This contract is the SINGLE SOURCE OF TRUTH consumed by:
//   • The shared AdvisorPageShell ("Spec" tab)
//   • The CI gate (check-advisor-spec-completeness.ts)
//   • The doc generator (generate-advisor-spec-docs.ts)
//   • Per-advisor *SpecPanel.tsx renderers
//
// Every field is REQUIRED. Empty arrays / empty strings / TODO
// markers are rejected by the completeness gate. No stubs.
// ═══════════════════════════════════════════════════════════════

import type { BusinessAdvisorId, AdvisorAuthorityLevel } from "../runtime/business-advisor-registry";

// ── Section 11: Automation Matrix (L0 → L5) ───────────────────
export type AutomationLevel = "L0" | "L1" | "L2" | "L3" | "L4" | "L5";

export interface AutomationLevelEntry {
  /** L0–L5 — see registry AdvisorAuthorityLevel mapping */
  readonly level: AutomationLevel;
  /** Short label, e.g. "Recommendation only", "Bounded automation" */
  readonly label: string;
  /** What the advisor IS allowed to do at this level */
  readonly canDo: readonly string[];
  /** What the advisor MUST NOT do autonomously at this level */
  readonly mustNotDo: readonly string[];
  /** Where explicit user approval is required */
  readonly approvalRequiredFor: readonly string[];
}

// ── Section 14: Simulation Contract ───────────────────────────
export interface SimulationScenarioType {
  /** Stable kebab-case scenario id (e.g. "script-ab-test") */
  readonly id: string;
  /** Human label */
  readonly label: string;
  /** What the user is comparing */
  readonly compares: string;
  /** Required input fields (names only — schema lives in the form) */
  readonly requiredInputs: readonly string[];
  /** Optional inputs */
  readonly optionalInputs: readonly string[];
  /** Output keys the simulation must produce */
  readonly outputs: readonly string[];
  /** Whether the result is non-authoritative (e.g. tax/legal) */
  readonly nonAuthoritative: boolean;
}

export interface SimulationContract {
  readonly summary: string;
  readonly scenarios: readonly SimulationScenarioType[];
}

// ── Section 22: Phase Roadmap ─────────────────────────────────
export interface PhaseRoadmapEntry {
  readonly title: string;
  readonly outcomes: readonly string[];
}

export interface PhaseRoadmap {
  readonly phase1: PhaseRoadmapEntry; // deployable core
  readonly phase2: PhaseRoadmapEntry; // deeper intelligence + integrations
  readonly phase3: PhaseRoadmapEntry; // bounded automation + advanced
}

// ── Section 7: Intelligence Behaviors ─────────────────────────
export interface IntelligenceBehavior {
  readonly name: string;
  readonly description: string;
}

// ── Section 17: Knowledge / Document Support ──────────────────
export interface KnowledgeSourceSpec {
  readonly label: string;
  readonly extracts: string;
  readonly scope: "workspace" | "project" | "global";
  readonly sensitivity: "low" | "medium" | "high" | "critical";
}

// ── Section 16: Proactive Behavior ────────────────────────────
export interface ProactiveSignalSpec {
  readonly trigger: string;
  readonly surface: string;
  readonly cadence: "real-time" | "daily" | "weekly" | "monthly" | "event-driven";
  readonly mode: "passive" | "suggested" | "action-oriented";
  readonly approvalRequired: boolean;
}

// ── Section 20: Testing Matrix ────────────────────────────────
export interface TestingMatrixEntry {
  readonly category:
    | "unit"
    | "component"
    | "integration"
    | "e2e"
    | "regression"
    | "error-state"
    | "explainability"
    | "receipt"
    | "authority"
    | "simulation"
    | "module-integration";
  readonly scenarios: readonly string[];
}

// ── Master spec ───────────────────────────────────────────────
export interface BusinessAdvisorSpec {
  // 1. Identity
  readonly id: BusinessAdvisorId;
  readonly displayName: string;
  readonly positioning: string;
  readonly distinction: string;
  readonly intelligenceArchetype: string;
  readonly userFeel: string;
  readonly trustedBy: string;

  // 2. Mission
  readonly mission: string;
  readonly problemSpace: string;
  readonly leverageCreated: string;
  readonly outcomesImproved: readonly string[];

  // 3. Domain Boundaries
  readonly handles: readonly string[];
  readonly doesNotHandle: readonly string[];
  readonly overlapsWith: readonly { advisorId: BusinessAdvisorId; reason: string }[];
  readonly escalatesTo: readonly { advisorId: BusinessAdvisorId; trigger: string }[];

  // 4. Use cases
  readonly coreUseCases: readonly string[];

  // 5. Typical user questions
  readonly typicalQuestions: readonly string[];

  // 6. Inputs / context
  readonly requiredInputs: readonly string[];
  readonly optionalInputs: readonly string[];
  readonly highValueFutureInputs: readonly string[];

  // 7. Intelligence behaviors
  readonly intelligenceBehaviors: readonly IntelligenceBehavior[];

  // 8. Output types
  readonly outputTypes: readonly string[];

  // 9. UI surfaces
  readonly uiSurfaces: readonly string[];

  // 10. Business OS integration points
  readonly osIntegrationPoints: readonly string[];

  // 11. Automation model — L0..L5
  readonly automationMatrix: readonly AutomationLevelEntry[];
  readonly currentAuthorityCeiling: AdvisorAuthorityLevel;

  // 12. Trust / Safety / Authority
  readonly trustRules: readonly string[];
  readonly disallowedAutonomousActions: readonly string[];
  readonly receiptedActions: readonly string[];

  // 13. Explainability
  readonly explainabilityRequirements: readonly string[];

  // 14. Simulation contract
  readonly simulation: SimulationContract;

  // 15. Memory / learning
  readonly memoryRules: readonly string[];

  // 16. Proactive behavior
  readonly proactiveSignals: readonly ProactiveSignalSpec[];

  // 17. Files / knowledge / docs
  readonly knowledgeSources: readonly KnowledgeSourceSpec[];

  // 18. Analytics
  readonly analyticsEvents: readonly string[];

  // 19. Admin oversight
  readonly adminOversightSurfaces: readonly string[];

  // 20. Testing matrix
  readonly testingMatrix: readonly TestingMatrixEntry[];

  // 21. Deployment-ready definition
  readonly definitionOfDone: readonly string[];

  // 22. Phase roadmap
  readonly roadmap: PhaseRoadmap;

  // 23. Wow differentiators
  readonly wowDifferentiators: readonly string[];

  /** Optional: for synthesis advisors (CEO), the advisors they read from */
  readonly synthesizesFrom?: readonly BusinessAdvisorId[];
}

// ── Completeness validation (used by CI gate AND runtime guard) ──

export interface SpecCompletenessIssue {
  readonly field: string;
  readonly reason: string;
}

const REQUIRED_AUTOMATION_LEVELS: readonly AutomationLevel[] = [
  "L0",
  "L1",
  "L2",
  "L3",
  "L4",
  "L5",
];

const STUB_PATTERNS = [/\bTODO\b/i, /\bTBD\b/i, /\bFIXME\b/i, /lorem ipsum/i];

function isStubString(value: string): boolean {
  if (!value || value.trim().length < 4) return true;
  return STUB_PATTERNS.some((rx) => rx.test(value));
}

function checkStrings(field: string, values: readonly string[], min: number, issues: SpecCompletenessIssue[]) {
  if (values.length < min) {
    issues.push({ field, reason: `expected at least ${min} entries, got ${values.length}` });
    return;
  }
  values.forEach((v, i) => {
    if (isStubString(v)) issues.push({ field: `${field}[${i}]`, reason: `stub or empty: "${v}"` });
  });
}

/**
 * Strict completeness check. Returns ALL issues so the gate can report
 * a full picture in one CI run. Empty `issues` array == spec is complete.
 */
export function validateAdvisorSpec(spec: BusinessAdvisorSpec): SpecCompletenessIssue[] {
  const issues: SpecCompletenessIssue[] = [];

  // 1. Identity
  for (const f of ["displayName", "positioning", "distinction", "intelligenceArchetype", "userFeel", "trustedBy"] as const) {
    if (isStubString(spec[f] as string)) issues.push({ field: f, reason: "stub or empty" });
  }

  // 2. Mission
  for (const f of ["mission", "problemSpace", "leverageCreated"] as const) {
    if (isStubString(spec[f] as string)) issues.push({ field: f, reason: "stub or empty" });
  }
  checkStrings("outcomesImproved", spec.outcomesImproved, 3, issues);

  // 3. Boundaries
  checkStrings("handles", spec.handles, 4, issues);
  checkStrings("doesNotHandle", spec.doesNotHandle, 3, issues);
  if (spec.overlapsWith.length === 0) {
    issues.push({ field: "overlapsWith", reason: "must declare at least one overlap (or self-overlap rationale)" });
  }
  if (spec.escalatesTo.length === 0 && spec.id !== "ceo-advisor") {
    issues.push({ field: "escalatesTo", reason: "non-CEO advisors must declare at least one escalation target" });
  }

  // 4 & 5
  checkStrings("coreUseCases", spec.coreUseCases, 6, issues);
  checkStrings("typicalQuestions", spec.typicalQuestions, 6, issues);

  // 6
  checkStrings("requiredInputs", spec.requiredInputs, 1, issues);
  checkStrings("optionalInputs", spec.optionalInputs, 1, issues);
  checkStrings("highValueFutureInputs", spec.highValueFutureInputs, 1, issues);

  // 7
  if (spec.intelligenceBehaviors.length < 5) {
    issues.push({ field: "intelligenceBehaviors", reason: `expected at least 5, got ${spec.intelligenceBehaviors.length}` });
  }
  spec.intelligenceBehaviors.forEach((b, i) => {
    if (isStubString(b.name) || isStubString(b.description)) {
      issues.push({ field: `intelligenceBehaviors[${i}]`, reason: "stub name/description" });
    }
  });

  // 8 & 9 & 10
  checkStrings("outputTypes", spec.outputTypes, 4, issues);
  checkStrings("uiSurfaces", spec.uiSurfaces, 4, issues);
  checkStrings("osIntegrationPoints", spec.osIntegrationPoints, 3, issues);

  // 11
  for (const lvl of REQUIRED_AUTOMATION_LEVELS) {
    const entry = spec.automationMatrix.find((e) => e.level === lvl);
    if (!entry) {
      issues.push({ field: `automationMatrix.${lvl}`, reason: "missing level entry" });
      continue;
    }
    if (isStubString(entry.label)) {
      issues.push({ field: `automationMatrix.${lvl}.label`, reason: "stub label" });
    }
    if (entry.canDo.length === 0) {
      issues.push({ field: `automationMatrix.${lvl}.canDo`, reason: "empty canDo" });
    }
    if (entry.mustNotDo.length === 0) {
      issues.push({ field: `automationMatrix.${lvl}.mustNotDo`, reason: "empty mustNotDo" });
    }
  }

  // 12
  checkStrings("trustRules", spec.trustRules, 4, issues);
  checkStrings("disallowedAutonomousActions", spec.disallowedAutonomousActions, 2, issues);

  // 13
  checkStrings("explainabilityRequirements", spec.explainabilityRequirements, 4, issues);

  // 14
  if (isStubString(spec.simulation.summary)) {
    issues.push({ field: "simulation.summary", reason: "stub or empty" });
  }
  if (spec.simulation.scenarios.length === 0) {
    issues.push({ field: "simulation.scenarios", reason: "must declare at least one scenario type" });
  }
  spec.simulation.scenarios.forEach((s, i) => {
    if (isStubString(s.id) || isStubString(s.label) || isStubString(s.compares)) {
      issues.push({ field: `simulation.scenarios[${i}]`, reason: "stub fields" });
    }
    if (s.requiredInputs.length === 0) {
      issues.push({ field: `simulation.scenarios[${i}].requiredInputs`, reason: "empty" });
    }
    if (s.outputs.length === 0) {
      issues.push({ field: `simulation.scenarios[${i}].outputs`, reason: "empty" });
    }
  });

  // 15
  checkStrings("memoryRules", spec.memoryRules, 3, issues);

  // 16
  if (spec.proactiveSignals.length < 2) {
    issues.push({ field: "proactiveSignals", reason: `expected at least 2, got ${spec.proactiveSignals.length}` });
  }
  spec.proactiveSignals.forEach((p, i) => {
    if (isStubString(p.trigger) || isStubString(p.surface)) {
      issues.push({ field: `proactiveSignals[${i}]`, reason: "stub trigger/surface" });
    }
  });

  // 17
  if (spec.knowledgeSources.length < 2) {
    issues.push({ field: "knowledgeSources", reason: `expected at least 2, got ${spec.knowledgeSources.length}` });
  }

  // 18 & 19
  checkStrings("analyticsEvents", spec.analyticsEvents, 4, issues);
  checkStrings("adminOversightSurfaces", spec.adminOversightSurfaces, 3, issues);

  // 20
  if (spec.testingMatrix.length < 5) {
    issues.push({ field: "testingMatrix", reason: `expected at least 5 categories, got ${spec.testingMatrix.length}` });
  }
  spec.testingMatrix.forEach((t, i) => {
    if (t.scenarios.length === 0) {
      issues.push({ field: `testingMatrix[${i}].scenarios`, reason: "empty" });
    }
  });

  // 21
  checkStrings("definitionOfDone", spec.definitionOfDone, 10, issues);

  // 22
  for (const phase of ["phase1", "phase2", "phase3"] as const) {
    const entry = spec.roadmap[phase];
    if (isStubString(entry.title)) issues.push({ field: `roadmap.${phase}.title`, reason: "stub" });
    if (entry.outcomes.length < 2) {
      issues.push({ field: `roadmap.${phase}.outcomes`, reason: "expected at least 2 outcomes" });
    }
  }

  // 23
  checkStrings("wowDifferentiators", spec.wowDifferentiators, 3, issues);

  return issues;
}

/** True iff spec passes the strict completeness gate. */
export function isAdvisorSpecComplete(spec: BusinessAdvisorSpec): boolean {
  return validateAdvisorSpec(spec).length === 0;
}