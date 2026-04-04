// ═══════════════════════════════════════════════════════════════
// SITA OS — Memory Contracts: Memory Object
// ═══════════════════════════════════════════════════════════════

import type { PrivacyTier, DomainId } from "../_contract-scaffold";

export interface MemoryObject {
  id: string;
  key: string;
  value: unknown;
  privacyTier: PrivacyTier;
  domain: DomainId;
  source: string;
  confidence: number; // 0-1
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  supersededBy?: string;
}
