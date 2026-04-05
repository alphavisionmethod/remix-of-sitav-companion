// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Engineering: Learning Layer
// Tracks outcomes, false positives, repeated patterns, operator
// overrides, and adjusts agent routing/confidence over time
// ═══════════════════════════════════════════════════════════════

export type LearningEventType =
  | "fix_succeeded"
  | "fix_failed"
  | "false_positive"
  | "self_heal_succeeded"
  | "self_heal_failed"
  | "operator_override"
  | "approval_rejected"
  | "regression_detected"
  | "regression_prevented"
  | "pattern_discovered"
  | "routing_adjusted";

export interface LearningEvent {
  eventId: string;
  type: LearningEventType;
  agentId: string;
  missionId?: string;
  planId?: string;
  detail: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface AgentRoutingWeight {
  agentName: string;
  weight: number; // 0.5 - 1.5, where 1.0 is baseline
  accuracy: number; // percentage
  trend: "up" | "down" | "stable";
  adjustmentHistory: { date: string; oldWeight: number; newWeight: number; reason: string }[];
}

export interface LearnedPattern {
  patternId: string;
  description: string;
  domain: string;
  frequency: string;
  confidence: number;
  actionTaken: string;
  impactResult: string;
  status: "active" | "proposed" | "retired";
  firstDetected: string;
  lastSeen: string;
}

export class LearningLayer {
  private events: LearningEvent[] = [];
  private weights: Map<string, AgentRoutingWeight> = new Map();
  private patterns: LearnedPattern[] = [];

  recordEvent(event: Omit<LearningEvent, "eventId" | "timestamp">): LearningEvent {
    const full: LearningEvent = {
      ...event,
      eventId: `learn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.events.push(full);
    this.adjustWeights(full);
    return full;
  }

  private adjustWeights(event: LearningEvent) {
    const weight = this.weights.get(event.agentId) ?? {
      agentName: event.agentId,
      weight: 1.0,
      accuracy: 80,
      trend: "stable" as const,
      adjustmentHistory: [],
    };

    const oldWeight = weight.weight;
    let delta = 0;

    switch (event.type) {
      case "fix_succeeded":
      case "self_heal_succeeded":
      case "regression_prevented":
        delta = 0.02;
        break;
      case "fix_failed":
      case "self_heal_failed":
      case "false_positive":
        delta = -0.03;
        break;
      case "operator_override":
      case "approval_rejected":
        delta = -0.01;
        break;
    }

    weight.weight = Math.max(0.5, Math.min(1.5, weight.weight + delta));
    weight.trend = delta > 0 ? "up" : delta < 0 ? "down" : "stable";

    if (delta !== 0) {
      weight.adjustmentHistory.push({
        date: new Date().toISOString(),
        oldWeight,
        newWeight: weight.weight,
        reason: `${event.type}: ${event.detail.slice(0, 80)}`,
      });
    }

    this.weights.set(event.agentId, weight);
  }

  discoverPattern(pattern: Omit<LearnedPattern, "patternId">): LearnedPattern {
    const full: LearnedPattern = {
      ...pattern,
      patternId: `pat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    this.patterns.push(full);
    return full;
  }

  getWeights(): AgentRoutingWeight[] {
    return [...this.weights.values()];
  }

  getPatterns(): LearnedPattern[] {
    return [...this.patterns];
  }

  getEvents(limit = 50): LearningEvent[] {
    return this.events.slice(-limit);
  }

  getAgentAccuracy(agentName: string): number {
    const agentEvents = this.events.filter(e => e.agentId === agentName);
    if (agentEvents.length === 0) return 80;
    const successes = agentEvents.filter(e => ["fix_succeeded", "self_heal_succeeded", "regression_prevented"].includes(e.type)).length;
    return Math.round((successes / agentEvents.length) * 100);
  }
}
