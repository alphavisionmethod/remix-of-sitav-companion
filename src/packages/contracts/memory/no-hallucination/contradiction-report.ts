// ═══════════════════════════════════════════════════════════════
// SITA OS — Memory: No-Hallucination: Contradiction Report
// ═══════════════════════════════════════════════════════════════

export interface ContradictionItem {
  field: string;
  sourceA: string;
  valueA: string;
  sourceB: string;
  valueB: string;
  severity: "material" | "minor";
}

export interface ContradictionReport {
  contradictions: ContradictionItem[];
  recommendedDowngrade: string | null;
}
