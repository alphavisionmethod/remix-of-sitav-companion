// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Data: Investment Office (Consolidated)
// All investment demo data constants + core-service facades
// ═══════════════════════════════════════════════════════════════

export const DEMO_LEARN_TOPICS = [
  { title: "Dollar-Cost Averaging", desc: "Invest fixed amounts at regular intervals to reduce timing risk", icon: "📊" },
  { title: "Asset Allocation", desc: "Balance risk and return across asset classes", icon: "📈" },
  { title: "Risk-Adjusted Returns", desc: "Measure performance relative to risk taken", icon: "🛡️" },
  { title: "Tax-Loss Harvesting", desc: "Offset gains by selling underperformers strategically", icon: "💰" },
];

export const DEMO_BEHAVIORAL_SIGNALS = [
  { id: "bs-1", signal: "Loss aversion detected", type: "bias", severity: "warning", pattern: "Holding losers 3x longer than winners", icon: "⚠️", title: "Loss Aversion", detail: "You tend to hold losing positions 3x longer than winning ones", timestamp: "2h ago", suggestion: "Set systematic stop-losses", recommendation: "Review position sizing rules" },
  { id: "bs-2", signal: "Recency bias", type: "cognitive", severity: "info", pattern: "Over-weighting recent events", icon: "👁️", title: "Recency Bias", detail: "Recent market moves are over-influencing your decisions", timestamp: "1d ago", suggestion: "Check 5-year base rates", recommendation: "Check historical base rates" },
  { id: "bs-3", signal: "Confirmation bias risk", type: "cognitive", severity: "caution", pattern: "Only consuming bullish research", icon: "📖", title: "Confirmation Bias", detail: "Your research is skewed toward confirming existing positions", timestamp: "3d ago", suggestion: "Seek contrarian viewpoints", recommendation: "Read bear case research" },
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
  { id: "ct-1", label: "Emergency Fund", purpose: "Emergency Fund", icon: "🛡️", target: 50000, current: 48000, allocated: 48000, value: 48000, health: "good", risk: "low", color: "emerald" },
  { id: "ct-2", label: "Education Fund", purpose: "Education Fund", icon: "📚", target: 120000, current: 67000, allocated: 67000, value: 67000, health: "on-track", risk: "medium", color: "blue" },
  { id: "ct-3", label: "Retirement", purpose: "Retirement", icon: "👑", target: 2000000, current: 340000, allocated: 340000, value: 340000, health: "on-track", risk: "medium", color: "purple" },
];

export const DEMO_SHOCK_ZONES = [
  { id: "sz-1", label: "Market Crash -30%", scenario: "Market crash -30%", severity: "high", portfolioImpact: -18, recoveryMonths: 14, hedged: true, exposure: 62, detail: "Broad equity selloff with credit spread widening" },
  { id: "sz-2", label: "Inflation Spike 8%", scenario: "Inflation spike to 8%", severity: "moderate", portfolioImpact: -5, recoveryMonths: 6, hedged: false, exposure: 35, detail: "Persistent inflation erodes real returns" },
  { id: "sz-3", label: "Rate Hike 200bp", scenario: "Interest rate hike 200bp", severity: "moderate", portfolioImpact: -8, recoveryMonths: 9, hedged: true, exposure: 28, detail: "Aggressive tightening impacts duration-sensitive assets" },
];

export const DEMO_CATALYST_EVENTS = [
  { id: "ce-1", event: "Fed Rate Decision", title: "Fed Rate Decision", type: "macro", description: "FOMC rate announcement and forward guidance", date: "2026-05-01", impact: "high", sector: "fixed-income", status: "upcoming", assets: ["TLT", "BND", "AGG"], portfolioExposure: 35 },
  { id: "ce-2", event: "Earnings Season Q2", title: "Q2 Earnings Season", type: "earnings", description: "Major tech companies report quarterly results", date: "2026-07-15", impact: "high", sector: "equities", status: "upcoming", assets: ["AAPL", "MSFT", "NVDA", "GOOGL"], portfolioExposure: 55 },
  { id: "ce-3", event: "EU Regulation Vote", title: "EU AI Regulation Vote", type: "regulatory", description: "European Parliament votes on AI regulation framework", date: "2026-06-10", impact: "medium", sector: "tech", status: "upcoming", assets: ["MSFT", "GOOGL"], portfolioExposure: 22 },
];

export const DEMO_DIMS = [
  { key: "value", label: "Value", color: "blue", score: 72, inverted: false, trend: "up" },
  { key: "momentum", label: "Momentum", color: "green", score: 65, inverted: false, trend: "stable" },
  { key: "quality", label: "Quality", color: "purple", score: 88, inverted: false, trend: "up" },
  { key: "volatility", label: "Volatility", color: "amber", score: 42, inverted: true, trend: "down" },
];

export const DEMO_POSITIONS = [
  { id: "p-1", symbol: "AAPL", name: "Apple Inc", icon: "🍎", weight: 8.2, overall: 82, pnl: 12.4, conviction: "high", verdict: "hold" },
  { id: "p-2", symbol: "MSFT", name: "Microsoft", icon: "💻", weight: 7.1, overall: 88, pnl: 18.7, conviction: "high", verdict: "hold" },
  { id: "p-3", symbol: "NVDA", name: "NVIDIA", icon: "⚡", weight: 6.5, overall: 75, pnl: 24.2, conviction: "medium", verdict: "trim" },
  { id: "p-4", symbol: "BRK.B", name: "Berkshire Hathaway", icon: "🏛️", weight: 5.5, overall: 90, pnl: 6.2, conviction: "medium", verdict: "hold" },
];

export const DEMO_NARRATIVES = [
  { id: "n-1", title: "AI Infrastructure Boom", icon: "⚡", strength: 85, connections: [{ asset: "NVDA", class: "Equity", role: "Primary beneficiary" }, { asset: "AMD", class: "Equity", role: "Secondary play" }, { asset: "MSFT", class: "Equity", role: "Platform owner" }], macroDrivers: ["Enterprise AI adoption", "Cloud capex surge"], risks: ["Overspend cycle", "Regulatory backlash"], status: "active" },
  { id: "n-2", title: "Energy Transition", icon: "🌍", strength: 62, connections: [{ asset: "ENPH", class: "Equity", role: "Solar leader" }, { asset: "NEE", class: "Equity", role: "Utility scale" }], macroDrivers: ["Policy incentives", "Cost parity"], risks: ["Subsidy cuts", "Grid bottleneck"], status: "active" },
  { id: "n-3", title: "Healthcare Innovation", icon: "❤️", strength: 70, connections: [{ asset: "LLY", class: "Equity", role: "GLP-1 leader" }, { asset: "ISRG", class: "Equity", role: "Surgical robotics" }], macroDrivers: ["Aging population", "AI diagnostics"], risks: ["Regulation", "Pricing pressure"], status: "monitoring" },
];

export const DEMO_PENDING_DECISIONS = [
  { id: "pd-1", label: "Rebalance tech allocation", symbol: "TECH", type: "rebalance", icon: "📊", status: "pending", score: 72, verdict: "recommended", urgency: "medium", dueDate: "2026-04-20", advisorNote: "Tech sector exceeds target by 5%", overallScore: 72, name: "Tech Rebalance", dimensions: [{ label: "Risk", score: 80, status: "pass" }, { label: "Timing", score: 65, status: "warn" }] },
  { id: "pd-2", label: "Tax-loss harvest", symbol: "SPCE", type: "tax", icon: "💰", status: "ready", score: 88, verdict: "strongly recommended", urgency: "high", dueDate: "2026-04-18", advisorNote: "Short-term loss offset opportunity", overallScore: 88, name: "Tax Harvest", dimensions: [{ label: "Tax Impact", score: 92, status: "pass" }, { label: "Timing", score: 85, status: "pass" }] },
  { id: "pd-3", label: "Review dividend reinvestment", symbol: "VYM", type: "income", icon: "📈", status: "low-priority", score: 55, verdict: "optional", urgency: "low", dueDate: "2026-05-01", advisorNote: "Consider redirecting dividends to growth", overallScore: 55, name: "Dividend Review", dimensions: [{ label: "Impact", score: 50, status: "warn" }, { label: "Urgency", score: 40, status: "fail" }] },
];

export const DEMO_READINESS_DIMENSIONS = [
  { label: "Data Quality", score: 92, status: "pass" },
  { label: "Risk Assessment", score: 87, status: "pass" },
  { label: "Market Context", score: 78, status: "warn" },
  { label: "Advisor Consensus", score: 65, status: "warn" },
  { label: "Historical Pattern", score: 71, status: "warn" },
];

export const DEMO_INV_DISAGREEMENTS = [
  { id: "dis-1", topic: "Tech weighting", advisorA: { name: "Growth Advisor", emoji: "📈", stance: "Bullish — AI justifies 35%", confidence: 82, reasoning: "Enterprise AI adoption is accelerating. Revenue growth in cloud and AI services justifies overweight position." }, advisorB: { name: "Risk Advisor", emoji: "🛡️", stance: "Cautious — Concentration too high", confidence: 75, reasoning: "Single-sector concentration above 30% historically leads to excessive drawdowns during sector rotations." }, keyAssumptionConflict: "AI revenue growth rate vs mean-reversion", resolvingEvidence: "Historical sector concentration outcomes", implication: "opportunity" },
  { id: "dis-2", topic: "Bond duration", advisorA: { name: "Income Advisor", emoji: "💰", stance: "Constructive — Extend to lock rates", confidence: 70, reasoning: "Current yields are near cycle highs. Extending duration locks in attractive income for the next decade." }, advisorB: { name: "Macro Advisor", emoji: "🌍", stance: "Cautious — Curve inversion risk", confidence: 68, reasoning: "Yield curve inversion signals potential recession. Short duration provides flexibility to reinvest at higher rates." }, keyAssumptionConflict: "Rate path divergence", resolvingEvidence: "Fed dot plot vs market implied rates", implication: "caution" },
];

export const DEMO_EVENTS = [
  { id: "ev-1", title: "Global Recession", name: "Global Recession", probability: 15, previousProbability: 18, trend: "falling", impact: -25, timeframe: "12 months", catalystDate: "Q4 2026", confidence: 72, sleeveExposure: 45, branches: [{ label: "Deep recession", probability: 5, sentiment: "bearish", impact: "GDP -3%, equities -35%" }, { label: "Mild contraction", probability: 10, sentiment: "neutral", impact: "GDP -0.5%, equities -15%" }, { label: "Avoided / Soft landing", probability: 85, sentiment: "bullish", impact: "GDP +1.5%, equities +12%" }] },
  { id: "ev-2", title: "AI Bubble Burst", name: "AI Bubble Burst", probability: 20, previousProbability: 15, trend: "rising", impact: -18, timeframe: "18 months", catalystDate: "H2 2027", confidence: 55, sleeveExposure: 62, branches: [{ label: "Full correction", probability: 8, sentiment: "bearish", impact: "AI stocks -50%+" }, { label: "Rotation only", probability: 12, sentiment: "neutral", impact: "Sector rotation, -20% tech" }, { label: "Sustained growth", probability: 80, sentiment: "bullish", impact: "Continued AI expansion" }] },
  { id: "ev-3", title: "Stagflation", name: "Stagflation", probability: 10, previousProbability: 12, trend: "falling", impact: -15, timeframe: "24 months", catalystDate: "2027", confidence: 45, sleeveExposure: 30, branches: [{ label: "Persistent stagflation", probability: 4, sentiment: "bearish", impact: "Real returns deeply negative" }, { label: "Temporary spike", probability: 6, sentiment: "neutral", impact: "6-12 month adjustment" }, { label: "Averted", probability: 90, sentiment: "bullish", impact: "Soft landing achieved" }] },
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
  { id: "cr-1", rule: "Never invest in what you don't understand", label: "Understanding Requirement", description: "Must demonstrate comprehension of business model, risks, and competitive position", category: "philosophy", weight: "critical", severity: "hard" as const, value: "100%", active: true },
  { id: "cr-2", rule: "Position sizing based on conviction level", label: "Conviction-Based Sizing", description: "High: 5%, Medium: 3%, Low: 1% maximum position size", category: "risk", weight: "high", severity: "hard" as const, value: "5% max", active: true },
  { id: "cr-3", rule: "Always have a thesis before buying", label: "Thesis Requirement", description: "Written thesis with entry/exit criteria must exist before any purchase", category: "process", weight: "critical", severity: "hard" as const, value: "Required", active: true },
  { id: "cr-4", rule: "Review every position quarterly", label: "Quarterly Review", description: "All positions must be reviewed for thesis validity every 90 days", category: "process", weight: "medium", severity: "soft" as const, value: "90 days", active: true },
];

export const DEMO_CURRENT_VIOLATIONS = [
  { id: "cv-1", ruleId: "cr-2", rule: "cr-2", position: "SPCE", issue: "Position exceeds conviction-based limit", severity: "warning", detail: "SPCE position is 2.1% but conviction is 'low' (max 1%)" },
];

export const DEMO_INV_CATEGORIES = [
  { id: "all", label: "All Rules", name: "All", weight: 100, color: "slate" },
  { id: "philosophy", label: "Philosophy", name: "Philosophy", weight: 30, color: "blue" },
  { id: "risk", label: "Risk Management", name: "Risk", weight: 40, color: "amber" },
  { id: "process", label: "Process", name: "Process", weight: 30, color: "purple" },
];

export const DEMO_RECEIPTS = [
  { id: "rc-1", action: "Buy AAPL", date: "2026-04-10", amount: 5000, proofHash: "0xabc123", verified: true },
  { id: "rc-2", action: "Sell TSLA", date: "2026-04-08", amount: 3200, proofHash: "0xdef456", verified: true },
  { id: "rc-3", action: "Rebalance Q1", date: "2026-03-31", amount: 15000, proofHash: "0xghi789", verified: true },
];

export const DEMO_CLASS_TABS = [
  { label: "Equities", value: "equities", icon: "📈", count: 24 },
  { label: "Fixed Income", value: "fixed-income", icon: "🛡️", count: 8 },
  { label: "Alternatives", value: "alternatives", icon: "🧭", count: 5 },
  { label: "Cash", value: "cash", icon: "💵", count: 2 },
];

export const DEMO_MEMORY_EVENTS = [
  { id: "me-1", title: "COVID Crash Recovery", icon: "📈", time: "Mar 2020", severity: "critical", detail: "Held positions through -34% drawdown, recovered within 5 months" },
  { id: "me-2", title: "Tech Selloff Lesson", icon: "⚠️", time: "Jan 2022", severity: "warning", detail: "Added to quality tech names during selloff, +25% next year" },
];

export const DEMO_MODES = [
  { id: "m-1", label: "Conservative", emoji: "🛡️", description: "Preserve capital, minimize drawdowns", riskLevel: 3, density: "low", alerting: "minimal", advisorIntensity: "low", riskFraming: "absolute", active: false, mode: "Conservative" },
  { id: "m-2", label: "Balanced", emoji: "⚖️", description: "Steady growth with moderate risk", riskLevel: 5, density: "medium", alerting: "standard", advisorIntensity: "medium", riskFraming: "relative", active: true, mode: "Balanced" },
  { id: "m-3", label: "Aggressive", emoji: "🚀", description: "Maximum growth, higher volatility accepted", riskLevel: 8, density: "high", alerting: "active", advisorIntensity: "high", riskFraming: "opportunity-cost", active: false, mode: "Aggressive" },
];

export const DEMO_THEMES = [
  { id: "th-1", label: "AI Infrastructure", icon: "⚡", conviction: 90, strength: 90, exposure: 22, crowding: 72, uncertainty: 15, trend: "expanding", instruments: ["NVDA", "AMD", "MSFT", "GOOGL"], advisorView: "Strong secular trend with 3-5 year runway. Monitor for capex cycle peak." },
  { id: "th-2", label: "Clean Energy", icon: "🌍", conviction: 70, strength: 70, exposure: 12, crowding: 45, uncertainty: 30, trend: "stable", instruments: ["ENPH", "NEE", "FSLR"], advisorView: "Policy-dependent thesis. Watch subsidy renewal cycles." },
  { id: "th-3", label: "Healthcare Tech", icon: "❤️", conviction: 75, strength: 75, exposure: 8, crowding: 38, uncertainty: 22, trend: "expanding", instruments: ["LLY", "ISRG", "DXCM"], advisorView: "Demographic tailwinds with AI-enhanced diagnostics potential." },
];

export const DEMO_AVAILABLE_PLATFORMS: any[] = [
  { id: "pl-1", name: "Interactive Brokers", type: "brokerage", icon: "🏦", status: "connected", accounts: 2, lastSync: "2026-04-15", chain: null, popular: true, region: "US", capabilities: ["Portfolio sync", "Trade execution", "Balance tracking", "Tax lot history"] },
  { id: "pl-2", name: "Schwab", type: "brokerage", icon: "💼", status: "available", accounts: 0, lastSync: null, chain: null, popular: true, region: "US", capabilities: ["Portfolio sync", "Balance tracking"] },
  { id: "pl-3", name: "Coinbase", type: "exchange", icon: "🪙", status: "available", accounts: 0, lastSync: null, chain: "ethereum", popular: true, region: "Global", capabilities: ["Crypto positions", "Real-time balances", "Order routing"] },
  { id: "pl-4", name: "MetaMask", type: "wallet", icon: "🦊", status: "available", accounts: 0, lastSync: null, chain: "ethereum", popular: false, region: null, capabilities: ["Token balances", "DeFi positions", "On-chain activity"] },
  { id: "pl-5", name: "Polymarket", type: "event-market", icon: "📊", status: "available", accounts: 0, lastSync: null, chain: "polygon", popular: false, region: "Global", capabilities: ["Event positions", "Probability tracking"] },
  { id: "pl-6", name: "OANDA", type: "forex", icon: "💱", status: "available", accounts: 0, lastSync: null, chain: null, popular: false, region: "Global", capabilities: ["Forex positions", "Real-time rates"] },
];

export const DEMO_SIZING_SCENARIOS = [
  { id: "ss-1", asset: "AAPL", icon: "🍎", proposedSize: 5000, violatesPolicy: false, currentAllocation: 8.2, postAllocation: 9.1, violation: null, maxAllowed: 10, riskBudgetUsed: 55, concentrationImpact: "Sector weight increases to 32%", advisorSuggestion: "Size is within policy limits. Consider scaling in over 2 weeks to reduce timing risk.", scenario: "High conviction, low volatility", suggestedSize: 5000, maxLoss: 2, reasoning: "Strong thesis with stable price action" },
  { id: "ss-2", asset: "RIVN", icon: "🔥", proposedSize: 3000, violatesPolicy: true, currentAllocation: 1.5, postAllocation: 2.8, violation: "Exceeds speculative sleeve limit of 2%", maxAllowed: 2, riskBudgetUsed: 78, concentrationImpact: "Speculative sleeve exceeds budget", advisorSuggestion: "Reduce to $1,500 to stay within speculative limits. High beta asset requires smaller sizing.", scenario: "Medium conviction, high volatility", suggestedSize: 1500, maxLoss: 4, reasoning: "Good thesis but wide price swings" },
  { id: "ss-3", asset: "SPCE", icon: "🎯", proposedSize: 1000, violatesPolicy: false, currentAllocation: 0.5, postAllocation: 0.7, violation: null, maxAllowed: 1, riskBudgetUsed: 42, concentrationImpact: "Minimal impact on concentration", advisorSuggestion: "Size appropriate for binary outcome. Set hard stop at entry minus 50%.", scenario: "Speculative with catalyst", suggestedSize: 1000, maxLoss: 1, reasoning: "Binary outcome, size for total loss" },
];

export const DEMO_ACTIVE_POSITIONS = [
  { id: "ap-1", symbol: "AAPL", name: "Apple Inc", icon: "🍎", entryPrice: 178, currentPrice: 195, entryDate: "2026-03-01", pnlPercent: 9.5, holdingDays: 45, reviewDue: true, shouldReview: true, thesisStatus: "strengthened", thesisIntact: true, recommendation: "hold", whatChanged: ["Services revenue grew 18% YoY", "iPhone installed base hit new record", "AI features driving upgrade cycle"], advisorNote: "Thesis intact. Services growth accelerating. Hold position." },
  { id: "ap-2", symbol: "NVDA", name: "NVIDIA", icon: "⚡", entryPrice: 850, currentPrice: 920, entryDate: "2026-03-15", pnlPercent: 8.2, holdingDays: 30, reviewDue: false, shouldReview: false, thesisStatus: "strengthened", thesisIntact: true, recommendation: "hold", whatChanged: ["Data center revenue exceeded expectations", "New Blackwell architecture shipping"], advisorNote: "Strong momentum. Consider trimming if position exceeds 7% target." },
  { id: "ap-3", symbol: "MSFT", name: "Microsoft", icon: "💻", entryPrice: 410, currentPrice: 435, entryDate: "2026-02-15", pnlPercent: 6.1, holdingDays: 60, reviewDue: true, shouldReview: true, thesisStatus: "intact", thesisIntact: true, recommendation: "hold", whatChanged: ["Azure growth reaccelerated to 33%", "Copilot adoption growing but monetization unclear"], advisorNote: "Core thesis intact. Monitor Copilot monetization in next earnings." },
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
  { id: "je-1", date: "2026-04-15", symbol: "PORTFOLIO", title: "Q1 Review", content: "Portfolio outperformed benchmark by 2.3%.", confidence: 85, convictionType: "analytical", stressLevel: "low", fomoFlag: false, mood: "confident", tags: ["quarterly", "review"], urgency: "low", emotionNote: "Feeling disciplined and measured about results" },
  { id: "je-2", date: "2026-04-10", symbol: "AAPL", title: "Added to AAPL", content: "Services revenue growth thesis intact.", confidence: 78, convictionType: "thesis-driven", stressLevel: "low", fomoFlag: false, mood: "analytical", tags: ["trade", "thesis"], urgency: "medium", emotionNote: "Confident in thesis, no emotional pressure" },
  { id: "je-3", date: "2026-04-05", symbol: "TSLA", title: "Exited TSLA", content: "Competition thesis changed fundamentally.", confidence: 70, convictionType: "risk-management", stressLevel: "medium", fomoFlag: true, mood: "cautious", tags: ["exit", "thesis-change"], urgency: "high", emotionNote: "Some FOMO about missing potential recovery" },
];

export const DEMO_PAST_DECISIONS = [
  { id: "ptd-1", action: "Sold TSLA", symbol: "TSLA", date: "2026-03-15", outcome: "good", entryPrice: 245, currentPrice: 215, returnSince: -8, wasRight: true, thesisAtTime: "Competition eroding moat", marketConditionsAtTime: ["Rising competition from BYD", "Margin compression trend", "CEO distraction risk"], advisorViewsAtTime: [{ name: "Growth Advisor", view: "Sell — thesis broken" }, { name: "Risk Advisor", view: "Sell — position risk elevated" }], disciplineFollowed: true, whatChangedAfter: "Stock fell further 12%", lessonLearned: "Trust thesis changes early" },
  { id: "ptd-2", action: "Added BND", symbol: "BND", date: "2026-02-20", outcome: "good", entryPrice: 70, currentPrice: 72, returnSince: 2.1, wasRight: true, thesisAtTime: "Lock high yields before cuts", marketConditionsAtTime: ["Fed signaling pause", "Yield curve normalizing", "Inflation declining"], advisorViewsAtTime: [{ name: "Income Advisor", view: "Buy — lock yields" }, { name: "Macro Advisor", view: "Buy — rate cycle turning" }], disciplineFollowed: true, whatChangedAfter: "Rates started declining", lessonLearned: "Lock in yields when available" },
];

export const DEMO_TRADES = [
  { id: "tr-1", symbol: "AAPL", name: "Apple Inc", icon: "🍎", action: "buy", quantity: 20, price: 178, date: "2026-04-10", status: "executed", fragility: 25, invalidations: ["Services revenue decline >10%", "iPhone unit sales drop 2 consecutive quarters"], hiddenRisks: ["China regulatory risk", "App Store antitrust ruling"], waitingLogic: "Thesis requires 2 quarters of services growth confirmation" },
  { id: "tr-2", symbol: "TSLA", name: "Tesla Inc", icon: "⚡", action: "sell", quantity: 15, price: 215, date: "2026-04-08", status: "executed", fragility: 72, invalidations: ["Competition closes technology gap", "Margin compression below 15%"], hiddenRisks: ["CEO key-person risk", "Regulatory credits declining"], waitingLogic: "Exited — thesis no longer valid" },
  { id: "tr-3", symbol: "BND", name: "Vanguard Bond ETF", icon: "🛡️", action: "buy", quantity: 50, price: 72, date: "2026-04-05", status: "executed", fragility: 15, invalidations: ["Inflation reaccelerates above 5%", "Fed reverses course to hiking"], hiddenRisks: ["Duration risk if rates spike", "Credit spread widening"], waitingLogic: "Hold through rate cycle — income thesis" },
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
