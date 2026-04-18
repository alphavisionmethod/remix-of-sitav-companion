// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Evidence Public API
// Canonical entry point for runtime evidence collection.
// ═══════════════════════════════════════════════════════════════

export type {
  RuntimeEvidenceRecord,
  RuntimeEvidenceBundle,
  RuntimeEvidenceCollector,
  RuntimeEvidenceCollectorRegistration,
} from "./runtime-evidence-types";

export {
  RUNTIME_EVIDENCE_COLLECTORS,
  getCollector,
  getManifestIdsWithEvidence,
  runAllCollectors,
} from "./runtime-evidence-registry";
