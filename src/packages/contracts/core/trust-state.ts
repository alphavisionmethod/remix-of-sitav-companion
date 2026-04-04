// ═══════════════════════════════════════════════════════════════
// SITA OS — Core Truth Contracts: Trust State
// ═══════════════════════════════════════════════════════════════

import type { TrustFlag } from "../_contract-scaffold";

export interface TrustChange {
  timestamp: string;
  previousScore: number;
  newScore: number;
  reason: string;
  changedBy: string;
}

export interface TrustState {
  entityId: string;
  entityType: string;
  score: number; // 0-100
  flags: TrustFlag[];
  lastVerified: string;
  history: TrustChange[];
}
