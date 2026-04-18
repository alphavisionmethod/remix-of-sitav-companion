// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment Policy Rules (16 rules from spec section 7)
// Integrates with the constitutional policy engine
// ═══════════════════════════════════════════════════════════════

import type { PolicyRule } from "./policy-engine";

/**
 * 16 investment-specific policy rules enforcing governance per spec.
 * These are merged with constitutional rules when domain === "investment".
 */
export const INVESTMENT_POLICY_RULES: readonly PolicyRule[] = [
  // 1. Trade execution always requires approval (below $10K; above $10K triggers dual-approval)
  {
    id: "inv-trade-approval",
    name: "Trade Execution Requires Approval",
    priority: 970,
    effect: "require-approval",
    conditions: [
      { field: "domain", operator: "eq", value: "investment" },
      { field: "capabilityId", operator: "contains", value: "trade" },
    ],
    reason: "All trade executions require human approval — no autonomous trading",
  },
  // 2. Leveraged positions denied if autonomous
  {
    id: "inv-leverage-deny-auto",
    name: "Leveraged Positions Denied if Autonomous",
    priority: 985,
    effect: "deny",
    conditions: [
      { field: "domain", operator: "eq", value: "investment" },
      { field: "isLeveraged", operator: "eq", value: true },
      { field: "isAutonomous", operator: "eq", value: true },
    ],
    reason: "Leveraged positions cannot be opened autonomously — always requires human control",
  },
  // 3. Large trades require dual approval ($10K+)
  {
    id: "inv-large-trade-dual-approval",
    name: "Large Trade Dual Approval ($10K+)",
    priority: 980,
    effect: "require-dual-approval",
    conditions: [
      { field: "domain", operator: "eq", value: "investment" },
      { field: "capabilityId", operator: "contains", value: "trade" },
      { field: "amount", operator: "gte", value: 10000 },
    ],
    reason: "Trades ≥ $10,000 require dual approval for safety",
  },
  // 4. Simulation required before real trades
  {
    id: "inv-simulation-first",
    name: "Simulation Required Before Real Trades",
    priority: 975,
    effect: "require-simulation",
    conditions: [
      { field: "domain", operator: "eq", value: "investment" },
      { field: "capabilityId", operator: "contains", value: "trade" },
      { field: "isSimulation", operator: "neq", value: true },
    ],
    reason: "All real trades must be simulated first — simulation-first policy",
  },
  // 5. Protection mode changes require approval
  {
    id: "inv-protection-mode-change",
    name: "Protection Mode Changes Require Approval",
    priority: 970,
    effect: "require-approval",
    conditions: [
      { field: "domain", operator: "eq", value: "investment" },
      { field: "capabilityId", operator: "contains", value: "protection-mode" },
    ],
    reason: "Changing protection mode settings requires explicit approval",
  },
  // 6. Reserve deployment requires coverage check
  {
    id: "inv-reserve-deployment-check",
    name: "Reserve Deployment Coverage Check",
    priority: 965,
    effect: "require-approval",
    conditions: [
      { field: "domain", operator: "eq", value: "investment" },
      { field: "capabilityId", operator: "contains", value: "reserve-deploy" },
    ],
    reason: "Deploying from reserves requires coverage adequacy verification and approval",
  },
  // 7. Crypto requires explicit approval
  {
    id: "inv-crypto-approval",
    name: "Crypto Transactions Require Approval",
    priority: 960,
    effect: "require-approval",
    conditions: [
      { field: "domain", operator: "eq", value: "investment" },
      { field: "assetClass", operator: "eq", value: "crypto" },
    ],
    reason: "All crypto transactions require explicit human approval",
  },
  // 8. FX requires explicit approval
  {
    id: "inv-fx-approval",
    name: "FX Transactions Require Approval",
    priority: 955,
    effect: "require-approval",
    conditions: [
      { field: "domain", operator: "eq", value: "investment" },
      { field: "assetClass", operator: "eq", value: "forex" },
    ],
    reason: "All FX transactions require explicit human approval",
  },
  // 9. Kill switch blocks all new trades
  {
    id: "inv-kill-switch",
    name: "Kill Switch — Block All New Trades",
    priority: 999,
    effect: "deny",
    conditions: [
      { field: "domain", operator: "eq", value: "investment" },
      { field: "killSwitchActive", operator: "eq", value: true },
    ],
    reason: "Kill switch is active — all new trade entries are blocked",
  },
  // 10. Mandate breach blocks new positions
  {
    id: "inv-mandate-breach-block",
    name: "Mandate Breach Blocks New Positions",
    priority: 988,
    effect: "deny",
    conditions: [
      { field: "domain", operator: "eq", value: "investment" },
      { field: "mandateBreached", operator: "eq", value: true },
      { field: "capabilityId", operator: "contains", value: "trade" },
    ],
    reason: "Active mandate breach — new positions blocked until resolved",
  },
  // 11. Leverage cap exceeded blocks entries
  {
    id: "inv-leverage-cap-block",
    name: "Leverage Cap Exceeded Blocks Entries",
    priority: 986,
    effect: "deny",
    conditions: [
      { field: "domain", operator: "eq", value: "investment" },
      { field: "leverageCapExceeded", operator: "eq", value: true },
    ],
    reason: "Leverage cap exceeded — no new leveraged entries until leverage is reduced",
  },
  // 12. Capital call shortfall requires dual approval ($50K+)
  {
    id: "inv-capital-call-dual-approval",
    name: "Capital Call Shortfall Dual Approval ($50K+)",
    priority: 978,
    effect: "require-dual-approval",
    conditions: [
      { field: "domain", operator: "eq", value: "investment" },
      { field: "capabilityId", operator: "contains", value: "capital-call" },
      { field: "amount", operator: "gte", value: 50000 },
    ],
    reason: "Capital call deployments ≥ $50K require dual approval",
  },
  // 13. Tax reserve underfunded blocks discretionary deployment
  {
    id: "inv-tax-reserve-block",
    name: "Tax Reserve Underfunded Blocks Deployment",
    priority: 972,
    effect: "deny",
    conditions: [
      { field: "domain", operator: "eq", value: "investment" },
      { field: "taxReserveUnderfunded", operator: "eq", value: true },
      { field: "capabilityId", operator: "contains", value: "deploy" },
    ],
    reason: "Tax reserve is underfunded — discretionary capital deployment blocked",
  },
  // 14. Regime crisis halts non-protective trades
  {
    id: "inv-regime-crisis-halt",
    name: "Regime Crisis Halts Non-Protective Trades",
    priority: 992,
    effect: "deny",
    conditions: [
      { field: "domain", operator: "eq", value: "investment" },
      { field: "regimeCrisis", operator: "eq", value: true },
      { field: "isProtectiveTrade", operator: "neq", value: true },
    ],
    reason: "Crisis regime active — only protective/hedging trades allowed",
  },
  // 15. Factor concentration requires approval
  {
    id: "inv-factor-concentration-approval",
    name: "Factor Concentration Requires Approval",
    priority: 950,
    effect: "require-approval",
    conditions: [
      { field: "domain", operator: "eq", value: "investment" },
      { field: "factorConcentrationHigh", operator: "eq", value: true },
    ],
    reason: "Factor concentration is high — new positions in concentrated factors require approval",
  },
  // 16. Venue concentration requires review
  {
    id: "inv-venue-concentration-review",
    name: "Venue Concentration Requires Review",
    priority: 945,
    effect: "require-approval",
    conditions: [
      { field: "domain", operator: "eq", value: "investment" },
      { field: "venueConcentrationHigh", operator: "eq", value: true },
    ],
    reason: "Venue concentration exceeds threshold — review counterparty risk before proceeding",
  },
] as const;

/**
 * Get all investment policy rules as mutable array for integration with policy engine.
 */
export function getInvestmentPolicyRules(): PolicyRule[] {
  return [...INVESTMENT_POLICY_RULES];
}
