// ═══════════════════════════════════════════════════════════════
// SITA OS — CI Umbrella Layer Barrel (Phase 8)
// Canonical import: @/lib/ci
// ═══════════════════════════════════════════════════════════════

export type {
  CIGateEntry,
  CIGateId,
  CIGateHealth,
  CIGateSeverity,
  CIPhase,
  CIPhaseSummary,
  CITrigger,
  CIUmbrellaSnapshot,
  CIGateIntegrityIssue,
  CIGateIntegrityReport,
} from "./ci-gate-types";

export { CI_GATE_REGISTRY, CI_PHASE_DISPLAY } from "./ci-gate-registry";

export {
  listAllGates,
  getGatesByPhase,
  getGatesForContext,
  resolveGateById,
  listPhases,
  buildPhaseSummaries,
  computeCIUmbrellaSnapshot,
  evaluateReleaseReadiness,
  classifyGateHealth,
} from "./ci-umbrella-evaluator";

export { validateCIUmbrellaIntegrity } from "./ci-umbrella-integrity";
