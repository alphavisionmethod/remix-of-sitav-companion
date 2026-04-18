// ═══════════════════════════════════════════════════════════════
// SITA OS — Life Intelligence Engine
// Holistic user context: business, money, household, obligations,
// timing, and learned preferences across all domains
// ═══════════════════════════════════════════════════════════════

import { MemoryService } from "./memory-service";

// ── Types ───────────────────────────────────────────────────────

export interface BusinessContext {
  pipelineHealth: number; // 0-100
  activeLeads: number;
  revenueVelocity: number; // monthly trend %
  overdueFollowups: number;
  clientObligations: { clientName: string; obligation: string; dueDate: string }[];
  winRate: number; // 0-1
}

export interface MoneyContext {
  cashPosition: number;
  safeToSpend: number;
  upcomingBills: { name: string; amount: number; dueDate: string; recurring: boolean }[];
  budgetHealth: Record<string, { spent: number; limit: number; percentage: number }>;
  reserves: number;
  monthlyBurnRate: number;
  runwayMonths: number;
}

export interface HouseholdContext {
  totalMembers: number;
  activeTasks: number;
  overdueTasks: number;
  loadBalance: number; // 0-100
  upcomingEvents: { title: string; date: string; memberIds: string[] }[];
  topContributor: string;
  weeklyBusyScore: number; // 0-100
}

export interface ObligationItem {
  id: string;
  domain: "business" | "finance" | "household" | "legal" | "health" | "education";
  title: string;
  description: string;
  dueDate: string;
  urgency: "low" | "medium" | "high" | "critical";
  recurring: boolean;
  linkedEntityId?: string;
  status: "pending" | "in-progress" | "overdue" | "completed";
}

export interface TimingContext {
  calendarDensity: number; // 0-100 how packed the calendar is
  busyScore: number; // 0-100
  optimalWindows: { start: string; end: string; quality: "focus" | "light" | "meeting" }[];
  conflictsDetected: number;
  nextFreeBlock: string; // ISO datetime
  peakProductivityHours: string[]; // e.g. ["09:00-11:00", "14:00-16:00"]
}

export interface PreferenceEntry {
  key: string;
  value: unknown;
  confidence: number; // 0-1, decays
  source: "observed" | "explicit" | "inferred";
  domain: string;
  learnedAt: number;
  lastConfirmedAt: number;
}

export interface LifeContext {
  business: BusinessContext;
  money: MoneyContext;
  household: HouseholdContext;
  obligations: ObligationItem[];
  timing: TimingContext;
  preferences: PreferenceEntry[];
  generatedAt: number;
  crossDomainInsights: string[];
}

export interface DayBriefing {
  date: string;
  headline: string;
  urgentItems: ObligationItem[];
  moneyAlert?: string;
  businessHighlight?: string;
  householdNote?: string;
  timingSummary: string;
  recommendations: string[];
}

export interface WeekBriefing {
  weekOf: string;
  headline: string;
  obligationsSummary: { total: number; completed: number; overdue: number };
  businessMetrics: { leadsContacted: number; dealsClosed: number; revenue: number };
  moneyMetrics: { totalSpent: number; budgetHealth: number; billsPaid: number };
  householdMetrics: { tasksCompleted: number; loadBalance: number };
  topRecommendations: string[];
}

// ── Scaffold Data Generators ────────────────────────────────────

function scaffoldBusiness(): BusinessContext {
  return {
    pipelineHealth: 72,
    activeLeads: 47,
    revenueVelocity: 8.5,
    overdueFollowups: 3,
    clientObligations: [
      { clientName: "Meridian Corp", obligation: "Q2 deliverable review", dueDate: new Date(Date.now() + 3 * 86400000).toISOString() },
      { clientName: "Apex Holdings", obligation: "Contract renewal", dueDate: new Date(Date.now() + 7 * 86400000).toISOString() },
    ],
    winRate: 0.34,
  };
}

function scaffoldMoney(): MoneyContext {
  return {
    cashPosition: 142_800,
    safeToSpend: 18_500,
    upcomingBills: [
      { name: "Office lease", amount: 4200, dueDate: new Date(Date.now() + 5 * 86400000).toISOString(), recurring: true },
      { name: "SaaS subscriptions", amount: 890, dueDate: new Date(Date.now() + 2 * 86400000).toISOString(), recurring: true },
      { name: "Insurance premium", amount: 1650, dueDate: new Date(Date.now() + 12 * 86400000).toISOString(), recurring: true },
    ],
    budgetHealth: {
      marketing: { spent: 8700, limit: 10000, percentage: 87 },
      operations: { spent: 12300, limit: 20000, percentage: 61.5 },
      payroll: { spent: 45000, limit: 50000, percentage: 90 },
    },
    reserves: 85_000,
    monthlyBurnRate: 62_000,
    runwayMonths: 2.3,
  };
}

function scaffoldHousehold(): HouseholdContext {
  return {
    totalMembers: 4,
    activeTasks: 18,
    overdueTasks: 3,
    loadBalance: 64,
    upcomingEvents: [
      { title: "School pickup", date: new Date(Date.now() + 86400000).toISOString(), memberIds: ["m1"] },
      { title: "Dentist appointment", date: new Date(Date.now() + 2 * 86400000).toISOString(), memberIds: ["m2"] },
    ],
    topContributor: "You",
    weeklyBusyScore: 71,
  };
}

function scaffoldObligations(): ObligationItem[] {
  const now = Date.now();
  return [
    { id: "obl-1", domain: "business", title: "Q2 deliverable review", description: "Review and submit Meridian Corp deliverables", dueDate: new Date(now + 3 * 86400000).toISOString(), urgency: "high", recurring: false, status: "pending" },
    { id: "obl-2", domain: "finance", title: "Quarterly tax filing", description: "Prepare and file quarterly estimated taxes", dueDate: new Date(now + 10 * 86400000).toISOString(), urgency: "high", recurring: true, status: "pending" },
    { id: "obl-3", domain: "household", title: "School registration deadline", description: "Complete fall enrollment forms", dueDate: new Date(now + 5 * 86400000).toISOString(), urgency: "medium", recurring: false, status: "in-progress" },
    { id: "obl-4", domain: "legal", title: "Contract renewal — Apex", description: "Review and sign updated service agreement", dueDate: new Date(now + 7 * 86400000).toISOString(), urgency: "medium", recurring: false, status: "pending" },
    { id: "obl-5", domain: "health", title: "Annual physical", description: "Scheduled annual check-up", dueDate: new Date(now + 14 * 86400000).toISOString(), urgency: "low", recurring: true, status: "pending" },
  ];
}

function scaffoldTiming(): TimingContext {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);
  return {
    calendarDensity: 68,
    busyScore: 72,
    optimalWindows: [
      { start: `${tomorrow.toISOString().split("T")[0]}T09:00:00`, end: `${tomorrow.toISOString().split("T")[0]}T11:00:00`, quality: "focus" },
      { start: `${tomorrow.toISOString().split("T")[0]}T14:00:00`, end: `${tomorrow.toISOString().split("T")[0]}T15:30:00`, quality: "light" },
    ],
    conflictsDetected: 1,
    nextFreeBlock: `${tomorrow.toISOString().split("T")[0]}T09:00:00`,
    peakProductivityHours: ["09:00-11:00", "14:00-16:00"],
  };
}

// ── Cross-Domain Intelligence ───────────────────────────────────

function evaluateCrossDomainIntelligence(ctx: Omit<LifeContext, "crossDomainInsights" | "generatedAt">): string[] {
  const insights: string[] = [];

  // Money + Business
  if (ctx.money.runwayMonths < 3 && ctx.business.overdueFollowups > 0) {
    insights.push(`Cash runway is ${ctx.money.runwayMonths.toFixed(1)} months — prioritize closing ${ctx.business.overdueFollowups} overdue follow-ups to accelerate revenue.`);
  }

  // Business + Timing
  if (ctx.business.winRate < 0.4 && ctx.timing.busyScore > 70) {
    insights.push(`Win rate (${Math.round(ctx.business.winRate * 100)}%) is below target and your schedule is packed. Consider blocking focus time for deal strategy.`);
  }

  // Household + Timing
  if (ctx.household.overdueTasks > 2 && ctx.timing.calendarDensity > 60) {
    insights.push(`${ctx.household.overdueTasks} household tasks are overdue with a busy calendar. Consider delegating to balance load.`);
  }

  // Money + Household
  const highBudgets = Object.entries(ctx.money.budgetHealth).filter(([, b]) => b.percentage > 85);
  if (highBudgets.length > 0) {
    insights.push(`${highBudgets.length} budget category(ies) above 85% — ${highBudgets.map(([k]) => k).join(", ")}. Review discretionary spending.`);
  }

  // Obligations urgency
  const criticalObligations = ctx.obligations.filter((o) => o.urgency === "critical" || (o.urgency === "high" && o.status === "overdue"));
  if (criticalObligations.length > 0) {
    insights.push(`${criticalObligations.length} critical/overdue obligation(s) need immediate attention.`);
  }

  return insights;
}

// ── Life Intelligence Engine ────────────────────────────────────

export class LifeIntelligenceEngine {
  private preferences: PreferenceEntry[] = [];
  private cachedContext: LifeContext | null = null;
  private cacheExpiry = 0;
  private readonly CACHE_TTL = 60_000; // 1 minute

  constructor(private memory?: MemoryService) {}

  // ── Build Full Context ──────────────────────────────────────────

  buildContext(): LifeContext {
    if (this.cachedContext && Date.now() < this.cacheExpiry) {
      return this.cachedContext;
    }

    const business = this.getBusinessSnapshot();
    const money = this.getMoneySnapshot();
    const household = this.getHouseholdSnapshot();
    const obligations = this.getObligations();
    const timing = this.getTimingIntelligence();
    const preferences = this.getPreferences();

    const partial = { business, money, household, obligations, timing, preferences };
    const crossDomainInsights = evaluateCrossDomainIntelligence(partial);

    const context: LifeContext = {
      ...partial,
      crossDomainInsights,
      generatedAt: Date.now(),
    };

    this.cachedContext = context;
    this.cacheExpiry = Date.now() + this.CACHE_TTL;
    return context;
  }

  // ── Domain Snapshots ────────────────────────────────────────────

  getBusinessSnapshot(): BusinessContext {
    return scaffoldBusiness();
  }

  getMoneySnapshot(): MoneyContext {
    return scaffoldMoney();
  }

  getHouseholdSnapshot(): HouseholdContext {
    return scaffoldHousehold();
  }

  getObligations(): ObligationItem[] {
    return scaffoldObligations();
  }

  getTimingIntelligence(): TimingContext {
    return scaffoldTiming();
  }

  // ── Preferences ─────────────────────────────────────────────────

  learnPreference(key: string, value: unknown, domain: string, source: PreferenceEntry["source"] = "observed"): PreferenceEntry {
    const existing = this.preferences.find((p) => p.key === key && p.domain === domain);
    if (existing) {
      existing.value = value;
      existing.confidence = Math.min(1, existing.confidence + 0.1);
      existing.lastConfirmedAt = Date.now();
      existing.source = source;

      // Persist to memory if available
      this.memory?.store(`preference.${domain}.${key}`, value, {
        source: "life-intelligence",
        privacyTier: "confidential",
        confidence: existing.confidence,
        tags: ["preference", domain],
      });

      return existing;
    }

    const entry: PreferenceEntry = {
      key,
      value,
      confidence: source === "explicit" ? 1.0 : 0.6,
      source,
      domain,
      learnedAt: Date.now(),
      lastConfirmedAt: Date.now(),
    };
    this.preferences.push(entry);

    this.memory?.store(`preference.${domain}.${key}`, value, {
      source: "life-intelligence",
      privacyTier: "confidential",
      confidence: entry.confidence,
      tags: ["preference", domain],
    });

    return entry;
  }

  getPreferences(domain?: string): PreferenceEntry[] {
    if (domain) return this.preferences.filter((p) => p.domain === domain);
    return [...this.preferences];
  }

  // ── Recommendations ─────────────────────────────────────────────

  getRecommendations(): string[] {
    const ctx = this.buildContext();
    const recs: string[] = [...ctx.crossDomainInsights];

    // Timing-based recommendations
    if (ctx.timing.conflictsDetected > 0) {
      recs.push(`${ctx.timing.conflictsDetected} scheduling conflict(s) detected. Review your calendar.`);
    }

    // Obligation-based
    const upcoming = ctx.obligations.filter((o) => {
      const due = new Date(o.dueDate).getTime();
      return due - Date.now() < 3 * 86400000 && o.status !== "completed";
    });
    if (upcoming.length > 0) {
      recs.push(`${upcoming.length} obligation(s) due within 3 days: ${upcoming.map((o) => o.title).join(", ")}.`);
    }

    return recs;
  }

  // ── Briefings ─────────────────────────────────────────────────

  summarizeDay(): DayBriefing {
    const ctx = this.buildContext();
    const today = new Date().toISOString().split("T")[0];

    const urgentItems = ctx.obligations.filter(
      (o) => (o.urgency === "high" || o.urgency === "critical") && o.status !== "completed"
    );

    const moneyAlert = ctx.money.runwayMonths < 3
      ? `Cash runway: ${ctx.money.runwayMonths.toFixed(1)} months. Monitor spending closely.`
      : undefined;

    const businessHighlight = ctx.business.overdueFollowups > 0
      ? `${ctx.business.overdueFollowups} overdue follow-ups need attention.`
      : `Pipeline healthy — ${ctx.business.activeLeads} active leads.`;

    const householdNote = ctx.household.overdueTasks > 0
      ? `${ctx.household.overdueTasks} overdue household tasks.`
      : undefined;

    const timingSummary = `Calendar is ${ctx.timing.calendarDensity}% full. Next free block: ${ctx.timing.nextFreeBlock}.`;

    return {
      date: today,
      headline: `${urgentItems.length} urgent item${urgentItems.length !== 1 ? "s" : ""} today. Busy score: ${ctx.timing.busyScore}/100.`,
      urgentItems,
      moneyAlert,
      businessHighlight,
      householdNote,
      timingSummary,
      recommendations: this.getRecommendations().slice(0, 5),
    };
  }

  summarizeWeek(): WeekBriefing {
    const ctx = this.buildContext();
    const weekOf = new Date().toISOString().split("T")[0];

    return {
      weekOf,
      headline: `Week overview: ${ctx.obligations.length} obligations, ${ctx.business.activeLeads} active leads, $${ctx.money.safeToSpend.toLocaleString()} safe to spend.`,
      obligationsSummary: {
        total: ctx.obligations.length,
        completed: ctx.obligations.filter((o) => o.status === "completed").length,
        overdue: ctx.obligations.filter((o) => o.status === "overdue").length,
      },
      businessMetrics: {
        leadsContacted: Math.round(ctx.business.activeLeads * 0.3),
        dealsClosed: Math.round(ctx.business.activeLeads * ctx.business.winRate * 0.1),
        revenue: Math.round(ctx.business.revenueVelocity * 10000),
      },
      moneyMetrics: {
        totalSpent: Object.values(ctx.money.budgetHealth).reduce((sum, b) => sum + b.spent, 0),
        budgetHealth: Math.round(
          100 - Object.values(ctx.money.budgetHealth).reduce((sum, b) => sum + b.percentage, 0) / Object.keys(ctx.money.budgetHealth).length
        ),
        billsPaid: 0,
      },
      householdMetrics: {
        tasksCompleted: ctx.household.activeTasks - ctx.household.overdueTasks,
        loadBalance: ctx.household.loadBalance,
      },
      topRecommendations: this.getRecommendations().slice(0, 3),
    };
  }

  // ── Cache Control ─────────────────────────────────────────────

  invalidateCache(): void {
    this.cachedContext = null;
    this.cacheExpiry = 0;
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createLifeIntelligenceEngine(memory?: MemoryService): LifeIntelligenceEngine {
  return new LifeIntelligenceEngine(memory);
}
