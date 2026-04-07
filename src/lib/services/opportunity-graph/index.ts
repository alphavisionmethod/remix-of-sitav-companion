// ═══════════════════════════════════════════════════════════════
// SITA OS — Opportunity Graph Service
// Graph traversal, scoring, pipeline management
// Canonical contract: contracts/runtime/opportunity-graph-runtime
// ═══════════════════════════════════════════════════════════════

import type {
  OpportunityGraphRuntime,
  OpportunityNode,
  OpportunityEdge,
} from "@/packages/contracts";
import type { DomainId } from "@/packages/contracts";
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

// ── Service ─────────────────────────────────────────────────────

export class OpportunityGraphService {
  private nodes = new Map<string, OpportunityNode>();
  private edges: OpportunityEdge[] = [];

  addOpportunity(node: OpportunityNode): void {
    this.nodes.set(node.id, node);
  }

  removeOpportunity(id: string): boolean {
    this.edges = this.edges.filter(e => e.fromId !== id && e.toId !== id);
    return this.nodes.delete(id);
  }

  addEdge(edge: OpportunityEdge): void {
    this.edges.push(edge);
  }

  getNode(id: string): OpportunityNode | undefined {
    return this.nodes.get(id);
  }

  updateStatus(id: string, status: OpportunityNode["status"]): void {
    const node = this.nodes.get(id);
    if (node) node.status = status;
  }

  getByDomain(domain: DomainId): OpportunityNode[] {
    return Array.from(this.nodes.values()).filter(n => n.domain === domain);
  }

  getByStatus(status: OpportunityNode["status"]): OpportunityNode[] {
    return Array.from(this.nodes.values()).filter(n => n.status === status);
  }

  getBlockers(nodeId: string): OpportunityNode[] {
    const blockerIds = this.edges
      .filter(e => e.toId === nodeId && e.relationship === "blocks")
      .map(e => e.fromId);
    return blockerIds.map(id => this.nodes.get(id)).filter(Boolean) as OpportunityNode[];
  }

  getEnabledBy(nodeId: string): OpportunityNode[] {
    const enablerIds = this.edges
      .filter(e => e.toId === nodeId && e.relationship === "enables")
      .map(e => e.fromId);
    return enablerIds.map(id => this.nodes.get(id)).filter(Boolean) as OpportunityNode[];
  }

  getTopOpportunities(limit: number): OpportunityNode[] {
    return Array.from(this.nodes.values())
      .filter(n => n.status !== "dismissed" && n.status !== "realized")
      .sort((a, b) => {
        const aScore = a.valueCents * a.confidence;
        const bScore = b.valueCents * b.confidence;
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  computePipelineValue(): { total: number; realized: number } {
    let total = 0;
    let realized = 0;
    for (const node of this.nodes.values()) {
      total += node.valueCents;
      if (node.status === "realized") realized += node.valueCents;
    }
    return { total, realized };
  }

  evaluate(): OpportunityGraphRuntime {
    const { total, realized } = this.computePipelineValue();
    const top = this.getTopOpportunities(5);
    return {
      nodes: Array.from(this.nodes.values()),
      edges: [...this.edges],
      totalPipelineValueCents: total,
      realizedValueCents: realized,
      topOpportunities: top.map(n => n.id),
      lastUpdated: new Date().toISOString(),
    };
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("opportunity-graph", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      nodes: Array.from(this.nodes.entries()),
      edges: this.edges,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.nodes) this.nodes = new Map(state.nodes as [string, unknown][]);
    if (state.edges) this.edges = state.edges as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("opportunity-graph");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createOpportunityGraphService(): OpportunityGraphService {
  return new OpportunityGraphService();
}
