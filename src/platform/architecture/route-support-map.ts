// ═══════════════════════════════════════════════════════════════
// SITA OS — Route → Support & Runbook Map
// Maps critical routes to support diagnostics, runbooks,
// kill-switch relevance, and escalation paths.
// ═══════════════════════════════════════════════════════════════

import type { EscalationPath } from "./route-intent-taxonomy";

export interface RouteSupportEntry {
  readonly prefix: string;
  readonly family: string;
  readonly runbookRef: string | null;
  readonly killSwitchRef: string | null;
  readonly escalationPath: EscalationPath;
  readonly diagnosticEntry: string | null;
  readonly supportTier: "critical" | "standard" | "best-effort";
}

export const ROUTE_SUPPORT_MAP: readonly RouteSupportEntry[] = [
  { prefix: "/money", family: "Money", runbookRef: "RB-MONEY-001", killSwitchRef: "KS-FINANCIAL-OPS", escalationPath: "engineering", diagnosticEntry: "/admin/support", supportTier: "critical" },
  { prefix: "/boardroom", family: "Boardroom", runbookRef: "RB-BOARDROOM-001", killSwitchRef: "KS-AI-GLOBAL", escalationPath: "engineering", diagnosticEntry: "/admin/engineering", supportTier: "critical" },
  { prefix: "/concierge", family: "Concierge", runbookRef: "RB-AI-001", killSwitchRef: "KS-AI-GLOBAL", escalationPath: "engineering", diagnosticEntry: "/admin/engineering", supportTier: "critical" },
  { prefix: "/advisors", family: "Advisors", runbookRef: "RB-AI-001", killSwitchRef: "KS-AI-GLOBAL", escalationPath: "engineering", diagnosticEntry: "/admin/engineering", supportTier: "critical" },
  { prefix: "/connectors", family: "Connectors", runbookRef: "RB-CONN-001", killSwitchRef: "KS-CONNECTORS", escalationPath: "engineering", diagnosticEntry: "/admin/support", supportTier: "critical" },
  { prefix: "/admin", family: "Admin", runbookRef: "RB-ADMIN-001", killSwitchRef: "KS-ADMIN-PANEL", escalationPath: "engineering", diagnosticEntry: "/admin/observability", supportTier: "critical" },
  { prefix: "/owner", family: "Owner", runbookRef: "RB-OWNER-001", killSwitchRef: null, escalationPath: "engineering", diagnosticEntry: "/admin/observability", supportTier: "critical" },
  { prefix: "/revenue-office", family: "Revenue", runbookRef: "RB-REVENUE-001", killSwitchRef: null, escalationPath: "engineering", diagnosticEntry: null, supportTier: "standard" },
  { prefix: "/investment-office", family: "Investment", runbookRef: "RB-INVEST-001", killSwitchRef: null, escalationPath: "engineering", diagnosticEntry: null, supportTier: "standard" },
  { prefix: "/files", family: "Files", runbookRef: null, killSwitchRef: null, escalationPath: "self-service", diagnosticEntry: null, supportTier: "standard" },
  { prefix: "/business", family: "Business", runbookRef: null, killSwitchRef: null, escalationPath: "self-service", diagnosticEntry: null, supportTier: "standard" },
  { prefix: "/settings", family: "Settings", runbookRef: null, killSwitchRef: null, escalationPath: "self-service", diagnosticEntry: null, supportTier: "best-effort" },
  { prefix: "/desktop", family: "Desktop", runbookRef: null, killSwitchRef: null, escalationPath: "self-service", diagnosticEntry: null, supportTier: "best-effort" },
  { prefix: "/governance", family: "Governance", runbookRef: null, killSwitchRef: null, escalationPath: "operator", diagnosticEntry: null, supportTier: "standard" },
];

export function getRouteSupport(prefix: string): RouteSupportEntry | undefined {
  let best: RouteSupportEntry | undefined;
  for (const entry of ROUTE_SUPPORT_MAP) {
    if (prefix === entry.prefix || prefix.startsWith(entry.prefix + "/")) {
      if (!best || entry.prefix.length > best.prefix.length) best = entry;
    }
  }
  return best;
}