// ═══════════════════════════════════════════════════════════════
// SITA OS — Shared demo data: ConscienceGate verdicts
// Extracted from ConscienceGateDashboard for boundary compliance
// ═══════════════════════════════════════════════════════════════

import type { GateVerdict } from "@/lib/core-services/conscience-gate/conscience-gate";

export const DEMO_CONSCIENCE_VERDICTS: Array<GateVerdict & { id: string }> = [
  {
    id: "v-001",
    decision: "pass",
    taskType: "advisor.summarize",
    riskClass: "standard",
    evidenceState: { sufficient: true, sourcesAvailable: 4, sourcesRequired: 2, missingTypes: [] },
    budgetState: { allowed: true, estimatedCostCents: 3, budgetClass: "standard", remainingBudgetCents: 480, shouldDowngrade: false },
    routingHints: { preferredProvider: "openai", preferredModel: "gpt-4o-mini", maxLatencyMs: 2000, routingClass: "standard", deterministicPath: false },
    retrievalRequired: false, critiqueRequired: false, approvalRequired: false, deterministicRequired: false,
    reasons: ["All evidence sufficient", "Budget within limits"],
    timestamp: new Date(Date.now() - 120000).toISOString(), correlationId: "corr-001",
  },
  {
    id: "v-002",
    decision: "caveat",
    taskType: "advisor.financial_advice",
    riskClass: "elevated",
    evidenceState: { sufficient: true, sourcesAvailable: 3, sourcesRequired: 3, missingTypes: [] },
    budgetState: { allowed: true, estimatedCostCents: 12, budgetClass: "premium", remainingBudgetCents: 200, shouldDowngrade: false },
    routingHints: { preferredProvider: "anthropic", preferredModel: "claude-sonnet", maxLatencyMs: 5000, routingClass: "premium", deterministicPath: false },
    retrievalRequired: true, critiqueRequired: true, approvalRequired: false, deterministicRequired: false,
    reasons: ["High-risk domain requires critique loop", "Grounding mandatory"],
    timestamp: new Date(Date.now() - 300000).toISOString(), correlationId: "corr-002",
  },
  {
    id: "v-003",
    decision: "block",
    taskType: "advisor.execute_trade",
    riskClass: "critical",
    evidenceState: { sufficient: false, sourcesAvailable: 1, sourcesRequired: 3, missingTypes: ["market_data", "portfolio_state"] },
    budgetState: { allowed: false, estimatedCostCents: 45, budgetClass: "premium", remainingBudgetCents: 20, shouldDowngrade: true },
    routingHints: { preferredProvider: "anthropic", preferredModel: "claude-opus", maxLatencyMs: 10000, routingClass: "critical", deterministicPath: true },
    retrievalRequired: true, critiqueRequired: true, approvalRequired: true, deterministicRequired: true,
    reasons: ["Insufficient evidence sources", "Budget exceeded", "Critical risk requires approval"],
    timestamp: new Date(Date.now() - 600000).toISOString(), correlationId: "corr-003",
  },
  {
    id: "v-004",
    decision: "refuse",
    taskType: "advisor.delete_account",
    riskClass: "critical",
    evidenceState: { sufficient: false, sourcesAvailable: 0, sourcesRequired: 5, missingTypes: ["identity_proof", "authorization", "cooldown_period", "confirmation", "backup_verified"] },
    budgetState: { allowed: false, estimatedCostCents: 0, budgetClass: "critical", remainingBudgetCents: 0, shouldDowngrade: false },
    routingHints: { maxLatencyMs: 0, routingClass: "blocked", deterministicPath: true },
    retrievalRequired: false, critiqueRequired: false, approvalRequired: true, deterministicRequired: true,
    reasons: ["Destructive action blocked by constitution", "Missing all required evidence"],
    timestamp: new Date(Date.now() - 900000).toISOString(), correlationId: "corr-004",
  },
  {
    id: "v-005",
    decision: "pass",
    taskType: "concierge.schedule_reminder",
    riskClass: "standard",
    evidenceState: { sufficient: true, sourcesAvailable: 1, sourcesRequired: 1, missingTypes: [] },
    budgetState: { allowed: true, estimatedCostCents: 1, budgetClass: "micro", remainingBudgetCents: 999, shouldDowngrade: false },
    routingHints: { preferredModel: "gpt-4o-mini", maxLatencyMs: 1000, routingClass: "fast", deterministicPath: true },
    retrievalRequired: false, critiqueRequired: false, approvalRequired: false, deterministicRequired: false,
    reasons: ["Low-risk task", "Budget nominal"],
    timestamp: new Date(Date.now() - 60000).toISOString(), correlationId: "corr-005",
  },
];
