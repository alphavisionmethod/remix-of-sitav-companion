// ═══════════════════════════════════════════════════════════════
// SITA OS — Duress Detection Service
// Behavioral anomaly detection for forced/coerced actions
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export type DuressSignal = "rapid-escalation" | "unusual-hours" | "geo-anomaly" | "pattern-break" | "forced-approval" | "bulk-action" | "credential-dump";

export type DuressLevel = "none" | "low" | "medium" | "high" | "critical";

export interface DuressIndicator {
  signal: DuressSignal;
  confidence: number;
  details: string;
  detectedAt: string;
}

export interface DuressEvaluation {
  id: string;
  userId: string;
  sessionId: string;
  level: DuressLevel;
  indicators: DuressIndicator[];
  overallConfidence: number;
  actionBlocked: boolean;
  escalated: boolean;
  evaluatedAt: string;
}

export interface BehavioralBaseline {
  userId: string;
  typicalHours: { start: number; end: number };
  typicalGeoHash: string[];
  avgActionsPerMinute: number;
  avgSessionDuration: number;
  commonActions: string[];
  lastUpdated: string;
}

const SIGNAL_WEIGHTS: Record<DuressSignal, number> = {
  "rapid-escalation": 0.9,
  "unusual-hours": 0.3,
  "geo-anomaly": 0.7,
  "pattern-break": 0.5,
  "forced-approval": 0.85,
  "bulk-action": 0.6,
  "credential-dump": 0.95,
};

export class DuressDetectionService {
  private baselines: Map<string, BehavioralBaseline> = new Map();
  private evaluations: DuressEvaluation[] = [];
  private recentActions: Map<string, { action: string; timestamp: number }[]> = new Map();

  evaluate(userId: string, sessionId: string, action: string, context: { hour?: number; geoHash?: string; actionsInLastMinute?: number }): DuressEvaluation {
    const baseline = this.baselines.get(userId);
    const indicators: DuressIndicator[] = [];
    const now = new Date().toISOString();

    // Track action
    if (!this.recentActions.has(userId)) this.recentActions.set(userId, []);
    const actions = this.recentActions.get(userId)!;
    actions.push({ action, timestamp: Date.now() });
    // Keep only last 5 minutes
    const fiveMinAgo = Date.now() - 300_000;
    this.recentActions.set(userId, actions.filter(a => a.timestamp > fiveMinAgo));

    // Check unusual hours
    if (context.hour !== undefined && baseline) {
      if (context.hour < baseline.typicalHours.start || context.hour > baseline.typicalHours.end) {
        indicators.push({ signal: "unusual-hours", confidence: 0.4, details: `Action at hour ${context.hour}, typical range ${baseline.typicalHours.start}-${baseline.typicalHours.end}`, detectedAt: now });
      }
    }

    // Check geo anomaly
    if (context.geoHash && baseline && baseline.typicalGeoHash.length > 0 && !baseline.typicalGeoHash.includes(context.geoHash)) {
      indicators.push({ signal: "geo-anomaly", confidence: 0.7, details: `Unknown location ${context.geoHash}`, detectedAt: now });
    }

    // Check rapid actions
    const recentCount = context.actionsInLastMinute ?? this.recentActions.get(userId)?.length ?? 0;
    if (baseline && recentCount > baseline.avgActionsPerMinute * 3) {
      indicators.push({ signal: "bulk-action", confidence: 0.6, details: `${recentCount} actions/min vs baseline ${baseline.avgActionsPerMinute}`, detectedAt: now });
    }

    // Check for forced approvals
    if (action.includes("approve") && recentCount > 5) {
      indicators.push({ signal: "forced-approval", confidence: 0.8, details: "Rapid approval pattern detected", detectedAt: now });
    }

    // Check credential dumps
    if (action.includes("export") && action.includes("credential")) {
      indicators.push({ signal: "credential-dump", confidence: 0.9, details: "Bulk credential export attempt", detectedAt: now });
    }

    const overallConfidence = indicators.length > 0
      ? indicators.reduce((sum, i) => sum + i.confidence * (SIGNAL_WEIGHTS[i.signal] ?? 0.5), 0) / indicators.length
      : 0;

    const level = this.confidenceToLevel(overallConfidence);
    const actionBlocked = level === "high" || level === "critical";

    const evaluation: DuressEvaluation = {
      id: crypto.randomUUID(),
      userId,
      sessionId,
      level,
      indicators,
      overallConfidence,
      actionBlocked,
      escalated: level === "critical",
      evaluatedAt: now,
    };

    this.evaluations.push(evaluation);
    if (this.evaluations.length > 2000) this.evaluations = this.evaluations.slice(-2000);

    return evaluation;
  }

  updateBaseline(userId: string, baseline: Partial<BehavioralBaseline>): BehavioralBaseline {
    const existing = this.baselines.get(userId) ?? {
      userId,
      typicalHours: { start: 8, end: 22 },
      typicalGeoHash: [],
      avgActionsPerMinute: 5,
      avgSessionDuration: 1800,
      commonActions: [],
      lastUpdated: new Date().toISOString(),
    };

    const updated = { ...existing, ...baseline, lastUpdated: new Date().toISOString() };
    this.baselines.set(userId, updated);
    return updated;
  }

  getRecentEvaluations(userId?: string, limit: number = 50): DuressEvaluation[] {
    let evals = userId ? this.evaluations.filter(e => e.userId === userId) : [...this.evaluations];
    return evals.slice(-limit).reverse();
  }

  getActiveAlerts(): DuressEvaluation[] {
    const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
    return this.evaluations.filter(e => e.level !== "none" && e.evaluatedAt > oneHourAgo);
  }

  private confidenceToLevel(confidence: number): DuressLevel {
    if (confidence >= 0.85) return "critical";
    if (confidence >= 0.65) return "high";
    if (confidence >= 0.4) return "medium";
    if (confidence >= 0.15) return "low";
    return "none";
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("duress-detection", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      baselines: Array.from(this.baselines.entries()),
      evaluations: this.evaluations,
      recentActions: Array.from(this.recentActions.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.baselines) this.baselines = new Map(state.baselines as [string, unknown][]);
    if (state.evaluations) this.evaluations = state.evaluations as never;
    if (state.recentActions) this.recentActions = new Map(state.recentActions as [string, unknown][]);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("duress-detection");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export function createDuressDetection(): DuressDetectionService {
  return new DuressDetectionService();
}
