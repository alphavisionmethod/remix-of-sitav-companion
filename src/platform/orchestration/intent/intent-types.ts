// ═══════════════════════════════════════════════════════════════
// SITA OS — Intent Types (Intent Layer)
// Re-exports and additional intent-specific types
// ═══════════════════════════════════════════════════════════════

export type { IntentClassification, RiskTier } from "./intent-orchestrator";
export type { RoutingDecision } from "./decision-router";
export type { RankedRecommendation } from "./recommendation-prioritizer";
export type { IssueSignal, SelectedIssue } from "./issue-selection-engine";
export type { OpportunitySignal, SelectedOpportunity } from "./opportunity-selection-engine";
export type { EscalationDecision } from "./escalation-router";
