// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment Office Types
// Full data model for instruments, portfolios, advisors, theses, execution
// ═══════════════════════════════════════════════════════════════

export type AssetClass = "stocks" | "etfs" | "crypto" | "commodities" | "events" | "cash";
export type InstrumentStatus = "active" | "halted" | "delisted" | "upcoming";
export type TradeAction = "buy" | "sell" | "allocate" | "rebalance";
export type TradeStatus = "draft" | "reviewing" | "approved" | "executing" | "executed" | "failed" | "cancelled";
export type ThesisConviction = "high" | "medium" | "low" | "watching";
export type RiskLevel = "very-low" | "low" | "moderate" | "high" | "very-high";
export type MarketRegime = "bull" | "bear" | "sideways" | "volatile" | "unknown";
export type AdvisorDomain = "macro" | "equity" | "crypto" | "commodities" | "events" | "risk" | "execution" | "behavioral" | "income";
export type AdvisorConfidenceLevel = "high" | "moderate" | "low" | "insufficient-signal";
export type AdvisorRecommendation = "observe" | "research-more" | "wait" | "watch-catalyst" | "size-small" | "reduce" | "hedge" | "avoid" | "high-uncertainty" | "proceed-carefully" | "execute-now";
export type AdvisorTimeHorizon = "intraday" | "near-term" | "medium-term" | "long-term";

export interface Instrument {
  id: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  sector?: string;
  theme?: string[];
  price: number;
  change24h: number;
  changePct24h: number;
  marketCap?: number;
  volume24h?: number;
  high52w?: number;
  low52w?: number;
  status: InstrumentStatus;
  description: string;
  logoIcon: string;
  catalysts: Catalyst[];
  riskLevel: RiskLevel;
  bullCase?: string;
  bearCase?: string;
  uncertainty?: string;
}

export interface Catalyst {
  id: string;
  title: string;
  date: string;
  type: "earnings" | "product" | "regulatory" | "macro" | "event" | "expiry";
  impact: "positive" | "negative" | "neutral" | "unknown";
  description: string;
}

export interface Holding {
  id: string;
  instrumentId: string;
  instrument: Instrument;
  platform: string;
  quantity: number;
  avgCost: number;
  currentValue: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  weight: number;
  acquiredAt: string;
}

export interface Portfolio {
  totalValue: number;
  totalCash: number;
  totalPnl: number;
  totalPnlPct: number;
  holdings: Holding[];
  allocationByClass: Record<AssetClass, number>;
  allocationBySector: Record<string, number>;
  riskScore: number;
  regime: MarketRegime;
  lastSyncAt: string;
}

export interface Watchlist {
  id: string;
  name: string;
  instruments: Instrument[];
}

export interface InvestmentThesis {
  id: string;
  instrumentId: string;
  title: string;
  rationale: string;
  conviction: ThesisConviction;
  timeHorizon: string;
  assumptions: string[];
  catalystExpectations: string[];
  riskFactors: string[];
  entryPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  status: "active" | "closed" | "reviewing";
  createdAt: string;
  updatedAt: string;
  reviewReminder?: string;
  lessonsLearned?: string;
}

export interface TradeOrder {
  id: string;
  instrumentId: string;
  instrument: Instrument;
  action: TradeAction;
  quantity: number;
  orderType: "market" | "limit" | "stop";
  limitPrice?: number;
  platform: string;
  estimatedCost: number;
  estimatedFees: number;
  riskPreview: string;
  status: TradeStatus;
  rationale: string;
  thesisId?: string;
  approvalRequired: boolean;
  receiptId?: string;
  createdAt: string;
  executedAt?: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  assumptions: { label: string; value: string }[];
  projectedReturn: number;
  projectedDrawdown: number;
  probability: number;
}

export type PlatformType = "brokerage" | "exchange" | "event-market" | "research" | "wallet" | "dex" | "forex" | "international-broker";

export interface PlatformConnection {
  id: string;
  name: string;
  type: PlatformType;
  status: "connected" | "disconnected" | "syncing" | "error";
  lastSyncAt?: string;
  accountValue?: number;
  icon: string;
  chain?: string;
  region?: string;
  popular?: boolean;
  capabilities?: string[];
  authMethod?: "oauth" | "api-key" | "wallet-connect" | "extension";
}

export interface AvailablePlatform {
  name: string;
  type: PlatformType;
  icon: string;
  chain?: string;
  region?: string;
  popular?: boolean;
  capabilities?: string[];
  authMethod?: "oauth" | "api-key" | "wallet-connect" | "extension";
}

// ── Enhanced Advisor System (Part 3 Spec) ──

export interface AdvisorWatchItem {
  label: string;
  status: "stable" | "changing" | "alert";
  detail: string;
}

export interface AdvisorViewByHorizon {
  horizon: AdvisorTimeHorizon;
  view: string;
  confidence: AdvisorConfidenceLevel;
}

export interface AdvisorPriorView {
  date: string;
  view: string;
  resolved: boolean;
  outcome?: string;
}

export interface AdvisorDebatePosition {
  advisorId: string;
  position: string;
  confidence: number;
  reasoning: string;
}

export interface InvestmentAdvisor {
  id: string;
  domain: AdvisorDomain;
  name: string;
  title: string;
  icon: string;
  color: string;
  currentInsight: string;
  confidence: number;
  watchingCount: number;
  // Part 3 deep fields
  mission: string;
  watches: AdvisorWatchItem[];
  whatChanged: string[];
  whyItCares: string;
  confidenceLevel: AdvisorConfidenceLevel;
  uncertaintyLevel: string;
  whatWouldChangeMind: string[];
  recommendations: AdvisorRecommendation[];
  currentRecommendation: AdvisorRecommendation;
  refusesToConclude: string[];
  dataSources: string[];
  keyUncertainty: string;
  invalidationEvents: string[];
  viewsByHorizon: AdvisorViewByHorizon[];
  priorViews: AdvisorPriorView[];
  portfolioAwareness: string;
  beginnerExplanation: string;
  advancedAnalysis: string;
  reasoningStyle: string;
  riskSensitivity: "conservative" | "moderate" | "aggressive";
  timeHorizonFocus: AdvisorTimeHorizon;
}

export interface AdvisorSynthesis {
  alignmentAreas: string[];
  divergenceAreas: { topic: string; positions: AdvisorDebatePosition[] }[];
  strongestOpportunities: string[];
  largestRisks: string[];
  actionJustified: boolean;
  waitingSmarter: boolean;
  reviewNext: string[];
  overallConfidence: number;
  summary: string;
}

export interface ResearchNote {
  id: string;
  title: string;
  content: string;
  instrumentIds: string[];
  tags: string[];
  source: string;
  createdAt: string;
  type: "macro" | "company" | "sector" | "thesis" | "catalyst" | "memo";
}
