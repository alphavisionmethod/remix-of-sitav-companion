// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Engineering: Learning Layer
// Tracks outcomes, false positives, repeated patterns, operator
// overrides, cost vs value, and adjusts agent routing/confidence.
// Evidence-backed, reversible, inspectable, confidence-scored.
// Never silently self-modifies critical boundaries without approval.
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
  | "routing_adjusted"
  | "design_regression"
  | "cost_spike_detected"
  | "recurring_rejection";

export interface LearningEvent {
  eventId: string;
  type: LearningEventType;
  agentId: string;
  missionId?: string;
  planId?: string;
  detail: string;
  evidenceRefs: string[];
  metadata: Record<string, unknown>;
  confidence: number;
  reversible: boolean;
  inspectable: boolean;
  approvalRequired: boolean;
  timestamp: string;
}

export interface AgentRoutingWeight {
  agentName: string;
  weight: number; // 0.5 - 1.5, where 1.0 is baseline
  accuracy: number; // percentage
  trend: "up" | "down" | "stable";
  costEfficiency: number; // 0-100
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
  status: "active" | "proposed" | "retired" | "human-review-required";
  evidenceRefs: string[];
  outcomeVerified: boolean;
  firstDetected: string;
  lastSeen: string;
}

export interface AutonomyRecommendation {
  recommendationId: string;
  agentId: string;
  currentLevel: string;
  recommendedLevel: string;
  direction: "upgrade" | "downgrade";
  reason: string;
  evidenceCount: number;
  confidence: number;
  requiresHumanApproval: boolean;
  createdAt: string;
}

export interface ImprovementSuggestion {
  suggestionId: string;
  title: string;
  description: string;
  domain: string;
  confidence: number;
  estimatedImpact: string;
  evidenceRefs: string[];
  status: "proposed" | "approved" | "applied" | "rejected";
  createdAt: string;
}

export class LearningLayer {
  private events: LearningEvent[] = [];
  private weights: Map<string, AgentRoutingWeight> = new Map();
  private patterns: LearnedPattern[] = [];
  private autonomyRecs: AutonomyRecommendation[] = [];
  private improvements: ImprovementSuggestion[] = [];

  recordEvent(event: Omit<LearningEvent, "eventId" | "timestamp">): LearningEvent {
    const full: LearningEvent = {
      ...event,
      eventId: `learn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.events.push(full);
    this.adjustWeights(full);
    this.checkForAutonomyRecommendation(full);
    return full;
  }

  private adjustWeights(event: LearningEvent) {
    const weight = this.weights.get(event.agentId) ?? {
      agentName: event.agentId,
      weight: 1.0,
      accuracy: 80,
      trend: "stable" as const,
      costEfficiency: 75,
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
      case "design_regression":
        delta = -0.03;
        break;
      case "operator_override":
      case "approval_rejected":
      case "recurring_rejection":
        delta = -0.01;
        break;
      case "cost_spike_detected":
        weight.costEfficiency = Math.max(0, weight.costEfficiency - 5);
        break;
    }

    weight.weight = Math.max(0.5, Math.min(1.5, weight.weight + delta));
    weight.trend = delta > 0 ? "up" : delta < 0 ? "down" : "stable";

    // Update accuracy based on event history
    const agentEvents = this.events.filter(e => e.agentId === event.agentId);
    const successes = agentEvents.filter(e =>
      ["fix_succeeded", "self_heal_succeeded", "regression_prevented"].includes(e.type)
    ).length;
    weight.accuracy = agentEvents.length > 0 ? Math.round((successes / agentEvents.length) * 100) : 80;

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

  private checkForAutonomyRecommendation(event: LearningEvent) {
    const weight = this.weights.get(event.agentId);
    if (!weight) return;

    // Downgrade recommendation
    if (weight.accuracy < 60 || weight.weight < 0.6) {
      this.autonomyRecs.push({
        recommendationId: `autrec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        agentId: event.agentId,
        currentLevel: "safe_auto_heal",
        recommendedLevel: "approval_required",
        direction: "downgrade",
        reason: `Agent accuracy ${weight.accuracy}% and weight ${weight.weight.toFixed(2)} below safe thresholds`,
        evidenceCount: this.events.filter(e => e.agentId === event.agentId).length,
        confidence: 85,
        requiresHumanApproval: true,
        createdAt: new Date().toISOString(),
      });
    }

    // Upgrade recommendation
    if (weight.accuracy > 90 && weight.weight > 1.2) {
      const existingUpgrade = this.autonomyRecs.find(r => r.agentId === event.agentId && r.direction === "upgrade");
      if (!existingUpgrade) {
        this.autonomyRecs.push({
          recommendationId: `autrec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          agentId: event.agentId,
          currentLevel: "approval_required",
          recommendedLevel: "safe_auto_heal",
          direction: "upgrade",
          reason: `Agent accuracy ${weight.accuracy}% and weight ${weight.weight.toFixed(2)} exceed promotion thresholds`,
          evidenceCount: this.events.filter(e => e.agentId === event.agentId).length,
          confidence: 80,
          requiresHumanApproval: true,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  discoverPattern(pattern: Omit<LearnedPattern, "patternId">): LearnedPattern {
    const full: LearnedPattern = {
      ...pattern,
      patternId: `pat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    this.patterns.push(full);
    return full;
  }

  suggestImprovement(suggestion: Omit<ImprovementSuggestion, "suggestionId" | "createdAt" | "status">): ImprovementSuggestion {
    const full: ImprovementSuggestion = {
      ...suggestion,
      suggestionId: `imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      status: "proposed",
      createdAt: new Date().toISOString(),
    };
    this.improvements.push(full);
    return full;
  }

  // ── Queries ────────────────────────────────────────────────

  getWeights(): AgentRoutingWeight[] { return [...this.weights.values()]; }
  getPatterns(): LearnedPattern[] { return [...this.patterns]; }
  getEvents(limit = 50): LearningEvent[] { return this.events.slice(-limit); }
  getAutonomyRecommendations(): AutonomyRecommendation[] { return [...this.autonomyRecs]; }
  getImprovements(): ImprovementSuggestion[] { return [...this.improvements]; }

  getAgentAccuracy(agentName: string): number {
    const agentEvents = this.events.filter(e => e.agentId === agentName);
    if (agentEvents.length === 0) return 80;
    const successes = agentEvents.filter(e =>
      ["fix_succeeded", "self_heal_succeeded", "regression_prevented"].includes(e.type)
    ).length;
    return Math.round((successes / agentEvents.length) * 100);
  }

  getCostVsValueReport(): { agentId: string; events: number; successRate: number; costEfficiency: number }[] {
    return [...this.weights.values()].map(w => ({
      agentId: w.agentName,
      events: this.events.filter(e => e.agentId === w.agentName).length,
      successRate: w.accuracy,
      costEfficiency: w.costEfficiency,
    }));
  }
}
