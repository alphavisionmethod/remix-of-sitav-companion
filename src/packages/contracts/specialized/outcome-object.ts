// ═══════════════════════════════════════════════════════════════
// SITA OS — Specialized: Outcome Object
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export type OutcomeStatus = "pending" | "achieved" | "partially-achieved" | "missed" | "exceeded";

export interface OutcomeObject {
  id: string;
  title: string;
  domain: DomainId;
  targetValue: number;
  actualValue?: number;
  unit: string;
  status: OutcomeStatus;
  linkedExecutionIds: string[];
  linkedProofIds: string[];
  measuredAt?: string;
  deadline: string;
  description: string;
}
