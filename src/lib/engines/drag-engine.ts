// ═══════════════════════════════════════════════════════════════
// SITA OS — Operational Drag Engine
// Pure computation for operational friction across 14 dimensions.
// Every score is decomposable and evidence-backed.
// ═══════════════════════════════════════════════════════════════

import type {
  DragDimension, DragEvent, DragDimensionScore, DragIndex,
  DragRecommendation, DragEvidence, TrendDirection, TrendWindow,
  GovernanceBoardroomSection,
} from "../types/meta-governance.types";
import type { EntityScope, OSDomain } from "../types/os-unified.types";

const DIMENSION_WEIGHTS: Record<DragDimension, number> = {
  tool_switching: 0.06,
  queue_size: 0.10,
  follow_up_debt: 0.08,
  notification_fatigue: 0.06,
  context_switching: 0.07,
  duplicate_work: 0.08,
  stale_opportunity: 0.07,
  blocked_approval: 0.09,
  manual_work: 0.09,
  calendar_overload: 0.05,
  coordination_imbalance: 0.06,
  trust_friction: 0.07,
  role_ambiguity: 0.05,
  founder_dependency: 0.07,
};

const DIMENSION_RECOMMENDATIONS: Record<DragDimension, (score: number) => DragRecommendation | null> = {
  tool_switching: (s) => s > 0.4 ? { id: `rec_ts_${Date.now()}`, dimension: "tool_switching", title: "Reduce tool switching", description: "Consolidate frequently used tools into unified workspace", estimatedReduction: s * 0.3, effort: "medium", priority: s > 0.7 ? "high" : "medium", convertibleToOpportunity: true } : null,
  queue_size: (s) => s > 0.5 ? { id: `rec_qs_${Date.now()}`, dimension: "queue_size", title: "Reduce queue backlog", description: "Process or archive stale queue items to reduce decision overhead", estimatedReduction: s * 0.4, effort: "low", priority: "high", convertibleToOpportunity: false } : null,
  follow_up_debt: (s) => s > 0.3 ? { id: `rec_fd_${Date.now()}`, dimension: "follow_up_debt", title: "Automate follow-ups", description: "Enable auto-follow-up for recurring patterns", estimatedReduction: s * 0.5, effort: "low", priority: s > 0.6 ? "high" : "medium", convertibleToOpportunity: true } : null,
  notification_fatigue: (s) => s > 0.5 ? { id: `rec_nf_${Date.now()}`, dimension: "notification_fatigue", title: "Reduce notification noise", description: "Batch and prioritize notifications to reduce interruptions", estimatedReduction: s * 0.4, effort: "trivial", priority: "medium", convertibleToOpportunity: false } : null,
  context_switching: (s) => s > 0.4 ? { id: `rec_cs_${Date.now()}`, dimension: "context_switching", title: "Minimize context switches", description: "Group related tasks and batch domain transitions", estimatedReduction: s * 0.3, effort: "medium", priority: "medium", convertibleToOpportunity: false } : null,
  duplicate_work: (s) => s > 0.3 ? { id: `rec_dw_${Date.now()}`, dimension: "duplicate_work", title: "Eliminate duplicate work", description: "Detect and merge duplicate tasks across domains", estimatedReduction: s * 0.6, effort: "low", priority: "high", convertibleToOpportunity: true } : null,
  stale_opportunity: (s) => s > 0.4 ? { id: `rec_so_${Date.now()}`, dimension: "stale_opportunity", title: "Activate stale opportunities", description: "Review and action aging opportunities before expiration", estimatedReduction: s * 0.5, effort: "low", priority: "high", convertibleToOpportunity: true } : null,
  blocked_approval: (s) => s > 0.5 ? { id: `rec_ba_${Date.now()}`, dimension: "blocked_approval", title: "Unblock pending approvals", description: "Expedite or delegate blocked approval queues", estimatedReduction: s * 0.5, effort: "low", priority: "critical", convertibleToOpportunity: false } : null,
  manual_work: (s) => s > 0.4 ? { id: `rec_mw_${Date.now()}`, dimension: "manual_work", title: "Automate manual processes", description: "Identify and automate repetitive manual workflows", estimatedReduction: s * 0.4, effort: "high", priority: "high", convertibleToOpportunity: true } : null,
  calendar_overload: (s) => s > 0.5 ? { id: `rec_co_${Date.now()}`, dimension: "calendar_overload", title: "Optimize calendar density", description: "Protect focus blocks and reduce meeting overhead", estimatedReduction: s * 0.3, effort: "medium", priority: "medium", convertibleToOpportunity: false } : null,
  coordination_imbalance: (s) => s > 0.4 ? { id: `rec_ci_${Date.now()}`, dimension: "coordination_imbalance", title: "Rebalance coordination load", description: "Distribute coordination duties more evenly across team", estimatedReduction: s * 0.3, effort: "medium", priority: "medium", convertibleToOpportunity: false } : null,
  trust_friction: (s) => s > 0.3 ? { id: `rec_tf_${Date.now()}`, dimension: "trust_friction", title: "Reduce trust friction", description: "Address trust debt to allow smoother delegation", estimatedReduction: s * 0.4, effort: "medium", priority: "high", actionRoute: "/governance/trust-debt", convertibleToOpportunity: false } : null,
  role_ambiguity: (s) => s > 0.4 ? { id: `rec_ra_${Date.now()}`, dimension: "role_ambiguity", title: "Clarify role boundaries", description: "Define explicit ownership for ambiguous responsibilities", estimatedReduction: s * 0.5, effort: "low", priority: "medium", convertibleToOpportunity: false } : null,
  founder_dependency: (s) => s > 0.5 ? { id: `rec_fdd_${Date.now()}`, dimension: "founder_dependency", title: "Reduce founder dependency", description: "Delegate founder-bottlenecked decisions to trained operators", estimatedReduction: s * 0.4, effort: "high", priority: "critical", actionRoute: "/governance/delegation", convertibleToOpportunity: true } : null,
};

export class DragEngine {
  private events: DragEvent[] = [];
  private maxEvents = 10000;

  /** Record a drag event */
  recordEvent(input: {
    dimension: DragDimension;
    score: number;
    evidence: DragEvidence[];
    entityScope: EntityScope;
    module: string;
    domain: OSDomain;
    correlationId?: string;
  }): DragEvent {
    const event: DragEvent = {
      id: `drag_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...input,
      timestamp: new Date().toISOString(),
    };
    this.events.push(event);
    if (this.events.length > this.maxEvents) this.events = this.events.slice(-this.maxEvents);
    return event;
  }

  /** Compute composite drag index */
  computeIndex(entityScope: EntityScope, windowMs: number = 7 * 24 * 60 * 60 * 1000): DragIndex {
    const cutoff = Date.now() - windowMs;
    const recent = this.events.filter(e =>
      new Date(e.timestamp).getTime() >= cutoff &&
      e.entityScope.ownerId === entityScope.ownerId
    );

    const dimensionMap = new Map<DragDimension, { scores: number[]; evidence: DragEvidence[] }>();
    for (const event of recent) {
      const existing = dimensionMap.get(event.dimension) ?? { scores: [], evidence: [] };
      existing.scores.push(event.score);
      existing.evidence.push(...event.evidence);
      dimensionMap.set(event.dimension, existing);
    }

    const dimensions: DragDimensionScore[] = (Object.keys(DIMENSION_WEIGHTS) as DragDimension[]).map(dim => {
      const data = dimensionMap.get(dim);
      const avgScore = data ? data.scores.reduce((s, v) => s + v, 0) / data.scores.length : 0;
      return {
        dimension: dim,
        score: avgScore,
        weight: DIMENSION_WEIGHTS[dim],
        evidence: data?.evidence ?? [],
        trend: this.computeDimensionTrend(dim, cutoff),
        recommendation: undefined,
      };
    });

    const compositeScore = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0) /
      dimensions.reduce((sum, d) => sum + d.weight, 0);

    const recommendations: DragRecommendation[] = [];
    for (const d of dimensions) {
      const rec = DIMENSION_RECOMMENDATIONS[d.dimension](d.score);
      if (rec) {
        d.recommendation = rec.title;
        recommendations.push(rec);
      }
    }
    recommendations.sort((a, b) => {
      const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return pOrder[a.priority] - pOrder[b.priority];
    });

    return {
      compositeScore,
      dimensions,
      trend: this.computeOverallTrend(cutoff),
      recommendations,
      entityScope,
      computedAt: new Date().toISOString(),
    };
  }

  /** Get events by dimension */
  getByDimension(dimension: DragDimension): DragEvent[] {
    return this.events.filter(e => e.dimension === dimension);
  }

  /** Get events by module */
  getByModule(module: string): DragEvent[] {
    return this.events.filter(e => e.module === module);
  }

  /** Boardroom section */
  getBoardroomSection(entityScope: EntityScope): GovernanceBoardroomSection {
    const index = this.computeIndex(entityScope);
    const topDrags = index.dimensions
      .filter(d => d.score > 0.3)
      .sort((a, b) => b.score * b.weight - a.score * a.weight)
      .slice(0, 3);

    return {
      systemId: "operational-drag-index",
      title: "Operational Drag",
      severity: index.compositeScore > 0.6 ? "critical" : index.compositeScore > 0.3 ? "warning" : "info",
      summary: `Composite drag: ${(index.compositeScore * 100).toFixed(0)}%. Top friction: ${topDrags.map(d => d.dimension.replace(/_/g, " ")).join(", ") || "none"}`,
      metrics: [
        { label: "Composite Score", value: `${(index.compositeScore * 100).toFixed(0)}%`, trend: index.trend.direction },
        ...topDrags.map(d => ({ label: d.dimension.replace(/_/g, " "), value: `${(d.score * 100).toFixed(0)}%`, trend: d.trend })),
      ],
      actionItems: index.recommendations.slice(0, 3).map(r => ({
        description: `${r.title}: ${r.description}`,
        priority: r.priority === "critical" ? "high" as const : r.priority as "low" | "medium" | "high",
        route: r.actionRoute,
      })),
      drilldownRoute: "/governance/drag",
    };
  }

  private computeDimensionTrend(dimension: DragDimension, cutoff: number): TrendDirection {
    const events = this.events.filter(e => e.dimension === dimension && new Date(e.timestamp).getTime() >= cutoff);
    if (events.length < 4) return "stable";
    const mid = Math.floor(events.length / 2);
    const firstAvg = events.slice(0, mid).reduce((s, e) => s + e.score, 0) / mid;
    const secondAvg = events.slice(mid).reduce((s, e) => s + e.score, 0) / (events.length - mid);
    if (secondAvg > firstAvg * 1.15) return "degrading";
    if (secondAvg < firstAvg * 0.85) return "improving";
    return "stable";
  }

  private computeOverallTrend(cutoff: number): TrendWindow {
    const recent = this.events.filter(e => new Date(e.timestamp).getTime() >= cutoff);
    const buckets = 10;
    const range = Date.now() - cutoff;
    const bucketSize = range / buckets;
    const dataPoints: TrendWindow["dataPoints"] = [];

    for (let i = 0; i < buckets; i++) {
      const bStart = cutoff + i * bucketSize;
      const bEnd = bStart + bucketSize;
      const evts = recent.filter(e => { const t = new Date(e.timestamp).getTime(); return t >= bStart && t < bEnd; });
      const avg = evts.length > 0 ? evts.reduce((s, e) => s + e.score, 0) / evts.length : 0;
      dataPoints.push({ timestamp: new Date(bStart).toISOString(), value: avg });
    }

    const first = dataPoints.slice(0, 5).reduce((s, d) => s + d.value, 0);
    const second = dataPoints.slice(5).reduce((s, d) => s + d.value, 0);
    const direction: TrendDirection = second > first * 1.2 ? "degrading" : second < first * 0.8 ? "improving" : "stable";

    return { period: "week", dataPoints, direction, changePercent: first > 0 ? ((second - first) / first) * 100 : 0 };
  }
}

