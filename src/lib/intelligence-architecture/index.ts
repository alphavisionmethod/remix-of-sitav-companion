// ═══════════════════════════════════════════════════════════════
// SITA OS — Intelligence Architecture Barrel Export
// ═══════════════════════════════════════════════════════════════

export {
  evaluateReuse, computeLibraryStats, createAsset,
} from "./intelligence-reuse-engine";
export type {
  IntelligenceAssetType, IntelligenceAsset,
  ReuseCandidate, ReuseDecision, AssetLibraryStats,
} from "./intelligence-reuse-engine";

export {
  analyzeDifferential, evaluateEscalation,
} from "./differential-reasoning-engine";
export type {
  VerifiedState, MaterialDelta, DifferentialAnalysis, EscalationGate,
} from "./differential-reasoning-engine";

export {
  compileDomainPacket, isPacketFresh, packetNeedsRecompile,
} from "./domain-packet-compiler";
export type {
  DomainId, DomainIntelligencePacket, DomainChange,
  DomainRisk, PriorRecommendation, ConfidenceProfile,
} from "./domain-packet-compiler";

export {
  computeEfficiencyScore, computeOutcomeEconomics,
} from "./efficiency-scoring";
export type {
  EfficiencyScore, OutcomeType, OutcomeRecord,
  OutcomeEconomicsReport, AnonymizedPattern,
} from "./efficiency-scoring";
