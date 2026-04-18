// ═══════════════════════════════════════════════════════════════
// SITA OS — Owner Workflow Map
//
// Defines the five canonical owner workflows that drive the admin
// IA: daily, weekly, support, release, trust-safety. Every admin
// route in `admin-route-registry.ts` may tag itself with one or
// more of these workflows so the consolidated nav can offer
// workflow-first navigation in addition to domain-first.
//
// Used by:
//   - `src/components/admin/shells/AdminControlPlaneShell.tsx`
//   - `src/components/admin/AdminCommandPalette.tsx`
//   - `scripts/architecture/checks/check-owner-workflow-map.ts`
// ═══════════════════════════════════════════════════════════════

import type { AdminDomain } from "./admin-route-registry";

export type OwnerWorkflowKey = "daily" | "weekly" | "support" | "release" | "trust-safety";

export interface OwnerWorkflowStep {
  /** What the operator is trying to learn or do at this step. */
  intent: string;
  /** Canonical route to land on. */
  route: string;
  /** Optional escalation route when the step yields a problem. */
  escalation?: string;
}

export interface OwnerWorkflow {
  key: OwnerWorkflowKey;
  label: string;
  description: string;
  /** Canonical entry hub for this workflow (always a domain hub path). */
  entry: string;
  /** Domains the workflow may traverse. */
  domains: AdminDomain[];
  /** Ordered drill steps. */
  steps: OwnerWorkflowStep[];
  /** Key metrics surfaced at the entry hub. */
  metrics: string[];
}

export const OWNER_WORKFLOWS: Record<OwnerWorkflowKey, OwnerWorkflow> = {
  daily: {
    key: "daily",
    label: "Daily Command",
    description: "Open admin and know in under 30 seconds what is broken, what needs approval, and whether release is blocked.",
    entry: "/admin/overview",
    domains: ["overview", "alerts", "approvals", "health", "releases"],
    steps: [
      { intent: "Scan executive summary", route: "/admin/overview" },
      { intent: "Triage critical alerts", route: "/admin/alerts", escalation: "/admin/health" },
      { intent: "Process pending approvals", route: "/admin/approvals" },
      { intent: "Check incidents", route: "/admin/health/incidents", escalation: "/admin/support" },
      { intent: "Confirm release is unblocked", route: "/admin/releases/launch-readiness" },
    ],
    metrics: [
      "open critical alerts",
      "approvals pending > 1h",
      "active incidents",
      "release blockers",
      "AI runtime red flags",
    ],
  },
  weekly: {
    key: "weekly",
    label: "Weekly Strategic Review",
    description: "Is the system improving or drifting? Strategic operational review of advisor quality, integration health, costs, truth drift.",
    entry: "/admin/overview/generated-truth",
    domains: ["overview", "ai-runtime", "integrations", "verification", "health"],
    steps: [
      { intent: "Review generated truth manifests", route: "/admin/overview/generated-truth" },
      { intent: "Inspect AI quality and recommendations", route: "/admin/ai-runtime/intelligence/efficiency" },
      { intent: "Check integration health trends", route: "/admin/integrations" },
      { intent: "Compare launch claims vs evidence", route: "/admin/verification/launch-honesty" },
      { intent: "Review cost-to-value", route: "/admin/ai-runtime/costs" },
    ],
    metrics: [
      "advisor recommendation acceptance rate",
      "provider outage minutes",
      "launch honesty score delta",
      "cost per receipt",
      "performance budget violations",
    ],
  },
  support: {
    key: "support",
    label: "Owner Support",
    description: "Help a specific environment / user and fix a problem fast.",
    entry: "/admin/environments",
    domains: ["environments", "support", "alerts", "trust-security"],
    steps: [
      { intent: "Look up environment / user", route: "/admin/environments/users" },
      { intent: "Inspect device & session state", route: "/admin/environments/devices" },
      { intent: "Inspect integration state", route: "/admin/environments/integration-state" },
      { intent: "Inspect workflow status", route: "/admin/environments/workflow-state" },
      { intent: "Open support case / replay", route: "/admin/support/cases", escalation: "/admin/support/replay" },
      { intent: "Run recovery action", route: "/admin/support/recovery" },
    ],
    metrics: [
      "open support cases",
      "stuck workflows",
      "environments needing repair",
      "active diagnostic bundles",
    ],
  },
  release: {
    key: "release",
    label: "Release Readiness",
    description: "Can we ship safely? One coherent path through readiness, blockers, parity, rings, rollback.",
    entry: "/admin/releases",
    domains: ["releases", "verification", "health"],
    steps: [
      { intent: "Review release overview", route: "/admin/releases" },
      { intent: "Inspect launch blockers", route: "/admin/releases/launch-readiness" },
      { intent: "Confirm parity status", route: "/admin/releases/mobile-parity" },
      { intent: "Confirm truth conformance", route: "/admin/verification" },
      { intent: "Verify deployment rings", route: "/admin/releases/deployment-rings" },
      { intent: "Confirm rollback ready", route: "/admin/releases/rollback" },
    ],
    metrics: [
      "blocked release count",
      "ring promotion eligibility",
      "rollback readiness score",
      "appliance build health",
      "mobile release readiness",
    ],
  },
  "trust-safety": {
    key: "trust-safety",
    label: "Trust & Safety",
    description: "Is the system operating within policy and trust?",
    entry: "/admin/trust-security",
    domains: ["trust-security", "approvals", "verification"],
    steps: [
      { intent: "Review approval volume & anomalies", route: "/admin/approvals" },
      { intent: "Inspect policy drift", route: "/admin/trust-security/policies" },
      { intent: "Inspect proof gaps", route: "/admin/trust-security/proofs" },
      { intent: "Inspect connector permissions", route: "/admin/trust-security/permissions" },
      { intent: "Inspect sensitive action integrity", route: "/admin/trust-security/sensitive-actions" },
      { intent: "Open audit trail", route: "/admin/trust-security/audit" },
    ],
    metrics: [
      "approvals over auto threshold",
      "policy drift events",
      "proof gap count",
      "trust state anomalies",
      "outbound communication violations",
    ],
  },
};

export function getWorkflow(key: OwnerWorkflowKey): OwnerWorkflow {
  return OWNER_WORKFLOWS[key];
}

export function getAllWorkflows(): OwnerWorkflow[] {
  return Object.values(OWNER_WORKFLOWS);
}

export function getWorkflowEntries(): Array<{ key: OwnerWorkflowKey; entry: string }> {
  return getAllWorkflows().map((w) => ({ key: w.key, entry: w.entry }));
}

export function validateWorkflowMap(knownRoutes: Set<string>): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const w of getAllWorkflows()) {
    if (!knownRoutes.has(w.entry) && !w.entry.startsWith("/admin/")) {
      errors.push(`Workflow ${w.key} entry not under /admin: ${w.entry}`);
    }
  }
  return { ok: errors.length === 0, errors };
}
