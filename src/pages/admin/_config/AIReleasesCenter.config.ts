// ═══════════════════════════════════════════════════════════════
// AIReleasesCenter — UI catalog (Wave 9.2)
//
// Authored release-readiness catalog (gates, environments, rollback
// targets, promotion checks). Live status comes from useAIEngDomain
// at render time; this file provides the operator-facing definitions.
// ═══════════════════════════════════════════════════════════════

export type GateStatus = "pass" | "fail" | "warn";
export type EnvStatus = "healthy" | "warning" | "degraded";
export type ReleaseRisk = "low" | "medium" | "high";
export type ReleaseStatus = "live" | "rolled_back" | "promoted" | "staged";

export interface ReleaseGate {
  gate: string;
  status: GateStatus;
  required: boolean;
  detail: string;
}

export interface ReleaseEnvironment {
  env: string;
  version: string;
  status: EnvStatus;
  confidence: number;
  deployedAt: string;
  drift: string;
  rollbackTo: string;
}

export interface ReleaseHistoryEntry {
  version: string;
  at: string;
  gates: string;
  confidence: number;
  issues: number;
  status: ReleaseStatus;
}

export interface RollbackTarget {
  target: string;
  risk: ReleaseRisk;
  impact: string;
  estimated: string;
  dataLoss: string;
}

export interface PromotionCheck {
  check: string;
  met: boolean;
  detail?: string;
}

/** Authored release gates the platform validates before promotion. */
export const RELEASE_GATES: ReleaseGate[] = [
  { gate: "Build clean", status: "pass", required: true, detail: "TypeScript + ESLint + Vite build all green." },
  { gate: "Unit tests", status: "pass", required: true, detail: "Vitest suite passing across all packages." },
  { gate: "E2E tests", status: "pass", required: true, detail: "Playwright nightly run passing." },
  { gate: "Security scan", status: "pass", required: true, detail: "No high/critical vulns; all secrets present." },
  { gate: "Truth-checker", status: "warn", required: true, detail: "Admin truth-checker reports degraded entries; investigate before promote." },
  { gate: "Receipts coverage", status: "warn", required: false, detail: "Receipt emission below 95% target on a few admin mutations." },
  { gate: "Performance baseline", status: "pass", required: true, detail: "p95 stable vs. last green release." },
  { gate: "Migration safety", status: "pass", required: true, detail: "All migrations reversible with verified rollback." },
  { gate: "Feature flag review", status: "pass", required: false, detail: "Flag matrix matches release plan." },
];

/** Authored environment topology. */
export const RELEASE_ENVIRONMENTS: ReleaseEnvironment[] = [
  { env: "Production", version: "v2.14.0", status: "healthy", confidence: 96, deployedAt: "2026-04-08T10:30:00Z", drift: "0 patches", rollbackTo: "v2.13.4" },
  { env: "Staging", version: "v2.15.0-rc.3", status: "warning", confidence: 78, deployedAt: "2026-04-10T08:15:00Z", drift: "+12 commits", rollbackTo: "v2.14.0" },
  { env: "Preview", version: "v2.15.0-rc.4", status: "healthy", confidence: 88, deployedAt: "2026-04-10T11:45:00Z", drift: "+1 commit", rollbackTo: "v2.15.0-rc.3" },
];

/** Authored recent release history. */
export const RELEASE_HISTORY: ReleaseHistoryEntry[] = [
  { version: "v2.14.0", at: "2026-04-08", gates: "8/9", confidence: 96, issues: 0, status: "live" },
  { version: "v2.13.4", at: "2026-04-02", gates: "9/9", confidence: 98, issues: 1, status: "promoted" },
  { version: "v2.13.3", at: "2026-03-29", gates: "8/9", confidence: 91, issues: 0, status: "promoted" },
  { version: "v2.13.2", at: "2026-03-25", gates: "7/9", confidence: 84, issues: 3, status: "rolled_back" },
  { version: "v2.13.1", at: "2026-03-22", gates: "9/9", confidence: 95, issues: 1, status: "promoted" },
];

/** Authored rollback targets with risk profile. */
export const ROLLBACK_TARGETS: RollbackTarget[] = [
  { target: "v2.13.4 (last green)", risk: "low", impact: "No schema changes — pure code rollback.", estimated: "8m", dataLoss: "None" },
  { target: "v2.13.3", risk: "medium", impact: "Reverts feature-flag default for AI digest.", estimated: "12m", dataLoss: "None" },
  { target: "v2.13.1", risk: "high", impact: "Reverses one forward-only migration; manual reseed required.", estimated: "45m", dataLoss: "Last 6 days of digest cache" },
];

/** Authored staging→production promotion evidence checklist. */
export const PROMOTION_CHECKS: PromotionCheck[] = [
  { check: "Staging soaked ≥ 24h with live traffic mirror", met: true },
  { check: "All required gates pass", met: false, detail: "Truth-checker still warns" },
  { check: "No active SEV-1 or SEV-2 incidents", met: true },
  { check: "Release notes signed off by domain owners", met: true },
  { check: "Rollback plan validated against latest snapshot", met: true },
  { check: "Receipts coverage above promotion threshold (95%)", met: false, detail: "Currently 92%" },
];