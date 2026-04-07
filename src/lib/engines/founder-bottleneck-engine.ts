// ═══════════════════════════════════════════════════════════════
// SITA OS — Founder Bottleneck Detector
// Detects single-threaded leadership stalls: approval backlogs,
// decision queues, release blocks, delegation stalls, and
// recommends evidence-backed handoffs.
// ═══════════════════════════════════════════════════════════════

import type {
  FounderBottleneckEvent, FounderBottleneckType, CostModel,
  DelegationCandidate, DelegationTier, DebtEvidence,
  GovernanceBoardroomSection,
} from "../types/meta-governance.types";
import type { ActionRecord, EntityScope, OSDomain } from "../types/os-unified.types";
import { computeAging, EXECUTION_AGING_MS } from "./shared/aging";

export class FounderBottleneckEngine {
  private bottlenecks: Map<string, FounderBottleneckEvent> = new Map();

  /** Detect approval stalls where the founder is the blocker */
  detectApprovalStalls(actions: ActionRecord[], founderId: string): FounderBottleneckEvent[] {
    const pending = actions.filter(a =>
      a.currentState === "approval_requested" &&
      a.entityScope.ownerId === founderId
    );

    if (pending.length < 2) return [];

    const now = new Date().toISOString();
    const totalDelay = pending.reduce((s, a) => {
      const last = a.stateHistory[a.stateHistory.length - 1];
      return s + (last ? Date.now() - new Date(last.timestamp).getTime() : 0);
    }, 0);

    const event = this.recordBottleneck({
      bottleneckType: "approval_stall",
      founderId,
      blockedWorkflows: pending.map(a => a.workflowId),
      domain: pending[0].domain,
      costEstimate: {
        estimationMethod: "delay_impact",
        estimatedCost: (totalDelay / 3600000) * 50, // $50/hr opportunity cost
        currency: "USD",
        confidence: 0.6,
        inputs: { pending_count: pending.length, total_delay_hours: totalDelay / 3600000 },
        explanation: `${pending.length} approvals waiting. Est. ${(totalDelay / 3600000).toFixed(1)}h total delay at $50/hr opportunity cost.`,
      },
      severity: pending.length >= 5 ? "critical" : pending.length >= 3 ? "high" : "medium",
      evidence: pending.map(a => ({
        sourceEventId: a.id,
        timestamp: a.updatedAt,
        metric: "approval_wait_ms",
        value: Date.now() - new Date(a.stateHistory[a.stateHistory.length - 1]?.timestamp ?? a.updatedAt).getTime(),
        description: `Workflow ${a.workflowId} waiting for founder approval`,
      })),
      entityScope: pending[0].entityScope,
      handoffRecommendation: "Consider delegating low-risk approvals to a trained operator",
      delegationCandidates: [],
    });

    return [event];
  }

  /** Detect decision queue depth */
  detectDecisionQueueDepth(queueItems: { id: string; domain: OSDomain; waitingSince: string; founderId: string; entityScope: EntityScope }[]): FounderBottleneckEvent | null {
    if (queueItems.length < 3) return null;

    const founderId = queueItems[0].founderId;
    return this.recordBottleneck({
      bottleneckType: "decision_queue",
      founderId,
      blockedWorkflows: queueItems.map(q => q.id),
      domain: queueItems[0].domain,
      costEstimate: {
        estimationMethod: "opportunity_cost",
        estimatedCost: queueItems.length * 200,
        currency: "USD",
        confidence: 0.5,
        inputs: { queue_depth: queueItems.length },
        explanation: `${queueItems.length} decisions queued. Estimated $200/decision opportunity cost from delay.`,
      },
      severity: queueItems.length >= 10 ? "critical" : "high",
      evidence: queueItems.map(q => ({
        sourceEventId: q.id,
        timestamp: q.waitingSince,
        metric: "decision_wait_ms",
        value: Date.now() - new Date(q.waitingSince).getTime(),
        description: `Decision ${q.id} waiting since ${q.waitingSince}`,
      })),
      entityScope: queueItems[0].entityScope,
      handoffRecommendation: "Batch decisions by category and delegate categories with established patterns",
      delegationCandidates: [],
    });
  }

  /** Record a bottleneck event */
  recordBottleneck(input: {
    bottleneckType: FounderBottleneckType;
    founderId: string;
    blockedWorkflows: string[];
    domain: OSDomain;
    costEstimate: CostModel;
    severity: FounderBottleneckEvent["severity"];
    evidence: DebtEvidence[];
    entityScope: EntityScope;
    handoffRecommendation: string;
    delegationCandidates: DelegationCandidate[];
    correlationId?: string;
  }): FounderBottleneckEvent {
    const id = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const event: FounderBottleneckEvent = {
      id,
      ...input,
      detectedAt: now,
      aging: computeAging(now, EXECUTION_AGING_MS),
    };
    this.bottlenecks.set(id, event);
    return event;
  }

  /** Mark resolved */
  resolve(id: string): boolean {
    const b = this.bottlenecks.get(id);
    if (!b) return false;
    b.resolvedAt = new Date().toISOString();
    return true;
  }

  /** Get active bottlenecks */
  getActive(): FounderBottleneckEvent[] {
    return Array.from(this.bottlenecks.values()).filter(b => !b.resolvedAt);
  }

  /** Get by type */
  getByType(type: FounderBottleneckType): FounderBottleneckEvent[] {
    return Array.from(this.bottlenecks.values()).filter(b => b.bottleneckType === type);
  }

  /** Get total estimated cost of unresolved bottlenecks */
  getTotalCost(): { total: number; currency: string } {
    const active = this.getActive();
    return {
      total: active.reduce((s, b) => s + b.costEstimate.estimatedCost, 0),
      currency: "USD",
    };
  }

  /** Get handoff candidates from active bottlenecks */
  getHandoffCandidates(): DelegationCandidate[] {
    return this.getActive().flatMap(b => b.delegationCandidates);
  }

  /** Refresh aging */
  refreshAging(): void {
    for (const b of this.bottlenecks.values()) b.aging = computeAging(b.detectedAt, EXECUTION_AGING_MS);
  }

  /** Boardroom section */
  getBoardroomSection(): GovernanceBoardroomSection {
    const active = this.getActive();
    const cost = this.getTotalCost();

    return {
      systemId: "founder-bottleneck",
      title: "Founder Bottleneck",
      severity: active.some(b => b.severity === "critical") ? "critical" : active.length > 3 ? "warning" : "info",
      summary: active.length === 0
        ? "No founder bottlenecks detected. Decision flow is healthy."
        : `${active.length} active bottlenecks. Est. cost: $${cost.total.toFixed(0)}. Top: ${active[0]?.bottleneckType.replace(/_/g, " ")}`,
      metrics: [
        { label: "Active Bottlenecks", value: active.length },
        { label: "Est. Cost", value: `$${cost.total.toFixed(0)}` },
        { label: "Blocked Workflows", value: active.reduce((s, b) => s + b.blockedWorkflows.length, 0) },
      ],
      actionItems: active.slice(0, 3).map(b => ({
        description: b.handoffRecommendation,
        priority: b.severity === "critical" ? "high" as const : "medium" as const,
        route: "/governance/delegation",
      })),
      drilldownRoute: "/governance/delegation",
    };
  }
}

