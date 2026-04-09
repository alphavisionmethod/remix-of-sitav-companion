// SITA OS — Demo Data: Investment

import {
  Activity,
  Calendar,
  Coins,
  Eye,
  GraduationCap,
  Home,
  Landmark,
  Search,
  Shield,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";

type RuleCategory = "sizing" | "behavior" | "governance" | "discipline";
type AssetClass = "stocks" | "etfs" | "crypto" | "commodities" | "events" | "cash";

interface Rule {
  id: string;
  label: string;
  description: string;
  value: string;
  category: RuleCategory;
  active: boolean;
  severity: "hard" | "soft";
}

interface Receipt {
  id: string;
  type: "trade" | "approval" | "thesis" | "risk-change" | "rebalance" | "advisor-snapshot";
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  status: "completed" | "approved" | "rejected" | "pending";
  metadata: Record<string, string>;
}

const PORTFOLIO = {
  totalValue: 500000,
  totalCash: 62000,
};

export const DEMO_LEARN_TOPICS = [
  { icon: "📊", title: "What is a portfolio?", desc: "Your portfolio is the collection of all your investments across platforms. Think of it as your investment library." },
  { icon: "⚖️", title: "What is risk?", desc: "Risk means how much your investments could lose. Higher risk means bigger possible gains AND losses." },
  { icon: "🎯", title: "What is a thesis?", desc: "A thesis is your reason for investing. Writing it down helps you make better decisions and learn from results." },
  { icon: "🔮", title: "What are event markets?", desc: "Event markets let you invest based on whether something will happen — like elections or rate decisions." },
  { icon: "🛡️", title: "What is diversification?", desc: "Spreading money across different types of investments so one bad bet doesn't hurt your whole portfolio." },
  { icon: "📈", title: "What are advisors?", desc: "SITA advisors are AI specialists that watch different parts of the market and give you guidance." },
];

export const DEMO_BEHAVIORAL_SIGNALS = [
  { id: "bs1", type: "attention", severity: "moderate", title: "Attention Clustering on NVDA", detail: "You've checked NVDA 12 times this week (baseline: 3). This pattern correlates with loss-aversion monitoring after drawdowns.", suggestion: "Set a price alert at your limit order ($130) and reduce manual checking. The thesis is either valid or invalidated — checking the price doesn't change that.", timestamp: "Today", icon: "👁️" },
  { id: "bs2", type: "discipline", severity: "positive", title: "SOL Entry Was Disciplined", detail: "You waited for the pullback rather than chasing the rally — exactly what Mirror recommended. Good pattern.", suggestion: "Continue this approach. Thesis-first, price-second discipline is your strongest investing habit.", timestamp: "Last week", icon: "✅" },
  { id: "bs3", type: "allocation", severity: "warning", title: "Crypto Sleeve Drift Unaddressed", detail: "Crypto allocation has been above your 20% policy target for 3 weeks without action. This could indicate either intentional override or passive drift.", suggestion: "Either formally update your constitution to reflect new target, or trim to bring within policy. Ambiguity erodes discipline.", timestamp: "3 weeks", icon: "⚠️" },
  { id: "bs4", type: "consistency", severity: "positive", title: "Thesis Documentation Consistent", detail: "You've documented rationale for your last 3 positions before entering. This is strong investment process.", suggestion: "Keep maintaining this habit. Documented theses improve post-trade review quality.", timestamp: "Ongoing", icon: "📝" },
  { id: "bs5", type: "timing", severity: "info", title: "No Overtrading Detected", detail: "Your trade frequency is normal (2 trades/month). No signs of churning or impulsive activity.", suggestion: "Current pace is healthy. Avoid increasing frequency during volatile periods without thesis justification.", timestamp: "This month", icon: "⏱️" },
];

export const DEMO_INV_PURPOSES = [
  { id: "ltw", label: "Long-Term Wealth", icon: <TrendingUp className="h-5 w-5" />, emoji: "🏦", allocated: 245000, target: 60, actual: 49.2, color: "bg-primary" },
  { id: "fam", label: "Family Security", icon: <Shield className="h-5 w-5" />, emoji: "🛡️", allocated: 85000, target: 20, actual: 17.1, color: "bg-[hsl(var(--trust-safe))]" },
  { id: "res", label: "Reserve Cash", icon: <Wallet className="h-5 w-5" />, emoji: "💵", allocated: 62000, target: 10, actual: 12.4, color: "bg-muted-foreground" },
  { id: "opp", label: "Opportunity Sleeve", icon: <Target className="h-5 w-5" />, emoji: "🎯", allocated: 48000, target: 5, actual: 9.6, color: "bg-[hsl(var(--trust-warn))]" },
  { id: "spec", label: "Speculative Sleeve", icon: <Zap className="h-5 w-5" />, emoji: "⚡", allocated: 35000, target: 3, actual: 7.0, color: "bg-destructive" },
  { id: "evt", label: "Event Sleeve", icon: <Calendar className="h-5 w-5" />, emoji: "📅", allocated: 12000, target: 1, actual: 2.4, color: "bg-purple-500" },
  { id: "inc", label: "Income Sleeve", icon: <Coins className="h-5 w-5" />, emoji: "💰", allocated: 11000, target: 1, actual: 2.2, color: "bg-amber-500" },
];

export const DEMO_INV_RULES = [
  { rule: "Speculative sleeve must not exceed 5% of total capital", status: "violated", detail: "Currently 7.0% — trim $10K" },
  { rule: "Reserve cash must cover 6 months of expenses", status: "pass", detail: "$62K covers ~8 months" },
  { rule: "Family security must be in low-volatility assets only", status: "pass", detail: "Gold + bonds + cash" },
  { rule: "Event sleeve capped at 2% of total", status: "violated", detail: "Currently 2.4% — reduce by $2K" },
];

export const DEMO_INV_PURPOSES_CAPITAL_TWIN = [
  { id: "long-term", label: "Long-Term Wealth", icon: "🏛️", color: "hsl(var(--primary))", allocated: 45, value: PORTFOLIO.totalValue * 0.45, target: 50, risk: "moderate" },
  { id: "family-security", label: "Family Security", icon: "🛡️", color: "hsl(152 55% 48%)", allocated: 15, value: PORTFOLIO.totalValue * 0.15, target: 15, risk: "very-low" },
  { id: "reserve", label: "Reserve Cash", icon: "💵", color: "hsl(200 65% 55%)", allocated: 8, value: PORTFOLIO.totalCash, target: 10, risk: "very-low" },
  { id: "opportunity", label: "Opportunity Sleeve", icon: "🎯", color: "hsl(38 85% 58%)", allocated: 15, value: PORTFOLIO.totalValue * 0.15, target: 15, risk: "high" },
  { id: "speculative", label: "Speculative Sleeve", icon: "🔥", color: "hsl(0 65% 55%)", allocated: 12, value: PORTFOLIO.totalValue * 0.12, target: 8, risk: "very-high" },
  { id: "event", label: "Event Sleeve", icon: "🔮", color: "hsl(280 60% 55%)", allocated: 3, value: PORTFOLIO.totalValue * 0.03, target: 2, risk: "high" },
  { id: "income", label: "Income Sleeve", icon: "📈", color: "hsl(152 55% 48%)", allocated: 2, value: PORTFOLIO.totalValue * 0.02, target: 5, risk: "low" },
];

export const DEMO_SHOCK_ZONES = [
  { label: "Tech + Crypto Correlation", severity: "high", exposure: 70, detail: "A risk-off event could hit ~70% of portfolio simultaneously" },
  { label: "USD Denomination", severity: "moderate", exposure: 95, detail: "Nearly all assets denominated in USD — no currency diversification" },
  { label: "Exchange/Counterparty", severity: "low", exposure: 28, detail: "Coinbase holds 28% — manageable but monitor" },
];

export const DEMO_CATALYST_EVENTS = [
  { id: "ce1", title: "CPI Release", date: "2026-05-14", type: "macro", impact: "high", assets: ["SPY", "XAUUSD", "FED-CUT-JUN"], description: "Key inflation data — determines Fed rate path", portfolioExposure: 45 },
  { id: "ce2", title: "Fed FOMC Meeting", date: "2026-06-18", type: "macro", impact: "high", assets: ["SPY", "XAUUSD", "BTC", "FED-CUT-JUN"], description: "Rate decision and forward guidance", portfolioExposure: 80 },
  { id: "ce3", title: "AAPL Q3 Earnings", date: "2026-07-31", type: "earnings", impact: "moderate", assets: ["AAPL"], description: "Fiscal Q3 results — AI integration and Services growth", portfolioExposure: 8 },
  { id: "ce4", title: "BTC Halving Anniversary", date: "2026-04-20", type: "event", impact: "moderate", assets: ["BTC", "ETH", "SOL"], description: "One year post-halving — supply dynamics catalyst", portfolioExposure: 28 },
  { id: "ce5", title: "TSLA Robotaxi Launch", date: "2026-08-08", type: "product", impact: "high", assets: ["TSLA"], description: "Autonomous ride-hailing service commercial launch", portfolioExposure: 3 },
  { id: "ce6", title: "NVDA GTC Conference", date: "2026-09-15", type: "product", impact: "high", assets: ["NVDA"], description: "Next-gen architecture reveal expected", portfolioExposure: 6 },
  { id: "ce7", title: "Jobs Report", date: "2026-05-02", type: "macro", impact: "moderate", assets: ["SPY", "FED-CUT-JUN"], description: "Non-farm payrolls and unemployment rate", portfolioExposure: 50 },
  { id: "ce8", title: "OPEC+ Meeting", date: "2026-06-01", type: "macro", impact: "moderate", assets: ["CL"], description: "Production quota review — OPEC discipline under pressure", portfolioExposure: 0 },
];

export const DEMO_POSITIONS = [
  {
    symbol: "NVDA", name: "NVIDIA", icon: "💚",
    conviction: 82, uncertainty: 28, catalystStrength: 85, downsideFragility: 35,
    thesisClarity: 90, portfolioFit: 60, timeHorizonFit: 80,
    overall: 78, verdict: "Strong conviction — moderate concentration concern",
  },
  {
    symbol: "BTC", name: "Bitcoin", icon: "₿",
    conviction: 72, uncertainty: 45, catalystStrength: 60, downsideFragility: 55,
    thesisClarity: 75, portfolioFit: 45, timeHorizonFit: 85,
    overall: 62, verdict: "Good conviction — allocation above policy, trim to improve fit",
  },
  {
    symbol: "SOL", name: "Solana", icon: "◎",
    conviction: 65, uncertainty: 55, catalystStrength: 50, downsideFragility: 65,
    thesisClarity: 60, portfolioFit: 55, timeHorizonFit: 70,
    overall: 55, verdict: "Moderate conviction — speculative allocation, size appropriately",
  },
  {
    symbol: "XAUUSD", name: "Gold", icon: "🥇",
    conviction: 75, uncertainty: 20, catalystStrength: 40, downsideFragility: 15,
    thesisClarity: 85, portfolioFit: 90, timeHorizonFit: 90,
    overall: 80, verdict: "High conviction — excellent portfolio hedge, low fragility",
  },
  {
    symbol: "AAPL", name: "Apple", icon: "🍎",
    conviction: 68, uncertainty: 30, catalystStrength: 55, downsideFragility: 30,
    thesisClarity: 70, portfolioFit: 70, timeHorizonFit: 85,
    overall: 68, verdict: "Solid conviction — quality hold with AI optionality",
  },
];

export const DEMO_DIMS: Array<{ key: keyof Pick<typeof DEMO_POSITIONS[0], "conviction" | "uncertainty" | "catalystStrength" | "downsideFragility" | "thesisClarity" | "portfolioFit" | "timeHorizonFit">; label: string; color: string; inverted?: boolean }> = [
  { key: "conviction", label: "Conviction", color: "bg-primary" },
  { key: "uncertainty", label: "Uncertainty", color: "bg-destructive", inverted: true },
  { key: "catalystStrength", label: "Catalyst Strength", color: "bg-[hsl(var(--trust-safe))]" },
  { key: "downsideFragility", label: "Downside Fragility", color: "bg-[hsl(var(--trust-warn))]", inverted: true },
  { key: "thesisClarity", label: "Thesis Clarity", color: "bg-primary" },
  { key: "portfolioFit", label: "Portfolio Fit", color: "bg-[hsl(var(--trust-safe))]" },
  { key: "timeHorizonFit", label: "Time Horizon Fit", color: "bg-primary" },
];

export const DEMO_NARRATIVES = [
  {
    id: "n1", title: "AI Infrastructure Supercycle", icon: "🤖", strength: 90,
    connections: [
      { asset: "NVDA", class: "Equity", role: "GPU monopoly — direct beneficiary" },
      { asset: "MSFT", class: "Equity", role: "Azure AI / Copilot — infrastructure + monetization" },
      { asset: "BTC", class: "Crypto", role: "Risk-on correlation — AI narrative lifts crypto sentiment" },
      { asset: "SPY", class: "ETF", role: "Tech-heavy index benefits from AI leadership" },
    ],
    macroDrivers: ["Fed easing supports growth multiples", "Corporate AI capex accelerating", "Productivity gains visible in earnings"],
    risks: ["Capex cycle peaking", "Regulation of AI models", "Export controls on chips"],
  },
  {
    id: "n2", title: "Monetary Easing Cycle", icon: "🏦", strength: 65,
    connections: [
      { asset: "XAUUSD", class: "Commodity", role: "Lower real rates support gold" },
      { asset: "BTC", class: "Crypto", role: "Liquidity expansion historically bullish for BTC" },
      { asset: "SPY", class: "ETF", role: "Rate cuts support risk assets broadly" },
      { asset: "FED-CUT-JUN", class: "Event", role: "Direct probability trade on rate decision" },
    ],
    macroDrivers: ["Inflation declining toward target", "Labor market cooling", "Global central banks coordinating"],
    risks: ["Inflation re-acceleration", "Fiscal spending overwhelms rate cuts", "Fed credibility questioned"],
  },
  {
    id: "n3", title: "Crypto Structural Adoption", icon: "⛓️", strength: 72,
    connections: [
      { asset: "BTC", class: "Crypto", role: "ETF inflows creating structural demand floor" },
      { asset: "ETH", class: "Crypto", role: "Smart contract platform for institutional DeFi" },
      { asset: "SOL", class: "Crypto", role: "High-performance chain for consumer DeFi" },
    ],
    macroDrivers: ["ETF approval legitimized asset class", "Institutional allocation growing", "Halving supply dynamics"],
    risks: ["Regulatory crackdown", "Exchange failures", "Liquidity fragmentation"],
  },
  {
    id: "n4", title: "Geopolitical Risk Premium", icon: "🌍", strength: 48,
    connections: [
      { asset: "XAUUSD", class: "Commodity", role: "Traditional safe haven" },
      { asset: "CL", class: "Commodity", role: "Supply disruption risk in energy" },
      { asset: "SPY", class: "ETF", role: "Risk-off pressure on equities" },
    ],
    macroDrivers: ["Middle East tensions", "US-China competition", "Trade policy uncertainty"],
    risks: ["De-escalation reduces premium", "Markets price in conflict fatigue"],
  },
];

export const DEMO_PENDING_DECISIONS = [
  {
    id: "d1", symbol: "NVDA", name: "Add to NVIDIA Position", icon: "💚", type: "Buy $8,000",
    dimensions: [
      { label: "Research Completeness", score: 90, status: "pass" },
      { label: "Thesis Clarity", score: 85, status: "pass" },
      { label: "Risk Clarity", score: 60, status: "review" },
      { label: "Catalyst Understanding", score: 80, status: "pass" },
      { label: "Portfolio Fit", score: 45, status: "fail" },
      { label: "Emotional Discipline", score: 75, status: "pass" },
      { label: "Execution Readiness", score: 88, status: "pass" },
      { label: "Policy Fit", score: 40, status: "fail" },
    ],
    overallScore: 68, verdict: "needs-review" as const,
    advisorNote: "Strong thesis but concentration risk too high. Reduce size to $5K or trim existing tech exposure first.",
  },
  {
    id: "d2", symbol: "SOL", name: "New Solana Position", icon: "◎", type: "Buy $3,000",
    dimensions: [
      { label: "Research Completeness", score: 55, status: "review" },
      { label: "Thesis Clarity", score: 50, status: "review" },
      { label: "Risk Clarity", score: 40, status: "fail" },
      { label: "Catalyst Understanding", score: 45, status: "fail" },
      { label: "Portfolio Fit", score: 60, status: "review" },
      { label: "Emotional Discipline", score: 70, status: "pass" },
      { label: "Execution Readiness", score: 80, status: "pass" },
      { label: "Policy Fit", score: 65, status: "pass" },
    ],
    overallScore: 52, verdict: "simulate-first" as const,
    advisorNote: "Thesis not fully formed. Run a simulation first and document your invalidation triggers before proceeding.",
  },
  {
    id: "d3", symbol: "XAUUSD", name: "Increase Gold Allocation", icon: "🥇", type: "Buy $10,000",
    dimensions: [
      { label: "Research Completeness", score: 85, status: "pass" },
      { label: "Thesis Clarity", score: 90, status: "pass" },
      { label: "Risk Clarity", score: 92, status: "pass" },
      { label: "Catalyst Understanding", score: 75, status: "pass" },
      { label: "Portfolio Fit", score: 95, status: "pass" },
      { label: "Emotional Discipline", score: 88, status: "pass" },
      { label: "Execution Readiness", score: 90, status: "pass" },
      { label: "Policy Fit", score: 80, status: "pass" },
    ],
    overallScore: 87, verdict: "ready" as const,
    advisorNote: "Well-researched, excellent portfolio hedge. Proceed when ready.",
  },
];

export const DEMO_READINESS_DIMENSIONS = [
  { label: "Research Completeness", score: 85, status: "ready" },
  { label: "Thesis Clarity", score: 90, status: "ready" },
  { label: "Risk Clarity", score: 72, status: "review" },
  { label: "Catalyst Understanding", score: 80, status: "ready" },
  { label: "Portfolio Fit", score: 55, status: "simulate" },
  { label: "Emotional Discipline", score: 88, status: "ready" },
  { label: "Execution Readiness", score: 92, status: "ready" },
  { label: "Policy Fit", score: 60, status: "review" },
];

export const DEMO_INV_DISAGREEMENTS = [
  {
    id: "dis1", topic: "NVDA Add Position",
    advisorA: { name: "Maven (Equity)", emoji: "📈", stance: "Constructive", confidence: 78, reasoning: "AI capex cycle intact. Blackwell ramp strong. Earnings trajectory supports current valuation. Add on any dip." },
    advisorB: { name: "Sentinel (Risk)", emoji: "🛡️", stance: "Cautious", confidence: 72, reasoning: "Concentration already 6.2%. Adding creates 9.2% single-stock exposure. Tech correlation amplifies portfolio risk in drawdown." },
    keyAssumptionConflict: "Growth trajectory vs concentration risk — Equity sees upside justifying the bet; Risk sees portfolio fragility from concentration.",
    resolvingEvidence: "Next earnings report and Fed rate decision will clarify growth vs macro risk balance. Wait for both catalysts before deciding.",
    implication: "opportunity",
  },
  {
    id: "dis2", topic: "Crypto Sleeve Sizing",
    advisorA: { name: "Cipher (Crypto)", emoji: "🔐", stance: "Bullish", confidence: 70, reasoning: "ETF inflows structural. Halving dynamics playing out. Institutional adoption creating demand floor. Maintain or grow sleeve." },
    advisorB: { name: "Mirror (Behavioral)", emoji: "🪞", stance: "Cautious", confidence: 65, reasoning: "User has increased crypto 3x in 4 months. Pattern suggests momentum-chasing. Crypto sleeve already above policy target. Pause and review." },
    keyAssumptionConflict: "Market opportunity vs behavioral pattern — Crypto sees structural bull case; Behavioral sees potential FOMO-driven overallocation.",
    resolvingEvidence: "Compare pre-trade thesis documentation quality for recent crypto adds. If thesis quality is declining while position size is increasing, behavioral concern is valid.",
    implication: "caution",
  },
  {
    id: "dis3", topic: "Gold Allocation Increase",
    advisorA: { name: "Atlas (Macro)", emoji: "🌍", stance: "Strongly Supportive", confidence: 82, reasoning: "Rate cuts incoming. Central bank buying at record. Geopolitical risk premium justified. Gold is the regime hedge." },
    advisorB: { name: "Router (Execution)", emoji: "🔄", stance: "Supportive with Timing Note", confidence: 60, reasoning: "Gold at ATH. Entry price risk is elevated. Consider staged entry over 3 tranches to average in rather than lump-sum at peak." },
    keyAssumptionConflict: "Thesis strength vs entry timing — both agree on direction but disagree on execution approach.",
    resolvingEvidence: "This is an execution disagreement, not a thesis disagreement. Can be resolved by using staged entry as a compromise.",
    implication: "proceed",
  },
];

export const DEMO_EVENTS = [
  {
    id: "e1", title: "Fed Rate Cut — June 2026", probability: 62, previousProbability: 55, trend: "rising",
    branches: [
      { label: "25bp Cut", probability: 42, impact: "+1.2% portfolio", sentiment: "bullish" },
      { label: "50bp Cut", probability: 20, impact: "+2.1% portfolio", sentiment: "bullish" },
      { label: "Hold", probability: 38, impact: "-0.4% portfolio", sentiment: "bearish" },
    ],
    sleeveExposure: 2.1, catalystDate: "2026-06-18", confidence: 65,
  },
  {
    id: "e2", title: "US Presidential Election 2028", probability: 51, previousProbability: 48, trend: "rising",
    branches: [
      { label: "Current Party Wins", probability: 51, impact: "Neutral — continuity", sentiment: "neutral" },
      { label: "Opposition Wins", probability: 42, impact: "Policy uncertainty ±2%", sentiment: "neutral" },
      { label: "Third Party Significant", probability: 7, impact: "High uncertainty", sentiment: "bearish" },
    ],
    sleeveExposure: 0.8, catalystDate: "2028-11-03", confidence: 35,
  },
  {
    id: "e3", title: "BTC ETF Inflows Exceed $100B AUM", probability: 72, previousProbability: 68, trend: "rising",
    branches: [
      { label: "Achieved by Q3 2026", probability: 45, impact: "BTC +15-20%", sentiment: "bullish" },
      { label: "Achieved by EOY 2026", probability: 27, impact: "BTC +8-12%", sentiment: "bullish" },
      { label: "Not Achieved 2026", probability: 28, impact: "BTC range-bound", sentiment: "neutral" },
    ],
    sleeveExposure: 1.5, catalystDate: "2026-12-31", confidence: 55,
  },
];

export const DEMO_FAMILY_MEMBERS = [
  { name: "You (Owner)", role: "Primary", permissions: "Full access", emoji: "👤" },
  { name: "Partner", role: "Co-Manager", permissions: "View, approve, execute (shared accounts)", emoji: "👥" },
  { name: "Financial Advisor", role: "Advisor", permissions: "View only, recommendations", emoji: "🧑‍💼" },
];

export const DEMO_FAMILY_GOALS = [
  { id: "g1", label: "Children's Education Fund", emoji: "🎓", icon: <GraduationCap className="h-4 w-4" />, target: 200000, current: 68000, deadline: "2038", status: "on-track", monthlyContribution: 800 },
  { id: "g2", label: "Home Down Payment", emoji: "🏠", icon: <Home className="h-4 w-4" />, target: 120000, current: 95000, deadline: "2027", status: "on-track", monthlyContribution: 2500 },
  { id: "g3", label: "Family Emergency Reserve", emoji: "🛡️", icon: <Shield className="h-4 w-4" />, target: 50000, current: 52000, deadline: "Ongoing", status: "funded", monthlyContribution: 0 },
  { id: "g4", label: "Retirement Portfolio", emoji: "🏖️", icon: <Landmark className="h-4 w-4" />, target: 1500000, current: 310000, deadline: "2050", status: "on-track", monthlyContribution: 3000 },
];

export const DEMO_FAMILY_RULES = [
  { rule: "Speculative sleeve capped at 3% of household capital", status: "pass" },
  { rule: "Education fund must be in conservative assets only", status: "pass" },
  { rule: "Any trade >$10K requires partner approval", status: "active" },
  { rule: "Emergency reserve must stay above $50K", status: "pass" },
  { rule: "No crypto in retirement accounts", status: "pass" },
];

export const DEMO_CONSTITUTION_RULES: Rule[] = [
  { id: "r1", label: "Max Position Size", description: "No single position may exceed this % of total portfolio", value: "7%", category: "sizing", active: true, severity: "hard" },
  { id: "r2", label: "Max Platform Concentration", description: "No single platform/exchange may hold more than this % of total capital", value: "40%", category: "sizing", active: true, severity: "hard" },
  { id: "r3", label: "Max Speculative Sleeve", description: "Total speculative allocation may not exceed this %", value: "8%", category: "sizing", active: true, severity: "hard" },
  { id: "r4", label: "Max Event Market Exposure", description: "Prediction/event market positions combined limit", value: "3%", category: "sizing", active: true, severity: "hard" },
  { id: "r5", label: "Max Correlated Theme Overlap", description: "Correlated risk cluster may not exceed this % of portfolio", value: "50%", category: "sizing", active: true, severity: "soft" },
  { id: "r6", label: "No Chase Rule", description: "Do not buy any asset that has moved more than X% in 24 hours", value: "10%", category: "behavior", active: true, severity: "soft" },
  { id: "r7", label: "Require Simulation", description: "Positions above this size must be simulated before execution", value: ">$5,000", category: "governance", active: true, severity: "hard" },
  { id: "r8", label: "Require Approval", description: "Trades above this value need manual approval confirmation", value: ">$10,000", category: "governance", active: false, severity: "hard" },
  { id: "r9", label: "Force Downside Review", description: "Execution desk must show downside scenario before confirming", value: "Always", category: "discipline", active: true, severity: "soft" },
  { id: "r10", label: "Journal Required", description: "Thesis must be documented before these trade types", value: "New positions", category: "discipline", active: true, severity: "soft" },
  { id: "r11", label: "Drawdown Alert", description: "Alert when portfolio drawdown exceeds this threshold", value: "-10%", category: "discipline", active: true, severity: "hard" },
  { id: "r12", label: "Crypto Allocation Cap", description: "Total crypto exposure hard ceiling", value: "20%", category: "sizing", active: true, severity: "hard" },
];

export const DEMO_INV_CATEGORIES = [
  { id: "all", label: "All Rules" },
  { id: "sizing", label: "Position Sizing" },
  { id: "behavior", label: "Behavioral" },
  { id: "governance", label: "Governance" },
  { id: "discipline", label: "Discipline" },
];

export const DEMO_CURRENT_VIOLATIONS = [
  { ruleId: "r3", detail: "Speculative sleeve at 12% — exceeds 8% limit by 4%" },
  { ruleId: "r12", detail: "Crypto allocation at 28% — exceeds 20% cap by 8%" },
  { ruleId: "r5", detail: "Tech + Crypto correlation cluster at ~70% — exceeds 50% soft limit" },
];

export const DEMO_RECEIPTS: Receipt[] = [
  { id: "r1", type: "trade", title: "Buy 50 NVDA @ $130 Limit", description: "Limit order filled via Interactive Brokers. Added on dip before GTC conference catalyst.", timestamp: "2026-04-05T14:30:00Z", actor: "User", status: "completed", metadata: { "Order ID": "ORD-2X9K4F", "Platform": "Interactive Brokers", "Estimated Cost": "$6,500", "Fees": "$1.50", "Thesis": "NVDA AI Infrastructure Supercycle" } },
  { id: "r2", type: "approval", title: "Large Position Approved — BTC Add", description: "Position size exceeds 10% approval threshold. Approved after risk review.", timestamp: "2026-04-04T10:15:00Z", actor: "User + Risk Advisor", status: "approved", metadata: { "Position Size": "1.5 BTC", "% of Portfolio": "28.4%", "Threshold": "10%", "Risk Score Change": "58 → 62" } },
  { id: "r3", type: "thesis", title: "Thesis Created — BTC Post-Halving Cycle", description: "New investment thesis documented with rationale, assumptions, and risk factors.", timestamp: "2026-03-28T09:00:00Z", actor: "User", status: "completed", metadata: { "Conviction": "Medium", "Time Horizon": "6-12 months", "Entry": "$62,000", "Target": "$125,000" } },
  { id: "r4", type: "risk-change", title: "Risk Policy Updated — Max Speculative Sleeve", description: "Maximum speculative allocation increased from 15% to 20%.", timestamp: "2026-03-15T16:45:00Z", actor: "User", status: "completed", metadata: { "Previous": "15%", "New": "20%", "Advisor Warning": "Sentinel flagged elevated risk" } },
  { id: "r5", type: "advisor-snapshot", title: "Advisor Council Snapshot — Weekly", description: "Weekly advisor alignment record. 6/8 advisors aligned bullish. Sentinel cautious on tech concentration.", timestamp: "2026-04-01T08:00:00Z", actor: "System", status: "completed", metadata: { "Aligned": "6/8 bullish", "Dissent": "Sentinel (risk), Mirror (behavioral)", "Key Topic": "Tech concentration at 42%" } },
  { id: "r6", type: "rebalance", title: "Rebalance Suggestion Declined", description: "System suggested trimming NVDA by 5% to reduce concentration. User declined with rationale.", timestamp: "2026-03-20T11:30:00Z", actor: "User", status: "rejected", metadata: { "Suggested": "Trim NVDA 5%", "Reason for Decline": "Holding through GTC catalyst", "Risk Delta": "+2 points" } },
];

export const DEMO_CLASS_TABS: { value: AssetClass | "all"; label: string; icon: string }[] = [
  { value: "all", label: "All", icon: "🌐" },
  { value: "stocks", label: "Stocks", icon: "📈" },
  { value: "etfs", label: "ETFs", icon: "📊" },
  { value: "crypto", label: "Crypto", icon: "🔐" },
  { value: "commodities", label: "Commodities", icon: "⛏️" },
  { value: "events", label: "Events", icon: "🔮" },
];

export const DEMO_MEMORY_EVENTS = [
  { id: "m1", time: "2 hours ago", type: "holding", icon: "📉", title: "NVDA dipped -1.74%", detail: "No fundamental news. Likely positioning ahead of GTC conference catalyst.", severity: "info" },
  { id: "m2", time: "4 hours ago", type: "advisor", icon: "🌍", title: "Atlas updated macro view", detail: "Fed speaker tone shifted slightly dovish this week. Updated rate cut probability assessment.", severity: "info" },
  { id: "m3", time: "6 hours ago", type: "catalyst", icon: "📅", title: "CPI Release in 39 days", detail: "Key inflation data approaches — determines Fed rate path. 45% of portfolio exposed.", severity: "warning" },
  { id: "m4", time: "Today", type: "risk", icon: "🛡️", title: "Crypto allocation breach continues", detail: "Crypto at 28% vs 20% target — 3rd consecutive week above policy limit. Sentinel recommends action.", severity: "alert" },
  { id: "m5", time: "Today", type: "holding", icon: "◎", title: "SOL rallied +4.04%", detail: "Ecosystem TVL crossed $8B milestone. Network congestion event earlier this week didn't dampen momentum.", severity: "positive" },
  { id: "m6", time: "Yesterday", type: "thesis", icon: "📝", title: "BTC thesis still valid", detail: "Post-halving dynamics intact. ETF inflows positive for 5 consecutive days. No invalidation events.", severity: "info" },
  { id: "m7", time: "Yesterday", type: "advisor", icon: "🪞", title: "Mirror flagged attention pattern", detail: "NVDA checked 12 times this week — behavioral monitoring triggered. Suggested price alerts instead.", severity: "warning" },
  { id: "m8", time: "2 days ago", type: "platform", icon: "🔄", title: "All platforms synced successfully", detail: "Interactive Brokers, Schwab, Coinbase, and Polymarket — all account data up to date.", severity: "positive" },
  { id: "m9", time: "3 days ago", type: "regime", icon: "📊", title: "Market regime unchanged", detail: "Bull regime continues. VIX stable. No regime shift detected.", severity: "info" },
  { id: "m10", time: "This week", type: "advisor", icon: "⛏️", title: "Terra: Gold broke $2640 resistance", detail: "Central bank buying remains at record pace. Gold acting as portfolio insurance.", severity: "positive" },
  { id: "m11", time: "This week", type: "receipt", icon: "📄", title: "NVDA limit order still pending", detail: "Buy 50 NVDA @ $130 — limit order placed. 35% fill probability within 5 days based on volatility.", severity: "info" },
  { id: "m12", time: "Last week", type: "advisor", icon: "🔐", title: "Cipher warned of SOL network risk", detail: "Prediction of network congestion during high activity validated this week.", severity: "info" },
];

export const DEMO_MODES = [
  {
    id: "quiet", label: "Quiet Monitoring", icon: <Eye className="h-5 w-5" />, emoji: "🌙",
    description: "Low-intensity passive observation. Advisors watch silently. Alerts only for material changes.",
    density: "Minimal", advisorIntensity: "Silent / alert-only", alerting: "Critical only", riskFraming: "Steady-state",
    color: "hsl(var(--primary))",
  },
  {
    id: "research", label: "Research Day", icon: <Search className="h-5 w-5" />, emoji: "🔬",
    description: "Deep analysis mode. Research library and dossiers prioritized. Advisors provide longer-form intelligence.",
    density: "Medium", advisorIntensity: "Detailed memos", alerting: "Low", riskFraming: "Analytical",
    color: "hsl(200 65% 55%)",
  },
  {
    id: "execution", label: "Execution Day", icon: <Zap className="h-5 w-5" />, emoji: "⚡",
    description: "Active trading mode. Execution desk prominent. Advisors provide real-time trade prep commentary.",
    density: "High", advisorIntensity: "Real-time", alerting: "Active", riskFraming: "Pre-trade focus",
    color: "hsl(38 85% 58%)",
  },
  {
    id: "event", label: "Event Week", icon: <Calendar className="h-5 w-5" />, emoji: "📅",
    description: "Catalyst-aware mode. War room active. Event markets highlighted. Timeline-driven framing.",
    density: "High", advisorIntensity: "Event-focused", alerting: "Catalyst-driven", riskFraming: "Event sensitivity",
    color: "hsl(280 60% 55%)",
  },
  {
    id: "volatility", label: "High Volatility", icon: <Activity className="h-5 w-5" />, emoji: "🌊",
    description: "Storm mode. Risk office prominent. Behavioral firewall elevated. Execution requires extra review.",
    density: "Dense", advisorIntensity: "Maximum", alerting: "All channels", riskFraming: "Defensive",
    color: "hsl(0 65% 55%)",
  },
  {
    id: "preservation", label: "Capital Preservation", icon: <Shield className="h-5 w-5" />, emoji: "🛡️",
    description: "Safety mode. Focus on reserve health, hedging, and income. Aggressive actions require elevated approval.",
    density: "Low", advisorIntensity: "Cautious", alerting: "Risk-only", riskFraming: "Preservation-first",
    color: "hsl(152 55% 48%)",
  },
];

export const DEMO_THEMES = [
  { id: "ai", label: "AI Infrastructure", icon: "🤖", strength: 92, crowding: 75, uncertainty: 30, instruments: ["NVDA", "MSFT", "AAPL"], advisorView: "Strong secular theme. Crowding risk rising but fundamentals support continuation.", color: "hsl(var(--primary))" },
  { id: "digital-gold", label: "Digital Store of Value", icon: "₿", strength: 78, crowding: 55, uncertainty: 45, instruments: ["BTC"], advisorView: "Post-halving dynamics supportive. Institutional adoption creating structural demand floor.", color: "hsl(38 85% 58%)" },
  { id: "defi", label: "DeFi & Smart Contracts", icon: "⟠", strength: 65, crowding: 40, uncertainty: 55, instruments: ["ETH", "SOL"], advisorView: "Growing ecosystem but regulatory uncertainty creates two-sided risk.", color: "hsl(280 60% 55%)" },
  { id: "safe-haven", label: "Safe Haven / Hedging", icon: "🥇", strength: 72, crowding: 30, uncertainty: 25, instruments: ["XAUUSD"], advisorView: "Central bank buying provides structural floor. Low crowding makes this attractive.", color: "hsl(152 55% 48%)" },
  { id: "energy", label: "Energy & Commodities", icon: "🛢️", strength: 45, crowding: 25, uncertainty: 60, instruments: ["CL"], advisorView: "OPEC discipline uncertain. Energy transition creates long-term headwinds.", color: "hsl(25 75% 55%)" },
  { id: "ev-transition", label: "EV & Autonomy", icon: "⚡", strength: 55, crowding: 60, uncertainty: 65, instruments: ["TSLA"], advisorView: "Robotaxi catalyst could re-rate but execution risk is very high.", color: "hsl(0 65% 55%)" },
  { id: "event-markets", label: "Event & Probability", icon: "🔮", strength: 50, crowding: 15, uncertainty: 70, instruments: ["FED-CUT-JUN", "PRES-2028"], advisorView: "Emerging asset class. Small sizing essential. Catalyst-dependent.", color: "hsl(200 65% 55%)" },
  { id: "broad-market", label: "Broad US Market", icon: "📊", strength: 68, crowding: 45, uncertainty: 35, instruments: ["SPY"], advisorView: "Market breadth improving. Valuation elevated but supported by earnings growth.", color: "hsl(var(--primary))" },
];

export const DEMO_AVAILABLE_PLATFORMS = [
  { name: "Robinhood", type: "brokerage", icon: "🪶" },
  { name: "Binance", type: "exchange", icon: "🟡" },
  { name: "Kraken", type: "exchange", icon: "🐙" },
  { name: "Kalshi", type: "event-market", icon: "📊" },
  { name: "Manifold", type: "event-market", icon: "🎲" },
  { name: "Fidelity", type: "brokerage", icon: "🏦" },
  { name: "Ledger Live", type: "wallet", icon: "🔑" },
];

export const DEMO_SIZING_SCENARIOS = [
  {
    asset: "NVDA", icon: "💚", proposedSize: 15000,
    currentAllocation: 6.2, postAllocation: 9.2,
    maxAllowed: 7, violatesPolicy: true, violation: "Exceeds 7% max position size",
    riskBudgetUsed: 65, concentrationImpact: "Tech concentration → 47%",
    advisorSuggestion: "Size at $8,000 instead to stay within policy while expressing conviction",
    suggestedSize: 8000,
  },
  {
    asset: "SOL", icon: "◎", proposedSize: 5000,
    currentAllocation: 3.7, postAllocation: 4.7,
    maxAllowed: 7, violatesPolicy: false, violation: null,
    riskBudgetUsed: 80, concentrationImpact: "Crypto sleeve → 32% (above 20% target)",
    advisorSuggestion: "Size is within position limits but pushes crypto sleeve further above target. Consider $3,000.",
    suggestedSize: 3000,
  },
  {
    asset: "XAUUSD", icon: "🥇", proposedSize: 10000,
    currentAllocation: 5.3, postAllocation: 7.3,
    maxAllowed: 7, violatesPolicy: true, violation: "Marginally exceeds 7% limit",
    riskBudgetUsed: 30, concentrationImpact: "Low correlation — improves diversification",
    advisorSuggestion: "Consider raising gold position limit to 10% given its hedging role. Policy update recommended.",
    suggestedSize: 10000,
  },
];

export const DEMO_ACTIVE_POSITIONS = [
  {
    id: "p1", symbol: "NVDA", name: "NVIDIA", icon: "💚", entryPrice: 95.50, currentPrice: 135.20, entryDate: "2025-08-15",
    thesisStatus: "strengthened", recommendation: "hold", advisorNote: "AI capex cycle confirmed. Thesis intact. Consider trimming 10% to manage concentration.",
    whatChanged: ["Blackwell revenue exceeded estimates", "AI capex spending accelerated", "Export controls stable"],
    thesisIntact: true, shouldReview: false,
  },
  {
    id: "p2", symbol: "BTC", name: "Bitcoin", icon: "₿", entryPrice: 62000, currentPrice: 97450, entryDate: "2025-11-01",
    thesisStatus: "intact", recommendation: "trim", advisorNote: "Thesis valid but allocation has drifted above policy. Trim to bring within 20% crypto sleeve target.",
    whatChanged: ["ETF inflows strong", "Halving dynamics playing out", "Allocation breached policy limit"],
    thesisIntact: true, shouldReview: true,
  },
  {
    id: "p3", symbol: "SOL", name: "Solana", icon: "◎", entryPrice: 120, currentPrice: 185.40, entryDate: "2026-01-15",
    thesisStatus: "strengthened", recommendation: "hold", advisorNote: "Ecosystem momentum strong. TVL milestone crossed. Network congestion risk monitored.",
    whatChanged: ["TVL crossed $8B", "Network congestion event occurred but resolved", "DeFi ecosystem expanding"],
    thesisIntact: true, shouldReview: false,
  },
  {
    id: "p4", symbol: "XAUUSD", name: "Gold", icon: "🥇", entryPrice: 2400, currentPrice: 2640, entryDate: "2025-06-01",
    thesisStatus: "intact", recommendation: "hold", advisorNote: "Safe haven thesis intact. Central bank buying structural. No action needed.",
    whatChanged: ["Central bank buying at record pace", "Geopolitical uncertainty elevated", "Real rates declining"],
    thesisIntact: true, shouldReview: false,
  },
];

export const DEMO_DNA_DIMENSIONS = [
  { label: "Value-Tilted", score: 35, description: "Preference for undervalued assets based on fundamentals" },
  { label: "Growth-Oriented", score: 72, description: "Tendency toward high-growth, high-multiple companies" },
  { label: "Macro-Reactive", score: 58, description: "Sensitivity to macro regime changes in decision-making" },
  { label: "Event-Driven", score: 25, description: "Appetite for catalyst-based and event-contract positions" },
  { label: "Diversification-First", score: 40, description: "Priority given to spreading risk across uncorrelated assets" },
  { label: "Momentum-Sensitive", score: 62, description: "Tendency to enter positions following price strength" },
  { label: "Speculation-Prone", score: 55, description: "Willingness to take high-conviction, high-risk bets" },
  { label: "Preservation-Oriented", score: 30, description: "Focus on protecting capital vs growing it aggressively" },
  { label: "Thesis-Disciplined", score: 78, description: "Consistency in documenting and following investment theses" },
  { label: "Patience Score", score: 70, description: "Ability to hold positions through volatility without panic" },
];

export const DEMO_SUGGESTIONS = [
  "Consider adding value exposure to balance growth concentration",
  "Your thesis discipline is strong — leverage it for event-driven positions",
  "Diversification score is low — review correlation clusters",
  "Speculation tolerance is moderate but crypto allocation suggests higher in practice",
];

export const DEMO_PAST_DECISIONS = [
  {
    id: "td1", date: "2025-08-15", action: "BUY 200 NVDA @ $95.50", instrument: "NVDA", symbol: "💚",
    thesisAtTime: "AI infrastructure supercycle — NVDA dominant with 80%+ GPU share. Blackwell architecture extends moat.",
    marketConditionsAtTime: "S&P at 5,200. Fed paused at 5.25%. VIX at 14. AI narrative accelerating post-earnings beat.",
    advisorViewsAtTime: [
      { advisor: "Maven (Equity)", view: "Strong buy — AI capex cycle early innings", confidence: 88 },
      { advisor: "Sentinel (Risk)", view: "Size carefully — tech concentration already elevated", confidence: 82 },
      { advisor: "Atlas (Macro)", view: "Supportive macro — risk-on regime intact", confidence: 75 },
    ],
    whatChangedAfter: ["NVDA rallied 42% in 6 months", "AI capex spending exceeded estimates", "Export controls didn't expand significantly", "Blackwell ramp confirmed strong demand"],
    wasRight: true,
    disciplineFollowed: true,
    lessonLearned: "Thesis-driven entry with patient sizing paid off. The dip before GTC was the opportunity.",
    currentPrice: 135.20, entryPrice: 95.50,
  },
  {
    id: "td2", date: "2025-11-01", action: "BUY 1.5 BTC @ $62,000", instrument: "BTC", symbol: "₿",
    thesisAtTime: "Post-halving cycle. ETF inflows creating structural demand floor.",
    marketConditionsAtTime: "BTC at $62K. ETF approval fresh. Institutional flows positive. Fed signaling rate cuts ahead.",
    advisorViewsAtTime: [
      { advisor: "Cipher (Crypto)", view: "Structural bull — halving dynamics and ETF flows supportive", confidence: 72 },
      { advisor: "Sentinel (Risk)", view: "Size appropriately — crypto volatile, keep within sleeve", confidence: 80 },
      { advisor: "Mirror (Behavioral)", view: "Entry looks disciplined, not FOMO-driven", confidence: 85 },
    ],
    whatChangedAfter: ["BTC reached $97K — +56% from entry", "ETF inflows remained strong", "No major regulatory crackdown occurred", "Crypto allocation drifted above policy target"],
    wasRight: true,
    disciplineFollowed: false,
    lessonLearned: "Entry was excellent but failed to trim when allocation exceeded policy target. Discipline gap in risk management.",
    currentPrice: 97450, entryPrice: 62000,
  },
  {
    id: "td3", date: "2026-01-15", action: "BUY 100 SOL @ $120", instrument: "SOL", symbol: "◎",
    thesisAtTime: "Fastest growing DeFi ecosystem. High-performance chain gaining developer adoption.",
    marketConditionsAtTime: "SOL recovering from lows. DeFi TVL growing. Network stability improved.",
    advisorViewsAtTime: [
      { advisor: "Cipher (Crypto)", view: "Constructive — ecosystem momentum strong", confidence: 65 },
      { advisor: "Sentinel (Risk)", view: "Speculative allocation — size small", confidence: 78 },
      { advisor: "Mirror (Behavioral)", view: "Patient entry after waiting for pullback — good discipline", confidence: 90 },
    ],
    whatChangedAfter: ["SOL rallied to $185 — +54%", "Network had congestion event", "TVL crossed $8B milestone", "Pushed crypto sleeve above target"],
    wasRight: true,
    disciplineFollowed: true,
    lessonLearned: "Waiting for the pullback rather than chasing the rally was the right call. Mirror flagged potential FOMO earlier and user waited.",
    currentPrice: 185.40, entryPrice: 120,
  },
];

export const DEMO_TRADES = [
  {
    id: "t1", symbol: "NVDA", name: "Add $8K to NVIDIA", icon: "💚",
    invalidations: [
      { trigger: "AI capex cycle peaks and enterprise spending declines", severity: "high", probability: 25, timeframe: "6-12 months" },
      { trigger: "Export controls expanded to block key markets", severity: "critical", probability: 15, timeframe: "Any time" },
      { trigger: "Competitor achieves GPU parity (AMD MI400, custom silicon)", severity: "medium", probability: 20, timeframe: "12-24 months" },
      { trigger: "Broad market selloff >15% — high-beta drawdown amplified", severity: "high", probability: 30, timeframe: "3-6 months" },
    ],
    hiddenRisks: ["Concentration already at 6.2% — adding pushes to 9.2%", "Tech correlation with existing AAPL, MSFT positions", "Valuation premium leaves little margin for disappointment"],
    waitingLogic: "Earnings in 3 weeks — thesis will be tested. Consider waiting for post-earnings clarity.",
    fragility: 62,
  },
  {
    id: "t2", symbol: "SOL", name: "New $3K SOL Position", icon: "◎",
    invalidations: [
      { trigger: "Network outage or consensus failure", severity: "critical", probability: 15, timeframe: "Any time" },
      { trigger: "Regulatory action against Solana ecosystem", severity: "high", probability: 10, timeframe: "6-12 months" },
      { trigger: "DeFi TVL decline >40% from current levels", severity: "medium", probability: 25, timeframe: "3-6 months" },
      { trigger: "Crypto market enters prolonged bear cycle", severity: "high", probability: 30, timeframe: "6-18 months" },
    ],
    hiddenRisks: ["Crypto sleeve already above 20% target", "High correlation with BTC — not true diversification", "Liquidity risk in stress scenarios"],
    waitingLogic: "No imminent catalyst. Consider entering after next major network upgrade milestone.",
    fragility: 75,
  },
];
