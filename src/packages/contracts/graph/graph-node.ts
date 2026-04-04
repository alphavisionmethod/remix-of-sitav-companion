// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Contracts: Graph Node
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  domain: DomainId;
  properties: Record<string, unknown>;
}
