// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Subscription Detector Service
// Auto-detects subscriptions from transaction history
// ═══════════════════════════════════════════════════════════════

import type { TransactionRecord, SubscriptionRecord } from "@/packages/finance-contracts";
import type { DetectedSubscription } from "@/domains/finance";

// Canonical type re-export for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { DetectedSubscription };

export function detectSubscriptions(transactions: TransactionRecord[]): DetectedSubscription[] {
  const merchantGroups = new Map<string, TransactionRecord[]>();

  for (const tx of transactions.filter(t => t.type === "debit" && t.isRecurring)) {
    const key = (tx.merchantName || tx.description).toLowerCase().trim();
    const list = merchantGroups.get(key) || [];
    list.push(tx);
    merchantGroups.set(key, list);
  }

  const detected: DetectedSubscription[] = [];
  for (const [merchant, txs] of merchantGroups.entries()) {
    if (txs.length < 2) continue;

    const sorted = txs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const avgGapDays = sorted.length > 1
      ? (new Date(sorted[sorted.length - 1].date).getTime() - new Date(sorted[0].date).getTime()) / 86400000 / (sorted.length - 1)
      : 30;

    let frequency: DetectedSubscription["frequency"] = "monthly";
    if (avgGapDays > 80) frequency = "quarterly";
    if (avgGapDays > 300) frequency = "annually";

    const avgAmount = Math.round(txs.reduce((s, t) => s + Math.abs(t.amountCents), 0) / txs.length);
    const amountVariance = txs.reduce((s, t) => s + Math.abs(Math.abs(t.amountCents) - avgAmount), 0) / txs.length;
    const confidence = Math.min(95, 50 + txs.length * 10 - Math.round(amountVariance / avgAmount * 50));

    detected.push({
      merchantName: merchant,
      averageAmountCents: avgAmount,
      frequency,
      occurrences: txs.length,
      confidence: Math.max(30, confidence),
      firstSeen: sorted[0].date,
      lastSeen: sorted[sorted.length - 1].date,
    });
  }

  return detected.sort((a, b) => b.confidence - a.confidence);
}

