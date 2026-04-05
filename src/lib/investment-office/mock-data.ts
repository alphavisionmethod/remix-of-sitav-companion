import type {
  Instrument, Holding, Portfolio, Watchlist, InvestmentThesis,
  InvestmentAdvisor, PlatformConnection, ResearchNote, Scenario, TradeOrder
} from "./types";

// ── Instruments ──
export const INSTRUMENTS: Instrument[] = [
  { id: "aapl", symbol: "AAPL", name: "Apple Inc.", assetClass: "stocks", sector: "Technology", theme: ["AI", "Consumer"], price: 227.45, change24h: 3.21, changePct24h: 1.43, marketCap: 3480000000000, volume24h: 52300000, high52w: 237.49, low52w: 164.08, status: "active", description: "Consumer electronics and services giant", logoIcon: "🍎", catalysts: [{ id: "c1", title: "Q3 Earnings", date: "2026-07-31", type: "earnings", impact: "unknown", description: "Fiscal Q3 results" }], riskLevel: "low", bullCase: "AI integration across devices, Services growth accelerating", bearCase: "China regulatory risk, smartphone saturation", uncertainty: "Pace of AI monetization" },
  { id: "msft", symbol: "MSFT", name: "Microsoft Corp.", assetClass: "stocks", sector: "Technology", theme: ["AI", "Cloud", "Enterprise"], price: 468.50, change24h: 5.80, changePct24h: 1.25, marketCap: 3490000000000, volume24h: 21400000, high52w: 475.00, low52w: 362.90, status: "active", description: "Enterprise software and cloud computing leader", logoIcon: "🪟", catalysts: [], riskLevel: "low", bullCase: "AI Copilot monetization, Azure growth", bearCase: "Enterprise spending slowdown", uncertainty: "Regulatory environment for AI" },
  { id: "nvda", symbol: "NVDA", name: "NVIDIA Corp.", assetClass: "stocks", sector: "Technology", theme: ["AI", "Semiconductors"], price: 135.20, change24h: -2.40, changePct24h: -1.74, marketCap: 3320000000000, volume24h: 310000000, high52w: 153.13, low52w: 75.61, status: "active", description: "GPU and AI computing platform leader", logoIcon: "💚", catalysts: [{ id: "c2", title: "GTC Conference", date: "2026-09-15", type: "product", impact: "positive", description: "Next-gen architecture reveal expected" }], riskLevel: "moderate", bullCase: "AI infrastructure demand continues multi-year", bearCase: "Customer concentration, export controls", uncertainty: "Next-gen chip delays" },
  { id: "btc", symbol: "BTC", name: "Bitcoin", assetClass: "crypto", theme: ["Store of Value", "Digital Gold"], price: 97450, change24h: 1230, changePct24h: 1.28, marketCap: 1920000000000, volume24h: 38000000000, high52w: 109000, low52w: 56800, status: "active", description: "Decentralized digital currency", logoIcon: "₿", catalysts: [{ id: "c3", title: "Halving Anniversary", date: "2026-04-20", type: "event", impact: "positive", description: "One year post-halving supply dynamics" }], riskLevel: "high", bullCase: "Institutional adoption, ETF inflows", bearCase: "Regulatory crackdown, macro risk-off", uncertainty: "Rate environment impact" },
  { id: "eth", symbol: "ETH", name: "Ethereum", assetClass: "crypto", theme: ["DeFi", "Smart Contracts"], price: 3850, change24h: -45, changePct24h: -1.16, marketCap: 463000000000, volume24h: 15600000000, high52w: 4120, low52w: 2150, status: "active", description: "Smart contract platform", logoIcon: "⟠", catalysts: [], riskLevel: "high", bullCase: "DeFi growth, L2 ecosystem", bearCase: "Competition from alternative L1s", uncertainty: "Regulatory classification" },
  { id: "sol", symbol: "SOL", name: "Solana", assetClass: "crypto", theme: ["DeFi", "High Performance"], price: 185.40, change24h: 7.20, changePct24h: 4.04, marketCap: 85000000000, volume24h: 4200000000, high52w: 263, low52w: 95, status: "active", description: "High-performance blockchain", logoIcon: "◎", catalysts: [], riskLevel: "very-high", bullCase: "Fastest growing DeFi ecosystem", bearCase: "Network reliability concerns", uncertainty: "Regulatory clarity" },
  { id: "gold", symbol: "XAUUSD", name: "Gold", assetClass: "commodities", theme: ["Safe Haven", "Inflation Hedge"], price: 2645, change24h: 12, changePct24h: 0.46, volume24h: 180000000000, high52w: 2790, low52w: 1985, status: "active", description: "Precious metal and monetary asset", logoIcon: "🥇", catalysts: [{ id: "c4", title: "Fed Rate Decision", date: "2026-06-18", type: "macro", impact: "unknown", description: "Potential rate action" }], riskLevel: "low", bullCase: "Central bank buying, de-dollarization", bearCase: "Real rate rise, risk-on shift", uncertainty: "Geopolitical premium sustainability" },
  { id: "oil", symbol: "CL", name: "Crude Oil WTI", assetClass: "commodities", theme: ["Energy", "Macro"], price: 78.30, change24h: -0.85, changePct24h: -1.07, volume24h: 850000000, high52w: 93.50, low52w: 64.20, status: "active", description: "Benchmark crude oil futures", logoIcon: "🛢️", catalysts: [], riskLevel: "moderate", bullCase: "OPEC discipline, demand recovery", bearCase: "Global slowdown, EV transition", uncertainty: "OPEC+ unity" },
  { id: "ev-fed", symbol: "FED-CUT-JUN", name: "Fed Rate Cut June 2026", assetClass: "events", theme: ["Macro", "Interest Rates"], price: 0.62, change24h: 0.03, changePct24h: 5.08, status: "active", description: "Probability of Fed rate cut at June 2026 FOMC meeting", logoIcon: "🏛️", catalysts: [{ id: "c5", title: "CPI Release", date: "2026-05-14", type: "macro", impact: "unknown", description: "Key inflation data" }], riskLevel: "moderate", bullCase: "Inflation declining faster", bearCase: "Sticky services inflation", uncertainty: "Labor market resilience" },
  { id: "ev-election", symbol: "PRES-2028", name: "2028 Presidential Election", assetClass: "events", theme: ["Politics"], price: 0.45, change24h: -0.02, changePct24h: -4.26, status: "active", description: "Leading candidate probability market", logoIcon: "🗳️", catalysts: [], riskLevel: "high", bullCase: "Early frontrunner emerges", bearCase: "Contested primary season", uncertainty: "Too early for reliable odds" },
  { id: "spy", symbol: "SPY", name: "S&P 500 ETF", assetClass: "etfs", sector: "Broad Market", theme: ["Index", "US Large Cap"], price: 548.20, change24h: 4.50, changePct24h: 0.83, marketCap: 520000000000, volume24h: 72000000, high52w: 565, low52w: 425, status: "active", description: "Tracks S&P 500 index", logoIcon: "📊", catalysts: [], riskLevel: "low", bullCase: "Broad market participation expanding", bearCase: "Valuation compression", uncertainty: "Earnings growth sustainability" },
  { id: "tsla", symbol: "TSLA", name: "Tesla Inc.", assetClass: "stocks", sector: "Automotive", theme: ["EV", "AI", "Energy"], price: 248.90, change24h: -6.30, changePct24h: -2.47, marketCap: 795000000000, volume24h: 98000000, high52w: 361, low52w: 138.80, status: "active", description: "Electric vehicles, energy, and AI", logoIcon: "⚡", catalysts: [{ id: "c6", title: "Robotaxi Launch", date: "2026-08-08", type: "product", impact: "positive", description: "Autonomous ride-hailing service launch" }], riskLevel: "very-high", bullCase: "Robotaxi + energy + AI optionality", bearCase: "EV margin compression, competition", uncertainty: "Execution timeline" },
];

export const getInstrument = (id: string) => INSTRUMENTS.find(i => i.id === id);

// ── Holdings ──
const makeHolding = (instId: string, qty: number, avgCost: number, platform: string): Holding => {
  const inst = getInstrument(instId)!;
  const currentValue = inst.price * qty;
  const costBasis = avgCost * qty;
  return {
    id: `h-${instId}`, instrumentId: instId, instrument: inst, platform, quantity: qty,
    avgCost, currentValue, unrealizedPnl: currentValue - costBasis,
    unrealizedPnlPct: ((currentValue - costBasis) / costBasis) * 100,
    weight: 0, acquiredAt: "2025-06-15",
  };
};

const holdings: Holding[] = [
  makeHolding("aapl", 150, 185.20, "Interactive Brokers"),
  makeHolding("msft", 80, 390.00, "Interactive Brokers"),
  makeHolding("nvda", 200, 95.50, "Interactive Brokers"),
  makeHolding("spy", 100, 480.00, "Schwab"),
  makeHolding("btc", 1.5, 62000, "Coinbase"),
  makeHolding("eth", 15, 2800, "Coinbase"),
  makeHolding("sol", 100, 120, "Coinbase"),
  makeHolding("gold", 20, 2100, "Schwab"),
  makeHolding("tsla", 50, 195, "Interactive Brokers"),
  makeHolding("ev-fed", 500, 0.45, "Polymarket"),
];

const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
holdings.forEach(h => { h.weight = (h.currentValue / totalValue) * 100; });

export const PORTFOLIO: Portfolio = {
  totalValue,
  totalCash: 45000,
  totalPnl: holdings.reduce((s, h) => s + h.unrealizedPnl, 0),
  totalPnlPct: (holdings.reduce((s, h) => s + h.unrealizedPnl, 0) / (totalValue - holdings.reduce((s, h) => s + h.unrealizedPnl, 0))) * 100,
  holdings,
  allocationByClass: {
    stocks: holdings.filter(h => h.instrument.assetClass === "stocks").reduce((s, h) => s + h.weight, 0),
    etfs: holdings.filter(h => h.instrument.assetClass === "etfs").reduce((s, h) => s + h.weight, 0),
    crypto: holdings.filter(h => h.instrument.assetClass === "crypto").reduce((s, h) => s + h.weight, 0),
    commodities: holdings.filter(h => h.instrument.assetClass === "commodities").reduce((s, h) => s + h.weight, 0),
    events: holdings.filter(h => h.instrument.assetClass === "events").reduce((s, h) => s + h.weight, 0),
    cash: 0,
  },
  allocationBySector: {},
  riskScore: 62,
  regime: "bull",
  lastSyncAt: new Date().toISOString(),
};

// ── Watchlists ──
export const WATCHLISTS: Watchlist[] = [
  { id: "w1", name: "Core Watchlist", instruments: [INSTRUMENTS[0], INSTRUMENTS[2], INSTRUMENTS[3], INSTRUMENTS[6]] },
  { id: "w2", name: "Event Markets", instruments: [INSTRUMENTS[8], INSTRUMENTS[9]] },
];

// ── Advisors ──
export const INVESTMENT_ADVISORS: InvestmentAdvisor[] = [
  { id: "adv-macro", domain: "macro", name: "Atlas", title: "Macro Advisor", icon: "🌍", color: "hsl(var(--primary))", currentInsight: "Fed likely holds in June. Market pricing 62% cut probability may be aggressive. Watch CPI and employment data closely.", confidence: 74, watchingCount: 12 },
  { id: "adv-equity", domain: "equity", name: "Maven", title: "Equity Advisor", icon: "📈", color: "hsl(152 55% 48%)", currentInsight: "Tech earnings season approaching. NVDA and AAPL are key watchpoints. Sector rotation into value names accelerating.", confidence: 81, watchingCount: 28 },
  { id: "adv-crypto", domain: "crypto", name: "Cipher", title: "Crypto Advisor", icon: "🔐", color: "hsl(38 85% 58%)", currentInsight: "BTC holding above 95K support. ETF inflows remain positive. SOL ecosystem activity increasing but watch for network issues.", confidence: 67, watchingCount: 15 },
  { id: "adv-commodities", domain: "commodities", name: "Terra", title: "Commodities Advisor", icon: "⛏️", color: "hsl(25 75% 55%)", currentInsight: "Gold continues to benefit from central bank buying. Oil range-bound between 75-82. Watch OPEC meeting for production guidance.", confidence: 72, watchingCount: 8 },
  { id: "adv-events", domain: "events", name: "Oracle", title: "Event Markets Advisor", icon: "🔮", color: "hsl(280 60% 55%)", currentInsight: "Fed cut probability shifted +5% this week on softer labor data. Election markets too early for reliable signals.", confidence: 58, watchingCount: 6 },
  { id: "adv-risk", domain: "risk", name: "Sentinel", title: "Risk Advisor", icon: "🛡️", color: "hsl(0 65% 55%)", currentInsight: "Portfolio concentration in tech elevated at 42%. Crypto allocation above target. Consider trimming NVDA after strong run.", confidence: 85, watchingCount: 0 },
  { id: "adv-exec", domain: "execution", name: "Router", title: "Execution Advisor", icon: "⚡", color: "hsl(200 65% 55%)", currentInsight: "Market liquidity normal. No unusual spreads. Favorable execution window for large orders: 10:30-11:30 ET.", confidence: 90, watchingCount: 3 },
  { id: "adv-behavioral", domain: "behavioral", name: "Mirror", title: "Behavioral Advisor", icon: "🪞", color: "hsl(320 55% 55%)", currentInsight: "You've checked NVDA 12 times this week. Consider if recency bias is driving attention. Your thesis hasn't changed — trust the plan.", confidence: 78, watchingCount: 0 },
];

// ── Platform Connections ──
export const PLATFORM_CONNECTIONS: PlatformConnection[] = [
  { id: "pc-ib", name: "Interactive Brokers", type: "brokerage", status: "connected", lastSyncAt: "2026-04-05T12:30:00Z", accountValue: 182500, icon: "🏦" },
  { id: "pc-schwab", name: "Charles Schwab", type: "brokerage", status: "connected", lastSyncAt: "2026-04-05T11:45:00Z", accountValue: 107600, icon: "🏛️" },
  { id: "pc-cb", name: "Coinbase", type: "exchange", status: "connected", lastSyncAt: "2026-04-05T13:00:00Z", accountValue: 210250, icon: "🪙" },
  { id: "pc-poly", name: "Polymarket", type: "event-market", status: "connected", lastSyncAt: "2026-04-05T12:00:00Z", accountValue: 310, icon: "🎯" },
  { id: "pc-meta", name: "MetaMask", type: "wallet", status: "disconnected", icon: "🦊" },
];

// ── Theses ──
export const SAMPLE_THESES: InvestmentThesis[] = [
  { id: "th1", instrumentId: "nvda", title: "NVDA AI Infrastructure Supercycle", rationale: "AI training compute demand growing 4x annually. NVDA dominant with 80%+ data center GPU share. Next-gen Blackwell architecture extends moat.", conviction: "high", timeHorizon: "12-18 months", assumptions: ["AI capex continues growing 40%+ YoY", "No viable GPU competitor emerges", "China export controls don't expand significantly"], catalystExpectations: ["GTC conference product announcements", "Q3 earnings beat with raised guidance", "Major new enterprise AI deals"], riskFactors: ["Customer concentration in hyperscalers", "Export control expansion", "ASIC competition from Google/Amazon"], entryPrice: 95.50, targetPrice: 180, stopLoss: 85, status: "active", createdAt: "2025-08-15", updatedAt: "2026-03-20" },
  { id: "th2", instrumentId: "btc", title: "Bitcoin Post-Halving Cycle", rationale: "Historical halving cycles show 12-18 month appreciation period. Institutional ETF inflows provide structural demand floor.", conviction: "medium", timeHorizon: "6-12 months", assumptions: ["ETF inflows remain positive", "No major regulatory crackdown", "Macro environment stays accommodative"], catalystExpectations: ["Halving anniversary narrative", "Potential sovereign wealth fund allocations", "Payment network integrations"], riskFactors: ["Regulatory surprise", "Macro risk-off event", "Mt. Gox-style supply shock"], entryPrice: 62000, targetPrice: 125000, status: "active", createdAt: "2025-11-01", updatedAt: "2026-02-28" },
];

// ── Scenarios ──
export const SAMPLE_SCENARIOS: Scenario[] = [
  { id: "s1", name: "Base Case — Soft Landing", description: "Fed achieves soft landing with moderate growth and controlled inflation", assumptions: [{ label: "GDP Growth", value: "2.1%" }, { label: "Fed Funds Rate", value: "4.25%" }, { label: "S&P 500 EPS Growth", value: "10%" }], projectedReturn: 12.5, projectedDrawdown: -8, probability: 45 },
  { id: "s2", name: "Bull Case — AI Acceleration", description: "AI productivity gains drive earnings acceleration across sectors", assumptions: [{ label: "GDP Growth", value: "3.2%" }, { label: "Fed Funds Rate", value: "3.75%" }, { label: "S&P 500 EPS Growth", value: "18%" }], projectedReturn: 24, projectedDrawdown: -5, probability: 25 },
  { id: "s3", name: "Bear Case — Recession", description: "Economic slowdown leads to earnings contraction and risk-off", assumptions: [{ label: "GDP Growth", value: "-0.5%" }, { label: "Fed Funds Rate", value: "3.0%" }, { label: "S&P 500 EPS Growth", value: "-8%" }], projectedReturn: -18, projectedDrawdown: -28, probability: 20 },
  { id: "s4", name: "Tail Risk — Geopolitical Crisis", description: "Major geopolitical escalation disrupts markets", assumptions: [{ label: "GDP Growth", value: "-1.5%" }, { label: "Oil Price", value: "$120+" }, { label: "VIX", value: "45+" }], projectedReturn: -32, projectedDrawdown: -40, probability: 10 },
];

// ── Research Notes ──
export const SAMPLE_RESEARCH: ResearchNote[] = [
  { id: "r1", title: "Q2 Macro Outlook: Navigating the Pivot", content: "The Fed signaling data-dependency creates a two-sided market...", instrumentIds: [], tags: ["macro", "fed", "rates"], source: "SITA Research", createdAt: "2026-04-01", type: "macro" },
  { id: "r2", title: "NVDA: Blackwell Ramp Analysis", content: "Supply chain checks indicate strong Blackwell demand...", instrumentIds: ["nvda"], tags: ["nvda", "ai", "semiconductors"], source: "SITA Equity Research", createdAt: "2026-03-28", type: "company" },
  { id: "r3", title: "Crypto Market Structure Post-ETF", content: "Institutional flows reshaping crypto market dynamics...", instrumentIds: ["btc", "eth"], tags: ["crypto", "etf", "institutional"], source: "SITA Digital Assets", createdAt: "2026-03-25", type: "sector" },
];

// ── Sample Trade Orders ──
export const SAMPLE_ORDERS: TradeOrder[] = [
  { id: "ord1", instrumentId: "nvda", instrument: getInstrument("nvda")!, action: "buy", quantity: 50, orderType: "limit", limitPrice: 130, platform: "Interactive Brokers", estimatedCost: 6500, estimatedFees: 1.50, riskPreview: "Adds 1.2% portfolio weight to NVDA. Total tech exposure rises to 44%.", status: "draft", rationale: "Adding on dip before GTC conference catalyst", thesisId: "th1", approvalRequired: false, createdAt: "2026-04-05" },
];
