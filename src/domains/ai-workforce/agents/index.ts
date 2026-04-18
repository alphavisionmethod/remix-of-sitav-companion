import type { InternalAgentDefinition, InternalAgentCouncil } from "../types";
import { PRODUCT_BUILD_AGENTS } from "./product-build";
import { RELIABILITY_OPS_AGENTS } from "./reliability-ops";
import { SECURITY_TRUST_AGENTS } from "./security-trust";
import { RUNTIME_COST_AGENTS } from "./runtime-cost";
import { ARCHITECTURE_GOVERNANCE_AGENTS } from "./architecture-governance";
import { KNOWLEDGE_COORDINATION_AGENTS } from "./knowledge-coordination";

export const ALL_DETAILED_AGENTS: InternalAgentDefinition[] = [
  ...PRODUCT_BUILD_AGENTS,
  ...RELIABILITY_OPS_AGENTS,
  ...SECURITY_TRUST_AGENTS,
  ...RUNTIME_COST_AGENTS,
  ...ARCHITECTURE_GOVERNANCE_AGENTS,
  ...KNOWLEDGE_COORDINATION_AGENTS,
];

export function getDetailedAgent(agentId: string): InternalAgentDefinition | undefined {
  return ALL_DETAILED_AGENTS.find(a => a.agentId === agentId);
}

export function getDetailedAgentsByCouncil(council: InternalAgentCouncil): InternalAgentDefinition[] {
  return ALL_DETAILED_AGENTS.filter(a => a.council === council);
}

export {
  PRODUCT_BUILD_AGENTS,
  RELIABILITY_OPS_AGENTS,
  SECURITY_TRUST_AGENTS,
  RUNTIME_COST_AGENTS,
  ARCHITECTURE_GOVERNANCE_AGENTS,
  KNOWLEDGE_COORDINATION_AGENTS,
};
