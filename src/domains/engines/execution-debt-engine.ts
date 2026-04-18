// ═══════════════════════════════════════════════════════════════
// SITA OS — Execution Debt Engine
// Pure computation for execution debt from stuck workflows,
// manual fallbacks, connector retries, and degraded patterns.
// ═══════════════════════════════════════════════════════════════

import type {
  ExecutionDebtRecord, ExecutionDebtCategory,
  DebtSource, DebtEvidence,
  GovernanceBoardroomSection, RemediationStatus,
} from "../types/meta-governance.types";
import type { ActionState, ActionRecord, EntityScope, OSDomain } from "../types/os-unified.types";
import { computeAging, EXECUTION_AGING_MS } from "./shared/aging";

export class ExecutionDebtEngine {
  private ledger: Map<string, ExecutionDebtRecord> = new Map();

  /** Record execution debt */
  record(input: {
    category: ExecutionDebtCategory;
    severity: ExecutionDebtRecord["severity"];
    source: DebtSource;
    entityScope: EntityScope;
    domain: OSDomain;
    workflowFamily: string;
    actionStateBottleneck: ActionState;
    evidence: DebtEvidence[];
    sourceActionIds: string[];
    patternCount: number;
    downstreamImpact: string[];
    affectedEntities: string[];
    recommendation: string;
    remediationType: ExecutionDebtRecord["remediationType"];
    remediationOwner?: string;
    correlationId?: string;
  }): ExecutionDebtRecord {
    const id = `ed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const record: ExecutionDebtRecord = {
      id,
      ...input,
      aging: computeAging(now, EXECUTION_AGING_MS),
      remediationStatus: "open",
      remediationOwner: input.remediationOwner ?? input.source.id,
      trend: "stable",
    };
    this.ledger.set(id, record);
    return record;
  }

  /** Detect execution debt from stuck/aging action records */
  detectFromActions(actions: ActionRecord[]): ExecutionDebtRecord[] {
    const debts: ExecutionDebtRecord[] = [];
    const workflowGroups = new Map<string, ActionRecord[]>();

    for (const action of actions) {
      const group = workflowGroups.get(action.workflowId) ?? [];
      group.push(action);
      workflowGroups.set(action.workflowId, group);
    }

    for (const [workflowId, group] of workflowGroups) {
      // Stuck workflows
      const stuck = group.filter(a => a.stuckSince);
      if (stuck.length > 0) {
        debts.push(this.record({
          category: "stuck_workflow",
          severity: stuck.length > 2 ? "critical" : "high",
          source: { type: "workflow", id: workflowId, name: `Workflow ${workflowId}` },
          entityScope: stuck[0].entityScope,
          domain: stuck[0].domain,
          workflowFamily: workflowId,
          actionStateBottleneck: stuck[0].currentState,
          evidence: stuck.map(a => ({
            sourceEventId: a.id,
            timestamp: a.stuckSince ?? a.updatedAt,
            metric: "stuck_duration_ms",
            value: Date.now() - new Date(a.stuckSince ?? a.updatedAt).getTime(),
            description: `Stuck in ${a.currentState} since ${a.stuckSince}`,
          })),
          sourceActionIds: stuck.map(a => a.id),
          patternCount: stuck.length,
          downstreamImpact: stuck.flatMap(a => a.dependsOn),
          affectedEntities: [stuck[0].entityScope.ownerId],
          recommendation: "Review and unblock stuck workflows or trigger rollback",
          remediationType: "manual_fix",
        }));
      }

      // Repeated failures (rolled_back or failed states)
      const failures = group.filter(a => a.currentState === "failed" || a.currentState === "rolled_back");
      if (failures.length >= 2) {
        debts.push(this.record({
          category: "repeated_recovery",
          severity: failures.length >= 5 ? "critical" : "medium",
          source: { type: "workflow", id: workflowId, name: `Workflow ${workflowId}` },
          entityScope: failures[0].entityScope,
          domain: failures[0].domain,
          workflowFamily: workflowId,
          actionStateBottleneck: "failed",
          evidence: failures.map(a => ({
            sourceEventId: a.id,
            timestamp: a.updatedAt,
            metric: "failure_count",
            value: 1,
            description: `Failed/rolled back: ${a.currentState}`,
          })),
          sourceActionIds: failures.map(a => a.id),
          patternCount: failures.length,
          downstreamImpact: [],
          affectedEntities: [failures[0].entityScope.ownerId],
          recommendation: "Investigate root cause of repeated failures and harden workflow",
          remediationType: "connector_hardening",
        }));
      }

      // High time in non-terminal states
      const aging = group.filter(a => {
        if (["verified", "archived"].includes(a.currentState)) return false;
        const last = a.stateHistory[a.stateHistory.length - 1];
        if (!last) return false;
        return Date.now() - new Date(last.timestamp).getTime() > 60 * 60 * 1000; // 1h
      });
      if (aging.length > 0 && !stuck.length) {
        debts.push(this.record({
          category: "high_time_in_state",
          severity: "medium",
          source: { type: "workflow", id: workflowId, name: `Workflow ${workflowId}` },
          entityScope: aging[0].entityScope,
          domain: aging[0].domain,
          workflowFamily: workflowId,
          actionStateBottleneck: aging[0].currentState,
          evidence: aging.map(a => ({
            sourceEventId: a.id,
            timestamp: a.updatedAt,
            metric: "time_in_state_ms",
            value: Date.now() - new Date(a.stateHistory[a.stateHistory.length - 1]?.timestamp ?? a.updatedAt).getTime(),
            description: `In ${a.currentState} for extended period`,
          })),
          sourceActionIds: aging.map(a => a.id),
          patternCount: aging.length,
          downstreamImpact: [],
          affectedEntities: [aging[0].entityScope.ownerId],
          recommendation: "Review aging workflows and expedite or archive",
          remediationType: "manual_fix",
        }));
      }
    }
    return debts;
  }

  /** Update remediation */
  updateRemediation(id: string, status: RemediationStatus, owner?: string): ExecutionDebtRecord | null {
    const record = this.ledger.get(id);
    if (!record) return null;
    record.remediationStatus = status;
    if (owner) record.remediationOwner = owner;
    if (status === "resolved" || status === "mitigated") record.trend = "improving";
    return record;
  }

  /** Refresh aging */
  refreshAging(): void {
    for (const record of this.ledger.values()) {
      record.aging = computeAging(record.aging.detectedAt, EXECUTION_AGING_MS);
    }
  }

  /** Get full ledger */
  getLedger(): ExecutionDebtRecord[] {
    return Array.from(this.ledger.values());
  }

  /** Get by workflow family */
  getByWorkflowFamily(family: string): ExecutionDebtRecord[] {
    return this.getLedger().filter(r => r.workflowFamily === family);
  }

  /** Get by category */
  getByCategory(category: ExecutionDebtCategory): ExecutionDebtRecord[] {
    return this.getLedger().filter(r => r.category === category);
  }

  /** Get heatmap data: category × domain */
  getHeatmap(): { category: ExecutionDebtCategory; domain: OSDomain; count: number; severity: ExecutionDebtRecord["severity"] }[] {
    const map = new Map<string, { category: ExecutionDebtCategory; domain: OSDomain; count: number; maxSeverity: number }>();
    const sevOrder = { low: 0, medium: 1, high: 2, critical: 3 };
    const sevNames: ExecutionDebtRecord["severity"][] = ["low", "medium", "high", "critical"];

    for (const r of this.ledger.values()) {
      if (r.remediationStatus === "resolved") continue;
      const key = `${r.category}:${r.domain}`;
      const existing = map.get(key);
      if (existing) {
        existing.count++;
        existing.maxSeverity = Math.max(existing.maxSeverity, sevOrder[r.severity]);
      } else {
        map.set(key, { category: r.category, domain: r.domain, count: 1, maxSeverity: sevOrder[r.severity] });
      }
    }

    return Array.from(map.values()).map(v => ({
      category: v.category,
      domain: v.domain,
      count: v.count,
      severity: sevNames[v.maxSeverity],
    }));
  }

  /** Boardroom section */
  getBoardroomSection(): GovernanceBoardroomSection {
    const unresolved = this.getLedger().filter(r => r.remediationStatus !== "resolved" && r.remediationStatus !== "mitigated");
    const critical = unresolved.filter(r => r.severity === "critical").length;

    return {
      systemId: "execution-debt-ledger",
      title: "Execution Debt",
      severity: critical > 0 ? "critical" : unresolved.length > 5 ? "warning" : "info",
      summary: unresolved.length === 0
        ? "All workflows executing cleanly. No execution debt accumulated."
        : `${unresolved.length} execution debt items (${critical} critical). Top pattern: ${this.getTopPattern() ?? "none"}`,
      metrics: [
        { label: "Open Items", value: unresolved.length },
        { label: "Critical", value: critical },
        { label: "Stuck Workflows", value: unresolved.filter(r => r.category === "stuck_workflow").length },
        { label: "Repeated Failures", value: unresolved.filter(r => r.category === "repeated_recovery").length },
      ],
      actionItems: unresolved
        .filter(r => r.severity === "critical")
        .slice(0, 3)
        .map(r => ({ description: r.recommendation, priority: "high" as const, route: "/governance/execution-debt" })),
      drilldownRoute: "/governance/execution-debt",
    };
  }

  /** Compute debt score (0-1) */
  computeDebtScore(): number {
    const records = this.getLedger().filter(r => r.remediationStatus !== "resolved");
    if (records.length === 0) return 0;
    const weights = { low: 0.1, medium: 0.3, high: 0.6, critical: 1.0 };
    const agingMult = { fresh: 1, aging: 1.2, stale: 1.5, critical: 2.0 };
    let total = 0;
    for (const r of records) total += weights[r.severity] * agingMult[r.aging.tier];
    return Math.min(total / 10, 1);
  }

  private getTopPattern(): string | null {
    const counts = new Map<string, number>();
    for (const r of this.ledger.values()) {
      if (r.remediationStatus === "resolved") continue;
      counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
    }
    let top: string | null = null;
    let max = 0;
    for (const [k, v] of counts) {
      if (v > max) { max = v; top = k; }
    }
    return top;
  }
}

