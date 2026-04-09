// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Data Facade: Investment Office
// Re-exports all investment demo data + core-service facades
// ═══════════════════════════════════════════════════════════════

// Re-export all demo data from the .tsx file
export * from "./investment.tsx";

// Re-export investment service functions (facade layer)
export {
  getWatchlist,
  getTradeReviewPackets,
  getExecutionIntents,
  getOpportunityScores,
  getAvailableTrustModes,
  getInvestmentTrustMode,
} from "@/lib/core-services/finance-os/investment-office.service";

export {
  INVESTMENT_POLICY_RULES,
  getInvestmentPolicyRules,
} from "@/lib/core-services/investment-policy-rules";
