// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Gateway Service Barrel
// Central AI intelligence infrastructure
// ═══════════════════════════════════════════════════════════════

// Domain types
export * from "./types";

// Provider & Model registry
export {
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
} from "./routing.service";

// Budget & Cost
export {
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
  getReceiptStats,
} from "./receipts.service";

// Launch honesty
export {
  getAILaunchHonestyBoard,
  type AICapabilityLaunchStatus,
} from "./launch-honesty.service";
