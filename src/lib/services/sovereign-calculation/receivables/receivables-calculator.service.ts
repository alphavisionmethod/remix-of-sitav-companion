// SITA OS — Receivables Calculator Service
export interface AgingBucket { label: string; minDays: number; maxDays: number | null; totalCents: number; count: number; collectionProbability: number }
export interface ReceivablesAnalysis { buckets: AgingBucket[]; totalOutstandingCents: number; weightedCollectibleCents: number; avgDaysOutstanding: number }

export function calculateReceivablesAging(invoices: { amountCents: number; daysPastDue: number }[]): ReceivablesAnalysis {
  const bucketDefs = [
    { label: "Current", minDays: 0, maxDays: 0, prob: 0.98 },
    { label: "1-30 days", minDays: 1, maxDays: 30, prob: 0.95 },
    { label: "31-60 days", minDays: 31, maxDays: 60, prob: 0.85 },
    { label: "61-90 days", minDays: 61, maxDays: 90, prob: 0.65 },
    { label: "90+ days", minDays: 91, maxDays: null, prob: 0.35 },
  ];
  const buckets: AgingBucket[] = bucketDefs.map((bd) => {
    const matching = invoices.filter((i) => i.daysPastDue >= bd.minDays && (bd.maxDays === null || i.daysPastDue <= bd.maxDays));
    return { label: bd.label, minDays: bd.minDays, maxDays: bd.maxDays, totalCents: matching.reduce((a, i) => a + i.amountCents, 0), count: matching.length, collectionProbability: bd.prob };
  });
  const total = buckets.reduce((a, b) => a + b.totalCents, 0);
  const weighted = buckets.reduce((a, b) => a + b.totalCents * b.collectionProbability, 0);
  const avgDays = invoices.length > 0 ? invoices.reduce((a, i) => a + i.daysPastDue, 0) / invoices.length : 0;
  return { buckets, totalOutstandingCents: total, weightedCollectibleCents: Math.round(weighted), avgDaysOutstanding: Math.round(avgDays) };
}
