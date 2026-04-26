// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment Domain: Demo Fixtures
//
// ⚠️  DEMO/MOCK DATA — gate behind `isDemoMode` at the consumer layer.
// Markers `__DEMO_SOURCE__` and `__DATA_CLASSIFICATION__` are
// preserved so the demo-mode auditor can detect this fixture set.
// See: mem://design/demo-mode-standardization
// ═══════════════════════════════════════════════════════════════

import type {
  Instrument, Holding, Portfolio, Watchlist, InvestmentThesis,
  InvestmentAdvisor, PlatformConnection, ResearchNote, Scenario, TradeOrder,
  AdvisorSynthesis
} from "../types";

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

// ── Sparkline Data (7-day price history) ──
export const SPARKLINE_DATA: Record<string, number[]> = {
  aapl: [222, 224, 223, 226, 225, 228, 227.45],
  msft: [460, 463, 461, 465, 464, 470, 468.50],
  nvda: [140, 138, 141, 137, 139, 136, 135.20],
  btc: [94200, 95100, 94800, 96500, 97200, 96800, 97450],
  eth: [3920, 3880, 3910, 3860, 3840, 3870, 3850],
  sol: [172, 175, 178, 180, 176, 183, 185.40],
  gold: [2620, 2628, 2635, 2630, 2638, 2642, 2645],
  oil: [79.5, 79.1, 78.8, 79.2, 78.9, 78.6, 78.30],
  "ev-fed": [0.55, 0.57, 0.56, 0.59, 0.58, 0.61, 0.62],
  "ev-election": [0.48, 0.47, 0.46, 0.47, 0.46, 0.44, 0.45],
  spy: [540, 543, 542, 545, 544, 547, 548.20],
  tsla: [258, 255, 260, 252, 256, 250, 248.90],
};

// ── Strategy Templates ──
export const STRATEGY_TEMPLATES = [
  { id: "st1", name: "Conservative Diversified", icon: "🛡️", description: "Broad-based allocation designed for capital preservation with moderate growth", allocation: { stocks: 35, etfs: 15, crypto: 5, commodities: 15, events: 0, cash: 30 }, risk: "low", expectedReturn: "6-8%", maxDrawdown: "-12%" },
  { id: "st2", name: "Growth & Innovation", icon: "🚀", description: "High-growth focus on technology, AI, and disruptive sectors", allocation: { stocks: 50, etfs: 15, crypto: 15, commodities: 5, events: 5, cash: 10 }, risk: "high", expectedReturn: "15-25%", maxDrawdown: "-30%" },
  { id: "st3", name: "Crypto Satellite", icon: "₿", description: "Core traditional portfolio with aggressive crypto satellite allocation", allocation: { stocks: 30, etfs: 10, crypto: 35, commodities: 10, events: 5, cash: 10 }, risk: "very-high", expectedReturn: "20-40%", maxDrawdown: "-45%" },
  { id: "st4", name: "Event Speculation", icon: "🎯", description: "Probability-weighted event market positioning with strong cash reserves", allocation: { stocks: 15, etfs: 10, crypto: 5, commodities: 5, events: 30, cash: 35 }, risk: "high", expectedReturn: "10-35%", maxDrawdown: "-25%" },
  { id: "st5", name: "Commodity Hedge", icon: "⛏️", description: "Inflation and macro-risk hedged portfolio with commodity emphasis", allocation: { stocks: 25, etfs: 10, crypto: 5, commodities: 35, events: 0, cash: 25 }, risk: "moderate", expectedReturn: "8-12%", maxDrawdown: "-18%" },
  { id: "st6", name: "Income Preservation", icon: "💰", description: "Maximum capital preservation with income focus and minimal volatility", allocation: { stocks: 15, etfs: 25, crypto: 0, commodities: 10, events: 0, cash: 50 }, risk: "very-low", expectedReturn: "4-6%", maxDrawdown: "-8%" },
];

// ── What Changed Data ──
export const WHAT_CHANGED = [
  { type: "portfolio" as const, severity: "info" as const, text: "SOL rally pushed crypto allocation 2% above target" },
  { type: "advisor" as const, severity: "warn" as const, text: "Sentinel flags tech concentration at 42% vs 35% policy limit" },
  { type: "catalyst" as const, severity: "info" as const, text: "CPI release in 34 days — key catalyst for Fed rate cut thesis" },
  { type: "watchlist" as const, severity: "alert" as const, text: "NVDA down -1.74% on high volume — attention pattern flagged" },
  { type: "macro" as const, severity: "info" as const, text: "Fed speaker tone shifted slightly dovish this week" },
];

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

// ══════════════════════════════════════════════════════════════
// ENHANCED ADVISOR COUNCIL (Part 3 Spec — Full Deep Model)
// ══════════════════════════════════════════════════════════════

export const INVESTMENT_ADVISORS: InvestmentAdvisor[] = [
  {
    id: "adv-macro", domain: "macro", name: "Atlas", title: "Macro Advisor", icon: "🌍", color: "hsl(var(--primary))",
    currentInsight: "Fed likely holds in June. Market pricing 62% cut probability may be aggressive. Watch CPI and employment data closely.",
    confidence: 74, watchingCount: 12,
    mission: "Track global macro conditions, central bank policy, liquidity flows, and regime shifts to contextualize all investment decisions.",
    watches: [
      { label: "Fed Policy", status: "changing", detail: "Dot plot shifting dovish but data-dependent rhetoric persists" },
      { label: "Inflation (CPI/PCE)", status: "changing", detail: "Core PCE at 2.6%, trending down but sticky in services" },
      { label: "Dollar Index (DXY)", status: "stable", detail: "Range-bound 103-106, no breakout imminent" },
      { label: "Liquidity Conditions", status: "stable", detail: "Bank reserves adequate, QT pace slowing" },
      { label: "Recession Probability", status: "stable", detail: "Yield curve normalizing, soft landing base case" },
      { label: "Geopolitical Risk", status: "alert", detail: "Middle East tensions elevated, shipping disruption watch" },
    ],
    whatChanged: ["CPI expectations shifted 0.1% lower after housing data", "Fed speaker tone shifted slightly dovish this week", "China PMI surprised to downside"],
    whyItCares: "Macro regime determines whether risk assets are in a supportive or hostile environment. Getting the regime wrong is the costliest mistake.",
    confidenceLevel: "moderate",
    uncertaintyLevel: "Services inflation stickiness and labor market resilience create genuine two-way risk for rate path.",
    whatWouldChangeMind: ["Core CPI prints above 3.0% for two months", "Unemployment rises above 4.5%", "Major geopolitical escalation disrupting energy"],
    recommendations: ["watch-catalyst", "proceed-carefully"],
    currentRecommendation: "watch-catalyst",
    refusesToConclude: ["Whether the Fed will cut in June — genuinely uncertain", "Whether geopolitical tensions will escalate or de-escalate"],
    dataSources: ["Federal Reserve speeches", "BLS employment data", "CPI/PCE releases", "Global PMI surveys", "Dollar and yield curve data"],
    keyUncertainty: "Services inflation persistence vs labor market cooling — contradictory signals remain unresolved.",
    invalidationEvents: ["Hot CPI print (>3.2%)", "Financial stress event", "Geopolitical escalation affecting energy prices"],
    viewsByHorizon: [
      { horizon: "near-term", view: "Expect range-bound markets into CPI release. Volatility should be muted.", confidence: "moderate" },
      { horizon: "medium-term", view: "Soft landing remains base case. Rate cuts likely begin Q3/Q4 2026.", confidence: "moderate" },
      { horizon: "long-term", view: "Structurally higher rates. AI productivity gains could lower inflation sustainably by 2028.", confidence: "low" },
    ],
    priorViews: [
      { date: "2026-03-15", view: "Cautioned that market was over-pricing March cut probability at 70%", resolved: true, outcome: "Fed held as expected. View validated." },
      { date: "2026-02-20", view: "Flagged China PMI weakness as risk to commodities", resolved: true, outcome: "Oil declined 5% — partially driven by demand concerns." },
    ],
    portfolioAwareness: "Your portfolio has significant exposure to rate-sensitive assets (tech + crypto = ~65%). A hawkish surprise could create correlated drawdown across holdings.",
    beginnerExplanation: "I watch the big-picture economy — interest rates, inflation, and global events that affect all your investments at once. Right now, the economy is doing okay but there's uncertainty about when rates will be cut.",
    advancedAnalysis: "Decomposing the rate path: terminal rate expectations have shifted 25bps dovish since February. However, services CPI at 4.1% annualized remains inconsistent with 2% target. The market is pricing ~62% June cut probability which I view as 10-15% too high given data trajectory. Key risk: labor market shows late-cycle resilience with JOLTS still elevated.",
    reasoningStyle: "Top-down macro framework with cross-asset correlation awareness",
    riskSensitivity: "moderate",
    timeHorizonFocus: "medium-term",
  },
  {
    id: "adv-equity", domain: "equity", name: "Maven", title: "Equity Advisor", icon: "📈", color: "hsl(152 55% 48%)",
    currentInsight: "Tech earnings season approaching. NVDA and AAPL are key watchpoints. Sector rotation into value names accelerating.",
    confidence: 81, watchingCount: 28,
    mission: "Analyze public companies through fundamental, catalyst, and competitive dynamics to identify quality opportunities and risks.",
    watches: [
      { label: "Earnings Season", status: "alert", detail: "Q2 earnings begin in 3 weeks. NVDA, AAPL, MSFT are portfolio-critical" },
      { label: "Sector Rotation", status: "changing", detail: "Money flowing from mega-cap tech to industrials and healthcare" },
      { label: "Valuation Regime", status: "stable", detail: "Forward P/E at 21.5x — above historical but not extreme given AI growth" },
      { label: "NVDA Catalysts", status: "alert", detail: "GTC conference in September — major architecture reveal expected" },
      { label: "Tesla Execution", status: "changing", detail: "Robotaxi timeline remains uncertain, margins under pressure" },
    ],
    whatChanged: ["NVDA pulled back 1.7% on no news — may be positioning ahead of catalysts", "TSLA margin guidance disappointed at auto show", "MSFT approaching all-time high on Copilot revenue"],
    whyItCares: "Individual equity selection drives alpha. Understanding company-specific catalysts vs macro noise is essential for timing entries and sizing.",
    confidenceLevel: "high",
    uncertaintyLevel: "Earnings season creates binary risk windows. Guidance matters more than beats.",
    whatWouldChangeMind: ["NVDA misses on data center revenue growth", "Broad enterprise spending freeze signals", "AI capex cycle shows signs of peaking"],
    recommendations: ["watch-catalyst", "execute-now"],
    currentRecommendation: "watch-catalyst",
    refusesToConclude: ["Whether AI capex cycle has another 3 years or 1 year of growth — genuinely unclear"],
    dataSources: ["SEC filings", "Earnings transcripts", "Industry reports", "Competitive analysis", "Analyst consensus data"],
    keyUncertainty: "Whether AI revenue is creating durable moats or temporary advantages for current leaders.",
    invalidationEvents: ["NVDA revenue miss by >5%", "Major antitrust action against big tech", "Enterprise IT spending freeze"],
    viewsByHorizon: [
      { horizon: "near-term", view: "NVDA dip is accumulation opportunity before GTC. Size carefully given existing position.", confidence: "high" },
      { horizon: "medium-term", view: "Tech leadership likely continues but breadth improving. Consider adding quality non-tech.", confidence: "moderate" },
      { horizon: "long-term", view: "AI creates genuine structural winners but market hasn't yet differentiated them from temporary beneficiaries.", confidence: "low" },
    ],
    priorViews: [
      { date: "2026-03-01", view: "Recommended holding NVDA through Q1 despite volatility", resolved: true, outcome: "NVDA +42% from thesis entry. View validated." },
    ],
    portfolioAwareness: "You're heavily weighted in tech (AAPL + MSFT + NVDA + TSLA = ~42% of portfolio). The NVDA add would push concentration higher. Consider if sector rotation warrants rebalancing.",
    beginnerExplanation: "I study individual companies — their earnings, products, and competition — to find which stocks are worth owning and when. Right now, I'm watching several companies report earnings soon, which could move your holdings.",
    advancedAnalysis: "NVDA's -1.74% move today on 310M volume (above average) suggests institutional positioning, not fundamental deterioration. The options market prices 6.2% implied move around GTC — I view this as reasonable. The key debate is whether Blackwell ramp will compress margins short-term before accelerating revenue. Street estimates for Q3 appear beatable at $38B revenue consensus.",
    reasoningStyle: "Bottom-up fundamental with catalyst timing overlay",
    riskSensitivity: "moderate",
    timeHorizonFocus: "medium-term",
  },
  {
    id: "adv-crypto", domain: "crypto", name: "Cipher", title: "Crypto Advisor", icon: "🔐", color: "hsl(38 85% 58%)",
    currentInsight: "BTC holding above 95K support. ETF inflows remain positive. SOL ecosystem activity increasing but watch for network issues.",
    confidence: 67, watchingCount: 15,
    mission: "Navigate crypto markets through structure, liquidity, narrative, and on-chain analysis while managing extreme volatility risk.",
    watches: [
      { label: "BTC Structure", status: "stable", detail: "Above 95K support. ETF inflows +$200M this week. On-chain accumulation by long-term holders." },
      { label: "ETH/BTC Ratio", status: "changing", detail: "Ratio declining — ETH underperforming. L2 adoption fragmenting value accrual narrative." },
      { label: "SOL Ecosystem", status: "alert", detail: "TVL growing rapidly but network had brief congestion event this week" },
      { label: "Regulatory Environment", status: "stable", detail: "SEC taking measured approach post-ETF approval. No imminent hostile action." },
      { label: "Exchange Liquidity", status: "stable", detail: "Coinbase and Binance order books healthy. No unusual withdrawal patterns." },
    ],
    whatChanged: ["SOL TVL crossed $8B — ecosystem milestone", "New ETH L2 launched, fragmenting attention", "BTC ETF saw 5 consecutive days of net inflows"],
    whyItCares: "Crypto markets move on narrative, liquidity, and structural events. Timing exposure and managing tail risk is critical in this asset class.",
    confidenceLevel: "moderate",
    uncertaintyLevel: "Crypto remains structurally volatile. Regulatory clarity improving but not complete. Narrative rotations can create sharp reversals.",
    whatWouldChangeMind: ["BTC loses 90K support with volume", "Major exchange hack or insolvency", "Regulatory reclassification of ETH as security"],
    recommendations: ["proceed-carefully", "size-small"],
    currentRecommendation: "proceed-carefully",
    refusesToConclude: ["Whether SOL will outperform ETH long-term — ecosystem is growing but reliability concerns persist", "Short-term BTC direction — structurally bullish but macro-dependent"],
    dataSources: ["On-chain analytics", "Exchange flow data", "ETF flow reports", "DeFi protocol metrics", "Social sentiment aggregators"],
    keyUncertainty: "Whether institutional adoption continues to grow or stabilizes at current levels.",
    invalidationEvents: ["Major exchange failure", "SEC reversal on ETF approvals", "BTC below 80K sustained"],
    viewsByHorizon: [
      { horizon: "near-term", view: "BTC likely range-bound 93K-102K. SOL may outperform on momentum.", confidence: "moderate" },
      { horizon: "medium-term", view: "Post-halving dynamics remain bullish. Expecting new ATH within 6 months.", confidence: "moderate" },
      { horizon: "long-term", view: "BTC as digital store of value thesis strengthening. ETH faces existential L2 value accrual question.", confidence: "low" },
    ],
    priorViews: [
      { date: "2026-02-10", view: "Warned SOL could have network reliability issues during high activity periods", resolved: true, outcome: "Congestion event occurred this week. View partially validated." },
    ],
    portfolioAwareness: "Crypto allocation is ~28% of your portfolio — above the 20% target in your risk policy. Consider if the recent SOL surge has pushed this too high. Sentinel (Risk) also flags this.",
    beginnerExplanation: "I track cryptocurrencies — Bitcoin, Ethereum, Solana, and others. These are digital assets that can gain or lose value quickly. Right now, Bitcoin is stable and getting more institutional support, which is positive, but these investments carry higher risk than stocks.",
    advancedAnalysis: "BTC structural analysis: Long-term holder supply ratio at 78% — historically bullish. Short-term holder cost basis at $88K creates support. ETF flows normalize the demand profile but reduce the reflexive upside typical of prior cycles. Key risk: if macro turns risk-off, BTC's correlation to Nasdaq increases to 0.7+, creating portfolio-wide correlation risk with your tech holdings.",
    reasoningStyle: "On-chain structural analysis with narrative and liquidity overlay",
    riskSensitivity: "aggressive",
    timeHorizonFocus: "medium-term",
  },
  {
    id: "adv-commodities", domain: "commodities", name: "Terra", title: "Commodities Advisor", icon: "⛏️", color: "hsl(25 75% 55%)",
    currentInsight: "Gold continues to benefit from central bank buying. Oil range-bound between 75-82. Watch OPEC meeting for production guidance.",
    confidence: 72, watchingCount: 8,
    mission: "Analyze commodity markets through supply/demand fundamentals, macro linkages, and geopolitical risk to guide allocation and hedging.",
    watches: [
      { label: "Gold / Central Banks", status: "stable", detail: "Central bank buying at record pace. Gold acting as portfolio insurance." },
      { label: "Oil / OPEC", status: "changing", detail: "OPEC+ discipline fraying. Some members exceeding quotas." },
      { label: "Copper / Industrial", status: "stable", detail: "Electrification demand supporting prices but China demand mixed." },
      { label: "Agriculture", status: "stable", detail: "Grain prices normalized after 2024 shocks." },
    ],
    whatChanged: ["OPEC member exceeded production quota — testing cartel discipline", "Gold broke through $2640 resistance"],
    whyItCares: "Commodities are driven by unique supply/demand dynamics plus macro. They provide portfolio diversification and inflation protection.",
    confidenceLevel: "moderate",
    uncertaintyLevel: "OPEC+ unity is the key uncertainty for oil. Gold depends on central bank buying continuation.",
    whatWouldChangeMind: ["OPEC+ production increase announcement", "Major gold ETF outflows", "China stimulus package lifting demand"],
    recommendations: ["observe", "watch-catalyst"],
    currentRecommendation: "observe",
    refusesToConclude: ["Oil direction beyond 3-month window — OPEC politics too unpredictable"],
    dataSources: ["OPEC reports", "EIA inventory data", "World Gold Council", "USDA crop reports", "Shipping and logistics data"],
    keyUncertainty: "Whether OPEC+ can maintain production discipline through 2026.",
    invalidationEvents: ["OPEC+ collapse", "Gold below $2400", "Major supply disruption"],
    viewsByHorizon: [
      { horizon: "near-term", view: "Gold likely continues grinding higher. Oil stuck in range.", confidence: "moderate" },
      { horizon: "medium-term", view: "Gold targets $2800 on central bank buying. Oil depends entirely on OPEC.", confidence: "moderate" },
      { horizon: "long-term", view: "Energy transition creates structural tailwind for copper/lithium, headwind for oil long-term.", confidence: "moderate" },
    ],
    priorViews: [],
    portfolioAwareness: "Gold is your only commodity holding at ~10% weight. This provides reasonable inflation protection. No direct oil exposure which is fine given the uncertainty.",
    beginnerExplanation: "I track physical commodities like gold, oil, and metals. Gold is doing well right now as central banks buy more. Oil prices are stable but could be affected by OPEC decisions. Your gold position is a good safety net.",
    advancedAnalysis: "Gold's breakout above $2640 on rising OI suggests genuine new positioning, not short-covering. Central bank buying (1,037 tons in 2025) provides a structural floor. The risk premium embedded in gold is approximately $200-250/oz based on my model — elevated but justified given fiscal concerns. Oil: WTI contango structure suggests market expects oversupply. The 75-82 range requires OPEC discipline which is being tested.",
    reasoningStyle: "Supply/demand fundamental with macro and geopolitical overlay",
    riskSensitivity: "conservative",
    timeHorizonFocus: "medium-term",
  },
  {
    id: "adv-events", domain: "events", name: "Oracle", title: "Event Markets Advisor", icon: "🔮", color: "hsl(280 60% 55%)",
    currentInsight: "Fed cut probability shifted +5% this week on softer labor data. Election markets too early for reliable signals.",
    confidence: 58, watchingCount: 6,
    mission: "Analyze event and prediction markets through probability, catalyst timing, and resolution structure for disciplined event positioning.",
    watches: [
      { label: "Fed Cut Probability", status: "changing", detail: "62% implied probability — shifted +5% this week on jobs data" },
      { label: "Election Markets", status: "stable", detail: "Too early for reliable signal. High uncertainty premium." },
      { label: "CPI Release Impact", status: "alert", detail: "Next CPI is the key catalyst for Fed rate cut contract" },
    ],
    whatChanged: ["Jobs data softer than expected → Fed cut probability rose 5%", "New prediction market launched for AI regulation timeline"],
    whyItCares: "Event markets allow positioning on discrete outcomes. Disciplined sizing and timing are essential — this is scenario intelligence, not gambling.",
    confidenceLevel: "low",
    uncertaintyLevel: "Event markets have inherently wide uncertainty bands. The key skill is identifying when markets misprice known catalyst timing.",
    whatWouldChangeMind: ["Hot CPI flipping Fed cut narrative entirely", "Major political development shifting election odds materially"],
    recommendations: ["size-small", "high-uncertainty"],
    currentRecommendation: "high-uncertainty",
    refusesToConclude: ["Whether Fed will cut in June — probability is genuinely 50-65%", "Any election outcome with >80% confidence at this stage"],
    dataSources: ["Prediction market orderbooks", "Federal Reserve communications", "Economic data releases", "Political polling aggregators"],
    keyUncertainty: "Predicting binary events inherently carries high uncertainty. Focus on position sizing, not conviction.",
    invalidationEvents: ["Prediction market liquidity collapse", "Event resolution rules changed"],
    viewsByHorizon: [
      { horizon: "near-term", view: "CPI release is the next major catalyst for Fed rate cut contract. Position sizing should be small.", confidence: "moderate" },
      { horizon: "medium-term", view: "Fed cut contracts will gain clarity over next 2 months as data accumulates.", confidence: "moderate" },
      { horizon: "long-term", view: "Event markets will become a standard allocation sleeve over next 3-5 years.", confidence: "moderate" },
    ],
    priorViews: [
      { date: "2026-03-01", view: "Recommended small Fed cut position at 45% implied probability", resolved: false },
    ],
    portfolioAwareness: "Your event market allocation is tiny (~0.06%). This is appropriately sized for the risk profile. Don't increase significantly without a strong thesis.",
    beginnerExplanation: "I track prediction markets — places where you can invest based on whether something will happen, like a rate cut or election outcome. These are uncertain by nature, so positions should always be small. Right now, the market thinks there's a 62% chance of a rate cut in June.",
    advancedAnalysis: "The Fed cut June contract at 62% is 10-15% above my fundamental estimate based on data trajectory. However, the asymmetry is interesting: if CPI comes in soft (below 2.5% headline), the contract could spike to 80%+ rapidly. The risk/reward at current levels is marginal for new entry. Consider waiting for CPI release to reassess, or scaling into a small position as an information option.",
    reasoningStyle: "Probabilistic reasoning with catalyst timing and resolution analysis",
    riskSensitivity: "conservative",
    timeHorizonFocus: "near-term",
  },
  {
    id: "adv-risk", domain: "risk", name: "Sentinel", title: "Risk Advisor", icon: "🛡️", color: "hsl(0 65% 55%)",
    currentInsight: "Portfolio concentration in tech elevated at 42%. Crypto allocation above target. Consider trimming NVDA after strong run.",
    confidence: 85, watchingCount: 0,
    mission: "Protect capital through concentration monitoring, drawdown analysis, correlation awareness, position sizing guidance, and risk policy enforcement.",
    watches: [
      { label: "Tech Concentration", status: "alert", detail: "42% tech weight exceeds 35% policy target. NVDA alone is ~5.6%." },
      { label: "Crypto Allocation", status: "alert", detail: "~28% crypto — above 20% maximum in risk policy" },
      { label: "Correlation Risk", status: "changing", detail: "Tech and crypto have 0.65+ correlation in risk-off. Combined ~70% portfolio weight creates fragility." },
      { label: "Max Drawdown Estimate", status: "stable", detail: "Estimated max drawdown: -22% in moderate stress, -38% in severe stress" },
      { label: "Platform Concentration", status: "stable", detail: "Interactive Brokers holds ~36% of portfolio. No single-platform risk beyond comfort." },
      { label: "Position Sizing", status: "alert", detail: "Proposed NVDA add would create 7%+ single position — consider if appropriate" },
    ],
    whatChanged: ["SOL rally pushed crypto allocation 2% above target", "Correlation between tech and crypto increased this month", "Proposed NVDA order would increase concentration"],
    whyItCares: "Risk management is the only edge that compounds reliably. Avoiding catastrophic drawdowns matters more than capturing every opportunity.",
    confidenceLevel: "high",
    uncertaintyLevel: "Risk models are backward-looking. Tail events are by definition not well-captured. I flag what I can measure.",
    whatWouldChangeMind: ["Tech and crypto de-correlating structurally", "Portfolio cash buffer increased significantly", "Risk policy formally updated"],
    recommendations: ["reduce", "proceed-carefully"],
    currentRecommendation: "reduce",
    refusesToConclude: ["Exact drawdown magnitude in crisis — models give ranges, not precision"],
    dataSources: ["Portfolio position data", "Cross-asset correlation matrices", "VaR models", "Historical drawdown analysis", "Platform risk assessments"],
    keyUncertainty: "Whether current risk posture is appropriate for user's actual risk tolerance vs stated tolerance.",
    invalidationEvents: ["User formally increases risk budget", "Major de-risking event reduces concentration naturally"],
    viewsByHorizon: [
      { horizon: "near-term", view: "Immediate risk is manageable but any negative catalyst could trigger correlated selloff.", confidence: "high" },
      { horizon: "medium-term", view: "Earnings season creates binary risk for concentrated tech positions. Consider hedging or trimming.", confidence: "high" },
      { horizon: "long-term", view: "Concentration in winning themes works until it doesn't. Historical reversion is severe.", confidence: "moderate" },
    ],
    priorViews: [
      { date: "2026-03-20", view: "Warned crypto allocation was approaching policy limit at 25%", resolved: false },
      { date: "2026-02-15", view: "Suggested trimming NVDA above $145. Not acted upon.", resolved: false },
    ],
    portfolioAwareness: "Your portfolio is running above-target risk in two dimensions: sector concentration (tech 42% vs 35% target) and asset class (crypto 28% vs 20% target). Combined with high correlation, this creates a fragile portfolio in stress scenarios.",
    beginnerExplanation: "I'm your safety advisor. I watch how much risk your portfolio is carrying and warn you when things get too concentrated. Right now, you have a lot invested in technology and crypto, which tend to move together. If one drops, they all might drop. I'd suggest spreading your investments out a bit more.",
    advancedAnalysis: "Running a Monte Carlo simulation on your current portfolio: 95th percentile monthly drawdown is -14.2%, driven primarily by the tech-crypto correlation bloc. Your effective number of independent bets (ENB) is approximately 3.8 — very low for a 10-position portfolio, indicating heavy overlap in risk factors. The proposed NVDA addition would decrease ENB to 3.5. Recommendation: trim SOL to bring crypto within policy, use proceeds for non-correlated allocation (gold, international equity, or cash).",
    reasoningStyle: "Quantitative risk analysis with policy enforcement",
    riskSensitivity: "conservative",
    timeHorizonFocus: "near-term",
  },
  {
    id: "adv-exec", domain: "execution", name: "Router", title: "Execution Advisor", icon: "⚡", color: "hsl(200 65% 55%)",
    currentInsight: "Market liquidity normal. No unusual spreads. Favorable execution window for large orders: 10:30-11:30 ET.",
    confidence: 90, watchingCount: 3,
    mission: "Optimize trade execution through platform selection, timing, sizing, fee awareness, and slippage minimization.",
    watches: [
      { label: "Market Liquidity", status: "stable", detail: "Bid-ask spreads normal across equity and crypto markets" },
      { label: "Execution Windows", status: "stable", detail: "Best liquidity 10:30-11:30 ET for equities. Crypto 24/7 but best depth during US hours." },
      { label: "Platform Availability", status: "stable", detail: "All connected platforms operational. No outage alerts." },
    ],
    whatChanged: ["No material changes in execution conditions today"],
    whyItCares: "Execution quality directly impacts returns. Poor timing, excessive fees, and slippage are hidden costs that compound against the investor.",
    confidenceLevel: "high",
    uncertaintyLevel: "Execution conditions can change rapidly during news events or market stress. Current conditions are benign.",
    whatWouldChangeMind: ["Flash crash or liquidity event", "Platform outage or degraded service", "Unusual spread widening"],
    recommendations: ["execute-now"],
    currentRecommendation: "execute-now",
    refusesToConclude: ["Future execution conditions during earnings releases — unpredictable"],
    dataSources: ["Real-time spread data", "Platform uptime monitors", "Historical fill quality analysis"],
    keyUncertainty: "Liquidity during earnings-related volatility could be significantly worse than current conditions.",
    invalidationEvents: ["Platform outage", "Market-wide liquidity crisis", "Circuit breaker activation"],
    viewsByHorizon: [
      { horizon: "near-term", view: "Good execution window right now. No reason to delay orders.", confidence: "high" },
      { horizon: "medium-term", view: "Earnings season may require staged entries on volatile names.", confidence: "moderate" },
      { horizon: "long-term", view: "Consider diversifying across platforms for resilience.", confidence: "moderate" },
    ],
    priorViews: [],
    portfolioAwareness: "Your pending NVDA limit order at $130 is 3.8% below current price. This is reasonable for a patient entry but may not fill in the near term. Consider if a market order better serves the thesis.",
    beginnerExplanation: "I help you get the best deal when buying or selling investments. Think of me like a smart order router — I check which platform has the best price, what the fees will be, and when the best time to execute is. Right now, conditions are good for trading.",
    advancedAnalysis: "NVDA $130 limit order analysis: Current price $135.20 means the limit is 3.8% below market. Given average daily range of $4.50 (3.3%), the order has ~35% fill probability within 5 trading days based on recent volatility profile. VWAP execution over the morning session would yield estimated savings of 2-5bps vs market order on 50 shares. Recommend IB SMART routing for best execution.",
    reasoningStyle: "Quantitative execution analysis with platform optimization",
    riskSensitivity: "moderate",
    timeHorizonFocus: "near-term",
  },
  {
    id: "adv-behavioral", domain: "behavioral", name: "Mirror", title: "Behavioral Advisor", icon: "🪞", color: "hsl(320 55% 55%)",
    currentInsight: "You've checked NVDA 12 times this week. Consider if recency bias is driving attention. Your thesis hasn't changed — trust the plan.",
    confidence: 78, watchingCount: 0,
    mission: "Protect the user from emotional, impulsive, and biased decision-making by surfacing behavioral patterns and promoting disciplined investing.",
    watches: [
      { label: "Activity Pattern", status: "alert", detail: "NVDA checked 12 times this week — attention clustering suggests emotional attachment" },
      { label: "Thesis Consistency", status: "stable", detail: "No thesis drift detected. Stated reasons remain valid." },
      { label: "Decision Quality", status: "stable", detail: "Recent decisions aligned with documented strategy" },
      { label: "Overtrading Risk", status: "stable", detail: "Trade frequency normal — no signs of churning" },
    ],
    whatChanged: ["NVDA attention spiked after the dip — classic loss-aversion monitoring behavior", "No impulsive orders placed despite the pullback — positive discipline signal"],
    whyItCares: "Behavioral errors are the largest drag on investor returns. Emotional decisions consistently underperform systematic ones. My job is to be the calm voice.",
    confidenceLevel: "moderate",
    uncertaintyLevel: "I can identify patterns but can't know your actual emotional state. I flag what looks unusual — you decide if it's meaningful.",
    whatWouldChangeMind: ["User explains the monitoring has a specific analytical purpose", "New information genuinely changes the thesis"],
    recommendations: ["observe", "wait"],
    currentRecommendation: "observe",
    refusesToConclude: ["Whether the user is acting emotionally — I can only flag patterns, not diagnose intent"],
    dataSources: ["User activity logs", "Decision history", "Thesis documents", "Trade frequency patterns"],
    keyUncertainty: "Distinguishing deliberate research from anxious monitoring is inherently imprecise.",
    invalidationEvents: ["User explicitly acknowledges and addresses the behavioral pattern"],
    viewsByHorizon: [
      { horizon: "near-term", view: "The NVDA attention pattern is worth noticing. Ask yourself: am I monitoring or worrying?", confidence: "moderate" },
      { horizon: "medium-term", view: "Your overall decision discipline has been good. Keep documenting theses before trades.", confidence: "high" },
      { horizon: "long-term", view: "Building the habit of thesis-first, trade-second will compound into better returns over years.", confidence: "high" },
    ],
    priorViews: [
      { date: "2026-03-10", view: "Flagged potential FOMO pattern during SOL rally", resolved: true, outcome: "User waited, bought at better price. Discipline rewarded." },
    ],
    portfolioAwareness: "Your best decisions have been the ones where you wrote a thesis first and waited for your price. The SOL entry was a great example. The NVDA position was thesis-driven and remains solid. Don't let short-term noise override good process.",
    beginnerExplanation: "I watch your behavior to help you avoid common investing mistakes — like checking your investments too often, panic selling during dips, or buying just because something is going up. Right now, you're paying a lot of attention to NVDA, and I want to make sure that's thoughtful, not anxious.",
    advancedAnalysis: "Behavioral analysis: Your attention-to-NVDA frequency (12 checks/week vs 3/week baseline) correlates with the asset's recent drawdown (-1.74% today, -5% from highs). This pattern matches loss-aversion monitoring in behavioral finance literature. However, your documented thesis remains intact and no new invalidation events have occurred. Recommendation: set a price alert at your limit order level ($130) and reduce manual monitoring. The thesis is either valid or invalidated — checking the price doesn't change that.",
    reasoningStyle: "Behavioral pattern recognition with decision psychology framework",
    riskSensitivity: "conservative",
    timeHorizonFocus: "near-term",
  },
];

// ── Chief Investment Synthesis ──
export const ADVISOR_SYNTHESIS: AdvisorSynthesis = {
  alignmentAreas: [
    "AI infrastructure theme remains the strongest secular driver across equities",
    "Gold as portfolio insurance is well-supported at current allocation",
    "Fed uncertainty is genuine — consensus that June cut is not a certainty",
    "Execution conditions are favorable for any trades decided upon",
  ],
  divergenceAreas: [
    {
      topic: "NVDA Add — Should We Increase Position?",
      positions: [
        { advisorId: "adv-equity", position: "Constructive — dip is accumulation opportunity before GTC catalyst", confidence: 81, reasoning: "Fundamentals remain strong, earnings estimate beatable, GTC catalyst approaching" },
        { advisorId: "adv-risk", position: "Cautious — concentration already elevated, adding increases fragility", confidence: 85, reasoning: "Tech at 42% vs 35% target. Single-name risk above comfort level. Correlation with existing holdings high." },
        { advisorId: "adv-behavioral", position: "Neutral — monitor attention pattern, ensure decision is thesis-driven not emotional", confidence: 78, reasoning: "12 checks/week on NVDA suggests emotional engagement. Thesis is sound but execution should be deliberate." },
      ],
    },
    {
      topic: "Crypto Allocation — Above Policy Target",
      positions: [
        { advisorId: "adv-crypto", position: "Hold — structural bull case intact, SOL momentum strong", confidence: 67, reasoning: "Post-halving dynamics, ETF inflows, ecosystem growth all supportive" },
        { advisorId: "adv-risk", position: "Trim — allocation at 28% vs 20% target creates policy breach", confidence: 85, reasoning: "Concentration risk compounded by high crypto-tech correlation" },
      ],
    },
  ],
  strongestOpportunities: [
    "NVDA accumulation on dip if risk limits can be managed",
    "Gold continuation toward $2800 on central bank buying",
    "Fed cut contract as small asymmetric position if CPI confirms trend",
  ],
  largestRisks: [
    "Tech + crypto correlation at ~70% portfolio weight — severe drawdown in risk-off",
    "Crypto above policy target — unintentional risk drift",
    "Earnings season creating binary risk for concentrated positions",
  ],
  actionJustified: false,
  waitingSmarter: true,
  reviewNext: [
    "Wait for CPI release (May 14) before adjusting Fed rate cut position",
    "Review NVDA thesis after GTC conference for conviction confirmation",
    "Address crypto allocation — bring within policy limits by trimming SOL",
    "Set NVDA price alert at $130 to reduce emotional monitoring",
  ],
  overallConfidence: 72,
  summary: "The board is constructively cautious. The macro environment supports risk assets but portfolio concentration creates fragility. The strongest consensus is that action should be thesis-driven and sized carefully, not reactive. Waiting for key catalysts (CPI, GTC) before major new positions is the disciplined path. The most urgent item is addressing the crypto allocation policy breach.",
};

// ── Platform Connections ──
export const PLATFORM_CONNECTIONS: PlatformConnection[] = [
  { id: "pc-ib", name: "Interactive Brokers", type: "brokerage", status: "connected", lastSyncAt: "2026-04-05T12:30:00Z", accountValue: 182500, icon: "🏦", capabilities: ["Portfolio sync", "Trade execution", "Forex"], authMethod: "oauth" },
  { id: "pc-schwab", name: "Charles Schwab", type: "brokerage", status: "connected", lastSyncAt: "2026-04-05T11:45:00Z", accountValue: 107600, icon: "🏛️", capabilities: ["Portfolio sync", "Balance tracking"], authMethod: "oauth" },
  { id: "pc-cb", name: "Coinbase", type: "exchange", status: "connected", lastSyncAt: "2026-04-05T13:00:00Z", accountValue: 210250, icon: "🪙", capabilities: ["Crypto positions", "Order routing", "Staking"], authMethod: "api-key" },
  { id: "pc-poly", name: "Polymarket", type: "event-market", status: "connected", lastSyncAt: "2026-04-05T12:00:00Z", accountValue: 310, icon: "🎯", capabilities: ["Event positions", "Probability tracking"], authMethod: "oauth" },
  { id: "pc-phantom", name: "Phantom", type: "wallet", status: "connected", lastSyncAt: "2026-04-05T14:00:00Z", accountValue: 18400, icon: "👻", chain: "Solana", capabilities: ["Token balances", "DeFi positions", "NFTs"], authMethod: "extension" },
  { id: "pc-meta", name: "MetaMask", type: "wallet", status: "disconnected", icon: "🦊", chain: "Ethereum", capabilities: ["Token balances", "DeFi positions"], authMethod: "extension" },
  { id: "pc-oanda", name: "OANDA", type: "forex", status: "connected", lastSyncAt: "2026-04-05T12:15:00Z", accountValue: 24300, icon: "🌐", region: "Global", capabilities: ["Forex positions", "Real-time rates"], authMethod: "api-key" },
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

// ── Stress Scenarios ──
export const STRESS_SCENARIOS = [
  { id: "ss1", name: "Rates Spike +100bps", icon: "📈", impact: -14.2, description: "Fed forced to hike due to inflation resurgence", affectedClasses: ["stocks", "crypto", "events"], portfolioImpact: { stocks: -8, crypto: -22, commodities: +5, events: -15, etfs: -7 } },
  { id: "ss2", name: "Crypto Crash -40%", icon: "💥", impact: -11.2, description: "Major exchange failure or regulatory crackdown", affectedClasses: ["crypto"], portfolioImpact: { stocks: -2, crypto: -40, commodities: 0, events: -5, etfs: -1 } },
  { id: "ss3", name: "Geopolitical Crisis", icon: "⚠️", impact: -18.5, description: "Major conflict escalation disrupting energy and trade", affectedClasses: ["stocks", "crypto", "commodities"], portfolioImpact: { stocks: -15, crypto: -25, commodities: +12, events: -10, etfs: -14 } },
  { id: "ss4", name: "Liquidity Freeze", icon: "🧊", impact: -22.0, description: "Credit market seizure similar to 2008", affectedClasses: ["stocks", "crypto", "events"], portfolioImpact: { stocks: -20, crypto: -35, commodities: -10, events: -20, etfs: -18 } },
  { id: "ss5", name: "AI Bubble Pop", icon: "🫧", impact: -16.8, description: "AI capex cycle reverses, semiconductor demand collapses", affectedClasses: ["stocks"], portfolioImpact: { stocks: -25, crypto: -10, commodities: -3, events: -5, etfs: -12 } },
];

// ── Risk Policy Settings ──
export const RISK_POLICIES = [
  { id: "rp1", label: "Max Single Position", value: "8%", current: "5.6% (NVDA)", status: "ok" as const },
  { id: "rp2", label: "Max Sector Concentration", value: "35%", current: "42% (Tech)", status: "breach" as const },
  { id: "rp3", label: "Max Crypto Allocation", value: "20%", current: "28%", status: "breach" as const },
  { id: "rp4", label: "Max Drawdown Alert", value: "-15%", current: "-8.2% est.", status: "ok" as const },
  { id: "rp5", label: "Min Cash Reserve", value: "10%", current: "8.3%", status: "warn" as const },
  { id: "rp6", label: "Max Platform Exposure", value: "50%", current: "36% (IB)", status: "ok" as const },
];

// ── Advisor Memos ──
export const ADVISOR_MEMOS = [
  { id: "am1", advisorId: "adv-macro", advisorName: "Atlas", advisorIcon: "🌍", title: "Macro Regime Update: Late-Cycle With Easing Bias", date: "2026-04-08", summary: "Soft landing remains base case. The Fed's data-dependent stance means CPI releases are the primary catalyst for rate expectations. Watch May 14 CPI closely.", tags: ["macro", "fed", "rates"] },
  { id: "am2", advisorId: "adv-risk", advisorName: "Sentinel", advisorIcon: "🛡️", title: "Portfolio Risk Alert: Concentration Breach", date: "2026-04-07", summary: "Tech concentration at 42% breaches 35% policy limit. Crypto at 28% breaches 20% limit. Combined correlated exposure creates -22% estimated drawdown in moderate stress.", tags: ["risk", "concentration", "policy"] },
  { id: "am3", advisorId: "adv-equity", advisorName: "Maven", advisorIcon: "📈", title: "Earnings Season Preview: Key Watchpoints", date: "2026-04-05", summary: "Q2 earnings begin in 3 weeks. NVDA GTC conference in September is the next major catalyst. MSFT approaching ATH on Copilot revenue traction.", tags: ["earnings", "nvda", "msft"] },
  { id: "am4", advisorId: "adv-behavioral", advisorName: "Mirror", advisorIcon: "🪞", title: "Behavioral Pattern: NVDA Attention Clustering", date: "2026-04-04", summary: "12 NVDA checks this week vs 3/week baseline. This matches loss-aversion monitoring pattern. Thesis unchanged — set price alert and reduce manual checking.", tags: ["behavioral", "nvda", "discipline"] },
];

// ── Catalyst Calendar (for Research Library) ──
export const CATALYST_CALENDAR = [
  { id: "cc1", date: "2026-05-14", title: "CPI Release", type: "macro", instruments: ["ev-fed"], impact: "high", description: "Key inflation data — drives Fed rate cut probability" },
  { id: "cc2", date: "2026-06-18", title: "FOMC Meeting", type: "macro", instruments: ["ev-fed", "gold"], impact: "high", description: "Rate decision and updated dot plot" },
  { id: "cc3", date: "2026-07-31", title: "Apple Q3 Earnings", type: "earnings", instruments: ["aapl"], impact: "high", description: "Fiscal Q3 results — AI device integration update" },
  { id: "cc4", date: "2026-08-08", title: "Tesla Robotaxi Launch", type: "product", instruments: ["tsla"], impact: "high", description: "Autonomous ride-hailing service debut" },
  { id: "cc5", date: "2026-09-15", title: "NVIDIA GTC Conference", type: "product", instruments: ["nvda"], impact: "high", description: "Next-gen architecture reveal" },
  { id: "cc6", date: "2026-04-20", title: "Bitcoin Halving Anniversary", type: "event", instruments: ["btc"], impact: "medium", description: "One year post-halving supply dynamics assessment" },
];

// ── Performance Timeline Data ──
export const PERFORMANCE_TIMELINE: Record<string, number> = {
  "1D": 0.82, "1W": 1.45, "1M": 3.21, "3M": 8.76, "6M": 14.52, "YTD": 11.38, "1Y": 22.65,
};

// ── Sync History (for Platform Connections) ──
export const SYNC_HISTORY = [
  { id: "sh1", platformId: "pc-ib", timestamp: "2026-04-05T12:30:00Z", status: "success" as const, positionsSynced: 5, duration: "1.2s" },
  { id: "sh2", platformId: "pc-cb", timestamp: "2026-04-05T13:00:00Z", status: "success" as const, positionsSynced: 3, duration: "0.8s" },
  { id: "sh3", platformId: "pc-schwab", timestamp: "2026-04-05T11:45:00Z", status: "success" as const, positionsSynced: 2, duration: "1.5s" },
  { id: "sh4", platformId: "pc-poly", timestamp: "2026-04-05T12:00:00Z", status: "success" as const, positionsSynced: 1, duration: "0.6s" },
  { id: "sh5", platformId: "pc-meta", timestamp: "2026-04-01T09:00:00Z", status: "failed" as const, positionsSynced: 0, duration: "—" },
];

// ── Platform Permissions ──
export const PLATFORM_PERMISSIONS: Record<string, string[]> = {
  "pc-ib": ["Read Positions", "Read Balances", "Place Orders", "View History"],
  "pc-schwab": ["Read Positions", "Read Balances", "View History"],
  "pc-cb": ["Read Positions", "Read Balances", "Place Orders", "View History", "Withdraw"],
  "pc-poly": ["Read Positions", "Read Balances", "Place Orders"],
  "pc-meta": [],
};

// ── Advisor Event Alerts (for Boardroom) ──
export const ADVISOR_EVENT_ALERTS = [
  { id: "aea1", catalystId: "cc1", advisorId: "adv-macro", advisorName: "Atlas", advisorIcon: "🌍", title: "CPI Release — May 14", urgency: "high" as const, advisorNote: "This is the single most important data point for the Fed rate path. Expect volatility across rate-sensitive assets. If CPI comes in below 2.8%, June cut probability rises significantly.", actionSuggestion: "Review Fed rate cut position (FED-CUT-JUN) sizing before release" },
  { id: "aea2", catalystId: "cc5", advisorId: "adv-equity", advisorName: "Maven", advisorIcon: "📈", title: "NVIDIA GTC Conference — Sep 15", urgency: "high" as const, advisorNote: "Next-gen Blackwell Ultra architecture expected. This is a thesis validation catalyst for NVDA position. Strong reveal could drive 10-15% move.", actionSuggestion: "Hold NVDA position through catalyst; consider adding below $130" },
  { id: "aea3", catalystId: "cc4", advisorId: "adv-behavioral", advisorName: "Mirror", advisorIcon: "🪞", title: "Tesla Robotaxi Launch — Aug 8", urgency: "moderate" as const, advisorNote: "High narrative event with binary outcome risk. Your monitoring pattern suggests emotional attachment to TSLA thesis. Simulate scenarios before event.", actionSuggestion: "Run upside/downside simulation in Strategy Studio" },
  { id: "aea4", catalystId: "cc6", advisorId: "adv-crypto", advisorName: "Cipher", advisorIcon: "🔐", title: "Bitcoin Halving Anniversary — Apr 20", urgency: "moderate" as const, advisorNote: "Supply dynamics post-halving historically play out over 12-18 months. We're approaching the window where prior cycles showed strongest returns.", actionSuggestion: "Review BTC thesis conviction and sizing" },
  { id: "aea5", catalystId: "cc2", advisorId: "adv-macro", advisorName: "Atlas", advisorIcon: "🌍", title: "FOMC Meeting — Jun 18", urgency: "high" as const, advisorNote: "Updated dot plot and press conference are the event. Market currently pricing 62% cut — I think that's 10-15% too aggressive. Expect repricing regardless of outcome.", actionSuggestion: "Position sizing for event volatility; consider hedging" },
];

// ── Post-Trade Reviews (for Receipts) ──
export const POST_TRADE_REVIEWS = [
  {
    id: "ptr1", receiptId: "rec-1", tradeTitle: "Buy NVDA × 200 shares", date: "2025-08-15",
    advisorComments: [
      { advisorId: "adv-equity", advisorName: "Maven", advisorIcon: "📈", comment: "Entry at $95.50 was excellent — below our $100 accumulation zone. Thesis on AI infrastructure supercycle intact and strengthening.", verdict: "well-executed" as const },
      { advisorId: "adv-risk", advisorName: "Sentinel", advisorIcon: "🛡️", comment: "Position sized at 3.8% of portfolio at entry — within 8% single position policy. Now at 5.6% due to appreciation. Monitor for drift.", verdict: "acceptable" as const },
      { advisorId: "adv-behavioral", advisorName: "Mirror", advisorIcon: "🪞", comment: "Entry was thesis-driven, not reactive. Good discipline. However, post-purchase monitoring frequency has increased 4x — set alerts and reduce manual checking.", verdict: "caution" as const },
    ],
    thesisAccuracy: "Thesis projected 12-18 month appreciation cycle. Currently 8 months in, +41.6% return. On track with original projection.",
    whatChanged: "AI capex growing faster than expected. Export controls narrower than feared. Competition weaker than assumed.",
    lessonsLearned: "Conviction sizing paid off. Should have been higher conviction earlier based on supply chain data.",
  },
  {
    id: "ptr2", receiptId: "rec-2", tradeTitle: "Buy BTC × 1.5", date: "2025-11-01",
    advisorComments: [
      { advisorId: "adv-crypto", advisorName: "Cipher", advisorIcon: "🔐", comment: "Entry at $62,000 was good timing relative to halving cycle. ETF inflow thesis playing out as expected.", verdict: "well-executed" as const },
      { advisorId: "adv-macro", advisorName: "Atlas", advisorIcon: "🌍", comment: "Macro backdrop was supportive at entry. Rate cut expectations provided tailwind. Risk is if macro turns hawkish.", verdict: "acceptable" as const },
      { advisorId: "adv-risk", advisorName: "Sentinel", advisorIcon: "🛡️", comment: "Crypto allocation now at 28% vs 20% policy limit — the position itself was fine but the drift has created a policy breach. Needs trimming.", verdict: "needs-action" as const },
    ],
    thesisAccuracy: "Post-halving cycle thesis projected $100K-$125K target. Currently at $97,450 — approaching target. Thesis structurally intact.",
    whatChanged: "Institutional adoption faster than expected. ETF inflows exceeded projections. Regulatory environment more favorable than assumed.",
    lessonsLearned: "Should have set automatic rebalancing triggers when position exceeded policy limit.",
  },
];

// ── Ask Advisor Questions ──
export const ASK_ADVISOR_QUESTIONS = [
  { id: "q1", label: "What matters most?", icon: "🎯", field: "currentInsight" as const },
  { id: "q2", label: "Why are you cautious?", icon: "⚠️", field: "keyUncertainty" as const },
  { id: "q3", label: "Explain simply", icon: "💡", field: "beginnerExplanation" as const },
  { id: "q4", label: "What would change your mind?", icon: "🔄", field: "whatWouldChangeMind" as const },
  { id: "q5", label: "How would you size this?", icon: "📐", field: "portfolioAwareness" as const },
  { id: "q6", label: "What's the biggest hidden risk?", icon: "🕳️", field: "advancedAnalysis" as const },
];

// ── Ask the Board Questions ──
export const ASK_BOARD_QUESTIONS = [
  { id: "bq1", label: "What does the board think?", icon: "🧠", responseKey: "summary" as const },
  { id: "bq2", label: "Top disagreements?", icon: "⚔️", responseKey: "divergenceAreas" as const },
  { id: "bq3", label: "Where do you align?", icon: "🤝", responseKey: "alignmentAreas" as const },
  { id: "bq4", label: "Strongest argument against?", icon: "🛑", responseKey: "largestRisks" as const },
];

// ── Strategy Advisor Comments ──
export const STRATEGY_ADVISOR_COMMENTS: Record<string, { advisorId: string; advisorName: string; advisorIcon: string; stance: "supportive" | "cautious" | "opposed" | "conditional"; comment: string }[]> = {
  st1: [
    { advisorId: "adv-macro", advisorName: "Atlas", advisorIcon: "🌍", stance: "supportive", comment: "Conservative allocation fits late-cycle macro environment. 30% cash provides dry powder for opportunities." },
    { advisorId: "adv-risk", advisorName: "Sentinel", advisorIcon: "🛡️", stance: "supportive", comment: "Max drawdown -12% is well within acceptable limits. Diversification across asset classes reduces correlation risk." },
    { advisorId: "adv-behavioral", advisorName: "Mirror", advisorIcon: "🪞", stance: "cautious", comment: "Conservative strategies can lead to performance anxiety when markets rally. Ensure you're comfortable with underperformance in bull moves." },
  ],
  st2: [
    { advisorId: "adv-equity", advisorName: "Maven", advisorIcon: "📈", stance: "supportive", comment: "Growth focus is appropriate if your thesis on AI capex cycle is correct. 50% equity weight captures the upside." },
    { advisorId: "adv-risk", advisorName: "Sentinel", advisorIcon: "🛡️", stance: "cautious", comment: "Max drawdown -30% is significant. 15% crypto adds tail risk. Ensure position sizing respects drawdown tolerance." },
    { advisorId: "adv-macro", advisorName: "Atlas", advisorIcon: "🌍", stance: "conditional", comment: "This works in risk-on regime. If macro shifts to risk-off, this portfolio is highly exposed. Monitor regime signals." },
  ],
  st3: [
    { advisorId: "adv-crypto", advisorName: "Cipher", advisorIcon: "🔐", stance: "supportive", comment: "35% crypto allocation captures post-halving cycle. Diversified across BTC/ETH/SOL reduces single-token risk." },
    { advisorId: "adv-risk", advisorName: "Sentinel", advisorIcon: "🛡️", stance: "opposed", comment: "Max drawdown -45% exceeds reasonable risk tolerance for most portfolios. Crypto correlation in stress events makes this dangerous." },
    { advisorId: "adv-behavioral", advisorName: "Mirror", advisorIcon: "🪞", stance: "cautious", comment: "Crypto-heavy portfolios create strong emotional volatility. High monitoring frequency and impulsive trading often follow." },
  ],
  st4: [
    { advisorId: "adv-events", advisorName: "Oracle", advisorIcon: "🎯", stance: "supportive", comment: "Event markets offer uncorrelated returns. 30% allocation with 35% cash reserves provides asymmetric payoff profile." },
    { advisorId: "adv-risk", advisorName: "Sentinel", advisorIcon: "🛡️", stance: "conditional", comment: "Acceptable if event positions are individually small and time-bounded. Resolution risk must be managed per-contract." },
    { advisorId: "adv-macro", advisorName: "Atlas", advisorIcon: "🌍", stance: "cautious", comment: "Event markets are thesis-dependent. Ensure each position has a clear catalyst calendar and exit condition." },
  ],
  st5: [
    { advisorId: "adv-commodities", advisorName: "Forge", advisorIcon: "⛏️", stance: "supportive", comment: "Commodity hedge is prudent given geopolitical risk and potential inflation resurgence. 35% allocation provides real diversification." },
    { advisorId: "adv-macro", advisorName: "Atlas", advisorIcon: "🌍", stance: "supportive", comment: "Commodities perform well in inflationary and geopolitical stress scenarios — natural hedge for the rest of the portfolio." },
    { advisorId: "adv-equity", advisorName: "Maven", advisorIcon: "📈", stance: "cautious", comment: "25% equity weight may miss secular growth trends. Consider whether this is a permanent allocation or tactical hedge." },
  ],
  st6: [
    { advisorId: "adv-income", advisorName: "Yield", advisorIcon: "💰", stance: "supportive", comment: "50% cash with income instruments provides stability. Expected 4-6% return with -8% max drawdown is excellent risk-adjusted." },
    { advisorId: "adv-risk", advisorName: "Sentinel", advisorIcon: "🛡️", stance: "supportive", comment: "Lowest risk profile available. Appropriate for capital preservation or near-term liquidity needs." },
    { advisorId: "adv-equity", advisorName: "Maven", advisorIcon: "📈", stance: "cautious", comment: "Zero crypto and minimal equity means missing the strongest return drivers. Only appropriate if capital preservation is the primary goal." },
  ],
};

// ── Multi-Layer Explainability ─────────────────────────────────
export type ExplainabilityDepth = "simple" | "analyst" | "committee" | "execution" | "risk";

export interface ExplainabilityLayer {
  depth: ExplainabilityDepth;
  label: string;
  content: string;
}

export const EXPLAINABILITY_LAYERS: Record<string, ExplainabilityLayer[]> = {
  nvda: [
    { depth: "simple", label: "Simple", content: "NVIDIA makes the chips that power AI. Demand is very high right now, which is good for the stock price. The risk is that demand could slow down." },
    { depth: "analyst", label: "Analyst", content: "• Revenue growth driven by data center GPU demand (H100/B100 cycle)\n• Forward P/E at 35x reflects high expectations — EPS must deliver $6+ for FY27\n• Key risk: export controls to China could reduce TAM by ~15%\n• Catalyst: GTC Conference in September may reveal next-gen architecture\n• Technical: Support at $125, resistance at $153 (52W high)" },
    { depth: "committee", label: "Committee", content: "Equity Advisor (Maven): Strong buy — AI infrastructure thesis remains the decade's strongest secular trend. 72% confidence.\n\nRisk Advisor (Sentinel): Caution — position already at 6.2% of portfolio. Adding more increases concentration risk. Recommend capping at 8%.\n\nMacro Advisor (Atlas): Supportive — current rate environment and tech spending cycle are tailwinds. However, a 2026 slowdown could compress multiples.\n\nSynthesis: Board leans positive but recommends staged entry rather than a full add." },
    { depth: "execution", label: "Execution", content: "Recommended action: Add $4K now (half of planned $8K), hold remaining for post-earnings clarity.\n\nEntry: Limit order at $133.50 (1.3% below current)\nStop loss: $118 (-12.5% from entry)\nTarget: $165 (+23.6%)\nSize: 2% of portfolio per tranche\nTimeline: Enter first tranche this week, second after Q3 earnings (July 31)\nPlatform: Schwab brokerage account" },
    { depth: "risk", label: "Risk", content: "Concentration risk: Adding $8K would push NVDA to 9.2% of portfolio — above the 8% single-position limit in your Investment Constitution.\n\nCorrelation risk: High beta to tech sector. Combined with AAPL (5.1%) and MSFT (4.8%), technology exposure would reach 19.1%.\n\nDrawdown scenario: In a broad market selloff (-15%), NVDA could decline -25% to -30% given its beta of 1.8.\n\nLiquidity risk: Low — average daily volume $42B.\n\nEvent risk: Export control expansion could trigger -15% to -20% gap down.\n\nRecommendation: Reduce planned size from $8K to $4K to stay within constitution limits." },
  ],
  btc: [
    { depth: "simple", label: "Simple", content: "Bitcoin is a digital currency that some people treat like digital gold. It goes up and down a lot. Right now, big companies are buying it through ETFs." },
    { depth: "analyst", label: "Analyst", content: "• Post-halving supply dynamics: daily issuance reduced to ~450 BTC\n• ETF net inflows averaging $200M/week — institutional demand accelerating\n• On-chain metrics: long-term holder supply ratio at 78% (bullish)\n• Resistance at $100K psychological level; support at $88K\n• Correlation with equities has increased to 0.6 — less of a diversifier" },
    { depth: "committee", label: "Committee", content: "Crypto Advisor (Oracle): Bullish — halving cycle historically produces 12-18 month rallies. 55% confidence due to macro uncertainty.\n\nRisk Advisor (Sentinel): Position at 12% is already above the 10% crypto sleeve target. No further additions recommended.\n\nBehavioral Advisor (Mirror): Detected FOMO pattern — last two BTC entries were reactive. Recommend simulation before any action.\n\nSynthesis: Hold current position. No additions until price consolidation or thesis strengthens." },
    { depth: "execution", label: "Execution", content: "Recommended action: HOLD — no new additions at current levels.\n\nIf adding despite board caution:\nEntry: DCA over 4 weeks at $1K/week\nStop loss: $78,000 (-20% from current)\nMax allocation: 12% (already at limit)\nPlatform: Coinbase\nNote: Behavioral firewall flagged FOMO pattern — requires simulation before execution." },
    { depth: "risk", label: "Risk", content: "Allocation risk: At 12%, BTC exceeds the 10% crypto sleeve target set in your Investment Constitution.\n\nVolatility risk: 30-day realized volatility at 65% annualized. A 2-sigma move = -$11,700 portfolio impact.\n\nRegulatory risk: SEC enforcement actions against exchanges remain ongoing.\n\nCorrelation risk: BTC + ETH + SOL combined = 18.4% crypto exposure. In a crypto-specific crash (-50%), portfolio impact = -9.2%.\n\nCustody risk: Exchange-held assets (Coinbase) carry counterparty risk.\n\nRecommendation: No additions. Consider reducing to 10% target on next rally above $100K." },
  ],
};

// ── Demo Source Classification ─────────────────────────────────
export const __DEMO_SOURCE__ = true;
export const __DATA_CLASSIFICATION__ = "demo-scenario" as const;
