// ═══════════════════════════════════════════════════════════════
// SITA OS — Specialized: Diagnostic Bundle
// ═══════════════════════════════════════════════════════════════

export interface DiagnosticBundle {
  id: string;
  generatedAt: string;
  systemHealth: number; // 0-100
  incidents: string[];
  degradedServices: string[];
  stuckWorkflows: string[];
  costAnomalies: string[];
  policyViolations: string[];
  supportSafe: boolean; // true = PII redacted
}
