// ═══════════════════════════════════════════════════════════════
// SITA OS — CI Layer Barrel (Phase 8)
// Canonical import: @/lib/ci
// ═══════════════════════════════════════════════════════════════

export type {
  CIGatePhase,
  CIGateSeverity,
  CIGateOwner,
  CIGateEntry,
  CIGateEvaluation,
  CIUmbrellaIntegrityIssue,
  CIUmbrellaIntegrityReport,
} from "./ci-gate-types";

export {
  CI_GATE_REGISTRY,
  listGatesByPhase,
  findGate,
  gatesByOwner,
  blockerCount,
} from "./ci-gate-registry";

export type { ReleaseReadiness } from "./ci-umbrella-evaluator";
export {
  evaluateReleaseReadiness,
  gatesPendingEvaluation,
} from "./ci-umbrella-evaluator";

export { validateCIUmbrellaIntegrity } from "./ci-umbrella-integrity";
