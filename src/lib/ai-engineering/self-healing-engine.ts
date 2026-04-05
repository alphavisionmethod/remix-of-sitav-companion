// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Engineering: Self-Healing Engine
// Bounded, policy-governed autonomous remediation with
// verification, downgrade, and learning integration
// ═══════════════════════════════════════════════════════════════

import type { ChangePlan } from "./change-plan-layer";

export type HealingRiskLevel = "minimal" | "low" | "medium" | "high";

export interface SelfHealingRule {
  ruleId: string;
  name: string;
  description: string;
  triggerCondition: string;
  actionType: string;
  riskLevel: HealingRiskLevel;
  scopeBoundary: string;
  maxFrequency: string;
  verificationMethod: string;
  enabled: boolean;
  totalTriggers: number;
  totalSuccesses: number;
  totalFailures: number;
  lastTriggeredAt?: string;
  downgradedAt?: string;
  downgradeReason?: string;
}

export interface HealingAttempt {
  attemptId: string;
  ruleId: string;
  triggeredAt: string;
  status: "pending" | "executing" | "verifying" | "succeeded" | "failed" | "blocked" | "downgraded";
  detail: string;
  verificationResult?: string;
  durationMs?: number;
}

export class SelfHealingEngine {
  private rules: SelfHealingRule[] = [];
  private attempts: HealingAttempt[] = [];

  constructor() {
    this.rules = this.getDefaultRules();
  }

  private getDefaultRules(): SelfHealingRule[] {
    return [
      { ruleId: "sh-1", name: "Restart unhealthy noncritical process", description: "Auto-restart processes that fail health checks for >2 min", triggerCondition: "health_check_fail_count > 3", actionType: "restart-process", riskLevel: "minimal", scopeBoundary: "Non-critical services only", maxFrequency: "3/hour", verificationMethod: "Health check passes after restart", enabled: true, totalTriggers: 12, totalSuccesses: 11, totalFailures: 1 },
      { ruleId: "sh-2", name: "Revert recent bad feature flag", description: "Auto-revert feature flags that cause error rate spike within 90 min", triggerCondition: "error_rate > 2x_baseline AND flag_changed_within_90m", actionType: "revert-flag", riskLevel: "low", scopeBoundary: "Feature flags only, not core config", maxFrequency: "1/hour", verificationMethod: "Error rate returns to baseline", enabled: true, totalTriggers: 5, totalSuccesses: 5, totalFailures: 0 },
      { ruleId: "sh-3", name: "Disable broken panel behind feature flag", description: "Hide broken UI panel if render errors exceed threshold", triggerCondition: "panel_render_errors > 5 within 10m", actionType: "disable-panel", riskLevel: "low", scopeBoundary: "Non-critical UI panels", maxFrequency: "2/hour", verificationMethod: "No more render errors from panel", enabled: true, totalTriggers: 3, totalSuccesses: 3, totalFailures: 0 },
      { ruleId: "sh-4", name: "Invalidate stale CDN cache", description: "Auto-invalidate cache when data mutation detected", triggerCondition: "brand_kit_or_content_updated AND cache_age > TTL", actionType: "invalidate-cache", riskLevel: "minimal", scopeBoundary: "CDN cache only", maxFrequency: "10/hour", verificationMethod: "Fresh content served", enabled: true, totalTriggers: 28, totalSuccesses: 28, totalFailures: 0 },
      { ruleId: "sh-5", name: "Retry stuck sync job", description: "Auto-retry connector sync jobs stuck for >15 min", triggerCondition: "sync_job_stuck_duration > 15m", actionType: "retry-sync", riskLevel: "low", scopeBoundary: "Connector sync jobs only", maxFrequency: "2/hour", verificationMethod: "Sync completes or escalates", enabled: true, totalTriggers: 8, totalSuccesses: 7, totalFailures: 1 },
      { ruleId: "sh-6", name: "Auto-fix broken internal route mapping", description: "Restore known-good route when route error detected", triggerCondition: "route_404_on_known_path", actionType: "restore-route", riskLevel: "low", scopeBoundary: "Internal admin routes", maxFrequency: "1/hour", verificationMethod: "Route resolves correctly", enabled: true, totalTriggers: 2, totalSuccesses: 2, totalFailures: 0 },
      { ruleId: "sh-7", name: "Restore known-good layout variant", description: "Revert to last-known-good layout if visual regression detected", triggerCondition: "visual_regression_score > threshold", actionType: "restore-layout", riskLevel: "medium", scopeBoundary: "Non-critical pages only", maxFrequency: "1/day", verificationMethod: "Visual regression score returns to normal", enabled: false, totalTriggers: 1, totalSuccesses: 0, totalFailures: 1, downgradedAt: "2026-04-01T10:00:00Z", downgradeReason: "Layout restore caused secondary layout shift" },
    ];
  }

  canAutoHeal(rule: SelfHealingRule): { allowed: boolean; reason: string } {
    if (!rule.enabled) return { allowed: false, reason: "Rule is disabled" };
    if (rule.downgradedAt) return { allowed: false, reason: `Downgraded: ${rule.downgradeReason}` };
    if (rule.riskLevel === "high") return { allowed: false, reason: "High-risk rules require approval" };
    const failureRate = rule.totalTriggers > 0 ? rule.totalFailures / rule.totalTriggers : 0;
    if (failureRate > 0.2) return { allowed: false, reason: `Failure rate too high (${Math.round(failureRate * 100)}%)` };
    return { allowed: true, reason: "Within safe boundaries" };
  }

  triggerHeal(ruleId: string): HealingAttempt {
    const rule = this.rules.find(r => r.ruleId === ruleId);
    const canHeal = rule ? this.canAutoHeal(rule) : { allowed: false, reason: "Rule not found" };

    const attempt: HealingAttempt = {
      attemptId: `heal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ruleId,
      triggeredAt: new Date().toISOString(),
      status: canHeal.allowed ? "executing" : "blocked",
      detail: canHeal.allowed ? `Executing ${rule?.actionType}` : canHeal.reason,
    };

    if (rule && canHeal.allowed) {
      rule.totalTriggers++;
      rule.lastTriggeredAt = attempt.triggeredAt;
    }

    this.attempts.push(attempt);
    return attempt;
  }

  getRules(): SelfHealingRule[] {
    return [...this.rules];
  }

  getAttempts(limit = 20): HealingAttempt[] {
    return this.attempts.slice(-limit);
  }

  downgradeRule(ruleId: string, reason: string) {
    const rule = this.rules.find(r => r.ruleId === ruleId);
    if (rule) {
      rule.enabled = false;
      rule.downgradedAt = new Date().toISOString();
      rule.downgradeReason = reason;
    }
  }
}
