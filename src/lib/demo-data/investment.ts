// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Data: Investment Office (Consolidated)
// All investment demo data constants + core-service facades
// ═══════════════════════════════════════════════════════════════

import { Activity, TrendingUp, DollarSign, Shield, Target, Flame, BookOpen, BarChart3, Globe, Zap, AlertTriangle, Heart, Crown, Compass, Layers, Eye, type LucideIcon } from "lucide-react";

export const DEMO_LEARN_TOPICS = [
  { title: "Dollar-Cost Averaging", desc: "Invest fixed amounts at regular intervals to reduce timing risk", icon: TrendingUp },
  { title: "Asset Allocation", desc: "Balance risk and return across asset classes", icon: Layers },
  { title: "Risk-Adjusted Returns", desc: "Measure performance relative to risk taken", icon: Shield },
  { title: "Tax-Loss Harvesting", desc: "Offset gains by selling underperformers strategically", icon: DollarSign },
];

export const DEMO_BEHAVIORAL_SIGNALS = [
  { id: "bs-1", signal: "Loss aversion detected", type: "bias", severity: "warning", pattern: "Holding losers 3x longer than winners", icon: AlertTriangle, title: "Loss Aversion", detail: "You tend to hold losing positions 3x longer than winning ones", timestamp: "2h ago", suggestion: "Set systematic stop-losses", recommendation: "Review position sizing rules" },
  { id: "bs-2", signal: "Recency bias", type: "cognitive", severity: "info", pattern: "Over-weighting recent events", icon: Eye, title: "Recency Bias", detail: "Recent market moves are over-influencing your decisions", timestamp: "1d ago", suggestion: "Check 5-year base rates", recommendation: "Check historical base rates" },
  { id: "bs-3", signal: "Confirmation bias risk", type: "cognitive", severity: "caution", pattern: "Only consuming bullish research", icon: BookOpen, title: "Confirmation Bias", detail: "Your research is skewed toward confirming existing positions", timestamp: "3d ago", suggestion: "Seek contrarian viewpoints", recommendation: "Read bear case research" },
];

export const DEMO_INV_PURPOSES = [
  { id: "ip-1", label: "Wealth Preservation", name: "Wealth Preservation", emoji: "🛡️", allocated: 40, target: 40, actual: 38, color: "blue", priority: "high", horizon: "10+ years" },
  { id: "ip-2", label: "Growth", name: "Growth", emoji: "📈", allocated: 35, target: 35, actual: 37, color: "green", priority: "high", horizon: "5-10 years" },
  { id: "ip-3", label: "Income", name: "Income Generation", emoji: "💰", allocated: 25, target: 25, actual: 25, color: "amber", priority: "medium", horizon: "1-5 years" },
];

export const DEMO_INV_RULES = [
  { id: "ir-1", rule: "No single position > 5% of portfolio", status: "active", violations: 0, detail: "All positions within limit" },
  { id: "ir-2", rule: "Maintain 20% cash buffer in downturns", status: "active", violations: 1, detail: "Current cash buffer at 17%" },
  { id: "ir-3", rule: "Rebalance quarterly if drift > 3%", status: "active", violations: 0, detail: "Last rebalance: 3 weeks ago" },
];

export const DEMO_INV_PURPOSES_CAPITAL_TWIN = [
  { id: "ct-1", label: "Emergency Fund", purpose: "Emergency Fund", icon: Shield, target: 50000, current: 48000, allocated: 48000, value: 48000, health: "good", risk: "low", color: "emerald" },
  { id: "ct-2", label: "Education Fund", purpose: "Education Fund", icon: BookOpen, target: 120000, current: 67000, allocated: 67000, value: 67000, health: "on-track", risk: "medium", color: "blue" },
  { id: "ct-3", label: "Retirement", purpose: "Retirement", icon: Crown, target: 2000000, current: 340000, allocated: 340000, value: 340000, health: "on-track", risk: "medium", color: "purple" },
];

export const DEMO_SHOCK_ZONES = [
  { id: "sz-1", label: "Market Crash -30%", scenario: "Market crash -30%", severity: "critical", portfolioImpact: -18, recoveryMonths: 14, hedged: true, exposure: 62, detail: "Broad equity selloff with credit spread widening" },
  { id: "sz-2", label: "Inflation Spike 8%", scenario: "Inflation spike to 8%", severity: "warning", portfolioImpact: -5, recoveryMonths: 6, hedged: false, exposure: 35, detail: "Persistent inflation erodes real returns" },
  { id: "sz-3", label: "Rate Hike 200bp", scenario: "Interest rate hike 200bp", severity: "moderate", portfolioImpact: -8, recoveryMonths: 9, hedged: true, exposure: 28, detail: "Aggressive tightening impacts duration-sensitive assets" },
];

export const DEMO_CATALYST_EVENTS = [
  { id: "ce-1", event: "Fed Rate Decision", title: "Fed Rate Decision", type: "macro", description: "FOMC rate announcement and forward guidance", date: "2026-05-01", impact: "high", sector: "fixed-income", status: "upcoming" },
  { id: "ce-2", event: "Earnings Season Q2", title: "Q2 Earnings Season", type: "earnings", description: "Major tech companies report quarterly results", date: "2026-07-15", impact: "high", sector: "equities", status: "upcoming" },
  { id: "ce-3", event: "EU Regulation Vote", title: "EU AI Regulation Vote", type: "regulatory", description: "European Parliament votes on AI regulation framework", date: "2026-06-10", impact: "medium", sector: "tech", status: "upcoming" },
];

export const DEMO_DIMS = [
  { key: "value", label: "Value", color: "blue", score: 72, inverted: false, trend: "up" },
  { key: "momentum", label: "Momentum", color: "green", score: 65, inverted: false, trend: "stable" },
  { key: "quality", label: "Quality", color: "purple", score: 88, inverted: false, trend: "up" },
  { key: "volatility", label: "Volatility", color: "amber", score: 42, inverted: true, trend: "down" },
];

export const DEMO_POSITIONS = [
  { id: "p-1", symbol: "AAPL", name: "Apple Inc", icon: Activity, weight: 8.2, overall: 82, pnl: 12.4, conviction: "high", verdict: "hold" },
  { id: "p-2", symbol: "MSFT", name: "Microsoft", icon: TrendingUp, weight: 7.1, overall: 88, pnl: 18.7, conviction: "high", verdict: "hold" },
  { id: "p-3", symbol: "NVDA", name: "NVIDIA", icon: Zap, weight: 6.5, overall: 75, pnl: 24.2, conviction: "medium", verdict: "trim" },
  { id: "p-4", symbol: "BRK.B", name: "Berkshire Hathaway", icon: Shield, weight: 5.5, overall: 90, pnl: 6.2, conviction: "medium", verdict: "hold" },
];

export const DEMO_NARRATIVES = [
  { id: "n-1", title: "AI Infrastructure Boom", icon: Zap, strength: 85, connections: ["NVDA", "AMD", "MSFT"], macroDrivers: ["Enterprise AI adoption", "Cloud capex surge"], risks: ["Overspend cycle", "Regulatory backlash"], status: "active" },
  { id: "n-2", title: "Energy Transition", icon: Globe, strength: 62, connections: ["ENPH", "NEE", "FSLR"], macroDrivers: ["Policy incentives", "Cost parity"], risks: ["Subsidy cuts", "Grid bottleneck"], status: "active" },
  { id: "n-3", title: "Healthcare Innovation", icon: Heart, strength: 70, connections: ["LLY", "ISRG", "DXCM"], macroDrivers: ["Aging population", "AI diagnostics"], risks: ["Regulation", "Pricing pressure"], status: "monitoring" },
];

export const DEMO_PENDING_DECISIONS = [
  { id: "pd-1", label: "Rebalance tech allocation", symbol: "TECH", type: "rebalance", icon: BarChart3, status: "pending", score: 72, verdict: "recommended", urgency: "medium", dueDate: "2026-04-20", advisorNote: "Tech sector exceeds target by 5%", overallScore: 72, name: "Tech Rebalance", dimensions: [{ label: "Risk", score: 80 }, { label: "Timing", score: 65 }] },
  { id: "pd-2", label: "Tax-loss harvest", symbol: "SPCE", type: "tax", icon: DollarSign, status: "ready", score: 88, verdict: "strongly recommended", urgency: "high", dueDate: "2026-04-18", advisorNote: "Short-term loss offset opportunity", overallScore: 88, name: "Tax Harvest", dimensions: [{ label: "Tax Impact", score: 92 }, { label: "Timing", score: 85 }] },
  { id: "pd-3", label: "Review dividend reinvestment", symbol: "VYM", type: "income", icon: TrendingUp, status: "low-priority", score: 55, verdict: "optional", urgency: "low", dueDate: "2026-05-01", advisorNote: "Consider redirecting dividends to growth", overallScore: 55, name: "Dividend Review", dimensions: [{ label: "Impact", score: 50 }, { label: "Urgency", score: 40 }] },
];

export const DEMO_READINESS_DIMENSIONS = [
  { label: "Data Quality", score: 92, status: "ready" },
  { label: "Risk Assessment", score: 87, status: "ready" },
  { label: "Market Context", score: 78, status: "partial" },
  { label: "Advisor Consensus", score: 65, status: "needs-review" },
  { label: "Historical Pattern", score: 71, status: "partial" },
];

export const DEMO_INV_DISAGREEMENTS = [
  { id: "dis-1", topic: "Tech weighting", advisorA: "Growth Advisor: AI justifies 35%", advisorB: "Risk Advisor: Concentration too high", keyAssumptionConflict: "AI revenue growth rate vs mean-reversion", resolvingEvidence: "Historical sector concentration outcomes", implication: "Portfolio could miss AI upside or face drawdown", bull: "AI growth justifies 35%", bear: "Concentration risk too high", resolution: "pending" },
  { id: "dis-2", topic: "Bond duration", advisorA: "Income Advisor: Extend to lock rates", advisorB: "Macro Advisor: Curve inversion risk", keyAssumptionConflict: "Rate path divergence", resolvingEvidence: "Fed dot plot vs market implied rates", implication: "Duration mismatch could cost 2-3% in rates scenario", bull: "Lock in high yields", bear: "Curve inversion risk", resolution: "pending" },
];

export const DEMO_EVENTS = [
  { id: "ev-1", title: "Global Recession", name: "Global Recession", probability: 15, previousProbability: 18, trend: "down", impact: -25, timeframe: "12 months" },
  { id: "ev-2", title: "AI Bubble Burst", name: "AI Bubble Burst", probability: 20, previousProbability: 15, trend: "up", impact: -18, timeframe: "18 months" },
  { id: "ev-3", title: "Stagflation", name: "Stagflation", probability: 10, previousProbability: 12, trend: "down", impact: -15, timeframe: "24 months" },
  { id: "ev-4", title: "Soft Landing", name: "Soft Landing", probability: 45, previousProbability: 40, trend: "up", impact: 8, timeframe: "6 months" },
];

export const DEMO_FAMILY_GOALS = [
  { id: "fg-1", label: "Children's Education", emoji: "🎓", target: 250000, current: 112500, funded: 45, deadline: "2035", status: "on-track", monthlyContribution: 1500 },
  { id: "fg-2", label: "Estate Planning", emoji: "🏛️", target: 5000000, current: 1100000, funded: 22, deadline: "2050", status: "on-track", monthlyContribution: 5000 },
  { id: "fg-3", label: "Charitable Giving", emoji: "❤️", target: 100000, current: 60000, funded: 60, deadline: "2030", status: "ahead", monthlyContribution: 2000 },
];

export const DEMO_FAMILY_MEMBERS = [
  { id: "fm-1", name: "Primary", role: "Patriarch", emoji: "👨‍💼", permissions: ["trade", "withdraw", "configure"], riskTolerance: "moderate", taxBracket: "high" },
  { id: "fm-2", name: "Spouse", role: "Co-owner", emoji: "👩‍💼", permissions: ["trade", "view"], riskTolerance: "conservative", taxBracket: "high" },
  { id: "fm-3", name: "Child 1", role: "Beneficiary", emoji: "👦", permissions: ["view"], riskTolerance: "aggressive", taxBracket: "low" },
];

export const DEMO_FAMILY_RULES = [
  { id: "fr-1", rule: "No crypto > 3% per member", status: "enforced", scope: "all", enforced: true },
  { id: "fr-2", rule: "ESG screen on all new positions", status: "enforced", scope: "all", enforced: true },
  { id: "fr-3", rule: "Quarterly family review meeting", status: "active", scope: "governance", enforced: true },
];

export const DEMO_CONSTITUTION_RULES = [
  { id: "cr-1", rule: "Never invest in what you don't understand", category: "philosophy", weight: "critical" },
  { id: "cr-2", rule: "Position sizing based on conviction level", category: "risk", weight: "high" },
  { id: "cr-3", rule: "Always have a thesis before buying", category: "process", weight: "critical" },
  { id: "cr-4", rule: "Review every position quarterly", category: "process", weight: "medium" },
];

export const DEMO_CURRENT_VIOLATIONS = [
  { id: "cv-1", ruleId: "cr-2", rule: "cr-2", position: "SPCE", issue: "Position exceeds conviction-based limit", severity: "warning", detail: "SPCE position is 2.1% but conviction is 'low' (max 1%)" },
];

export const DEMO_INV_CATEGORIES = [
  { id: "ic-1", label: "Core Holdings", name: "Core Holdings", weight: 60, color: "blue" },
  { id: "ic-2", label: "Tactical", name: "Tactical", weight: 25, color: "amber" },
  { id: "ic-3", label: "Speculative", name: "Speculative", weight: 15, color: "rose" },
];

export const DEMO_RECEIPTS = [
  { id: "rc-1", action: "Buy AAPL", date: "2026-04-10", amount: 5000, proofHash: "0xabc123", verified: true },
  { id: "rc-2", action: "Sell TSLA", date: "2026-04-08", amount: 3200, proofHash: "0xdef456", verified: true },
  { id: "rc-3", action: "Rebalance Q1", date: "2026-03-31", amount: 15000, proofHash: "0xghi789", verified: true },
];

export const DEMO_CLASS_TABS = [
  { label: "Equities", value: "equities", icon: TrendingUp, count: 24 },
  { label: "Fixed Income", value: "fixed-income", icon: Shield, count: 8 },
  { label: "Alternatives", value: "alternatives", icon: Compass, count: 5 },
  { label: "Cash", value: "cash", icon: DollarSign, count: 2 },
];

export const DEMO_MEMORY_EVENTS = [
  { id: "me-1", title: "COVID Crash Recovery", icon: TrendingUp, time: "Mar 2020", severity: "critical", detail: "Held positions through -34% drawdown, recovered within 5 months", event: "2020 COVID Crash", lesson: "Markets recover faster than expected", emotionalState: "panic", outcome: "held positions, +40% recovery" },
  { id: "me-2", title: "Tech Selloff Lesson", icon: AlertTriangle, time: "Jan 2022", severity: "warning", detail: "Added to quality tech names during selloff, +25% next year", event: "2022 Tech Selloff", lesson: "Quality companies withstand drawdowns", emotionalState: "anxious", outcome: "Added to winners, +25% next year" },
];

export const DEMO_MODES = [
  { id: "m-1", label: "Conservative", emoji: "🛡️", description: "Preserve capital, minimize drawdowns", riskLevel: 3, density: "low", alerting: "minimal", advisorIntensity: "low", riskFraming: "absolute", active: false, mode: "Conservative" },
  { id: "m-2", label: "Balanced", emoji: "⚖️", description: "Steady growth with moderate risk", riskLevel: 5, density: "medium", alerting: "standard", advisorIntensity: "medium", riskFraming: "relative", active: true, mode: "Balanced" },
  { id: "m-3", label: "Aggressive", emoji: "🚀", description: "Maximum growth, higher volatility accepted", riskLevel: 8, density: "high", alerting: "active", advisorIntensity: "high", riskFraming: "opportunity-cost", active: false, mode: "Aggressive" },
];

export const DEMO_THEMES = [
  { id: "th-1", label: "AI Infrastructure", icon: Zap, conviction: 90, strength: 90, exposure: 22, crowding: 72, uncertainty: 15, trend: "expanding", instruments: ["NVDA", "AMD", "MSFT", "GOOGL"] },
  { id: "th-2", label: "Clean Energy", icon: Globe, conviction: 70, strength: 70, exposure: 12, crowding: 45, uncertainty: 30, trend: "stable", instruments: ["ENPH", "NEE", "FSLR"] },
  { id: "th-3", label: "Healthcare Tech", icon: Heart, conviction: 75, strength: 75, exposure: 8, crowding: 38, uncertainty: 22, trend: "expanding", instruments: ["LLY", "ISRG", "DXCM"] },
];

export const DEMO_AVAILABLE_PLATFORMS = [
  { id: "pl-1", name: "Interactive Brokers", status: "connected", accounts: 2, lastSync: "2026-04-15" },
  { id: "pl-2", name: "Schwab", status: "available", accounts: 0, lastSync: null },
  { id: "pl-3", name: "Fidelity", status: "available", accounts: 0, lastSync: null },
];

export const DEMO_SIZING_SCENARIOS = [
  { id: "ss-1", asset: "AAPL", icon: Activity, proposedSize: 5, violatesPolicy: false, scenario: "High conviction, low volatility", suggestedSize: 5, maxLoss: 2, reasoning: "Strong thesis with stable price action" },
  { id: "ss-2", asset: "RIVN", icon: Flame, proposedSize: 3, violatesPolicy: true, scenario: "Medium conviction, high volatility", suggestedSize: 2, maxLoss: 4, reasoning: "Good thesis but wide price swings" },
  { id: "ss-3", asset: "SPCE", icon: Target, proposedSize: 1, violatesPolicy: false, scenario: "Speculative with catalyst", suggestedSize: 1, maxLoss: 1, reasoning: "Binary outcome, size for total loss" },
];

export const DEMO_ACTIVE_POSITIONS = [
  { id: "ap-1", symbol: "AAPL", icon: Activity, entryPrice: 178, currentPrice: 195, pnlPercent: 9.5, holdingDays: 45, reviewDue: true, shouldReview: true },
  { id: "ap-2", symbol: "NVDA", icon: Zap, entryPrice: 850, currentPrice: 920, pnlPercent: 8.2, holdingDays: 30, reviewDue: false, shouldReview: false },
  { id: "ap-3", symbol: "MSFT", icon: TrendingUp, entryPrice: 410, currentPrice: 435, pnlPercent: 6.1, holdingDays: 60, reviewDue: true, shouldReview: true },
];

export const DEMO_DNA_DIMENSIONS = [
  { label: "Value Orientation", score: 65, description: "Slight value tilt vs growth", benchmark: 50 },
  { label: "Concentration", score: 72, description: "Concentrated portfolio vs broad market", benchmark: 40 },
  { label: "Momentum Factor", score: 58, description: "Neutral momentum exposure", benchmark: 55 },
  { label: "Quality Bias", score: 81, description: "Strong quality factor preference", benchmark: 60 },
];

export const DEMO_SUGGESTIONS = [
  { id: "sg-1", suggestion: "Reduce tech concentration", impact: "medium", effort: "low", reasoning: "Single sector > 35% of portfolio" },
  { id: "sg-2", suggestion: "Add international exposure", impact: "high", effort: "medium", reasoning: "Home bias detected, 95% domestic" },
];

export const DEMO_JOURNAL_ENTRIES = [
  { id: "je-1", date: "2026-04-15", symbol: "PORTFOLIO", title: "Q1 Review", content: "Portfolio outperformed benchmark by 2.3%.", confidence: 85, convictionType: "analytical", stressLevel: "low", fomoFlag: false, mood: "confident", tags: ["quarterly", "review"] },
  { id: "je-2", date: "2026-04-10", symbol: "AAPL", title: "Added to AAPL", content: "Services revenue growth thesis intact.", confidence: 78, convictionType: "thesis-driven", stressLevel: "low", fomoFlag: false, mood: "analytical", tags: ["trade", "thesis"] },
  { id: "je-3", date: "2026-04-05", symbol: "TSLA", title: "Exited TSLA", content: "Competition thesis changed fundamentally.", confidence: 70, convictionType: "risk-management", stressLevel: "medium", fomoFlag: true, mood: "cautious", tags: ["exit", "thesis-change"] },
];

export const DEMO_PAST_DECISIONS = [
  { id: "ptd-1", action: "Sold TSLA", symbol: "TSLA", date: "2026-03-15", outcome: "good", entryPrice: 245, currentPrice: 215, returnSince: -8, wasRight: true, thesisAtTime: "Competition eroding moat", marketConditionsAtTime: "Volatile", advisorViewsAtTime: "Split — 2 sell, 1 hold", disciplineFollowed: true, whatChangedAfter: "Stock fell further 12%", lessonLearned: "Trust thesis changes early", reasoning: "Thesis changed after competition increased" },
  { id: "ptd-2", action: "Added BND", symbol: "BND", date: "2026-02-20", outcome: "good", entryPrice: 70, currentPrice: 72, returnSince: 2.1, wasRight: true, thesisAtTime: "Lock high yields before cuts", marketConditionsAtTime: "Rate plateau", advisorViewsAtTime: "Unanimous buy", disciplineFollowed: true, whatChangedAfter: "Rates started declining", lessonLearned: "Lock in yields when available", reasoning: "Locked in high yields before rate cuts" },
];

export const DEMO_TRADES = [
  { id: "tr-1", symbol: "AAPL", name: "Apple Inc", icon: Activity, action: "buy", quantity: 20, price: 178, date: "2026-04-10", status: "executed" },
  { id: "tr-2", symbol: "TSLA", name: "Tesla Inc", icon: Zap, action: "sell", quantity: 15, price: 215, date: "2026-04-08", status: "executed" },
  { id: "tr-3", symbol: "BND", name: "Vanguard Bond ETF", icon: Shield, action: "buy", quantity: 50, price: 72, date: "2026-04-05", status: "executed" },
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
