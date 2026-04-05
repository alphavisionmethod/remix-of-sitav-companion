// ═══════════════════════════════════════════════════════════════
// SITA OS — Architecture Layer Barrel Export
// ═══════════════════════════════════════════════════════════════

export {
  CANONICAL_SERVICES, SERVICE_COUNT,
  getService, getServicesByTier, getAbsorbedServices,
  isCanonicalService, getCanonicalOwner, validateServiceCount,
} from "./canonical-service-registry";
export type { CanonicalService, ServiceTier } from "./canonical-service-registry";

export {
  DOMAIN_HIERARCHY,
  isDomainModule, isSubmoduleOf, getSubmoduleDomain,
  getFormerStandalones, validateNoDomain4,
} from "./domain-hierarchy";
export type { DomainModule, DomainSubmodule } from "./domain-hierarchy";

export {
  EXECUTION_CHAIN,
  validateEnvelope, isStageReachable,
} from "./canonical-execution-chain";
export type { ExecutionStage, ExecutionEnvelope, ExecutionReceipt, RefusalReceipt } from "./canonical-execution-chain";

export {
  createProofRecord, chainProofs,
} from "./unified-proof-layer";
export type { ProofRecord, ProofType, EvidenceGrade, EvidenceBundle, ReplayableProjection } from "./unified-proof-layer";

export {
  createMemory, correctMemory, forgetMemory, detectConflict,
} from "./unified-memory-system";
export type { MemoryRecord, MemoryType, PrivacyTier, MemoryConfidence, MemorySource, MemoryConflict, MemoryCorrection } from "./unified-memory-system";
