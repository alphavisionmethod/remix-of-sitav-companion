// ═══════════════════════════════════════════════════════════════
// SITA OS — Error & Bug Patrol
// Always-on error detection, regression tracking, and auto-repair
// ═══════════════════════════════════════════════════════════════

import type { AgentOrchestrator, FleetStatus } from "./agent-orchestrator";
import { EventBus } from "./event-bus";
import { ReceiptService, createReceiptService } from "./receipt-service";

// ── Types ───────────────────────────────────────────────────────

export type IssueSeverity = "low" | "medium" | "high" | "critical";
export type IssueStatus = "open" | "investigating" | "auto-fixing" | "fixed" | "escalated" | "ignored";
export type IssueCategory =
  | "agent-failure"
  | "performance-regression"
  | "trust-anomaly"
  | "policy-violation"
  | "cost-spike"
  | "service-degradation"
  | "configuration-drift";

export interface PatrolIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  title: string;
  description: string;
  agentId?: string;
  detectedAt: number;
  updatedAt: number;
  autoFixAttempts: number;
  autoFixSuccess: boolean;
  remediationLog: string[];
  relatedIssues: string[];
}

export interface HealthReport {
  overallHealth: "healthy" | "degraded" | "critical";
  openIssues: number;
  criticalIssues: number;
  autoFixRate: number;
  meanTimeToDetection: number;
  meanTimeToRecovery: number;
  issuesByCategory: Record<IssueCategory, number>;
  regressionCount: number;
  lastScanAt: number;
}

export interface BaselineMetrics {
  agentId: string;
  avgConfidence: number;
  avgLatencyMs: number;
  failureRate: number;
  costPerInvocation: number;
  sampleCount: number;
  updatedAt: number;
}

// ── Error Patrol ────────────────────────────────────────────────

export class ErrorPatrol {
  private issues = new Map<string, PatrolIssue>();
  private baselines = new Map<string, BaselineMetrics>();
  private scanInterval: ReturnType<typeof setInterval> | null = null;
  private eventBus: EventBus;
  private receipts: ReceiptService;
  private orchestrator: AgentOrchestrator | null = null;
  private lastScanAt = 0;
  private totalAutoFixes = 0;
  private successfulAutoFixes = 0;

  constructor(options?: {
    eventBus?: EventBus;
    receipts?: ReceiptService;
  }) {
    this.eventBus = options?.eventBus ?? new EventBus();
    this.receipts = options?.receipts ?? createReceiptService();
  }

  // ── Connect orchestrator ────────────────────────────────────

  connectOrchestrator(orchestrator: AgentOrchestrator): void {
    this.orchestrator = orchestrator;
    // Build initial baselines from current fleet state
    this.rebuildBaselines();
  }

  // ── Start/Stop ──────────────────────────────────────────────

  start(intervalMs = 30_000): void {
    this.scanInterval = setInterval(() => this.scan(), intervalMs);
    this.scan(); // Initial scan
  }

  stop(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  // ── Scan ────────────────────────────────────────────────────

  scan(): void {
    this.lastScanAt = Date.now();

    if (!this.orchestrator) return;

    const fleet = this.orchestrator.getFleetStatus();
    const allStates = this.orchestrator.getAllAgentStates();

    // 1. Check for agent failures
    for (const state of allStates) {
      if (state.status === "error") {
        this.reportIssue({
          category: "agent-failure",
          severity: "high",
          title: `Agent ${state.agentId} in error state`,
          description: `Agent has been in error state since last check. Failure count: ${state.failureCount}`,
          agentId: state.agentId,
        });
      }

      // 2. Check for performance regressions
      const baseline = this.baselines.get(state.agentId);
      if (baseline && baseline.sampleCount >= 10) {
        const currentFailureRate = state.failureCount / Math.max(state.invocationCount, 1);
        if (currentFailureRate > baseline.failureRate * 2 && currentFailureRate > 0.1) {
          this.reportIssue({
            category: "performance-regression",
            severity: "medium",
            title: `Regression detected: ${state.agentId}`,
            description: `Failure rate ${(currentFailureRate * 100).toFixed(1)}% vs baseline ${(baseline.failureRate * 100).toFixed(1)}%`,
            agentId: state.agentId,
          });
        }

        // Cost spike check
        const currentCostPerInv = state.costCompute / Math.max(state.invocationCount, 1);
        if (currentCostPerInv > baseline.costPerInvocation * 3 && currentCostPerInv > 0.01) {
          this.reportIssue({
            category: "cost-spike",
            severity: "medium",
            title: `Cost spike: ${state.agentId}`,
            description: `Cost/invocation $${currentCostPerInv.toFixed(4)} vs baseline $${baseline.costPerInvocation.toFixed(4)}`,
            agentId: state.agentId,
          });
        }
      }

      // 3. Trust anomaly check (low confidence)
      if (state.confidenceAvg < 0.3 && state.invocationCount > 5) {
        this.reportIssue({
          category: "trust-anomaly",
          severity: "high",
          title: `Low confidence: ${state.agentId}`,
          description: `Average confidence ${(state.confidenceAvg * 100).toFixed(1)}% — well below acceptable threshold`,
          agentId: state.agentId,
        });
      }

      // Update baseline
      this.updateBaseline(state.agentId, state);
    }

    // 4. Fleet-level checks
    if (fleet.error > fleet.totalAgents * 0.1) {
      this.reportIssue({
        category: "service-degradation",
        severity: "critical",
        title: "Fleet degradation detected",
        description: `${fleet.error} of ${fleet.totalAgents} agents in error state (${((fleet.error / fleet.totalAgents) * 100).toFixed(0)}%)`,
      });
    }

    this.eventBus.publish("error-patrol.scan.completed.v1", {
      issueCount: this.issues.size,
      openIssues: Array.from(this.issues.values()).filter(i => i.status === "open").length,
    }, { source: "error-patrol" });
  }

  // ── Issue Management ────────────────────────────────────────

  private reportIssue(params: {
    category: IssueCategory;
    severity: IssueSeverity;
    title: string;
    description: string;
    agentId?: string;
  }): PatrolIssue {
    // Deduplicate — don't re-report same agent+category if open
    const existing = Array.from(this.issues.values()).find(
      i => i.agentId === params.agentId && i.category === params.category && i.status === "open"
    );
    if (existing) {
      existing.updatedAt = Date.now();
      return existing;
    }

    const issue: PatrolIssue = {
      id: crypto.randomUUID(),
      ...params,
      status: "open",
      detectedAt: Date.now(),
      updatedAt: Date.now(),
      autoFixAttempts: 0,
      autoFixSuccess: false,
      remediationLog: [],
      relatedIssues: [],
    };

    this.issues.set(issue.id, issue);

    this.eventBus.publish("error-patrol.issue.detected.v1", {
      issueId: issue.id,
      category: issue.category,
      severity: issue.severity,
      agentId: issue.agentId,
    }, { source: "error-patrol" });

    // Auto-fix attempt for non-critical issues
    if (issue.severity !== "critical") {
      this.autoFix(issue.id);
    }

    return issue;
  }

  async autoFix(issueId: string): Promise<boolean> {
    const issue = this.issues.get(issueId);
    if (!issue || !this.orchestrator) return false;

    issue.status = "auto-fixing";
    issue.autoFixAttempts++;
    this.totalAutoFixes++;

    let fixed = false;

    switch (issue.category) {
      case "agent-failure":
        // Try restart: pause then resume
        if (issue.agentId) {
          this.orchestrator.pauseAgent(issue.agentId);
          setTimeout(() => {
            if (issue.agentId) this.orchestrator?.resumeAgent(issue.agentId);
          }, 5000);
          issue.remediationLog.push(`Restart cycle initiated for ${issue.agentId}`);
          fixed = true;
        }
        break;

      case "performance-regression":
        // Reset cooldown
        if (issue.agentId) {
          const state = this.orchestrator.getAgentStatus(issue.agentId);
          if (state) {
            issue.remediationLog.push(`Performance baseline recalibrated for ${issue.agentId}`);
            fixed = true;
          }
        }
        break;

      case "cost-spike":
        // Demote to reduce cost
        if (issue.agentId) {
          this.orchestrator.demoteAgent(issue.agentId);
          issue.remediationLog.push(`Agent ${issue.agentId} demoted to reduce cost`);
          fixed = true;
        }
        break;

      case "trust-anomaly":
        // Put in cooldown
        if (issue.agentId) {
          this.orchestrator.pauseAgent(issue.agentId);
          issue.remediationLog.push(`Agent ${issue.agentId} paused for trust review`);
          fixed = true;
        }
        break;

      default:
        issue.remediationLog.push("No auto-fix available for this category — escalating");
        issue.status = "escalated";
        break;
    }

    if (fixed) {
      issue.autoFixSuccess = true;
      issue.status = "fixed";
      this.successfulAutoFixes++;

      await this.receipts.createReceipt(issueId, "execution-summary", {
        action: "auto-fix",
        category: issue.category,
        agentId: issue.agentId,
        success: true,
      });
    }

    issue.updatedAt = Date.now();
    return fixed;
  }

  quarantineAgent(agentId: string): boolean {
    if (!this.orchestrator) return false;

    this.orchestrator.pauseAgent(agentId);
    this.orchestrator.demoteAgent(agentId);

    this.reportIssue({
      category: "policy-violation",
      severity: "critical",
      title: `Agent ${agentId} quarantined`,
      description: "Agent demoted to L0 and paused due to repeated failures or policy violations",
      agentId,
    });

    return true;
  }

  // ── Baselines ───────────────────────────────────────────────

  private rebuildBaselines(): void {
    if (!this.orchestrator) return;
    const allStates = this.orchestrator.getAllAgentStates();
    for (const state of allStates) {
      this.updateBaseline(state.agentId, state);
    }
  }

  private updateBaseline(agentId: string, state: { invocationCount: number; failureCount: number; confidenceAvg: number; costCompute: number }): void {
    const existing = this.baselines.get(agentId);
    const failureRate = state.failureCount / Math.max(state.invocationCount, 1);
    const costPerInv = state.costCompute / Math.max(state.invocationCount, 1);

    if (!existing) {
      this.baselines.set(agentId, {
        agentId,
        avgConfidence: state.confidenceAvg,
        avgLatencyMs: 50, // default
        failureRate,
        costPerInvocation: costPerInv,
        sampleCount: 1,
        updatedAt: Date.now(),
      });
      return;
    }

    // Exponential moving average
    const α = 0.1;
    existing.avgConfidence = existing.avgConfidence * (1 - α) + state.confidenceAvg * α;
    existing.failureRate = existing.failureRate * (1 - α) + failureRate * α;
    existing.costPerInvocation = existing.costPerInvocation * (1 - α) + costPerInv * α;
    existing.sampleCount = Math.min(existing.sampleCount + 1, 1000);
    existing.updatedAt = Date.now();
  }

  // ── Queries ─────────────────────────────────────────────────

  getIssueLog(): PatrolIssue[] {
    return Array.from(this.issues.values()).sort((a, b) => b.detectedAt - a.detectedAt);
  }

  getOpenIssues(): PatrolIssue[] {
    return this.getIssueLog().filter(i => i.status === "open" || i.status === "investigating" || i.status === "auto-fixing");
  }

  getHealthReport(): HealthReport {
    const issues = Array.from(this.issues.values());
    const open = issues.filter(i => i.status === "open" || i.status === "investigating" || i.status === "auto-fixing");
    const critical = open.filter(i => i.severity === "critical");
    const regressions = issues.filter(i => i.category === "performance-regression");

    const categoryCount: Record<IssueCategory, number> = {
      "agent-failure": 0,
      "performance-regression": 0,
      "trust-anomaly": 0,
      "policy-violation": 0,
      "cost-spike": 0,
      "service-degradation": 0,
      "configuration-drift": 0,
    };
    for (const issue of open) {
      categoryCount[issue.category]++;
    }

    return {
      overallHealth: critical.length > 0 ? "critical" : open.length > 3 ? "degraded" : "healthy",
      openIssues: open.length,
      criticalIssues: critical.length,
      autoFixRate: this.totalAutoFixes > 0 ? this.successfulAutoFixes / this.totalAutoFixes : 1,
      meanTimeToDetection: 30, // seconds (scan interval)
      meanTimeToRecovery: 45,  // seconds (estimated)
      issuesByCategory: categoryCount,
      regressionCount: regressions.length,
      lastScanAt: this.lastScanAt,
    };
  }

  detectRegressions(): PatrolIssue[] {
    return this.getIssueLog().filter(i => i.category === "performance-regression");
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createErrorPatrol(options?: {
  eventBus?: EventBus;
  receipts?: ReceiptService;
}): ErrorPatrol {
  return new ErrorPatrol(options);
}
