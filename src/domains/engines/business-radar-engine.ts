// ═══════════════════════════════════════════════════════════════
// SITA OS — Real-Time Business Radar Engine
// Live signal tracking, ambient intelligence, event monitoring
// ═══════════════════════════════════════════════════════════════

export type SignalCategory =
  | "lead" | "client" | "revenue" | "cash" | "operations"
  | "team" | "risk" | "opportunity" | "advisor";

export type SignalSeverity = "info" | "low" | "medium" | "high" | "critical";
export type SignalDirection = "positive" | "neutral" | "negative";

export interface BusinessSignal {
  id: string;
  category: SignalCategory;
  severity: SignalSeverity;
  direction: SignalDirection;
  title: string;
  description: string;
  timestamp: number;
  source: string;
  metric?: { label: string; value: number; unit: string; delta?: number };
  actionable: boolean;
  suggestedAction?: string;
  relatedEntityId?: string;
  acknowledged: boolean;
  expiresAt?: number;
}

export interface RadarSector {
  category: SignalCategory;
  label: string;
  activeSignals: number;
  criticalCount: number;
  healthScore: number; // 0-100
  trend: "improving" | "stable" | "declining";
  color: string;
}

export interface RadarSnapshot {
  sectors: RadarSector[];
  totalSignals: number;
  criticalSignals: number;
  overallHealth: number;
  lastUpdated: number;
  signalVelocity: number; // signals per hour
}

// ── Signal Generator (simulated real-time) ──────────────────────

const SIGNAL_TEMPLATES: Array<Omit<BusinessSignal, "id" | "timestamp" | "acknowledged">> = [
  { category: "lead", severity: "high", direction: "positive", title: "New High-Value Lead", description: "Sarah Mitchell from Apex Corp submitted a consultation request ($45K est.)", source: "CRM", actionable: true, suggestedAction: "Respond within 2 hours for best conversion", metric: { label: "Est. Value", value: 45000, unit: "$" } },
  { category: "lead", severity: "medium", direction: "negative", title: "Lead Going Cold", description: "Marcus Webb hasn't responded in 14 days — engagement dropping", source: "CRM", actionable: true, suggestedAction: "Send personalized follow-up or reassign", metric: { label: "Days Silent", value: 14, unit: "days" } },
  { category: "revenue", severity: "critical", direction: "negative", title: "Invoice Overdue 30+ Days", description: "Atlas Corp invoice #1247 ($12,500) is 32 days overdue", source: "Finance", actionable: true, suggestedAction: "Escalate to collections protocol", metric: { label: "Overdue Amount", value: 12500, unit: "$" } },
  { category: "cash", severity: "high", direction: "negative", title: "Cash Runway Alert", description: "At current burn rate, reserves drop below safety threshold in 18 days", source: "Finance", actionable: true, suggestedAction: "Review upcoming expenses and accelerate receivables", metric: { label: "Runway", value: 18, unit: "days", delta: -5 } },
  { category: "client", severity: "medium", direction: "negative", title: "Client Satisfaction Drop", description: "Meridian LLC satisfaction score fell from 78 to 55 this month", source: "CRM", actionable: true, suggestedAction: "Schedule check-in call with account lead", metric: { label: "Satisfaction", value: 55, unit: "pts", delta: -23 } },
  { category: "operations", severity: "low", direction: "negative", title: "Workflow Bottleneck", description: "3 deliverables are blocked in review stage for 5+ days", source: "Tasks", actionable: true, suggestedAction: "Clear review queue or delegate", metric: { label: "Blocked", value: 3, unit: "items" } },
  { category: "opportunity", severity: "high", direction: "positive", title: "Upsell Opportunity", description: "Nova Inc contract renewal in 30 days — they've expanded scope twice this year", source: "CRM", actionable: true, suggestedAction: "Prepare premium tier proposal before renewal", metric: { label: "Potential", value: 36000, unit: "$" } },
  { category: "team", severity: "medium", direction: "negative", title: "Team Overload Detected", description: "Team member Alex has 140% capacity utilization this week", source: "Operations", actionable: true, suggestedAction: "Redistribute 2 tasks or extend deadlines", metric: { label: "Utilization", value: 140, unit: "%" } },
  { category: "advisor", severity: "info", direction: "positive", title: "Advisor Insight Ready", description: "Revenue Advisor identified $28K in recoverable pipeline from stale quotes", source: "AI Advisor", actionable: true, suggestedAction: "Review and approve recovery batch", metric: { label: "Recoverable", value: 28000, unit: "$" } },
  { category: "risk", severity: "high", direction: "negative", title: "Concentration Risk", description: "Top 2 clients represent 62% of revenue — diversification needed", source: "Analytics", actionable: true, suggestedAction: "Increase lead gen for new verticals", metric: { label: "Concentration", value: 62, unit: "%" } },
  { category: "revenue", severity: "medium", direction: "positive", title: "Quote Accepted", description: "Cascade Group accepted proposal #892 ($18,400)", source: "CRM", actionable: true, suggestedAction: "Convert to project and schedule kickoff", metric: { label: "Won", value: 18400, unit: "$" } },
  { category: "lead", severity: "info", direction: "positive", title: "Website Traffic Spike", description: "Landing page visits up 340% today — possible viral mention", source: "Analytics", actionable: false, metric: { label: "Traffic", value: 340, unit: "%", delta: 340 } },
  { category: "cash", severity: "info", direction: "positive", title: "Payment Received", description: "Nova Inc paid invoice #1189 ($8,200) — 3 days early", source: "Finance", actionable: false, metric: { label: "Received", value: 8200, unit: "$" } },
  { category: "operations", severity: "high", direction: "negative", title: "Missed Deadline", description: "Project milestone 'Phase 2 Delivery' for Atlas Corp was due yesterday", source: "Tasks", actionable: true, suggestedAction: "Update client and provide revised timeline", metric: { label: "Days Late", value: 1, unit: "days" } },
];

let signalIdCounter = 0;

export class BusinessRadarEngine {
  private signals: BusinessSignal[] = [];
  private maxSignals = 100;

  constructor() {
    // Initialize with a batch of signals
    this.seedInitialSignals();
  }

  private seedInitialSignals(): void {
    const now = Date.now();
    const shuffled = [...SIGNAL_TEMPLATES].sort(() => Math.random() - 0.5);
    shuffled.slice(0, 8).forEach((template, i) => {
      this.signals.push({
        ...template,
        id: `sig-${++signalIdCounter}`,
        timestamp: now - (i * 300000 + Math.random() * 600000), // staggered over last few hours
        acknowledged: i > 4, // older ones are acknowledged
      });
    });
    this.signals.sort((a, b) => b.timestamp - a.timestamp);
  }

  /** Generate a new random signal (call periodically for live feel) */
  generateSignal(): BusinessSignal | null {
    const template = SIGNAL_TEMPLATES[Math.floor(Math.random() * SIGNAL_TEMPLATES.length)];
    const signal: BusinessSignal = {
      ...template,
      id: `sig-${++signalIdCounter}`,
      timestamp: Date.now(),
      acknowledged: false,
    };
    this.signals.unshift(signal);
    if (this.signals.length > this.maxSignals) this.signals.pop();
    return signal;
  }

  /** Get all active signals */
  getSignals(): BusinessSignal[] {
    return [...this.signals];
  }

  /** Get signals by category */
  getSignalsByCategory(category: SignalCategory): BusinessSignal[] {
    return this.signals.filter(s => s.category === category);
  }

  /** Get unacknowledged signals */
  getUnacknowledged(): BusinessSignal[] {
    return this.signals.filter(s => !s.acknowledged);
  }

  /** Acknowledge a signal */
  acknowledge(signalId: string): void {
    const signal = this.signals.find(s => s.id === signalId);
    if (signal) signal.acknowledged = true;
  }

  /** Acknowledge all */
  acknowledgeAll(): void {
    this.signals.forEach(s => { s.acknowledged = true; });
  }

  /** Get radar snapshot */
  getSnapshot(): RadarSnapshot {
    const categories: SignalCategory[] = ["lead", "client", "revenue", "cash", "operations", "team", "risk", "opportunity", "advisor"];
    const categoryColors: Record<SignalCategory, string> = {
      lead: "hsl(265 55% 58%)",
      client: "hsl(200 80% 55%)",
      revenue: "hsl(152 55% 48%)",
      cash: "hsl(38 85% 58%)",
      operations: "hsl(280 60% 55%)",
      team: "hsl(170 60% 50%)",
      risk: "hsl(0 72% 51%)",
      opportunity: "hsl(152 55% 48%)",
      advisor: "hsl(265 55% 58%)",
    };

    const sectors: RadarSector[] = categories.map(cat => {
      const catSignals = this.getSignalsByCategory(cat);
      const critical = catSignals.filter(s => s.severity === "critical" || s.severity === "high").length;
      const positive = catSignals.filter(s => s.direction === "positive").length;
      const negative = catSignals.filter(s => s.direction === "negative").length;
      const health = catSignals.length === 0 ? 85 : Math.max(20, Math.min(100, 80 - critical * 15 + positive * 10 - negative * 5));
      const trend = positive > negative ? "improving" : positive === negative ? "stable" : "declining";

      return {
        category: cat,
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
        activeSignals: catSignals.length,
        criticalCount: critical,
        healthScore: health,
        trend,
        color: categoryColors[cat],
      };
    });

    const totalSignals = this.signals.length;
    const criticalSignals = this.signals.filter(s => s.severity === "critical" || s.severity === "high").length;
    const overallHealth = sectors.length > 0 ? Math.round(sectors.reduce((sum, s) => sum + s.healthScore, 0) / sectors.length) : 85;

    // Calculate velocity (signals in last hour)
    const oneHourAgo = Date.now() - 3600000;
    const signalVelocity = this.signals.filter(s => s.timestamp > oneHourAgo).length;

    return {
      sectors,
      totalSignals,
      criticalSignals,
      overallHealth,
      lastUpdated: Date.now(),
      signalVelocity,
    };
  }
}

// ── Singleton ───────────────────────────────────────────────────

let instance: BusinessRadarEngine | null = null;

export function getBusinessRadarEngine(): BusinessRadarEngine {
  if (!instance) instance = new BusinessRadarEngine();
  return instance;
}
