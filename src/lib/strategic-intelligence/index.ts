// ═══════════════════════════════════════════════════════════════
// SITA OS — Strategic Intelligence Layer Barrel Export
// ═══════════════════════════════════════════════════════════════

export { computeCapitalIndex, valuateAsset } from "./intelligence-capital-index";
export type { IntelligenceCapitalSnapshot, DomainCapitalScore, AssetValuation } from "./intelligence-capital-index";

export { computeCostToConfidenceCurve, analyzeCurve } from "./cost-to-confidence";
export type { ConfidenceDataPoint, CostToConfidenceCurve, CurveRecommendation, CurveAnalysis } from "./cost-to-confidence";

export { getQualityFloor, checkQualityFloor, DEFAULT_QUALITY_FLOORS } from "./quality-floor-engine";
export type { QualityFloor, QualityCheckInput, QualityCheckResult, QualityViolation } from "./quality-floor-engine";

export { evaluateInsurance, DEFAULT_INSURANCE_POLICIES } from "./intelligence-insurance";
export type { InsuranceAction, InsurancePolicy, InsuranceEvaluation, InsuranceInput } from "./intelligence-insurance";

export { analyzeMarket } from "./intelligence-market";
export type { MarketAllocation, AllocationRecommendation, MarketSnapshot, AllocationInput } from "./intelligence-market";

export { analyzeTimeToTruth, suggestOptimizations } from "./time-to-truth";
export type { TimeToTruthMetrics, TimeBottleneck, TimeOptimization, TimeOptimizationAction } from "./time-to-truth";

export { createReasoningReplay, addConsideredPath, addSkippedPath, addEscalation, addReusedAsset, setFinalRoute, addConfidenceCheckpoint, finalizeReplay } from "./reasoning-replay";
export type { ReasoningReplay, ConsideredPath, SkippedPath, EscalationEvent, ReusedAssetRef, FinalRouteDecision, ConfidenceCheckpoint } from "./reasoning-replay";

export { monitorDecay, DEFAULT_DECAY_CONFIG } from "./intelligence-decay";
export type { DecayType, DecayAlert, DecayMonitorConfig, AssetHealthInput } from "./intelligence-decay";

export { getPortfolioPolicy, computePortfolioSnapshot, DEFAULT_PORTFOLIO_POLICIES } from "./ai-portfolio-allocation";
export type { AllocationCategory, PortfolioPolicy, TargetAllocation, PortfolioSnapshot, ActualAllocation, DriftAlert, RebalanceAction } from "./ai-portfolio-allocation";

export { createExperiment, evaluateExperiment, summarizeBenchmarks } from "./benchmark-lab";
export type { BenchmarkDimension, BenchmarkExperiment, BenchmarkResult, BenchmarkSummary, BenchmarkInsight } from "./benchmark-lab";

export { scoreValueRisk, batchScoreValueRisk } from "./value-risk-matrix";
export type { ValueRiskInput, ValueRiskScore, ValueRiskQuadrant, RouteRecommendation } from "./value-risk-matrix";

export { createDefaultProfile, updateProfileFromSignal, shouldAdaptOutput } from "./operator-taste-memory";
export type { OperatorTasteProfile, ApprovalBehavior, RejectionPattern, OverridePattern, DomainTaste, TasteSignal } from "./operator-taste-memory";
