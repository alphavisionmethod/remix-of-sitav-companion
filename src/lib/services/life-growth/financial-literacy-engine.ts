import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
// SITA OS — Financial Literacy Engine
// Personalized financial education for every household member

export type LiteracyDomain = "budgeting" | "investing" | "debtManagement" | "taxPlanning" | "insurance" | "estatePlanning";
export type AgeGroup = "child" | "teen" | "youngAdult" | "adult" | "senior";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface LiteracyAssessment {
  memberId: string;
  ageGroup: AgeGroup;
  overallScore: number;
  domainScores: Record<LiteracyDomain, number>;
  level: DifficultyLevel;
  strengths: LiteracyDomain[];
  weaknesses: LiteracyDomain[];
  recommendedPath: LearningPath;
}

export interface LearningPath {
  pathId: string;
  name: string;
  ageGroup: AgeGroup;
  modules: LearningModule[];
  estimatedHours: number;
  prerequisites: string[];
}

export interface LearningModule {
  moduleId: string;
  title: string;
  domain: LiteracyDomain;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  concepts: FinancialConcept[];
  quiz: QuizQuestion[];
  completed: boolean;
  score?: number;
  nextReviewDate?: string;
}

export interface FinancialConcept {
  conceptId: string;
  name: string;
  domain: LiteracyDomain;
  explanation: string;
  realWorldExample: string;
  personalizedExample?: string;
  difficulty: DifficultyLevel;
}

export interface QuizQuestion {
  questionId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface HouseholdLeaderboard {
  entries: Array<{
    memberId: string;
    memberName: string;
    totalScore: number;
    modulesCompleted: number;
    streak: number;
    rank: number;
  }>;
  familyAvg: number;
}

interface MemberProgress {
  memberId: string;
  completedModules: string[];
  scores: Record<string, number>;
  streak: number;
  lastActivityDate: string;
}

const AGE_CURRICULA: Record<AgeGroup, { domains: LiteracyDomain[]; topics: string[] }> = {
  child: { domains: ["budgeting"], topics: ["What is money?", "Saving vs spending", "Needs vs wants", "Piggy bank math", "Earning through chores", "Sharing and giving"] },
  teen: { domains: ["budgeting", "investing"], topics: ["First bank account", "Compound interest magic", "Budgeting your allowance", "Intro to investing", "Side hustle basics", "Credit score 101", "Avoiding debt traps", "Smart shopping"] },
  youngAdult: { domains: ["budgeting", "investing", "debtManagement", "taxPlanning"], topics: ["Student loan strategy", "First apartment budget", "401k and employer match", "Emergency fund building", "Credit card mastery", "Tax filing basics", "Roth vs Traditional IRA", "Insurance essentials"] },
  adult: { domains: ["budgeting", "investing", "debtManagement", "taxPlanning", "insurance", "estatePlanning"], topics: ["Asset allocation strategy", "Real estate investing", "Tax optimization", "College savings (529)", "Life insurance planning", "Retirement projections", "Estate planning basics", "Wealth preservation"] },
  senior: { domains: ["investing", "taxPlanning", "insurance", "estatePlanning"], topics: ["Withdrawal strategies", "Required minimum distributions", "Medicare optimization", "Estate tax planning", "Trust structures", "Charitable giving strategies", "Long-term care planning", "Legacy planning"] },
};

const CONCEPT_LIBRARY: FinancialConcept[] = [
  { conceptId: "compound-interest", name: "Compound Interest", domain: "investing", explanation: "Interest earned on both the original amount and previously earned interest. Your money grows exponentially over time.", realWorldExample: "$1,000 at 7% annual return becomes $7,612 in 30 years without adding a single dollar.", difficulty: "beginner" },
  { conceptId: "emergency-fund", name: "Emergency Fund", domain: "budgeting", explanation: "3-6 months of expenses kept in a savings account for unexpected costs like medical bills or job loss.", realWorldExample: "If your monthly expenses are $3,000, aim for $9,000-$18,000 in savings.", difficulty: "beginner" },
  { conceptId: "dollar-cost-averaging", name: "Dollar-Cost Averaging", domain: "investing", explanation: "Investing a fixed amount regularly regardless of market conditions. You buy more shares when prices are low and fewer when high.", realWorldExample: "Investing $500/month: you buy 10 shares at $50, then 12.5 shares at $40 — your average cost is lower than buying all at once.", difficulty: "intermediate" },
  { conceptId: "tax-loss-harvesting", name: "Tax-Loss Harvesting", domain: "taxPlanning", explanation: "Selling investments at a loss to offset capital gains taxes, then buying similar (not identical) investments.", realWorldExample: "You gained $5,000 on Stock A and lost $3,000 on Stock B. Selling B saves ~$750 in taxes (at 25% rate).", difficulty: "advanced" },
  { conceptId: "debt-avalanche", name: "Debt Avalanche Method", domain: "debtManagement", explanation: "Pay minimums on all debts, then put extra money toward the highest-interest debt first. Mathematically optimal for total interest saved.", realWorldExample: "Credit card at 22% APR vs car loan at 5% — always attack the credit card first.", difficulty: "intermediate" },
  { conceptId: "asset-allocation", name: "Asset Allocation", domain: "investing", explanation: "Dividing investments among stocks, bonds, and cash based on your risk tolerance, goals, and time horizon.", realWorldExample: "Age 30: 80% stocks / 20% bonds. Age 60: 40% stocks / 60% bonds. The classic rule: 110 minus your age = stock percentage.", difficulty: "intermediate" },
  { conceptId: "umbrella-insurance", name: "Umbrella Insurance", domain: "insurance", explanation: "Extra liability coverage beyond your home/auto policies. Protects your assets if you're sued for more than standard limits.", realWorldExample: "$1 million umbrella policy costs ~$150-300/year and covers lawsuits from car accidents, property damage, or injuries on your property.", difficulty: "intermediate" },
  { conceptId: "revocable-trust", name: "Revocable Living Trust", domain: "estatePlanning", explanation: "A legal entity that holds your assets during your lifetime and distributes them after death, avoiding probate court.", realWorldExample: "Without a trust, your family may wait 6-18 months and pay 3-7% of estate value in probate fees.", difficulty: "advanced" },
];

export class FinancialLiteracyEngine {
  private progress: Map<string, MemberProgress> = new Map();

  assessLiteracy(memberId: string, ageGroup: AgeGroup, answers: Record<LiteracyDomain, number>): LiteracyAssessment {
    const scores = { ...answers };
    const overall = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
    const level: DifficultyLevel = overall >= 70 ? "advanced" : overall >= 40 ? "intermediate" : "beginner";
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const strengths = sorted.filter(([, s]) => s >= 60).map(([d]) => d as LiteracyDomain).slice(0, 2);
    const weaknesses = sorted.filter(([, s]) => s < 40).map(([d]) => d as LiteracyDomain).slice(0, 2);

    return {
      memberId,
      ageGroup,
      overallScore: Math.round(overall),
      domainScores: scores,
      level,
      strengths,
      weaknesses,
      recommendedPath: this.generatePath(ageGroup, weaknesses.length > 0 ? weaknesses : ["budgeting" as LiteracyDomain], level),
    };
  }

  generatePath(ageGroup: AgeGroup, focusDomains: LiteracyDomain[], level: DifficultyLevel): LearningPath {
    const curriculum = AGE_CURRICULA[ageGroup];
    const modules: LearningModule[] = curriculum.topics.map((topic, i) => ({
      moduleId: `mod-${ageGroup}-${i}`,
      title: topic,
      domain: focusDomains[i % focusDomains.length] || curriculum.domains[0],
      difficulty: level,
      durationMinutes: ageGroup === "child" ? 10 : ageGroup === "teen" ? 15 : 20,
      concepts: this.getConceptsForTopic(focusDomains[i % focusDomains.length] || curriculum.domains[0], level),
      quiz: this.generateQuiz(topic),
      completed: false,
    }));

    return {
      pathId: `path-${ageGroup}-${Date.now()}`,
      name: `${ageGroup.charAt(0).toUpperCase() + ageGroup.slice(1)} Financial Mastery`,
      ageGroup,
      modules,
      estimatedHours: Math.round(modules.reduce((t, m) => t + m.durationMinutes, 0) / 60),
      prerequisites: [],
    };
  }

  completeModule(memberId: string, moduleId: string, score: number): void {
    const progress = this.progress.get(memberId) || { memberId, completedModules: [], scores: {}, streak: 0, lastActivityDate: "" };
    if (!progress.completedModules.includes(moduleId)) {
      progress.completedModules.push(moduleId);
    }
    progress.scores[moduleId] = score;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    progress.streak = progress.lastActivityDate === yesterday ? progress.streak + 1 : progress.lastActivityDate === today ? progress.streak : 1;
    progress.lastActivityDate = today;
    this.progress.set(memberId, progress);
  }

  getHouseholdLeaderboard(memberNames: Record<string, string>): HouseholdLeaderboard {
    const entries = Object.entries(memberNames).map(([id, name]) => {
      const prog = this.progress.get(id);
      const totalScore = prog ? Object.values(prog.scores).reduce((a, b) => a + b, 0) : 0;
      return { memberId: id, memberName: name, totalScore, modulesCompleted: prog?.completedModules.length || 0, streak: prog?.streak || 0, rank: 0 };
    });
    entries.sort((a, b) => b.totalScore - a.totalScore);
    entries.forEach((e, i) => (e.rank = i + 1));
    const familyAvg = entries.length > 0 ? Math.round(entries.reduce((a, e) => a + e.totalScore, 0) / entries.length) : 0;
    return { entries, familyAvg };
  }

  getConcept(conceptId: string): FinancialConcept | undefined {
    return CONCEPT_LIBRARY.find((c) => c.conceptId === conceptId);
  }

  getConceptsByDomain(domain: LiteracyDomain): FinancialConcept[] {
    return CONCEPT_LIBRARY.filter((c) => c.domain === domain);
  }

  private getConceptsForTopic(domain: LiteracyDomain, _level: DifficultyLevel): FinancialConcept[] {
    return CONCEPT_LIBRARY.filter((c) => c.domain === domain).slice(0, 2);
  }

  private generateQuiz(topic: string): QuizQuestion[] {
    return [{
      questionId: `q-${topic.replace(/\s/g, "-").toLowerCase()}`,
      question: `What is the primary benefit of understanding "${topic}"?`,
      options: ["Better financial decisions", "Impressing friends", "Avoiding all risk", "Guaranteed returns"],
      correctIndex: 0,
      explanation: `Understanding ${topic} helps you make informed financial decisions aligned with your goals.`,
    }];
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("life-growth/financial-literacy-engine", this._serializeState());

  private _serializeState(): Record<string, unknown> {
    return {
      progress: Array.from(this.progress.entries()),
    };
  }

  hydrateState(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.progress) this.progress = new Map(state.progress as any);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("life-growth/financial-literacy-engine");
    if (state) this.hydrateState(state as Record<string, unknown>);
  }
}

export function createFinancialLiteracyEngine(): FinancialLiteracyEngine {
  return new FinancialLiteracyEngine();


}
