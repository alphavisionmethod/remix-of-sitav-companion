// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Contracts: Graph Edge
// ═══════════════════════════════════════════════════════════════

export interface GraphEdge {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  properties: Record<string, unknown>;
}
