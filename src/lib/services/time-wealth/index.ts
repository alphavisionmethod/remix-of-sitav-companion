// ═══════════════════════════════════════════════════════════════
// SITA OS — Time-Wealth Accounting
// Dollar-value time ROI tracking for every hour
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface TimeWealthProfile {
  annualIncome: number;
  investmentReturns: number;
  passiveIncome: number;
  workHoursPerWeek: number;
  adminHoursPerWeek: number;
  weeksPerYear: number;
}

export interface TimeROIResult {
  activity: string;
  hoursSpent: number;
  dollarValue: number;
  hourlyWorth: number;
  roi: number; // >1 = worth it, <1 = not worth it
  verdict: 'excellent' | 'good' | 'marginal' | 'poor';
}

export interface TimeLeak {
  activity: string;
  weeklyHours: number;
  costPerWeek: number;
  costPerYear: number;
  suggestion: string;
}

export interface DelegationAdvice {
  task: string;
  yourCost: number; // doing it yourself in $ (time × hourlyWorth)
  delegationCost: number;
  savings: number;
  verdict: 'delegate' | 'do-yourself' | 'automate';
}

export interface TimeDebt {
  category: string;
  deferredHours: number;
  compoundingRate: number; // how much worse it gets per month
  currentCost: number;
  projectedCost6Mo: number;
}

export interface LifetimeAllocation {
  category: string;
  hoursSpent: number;
  percentage: number;
  idealPercentage: number;
  gap: number;
}

export class TimeWealthEngine {
  private profile: TimeWealthProfile;
  private activities: Map<string, { hours: number; value: number }[]> = new Map();
  private debts: TimeDebt[] = [];

  constructor(profile: TimeWealthProfile) {
    this.profile = profile;
  }

  calculateHourlyWorth(): number {
    const totalIncome = this.profile.annualIncome + this.profile.investmentReturns + this.profile.passiveIncome;
    const totalHours = (this.profile.workHoursPerWeek + this.profile.adminHoursPerWeek) * this.profile.weeksPerYear;
    return totalHours > 0 ? totalIncome / totalHours : 0;
  }

  evaluateTimeROI(activity: string, hoursSpent: number, valueGenerated: number): TimeROIResult {
    const hourlyWorth = this.calculateHourlyWorth();
    const timeCost = hoursSpent * hourlyWorth;
    const roi = timeCost > 0 ? valueGenerated / timeCost : 0;

    this.activities.set(activity, [
      ...(this.activities.get(activity) || []),
      { hours: hoursSpent, value: valueGenerated },
    ]);

    return {
      activity, hoursSpent, dollarValue: Math.round(valueGenerated),
      hourlyWorth: Math.round(hourlyWorth),
      roi: Math.round(roi * 100) / 100,
      verdict: roi >= 2 ? 'excellent' : roi >= 1 ? 'good' : roi >= 0.5 ? 'marginal' : 'poor',
    };
  }

  detectTimeLeaks(activities: { name: string; weeklyHours: number; valuePerHour: number }[]): TimeLeak[] {
    const hourlyWorth = this.calculateHourlyWorth();
    return activities
      .filter(a => a.valuePerHour < hourlyWorth * 0.5)
      .map(a => ({
        activity: a.name,
        weeklyHours: a.weeklyHours,
        costPerWeek: Math.round((hourlyWorth - a.valuePerHour) * a.weeklyHours),
        costPerYear: Math.round((hourlyWorth - a.valuePerHour) * a.weeklyHours * 52),
        suggestion: a.valuePerHour < hourlyWorth * 0.2
          ? `Delegate or automate — costing you $${Math.round((hourlyWorth - a.valuePerHour) * a.weeklyHours * 52)}/year`
          : `Optimize or batch — below your $${Math.round(hourlyWorth)}/hr threshold`,
      }))
      .sort((a, b) => b.costPerYear - a.costPerYear);
  }

  delegationCalculator(task: string, taskHours: number, delegationCostPerHour: number): DelegationAdvice {
    const hourlyWorth = this.calculateHourlyWorth();
    const yourCost = taskHours * hourlyWorth;
    const delegationCost = taskHours * delegationCostPerHour;
    const savings = yourCost - delegationCost;

    return {
      task, yourCost: Math.round(yourCost), delegationCost: Math.round(delegationCost),
      savings: Math.round(savings),
      verdict: delegationCostPerHour < hourlyWorth * 0.3 ? 'automate'
        : savings > 0 ? 'delegate' : 'do-yourself',
    };
  }

  trackTimeDebt(category: string, deferredHours: number, compoundingRate = 0.1): void {
    const hourlyWorth = this.calculateHourlyWorth();
    const currentCost = deferredHours * hourlyWorth;
    this.debts.push({
      category, deferredHours, compoundingRate,
      currentCost: Math.round(currentCost),
      projectedCost6Mo: Math.round(currentCost * Math.pow(1 + compoundingRate, 6)),
    });
  }

  getTimeDebts(): TimeDebt[] { return [...this.debts]; }

  lifetimeTimeAllocation(actuals: { category: string; hoursPerWeek: number }[]): LifetimeAllocation[] {
    const totalHours = actuals.reduce((s, a) => s + a.hoursPerWeek, 0);
    const ideals: Record<string, number> = {
      work: 25, sleep: 33, family: 12, health: 7, learning: 5, leisure: 10, admin: 5, commute: 3,
    };

    return actuals.map(a => {
      const pct = totalHours > 0 ? (a.hoursPerWeek / totalHours) * 100 : 0;
      const ideal = ideals[a.category.toLowerCase()] ?? pct;
      return {
        category: a.category,
        hoursSpent: a.hoursPerWeek,
        percentage: Math.round(pct),
        idealPercentage: ideal,
        gap: Math.round(pct - ideal),
      };
    });
  }

  updateProfile(updates: Partial<TimeWealthProfile>): void {
    Object.assign(this.profile, updates);
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("time-wealth", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      profile: Array.from(this.profile.entries()),
      debts: this.debts,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.profile) this.profile = new Map(state.profile as any);
    if (state.debts) this.debts = state.debts as any;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("time-wealth");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export const createTimeWealthEngine = (profile: TimeWealthProfile) => new TimeWealthEngine(profile);
