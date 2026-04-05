export { KNOWLEDGE_COORDINATION_AGENTS } from "@/lib/internal-agents/agents/knowledge-coordination";

/**
 * Knowledge Coordination Council — Contract-Level Extension
 */
export interface KnowledgeGraphNode {
  id: string;
  type: "concept" | "entity" | "policy" | "procedure" | "metric" | "contract";
  label: string;
  domain: string;
  relatedNodeIds: string[];
  lastUpdated: string;
  freshnessScore: number;
  authoritative: boolean;
  sources: string[];
}

export interface KnowledgeFreshnessReport {
  agentId: string;
  evaluatedAt: string;
  totalNodes: number;
  staleNodes: number;
  staleThresholdDays: number;
  domainBreakdown: Record<string, { total: number; stale: number }>;
  recommendations: string[];
}

export interface CrossDomainTransfer {
  id: string;
  fromDomain: string;
  toDomain: string;
  knowledgeType: string;
  summary: string;
  confidence: number;
  transferredAt: string;
  consumedBy: string[];
}
