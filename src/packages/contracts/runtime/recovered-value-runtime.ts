// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime: Recovered Value Runtime
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export interface RecoveredValueEntry {
  id: string;
  domain: DomainId;
  type: "cost-saved" | "revenue-captured" | "time-saved" | "risk-mitigated" | "error-prevented";
  valueCents: number;
  description: string;
  capabilityId: string;
  proofIds: string[];
  recoveredAt: string;
  attributedTo: string;
}

export interface RecoveredValueRuntime {
  totalRecoveredCents: number;
  byDomain: Record<string, number>;
  byType: Record<string, number>;
  entries: RecoveredValueEntry[];
  periodStart: string;
  periodEnd: string;
  trendPercent: number;
}
