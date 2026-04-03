// ═══════════════════════════════════════════════════════════════
// SITA OS — Correction Service
// Records user corrections to AI outputs; adjusts confidence
// ═══════════════════════════════════════════════════════════════

export interface CorrectionRecord {
  id: string;
  field: string;
  domain: string;
  originalValue: unknown;
  correctedValue: unknown;
  source: "advisor" | "projection" | "workflow" | "action";
  advisorId?: string;
  timestamp: string;
  impactOnConfidence: number;
}

export interface CorrectionStats {
  totalCorrections: number;
  byDomain: Record<string, number>;
  bySource: Record<string, number>;
  avgConfidenceImpact: number;
  frequentFields: { field: string; count: number }[];
}

const corrections: CorrectionRecord[] = [];

export function recordCorrection(params: {
  field: string;
  domain: string;
  originalValue: unknown;
  correctedValue: unknown;
  source: CorrectionRecord["source"];
  advisorId?: string;
}): CorrectionRecord {
  const record: CorrectionRecord = {
    id: crypto.randomUUID(),
    ...params,
    timestamp: new Date().toISOString(),
    impactOnConfidence: calculateConfidenceImpact(params.field, params.domain),
  };
  corrections.push(record);
  return record;
}

function calculateConfidenceImpact(field: string, domain: string): number {
  const criticalFields = ["balance", "payment", "amount", "tax", "reserve"];
  const isCritical = criticalFields.some((f) => field.toLowerCase().includes(f));
  const domainWeight = domain === "finance" ? 1.5 : domain === "business" ? 1.2 : 1.0;
  return (isCritical ? -0.15 : -0.05) * domainWeight;
}

export function getCorrections(filters?: { domain?: string; source?: string; since?: string }): CorrectionRecord[] {
  let results = [...corrections];
  if (filters?.domain) results = results.filter((c) => c.domain === filters.domain);
  if (filters?.source) results = results.filter((c) => c.source === filters.source);
  if (filters?.since) {
    const since = new Date(filters.since).getTime();
    results = results.filter((c) => new Date(c.timestamp).getTime() >= since);
  }
  return results;
}

export function computeCorrectionStats(): CorrectionStats {
  const byDomain: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const fieldCounts: Record<string, number> = {};

  for (const c of corrections) {
    byDomain[c.domain] = (byDomain[c.domain] || 0) + 1;
    bySource[c.source] = (bySource[c.source] || 0) + 1;
    fieldCounts[c.field] = (fieldCounts[c.field] || 0) + 1;
  }

  const avgImpact = corrections.length > 0
    ? corrections.reduce((a, c) => a + c.impactOnConfidence, 0) / corrections.length
    : 0;

  const frequentFields = Object.entries(fieldCounts)
    .map(([field, count]) => ({ field, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return { totalCorrections: corrections.length, byDomain, bySource, avgConfidenceImpact: avgImpact, frequentFields };
}
