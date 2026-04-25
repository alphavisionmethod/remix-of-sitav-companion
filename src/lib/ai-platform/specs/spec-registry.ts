// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Spec Registry (low-level store)
//
// Extracted from index.ts to avoid circular imports between
// index.ts (which side-effect-imports each per-advisor spec) and
// each spec file (which calls registerAdvisorSpec at module load).
//
// Per-advisor *.spec.ts files MUST import from this file, NOT from
// ./index, so the registration symbols are resolved before the
// side-effect imports in index.ts run.
// ═══════════════════════════════════════════════════════════════

import type { BusinessAdvisorId } from "../runtime/business-advisor-registry";
import type { BusinessAdvisorSpec } from "./spec-types";

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