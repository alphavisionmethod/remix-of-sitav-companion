// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Engine
// Consolidates release intelligence into a structured engine:
// rollout planner, rollback orchestrator, compatibility checker,
// regression detector, release health scorer, narrative generator.
// ═══════════════════════════════════════════════════════════════

import type {
  RolloutStateMachine, CanaryPromotionDecision, BlastRadiusEstimate,
} from "@/packages/release-contracts/rollout-types";
import type {
  RollbackEligibility, RollbackOrchestration,
} from "@/packages/release-contracts/rollback-types";
import type {
  ReleaseCompatibilityMatrix, ReleaseGateSet,
} from "@/packages/release-contracts/compatibility-types";
import type {
  SuspectedRegression, PostReleaseComparison,
} from "@/packages/release-contracts/regression-types";
import type {
  ReleaseHealthSnapshot, ReleaseHealthThresholds, ReleaseDecision, ReleaseNarrative,
} from "@/packages/release-contracts/health-types";

// ── Rollout Planner ──

export class RolloutPlanner {
  planRollout(version: string, config: {
    initialCanaryPercent: number;
    expansionSteps: number[];
    observationMinutes: number;
    autoPromote: boolean;
  }): RolloutStateMachine {
    return {
      rollout_id: crypto.randomUUID(),
      release_version: version,
      phase: "planning",
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      target_cohort: {
        cohort_id: "default",
        name: "All Users",
        targeting_rules: [],
        estimated_size: 0,
      },
      canary_config: {
        initial_percent: config.initialCanaryPercent,
        observation_period_minutes: config.observationMinutes,
        success_threshold: 0.95,
        error_rate_threshold: 0.02,
        latency_p99_threshold_ms: 2000,
        auto_promote: config.autoPromote,
      },
      expansion_rules: config.expansionSteps.map((to, i, arr) => ({
        from_percent: i === 0 ? config.initialCanaryPercent : arr[i - 1],
        to_percent: to,
        wait_minutes: config.observationMinutes,
        health_gate: 0.9,
        auto_expand: config.autoPromote,
      })),
      abort_conditions: [
        { metric: "error_rate", operator: "gt", threshold: 0.05, window_minutes: 5, auto_abort: true },
        { metric: "latency_p99", operator: "gt", threshold: 5000, window_minutes: 5, auto_abort: true },
      ],
      current_reach_percent: 0,
      health_score: 1.0,
    };
  }

  evaluateCanaryPromotion(rollout: RolloutStateMachine, metrics: Record<string, number>): CanaryPromotionDecision {
    const errorRate = metrics["error_rate"] ?? 0;
    const healthOk = errorRate < rollout.canary_config.error_rate_threshold;
    const nextStep = rollout.expansion_rules.find(r => r.from_percent === rollout.current_reach_percent);

    return {
      rollout_id: rollout.rollout_id,
      decision: healthOk && nextStep ? "promote" : healthOk ? "hold" : "abort",
      current_percent: rollout.current_reach_percent,
      target_percent: nextStep?.to_percent ?? rollout.current_reach_percent,
      health_metrics: metrics,
      rationale: healthOk ? "Health metrics within thresholds" : `Error rate ${errorRate} exceeds threshold`,
      decided_at: new Date().toISOString(),
      decided_by: "auto",
    };
  }

  estimateBlastRadius(rollout: RolloutStateMachine, totalUsers: number): BlastRadiusEstimate {
    return {
      rollout_id: rollout.rollout_id,
      affected_users_estimate: Math.round(totalUsers * (rollout.current_reach_percent / 100)),
      affected_services: [],
      data_scope: [],
      financial_exposure_cents: 0,
      rollback_time_estimate_minutes: 15,
      risk_score: rollout.current_reach_percent / 100,
      confidence: 0.8,
    };
  }
}

// ── Rollback Orchestrator ──

export class RollbackOrchestrator {
  evaluateEligibility(rolloutId: string, version: string): RollbackEligibility {
    return {
      rollout_id: rolloutId,
      eligible: true,
      blockers: [],
      warnings: [],
      data_loss_risk: "none",
      estimated_duration_minutes: 10,
      affected_users_estimate: 0,
    };
  }

  createRollback(rolloutId: string, version: string, targetVersion: string, reason: string): RollbackOrchestration {
    return {
      rollback_id: crypto.randomUUID(),
      rollout_id: rolloutId,
      release_version: version,
      target_version: targetVersion,
      phase: "evaluating",
      scope: "full",
      components: [],
      preconditions: [],
      initiated_by: "system",
      reason,
      started_at: new Date().toISOString(),
    };
  }
}

// ── Compatibility Checker ──

export class CompatibilityChecker {
  checkGates(version: string, gates: ReleaseGateSet): { allPassed: boolean; blockers: string[] } {
    const blockers = gates.gates
      .filter(g => g.required && g.status !== "passed")
      .map(g => `Gate "${g.gate_name}" not passed (${g.status})`);
    return { allPassed: blockers.length === 0, blockers };
  }

  buildMatrix(components: Array<{ name: string; version: string; compatibleWith: Record<string, string> }>): ReleaseCompatibilityMatrix {
    return {
      matrix_id: crypto.randomUUID(),
      entries: components.map(c => ({
        component: c.name,
        version: c.version,
        min_compatible: c.compatibleWith,
        max_compatible: c.compatibleWith,
      })),
      generated_at: new Date().toISOString(),
      valid_until: new Date(Date.now() + 7 * 86400000).toISOString(),
    };
  }
}

// ── Regression Detector ──

export class RegressionDetector {
  detectRegressions(baseline: Record<string, number>, current: Record<string, number>, thresholds: Record<string, number>): SuspectedRegression[] {
    const regressions: SuspectedRegression[] = [];
    for (const [metric, baseVal] of Object.entries(baseline)) {
      const curVal = current[metric];
      if (curVal === undefined) continue;
      const threshold = thresholds[metric] ?? 0.1;
      const deviation = Math.abs(curVal - baseVal) / Math.max(baseVal, 0.001);
      if (deviation > threshold && curVal > baseVal) {
        regressions.push({
          regression_id: crypto.randomUUID(),
          fingerprints: [{
            fingerprint_id: crypto.randomUUID(),
            release_version: "current",
            metric,
            baseline_value: baseVal,
            current_value: curVal,
            deviation_percent: deviation * 100,
            severity: deviation > 0.5 ? "critical" : deviation > 0.2 ? "high" : "medium",
            first_detected_at: new Date().toISOString(),
            confirmed: false,
            related_changes: [],
          }],
          suspected_cause: `${metric} increased by ${(deviation * 100).toFixed(1)}%`,
          confidence: Math.min(0.95, 0.5 + deviation),
          affected_users_estimate: 0,
          recommendation: deviation > 0.5 ? "rollback" : "monitor",
          detected_at: new Date().toISOString(),
        });
      }
    }
    return regressions;
  }

  compareReleases(baseline: Record<string, number>, current: Record<string, number>): PostReleaseComparison {
    const metrics = Object.keys({ ...baseline, ...current }).map(metric => {
      const base = baseline[metric] ?? 0;
      const cur = current[metric] ?? 0;
      const delta = base > 0 ? ((cur - base) / base) * 100 : 0;
      return {
        metric,
        baseline: base,
        current: cur,
        delta_percent: delta,
        significant: Math.abs(delta) > 5,
        direction: delta > 5 ? "regressed" as const : delta < -5 ? "improved" as const : "stable" as const,
      };
    });
    const regressions = metrics.filter(m => m.direction === "regressed").length;
    const improvements = metrics.filter(m => m.direction === "improved").length;
    return {
      comparison_id: crypto.randomUUID(),
      release_version: "current",
      baseline_version: "previous",
      metrics,
      regressions_detected: regressions,
      improvements_detected: improvements,
      overall_delta: regressions > improvements ? "worse" : improvements > regressions ? "better" : "neutral",
      compared_at: new Date().toISOString(),
    };
  }
}

// ── Release Health Scorer ──

export class ReleaseHealthScorer {
  scoreHealth(snapshot: ReleaseHealthSnapshot, thresholds: ReleaseHealthThresholds): {
    status: ReleaseHealthSnapshot["status"];
    decision: ReleaseDecision;
    score: number;
  } {
    let score = 1.0;
    if (snapshot.error_rate > thresholds.error_rate_critical) score -= 0.5;
    else if (snapshot.error_rate > thresholds.error_rate_warning) score -= 0.2;
    if (snapshot.latency_p99_ms > thresholds.latency_p99_critical_ms) score -= 0.3;
    else if (snapshot.latency_p99_ms > thresholds.latency_p99_warning_ms) score -= 0.1;
    if (snapshot.crash_rate > thresholds.crash_rate_critical) score -= 0.4;
    score = Math.max(0, score);

    const status = score > 0.8 ? "healthy" : score > 0.5 ? "degraded" : "critical";
    const decision = score > 0.8 ? "expand" : score > 0.5 ? "hold" : "rollback";
    return { status, decision, score };
  }
}

// ── Release Narrative Generator ──

export class ReleaseNarrativeGenerator {
  generateNarrative(snapshot: ReleaseHealthSnapshot, decision: ReleaseDecision): ReleaseNarrative {
    const summary = decision === "expand"
      ? `Release ${snapshot.release_version} is healthy with ${(snapshot.error_rate * 100).toFixed(2)}% error rate. Safe to expand.`
      : decision === "hold"
        ? `Release ${snapshot.release_version} showing elevated metrics. Holding for observation.`
        : `Release ${snapshot.release_version} critical: ${(snapshot.error_rate * 100).toFixed(2)}% error rate. Rollback recommended.`;

    return {
      release_version: snapshot.release_version,
      narrative_id: crypto.randomUUID(),
      summary,
      key_metrics: {
        error_rate: snapshot.error_rate,
        latency_p99: snapshot.latency_p99_ms,
        crash_rate: snapshot.crash_rate,
        health_score: snapshot.regressions_detected,
      },
      notable_events: [],
      recommendation: decision,
      generated_at: new Date().toISOString(),
    };
  }
}

// ── Singleton Facade ──

export class ReleaseEngine {
  readonly planner = new RolloutPlanner();
  readonly rollback = new RollbackOrchestrator();
  readonly compatibility = new CompatibilityChecker();
  readonly regression = new RegressionDetector();
  readonly health = new ReleaseHealthScorer();
  readonly narrative = new ReleaseNarrativeGenerator();
}

let _instance: ReleaseEngine | null = null;
export function getReleaseEngine(): ReleaseEngine {
  if (!_instance) _instance = new ReleaseEngine();
  return _instance;
}
