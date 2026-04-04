// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Contracts: Handoff Packet
// Cross-surface advisor/context handoff
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export interface HandoffPacket {
  id: string;
  fromSurface: string;
  toSurface: string;
  fromAdvisor?: string;
  toAdvisor?: string;
  domain: DomainId;
  context: Record<string, unknown>;
  memoryKeys: string[];
  unresolvedItems: string[];
  priority: "high" | "medium" | "low";
  createdAt: string;
  expiresAt: string;
  accepted: boolean;
  acceptedAt?: string;
}
