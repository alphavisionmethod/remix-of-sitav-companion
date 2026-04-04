// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime: Opportunity Graph Runtime
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export interface OpportunityNode {
  id: string;
  title: string;
  domain: DomainId;
  type: "revenue" | "savings" | "efficiency" | "risk-mitigation";
  valueCents: number;
  confidence: number;
  dependencies: string[];
  status: "identified" | "evaluating" | "approved" | "in-progress" | "realized" | "dismissed";
}

export interface OpportunityEdge {
  fromId: string;
  toId: string;
  relationship: "enables" | "blocks" | "amplifies" | "competes-with";
  strength: number;
}

export interface OpportunityGraphRuntime {
  nodes: OpportunityNode[];
  edges: OpportunityEdge[];
  totalPipelineValueCents: number;
  realizedValueCents: number;
  topOpportunities: string[];
  lastUpdated: string;
}
