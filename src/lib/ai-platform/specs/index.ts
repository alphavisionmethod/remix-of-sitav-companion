// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Advisor Spec Registry
//
// Imports each per-advisor spec (added one phase at a time) and
// re-exports a typed registry. Spec-tab + CI gate read from here.
// ═══════════════════════════════════════════════════════════════

// Per-advisor specs are registered (via side-effect imports below)
// into the low-level store in ./spec-registry. The CI completeness
// gate verifies every advisor in the runtime registry has a
// corresponding entry here AND that it passes validation.
export {
  registerAdvisorSpec,
  getAdvisorSpec,
  listAdvisorSpecs,
  hasAdvisorSpec,
} from "./spec-registry";

// ── Per-advisor spec registrations ────────────────────────────
// Each phase appends one import here. Side-effect imports register
// the spec into the map above.
//
// Phase 1 — Sales Advisor
import "./sales-advisor.spec";

// Phase 2 — Customer Service Advisor
import "./customer-service-advisor.spec";

// Phase 3 — CFO Advisor
import "./cfo-advisor.spec";

// Phase 4 — Marketing & Advertising Advisor
import "./marketing-advertising-advisor.spec";

export type {
  BusinessAdvisorSpec,
  AutomationLevel,
  AutomationLevelEntry,
  SimulationContract,
  SimulationScenarioType,
  PhaseRoadmap,
  PhaseRoadmapEntry,
  IntelligenceBehavior,
  KnowledgeSourceSpec,
  ProactiveSignalSpec,
  TestingMatrixEntry,
  SpecCompletenessIssue,
} from "./spec-types";
export { validateAdvisorSpec, isAdvisorSpecComplete } from "./spec-types";