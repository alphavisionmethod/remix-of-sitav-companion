// ═══════════════════════════════════════════════════════════════
// SITA OS — Strategic Planning Engine
// OKRs, goals, milestones, timeline projections, strategy docs
// ═══════════════════════════════════════════════════════════════

export type GoalStatus = "not_started" | "on_track" | "at_risk" | "behind" | "completed" | "paused";
export type GoalTimeframe = "weekly" | "monthly" | "quarterly" | "annual";
export type MilestoneStatus = "upcoming" | "in_progress" | "completed" | "missed" | "deferred";

export interface StrategicGoal {
  id: string;
  title: string;
  description: string;
  timeframe: GoalTimeframe;
  status: GoalStatus;
  progress: number; // 0-100
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  targetDate: string;
  ownerName: string;
  keyResults: KeyResult[];
  advisorInsight?: string;
  riskFactors: string[];
  createdAt: number;
}

export interface KeyResult {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  progress: number;
  status: GoalStatus;
  lastUpdated: number;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description: string;
  targetDate: string;
  status: MilestoneStatus;
  completedDate?: string;
  dependencies: string[];
  impact: "low" | "medium" | "high" | "critical";
}

export interface TimelineProjection {
  date: string;
  optimistic: number;
  realistic: number;
  pessimistic: number;
  actual?: number;
}

export interface StrategyDocument {
  id: string;
  title: string;
  generatedAt: number;
  sections: StrategySection[];
  advisorContributions: Array<{ advisorId: string; advisorName: string; contribution: string }>;
}

export interface StrategySection {
  heading: string;
  content: string;
  dataPoints?: Array<{ label: string; value: string }>;
}

export interface PlanningSnapshot {
  goals: StrategicGoal[];
  milestones: Milestone[];
  overallProgress: number;
  goalsOnTrack: number;
  goalsAtRisk: number;
  goalsBehind: number;
  nextMilestone?: Milestone;
  projections: TimelineProjection[];
}

// ── Demo Data ───────────────────────────────────────────────────

const DEFAULT_GOALS: StrategicGoal[] = [
  {
    id: "g1",
    title: "Grow Monthly Revenue to $75K",
    description: "Increase recurring + project revenue through new client acquisition and upsells",
    timeframe: "quarterly",
    status: "on_track",
    progress: 68,
    targetValue: 75000,
    currentValue: 51000,
    unit: "$",
    startDate: "2026-01-01",
    targetDate: "2026-06-30",
    ownerName: "You",
    keyResults: [
      { id: "kr1", title: "Close 5 new clients", targetValue: 5, currentValue: 3, unit: "clients", progress: 60, status: "on_track", lastUpdated: Date.now() - 86400000 },
      { id: "kr2", title: "Upsell 3 existing accounts", targetValue: 3, currentValue: 2, unit: "accounts", progress: 67, status: "on_track", lastUpdated: Date.now() - 172800000 },
      { id: "kr3", title: "Reduce churn below 5%", targetValue: 5, currentValue: 7, unit: "%", progress: 40, status: "at_risk", lastUpdated: Date.now() - 259200000 },
    ],
    advisorInsight: "Revenue Advisor: Focus on upselling Nova Inc and Cascade Group — both show expansion signals. Prioritize churn reduction for Meridian LLC.",
    riskFactors: ["Client concentration risk", "Seasonal slowdown in Q2"],
    createdAt: Date.now() - 7776000000,
  },
  {
    id: "g2",
    title: "Improve Cash Reserves to 3-Month Runway",
    description: "Build financial resilience by growing cash reserves to cover 3 months of operating costs",
    timeframe: "quarterly",
    status: "at_risk",
    progress: 45,
    targetValue: 54000,
    currentValue: 24300,
    unit: "$",
    startDate: "2026-01-01",
    targetDate: "2026-06-30",
    ownerName: "You",
    keyResults: [
      { id: "kr4", title: "Collect all overdue invoices", targetValue: 20900, currentValue: 8400, unit: "$", progress: 40, status: "at_risk", lastUpdated: Date.now() - 86400000 },
      { id: "kr5", title: "Reduce monthly expenses by 10%", targetValue: 10, currentValue: 4, unit: "%", progress: 40, status: "behind", lastUpdated: Date.now() - 432000000 },
      { id: "kr6", title: "Set up auto-save 15% of revenue", targetValue: 15, currentValue: 15, unit: "%", progress: 100, status: "completed", lastUpdated: Date.now() - 604800000 },
    ],
    advisorInsight: "Cash Flow Guardian: The overdue collection from Atlas Corp ($12,500) is the biggest lever. Recommend escalation protocol within 48 hours.",
    riskFactors: ["Atlas Corp payment uncertainty", "Rising software costs"],
    createdAt: Date.now() - 7776000000,
  },
  {
    id: "g3",
    title: "Launch New Service Line",
    description: "Design and launch a premium consulting tier to increase average deal value",
    timeframe: "quarterly",
    status: "on_track",
    progress: 55,
    targetValue: 100,
    currentValue: 55,
    unit: "%",
    startDate: "2026-02-01",
    targetDate: "2026-05-31",
    ownerName: "You",
    keyResults: [
      { id: "kr7", title: "Complete service design", targetValue: 100, currentValue: 100, unit: "%", progress: 100, status: "completed", lastUpdated: Date.now() - 1209600000 },
      { id: "kr8", title: "Build pricing model", targetValue: 100, currentValue: 80, unit: "%", progress: 80, status: "on_track", lastUpdated: Date.now() - 259200000 },
      { id: "kr9", title: "Sign 2 pilot clients", targetValue: 2, currentValue: 0, unit: "clients", progress: 0, status: "not_started", lastUpdated: Date.now() },
    ],
    advisorInsight: "Strategy Advisor: Target Nova Inc and one new prospect for pilot. Position as 'Strategic Partner' tier, not just premium.",
    riskFactors: ["Market validation needed", "Pricing sensitivity"],
    createdAt: Date.now() - 5184000000,
  },
  {
    id: "g4",
    title: "Achieve 90% Client Satisfaction",
    description: "Raise average client satisfaction score to 90+ through proactive engagement",
    timeframe: "quarterly",
    status: "behind",
    progress: 33,
    targetValue: 90,
    currentValue: 72,
    unit: "pts",
    startDate: "2026-01-01",
    targetDate: "2026-06-30",
    ownerName: "You",
    keyResults: [
      { id: "kr10", title: "Monthly check-in calls with all clients", targetValue: 100, currentValue: 40, unit: "%", progress: 40, status: "behind", lastUpdated: Date.now() - 172800000 },
      { id: "kr11", title: "Resolve all open issues within 48h", targetValue: 100, currentValue: 60, unit: "%", progress: 60, status: "at_risk", lastUpdated: Date.now() - 86400000 },
      { id: "kr12", title: "Launch client feedback portal", targetValue: 100, currentValue: 0, unit: "%", progress: 0, status: "not_started", lastUpdated: Date.now() },
    ],
    advisorInsight: "Client Success Advisor: Meridian LLC satisfaction at 55 is the biggest drag. Prioritize a relationship recovery meeting this week.",
    riskFactors: ["Meridian LLC at risk of churning", "Limited team bandwidth"],
    createdAt: Date.now() - 7776000000,
  },
];

const DEFAULT_MILESTONES: Milestone[] = [
  { id: "m1", goalId: "g1", title: "Close 3rd new client", description: "Sign contract with qualified prospect", targetDate: "2026-04-20", status: "completed", completedDate: "2026-04-12", dependencies: [], impact: "high" },
  { id: "m2", goalId: "g1", title: "Launch referral program", description: "Activate client referral incentive system", targetDate: "2026-04-30", status: "in_progress", dependencies: [], impact: "medium" },
  { id: "m3", goalId: "g2", title: "Collect Atlas Corp invoice", description: "Resolve overdue payment of $12,500", targetDate: "2026-04-25", status: "upcoming", dependencies: [], impact: "critical" },
  { id: "m4", goalId: "g3", title: "Finalize pricing model", description: "Complete premium tier pricing and packaging", targetDate: "2026-04-22", status: "in_progress", dependencies: [], impact: "high" },
  { id: "m5", goalId: "g3", title: "First pilot client signed", description: "Secure commitment from pilot client", targetDate: "2026-05-15", status: "upcoming", dependencies: ["m4"], impact: "critical" },
  { id: "m6", goalId: "g4", title: "Meridian LLC recovery meeting", description: "In-person meeting to address concerns", targetDate: "2026-04-18", status: "upcoming", dependencies: [], impact: "high" },
  { id: "m7", goalId: "g1", title: "Hit $60K monthly revenue", description: "Intermediate revenue milestone", targetDate: "2026-05-01", status: "upcoming", dependencies: ["m1"], impact: "high" },
  { id: "m8", goalId: "g4", title: "Client feedback portal live", description: "Launch self-service feedback system", targetDate: "2026-05-30", status: "upcoming", dependencies: [], impact: "medium" },
];

// ── Engine ──────────────────────────────────────────────────────

export class StrategicPlanningEngine {
  private goals: StrategicGoal[] = [...DEFAULT_GOALS];
  private milestones: Milestone[] = [...DEFAULT_MILESTONES];

  getGoals(): StrategicGoal[] {
    return [...this.goals];
  }

  getGoal(goalId: string): StrategicGoal | undefined {
    return this.goals.find(g => g.id === goalId);
  }

  getMilestones(goalId?: string): Milestone[] {
    if (goalId) return this.milestones.filter(m => m.goalId === goalId);
    return [...this.milestones];
  }

  getSnapshot(): PlanningSnapshot {
    const goals = this.getGoals();
    const milestones = this.getMilestones();
    const overallProgress = goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0;
    const goalsOnTrack = goals.filter(g => g.status === "on_track" || g.status === "completed").length;
    const goalsAtRisk = goals.filter(g => g.status === "at_risk").length;
    const goalsBehind = goals.filter(g => g.status === "behind").length;
    const upcoming = milestones
      .filter(m => m.status === "upcoming" || m.status === "in_progress")
      .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());

    return {
      goals,
      milestones,
      overallProgress,
      goalsOnTrack,
      goalsAtRisk,
      goalsBehind,
      nextMilestone: upcoming[0],
      projections: this.generateProjections(),
    };
  }

  updateGoalProgress(goalId: string, progress: number): void {
    const goal = this.goals.find(g => g.id === goalId);
    if (goal) {
      goal.progress = Math.min(100, Math.max(0, progress));
      goal.currentValue = Math.round(goal.targetValue * (progress / 100));
      goal.status = progress >= 100 ? "completed" : progress >= 60 ? "on_track" : progress >= 30 ? "at_risk" : "behind";
    }
  }

  updateMilestoneStatus(milestoneId: string, status: MilestoneStatus): void {
    const milestone = this.milestones.find(m => m.id === milestoneId);
    if (milestone) {
      milestone.status = status;
      if (status === "completed") milestone.completedDate = new Date().toISOString().split("T")[0];
    }
  }

  addGoal(goal: Omit<StrategicGoal, "id" | "createdAt" | "keyResults" | "riskFactors">): StrategicGoal {
    const newGoal: StrategicGoal = {
      ...goal,
      id: `g-${Date.now()}`,
      keyResults: [],
      riskFactors: [],
      createdAt: Date.now(),
    };
    this.goals.push(newGoal);
    return newGoal;
  }

  generateProjections(): TimelineProjection[] {
    const projections: TimelineProjection[] = [];
    const now = new Date();
    for (let i = -3; i <= 6; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() + i);
      const monthStr = date.toISOString().split("T")[0].slice(0, 7);
      const base = 42000 + i * 3500;
      projections.push({
        date: monthStr,
        optimistic: Math.round(base * 1.25),
        realistic: Math.round(base),
        pessimistic: Math.round(base * 0.75),
        actual: i <= 0 ? Math.round(base * (0.85 + Math.random() * 0.3)) : undefined,
      });
    }
    return projections;
  }

  generateStrategyDocument(): StrategyDocument {
    const snapshot = this.getSnapshot();
    return {
      id: `strat-${Date.now()}`,
      title: `Strategic Review — ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      generatedAt: Date.now(),
      sections: [
        {
          heading: "Executive Summary",
          content: `Overall strategic progress is at ${snapshot.overallProgress}%. ${snapshot.goalsOnTrack} goals are on track, ${snapshot.goalsAtRisk} are at risk, and ${snapshot.goalsBehind} are behind schedule. The next critical milestone is ${snapshot.nextMilestone?.title ?? "none pending"}.`,
          dataPoints: [
            { label: "Overall Progress", value: `${snapshot.overallProgress}%` },
            { label: "Goals On Track", value: `${snapshot.goalsOnTrack}` },
            { label: "Goals At Risk", value: `${snapshot.goalsAtRisk}` },
          ],
        },
        {
          heading: "Revenue & Growth",
          content: "Revenue growth trajectory is positive but requires acceleration in client acquisition. The upsell pipeline shows strong signals from Nova Inc and Cascade Group. Churn reduction remains the most impactful lever.",
          dataPoints: [
            { label: "Current Monthly Revenue", value: "$51,000" },
            { label: "Target", value: "$75,000" },
            { label: "Gap", value: "$24,000" },
          ],
        },
        {
          heading: "Financial Health",
          content: "Cash reserves are below target. The single largest action item is collecting the Atlas Corp overdue invoice ($12,500). Auto-save mechanism is operational at 15% of revenue.",
          dataPoints: [
            { label: "Current Reserves", value: "$24,300" },
            { label: "Target (3mo runway)", value: "$54,000" },
            { label: "Overdue Receivables", value: "$20,900" },
          ],
        },
        {
          heading: "Client Relationships",
          content: "Client satisfaction averaging 72 points, below the 90-point target. Meridian LLC is the primary concern at 55 points. Proactive engagement is needed across all accounts.",
        },
        {
          heading: "Recommended Priorities (Next 30 Days)",
          content: "1. Collect Atlas Corp overdue invoice\n2. Schedule Meridian LLC recovery meeting\n3. Finalize premium service pricing\n4. Close 4th and 5th new client leads\n5. Launch referral program",
        },
      ],
      advisorContributions: [
        { advisorId: "revenue-advisor", advisorName: "Revenue Advisor", contribution: "Focus acquisition on high-fit prospects from referral and LinkedIn channels" },
        { advisorId: "cash-flow-guardian", advisorName: "Cash Flow Guardian", contribution: "Escalate Atlas Corp collection and review expense reduction targets" },
        { advisorId: "strategy-advisor", advisorName: "Strategy Advisor", contribution: "Position new service line as premium consulting tier with clear differentiation" },
        { advisorId: "client-success", advisorName: "Client Success Advisor", contribution: "Implement weekly pulse checks for all clients, priority on at-risk accounts" },
      ],
    };
  }
}

// ── Singleton ───────────────────────────────────────────────────

let instance: StrategicPlanningEngine | null = null;

export function getStrategicPlanningEngine(): StrategicPlanningEngine {
  if (!instance) instance = new StrategicPlanningEngine();
  return instance;
}
