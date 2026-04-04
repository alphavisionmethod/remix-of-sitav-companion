// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Contracts: Council Deliberation
// Multi-advisor reasoning session
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export type DeliberationStatus = "convened" | "deliberating" | "voting" | "concluded" | "deadlocked" | "escalated";

export interface CouncilDeliberation {
  id: string;
  topic: string;
  domain: DomainId;
  convener: string;
  advisorIds: string[];
  status: DeliberationStatus;
  votes: string[]; // vote IDs
  dissents: string[]; // dissent IDs
  consensus?: string;
  confidenceScore: number;
  startedAt: string;
  concludedAt?: string;
  escalatedTo?: string;
  proofBundleId?: string;
}
