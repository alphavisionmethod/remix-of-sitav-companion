// ═══════════════════════════════════════════════════════════════
// SITA OS — Intelligence Architecture Barrel Export
// ═══════════════════════════════════════════════════════════════

// 3.2 — Signal Intake Layer
export {
  normalizeSignal, filterByRoute,
} from "./signal-intake";
export type {
  SignalSource, RawSignal, NormalizedSignal, SignalRoute,
} from "./signal-intake";

// 3.3 — Intelligence Asset Generation Layer
export {
  generateAsset, shouldGenerateAsset,
} from "./asset-generation";
export type {
  AssetGenerationSource, AssetGenerationInput, AssetGenerationResult,
} from "./asset-generation";

// 3.4 — Pattern Extraction Layer
export {
  extractPattern, fingerprintSimilarity,
} from "./pattern-extraction";
export type {
  PatternType, PrivacyClass, ExtractedPattern, PatternExtractionInput,
} from "./pattern-extraction";

// 3.5 — Differential Reasoning Engine
export {
  analyzeDifferential, evaluateEscalation,
} from "./differential-reasoning-engine";
export type {
  VerifiedState, MaterialDelta, DifferentialAnalysis, EscalationGate,
} from "./differential-reasoning-engine";

// 3.6 — Domain Packet Compiler
export {
  compileDomainPacket, isPacketFresh, packetNeedsRecompile,
} from "./domain-packet-compiler";
export type {
  DomainId, DomainIntelligencePacket, DomainChange,
  DomainRisk, PriorRecommendation, ConfidenceProfile,
} from "./domain-packet-compiler";

// 3.7 — Reuse Decision Engine
export {
  decideReuse,
} from "./reuse-decision-engine";
export type {
  ReuseMode, ReuseDecisionInput, ReuseDecisionOutput,
} from "./reuse-decision-engine";

// Intelligence Reuse Engine (core)
export {
  evaluateReuse, computeLibraryStats, createAsset,
} from "./intelligence-reuse-engine";
export type {
  IntelligenceAssetType, IntelligenceAsset,
  ReuseCandidate, ReuseDecision, AssetLibraryStats,
} from "./intelligence-reuse-engine";

// 3.9 — Efficiency Scoring
export {
  computeEfficiencyScore,
} from "./efficiency-scoring";
export type {
  EfficiencyScore, OutcomeType,
} from "./efficiency-scoring";

// 3.10 — Outcome Economics Engine
export {
  evaluateOutcomeEconomics, analyzeReasoningPaths,
  estimateOutcomeValue, OUTCOME_VALUE_BENCHMARKS,
} from "./outcome-economics-engine";
export type {
  OutcomeEconomicsInput, OutcomeEconomicsResult,
  OutcomeCategory, ReasoningPathEconomics,
} from "./outcome-economics-engine";

// 3.11 — Cross-Tenant Generalization
export {
  generalizePattern, evaluateGeneralizationEligibility,
} from "./cross-tenant-generalization";
export type {
  GeneralizedPattern,
} from "./cross-tenant-generalization";

// Pipeline Orchestrator
export {
  processSignal,
} from "./intelligence-pipeline";
export type {
  PipelineResult,
} from "./intelligence-pipeline";
