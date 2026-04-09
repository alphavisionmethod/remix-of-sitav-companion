// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Data Facade: Investment Office
// Pages import from here instead of core-services directly
// ═══════════════════════════════════════════════════════════════

export {
  getPortfolioSummary,
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
