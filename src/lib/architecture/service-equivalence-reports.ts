// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Equivalence Reports (Workstream A)
// Behavioral analysis framework for duplicate service pairs
// ═══════════════════════════════════════════════════════════════

export type EquivalenceVerdict = "identical" | "compatible" | "divergent" | "pending";

export interface ExportComparison {
  exportName: string;
  inCoreServices: boolean;
  inServices: boolean;
  signatureMatch: boolean;
  notes: string;
}

export interface EquivalenceReport {
  pairId: string;
  coreServicesPath: string;
  servicesPath: string;
  verdict: EquivalenceVerdict;
  analyzedAt: string;
  publicApiDiff: {
    coreServicesExports: number;
    servicesExports: number;
    sharedExports: number;
    uniqueToCoreServices: string[];
    uniqueToServices: string[];
  };
  exportComparisons: ExportComparison[];
  sideEffects: {
    coreServices: string[];
    services: string[];
    differences: string[];
  };
  errorHandling: {
    matchLevel: "identical" | "similar" | "different" | "unknown";
    notes: string;
  };
  receiptEmission: {
    coreServicesEmits: boolean;
    servicesEmits: boolean;
    compatible: boolean;
  };
  migrationNotes: string;
  blockers: string[];
}

/**
 * Placeholder reports — populated by scripts/architecture/consolidation/
 * as each pair is analyzed. Initially all "pending".
 */
export const EQUIVALENCE_REPORTS: EquivalenceReport[] = [];

export function getReportForPair(pairId: string): EquivalenceReport | undefined {
  return EQUIVALENCE_REPORTS.find(r => r.pairId === pairId);
}

export function getPendingAnalysis(): string[] {
  const analyzed = new Set(EQUIVALENCE_REPORTS.map(r => r.pairId));
  // Import inline to avoid circular — pairs come from duplicate-service-registry
  return []; // Populated at runtime by consolidation scripts
}

export function getBlockedPairs(): EquivalenceReport[] {
  return EQUIVALENCE_REPORTS.filter(r => r.blockers.length > 0);
}