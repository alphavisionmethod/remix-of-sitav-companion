// ═══════════════════════════════════════════════════════════════
// SITA OS — Self-Learning Engine
// Performance tracking, confidence calibration, pattern detection,
// and autonomy recommendations with exponential decay
// ═══════════════════════════════════════════════════════════════

import { EventBus } from "./event-bus";
import { MemoryService } from "./memory-service";

// ── Types ───────────────────────────────────────────────────────

export interface OutcomeRecord {
  id: string;
  agentId: string;
  action: string;
  success: boolean;
  metrics: {
    latencyMs: number;
    tokensUsed: number;
    costUsd: number;
    confidenceAtAction: number;
  };
  timestamp: number;
  weight: number; // Decay-adjusted weight
}

export interface PerformanceProfile {
  agentId: string;
  totalOutcomes: number;
  successRate: number;
  avgLatencyMs: number;
  avgCostUsd: number;
  confidenceTrend: "improving" | "stable" | "declining";
  costTrend: "decreasing" | "stable" | "increasing";
  latencyTrend: "improving" | "stable" | "degrading";
  recentSuccessRate: number; // Last 20 outcomes
  promotionRecommended: boolean;
  demotionRecommended: boolean;
  lastUpdated: number;
}

export interface LearningInsight {
  id: string;
  type: "pattern" | "recommendation" | "optimization" | "correlation";
  title: string;
  description: string;
  confidence: number;
  affectedAgents: string[];
  suggestedAction?: string;
  applied: boolean;
  createdAt: number;
}

export interface SystemLearnings {
  totalOutcomes: number;
  overallSuccessRate: number;
  topPerformers: string[];
  underPerformers: string[];
  optimalSchedulePatterns: string[];
  costSavingOpportunities: string[];
  agentSynergies: Array<{ agents: string[]; description: string }>;
  insights: LearningInsight[];
}

// ── Constants ───────────────────────────────────────────────────

const DECAY_LAMBDA = 0.95;
const MIN_OUTCOMES_FOR_ANALYSIS = 5;
const PROMOTION_THRESHOLD = 0.92; // 92% success rate
const DEMOTION_THRESHOLD = 0.6;   // 60% success rate
const TREND_WINDOW = 10;

// ── Self-Learning Engine ────────────────────────────────────────

export class SelfLearningEngine {
  private outcomes = new Map<string, OutcomeRecord[]>(); // agentId → outcomes
  private insights: LearningInsight[] = [];
  private eventBus: EventBus;
  private memory: MemoryService;
  private bootedAt: number;

  constructor(options?: { eventBus?: EventBus; memory?: MemoryService }) {
    this.eventBus = options?.eventBus ?? new EventBus();
    this.memory = options?.memory ?? new MemoryService();
    this.bootedAt = Date.now();

    // Seed with synthetic historical data for demo
    this.seedHistoricalData();
  }

  // ── Record Outcomes ─────────────────────────────────────────

  recordOutcome(agentId: string, action: string, success: boolean, metrics: OutcomeRecord["metrics"]): void {
    const record: OutcomeRecord = {
      id: crypto.randomUUID(),
      agentId,
      action,
      success,
      metrics,
      timestamp: Date.now(),
      weight: 1.0, // Full weight — decays over time
    };

    if (!this.outcomes.has(agentId)) {
      this.outcomes.set(agentId, []);
    }
    this.outcomes.get(agentId)!.push(record);

    // Apply decay to older records
    this.applyDecay(agentId);

    // Store in memory
    this.memory.store(`learning.outcome.${agentId}`, {
      action,
      success,
      metrics,
      timestamp: record.timestamp,
    }, {
      source: "self-learning-engine",
      tags: ["learning", agentId],
      confidence: 1.0,
    });

    // Check for pattern after accumulating data
    const outcomes = this.outcomes.get(agentId) ?? [];
    if (outcomes.length % 10 === 0 && outcomes.length >= MIN_OUTCOMES_FOR_ANALYSIS) {
      this.detectPatternsForAgent(agentId);
    }
  }

  // ── Decay ───────────────────────────────────────────────────

  private applyDecay(agentId: string): void {
    const records = this.outcomes.get(agentId);
    if (!records) return;

    const now = Date.now();
    for (const record of records) {
      const ageHours = (now - record.timestamp) / (1000 * 60 * 60);
      record.weight = Math.pow(DECAY_LAMBDA, ageHours);
    }
  }

  // ── Confidence Calibration ──────────────────────────────────

  calibrateConfidence(agentId: string): { recommended: number; current: number; adjustment: string } {
    const records = this.outcomes.get(agentId);
    if (!records || records.length < MIN_OUTCOMES_FOR_ANALYSIS) {
      return { recommended: 0.7, current: 0.7, adjustment: "insufficient-data" };
    }

    // Weighted success rate
    let weightedSuccesses = 0;
    let totalWeight = 0;
    for (const r of records) {
      totalWeight += r.weight;
      if (r.success) weightedSuccesses += r.weight;
    }

    const weightedRate = totalWeight > 0 ? weightedSuccesses / totalWeight : 0.5;

    // Recommended confidence threshold based on performance
    const recommended = Math.max(0.3, Math.min(0.95, weightedRate - 0.1));
    const current = records.length > 0 ? records[records.length - 1].metrics.confidenceAtAction : 0.7;

    const adjustment = recommended > current + 0.05
      ? "increase"
      : recommended < current - 0.05
        ? "decrease"
        : "maintain";

    return { recommended, current, adjustment };
  }

  // ── Pattern Detection ───────────────────────────────────────

  detectPatterns(): LearningInsight[] {
    const newInsights: LearningInsight[] = [];

    for (const [agentId] of this.outcomes) {
      const agentInsights = this.detectPatternsForAgent(agentId);
      newInsights.push(...agentInsights);
    }

    // Cross-agent patterns
    newInsights.push(...this.detectCrossAgentPatterns());

    return newInsights;
  }

  private detectPatternsForAgent(agentId: string): LearningInsight[] {
    const records = this.outcomes.get(agentId);
    if (!records || records.length < MIN_OUTCOMES_FOR_ANALYSIS) return [];

    const insights: LearningInsight[] = [];

    // Detect declining success pattern
    const recentRate = this.getRecentSuccessRate(agentId);
    const overallRate = this.getOverallSuccessRate(agentId);

    if (recentRate < overallRate - 0.15 && records.length >= 20) {
      insights.push(this.createInsight({
        type: "pattern",
        title: `Declining performance: ${agentId}`,
        description: `Recent success rate ${(recentRate * 100).toFixed(0)}% vs overall ${(overallRate * 100).toFixed(0)}%. Possible regression.`,
        confidence: 0.8,
        affectedAgents: [agentId],
        suggestedAction: "Investigate recent changes, consider demotion",
      }));
    }

    // Detect cost efficiency pattern
    const avgCost = records.reduce((sum, r) => sum + r.metrics.costUsd * r.weight, 0) /
      records.reduce((sum, r) => sum + r.weight, 0);
    if (avgCost > 0.1) {
      insights.push(this.createInsight({
        type: "optimization",
        title: `High cost agent: ${agentId}`,
        description: `Average weighted cost $${avgCost.toFixed(4)} per action. Consider lighter model or reduced frequency.`,
        confidence: 0.75,
        affectedAgents: [agentId],
        suggestedAction: "Switch to lighter model or increase batch size",
      }));
    }

    return insights;
  }

  private detectCrossAgentPatterns(): LearningInsight[] {
    const insights: LearningInsight[] = [];

    // Find agents that fail at similar times (correlation)
    const failureTimestamps = new Map<string, number[]>();
    for (const [agentId, records] of this.outcomes) {
      const failures = records.filter(r => !r.success).map(r => r.timestamp);
      if (failures.length > 0) failureTimestamps.set(agentId, failures);
    }

    const agents = Array.from(failureTimestamps.keys());
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const a = failureTimestamps.get(agents[i])!;
        const b = failureTimestamps.get(agents[j])!;

        // Check for temporal correlation (failures within 5s of each other)
        let correlated = 0;
        for (const ta of a) {
          for (const tb of b) {
            if (Math.abs(ta - tb) < 5000) correlated++;
          }
        }

        if (correlated >= 3) {
          insights.push(this.createInsight({
            type: "correlation",
            title: "Correlated failures detected",
            description: `${agents[i]} and ${agents[j]} fail at similar times (${correlated} correlations). Possible shared dependency.`,
            confidence: 0.7,
            affectedAgents: [agents[i], agents[j]],
            suggestedAction: "Investigate shared dependencies or triggers",
          }));
        }
      }
    }

    return insights;
  }

  // ── Promotion/Demotion Recommendations ──────────────────────

  recommendPromotions(): Array<{ agentId: string; reason: string; confidence: number }> {
    const recommendations: Array<{ agentId: string; reason: string; confidence: number }> = [];

    for (const [agentId, records] of this.outcomes) {
      if (records.length < 20) continue;

      const successRate = this.getWeightedSuccessRate(agentId);
      const recentRate = this.getRecentSuccessRate(agentId);

      if (successRate >= PROMOTION_THRESHOLD && recentRate >= PROMOTION_THRESHOLD) {
        recommendations.push({
          agentId,
          reason: `Sustained ${(successRate * 100).toFixed(0)}% success rate over ${records.length} actions`,
          confidence: Math.min(successRate, recentRate),
        });
      }
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  recommendDemotions(): Array<{ agentId: string; reason: string; confidence: number }> {
    const recommendations: Array<{ agentId: string; reason: string; confidence: number }> = [];

    for (const [agentId, records] of this.outcomes) {
      if (records.length < 10) continue;

      const recentRate = this.getRecentSuccessRate(agentId);

      if (recentRate < DEMOTION_THRESHOLD) {
        recommendations.push({
          agentId,
          reason: `Recent success rate ${(recentRate * 100).toFixed(0)}% below ${(DEMOTION_THRESHOLD * 100).toFixed(0)}% threshold`,
          confidence: 1 - recentRate,
        });
      }
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  // ── Performance Profile ─────────────────────────────────────

  getPerformanceProfile(agentId: string): PerformanceProfile {
    const records = this.outcomes.get(agentId) ?? [];
    const successRate = this.getOverallSuccessRate(agentId);
    const recentRate = this.getRecentSuccessRate(agentId);

    const avgLatency = records.length > 0
      ? records.reduce((sum, r) => sum + r.metrics.latencyMs, 0) / records.length
      : 0;
    const avgCost = records.length > 0
      ? records.reduce((sum, r) => sum + r.metrics.costUsd, 0) / records.length
      : 0;

    return {
      agentId,
      totalOutcomes: records.length,
      successRate,
      avgLatencyMs: avgLatency,
      avgCostUsd: avgCost,
      confidenceTrend: this.computeTrend(records.map(r => r.metrics.confidenceAtAction)),
      costTrend: this.computeCostTrend(records.map(r => r.metrics.costUsd)),
      latencyTrend: this.computeLatencyTrend(records.map(r => r.metrics.latencyMs)),
      recentSuccessRate: recentRate,
      promotionRecommended: successRate >= PROMOTION_THRESHOLD && recentRate >= PROMOTION_THRESHOLD && records.length >= 20,
      demotionRecommended: recentRate < DEMOTION_THRESHOLD && records.length >= 10,
      lastUpdated: Date.now(),
    };
  }

  // ── System-Wide Learnings ───────────────────────────────────

  getSystemLearnings(): SystemLearnings {
    const profiles: PerformanceProfile[] = [];
    let totalOutcomes = 0;
    let totalSuccesses = 0;

    for (const [agentId, records] of this.outcomes) {
      profiles.push(this.getPerformanceProfile(agentId));
      totalOutcomes += records.length;
      totalSuccesses += records.filter(r => r.success).length;
    }

    const sorted = profiles.sort((a, b) => b.successRate - a.successRate);

    return {
      totalOutcomes,
      overallSuccessRate: totalOutcomes > 0 ? totalSuccesses / totalOutcomes : 1,
      topPerformers: sorted.filter(p => p.successRate >= 0.9).slice(0, 5).map(p => p.agentId),
      underPerformers: sorted.filter(p => p.successRate < 0.7 && p.totalOutcomes >= 10).map(p => p.agentId),
      optimalSchedulePatterns: [
        "Continuous agents perform best during low-traffic hours",
        "Hourly agents show best results in batch mode",
        "On-event agents have fastest response when pre-warmed",
      ],
      costSavingOpportunities: this.identifyCostSavings(profiles),
      agentSynergies: this.identifySynergies(),
      insights: this.insights.slice(-20),
    };
  }

  applyLearning(learningId: string): boolean {
    const insight = this.insights.find(i => i.id === learningId);
    if (!insight || insight.applied) return false;

    insight.applied = true;
    this.eventBus.publish("self-learning.insight.applied.v1", {
      insightId: insight.id,
      type: insight.type,
      affectedAgents: insight.affectedAgents,
    }, { source: "self-learning-engine" });

    return true;
  }

  // ── Private Helpers ─────────────────────────────────────────

  private getOverallSuccessRate(agentId: string): number {
    const records = this.outcomes.get(agentId);
    if (!records || records.length === 0) return 1;
    return records.filter(r => r.success).length / records.length;
  }

  private getRecentSuccessRate(agentId: string): number {
    const records = this.outcomes.get(agentId);
    if (!records || records.length === 0) return 1;
    const recent = records.slice(-20);
    return recent.filter(r => r.success).length / recent.length;
  }

  private getWeightedSuccessRate(agentId: string): number {
    const records = this.outcomes.get(agentId);
    if (!records || records.length === 0) return 1;

    let weightedSuccess = 0;
    let totalWeight = 0;
    for (const r of records) {
      totalWeight += r.weight;
      if (r.success) weightedSuccess += r.weight;
    }
    return totalWeight > 0 ? weightedSuccess / totalWeight : 0.5;
  }

  private computeTrend(values: number[]): "improving" | "stable" | "declining" {
    if (values.length < TREND_WINDOW) return "stable";
    const recent = values.slice(-TREND_WINDOW);
    const first = recent.slice(0, TREND_WINDOW / 2);
    const second = recent.slice(TREND_WINDOW / 2);
    const avgFirst = first.reduce((a, b) => a + b, 0) / first.length;
    const avgSecond = second.reduce((a, b) => a + b, 0) / second.length;
    if (avgSecond > avgFirst + 0.05) return "improving";
    if (avgSecond < avgFirst - 0.05) return "declining";
    return "stable";
  }

  private computeCostTrend(values: number[]): "decreasing" | "stable" | "increasing" {
    const trend = this.computeTrend(values);
    if (trend === "improving") return "increasing"; // Higher cost = bad
    if (trend === "declining") return "decreasing";
    return "stable";
  }

  private computeLatencyTrend(values: number[]): "improving" | "stable" | "degrading" {
    const trend = this.computeTrend(values);
    if (trend === "declining") return "improving"; // Lower latency = good
    if (trend === "improving") return "degrading";
    return "stable";
  }

  private createInsight(params: Omit<LearningInsight, "id" | "applied" | "createdAt">): LearningInsight {
    const insight: LearningInsight = {
      ...params,
      id: crypto.randomUUID(),
      applied: false,
      createdAt: Date.now(),
    };
    this.insights.push(insight);
    return insight;
  }

  private identifyCostSavings(profiles: PerformanceProfile[]): string[] {
    const savings: string[] = [];
    const expensive = profiles.filter(p => p.avgCostUsd > 0.05).sort((a, b) => b.avgCostUsd - a.avgCostUsd);

    for (const p of expensive.slice(0, 3)) {
      savings.push(`${p.agentId}: avg $${p.avgCostUsd.toFixed(4)}/action — consider lighter model`);
    }

    if (savings.length === 0) {
      savings.push("All agents within cost targets");
    }

    return savings;
  }

  private identifySynergies(): Array<{ agents: string[]; description: string }> {
    // Simplified: agents in same council that both succeed frequently
    return [
      { agents: ["aw-design-system", "aw-ux-consistency"], description: "Design agents complement each other for holistic UX quality" },
      { agents: ["aw-incident-commander", "aw-recovery-planner"], description: "Incident + Recovery agents form effective response chain" },
      { agents: ["aw-ai-spend-control", "aw-model-router"], description: "Cost + Model agents optimize inference spend together" },
    ];
  }

  // ── Seed Data ───────────────────────────────────────────────

  private seedHistoricalData(): void {
    const agentIds = [
      "aw-design-system", "aw-ux-consistency", "aw-feature-qa", "aw-a11y-auditor",
      "aw-incident-commander", "aw-recovery-planner", "aw-uptime-sentinel",
      "aw-security-monitor", "aw-policy-enforcer", "aw-anomaly-detector",
      "aw-ai-spend-control", "aw-model-router", "aw-token-optimizer",
      "aw-arch-consistency", "aw-api-contract-guard", "aw-dependency-auditor",
      "aw-runbook-keeper", "aw-doc-freshness", "aw-knowledge-gap-finder",
    ];

    const now = Date.now();
    for (const agentId of agentIds) {
      const count = 20 + Math.floor(Math.random() * 30);
      const records: OutcomeRecord[] = [];
      for (let i = 0; i < count; i++) {
        const success = Math.random() > 0.12;
        records.push({
          id: crypto.randomUUID(),
          agentId,
          action: `task-${i}`,
          success,
          metrics: {
            latencyMs: 20 + Math.random() * 200,
            tokensUsed: Math.floor(100 + Math.random() * 2000),
            costUsd: parseFloat((Math.random() * 0.08).toFixed(4)),
            confidenceAtAction: 0.6 + Math.random() * 0.35,
          },
          timestamp: now - (count - i) * 3_600_000,
          weight: Math.pow(DECAY_LAMBDA, (count - i)),
        });
      }
      this.outcomes.set(agentId, records);
    }
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createSelfLearningEngine(options?: {
  eventBus?: EventBus;
  memory?: MemoryService;
}): SelfLearningEngine {
  return new SelfLearningEngine(options);
}
