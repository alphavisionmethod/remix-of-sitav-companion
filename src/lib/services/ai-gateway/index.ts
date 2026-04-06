// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Gateway Service Barrel
// Central AI intelligence infrastructure
// ═══════════════════════════════════════════════════════════════

// Domain types
export * from "./types";

// Provider & Model registry
export {
  getProviderRegistry,
  getActiveProviders,
  getAIModelRegistry,
  getActiveModels,
  getModelsByProvider,
  getProviderHealth,
  getProviderHealthByProvider,
  getDistinctProviders,
} from "./provider-registry.service";

// Routing policies
export {
  getRoutingPolicies,
  getActiveRoutingPolicies,
  getRoutingForCapability,
  getCapabilityRouting,
  getActiveCapabilityRouting,
  getCapabilityRoutingByKey,
} from "./routing.service";

// Budget & Cost
export {
  getBudgetPolicies,
  getActiveBudgetPolicies,
  getBudgetAlerts,
  getActiveAlerts,
  getUsageLedger,
  getCostLedger,
  getCostByProvider,
  getTokenUsage,
  getPortfolioAllocations,
  getBudgetSummary,
} from "./budget.service";

// Receipts & Trace
export {
  getInferenceReceipts,
  getReceiptsByProvider,
  getTaskRequests,
  getTaskRequestsByStatus,
  getReceiptRecords,
  getFallbackEvents,
  getReceiptStats,
} from "./receipts.service";

// Launch honesty
export {
  getLaunchHonestyRecords,
  getAILaunchHonestyBoard,
  type AICapabilityLaunchStatus,
} from "./launch-honesty.service";

// Degraded state diagnostics
export {
  getDegradedDiagnostics,
  type DegradedDiagnostic,
} from "./diagnostics.service";
