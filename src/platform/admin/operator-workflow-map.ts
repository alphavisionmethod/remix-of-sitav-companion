// ═══════════════════════════════════════════════════════════════
// SITA OS — Operator Workflow Map
// Maps 5 operator workflows to admin routes and actions.
// ═══════════════════════════════════════════════════════════════

export interface OperatorWorkflow {
  readonly id: string;
  readonly name: string;
  readonly cadence: "daily" | "weekly" | "on-demand" | "release" | "incident";
  readonly routes: readonly string[];
  readonly killSwitches: readonly string[];
  readonly runbooks: readonly string[];
}

export const OPERATOR_WORKFLOWS: readonly OperatorWorkflow[] = [
  {
    id: "daily-health",
    name: "Daily Health Check",
    cadence: "daily",
    routes: ["/admin", "/admin/ai-engineering", "/admin/integrations"],
    killSwitches: [],
    runbooks: ["RB-OPS-001"],
  },
  {
    id: "weekly-review",
    name: "Weekly Business Review",
    cadence: "weekly",
    routes: ["/admin/ai-engineering/budgets", "/admin/golden-paths"],
    killSwitches: [],
    runbooks: [],
  },
  {
    id: "support-triage",
    name: "Support Triage",
    cadence: "on-demand",
    routes: ["/admin/users", "/admin/runbooks"],
    killSwitches: ["KS-CONNECTORS"],
    runbooks: ["RB-SUPPORT-001", "RB-AUTH-001"],
  },
  {
    id: "release-gate",
    name: "Release Gate Review",
    cadence: "release",
    routes: ["/admin/release-readiness"],
    killSwitches: [],
    runbooks: ["RB-RELEASE-001"],
  },
  {
    id: "trust-safety",
    name: "Trust & Safety Incident",
    cadence: "incident",
    routes: ["/admin/kill-switches", "/admin/runbooks", "/admin/audit"],
    killSwitches: ["KS-PAYMENTS", "KS-MODEL-PROVIDERS", "KS-CONNECTORS"],
    runbooks: ["RB-OPS-001", "RB-SECURITY-001"],
  },
];