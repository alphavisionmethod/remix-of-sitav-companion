// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Investment Office
// ═══════════════════════════════════════════════════════════════

import type { Position, CapitalBucket, Thesis } from "@/lib/domain-engines/investment-office";

export const MOCK_CAPITAL_BUCKETS: CapitalBucket[] = [
  { id: "b1", name: "Personal Checking", type: "personal-cash", balance: 24500, currency: "USD", entityOwner: "Personal", ringfenced: false },
  { id: "b2", name: "Business Operating", type: "business-cash", balance: 67800, currency: "USD", entityOwner: "Business", ringfenced: false },
  { id: "b3", name: "Emergency Reserve", type: "reserve-emergency", balance: 35000, targetBalance: 50000, currency: "USD", entityOwner: "Personal", ringfenced: true },
  { id: "b4", name: "Tax Reserve", type: "reserve-tax", balance: 18000, targetBalance: 22000, currency: "USD", entityOwner: "Business", ringfenced: true },
  { id: "b5", name: "Growth Fund", type: "reserve-growth", balance: 15000, targetBalance: 25000, currency: "USD", entityOwner: "Business", ringfenced: false },
  { id: "b6", name: "Investing Capital", type: "investing-capital", balance: 42000, currency: "USD", entityOwner: "Personal", ringfenced: false },
  { id: "b7", name: "Household Fund", type: "household-cash", balance: 8200, currency: "USD", entityOwner: "Household", ringfenced: false },
  { id: "b8", name: "College Sinking Fund", type: "sinking-fund", balance: 12000, targetBalance: 80000, currency: "USD", entityOwner: "Household", ringfenced: true },
];

export const MOCK_POSITIONS: Position[] = [
  { id: "p1", symbol: "SPY", name: "S&P 500 ETF", assetClass: "equity", quantity: 45, avgCostBasis: 420, currentPrice: 485, currency: "USD", venue: "Schwab", custodyType: "brokerage" },
  { id: "p2", symbol: "BTC", name: "Bitcoin", assetClass: "crypto", quantity: 0.35, avgCostBasis: 38000, currentPrice: 62000, currency: "USD", venue: "Coinbase", custodyType: "exchange" },
  { id: "p3", symbol: "TLT", name: "20+ Year Treasury", assetClass: "fixed-income", quantity: 80, avgCostBasis: 102, currentPrice: 94, currency: "USD", venue: "Schwab", custodyType: "brokerage" },
  { id: "p4", symbol: "GLD", name: "Gold ETF", assetClass: "commodity", quantity: 30, avgCostBasis: 175, currentPrice: 192, currency: "USD", venue: "Schwab", custodyType: "brokerage" },
  { id: "p5", symbol: "ETH", name: "Ethereum", assetClass: "crypto", quantity: 3.2, avgCostBasis: 2200, currentPrice: 3100, currency: "USD", venue: "Coinbase", custodyType: "exchange" },
  { id: "p6", symbol: "CASH", name: "Cash Sweep", assetClass: "cash", quantity: 15000, avgCostBasis: 1, currentPrice: 1, currency: "USD", venue: "Schwab", custodyType: "brokerage" },
];

export const MOCK_THESES: Thesis[] = [
  { id: "t1", title: "S&P momentum continuation", asset: "SPY", direction: "long", rationale: "Earnings growth + AI capex cycle", catalysts: ["Q2 earnings season", "Fed rate cut"], invalidationConditions: ["VIX > 30", "Yield curve re-inversion"], sizeLogic: "Core 30% position", regimeContext: "Risk-on trend regime", confidence: 0.72, status: "active", createdAt: Date.now() - 60 * 86400000, approvalStatus: "approved", proofIds: ["proof-001"] },
  { id: "t2", title: "BTC halving cycle thesis", asset: "BTC", direction: "long", rationale: "Post-halving supply reduction + institutional adoption", catalysts: ["ETF inflows", "Halving effect"], invalidationConditions: ["Regulatory ban", "Exchange collapse"], sizeLogic: "Speculative 5% allocation", regimeContext: "Crypto risk-on", confidence: 0.55, status: "active", createdAt: Date.now() - 120 * 86400000, approvalStatus: "approved", proofIds: ["proof-002"] },
  { id: "t3", title: "Duration hedge — rates peak", asset: "TLT", direction: "long", rationale: "Rate cuts ahead, duration to rally", catalysts: ["Fed pivot", "Recession signal"], invalidationConditions: ["Inflation re-acceleration", "Fiscal crisis"], sizeLogic: "Hedge 15% allocation", regimeContext: "Rate cycle inflection", confidence: 0.48, status: "active", createdAt: Date.now() - 30 * 86400000, approvalStatus: "approved", proofIds: [] },
];
