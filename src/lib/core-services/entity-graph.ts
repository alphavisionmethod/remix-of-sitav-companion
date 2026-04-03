// ═══════════════════════════════════════════════════════════════
// SITA OS — Entity Graph
// Cross-domain entity relationships and resolution
// ═══════════════════════════════════════════════════════════════

/* Note: GraphGraphEntityNode avoids name collision with GraphEntityNode in identity-graph */

export type GraphEntityNodeType = "contact" | "lead" | "customer" | "vendor" | "prospect" | "employee" | "household-member" | "organization" | "asset" | "account";
export type EdgeType = "converted_from" | "related_to" | "owns" | "manages" | "employed_by" | "supplies" | "member_of" | "beneficiary_of" | "linked_account";

export interface GraphEntityNode {
  id: string;
  type: GraphEntityNodeType;
  name: string;
  domain: string;
  attributes: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface GraphEntityEdge {
  id: string;
  fromId: string;
  toId: string;
  type: EdgeType;
  weight: number;
  metadata: Record<string, unknown>;
  createdAt: number;
}

export interface GraphEntityResolution {
  entityId: string;
  matchedIds: string[];
  confidence: number;
  mergeStrategy: "keep-primary" | "merge-attributes" | "create-composite";
}

// ── Entity Graph Service ────────────────────────────────────────

export class EntityGraphService {
  private nodes = new Map<string, GraphEntityNode>();
  private edges: GraphEntityEdge[] = [];

  addNode(node: GraphEntityNode): void {
    this.nodes.set(node.id, node);
  }

  getNode(id: string): GraphEntityNode | undefined {
    return this.nodes.get(id);
  }

  removeNode(id: string): boolean {
    this.edges = this.edges.filter(e => e.fromId !== id && e.toId !== id);
    return this.nodes.delete(id);
  }

  addEdge(edge: GraphEntityEdge): void {
    this.edges.push(edge);
  }

  getEdgesFrom(nodeId: string): GraphEntityEdge[] {
    return this.edges.filter(e => e.fromId === nodeId);
  }

  getEdgesTo(nodeId: string): GraphEntityEdge[] {
    return this.edges.filter(e => e.toId === nodeId);
  }

  getNeighbors(nodeId: string, depth = 1): GraphEntityNode[] {
    const visited = new Set<string>([nodeId]);
    let frontier = [nodeId];

    for (let d = 0; d < depth; d++) {
      const nextFrontier: string[] = [];
      for (const nid of frontier) {
        const outgoing = this.getEdgesFrom(nid).map(e => e.toId);
        const incoming = this.getEdgesTo(nid).map(e => e.fromId);
        for (const neighbor of [...outgoing, ...incoming]) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            nextFrontier.push(neighbor);
          }
        }
      }
      frontier = nextFrontier;
    }

    visited.delete(nodeId);
    return Array.from(visited).map(id => this.nodes.get(id)!).filter(Boolean);
  }

  findByType(type: GraphEntityNodeType): GraphEntityNode[] {
    return Array.from(this.nodes.values()).filter(n => n.type === type);
  }

  findByDomain(domain: string): GraphEntityNode[] {
    return Array.from(this.nodes.values()).filter(n => n.domain === domain);
  }

  resolveEntity(name: string, type?: GraphEntityNodeType): GraphEntityResolution | null {
    const candidates = Array.from(this.nodes.values()).filter(n => {
      const nameMatch = n.name.toLowerCase().includes(name.toLowerCase());
      const typeMatch = !type || n.type === type;
      return nameMatch && typeMatch;
    });

    if (candidates.length === 0) return null;

    return {
      entityId: candidates[0].id,
      matchedIds: candidates.map(c => c.id),
      confidence: candidates.length === 1 ? 1.0 : 0.7,
      mergeStrategy: candidates.length === 1 ? "keep-primary" : "merge-attributes",
    };
  }

  getStats(): { nodeCount: number; edgeCount: number; nodesByType: Record<string, number> } {
    const nodesByType: Record<string, number> = {};
    for (const node of this.nodes.values()) {
      nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
    }
    return { nodeCount: this.nodes.size, edgeCount: this.edges.length, nodesByType };
  }

  getHealth(): { status: "healthy"; nodes: number; edges: number } {
    return { status: "healthy", nodes: this.nodes.size, edges: this.edges.length };
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createEntityGraph(): EntityGraphService {
  return new EntityGraphService();
}
