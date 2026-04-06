import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
// SITA OS — Life Goal Tracker
// Goal-based planning connecting money, time, and skills

export type GoalCategory = "financial" | "career" | "personal" | "family" | "health" | "education";
export type GoalStatus = "planning" | "active" | "on-track" | "at-risk" | "paused" | "completed" | "abandoned";

export interface LifeGoal {
  goalId: string;
  memberId: string;
  title: string;
  category: GoalCategory;
  description: string;
  targetDate: string;
  status: GoalStatus;
  milestones: Milestone[];
  resources: ResourceRequirement;
  progressScore: number;
  velocity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  milestoneId: string;
  title: string;
  targetDate: string;
  weight: number;
  completionPercent: number;
  completed: boolean;
  blockers: string[];
}

export interface ResourceRequirement {
  moneyCents: number;
  moneyAllocatedCents: number;
  timeHoursPerWeek: number;
  skills: string[];
  connections: string[];
}

export interface GoalConflict {
  goalA: string;
  goalB: string;
  conflictType: "money" | "time" | "skills" | "timeline";
  severity: "low" | "medium" | "high";
  description: string;
  resolution: string;
}

export interface HouseholdGoalAlignment {
  synergies: Array<{ goals: string[]; description: string; benefit: string }>;
  conflicts: GoalConflict[];
  overallAlignmentScore: number;
}

export interface GoalDecomposition {
  goalId: string;
  quarterlyMilestones: Milestone[];
  weeklyActions: string[];
  estimatedCostCents: number;
  estimatedHours: number;
  criticalPath: string[];
}

export class LifeGoalTracker {
  private goals: Map<string, LifeGoal> = new Map();

  createGoal(params: {
    memberId: string;
    title: string;
    category: GoalCategory;
    description: string;
    targetDate: string;
    resourcesNeeded: ResourceRequirement;
  }): LifeGoal {
    const goal: LifeGoal = {
      goalId: crypto.randomUUID(),
      memberId: params.memberId,
      title: params.title,
      category: params.category,
      description: params.description,
      targetDate: params.targetDate,
      status: "planning",
      milestones: [],
      resources: params.resourcesNeeded,
      progressScore: 0,
      velocity: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.goals.set(goal.goalId, goal);
    return goal;
  }

  decomposeGoal(goalId: string): GoalDecomposition | null {
    const goal = this.goals.get(goalId);
    if (!goal) return null;

    const now = new Date();
    const target = new Date(goal.targetDate);
    const totalMonths = Math.max(1, (target.getTime() - now.getTime()) / (30 * 24 * 60 * 60 * 1000));
    const quarters = Math.ceil(totalMonths / 3);

    const quarterlyMilestones: Milestone[] = [];
    for (let q = 0; q < quarters; q++) {
      const milestoneDate = new Date(now);
      milestoneDate.setMonth(milestoneDate.getMonth() + (q + 1) * 3);
      const pct = ((q + 1) / quarters) * 100;
      quarterlyMilestones.push({
        milestoneId: `${goalId}-q${q + 1}`,
        title: `Q${q + 1}: Reach ${Math.round(pct)}% of goal`,
        targetDate: milestoneDate.toISOString().split("T")[0],
        weight: 1 / quarters,
        completionPercent: 0,
        completed: false,
        blockers: [],
      });
    }

    const weeklyActions = this.generateWeeklyActions(goal.category);
    const costPerQuarter = Math.round(goal.resources.moneyCents / quarters);
    const hoursPerQuarter = goal.resources.timeHoursPerWeek * 13;

    return {
      goalId,
      quarterlyMilestones,
      weeklyActions,
      estimatedCostCents: goal.resources.moneyCents,
      estimatedHours: hoursPerQuarter * quarters,
      criticalPath: quarterlyMilestones.map((m) => m.title),
    };
  }

  updateMilestone(goalId: string, milestoneId: string, completionPercent: number): LifeGoal | null {
    const goal = this.goals.get(goalId);
    if (!goal) return null;

    const milestone = goal.milestones.find((m) => m.milestoneId === milestoneId);
    if (milestone) {
      milestone.completionPercent = Math.min(100, Math.max(0, completionPercent));
      milestone.completed = milestone.completionPercent >= 100;
    }

    goal.progressScore = this.calculateProgressScore(goal);
    goal.velocity = this.calculateVelocity(goal);
    goal.status = this.determineStatus(goal);
    goal.updatedAt = new Date().toISOString();
    return goal;
  }

  detectConflicts(memberGoals: LifeGoal[]): GoalConflict[] {
    const conflicts: GoalConflict[] = [];

    for (let i = 0; i < memberGoals.length; i++) {
      for (let j = i + 1; j < memberGoals.length; j++) {
        const a = memberGoals[i];
        const b = memberGoals[j];

        // Money conflict
        const totalMoneyNeeded = a.resources.moneyCents + b.resources.moneyCents;
        const totalAllocated = a.resources.moneyAllocatedCents + b.resources.moneyAllocatedCents;
        if (totalMoneyNeeded > totalAllocated * 1.5) {
          conflicts.push({
            goalA: a.title, goalB: b.title,
            conflictType: "money",
            severity: totalMoneyNeeded > totalAllocated * 3 ? "high" : "medium",
            description: `Combined cost of $${(totalMoneyNeeded / 100).toFixed(0)} exceeds allocated budget of $${(totalAllocated / 100).toFixed(0)}`,
            resolution: "Stagger timelines or increase savings allocation",
          });
        }

        // Time conflict
        const totalHours = a.resources.timeHoursPerWeek + b.resources.timeHoursPerWeek;
        if (totalHours > 30) {
          conflicts.push({
            goalA: a.title, goalB: b.title,
            conflictType: "time",
            severity: totalHours > 50 ? "high" : "medium",
            description: `Combined time commitment of ${totalHours} hrs/week may be unsustainable`,
            resolution: "Reduce scope or alternate focus periods",
          });
        }
      }
    }
    return conflicts;
  }

  analyzeHouseholdAlignment(allGoals: LifeGoal[]): HouseholdGoalAlignment {
    const byMember = new Map<string, LifeGoal[]>();
    allGoals.forEach((g) => {
      const list = byMember.get(g.memberId) || [];
      list.push(g);
      byMember.set(g.memberId, list);
    });

    const synergies: Array<{ goals: string[]; description: string; benefit: string }> = [];
    const goalsByCategory = new Map<GoalCategory, LifeGoal[]>();
    allGoals.forEach((g) => {
      const list = goalsByCategory.get(g.category) || [];
      list.push(g);
      goalsByCategory.set(g.category, list);
    });

    goalsByCategory.forEach((goals, category) => {
      if (goals.length > 1 && new Set(goals.map((g) => g.memberId)).size > 1) {
        synergies.push({
          goals: goals.map((g) => g.title),
          description: `Multiple family members have ${category} goals`,
          benefit: "Shared resources, mutual accountability, group discounts",
        });
      }
    });

    const allConflicts = this.detectConflicts(allGoals);
    const maxPossibleScore = allGoals.length * 10;
    const conflictPenalty = allConflicts.reduce((p, c) => p + (c.severity === "high" ? 3 : c.severity === "medium" ? 2 : 1), 0);
    const synergyBonus = synergies.length * 2;
    const alignment = Math.max(0, Math.min(100, Math.round(((maxPossibleScore - conflictPenalty + synergyBonus) / maxPossibleScore) * 100)));

    return { synergies, conflicts: allConflicts, overallAlignmentScore: alignment };
  }

  getGoal(goalId: string): LifeGoal | undefined { return this.goals.get(goalId); }
  getMemberGoals(memberId: string): LifeGoal[] { return [...this.goals.values()].filter((g) => g.memberId === memberId); }
  getAllGoals(): LifeGoal[] { return [...this.goals.values()]; }

  private calculateProgressScore(goal: LifeGoal): number {
    if (goal.milestones.length === 0) return 0;
    return Math.round(goal.milestones.reduce((s, m) => s + m.weight * m.completionPercent, 0));
  }

  private calculateVelocity(goal: LifeGoal): number {
    const now = new Date();
    const created = new Date(goal.createdAt);
    const weeksElapsed = Math.max(1, (now.getTime() - created.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.round((goal.progressScore / weeksElapsed) * 10) / 10;
  }

  private determineStatus(goal: LifeGoal): GoalStatus {
    if (goal.progressScore >= 100) return "completed";
    const now = new Date();
    const target = new Date(goal.targetDate);
    const totalTime = target.getTime() - new Date(goal.createdAt).getTime();
    const elapsed = now.getTime() - new Date(goal.createdAt).getTime();
    const expectedProgress = totalTime > 0 ? (elapsed / totalTime) * 100 : 0;
    if (goal.progressScore < expectedProgress * 0.7) return "at-risk";
    return "on-track";
  }

  private generateWeeklyActions(category: GoalCategory): string[] {
    const actions: Record<GoalCategory, string[]> = {
      financial: ["Review budget vs actual spending", "Transfer to savings", "Check investment performance", "Research one new opportunity"],
      career: ["Complete one skill-building activity", "Network with one contact", "Update portfolio/resume", "Reflect on weekly progress"],
      personal: ["Practice core habit 5x this week", "Journal about progress", "Seek feedback from accountability partner", "Celebrate one small win"],
      family: ["Family check-in meeting", "Plan one shared activity", "Review shared budget", "Discuss progress toward family goals"],
      health: ["Exercise 4x this week", "Meal prep for healthy eating", "Track key health metrics", "Schedule preventive care"],
      education: ["Study for 5+ hours", "Complete one assignment/module", "Practice new skill", "Review and revise notes"],
    };
    return actions[category] || actions.personal;
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("life-growth/life-goal-tracker", this._serializeState());

  private _serializeState(): Record<string, unknown> {
    return {
      goals: Array.from(this.goals.entries()),
    };
  }

  hydrateState(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.goals) this.goals = new Map(state.goals as any);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("life-growth/life-goal-tracker");
    if (state) this.hydrateState(state as Record<string, unknown>);
  }
}

export function createLifeGoalTracker(): LifeGoalTracker {
  return new LifeGoalTracker();


}
