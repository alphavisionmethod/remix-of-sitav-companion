// ═══════════════════════════════════════════════════════════════
// SITA OS — Compute Governance Barrel Export
// ═══════════════════════════════════════════════════════════════

export {
  routeTask, classifyTask,
  DEFAULT_MODELS, COST_CLASS_SPECS,
} from "./model-routing-engine";
export type {
  ComputeModelTier, ModelDefinition, RoutingContext,
  CostClass, RoutingDecision,
} from "./model-routing-engine";

export {
  detectAnomalies, calculateMargin, selectMitigation,
} from "./margin-protection";
export type {
  AnomalyType, MitigationAction, CostAnomaly,
  MarginSnapshot, TenantEconomics,
} from "./margin-protection";

export {
  PLANS, checkEntitlement, getComputeBudget,
} from "./plan-entitlements";
export type {
  PlanDefinition, PlanEntitlements, EntitlementCheckResult,
} from "./plan-entitlements";

export {
  CLASS_COMPRESSION, estimateCompression,
  shouldUseCache, checkDeepReasoningEligibility,
} from "./context-compression";
export type {
  CompressionMethod, CompressionConfig, CompressionResult,
  CacheEntry, CacheStats,
  DeepReasoningMode, DeepReasoningRequest,
} from "./context-compression";

export {
  checkBudget, forecastSpend, createEnvelope,
} from "./budget-policy-engine";
export type {
  BudgetScope, BudgetEnvelope, BudgetStatus,
  BudgetCheckResult, BudgetSpendEvent, SpendForecast,
} from "./budget-policy-engine";
