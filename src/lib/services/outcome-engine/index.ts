// ═══════════════════════════════════════════════════════════════
// SITA OS — Outcome Engine Service
// Outcome tracking, goal progress, impact measurement
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "@/packages/contracts";
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

export type OutcomeStatus = "active" | "on-track" | "at-risk" | "behind" | "completed" | "abandoned";

export type OutcomeMetricType = "currency" | "percentage" | "count" | "duration" | "score";

export interface Outcome {
  id: string;
  title: string;
  description: string;
  domain: DomainId;
  userId: string;
  status: OutcomeStatus;
  targetValue: number;
  currentValue: number;
  metricType: OutcomeMetricType;
  unit: string;
  startDate: string;
  targetDate: string;
  completedDate?: string;
  progress: number; // 0-100
  milestones: Milestone[];
  contributingActions: string[];
  impactScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  name: string;
  targetValue: number;
  achieved: boolean;
  achievedAt?: string;
  dueDate: string;
}

export interface OutcomeImpact {
  outcomeId: string;
  domain: DomainId;
  financialImpact: number;
  timeImpactHours: number;
  qualityImpact: number;
  description: string;
  measuredAt: string;
}

export class OutcomeEngineService {
  private outcomes: Map<string, Outcome> = new Map();
  private impacts: OutcomeImpact[] = [];

  create(outcome: Omit<Outcome, "id" | "createdAt" | "updatedAt" | "progress" | "status">): Outcome {
    const progress = outcome.targetValue > 0 ? Math.round((outcome.currentValue / outcome.targetValue) * 100) : 0;
    const full: Outcome = {
      ...outcome,
      id: crypto.randomUUID(),
      progress,
      status: this.calculateStatus(progress, outcome.targetDate),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.outcomes.set(full.id, full);
    return full;
  }

  updateProgress(id: string, currentValue: number): Outcome | null {
    const outcome = this.outcomes.get(id);
    if (!outcome) return null;

    outcome.currentValue = currentValue;
    outcome.progress = outcome.targetValue > 0 ? Math.round((currentValue / outcome.targetValue) * 100) : 0;
    outcome.status = this.calculateStatus(outcome.progress, outcome.targetDate);
    outcome.updatedAt = new Date().toISOString();

    // Check milestones
    outcome.milestones.forEach(m => {
      if (!m.achieved && currentValue >= m.targetValue) {
        m.achieved = true;
        m.achievedAt = new Date().toISOString();
      }
    });

    if (outcome.progress >= 100) {
      outcome.status = "completed";
      outcome.completedDate = new Date().toISOString();
    }

    return outcome;
  }

  recordImpact(impact: OutcomeImpact): void {
    this.impacts.push(impact);
  }

  getOutcome(id: string): Outcome | null {
    return this.outcomes.get(id) ?? null;
  }

  getOutcomesByUser(userId: string): Outcome[] {
    return Array.from(this.outcomes.values())
      .filter(o => o.userId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  getAtRisk(): Outcome[] {
    return Array.from(this.outcomes.values()).filter(o => o.status === "at-risk" || o.status === "behind");
  }

  getDashboard(userId: string): { total: number; completed: number; atRisk: number; avgProgress: number; totalImpact: number } {
    const outcomes = this.getOutcomesByUser(userId);
    const userImpacts = this.impacts.filter(i => outcomes.some(o => o.id === i.outcomeId));

    return {
      total: outcomes.length,
      completed: outcomes.filter(o => o.status === "completed").length,
      atRisk: outcomes.filter(o => o.status === "at-risk" || o.status === "behind").length,
      avgProgress: outcomes.length > 0 ? Math.round(outcomes.reduce((s, o) => s + o.progress, 0) / outcomes.length) : 0,
      totalImpact: userImpacts.reduce((s, i) => s + i.financialImpact, 0),
    };
  }

  private calculateStatus(progress: number, targetDate: string): OutcomeStatus {
    if (progress >= 100) return "completed";
    const now = new Date();
    const target = new Date(targetDate);
    const totalDays = (target.getTime() - now.getTime()) / 86400000;
    const expectedProgress = totalDays <= 0 ? 100 : Math.max(0, 100 - (totalDays / 30) * 100);

    if (progress >= expectedProgress * 0.9) return "on-track";
    if (progress >= expectedProgress * 0.6) return "at-risk";
    return "behind";
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("outcome-engine", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      outcomes: Array.from(this.outcomes.entries()),
      impacts: this.impacts,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.outcomes) this.outcomes = new Map(state.outcomes as Iterable<[string, never]>) as typeof this.outcomes;
    if (state.impacts) this.impacts = state.impacts as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("outcome-engine");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export function createOutcomeEngine(): OutcomeEngineService {
  return new OutcomeEngineService();
}

