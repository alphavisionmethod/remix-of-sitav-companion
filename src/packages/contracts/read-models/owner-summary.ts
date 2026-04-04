// ═══════════════════════════════════════════════════════════════
// SITA OS — Read Models: Owner Summary
// UI projection — NEVER a source of truth
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

/** @layer read-model — derived from truth contracts, not authoritative */
export interface OwnerSummary {
  userId: string;
  generatedAt: string;
  overallHealth: number; // 0-100
  trustScore: number;
  activeWorkflows: number;
  pendingApprovals: number;
  unresolvedIncidents: number;
  topOpportunities: Array<{ id: string; title: string; valueCents: number; domain: DomainId }>;
  recentActions: Array<{ id: string; description: string; timestamp: string; status: string }>;
  alerts: Array<{ id: string; severity: "critical" | "high" | "medium" | "low"; message: string }>;
  recoveredValueCents: number;
  aiSpendCents: number;
}
