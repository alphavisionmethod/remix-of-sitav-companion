// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust Debt Engine
// Pure computation engine for trust debt detection, aging, and
// remediation tracking. No side effects — services handle events.
// ═══════════════════════════════════════════════════════════════

import type {
  TrustDebtRecord, TrustDebtCategory, TrustDimension,
  DebtSource, DebtEvidence,
  TrendDirection, TrendWindow, GovernanceBoardroomSection, RemediationStatus,
} from "../types/meta-governance.types";
import type { EntityScope, OSDomain, ProofRecord, ActionRecord } from "../types/os-unified.types";
import { computeAging, TRUST_AGING_MS } from "./shared/aging";

export class TrustDebtEngine {
  private ledger: Map<string, TrustDebtRecord> = new Map();

  /** Record a new trust debt entry with full lineage */
  record(input: {
    category: TrustDebtCategory;
    severity: TrustDebtRecord["severity"];
    source: DebtSource;
    entityScope: EntityScope;
    domain: OSDomain;
    trustDimension: TrustDimension;
    evidence: DebtEvidence[];
    proofGaps: string[];
    policyGaps: string[];
    replayGaps: string[];
    description: string;
    impact: string;
    recommendation: string;
    sourceIncidentId?: string;
    confidenceAtDetection?: number;
    attestationGaps?: string[];
    workflowFamily?: string;
    remediationOwner?: string;
    correlationId?: string;
  }): TrustDebtRecord {
    const id = `td_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const record: TrustDebtRecord = {
      id,
      category: input.category,
      severity: input.severity,
      source: input.source,
      entityScope: input.entityScope,
      domain: input.domain,
      trustDimension: input.trustDimension,
      aging: computeAging(now, TRUST_AGING_MS),
      remediationStatus: "open",
      remediationOwner: input.remediationOwner ?? input.source.id,
      trend: "stable",
      evidence: input.evidence,
      proofGaps: input.proofGaps,
      policyGaps: input.policyGaps,
      replayGaps: input.replayGaps,
      sourceIncidentId: input.sourceIncidentId,
      confidenceAtDetection: input.confidenceAtDetection ?? 0.5,
      attestationGaps: input.attestationGaps ?? [],
      description: input.description,
      impact: input.impact,
      recommendation: input.recommendation,
      workflowFamily: input.workflowFamily,
      correlationId: input.correlationId,
    };
    this.ledger.set(id, record);
    return record;
  }

  /** Detect trust debt from a weak proof action */
  detectFromAction(action: ActionRecord, proofRecords: ProofRecord[]): TrustDebtRecord | null {
    const proofCount = proofRecords.filter(p => p.verified).length;
    const totalProofs = action.proofIds.length;

    if (totalProofs === 0 || proofCount / Math.max(totalProofs, 1) < 0.5) {
      return this.record({
        category: "weak_proof",
        severity: action.confidenceScore < 0.5 ? "critical" : "high",
        source: { type: "workflow", id: action.workflowId, name: `Workflow ${action.workflowId}` },
        entityScope: action.entityScope,
        domain: action.domain,
        trustDimension: "proofCompleteness",
        evidence: [{
          sourceEventId: action.id,
          timestamp: action.updatedAt,
          metric: "proof_verification_rate",
          value: proofCount / Math.max(totalProofs, 1),
          description: `Only ${proofCount}/${totalProofs} proofs verified`,
        }],
        proofGaps: action.proofIds.filter(id => !proofRecords.find(p => p.id === id && p.verified)),
        policyGaps: [],
        replayGaps: action.replayable ? [] : ["workflow_not_replayable"],
        description: `Action ${action.id} executed with insufficient proof verification`,
        impact: "Reduces trust chain integrity and audit trail quality",
        recommendation: "Add verification step before execution or require stronger proof",
        workflowFamily: action.workflowId,
        correlationId: action.id,
      });
    }
    return null;
  }

  /** Update remediation status */
  updateRemediation(id: string, status: RemediationStatus, owner?: string): TrustDebtRecord | null {
    const record = this.ledger.get(id);
    if (!record) return null;
    record.remediationStatus = status;
    if (owner) record.remediationOwner = owner;
    if (status === "resolved" || status === "mitigated") record.trend = "improving";
    return record;
  }

  /** Refresh aging for all records */
  refreshAging(): void {
    for (const record of this.ledger.values()) {
      record.aging = computeAging(record.aging.detectedAt, TRUST_AGING_MS);
    }
  }

  /** Get full ledger */
  getLedger(): TrustDebtRecord[] {
    return Array.from(this.ledger.values());
  }

  /** Get by dimension */
  getByDimension(dimension: TrustDimension): TrustDebtRecord[] {
    return this.getLedger().filter(r => r.trustDimension === dimension);
  }

  /** Get by category */
  getByCategory(category: TrustDebtCategory): TrustDebtRecord[] {
    return this.getLedger().filter(r => r.category === category);
  }

  /** Get by source */
  getBySource(sourceType: DebtSource["type"], sourceId?: string): TrustDebtRecord[] {
    return this.getLedger().filter(r =>
      r.source.type === sourceType && (!sourceId || r.source.id === sourceId)
    );
  }

  /** Get by workflow family */
  getByWorkflowFamily(family: string): TrustDebtRecord[] {
    return this.getLedger().filter(r => r.workflowFamily === family);
  }

  /** Get by domain */
  getByDomain(domain: OSDomain): TrustDebtRecord[] {
    return this.getLedger().filter(r => r.domain === domain);
  }

  /** Get unresolved count by severity */
  getUnresolvedCounts(): Record<TrustDebtRecord["severity"], number> {
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };
    for (const r of this.ledger.values()) {
      if (r.remediationStatus !== "resolved" && r.remediationStatus !== "mitigated") {
        counts[r.severity]++;
      }
    }
    return counts;
  }

  /** Compute trend for a time window */
  computeTrend(periodMs: number): TrendWindow {
    const now = Date.now();
    const cutoff = now - periodMs;
    const records = this.getLedger().filter(r => new Date(r.aging.detectedAt).getTime() >= cutoff);

    const bucketCount = 10;
    const bucketSize = periodMs / bucketCount;
    const dataPoints: TrendWindow["dataPoints"] = [];

    for (let i = 0; i < bucketCount; i++) {
      const bucketStart = cutoff + i * bucketSize;
      const bucketEnd = bucketStart + bucketSize;
      const count = records.filter(r => {
        const t = new Date(r.aging.detectedAt).getTime();
        return t >= bucketStart && t < bucketEnd;
      }).length;
      dataPoints.push({ timestamp: new Date(bucketStart).toISOString(), value: count });
    }

    const firstHalf = dataPoints.slice(0, 5).reduce((s, d) => s + d.value, 0);
    const secondHalf = dataPoints.slice(5).reduce((s, d) => s + d.value, 0);
    const direction: TrendDirection = secondHalf > firstHalf * 1.2 ? "degrading"
      : secondHalf < firstHalf * 0.8 ? "improving" : "stable";

    return {
      period: periodMs > 7 * 86400000 ? "month" : periodMs > 86400000 ? "week" : "day",
      dataPoints,
      direction,
      changePercent: firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0,
    };
  }

  /** Boardroom summary */
  getBoardroomSection(): GovernanceBoardroomSection {
    const counts = this.getUnresolvedCounts();
    const total = counts.low + counts.medium + counts.high + counts.critical;
    const severity = counts.critical > 0 ? "critical" : counts.high > 2 ? "warning" : "info";

    return {
      systemId: "trust-debt-ledger",
      title: "Trust Debt",
      severity,
      summary: total === 0
        ? "No outstanding trust debt. All proof, policy, and verification standards are met."
        : `${total} unresolved trust debt items (${counts.critical} critical, ${counts.high} high)`,
      metrics: [
        { label: "Critical", value: counts.critical, trend: "stable" },
        { label: "High", value: counts.high },
        { label: "Medium", value: counts.medium },
        { label: "Total Open", value: total },
      ],
      actionItems: this.getLedger()
        .filter(r => r.severity === "critical" && r.remediationStatus === "open")
        .slice(0, 3)
        .map(r => ({ description: r.recommendation, priority: "high" as const, route: `/governance/trust-debt` })),
      drilldownRoute: "/governance/trust-debt",
    };
  }

  /** Total debt score (0-1, lower is better) */
  computeDebtScore(): number {
    const records = this.getLedger().filter(r => r.remediationStatus !== "resolved" && r.remediationStatus !== "mitigated");
    if (records.length === 0) return 0;

    const severityWeights = { low: 0.1, medium: 0.3, high: 0.6, critical: 1.0 };
    const agingMultiplier = { fresh: 1, aging: 1.2, stale: 1.5, critical: 2.0 };

    let totalWeight = 0;
    for (const r of records) {
      totalWeight += severityWeights[r.severity] * agingMultiplier[r.aging.tier];
    }

    return Math.min(totalWeight / 10, 1); // Normalize to 0-1, cap at 1
  }
}
