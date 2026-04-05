// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Engineering: Self-Healing Engine
// Bounded, policy-governed autonomous remediation with
// verification, downgrade, shadow mode, canary mode, blast
// radius estimation, and learning integration
// ═══════════════════════════════════════════════════════════════

import type { ChangePlan } from "./change-plan-layer";

export type HealingRiskLevel = "minimal" | "low" | "medium" | "high";
export type HealingMode = "live" | "shadow" | "canary" | "disabled";

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
  mode: HealingMode;
  enabled: boolean;
  totalTriggers: number;
  totalSuccesses: number;
  totalFailures: number;
  estimatedBlastRadius: "isolated" | "component" | "surface";
  environmentRestrictions: ("preview" | "staging" | "production")[];
  lastTriggeredAt?: string;
  downgradedAt?: string;
  downgradeReason?: string;
}

export interface HealingAttempt {
  attemptId: string;
  ruleId: string;
  triggeredAt: string;
  mode: HealingMode;
  status: "pending" | "executing" | "verifying" | "succeeded" | "failed" | "blocked" | "downgraded" | "shadow-recorded" | "canary-passed" | "canary-failed";
  detail: string;
  verificationResult?: string;
  durationMs?: number;
  environment: "preview" | "staging" | "production";
  blastRadiusActual?: string;
  rollbackExecuted?: boolean;
  learningEventId?: string;
}

export interface HealingPolicy {
  maxConcurrentHeals: number;
  globalPause: boolean;
  requirePostVerification: boolean;
  autoDowngradeOnFailure: boolean;
  autoDowngradeThreshold: number; // failure rate %
  shadowModeDefault: boolean;
  canaryPercentage: number; // 0-100
  humanEscalationOnHighRisk: boolean;
}

const DEFAULT_POLICY: HealingPolicy = {
  maxConcurrentHeals: 3,
  globalPause: false,
  requirePostVerification: true,
  autoDowngradeOnFailure: true,
  autoDowngradeThreshold: 20,
  shadowModeDefault: false,
  canaryPercentage: 10,
  humanEscalationOnHighRisk: true,
};

export class SelfHealingEngine {
  private rules: SelfHealingRule[] = [];
  private attempts: HealingAttempt[] = [];
  private policy: HealingPolicy;
  private activeHeals = 0;

  constructor(policy: Partial<HealingPolicy> = {}) {
    this.policy = { ...DEFAULT_POLICY, ...policy };
    this.rules = this.getDefaultRules();
  }

  private getDefaultRules(): SelfHealingRule[] {
    return [
      { ruleId: "sh-1", name: "Restart unhealthy noncritical process", description: "Auto-restart processes that fail health checks for >2 min", triggerCondition: "health_check_fail_count > 3", actionType: "restart-process", riskLevel: "minimal", scopeBoundary: "Non-critical services only", maxFrequency: "3/hour", verificationMethod: "Health check passes after restart", mode: "live", enabled: true, totalTriggers: 12, totalSuccesses: 11, totalFailures: 1, estimatedBlastRadius: "isolated", environmentRestrictions: ["preview", "staging"] },
      { ruleId: "sh-2", name: "Revert recent bad feature flag", description: "Auto-revert feature flags that cause error rate spike within 90 min", triggerCondition: "error_rate > 2x_baseline AND flag_changed_within_90m", actionType: "revert-flag", riskLevel: "low", scopeBoundary: "Feature flags only, not core config", maxFrequency: "1/hour", verificationMethod: "Error rate returns to baseline", mode: "live", enabled: true, totalTriggers: 5, totalSuccesses: 5, totalFailures: 0, estimatedBlastRadius: "component", environmentRestrictions: ["preview", "staging", "production"] },
      { ruleId: "sh-3", name: "Disable broken panel behind feature flag", description: "Hide broken UI panel if render errors exceed threshold", triggerCondition: "panel_render_errors > 5 within 10m", actionType: "disable-panel", riskLevel: "low", scopeBoundary: "Non-critical UI panels", maxFrequency: "2/hour", verificationMethod: "No more render errors from panel", mode: "live", enabled: true, totalTriggers: 3, totalSuccesses: 3, totalFailures: 0, estimatedBlastRadius: "component", environmentRestrictions: ["preview", "staging"] },
      { ruleId: "sh-4", name: "Invalidate stale CDN cache", description: "Auto-invalidate cache when data mutation detected", triggerCondition: "brand_kit_or_content_updated AND cache_age > TTL", actionType: "invalidate-cache", riskLevel: "minimal", scopeBoundary: "CDN cache only", maxFrequency: "10/hour", verificationMethod: "Fresh content served", mode: "live", enabled: true, totalTriggers: 28, totalSuccesses: 28, totalFailures: 0, estimatedBlastRadius: "isolated", environmentRestrictions: ["preview", "staging", "production"] },
      { ruleId: "sh-5", name: "Retry stuck sync job", description: "Auto-retry connector sync jobs stuck for >15 min", triggerCondition: "sync_job_stuck_duration > 15m", actionType: "retry-sync", riskLevel: "low", scopeBoundary: "Connector sync jobs only", maxFrequency: "2/hour", verificationMethod: "Sync completes or escalates", mode: "live", enabled: true, totalTriggers: 8, totalSuccesses: 7, totalFailures: 1, estimatedBlastRadius: "isolated", environmentRestrictions: ["preview", "staging"] },
      { ruleId: "sh-6", name: "Auto-fix broken internal route mapping", description: "Restore known-good route when route error detected", triggerCondition: "route_404_on_known_path", actionType: "restore-route", riskLevel: "low", scopeBoundary: "Internal admin routes", maxFrequency: "1/hour", verificationMethod: "Route resolves correctly", mode: "live", enabled: true, totalTriggers: 2, totalSuccesses: 2, totalFailures: 0, estimatedBlastRadius: "isolated", environmentRestrictions: ["preview", "staging"] },
      { ruleId: "sh-7", name: "Restore known-good layout variant", description: "Revert to last-known-good layout if visual regression detected", triggerCondition: "visual_regression_score > threshold", actionType: "restore-layout", riskLevel: "medium", scopeBoundary: "Non-critical pages only", maxFrequency: "1/day", verificationMethod: "Visual regression score returns to normal", mode: "shadow", enabled: false, totalTriggers: 1, totalSuccesses: 0, totalFailures: 1, estimatedBlastRadius: "surface", environmentRestrictions: ["preview"], downgradedAt: "2026-04-01T10:00:00Z", downgradeReason: "Layout restore caused secondary layout shift" },
    ];
  }

  // ── Heal eligibility ───────────────────────────────────────

  canAutoHeal(rule: SelfHealingRule, environment: "preview" | "staging" | "production" = "preview"): { allowed: boolean; reason: string } {
    if (this.policy.globalPause) return { allowed: false, reason: "Global healing pause active" };
    if (!rule.enabled) return { allowed: false, reason: "Rule is disabled" };
    if (rule.downgradedAt) return { allowed: false, reason: `Downgraded: ${rule.downgradeReason}` };
    if (rule.riskLevel === "high") return { allowed: false, reason: "High-risk rules require approval" };
    if (!rule.environmentRestrictions.includes(environment)) return { allowed: false, reason: `Rule not allowed in ${environment}` };
    if (this.activeHeals >= this.policy.maxConcurrentHeals) return { allowed: false, reason: `Max concurrent heals (${this.policy.maxConcurrentHeals}) reached` };

    const failureRate = rule.totalTriggers > 0 ? rule.totalFailures / rule.totalTriggers : 0;
    if (failureRate * 100 > this.policy.autoDowngradeThreshold) {
      return { allowed: false, reason: `Failure rate ${Math.round(failureRate * 100)}% exceeds ${this.policy.autoDowngradeThreshold}% threshold` };
    }

    if (rule.riskLevel === "medium" && this.policy.humanEscalationOnHighRisk) {
      return { allowed: false, reason: "Medium-risk — escalated to human" };
    }

    return { allowed: true, reason: "Within safe boundaries" };
  }

  // ── Trigger heal ───────────────────────────────────────────

  triggerHeal(ruleId: string, environment: "preview" | "staging" | "production" = "preview"): HealingAttempt {
    const rule = this.rules.find(r => r.ruleId === ruleId);
    const canHeal = rule ? this.canAutoHeal(rule, environment) : { allowed: false, reason: "Rule not found" };

    // Shadow mode — record but don't execute
    if (rule?.mode === "shadow") {
      const attempt: HealingAttempt = {
        attemptId: `heal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        ruleId,
        triggeredAt: new Date().toISOString(),
        mode: "shadow",
        status: "shadow-recorded",
        detail: `Shadow mode: Would have executed ${rule.actionType} but recorded instead`,
        environment,
      };
      this.attempts.push(attempt);
      return attempt;
    }

    // Canary mode — execute on limited scope
    if (rule?.mode === "canary") {
      const attempt: HealingAttempt = {
        attemptId: `heal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        ruleId,
        triggeredAt: new Date().toISOString(),
        mode: "canary",
        status: canHeal.allowed ? "executing" : "blocked",
        detail: canHeal.allowed ? `Canary: Executing ${rule.actionType} on ${this.policy.canaryPercentage}% traffic` : canHeal.reason,
        environment,
      };
      if (rule && canHeal.allowed) {
        rule.totalTriggers++;
        rule.lastTriggeredAt = attempt.triggeredAt;
        this.activeHeals++;
      }
      this.attempts.push(attempt);
      return attempt;
    }

    // Live mode
    const attempt: HealingAttempt = {
      attemptId: `heal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ruleId,
      triggeredAt: new Date().toISOString(),
      mode: "live",
      status: canHeal.allowed ? "executing" : "blocked",
      detail: canHeal.allowed ? `Executing ${rule?.actionType}` : canHeal.reason,
      environment,
    };

    if (rule && canHeal.allowed) {
      rule.totalTriggers++;
      rule.lastTriggeredAt = attempt.triggeredAt;
      this.activeHeals++;
    }

    this.attempts.push(attempt);
    return attempt;
  }

  // ── Post-verification ──────────────────────────────────────

  verifyHeal(attemptId: string, success: boolean, detail: string): HealingAttempt | null {
    const attempt = this.attempts.find(a => a.attemptId === attemptId);
    if (!attempt) return null;

    const rule = this.rules.find(r => r.ruleId === attempt.ruleId);

    if (success) {
      attempt.status = attempt.mode === "canary" ? "canary-passed" : "succeeded";
      attempt.verificationResult = detail;
      if (rule) rule.totalSuccesses++;
    } else {
      attempt.status = attempt.mode === "canary" ? "canary-failed" : "failed";
      attempt.verificationResult = detail;
      if (rule) {
        rule.totalFailures++;
        // Auto-downgrade on failure if policy says so
        if (this.policy.autoDowngradeOnFailure) {
          const failureRate = rule.totalTriggers > 0 ? (rule.totalFailures / rule.totalTriggers) * 100 : 0;
          if (failureRate > this.policy.autoDowngradeThreshold) {
            this.downgradeRule(rule.ruleId, `Auto-downgraded: failure rate ${Math.round(failureRate)}% exceeds threshold`);
          }
        }
      }
    }

    this.activeHeals = Math.max(0, this.activeHeals - 1);
    return attempt;
  }

  // ── Rule management ────────────────────────────────────────

  downgradeRule(ruleId: string, reason: string) {
    const rule = this.rules.find(r => r.ruleId === ruleId);
    if (rule) {
      rule.enabled = false;
      rule.downgradedAt = new Date().toISOString();
      rule.downgradeReason = reason;
    }
  }

  upgradeRule(ruleId: string) {
    const rule = this.rules.find(r => r.ruleId === ruleId);
    if (rule) {
      rule.enabled = true;
      rule.downgradedAt = undefined;
      rule.downgradeReason = undefined;
    }
  }

  setRuleMode(ruleId: string, mode: HealingMode) {
    const rule = this.rules.find(r => r.ruleId === ruleId);
    if (rule) rule.mode = mode;
  }

  // ── Policy management ──────────────────────────────────────

  pauseAll() { this.policy.globalPause = true; }
  resumeAll() { this.policy.globalPause = false; }
  getPolicy(): HealingPolicy { return { ...this.policy }; }
  updatePolicy(updates: Partial<HealingPolicy>) { this.policy = { ...this.policy, ...updates }; }

  // ── Queries ────────────────────────────────────────────────

  getRules(): SelfHealingRule[] { return [...this.rules]; }
  getAttempts(limit = 20): HealingAttempt[] { return this.attempts.slice(-limit); }
  getActiveHealCount(): number { return this.activeHeals; }
  getShadowRecords(): HealingAttempt[] { return this.attempts.filter(a => a.mode === "shadow"); }
  getCanaryResults(): HealingAttempt[] { return this.attempts.filter(a => a.mode === "canary"); }
  getFailedAttempts(): HealingAttempt[] { return this.attempts.filter(a => a.status === "failed" || a.status === "canary-failed"); }
}
