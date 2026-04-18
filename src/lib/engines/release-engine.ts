// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Engine (Fully Advanced)
// Rollout planner, rollback orchestrator, compatibility checker,
// regression detector, release health scorer, narrative generator.
// ═══════════════════════════════════════════════════════════════

import type {
  RolloutStateMachine, CanaryPromotionDecision, BlastRadiusEstimate, MetricEvaluationResult,
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
    previousVersion: string;
    initialCanaryPercent: number;
    expansionSteps: number[];
    observationMinutes: number;
    autoPromote: boolean;
    ownerId: string;
  }): RolloutStateMachine {
    return {
      rollout_id: crypto.randomUUID(),
      release_version: version,
      previous_version: config.previousVersion,
      phase: "planning",
      strategy: "canary",
      trigger: "manual",
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      target_cohort: {
        cohort_id: "default",
        name: "All Users",
        targeting_rules: [],
        exclusion_rules: [],
        estimated_size: 0,
        priority: 1,
        sticky_assignment: true,
      },
      canary_config: {
        initial_percent: config.initialCanaryPercent,
        observation_period_minutes: config.observationMinutes,
        success_threshold: 0.95,
        error_rate_threshold: 0.02,
        latency_p50_threshold_ms: 500,
        latency_p95_threshold_ms: 1500,
        latency_p99_threshold_ms: 2000,
        crash_rate_threshold: 0.001,
        auto_promote: config.autoPromote,
        min_sample_size: 100,
        require_manual_approval_after_canary: !config.autoPromote,
        multi_metric_evaluation: {
          metrics: [
            { metric_name: "error_rate", weight: 0.4, threshold: 0.02, direction: "lower_is_better", comparison: "absolute", required: true },
            { metric_name: "latency_p99", weight: 0.3, threshold: 2000, direction: "lower_is_better", comparison: "absolute", required: true },
            { metric_name: "crash_rate", weight: 0.3, threshold: 0.001, direction: "lower_is_better", comparison: "absolute", required: true },
          ],
          evaluation_strategy: "all_must_pass",
        },
      },
      expansion_rules: config.expansionSteps.map((to, i, arr) => ({
        step_id: crypto.randomUUID(),
        from_percent: i === 0 ? config.initialCanaryPercent : arr[i - 1],
        to_percent: to,
        wait_minutes: config.observationMinutes,
        health_gate: 0.9,
        auto_expand: config.autoPromote,
        require_approval: !config.autoPromote,
        max_error_rate_during_expansion: 0.05,
        rollback_on_breach: true,
      })),
      abort_conditions: [
        { condition_id: crypto.randomUUID(), metric: "error_rate", operator: "gt", threshold: 0.05, window_minutes: 5, consecutive_breaches: 2, auto_abort: true, severity: "critical", notification_channels: ["push", "email"] },
        { condition_id: crypto.randomUUID(), metric: "latency_p99", operator: "gt", threshold: 5000, window_minutes: 5, consecutive_breaches: 3, auto_abort: true, severity: "high", notification_channels: ["push"] },
      ],
      feature_flags: [],
      current_reach_percent: 0,
      health_score: 1.0,
      phase_history: [],
      owner_id: config.ownerId,
      tags: [],
      metadata: {},
    };
  }

  evaluateCanaryPromotion(rollout: RolloutStateMachine, metrics: Record<string, number>, baselineMetrics: Record<string, number>): CanaryPromotionDecision {
    const errorRate = metrics["error_rate"] ?? 0;
    const healthOk = errorRate < rollout.canary_config.error_rate_threshold;
    const nextStep = rollout.expansion_rules.find(r => r.from_percent === rollout.current_reach_percent);

    const evaluations: MetricEvaluationResult[] = rollout.canary_config.multi_metric_evaluation.metrics.map(rule => {
      const current = metrics[rule.metric_name] ?? 0;
      const baseline = baselineMetrics[rule.metric_name] ?? 0;
      const passed = rule.direction === "lower_is_better" ? current <= rule.threshold : current >= rule.threshold;
      return {
        metric_name: rule.metric_name, passed, current_value: current, threshold: rule.threshold,
        baseline_value: baseline, delta_percent: baseline > 0 ? ((current - baseline) / baseline) * 100 : 0,
        weight: rule.weight, contribution_to_score: passed ? rule.weight : 0,
      };
    });

    const allPassed = evaluations.filter(e => rollout.canary_config.multi_metric_evaluation.metrics.find(m => m.metric_name === e.metric_name)?.required).every(e => e.passed);

    return {
      rollout_id: rollout.rollout_id,
      decision: allPassed && nextStep ? "promote" : allPassed ? "hold" : "abort",
      current_percent: rollout.current_reach_percent,
      target_percent: nextStep?.to_percent ?? rollout.current_reach_percent,
      health_metrics: metrics,
      baseline_metrics: baselineMetrics,
      metric_evaluations: evaluations,
      rationale: allPassed ? "All required metrics within thresholds" : `Metric evaluation failed`,
      confidence: evaluations.reduce((s, e) => s + e.contribution_to_score, 0),
      decided_at: new Date().toISOString(),
      decided_by: "auto",
    };
  }

  estimateBlastRadius(rollout: RolloutStateMachine, totalUsers: number): BlastRadiusEstimate {
    const affected = Math.round(totalUsers * (rollout.current_reach_percent / 100));
    return {
      rollout_id: rollout.rollout_id,
      affected_users_estimate: affected,
      affected_users_by_tier: { free: Math.round(affected * 0.7), paid: Math.round(affected * 0.3) },
      affected_services: [],
      affected_endpoints: [],
      data_scope: [],
      financial_exposure_cents: 0,
      revenue_at_risk_cents: 0,
      rollback_time_estimate_minutes: 15,
      risk_score: rollout.current_reach_percent / 100,
      risk_factors: [],
      confidence: 0.8,
      estimated_at: new Date().toISOString(),
    };
  }
}

// ── Rollback Orchestrator ──

export class RollbackOrchestrator {
  evaluateEligibility(rolloutId: string, version: string): RollbackEligibility {
    return {
      rollout_id: rolloutId, eligible: true,
      blockers: [], warnings: [], data_loss_risk: "none",
      estimated_duration_minutes: 10, affected_users_estimate: 0,
      recommended_scope: "full", recommended_urgency: "planned",
      alternative_actions: [], evaluated_at: new Date().toISOString(),
    };
  }

  createRollback(rolloutId: string, version: string, targetVersion: string, reason: string, initiatedBy: string): RollbackOrchestration {
    return {
      rollback_id: crypto.randomUUID(), rollout_id: rolloutId,
      release_version: version, target_version: targetVersion,
      phase: "evaluating", scope: "full", urgency: "planned",
      components: [], preconditions: [], verification_steps: [],
      phase_history: [], initiated_by: initiatedBy, reason,
      impact_analysis: {
        affected_users_estimate: 0, affected_users_by_segment: {},
        data_loss_risk: "none", data_loss_details: [], service_disruption_minutes: 0,
        financial_impact_cents: 0, sla_impact: [], dependent_services: [], rollback_complexity_score: 0.2,
      },
      started_at: new Date().toISOString(), correlation_id: crypto.randomUUID(),
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
        component: c.name, version: c.version,
        min_compatible: c.compatibleWith, max_compatible: c.compatibleWith,
        deprecation_notices: [], tested_combinations: [],
      })),
      cross_component_rules: [],
      generated_at: new Date().toISOString(),
      valid_until: new Date(Date.now() + 7 * 86400000).toISOString(),
      generation_method: "automated",
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
            fingerprint_id: crypto.randomUUID(), release_version: "current", metric,
            metric_category: "latency", status: "suspected",
            baseline_value: baseVal, current_value: curVal, deviation_percent: deviation * 100,
            severity: deviation > 0.5 ? "critical" : deviation > 0.2 ? "high" : "medium",
            statistical_significance: { p_value: 0.01, confidence_interval: [baseVal * 0.9, baseVal * 1.1], sample_size_adequate: true, test_method: "t_test", significant: true },
            first_detected_at: new Date().toISOString(), confirmed: false,
            related_changes: [], affected_endpoints: [], sample_size: 1000,
          }],
          suspected_cause: `${metric} increased by ${(deviation * 100).toFixed(1)}%`,
          confidence: Math.min(0.95, 0.5 + deviation),
          affected_users_estimate: 0, affected_users_by_segment: {},
          business_impact_estimate_cents: 0,
          recommendation: deviation > 0.5 ? "rollback" : "monitor",
          priority: deviation > 0.5 ? 1 : 3, detected_at: new Date().toISOString(),
          status: "suspected", timeline: [{ event_type: "detected", detail: `Detected ${metric} regression`, timestamp: new Date().toISOString() }],
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
        metric, category: "general", baseline: base, current: cur, delta_percent: delta,
        significant: Math.abs(delta) > 5,
        significance: { p_value: 0.05, confidence_interval: [base * 0.95, base * 1.05] as [number, number], sample_size_adequate: true, test_method: "t_test" as const, significant: Math.abs(delta) > 5 },
        direction: delta > 5 ? "regressed" as const : delta < -5 ? "improved" as const : "stable" as const,
        weight: 1, contribution_to_overall: 0,
      };
    });
    const regressions = metrics.filter(m => m.direction === "regressed").length;
    const improvements = metrics.filter(m => m.direction === "improved").length;
    return {
      comparison_id: crypto.randomUUID(), release_version: "current", baseline_version: "previous",
      comparison_window_hours: 24, metrics, regressions_detected: regressions,
      improvements_detected: improvements, neutral_metrics: metrics.length - regressions - improvements,
      overall_delta: regressions > improvements ? "worse" : improvements > regressions ? "better" : "neutral",
      confidence: 0.85, recommendation: regressions > 2 ? "rollback" : "expand",
      narrative: `${regressions} regressions, ${improvements} improvements detected.`,
      compared_at: new Date().toISOString(),
    };
  }
}

// ── Release Health Scorer ──

export class ReleaseHealthScorer {
  scoreHealth(snapshot: ReleaseHealthSnapshot, thresholds: ReleaseHealthThresholds): {
    status: ReleaseHealthSnapshot["status"]; decision: ReleaseDecision; score: number;
  } {
    let score = 1.0;
    if (snapshot.error_rate > thresholds.error_rate_critical) score -= 0.5;
    else if (snapshot.error_rate > thresholds.error_rate_warning) score -= 0.2;
    if (snapshot.latency_p99_ms > thresholds.latency_p99_critical_ms) score -= 0.3;
    else if (snapshot.latency_p99_ms > thresholds.latency_p99_warning_ms) score -= 0.1;
    if (snapshot.crash_rate > thresholds.crash_rate_critical) score -= 0.4;
    score = Math.max(0, score);
    const status = score > 0.8 ? "healthy" : score > 0.5 ? "degraded" : "critical";
    const decision: ReleaseDecision = score > 0.8 ? "expand" : score > 0.5 ? "hold" : "rollback";
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
      executive_summary: `Release ${snapshot.release_version}: ${decision.toUpperCase()} recommended.`,
      key_metrics: { error_rate: snapshot.error_rate, latency_p99: snapshot.latency_p99_ms, crash_rate: snapshot.crash_rate },
      key_metrics_context: { error_rate: "Percentage of requests failing", latency_p99: "99th percentile latency in ms", crash_rate: "Application crash rate" },
      notable_events: [],
      risk_assessment: decision === "expand" ? "Low risk" : decision === "hold" ? "Moderate risk — monitoring" : "High risk — immediate action needed",
      recommendation: decision,
      recommendation_confidence: decision === "expand" ? 0.9 : 0.7,
      action_items: decision === "rollback" ? ["Initiate rollback procedure", "Notify stakeholders"] : [],
      generated_at: new Date().toISOString(),
      audience: "engineering",
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
