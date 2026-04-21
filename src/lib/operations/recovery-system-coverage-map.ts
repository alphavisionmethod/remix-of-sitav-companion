// ═══════════════════════════════════════════════════════════════
// SITA OS — Recovery System Coverage Map (Wave 21)
// Maps critical system families to covering runbooks and gaps.
// ═══════════════════════════════════════════════════════════════

export interface SystemCoverageEntry {
  readonly systemFamily: string;
  readonly displayName: string;
  readonly critical: boolean;
  readonly coveringRunbookIds: readonly string[];
  readonly coveragePercent: number;
  readonly gaps: readonly string[];
}

export const SYSTEM_COVERAGE_MAP: readonly SystemCoverageEntry[] = [
  { systemFamily: "auth", displayName: "Authentication", critical: true,
    coveringRunbookIds: ["RB-001"], coveragePercent: 100, gaps: [] },
  { systemFamily: "onboarding", displayName: "Onboarding / Setup", critical: true,
    coveringRunbookIds: ["RB-012"], coveragePercent: 100, gaps: [] },
  { systemFamily: "app-lifecycle", displayName: "App Lifecycle / Platform", critical: true,
    coveringRunbookIds: [], coveragePercent: 0, gaps: ["No dedicated app-lifecycle recovery runbook"] },
  { systemFamily: "advisors", displayName: "Advisors / Boardroom", critical: true,
    coveringRunbookIds: ["RB-013"], coveragePercent: 80, gaps: ["Boardroom follow-through recovery not explicit"] },
  { systemFamily: "ai-runtime", displayName: "AI Runtime / Providers", critical: true,
    coveringRunbookIds: ["RB-002", "RB-010"], coveragePercent: 100, gaps: [] },
  { systemFamily: "payments", displayName: "Payments / Proof", critical: true,
    coveringRunbookIds: ["RB-005"], coveragePercent: 100, gaps: [] },
  { systemFamily: "connectors", displayName: "Connectors / Integrations", critical: true,
    coveringRunbookIds: ["RB-003", "RB-011"], coveragePercent: 100, gaps: [] },
  { systemFamily: "files", displayName: "File Processing", critical: false,
    coveringRunbookIds: [], coveragePercent: 0, gaps: ["No file-processing recovery runbook"] },
  { systemFamily: "desktop", displayName: "Desktop Host", critical: true,
    coveringRunbookIds: ["RB-008", "RB-016"], coveragePercent: 100, gaps: [] },
  { systemFamily: "os-appliance", displayName: "OS / Appliance Runtime", critical: true,
    coveringRunbookIds: ["RB-008", "RB-009"], coveragePercent: 80, gaps: ["OS-level verity failure not covered"] },
  { systemFamily: "control-plane", displayName: "Alerts / Approvals / Control Plane", critical: true,
    coveringRunbookIds: ["RB-006", "RB-013"], coveragePercent: 100, gaps: [] },
  { systemFamily: "support", displayName: "Support Bundle Generation", critical: false,
    coveringRunbookIds: ["RB-019"], coveragePercent: 100, gaps: [] },
  { systemFamily: "release", displayName: "Release / Rollback", critical: true,
    coveringRunbookIds: ["RB-009"], coveragePercent: 100, gaps: [] },
];

export function getCoverageForSystem(family: string): SystemCoverageEntry | undefined {
  return SYSTEM_COVERAGE_MAP.find((e) => e.systemFamily === family);
}

export function getCriticalGaps(): readonly SystemCoverageEntry[] {
  return SYSTEM_COVERAGE_MAP.filter((e) => e.critical && e.coveragePercent < 100);
}

export function getOverallCoveragePercent(): number {
  const critical = SYSTEM_COVERAGE_MAP.filter((e) => e.critical);
  if (critical.length === 0) return 100;
  return Math.round(critical.reduce((s, e) => s + e.coveragePercent, 0) / critical.length);
}