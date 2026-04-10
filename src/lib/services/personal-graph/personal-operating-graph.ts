// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Personal Operating Graph
// Federates all entity/relationship/trust/device/context data
// into one connected graph for cross-domain intelligence
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
import type { DomainId } from "@/packages/contracts/_contract-scaffold";

// ── Graph Node Types ────────────────────────────────────────────

export type GraphNodeType =
  | "person" | "household" | "business" | "workspace"
  | "task" | "approval" | "money_account" | "file"
  | "meeting" | "commitment" | "device" | "connector"
  | "assistant" | "priority" | "relationship" | "signal";

export interface PersonalGraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  domain: DomainId | "cross-domain";
  properties: Record<string, unknown>;
  trustScore: number;          // 0–100
  lastTouched: string;
  touchCount: number;
  urgency: number;             // 0–10
  tags: string[];
}

export interface PersonalGraphEdge {
  id: string;
  fromId: string;
  toId: string;
  relation: string;            // "owns" | "manages" | "knows" | "depends-on" | "approves" | "funds" | "attends" | "uses"
  weight: number;              // 0–1
  domains: DomainId[];
  metadata: Record<string, unknown>;
  createdAt: string;
}

// ── Query Types ─────────────────────────────────────────────────

export interface GraphTraversalFilter {
  nodeTypes?: GraphNodeType[];
  domains?: DomainId[];
  minTrust?: number;
  minUrgency?: number;
  tags?: string[];
  maxAge?: number;             // milliseconds since lastTouched
}

export interface GraphContext {
  node: PersonalGraphNode;
  neighbors: PersonalGraphNode[];
  edges: PersonalGraphEdge[];
  crossDomainLinks: { domain: DomainId; nodes: PersonalGraphNode[] }[];
  urgentItems: PersonalGraphNode[];
  trustProfile: { avgTrust: number; lowTrustNodes: PersonalGraphNode[] };
}

export interface MeetingContext {
  contact: PersonalGraphNode;
  relationship: { trustScore: number; lastInteraction: string; reciprocityBalance: number };
  pendingTasks: PersonalGraphNode[];
  sharedCommitments: PersonalGraphNode[];
  recentConversationTopics: string[];
  crossDomainRelevance: { domain: DomainId; items: PersonalGraphNode[] }[];
  suggestedTalkingPoints: string[];
}

export interface CrossDomainResolution {
  originNode: string;
  touchedDomains: DomainId[];
  linkedNodes: PersonalGraphNode[];
  narrative: string; // "this approval touches money, boardroom, and travel"
}

// ── Service ─────────────────────────────────────────────────────

export class PersonalOperatingGraphService {
  private nodes: Map<string, PersonalGraphNode> = new Map();
  private edges: PersonalGraphEdge[] = [];
  private edgeCounter = 0;

  // ── Node CRUD ──────────────────────────────────────────────

  upsertNode(node: PersonalGraphNode): void {
    const existing = this.nodes.get(node.id);
    if (existing) {
      Object.assign(existing, node, { touchCount: existing.touchCount + 1, lastTouched: new Date().toISOString() });
    } else {
      this.nodes.set(node.id, { ...node, touchCount: 1, lastTouched: new Date().toISOString() });
    }
    this._persist();
  }

  removeNode(id: string): void {
    this.nodes.delete(id);
    this.edges = this.edges.filter(e => e.fromId !== id && e.toId !== id);
    this._persist();
  }

  getNode(id: string): PersonalGraphNode | undefined {
    return this.nodes.get(id);
  }

  // ── Edge CRUD ──────────────────────────────────────────────

  addEdge(fromId: string, toId: string, relation: string, weight: number, domains: DomainId[], metadata: Record<string, unknown> = {}): PersonalGraphEdge {
    const existing = this.edges.find(e => e.fromId === fromId && e.toId === toId && e.relation === relation);
    if (existing) { existing.weight = weight; existing.metadata = { ...existing.metadata, ...metadata }; return existing; }
    const edge: PersonalGraphEdge = { id: `edge-${++this.edgeCounter}`, fromId, toId, relation, weight, domains, metadata, createdAt: new Date().toISOString() };
    this.edges.push(edge);
    this._persist();
    return edge;
  }

  removeEdge(id: string): void {
    this.edges = this.edges.filter(e => e.id !== id);
    this._persist();
  }

  // ── Graph Queries ──────────────────────────────────────────

  getContext(entityId: string): GraphContext | null {
    const node = this.nodes.get(entityId);
    if (!node) return null;

    const relatedEdges = this.edges.filter(e => e.fromId === entityId || e.toId === entityId);
    const neighborIds = new Set(relatedEdges.map(e => e.fromId === entityId ? e.toId : e.fromId));
    const neighbors = [...neighborIds].map(id => this.nodes.get(id)).filter((n): n is PersonalGraphNode => !!n);

    const domainMap = new Map<DomainId, PersonalGraphNode[]>();
    for (const n of neighbors) {
      if (n.domain !== node.domain && n.domain !== "cross-domain") {
        const list = domainMap.get(n.domain as DomainId) ?? [];
        list.push(n);
        domainMap.set(n.domain as DomainId, list);
      }
    }

    const urgentItems = neighbors.filter(n => n.urgency >= 7).sort((a, b) => b.urgency - a.urgency);
    const trustScores = neighbors.map(n => n.trustScore);
    const avgTrust = trustScores.length > 0 ? trustScores.reduce((s, t) => s + t, 0) / trustScores.length : 0;
    const lowTrustNodes = neighbors.filter(n => n.trustScore < 30);

    return {
      node,
      neighbors,
      edges: relatedEdges,
      crossDomainLinks: [...domainMap.entries()].map(([domain, nodes]) => ({ domain, nodes })),
      urgentItems,
      trustProfile: { avgTrust: Math.round(avgTrust), lowTrustNodes },
    };
  }

  traverse(fromId: string, depth: number, filters?: GraphTraversalFilter): PersonalGraphNode[] {
    const visited = new Set<string>();
    let frontier = [fromId];
    for (let d = 0; d < depth; d++) {
      const next: string[] = [];
      for (const id of frontier) {
        if (visited.has(id)) continue;
        visited.add(id);
        const related = this.edges.filter(e => e.fromId === id || e.toId === id);
        for (const e of related) {
          const nId = e.fromId === id ? e.toId : e.fromId;
          if (!visited.has(nId)) next.push(nId);
        }
      }
      frontier = next;
    }
    visited.delete(fromId);
    let result = [...visited].map(id => this.nodes.get(id)).filter((n): n is PersonalGraphNode => !!n);
    if (filters) result = this.applyFilters(result, filters);
    return result;
  }

  findConnections(entityA: string, entityB: string, maxDepth = 4): PersonalGraphNode[][] {
    const paths: PersonalGraphNode[][] = [];
    const visited = new Set<string>();

    const dfs = (current: string, target: string, path: string[], depth: number): void => {
      if (depth > maxDepth) return;
      if (current === target) {
        paths.push(path.map(id => this.nodes.get(id)!).filter(Boolean));
        return;
      }
      visited.add(current);
      const related = this.edges.filter(e => e.fromId === current || e.toId === current);
      for (const e of related) {
        const next = e.fromId === current ? e.toId : e.fromId;
        if (!visited.has(next)) dfs(next, target, [...path, next], depth + 1);
      }
      visited.delete(current);
    };

    dfs(entityA, entityB, [entityA], 0);
    return paths.sort((a, b) => a.length - b.length).slice(0, 5);
  }

  // ── Cross-Domain Resolution ────────────────────────────────

  resolveCrossDomain(nodeId: string): CrossDomainResolution {
    const connected = this.traverse(nodeId, 2);
    const domains = new Set<DomainId>();
    for (const n of connected) {
      if (n.domain !== "cross-domain") domains.add(n.domain as DomainId);
    }
    const domainList = [...domains];
    const narrative = domainList.length > 1
      ? `This item touches ${domainList.join(", ")}`
      : domainList.length === 1
        ? `Scoped to ${domainList[0]}`
        : "No domain connections found";

    return { originNode: nodeId, touchedDomains: domainList, linkedNodes: connected, narrative };
  }

  // ── Meeting Prep ───────────────────────────────────────────

  getMeetingContext(contactId: string): MeetingContext | null {
    const contact = this.nodes.get(contactId);
    if (!contact) return null;

    const relatedEdges = this.edges.filter(e => e.fromId === contactId || e.toId === contactId);
    const neighborIds = new Set(relatedEdges.map(e => e.fromId === contactId ? e.toId : e.fromId));
    const neighbors = [...neighborIds].map(id => this.nodes.get(id)).filter((n): n is PersonalGraphNode => !!n);

    const pendingTasks = neighbors.filter(n => n.type === "task" && n.urgency > 0);
    const sharedCommitments = neighbors.filter(n => n.type === "commitment");

    const domainGroups = new Map<DomainId, PersonalGraphNode[]>();
    for (const n of neighbors) {
      if (n.domain !== "cross-domain") {
        const list = domainGroups.get(n.domain as DomainId) ?? [];
        list.push(n);
        domainGroups.set(n.domain as DomainId, list);
      }
    }

    const talkingPoints: string[] = [];
    if (pendingTasks.length > 0) talkingPoints.push(`${pendingTasks.length} pending tasks to review`);
    if (sharedCommitments.length > 0) talkingPoints.push(`${sharedCommitments.length} open commitments`);
    for (const [domain, items] of domainGroups) {
      if (items.length > 2) talkingPoints.push(`Active in ${domain} with ${items.length} connected items`);
    }

    return {
      contact,
      relationship: {
        trustScore: contact.trustScore,
        lastInteraction: contact.lastTouched,
        reciprocityBalance: (contact.properties.reciprocityBalance as number) ?? 0,
      },
      pendingTasks,
      sharedCommitments,
      recentConversationTopics: (contact.properties.recentTopics as string[]) ?? [],
      crossDomainRelevance: [...domainGroups.entries()].map(([domain, items]) => ({ domain, items })),
      suggestedTalkingPoints: talkingPoints,
    };
  }

  // ── Attention Queries ──────────────────────────────────────

  getIgnoredItems(threshold = 3): PersonalGraphNode[] {
    return [...this.nodes.values()]
      .filter(n => (n.properties.ignoredCount as number ?? 0) >= threshold)
      .sort((a, b) => (b.properties.ignoredCount as number ?? 0) - (a.properties.ignoredCount as number ?? 0));
  }

  getUrgentCrossDomain(): PersonalGraphNode[] {
    return [...this.nodes.values()]
      .filter(n => n.urgency >= 8 && n.domain === "cross-domain")
      .sort((a, b) => b.urgency - a.urgency);
  }

  // ── Stats ──────────────────────────────────────────────────

  getStats(): { totalNodes: number; totalEdges: number; byType: Record<string, number>; byDomain: Record<string, number>; avgTrust: number } {
    const byType: Record<string, number> = {};
    const byDomain: Record<string, number> = {};
    let trustSum = 0;
    for (const n of this.nodes.values()) {
      byType[n.type] = (byType[n.type] ?? 0) + 1;
      byDomain[n.domain] = (byDomain[n.domain] ?? 0) + 1;
      trustSum += n.trustScore;
    }
    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.length,
      byType, byDomain,
      avgTrust: this.nodes.size > 0 ? Math.round(trustSum / this.nodes.size) : 0,
    };
  }

  // ── Helpers ────────────────────────────────────────────────

  private applyFilters(nodes: PersonalGraphNode[], f: GraphTraversalFilter): PersonalGraphNode[] {
    let result = nodes;
    if (f.nodeTypes) result = result.filter(n => f.nodeTypes!.includes(n.type));
    if (f.domains) result = result.filter(n => f.domains!.includes(n.domain as DomainId));
    if (f.minTrust !== undefined) result = result.filter(n => n.trustScore >= f.minTrust!);
    if (f.minUrgency !== undefined) result = result.filter(n => n.urgency >= f.minUrgency!);
    if (f.tags) result = result.filter(n => f.tags!.some(t => n.tags.includes(t)));
    if (f.maxAge) {
      const cutoff = Date.now() - f.maxAge;
      result = result.filter(n => new Date(n.lastTouched).getTime() >= cutoff);
    }
    return result;
  }

  // ── Persistence ────────────────────────────────────────────

  private _persist = () => debouncedSaveServiceState("personal-operating-graph", this.serialize());

  serialize(): Record<string, unknown> {
    return { nodes: Array.from(this.nodes.entries()), edges: this.edges, edgeCounter: this.edgeCounter };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.nodes) this.nodes = new Map(state.nodes as [string, PersonalGraphNode][]);
    if (state.edges) this.edges = state.edges as PersonalGraphEdge[];
    if (state.edgeCounter) this.edgeCounter = state.edgeCounter as number;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("personal-operating-graph");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export const createPersonalOperatingGraph = () => new PersonalOperatingGraphService();
