// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Data: Investment Office
// Consolidated investment demo data + core-service facades
// ═══════════════════════════════════════════════════════════════

// ── Demo Constants ─────────────────────────────────────────────

export const DEMO_LEARN_TOPICS = [
  { id: "lt-1", title: "Dollar-Cost Averaging", category: "strategy", difficulty: "beginner", duration: "5 min" },
  { id: "lt-2", title: "Asset Allocation Basics", category: "fundamentals", difficulty: "beginner", duration: "8 min" },
  { id: "lt-3", title: "Risk-Adjusted Returns", category: "metrics", difficulty: "intermediate", duration: "12 min" },
];

export const DEMO_BEHAVIORAL_SIGNALS = [
  { id: "bs-1", signal: "Loss aversion detected", severity: "warning", pattern: "Holding losers 3x longer than winners", recommendation: "Review position sizing rules" },
  { id: "bs-2", signal: "Recency bias", severity: "info", pattern: "Over-weighting recent market events", recommendation: "Check historical base rates" },
  { id: "bs-3", signal: "Confirmation bias risk", severity: "caution", pattern: "Only consuming bullish research", recommendation: "Seek contrarian viewpoints" },
];

export const DEMO_INV_PURPOSES = [
  { id: "ip-1", name: "Wealth Preservation", allocation: 40, priority: "high", horizon: "10+ years" },
  { id: "ip-2", name: "Growth", allocation: 35, priority: "high", horizon: "5-10 years" },
  { id: "ip-3", name: "Income Generation", allocation: 25, priority: "medium", horizon: "1-5 years" },
];

export const DEMO_INV_RULES = [
  { id: "ir-1", rule: "No single position > 5% of portfolio", status: "active", violations: 0 },
  { id: "ir-2", rule: "Maintain 20% cash buffer in downturns", status: "active", violations: 1 },
  { id: "ir-3", rule: "Rebalance quarterly if drift > 3%", status: "active", violations: 0 },
];

export const DEMO_INV_PURPOSES_CAPITAL_TWIN = [
  { id: "ct-1", purpose: "Emergency Fund", target: 50000, current: 48000, health: "good" },
  { id: "ct-2", purpose: "Education Fund", target: 120000, current: 67000, health: "on-track" },
  { id: "ct-3", purpose: "Retirement", target: 2000000, current: 340000, health: "on-track" },
];

export const DEMO_SHOCK_ZONES = [
  { id: "sz-1", scenario: "Market crash -30%", portfolioImpact: -18, recoveryMonths: 14, hedged: true },
  { id: "sz-2", scenario: "Inflation spike to 8%", portfolioImpact: -5, recoveryMonths: 6, hedged: false },
  { id: "sz-3", scenario: "Interest rate hike 200bp", portfolioImpact: -8, recoveryMonths: 9, hedged: true },
];

export const DEMO_CATALYST_EVENTS = [
  { id: "ce-1", event: "Fed Rate Decision", date: "2026-05-01", impact: "high", sector: "fixed-income", status: "upcoming" },
  { id: "ce-2", event: "Earnings Season Q2", date: "2026-07-15", impact: "high", sector: "equities", status: "upcoming" },
  { id: "ce-3", event: "EU Regulation Vote", date: "2026-06-10", impact: "medium", sector: "tech", status: "upcoming" },
];

export const DEMO_DIMS = [
  { id: "d-1", name: "Value", score: 72, trend: "up" },
  { id: "d-2", name: "Momentum", score: 65, trend: "stable" },
  { id: "d-3", name: "Quality", score: 88, trend: "up" },
];

export const DEMO_POSITIONS = [
  { id: "p-1", symbol: "AAPL", name: "Apple Inc", weight: 8.2, pnl: 12.4, conviction: "high" },
  { id: "p-2", symbol: "MSFT", name: "Microsoft", weight: 7.1, pnl: 18.7, conviction: "high" },
  { id: "p-3", symbol: "BRK.B", name: "Berkshire Hathaway", weight: 5.5, pnl: 6.2, conviction: "medium" },
];

export const DEMO_NARRATIVES = [
  { id: "n-1", title: "AI Infrastructure Boom", assets: ["NVDA", "AMD", "MSFT"], strength: 85, status: "active" },
  { id: "n-2", title: "Energy Transition", assets: ["ENPH", "NEE", "FSLR"], strength: 62, status: "active" },
  { id: "n-3", title: "Healthcare Innovation", assets: ["LLY", "ISRG", "DXCM"], strength: 70, status: "monitoring" },
];

export const DEMO_PENDING_DECISIONS = [
  { id: "pd-1", title: "Rebalance tech allocation", urgency: "medium", dueDate: "2026-04-20", type: "rebalance" },
  { id: "pd-2", title: "Tax-loss harvest opportunity", urgency: "high", dueDate: "2026-04-18", type: "tax" },
  { id: "pd-3", title: "Review dividend reinvestment", urgency: "low", dueDate: "2026-05-01", type: "income" },
];

export const DEMO_READINESS_DIMENSIONS = [
  { id: "rd-1", dimension: "Data Quality", score: 92, status: "ready" },
  { id: "rd-2", dimension: "Risk Assessment", score: 87, status: "ready" },
  { id: "rd-3", dimension: "Market Context", score: 78, status: "partial" },
  { id: "rd-4", dimension: "Advisor Consensus", score: 65, status: "needs-review" },
];

export const DEMO_INV_DISAGREEMENTS = [
  { id: "dis-1", topic: "Tech weighting", bull: "AI growth justifies 35%", bear: "Concentration risk too high", resolution: "pending" },
  { id: "dis-2", topic: "Bonds duration", bull: "Extend to lock rates", bear: "Curve inversion risk", resolution: "pending" },
];

export const DEMO_EVENTS = [
  { id: "ev-1", name: "Global Recession", probability: 15, impact: -25, timeframe: "12 months" },
  { id: "ev-2", name: "AI Bubble Burst", probability: 20, impact: -18, timeframe: "18 months" },
  { id: "ev-3", name: "Stagflation", probability: 10, impact: -15, timeframe: "24 months" },
];

export const DEMO_FAMILY_GOALS = [
  { id: "fg-1", goal: "Children's Education", target: 250000, funded: 45, deadline: "2035" },
  { id: "fg-2", goal: "Estate Planning", target: 5000000, funded: 22, deadline: "2050" },
  { id: "fg-3", goal: "Charitable Giving", target: 100000, funded: 60, deadline: "2030" },
];

export const DEMO_FAMILY_MEMBERS = [
  { id: "fm-1", name: "Primary", role: "patriarch", riskTolerance: "moderate", taxBracket: "high" },
  { id: "fm-2", name: "Spouse", role: "co-owner", riskTolerance: "conservative", taxBracket: "high" },
  { id: "fm-3", name: "Child 1", role: "beneficiary", riskTolerance: "aggressive", taxBracket: "low" },
];

export const DEMO_FAMILY_RULES = [
  { id: "fr-1", rule: "No crypto > 3% per member", scope: "all", enforced: true },
  { id: "fr-2", rule: "ESG screen on all new positions", scope: "all", enforced: true },
  { id: "fr-3", rule: "Quarterly family review meeting", scope: "governance", enforced: true },
];

export const DEMO_CONSTITUTION_RULES = [
  { id: "cr-1", rule: "Never invest in what you don't understand", category: "philosophy", weight: "critical" },
  { id: "cr-2", rule: "Position sizing based on conviction level", category: "risk", weight: "high" },
  { id: "cr-3", rule: "Always have a thesis before buying", category: "process", weight: "critical" },
];

export const DEMO_CURRENT_VIOLATIONS = [
  { id: "cv-1", rule: "cr-2", position: "SPCE", issue: "Position exceeds conviction-based limit", severity: "warning" },
];

export const DEMO_INV_CATEGORIES = [
  { id: "ic-1", name: "Core Holdings", weight: 60, color: "blue" },
  { id: "ic-2", name: "Tactical", weight: 25, color: "amber" },
  { id: "ic-3", name: "Speculative", weight: 15, color: "rose" },
];

export const DEMO_RECEIPTS = [
  { id: "rc-1", action: "Buy AAPL", date: "2026-04-10", amount: 5000, proofHash: "0xabc123", verified: true },
  { id: "rc-2", action: "Sell TSLA", date: "2026-04-08", amount: 3200, proofHash: "0xdef456", verified: true },
  { id: "rc-3", action: "Rebalance Q1", date: "2026-03-31", amount: 15000, proofHash: "0xghi789", verified: true },
];

export const DEMO_CLASS_TABS = [
  { id: "ct-1", label: "Equities", value: "equities", count: 24 },
  { id: "ct-2", label: "Fixed Income", value: "fixed-income", count: 8 },
  { id: "ct-3", label: "Alternatives", value: "alternatives", count: 5 },
  { id: "ct-4", label: "Cash & Equivalents", value: "cash", count: 2 },
];

export const DEMO_MEMORY_EVENTS = [
  { id: "me-1", event: "2020 COVID Crash", lesson: "Markets recover faster than expected", emotionalState: "panic", outcome: "held positions, +40% recovery" },
  { id: "me-2", event: "2022 Tech Selloff", lesson: "Quality companies withstand drawdowns", emotionalState: "anxious", outcome: "Added to winners, +25% next year" },
];

export const DEMO_MODES = [
  { id: "m-1", mode: "Conservative", description: "Preserve capital, minimize drawdowns", riskLevel: 3, active: false },
  { id: "m-2", mode: "Balanced", description: "Steady growth with moderate risk", riskLevel: 5, active: true },
  { id: "m-3", mode: "Aggressive", description: "Maximum growth, higher volatility accepted", riskLevel: 8, active: false },
];

export const DEMO_THEMES = [
  { id: "th-1", theme: "AI Infrastructure", conviction: 90, exposure: 22, trend: "expanding" },
  { id: "th-2", theme: "Clean Energy", conviction: 70, exposure: 12, trend: "stable" },
  { id: "th-3", theme: "Healthcare Tech", conviction: 75, exposure: 8, trend: "expanding" },
];

export const DEMO_AVAILABLE_PLATFORMS = [
  { id: "pl-1", name: "Interactive Brokers", status: "connected", accounts: 2, lastSync: "2026-04-15" },
  { id: "pl-2", name: "Schwab", status: "available", accounts: 0, lastSync: null },
  { id: "pl-3", name: "Fidelity", status: "available", accounts: 0, lastSync: null },
];

export const DEMO_SIZING_SCENARIOS = [
  { id: "ss-1", scenario: "High conviction, low volatility", suggestedSize: 5, maxLoss: 2, reasoning: "Strong thesis with stable price action" },
  { id: "ss-2", scenario: "Medium conviction, high volatility", suggestedSize: 2, maxLoss: 4, reasoning: "Good thesis but wide price swings" },
  { id: "ss-3", scenario: "Speculative with catalyst", suggestedSize: 1, maxLoss: 1, reasoning: "Binary outcome, size for total loss" },
];

export const DEMO_ACTIVE_POSITIONS = [
  { id: "ap-1", symbol: "AAPL", entryPrice: 178, currentPrice: 195, pnlPercent: 9.5, holdingDays: 45, reviewDue: true },
  { id: "ap-2", symbol: "NVDA", entryPrice: 850, currentPrice: 920, pnlPercent: 8.2, holdingDays: 30, reviewDue: false },
  { id: "ap-3", symbol: "MSFT", entryPrice: 410, currentPrice: 435, pnlPercent: 6.1, holdingDays: 60, reviewDue: true },
];

export const DEMO_DNA_DIMENSIONS = [
  { id: "dd-1", dimension: "Value Orientation", score: 65, benchmark: 50, description: "Slight value tilt vs growth" },
  { id: "dd-2", dimension: "Concentration", score: 72, benchmark: 40, description: "Concentrated portfolio vs broad market" },
  { id: "dd-3", dimension: "Momentum Factor", score: 58, benchmark: 55, description: "Neutral momentum exposure" },
];

export const DEMO_SUGGESTIONS = [
  { id: "sg-1", suggestion: "Reduce tech concentration", impact: "medium", effort: "low", reasoning: "Single sector > 35% of portfolio" },
  { id: "sg-2", suggestion: "Add international exposure", impact: "high", effort: "medium", reasoning: "Home bias detected, 95% domestic" },
];

export const DEMO_JOURNAL_ENTRIES = [
  { id: "je-1", date: "2026-04-15", title: "Q1 Review", content: "Portfolio outperformed benchmark by 2.3%. AI theme contributed most.", mood: "confident", tags: ["quarterly", "review"] },
  { id: "je-2", date: "2026-04-10", title: "Added to AAPL", content: "Services revenue growth thesis intact. Added 20 shares at $178.", mood: "analytical", tags: ["trade", "thesis"] },
];

export const DEMO_PAST_DECISIONS = [
  { id: "ptd-1", decision: "Sold TSLA position", date: "2026-03-15", outcome: "good", returnSince: -8, reasoning: "Thesis changed after competition increased" },
  { id: "ptd-2", decision: "Added bonds at 4.8%", date: "2026-02-20", outcome: "good", returnSince: 2.1, reasoning: "Locked in high yields before rate cuts" },
];

export const DEMO_TRADES = [
  { id: "tr-1", symbol: "AAPL", action: "buy", quantity: 20, price: 178, date: "2026-04-10", status: "executed" },
  { id: "tr-2", symbol: "TSLA", action: "sell", quantity: 15, price: 215, date: "2026-04-08", status: "executed" },
  { id: "tr-3", symbol: "BND", action: "buy", quantity: 50, price: 72, date: "2026-04-05", status: "executed" },
];

// ── Re-export investment service functions (facade layer) ──

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
