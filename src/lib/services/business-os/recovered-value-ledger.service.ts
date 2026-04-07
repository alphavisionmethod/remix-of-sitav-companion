// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Recovered Value Ledger
// Tracks all recovered revenue with attribution
// ═══════════════════════════════════════════════════════════════

export interface RecoveredValueEntry {
  id: string;
  leakId: string;
  recoveryPlanId: string;
  amountCents: number;
  recoveredAt: string;
  method: "auto-reminder" | "manual-follow-up" | "payment-plan" | "collections" | "negotiation";
  accountId: string;
  accountName: string;
  invoiceId: string;
}

export interface RecoveryLedgerSummary {
  totalRecoveredCents: number;
  totalEntriesCount: number;
  byMethod: { method: string; amountCents: number; count: number }[];
  avgRecoveryTimeDays: number;
  recoveryRate: number;
  period: string;
  generatedAt: string;
}

export function summarizeLedger(entries: RecoveredValueEntry[], totalLeakedCents: number, period: string): RecoveryLedgerSummary {
  const totalRecovered = entries.reduce((s, e) => s + e.amountCents, 0);
  const methodMap = new Map<string, { amountCents: number; count: number }>();

  for (const e of entries) {
    const existing = methodMap.get(e.method) || { amountCents: 0, count: 0 };
    existing.amountCents += e.amountCents;
    existing.count += 1;
    methodMap.set(e.method, existing);
  }

  return {
    totalRecoveredCents: totalRecovered,
    totalEntriesCount: entries.length,
    byMethod: Array.from(methodMap.entries()).map(([method, data]) => ({ method, ...data })),
    avgRecoveryTimeDays: 14,
    recoveryRate: totalLeakedCents > 0 ? Math.round((totalRecovered / totalLeakedCents) * 100) : 0,
    period,
    generatedAt: new Date().toISOString(),
  };
}

