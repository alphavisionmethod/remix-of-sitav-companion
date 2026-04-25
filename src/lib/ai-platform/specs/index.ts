// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Advisor Spec Registry
//
// Imports each per-advisor spec (added one phase at a time) and
// re-exports a typed registry. Spec-tab + CI gate read from here.
// ═══════════════════════════════════════════════════════════════

import type { BusinessAdvisorId } from "../runtime/business-advisor-registry";
import type { BusinessAdvisorSpec } from "./spec-types";

// Per-advisor specs are registered as their phases complete. The
// CI completeness gate verifies every advisor in the registry has
// a corresponding entry here AND that the entry passes validation.
const _specs = new Map<BusinessAdvisorId, BusinessAdvisorSpec>();

export function registerAdvisorSpec(spec: BusinessAdvisorSpec): void {
  if (_specs.has(spec.id)) {
    throw new Error(`[advisor-specs] duplicate spec for ${spec.id}`);
  }
  _specs.set(spec.id, spec);
}

export function getAdvisorSpec(id: BusinessAdvisorId): BusinessAdvisorSpec | undefined {
  return _specs.get(id);
}

export function listAdvisorSpecs(): readonly BusinessAdvisorSpec[] {
  return Array.from(_specs.values());
}

export function hasAdvisorSpec(id: BusinessAdvisorId): boolean {
  return _specs.has(id);
}

// ── Per-advisor spec registrations ────────────────────────────
// Each phase appends one import here. Side-effect imports register
// the spec into the map above.
//
// Phase 1 — Sales Advisor
// (added when phase 1 completes)

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