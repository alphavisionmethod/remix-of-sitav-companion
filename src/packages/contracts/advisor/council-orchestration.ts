// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Contracts: Council Orchestration
// Orchestration config for multi-advisor councils
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export interface CouncilOrchestration {
  id: string;
  name: string;
  domain: DomainId;
  requiredAdvisors: string[];
  optionalAdvisors: string[];
  quorumSize: number;
  maxDeliberationMs: number;
  votingStrategy: "majority" | "unanimous" | "weighted" | "advisory";
  dissentThreshold: number;
  escalationPolicy: string;
  autoConveneOn: string[];
}
