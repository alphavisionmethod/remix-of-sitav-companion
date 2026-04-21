// ═══════════════════════════════════════════════════════════════
// SITA OS — Consolidation Wave Registry
// Defines ordered waves of route/workflow consolidation with
// pre/post regression assertions for automated testing.
// ═══════════════════════════════════════════════════════════════

export type ConsolidationAction = "merge" | "deprecate" | "archive" | "redirect";

export interface AffectedRoute {
  readonly path: string;
  readonly label: string;
  /** Expected behavior before the wave executes */
  readonly preWave: "reachable" | "reachable-deprecated";
  /** Expected behavior after the wave executes */
  readonly postWave: "reachable" | "redirected" | "removed" | "merged";
  /** If redirected/merged, the destination */
  readonly redirectTo?: string;
}

export interface AffectedWorkflow {
  readonly workflowId: string;
  readonly name: string;
  /** Routes in this workflow that must remain functional after wave */
  readonly criticalRoutes: readonly string[];
}

export interface ConsolidationWave {
  readonly id: string;
  readonly name: string;
  readonly order: number;
  readonly status: "pending" | "in-progress" | "completed" | "rolled-back";
  readonly description: string;
  readonly affectedRoutes: readonly AffectedRoute[];
  readonly affectedWorkflows: readonly AffectedWorkflow[];
  readonly breakingChanges: boolean;
  /** ISO timestamp of last regression run */
  readonly lastTestedAt?: string;
  readonly lastTestResult?: "pass" | "fail";
}

/**
 * Wave 1: Merge Trust & Security → Verification Center
 * Source: admin-consolidation-plan.json recommendation #1
 */
const WAVE_1_TRUST_SECURITY_MERGE: ConsolidationWave = {
  id: "wave-1-trust-security-merge",
  name: "Trust & Security → Verification Center",
  order: 1,
  status: "pending",
  description:
    "Merge Trust & Security panel into Verification Center. Shared data sources and domain overlap justify consolidation.",
  breakingChanges: true,
  affectedRoutes: [
    {
      path: "/admin/trust-security",
      label: "Trust & Security",
      preWave: "reachable",
      postWave: "redirected",
      redirectTo: "/admin/verification",
    },
    {
      path: "/admin/verification",
      label: "Verification Center",
      preWave: "reachable",
      postWave: "reachable",
    },
    {
      path: "/admin/verification/surfaces",
      label: "V01 Surface Inventory",
      preWave: "reachable",
      postWave: "reachable",
    },
    {
      path: "/admin/verification/coverage",
      label: "V02 Coverage Board",
      preWave: "reachable",
      postWave: "reachable",
    },
    {
      path: "/admin/security/posture",
      label: "SEC01 Posture",
      preWave: "reachable",
      postWave: "reachable",
    },
  ],
  affectedWorkflows: [
    {
      workflowId: "trust-safety",
      name: "Trust & Safety Incident",
      criticalRoutes: ["/admin/verification", "/admin/security/posture"],
    },
  ],
};

/**
 * Wave 2: Deprecate Environments Panel → Release Center
 * Source: admin-consolidation-plan.json recommendation #2
 */
const WAVE_2_ENVIRONMENTS_DEPRECATE: ConsolidationWave = {
  id: "wave-2-environments-deprecate",
  name: "Environments Panel → Release Center",
  order: 2,
  status: "pending",
  description:
    "Deprecate low-usage Environments Panel. Redirect traffic to Release Center.",
  breakingChanges: false,
  affectedRoutes: [
    {
      path: "/admin/environments",
      label: "Environments Panel",
      preWave: "reachable",
      postWave: "redirected",
      redirectTo: "/admin/releases",
    },
    {
      path: "/admin/releases",
      label: "Release Center",
      preWave: "reachable",
      postWave: "reachable",
    },
    {
      path: "/admin/release",
      label: "Release Gate",
      preWave: "reachable",
      postWave: "reachable",
    },
  ],
  affectedWorkflows: [
    {
      workflowId: "release-gate",
      name: "Release Gate Review",
      criticalRoutes: ["/admin/releases", "/admin/release"],
    },
  ],
};

/**
 * Wave 3: Merge Alerts Center → Health Dashboard
 * Source: admin-consolidation-plan.json recommendation #3
 */
const WAVE_3_ALERTS_MERGE: ConsolidationWave = {
  id: "wave-3-alerts-merge",
  name: "Alerts Center → Health Dashboard",
  order: 3,
  status: "pending",
  description:
    "Consolidate Alerts Center alert tabs into the Health Dashboard. Same operational domain and data sources.",
  breakingChanges: true,
  affectedRoutes: [
    {
      path: "/admin/alerts",
      label: "Alerts Center",
      preWave: "reachable",
      postWave: "redirected",
      redirectTo: "/admin/health",
    },
    {
      path: "/admin/health",
      label: "Health Dashboard",
      preWave: "reachable",
      postWave: "reachable",
    },
    {
      path: "/admin/system-health",
      label: "System Health",
      preWave: "reachable",
      postWave: "reachable",
    },
  ],
  affectedWorkflows: [
    {
      workflowId: "daily-health",
      name: "Daily Health Check",
      criticalRoutes: ["/admin/health", "/admin/system-health"],
    },
    {
      workflowId: "trust-safety",
      name: "Trust & Safety Incident",
      criticalRoutes: ["/admin/health"],
    },
  ],
};

/** Ordered list of all consolidation waves */
export const CONSOLIDATION_WAVES: readonly ConsolidationWave[] = [
  WAVE_1_TRUST_SECURITY_MERGE,
  WAVE_2_ENVIRONMENTS_DEPRECATE,
  WAVE_3_ALERTS_MERGE,
];

/** Get a wave by ID */
export function getWaveById(id: string): ConsolidationWave | undefined {
  return CONSOLIDATION_WAVES.find((w) => w.id === id);
}

/** Get waves that affect a specific route */
export function getWavesForRoute(routePath: string): ConsolidationWave[] {
  return CONSOLIDATION_WAVES.filter((w) =>
    w.affectedRoutes.some((r) => r.path === routePath)
  );
}

/** Get all routes across all waves that should be tested */
export function getAllAffectedRoutes(): AffectedRoute[] {
  const seen = new Set<string>();
  const routes: AffectedRoute[] = [];
  for (const wave of CONSOLIDATION_WAVES) {
    for (const r of wave.affectedRoutes) {
      if (!seen.has(r.path)) {
        seen.add(r.path);
        routes.push(r);
      }
    }
  }
  return routes;
}

/** Get waves by status */
export function getWavesByStatus(status: ConsolidationWave["status"]): ConsolidationWave[] {
  return CONSOLIDATION_WAVES.filter((w) => w.status === status);
}