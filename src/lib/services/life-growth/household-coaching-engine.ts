import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
// SITA OS — Household Coaching Engine
// Personalized coaching for each household member

export type MemberRole = "parent" | "teen" | "child" | "guardian" | "caregiver" | "other";
export type CoachingDomain = "finance" | "productivity" | "health" | "career" | "relationships" | "education";

export interface CoachingProfile {
  memberId: string;
  role: MemberRole;
  activeGoals: string[];
  skillGaps: string[];
  preferences: { frequency: "daily" | "weekly"; style: "encouraging" | "direct" | "analytical" };
}

export interface MicroLesson {
  lessonId: string;
  title: string;
  domain: CoachingDomain;
  durationMinutes: number;
  content: string;
  actionItem: string;
  forRole: MemberRole;
  difficulty: "easy" | "medium" | "hard";
}

export interface BehavioralNudge {
  nudgeId: string;
  memberId: string;
  message: string;
  triggerEvent: string;
  domain: CoachingDomain;
  sentiment: "celebration" | "encouragement" | "reminder" | "challenge";
  actionUrl?: string;
}

export interface AccountabilityPair {
  memberA: string;
  memberB: string;
  sharedGoal: string;
  checkInFrequency: "daily" | "weekly";
  streak: number;
  lastCheckIn: string;
}

export interface MilestoneReward {
  memberId: string;
  achievement: string;
  category: CoachingDomain;
  earnedAt: string;
  message: string;
  shareable: boolean;
}

const LESSON_LIBRARY: MicroLesson[] = [
  // Parent lessons
  { lessonId: "p-delegate-1", title: "The Art of Delegation", domain: "productivity", durationMinutes: 5, content: "Delegation isn't about dumping tasks — it's about developing others. This week, identify one task you do that someone else could learn. Walk them through it once, then let them own it.", actionItem: "Delegate one recurring task to a family member today", forRole: "parent", difficulty: "easy" },
  { lessonId: "p-finance-1", title: "The 24-Hour Rule", domain: "finance", durationMinutes: 5, content: "Before any purchase over $50, wait 24 hours. This simple rule eliminates 40% of impulse purchases. Keep a 'waiting list' on your phone.", actionItem: "Add one item to your waiting list instead of buying it today", forRole: "parent", difficulty: "easy" },
  { lessonId: "p-balance-1", title: "Energy Management > Time Management", domain: "health", durationMinutes: 5, content: "Instead of scheduling by time blocks, schedule by energy. Do creative work when energy is high, admin when it's low. Track your energy patterns for 3 days.", actionItem: "Note your energy level (1-10) at 9am, 12pm, 3pm, and 6pm today", forRole: "parent", difficulty: "medium" },

  // Teen lessons
  { lessonId: "t-time-1", title: "The Pomodoro Method", domain: "productivity", durationMinutes: 5, content: "Work for 25 minutes, break for 5. After 4 rounds, take a 15-minute break. This technique has been shown to increase focus by 40% in students.", actionItem: "Try 2 Pomodoro sessions on your hardest homework today", forRole: "teen", difficulty: "easy" },
  { lessonId: "t-money-1", title: "Your First Budget: 50/30/20", domain: "finance", durationMinutes: 5, content: "Split any money you receive: 50% needs (school supplies, transport), 30% wants (entertainment, snacks), 20% savings. Even $20 can follow this rule.", actionItem: "Divide your next allowance/earnings into 3 envelopes", forRole: "teen", difficulty: "easy" },
  { lessonId: "t-career-1", title: "Building Your First Portfolio", domain: "career", durationMinutes: 5, content: "Start documenting everything you create: school projects, art, code, writing. A portfolio at 16 puts you years ahead of peers who start at 22.", actionItem: "Create a folder and add your 3 best pieces of work", forRole: "teen", difficulty: "easy" },

  // Child lessons
  { lessonId: "c-save-1", title: "The Saving Jar Challenge", domain: "finance", durationMinutes: 5, content: "Get 3 jars: Save, Spend, Share. Every time you get money, split it equally. Watch your Save jar grow! In one month, you'll see the magic of saving.", actionItem: "Decorate your 3 jars and make your first deposit", forRole: "child", difficulty: "easy" },
  { lessonId: "c-chore-1", title: "Responsibility Chart", domain: "productivity", durationMinutes: 5, content: "Choose 3 things you can do every day without being asked: make your bed, put away toys, help set the table. Check them off on a chart and earn stars!", actionItem: "Pick your 3 daily responsibilities and make a chart", forRole: "child", difficulty: "easy" },
];

export class HouseholdCoachingEngine {
  private pairs: Map<string, AccountabilityPair> = new Map();
  private milestones: MilestoneReward[] = [];

  getWeeklyLessons(profile: CoachingProfile): MicroLesson[] {
    const roleLessons = LESSON_LIBRARY.filter((l) => l.forRole === profile.role);
    const relevant = roleLessons.filter((l) => {
      if (profile.skillGaps.some((g) => l.domain === g)) return true;
      if (profile.activeGoals.some((g) => g.toLowerCase().includes(l.domain))) return true;
      return true;
    });
    return relevant.slice(0, profile.preferences.frequency === "daily" ? 7 : 3);
  }

  generateNudge(memberId: string, event: { type: string; value?: number; context?: string }): BehavioralNudge | null {
    const templates: Record<string, (v?: number, c?: string) => BehavioralNudge> = {
      "savings-deposit": (v) => ({
        nudgeId: crypto.randomUUID(), memberId,
        message: `Amazing! You saved $${((v || 0) / 100).toFixed(2)} this week. That's building real wealth! 🎉`,
        triggerEvent: "savings-deposit", domain: "finance", sentiment: "celebration",
      }),
      "goal-progress": (_v, c) => ({
        nudgeId: crypto.randomUUID(), memberId,
        message: `You're ${_v || 0}% toward "${c || "your goal"}" — keep this momentum going! 💪`,
        triggerEvent: "goal-progress", domain: "productivity", sentiment: "encouragement",
      }),
      "streak-milestone": (v) => ({
        nudgeId: crypto.randomUUID(), memberId,
        message: `${v}-day streak! Consistency is the secret to every success story. You're building something real. 🔥`,
        triggerEvent: "streak-milestone", domain: "productivity", sentiment: "celebration",
      }),
      "missed-checkin": () => ({
        nudgeId: crypto.randomUUID(), memberId,
        message: "Hey! You missed yesterday's check-in. No worries — every day is a fresh start. Jump back in today?",
        triggerEvent: "missed-checkin", domain: "productivity", sentiment: "reminder",
      }),
      "budget-under": (v) => ({
        nudgeId: crypto.randomUUID(), memberId,
        message: `You came in $${((v || 0) / 100).toFixed(2)} under budget this week! That's smart money management. 💰`,
        triggerEvent: "budget-under", domain: "finance", sentiment: "celebration",
      }),
    };

    const generator = templates[event.type];
    return generator ? generator(event.value, event.context) : null;
  }

  createAccountabilityPair(memberA: string, memberB: string, sharedGoal: string): AccountabilityPair {
    const pair: AccountabilityPair = {
      memberA, memberB, sharedGoal,
      checkInFrequency: "weekly", streak: 0, lastCheckIn: new Date().toISOString(),
    };
    this.pairs.set(`${memberA}-${memberB}`, pair);
    return pair;
  }

  recordCheckIn(memberA: string, memberB: string): AccountabilityPair | null {
    const pair = this.pairs.get(`${memberA}-${memberB}`) || this.pairs.get(`${memberB}-${memberA}`);
    if (!pair) return null;
    const now = new Date();
    const last = new Date(pair.lastCheckIn);
    const daysSince = (now.getTime() - last.getTime()) / (24 * 60 * 60 * 1000);
    pair.streak = daysSince <= (pair.checkInFrequency === "daily" ? 2 : 8) ? pair.streak + 1 : 1;
    pair.lastCheckIn = now.toISOString();
    return pair;
  }

  detectMilestone(memberId: string, event: { type: string; value: number; label: string }): MilestoneReward | null {
    const milestoneThresholds: Record<string, number[]> = {
      "modules-completed": [1, 5, 10, 25, 50, 100],
      "savings-total": [10000, 50000, 100000, 500000, 1000000],
      "streak-days": [7, 14, 30, 60, 90, 180, 365],
      "goals-completed": [1, 3, 5, 10],
    };

    const thresholds = milestoneThresholds[event.type];
    if (!thresholds) return null;

    const hit = thresholds.find((t) => event.value >= t && !this.milestones.some((m) => m.memberId === memberId && m.achievement === `${event.type}-${t}`));
    if (!hit) return null;

    const reward: MilestoneReward = {
      memberId,
      achievement: `${event.type}-${hit}`,
      category: event.type.includes("saving") ? "finance" : "productivity",
      earnedAt: new Date().toISOString(),
      message: `🏆 ${event.label}: You've reached ${hit}! Incredible dedication.`,
      shareable: true,
    };
    this.milestones.push(reward);
    return reward;
  }

  getMemberMilestones(memberId: string): MilestoneReward[] {
    return this.milestones.filter((m) => m.memberId === memberId);
  }

  getPairs(): AccountabilityPair[] {
    return [...this.pairs.values()];
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("life-growth/household-coaching-engine", this._serializeState());

  private _serializeState(): Record<string, unknown> {
    return {
      pairs: Array.from(this.pairs.entries()),
    };
  }

  hydrateState(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.pairs) this.pairs = new Map(state.pairs as [string, unknown][]);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("life-growth/household-coaching-engine");
    if (state) this.hydrateState(state as Record<string, unknown>);
  }
}

export function createHouseholdCoachingEngine(): HouseholdCoachingEngine {
  return new HouseholdCoachingEngine();


}
