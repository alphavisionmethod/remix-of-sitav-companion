// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Control Plane: Canonical Operator Workflows
//
// Consolidates the 12 admin domains into 8 canonical operator
// workflows (information architecture only — no page deletions).
// AdminControlPlaneShell uses this registry for primary nav;
// existing 12 domains remain reachable as sub-navigation.
// ═══════════════════════════════════════════════════════════════

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Rocket,
  LifeBuoy,
  ShieldCheck,
  Lock,
  Brain,
  Cloud,
  Users,
} from "lucide-react";

export type AdminWorkflowKey =
  | "incident-triage"
  | "release-readiness"
  | "support-diagnostics"
  | "truth-verification"
  | "security-killswitch"
  | "ai-governance"
  | "platform-control"
  | "user-org-intervention";

export interface AdminWorkflow {
  key: AdminWorkflowKey;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  /** Primary route entered when the workflow is selected. */
  primaryRoute: string;
  /** Existing admin domain pages this workflow surfaces. */
  supportingRoutes: { label: string; route: string }[];
  /** RBAC permission required to enter the workflow. */
  requiredPermission: string;
  /** Operator-facing "when to use this" line. */
  whenToUse: string;
}

export const ADMIN_WORKFLOWS: AdminWorkflow[] = [
  {
    key: "incident-triage",
    label: "Incident Triage",
    shortLabel: "Incidents",
    description: "Live alerts, active incidents, on-call status, real-time service health.",
    icon: AlertTriangle,
    primaryRoute: "/admin/observability/incidents",
    supportingRoutes: [
      { label: "Alerts", route: "/admin/alerts" },
      { label: "Health", route: "/admin/health" },
      { label: "Approvals (urgent)", route: "/admin/approvals" },
      { label: "Environments", route: "/admin/environments" },
    ],
    requiredPermission: "audit.view",
    whenToUse: "Something is on fire. Triage signal, identify scope, escalate or intervene.",
  },
  {
    key: "release-readiness",
    label: "Release Readiness",
    shortLabel: "Releases",
    description: "Release gates, readiness reports, rollout posture, rollback decisions.",
    icon: Rocket,
    primaryRoute: "/admin/release",
    supportingRoutes: [
      { label: "Releases", route: "/admin/releases" },
      { label: "Verification", route: "/admin/verification" },
      { label: "Approvals", route: "/admin/approvals" },
    ],
    requiredPermission: "release.view",
    whenToUse: "Deciding whether to ship, hold, or roll back.",
  },
  {
    key: "support-diagnostics",
    label: "Support Diagnostics",
    shortLabel: "Support",
    description: "Customer cases, support bundles, diagnostic deep-dives, repair toolkit.",
    icon: LifeBuoy,
    primaryRoute: "/admin/support",
    supportingRoutes: [
      { label: "Support cases", route: "/admin/support/cases" },
      { label: "Health", route: "/admin/health" },
      { label: "Environments", route: "/admin/environments" },
    ],
    requiredPermission: "support.view",
    whenToUse: "A customer is blocked or a device is misbehaving.",
  },
  {
    key: "truth-verification",
    label: "Truth & Verification",
    shortLabel: "Truth",
    description: "Reality audit, manifest drift, claim-vs-evidence reconciliation.",
    icon: ShieldCheck,
    primaryRoute: "/admin/verification",
    supportingRoutes: [
      { label: "Verification dashboards", route: "/admin/verification" },
      { label: "Releases (truth gate)", route: "/admin/releases" },
      { label: "Config truth", route: "/admin/config" },
    ],
    requiredPermission: "verification.view",
    whenToUse: "Ensure docs, manifests, and runtime agree before claims go out.",
  },
  {
    key: "security-killswitch",
    label: "Security & Kill-Switch",
    shortLabel: "Security",
    description: "Privileged controls, kill switches, security posture, audit trail.",
    icon: Lock,
    primaryRoute: "/admin/security",
    supportingRoutes: [
      { label: "Trust & Security", route: "/admin/trust-security" },
      { label: "Approvals (privileged)", route: "/admin/approvals" },
      { label: "Audit log", route: "/admin/observability/audit" },
    ],
    requiredPermission: "security.view",
    whenToUse: "Take privileged action: disable a feature, revoke access, freeze a flow.",
  },
  {
    key: "ai-governance",
    label: "AI Governance",
    shortLabel: "AI",
    description: "AI runtime: budgets, receipts, prompt families, model routing, safety.",
    icon: Brain,
    primaryRoute: "/admin/ai-runtime",
    supportingRoutes: [
      { label: "AI runtime", route: "/admin/ai-runtime" },
      { label: "Approvals (AI)", route: "/admin/approvals" },
      { label: "Verification", route: "/admin/verification" },
    ],
    requiredPermission: "ai.governance.view",
    whenToUse: "Manage AI cost, safety, fallbacks, and approval workflows.",
  },
  {
    key: "platform-control",
    label: "Platform / Cloud Control",
    shortLabel: "Platform",
    description: "Cloud connectors, integrations, environments, backend topology.",
    icon: Cloud,
    primaryRoute: "/admin/integrations",
    supportingRoutes: [
      { label: "Integrations", route: "/admin/integrations" },
      { label: "Environments", route: "/admin/environments" },
      { label: "Config", route: "/admin/config" },
    ],
    requiredPermission: "platform.view",
    whenToUse: "Manage backend services, connectors, and environment configuration.",
  },
  {
    key: "user-org-intervention",
    label: "User / Org Intervention",
    shortLabel: "Users",
    description: "Direct user/org operations: impersonation, access changes, account repair.",
    icon: Users,
    primaryRoute: "/admin/users",
    supportingRoutes: [
      { label: "Users", route: "/admin/users" },
      { label: "Approvals (user actions)", route: "/admin/approvals" },
      { label: "Audit log", route: "/admin/observability/audit" },
    ],
    requiredPermission: "users.intervene",
    whenToUse: "Operator-led intervention on a specific account or org.",
  },
];

export function getAdminWorkflow(key: AdminWorkflowKey): AdminWorkflow | undefined {
  return ADMIN_WORKFLOWS.find(w => w.key === key);
}

export function getAdminWorkflowForRoute(pathname: string): AdminWorkflow | undefined {
  // Longest-match across primary + supporting routes.
  let best: { wf: AdminWorkflow; len: number } | null = null;
  for (const wf of ADMIN_WORKFLOWS) {
    const candidates = [wf.primaryRoute, ...wf.supportingRoutes.map(r => r.route)];
    for (const r of candidates) {
      if (pathname === r || pathname.startsWith(r + "/")) {
        if (!best || r.length > best.len) best = { wf, len: r.length };
      }
    }
  }
  return best?.wf;
}
