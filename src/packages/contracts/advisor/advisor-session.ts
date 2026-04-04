// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Contracts: Advisor Session
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export type AdvisorSessionStatus = "active" | "paused" | "completed" | "expired" | "handed-off";

export interface AdvisorSession {
  id: string;
  advisorId: string;
  domain: DomainId;
  userId: string;
  status: AdvisorSessionStatus;
  startedAt: string;
  lastActiveAt: string;
  completedAt?: string;
  tokensUsed: number;
  turnCount: number;
  memoryKeys: string[];
  handoffTarget?: string;
  continuationToken?: string;
}
