// ═══════════════════════════════════════════════════════════════
// SITA OS — Route → Observability Map
// Maps routes to error reporting, telemetry hooks, and
// admin diagnostic paths.
// ═══════════════════════════════════════════════════════════════

import type { ErrorReporting } from "./route-intent-taxonomy";

export interface RouteObservabilityEntry {
  readonly prefix: string;
  readonly family: string;
  readonly errorReporting: ErrorReporting;
  readonly telemetryHooks: readonly string[];
  readonly adminDiagnosticPath: string | null;
}

export const ROUTE_OBSERVABILITY_MAP: readonly RouteObservabilityEntry[] = [
  { prefix: "/money", family: "Money", errorReporting: "structured", telemetryHooks: ["page-view", "action", "latency"], adminDiagnosticPath: "/admin/observability" },
  { prefix: "/boardroom", family: "Boardroom", errorReporting: "structured", telemetryHooks: ["page-view", "action", "latency"], adminDiagnosticPath: "/admin/observability" },
  { prefix: "/concierge", family: "Concierge", errorReporting: "structured", telemetryHooks: ["page-view", "action", "latency"], adminDiagnosticPath: "/admin/observability" },
  { prefix: "/advisors", family: "Advisors", errorReporting: "structured", telemetryHooks: ["page-view", "action", "latency"], adminDiagnosticPath: "/admin/observability" },
  { prefix: "/connectors", family: "Connectors", errorReporting: "structured", telemetryHooks: ["page-view", "action", "latency"], adminDiagnosticPath: "/admin/observability" },
  { prefix: "/admin", family: "Admin", errorReporting: "structured", telemetryHooks: ["page-view", "action", "latency"], adminDiagnosticPath: "/admin/observability" },
  { prefix: "/owner", family: "Owner", errorReporting: "structured", telemetryHooks: ["page-view", "action"], adminDiagnosticPath: "/admin/observability" },
  { prefix: "/mission", family: "Mission", errorReporting: "structured", telemetryHooks: ["page-view", "action"], adminDiagnosticPath: "/admin/observability" },
  { prefix: "/login", family: "Auth", errorReporting: "structured", telemetryHooks: ["page-view"], adminDiagnosticPath: null },
  { prefix: "/register", family: "Auth", errorReporting: "structured", telemetryHooks: ["page-view"], adminDiagnosticPath: null },
  { prefix: "/revenue-office", family: "Revenue", errorReporting: "structured", telemetryHooks: ["page-view", "action"], adminDiagnosticPath: null },
  { prefix: "/investment-office", family: "Investment", errorReporting: "structured", telemetryHooks: ["page-view", "action"], adminDiagnosticPath: null },
  { prefix: "/business", family: "Business", errorReporting: "best-effort", telemetryHooks: ["page-view"], adminDiagnosticPath: null },
  { prefix: "/files", family: "Files", errorReporting: "best-effort", telemetryHooks: ["page-view"], adminDiagnosticPath: null },
  { prefix: "/settings", family: "Settings", errorReporting: "best-effort", telemetryHooks: ["page-view"], adminDiagnosticPath: null },
  { prefix: "/desktop", family: "Desktop", errorReporting: "best-effort", telemetryHooks: ["page-view"], adminDiagnosticPath: null },
  { prefix: "/workspace", family: "Workspace", errorReporting: "best-effort", telemetryHooks: ["page-view"], adminDiagnosticPath: null },
  { prefix: "/apps", family: "Apps", errorReporting: "best-effort", telemetryHooks: ["page-view"], adminDiagnosticPath: null },
  { prefix: "/governance", family: "Governance", errorReporting: "best-effort", telemetryHooks: ["page-view"], adminDiagnosticPath: null },
  { prefix: "/notifications", family: "Notifications", errorReporting: "best-effort", telemetryHooks: ["page-view"], adminDiagnosticPath: null },
  { prefix: "/search", family: "Search", errorReporting: "best-effort", telemetryHooks: ["page-view"], adminDiagnosticPath: null },
  { prefix: "/onboarding", family: "Onboarding", errorReporting: "best-effort", telemetryHooks: ["page-view"], adminDiagnosticPath: null },
  { prefix: "/observability", family: "Observability", errorReporting: "structured", telemetryHooks: ["page-view", "action"], adminDiagnosticPath: "/admin/observability" },
  { prefix: "/digital-presence", family: "Digital Presence", errorReporting: "best-effort", telemetryHooks: ["page-view"], adminDiagnosticPath: null },
  { prefix: "/enterprise", family: "Enterprise", errorReporting: "best-effort", telemetryHooks: ["page-view"], adminDiagnosticPath: null },
  { prefix: "/policies", family: "Policies", errorReporting: "best-effort", telemetryHooks: ["page-view"], adminDiagnosticPath: null },
  { prefix: "/nova-desktop", family: "Nova Desktop", errorReporting: "best-effort", telemetryHooks: ["page-view"], adminDiagnosticPath: null },
];

export function getRouteObservability(prefix: string): RouteObservabilityEntry | undefined {
  let best: RouteObservabilityEntry | undefined;
  for (const entry of ROUTE_OBSERVABILITY_MAP) {
    if (prefix === entry.prefix || prefix.startsWith(entry.prefix + "/")) {
      if (!best || entry.prefix.length > best.prefix.length) best = entry;
    }
  }
  return best;
}