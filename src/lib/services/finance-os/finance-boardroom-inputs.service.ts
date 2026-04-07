// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Finance Boardroom Inputs Service
// Aggregates finance data for boardroom sessions
// ═══════════════════════════════════════════════════════════════

import type { FinanceBoardroomPacket } from "@/packages/finance-contracts";

export function buildFinanceBoardroomPacket(): FinanceBoardroomPacket {
  return {
    cashPosition: 3950000,
    monthlyBurn: 850000,
    monthlyIncome: 1200000,
    reserveHealth: 72,
    upcomingObligations: [
      { id: "obl-1", name: "Mortgage", payee: "Bank", amountCents: 320000, frequency: "monthly", nextDueDate: new Date(Date.now() + 15 * 86400000).toISOString(), category: "Housing", autoPay: true, status: "upcoming" },
      { id: "obl-2", name: "Insurance Premium", payee: "Insurer", amountCents: 150000, frequency: "quarterly", nextDueDate: new Date(Date.now() + 30 * 86400000).toISOString(), category: "Insurance", autoPay: false, status: "upcoming" },
    ],
    wasteOpportunities: [
      { subscriptionId: "sub-1", name: "Notion Teams", monthlyCostCents: 20000, annualSavingsCents: 240000, reason: "12% usage score", confidence: 85, detectedAt: new Date().toISOString() },
    ],
    receivables: [
      { id: "rcv-1", fromEntity: "Atlas Corp", amountCents: 1250000, dueDate: new Date(Date.now() + 10 * 86400000).toISOString(), status: "expected", agingDays: 0 },
    ],
    generatedAt: new Date().toISOString(),
  };
}

