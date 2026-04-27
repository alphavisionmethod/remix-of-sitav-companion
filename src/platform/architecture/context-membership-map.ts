// ═══════════════════════════════════════════════════════════════
// SITA OS — Context Membership Map
// Every route, service, edge function, and table → exactly one context.
// CI gate: scripts/architecture/checks/check-context-membership.ts
// ═══════════════════════════════════════════════════════════════

import { BOUNDED_CONTEXT_REGISTRY } from "./bounded-context-registry";
import type { BoundedContextId } from "./bounded-context-types";

export type MembershipKind = "route" | "service" | "edge-function" | "table";

export interface MembershipBinding {
  readonly kind: MembershipKind;
  readonly identifier: string;
  readonly contextId: BoundedContextId;
}

/**
 * Route prefix → context bindings. Patterns are evaluated by startsWith.
 */
export const ROUTE_CONTEXT_BINDINGS: readonly MembershipBinding[] = [
  // Business OS
  { kind: "route", identifier: "/business",            contextId: "business-os" },
  { kind: "route", identifier: "/revenue-office",      contextId: "business-os" },
  { kind: "route", identifier: "/digital-presence",    contextId: "business-os" },
  { kind: "route", identifier: "/store",               contextId: "business-os" },
  { kind: "route", identifier: "/opportunities",       contextId: "business-os" },
  { kind: "route", identifier: "/people",              contextId: "business-os" },
  { kind: "route", identifier: "/team",                contextId: "business-os" },
  // Finance OS
  { kind: "route", identifier: "/money",               contextId: "finance-os" },
  { kind: "route", identifier: "/ai-economics",        contextId: "finance-os" },
  { kind: "route", identifier: "/recovered-value",     contextId: "finance-os" },
  { kind: "route", identifier: "/spillovers",          contextId: "finance-os" },
  { kind: "route", identifier: "/reporting",           contextId: "finance-os" },
  // Concierge OS
  { kind: "route", identifier: "/concierge",           contextId: "concierge-os" },
  { kind: "route", identifier: "/communications",      contextId: "concierge-os" },
  { kind: "route", identifier: "/communication-inbox", contextId: "concierge-os" },
  { kind: "route", identifier: "/calendar",            contextId: "concierge-os" },
  { kind: "route", identifier: "/tasks",               contextId: "concierge-os" },
  { kind: "route", identifier: "/personal-life",       contextId: "concierge-os" },
  { kind: "route", identifier: "/life",                contextId: "concierge-os" },
  { kind: "route", identifier: "/notifications",       contextId: "concierge-os" },
  { kind: "route", identifier: "/inbox",               contextId: "concierge-os" },
  // Investment Office
  { kind: "route", identifier: "/investment",          contextId: "investment-office" },
  { kind: "route", identifier: "/capital",             contextId: "investment-office" },
  // Boardroom
  { kind: "route", identifier: "/boardroom",           contextId: "boardroom" },
  { kind: "route", identifier: "/advisors",            contextId: "boardroom" },
  { kind: "route", identifier: "/approval-chamber",    contextId: "boardroom" },
  { kind: "route", identifier: "/approvals",           contextId: "boardroom" },
  { kind: "route", identifier: "/simulation-engine",   contextId: "boardroom" },
  { kind: "route", identifier: "/scenario-lab",        contextId: "boardroom" },
  { kind: "route", identifier: "/life-simulator",      contextId: "boardroom" },
  { kind: "route", identifier: "/time-machine",        contextId: "boardroom" },
  { kind: "route", identifier: "/digital-twins",       contextId: "boardroom" },
  { kind: "route", identifier: "/outcomes",            contextId: "boardroom" },
  { kind: "route", identifier: "/proof",               contextId: "proof-trust" },
  { kind: "route", identifier: "/trust",               contextId: "proof-trust" },
  // Mission Control
  { kind: "route", identifier: "/home",                contextId: "mission-control" },
  { kind: "route", identifier: "/mission-control",     contextId: "mission-control" },
  { kind: "route", identifier: "/daily-pulse",         contextId: "mission-control" },
  { kind: "route", identifier: "/pulse",               contextId: "mission-control" },
  { kind: "route", identifier: "/personal-brain",      contextId: "mission-control" },
  { kind: "route", identifier: "/intelligence",        contextId: "mission-control" },
  { kind: "route", identifier: "/agent-activity",      contextId: "mission-control" },
  { kind: "route", identifier: "/ai-workforce",        contextId: "mission-control" },
  { kind: "route", identifier: "/automation",          contextId: "mission-control" },
  { kind: "route", identifier: "/workflows",           contextId: "mission-control" },
  { kind: "route", identifier: "/memory",              contextId: "mission-control" },
  { kind: "route", identifier: "/achievements",        contextId: "mission-control" },
  { kind: "route", identifier: "/activity",            contextId: "mission-control" },
  { kind: "route", identifier: "/my-activity",         contextId: "mission-control" },
  { kind: "route", identifier: "/command-history",     contextId: "mission-control" },
  { kind: "route", identifier: "/personalization",     contextId: "mission-control" },
  // Setup / Identity (only routes actually declared on disk)
  { kind: "route", identifier: "/settings",            contextId: "setup-identity" },
  { kind: "route", identifier: "/first-boot",          contextId: "setup-identity" },
  { kind: "route", identifier: "/profile",             contextId: "setup-identity" },
  { kind: "route", identifier: "/recovery",            contextId: "setup-identity" },
  // Cloud Control Plane
  { kind: "route", identifier: "/storage",             contextId: "cloud-control-plane" },
  { kind: "route", identifier: "/import-export",       contextId: "cloud-control-plane" },
  { kind: "route", identifier: "/sovereign-export",    contextId: "cloud-control-plane" },
  { kind: "route", identifier: "/environment-switcher",contextId: "cloud-control-plane" },
  { kind: "route", identifier: "/network",             contextId: "cloud-control-plane" },
  { kind: "route", identifier: "/update-center",       contextId: "cloud-control-plane" },
  // Integrations
  { kind: "route", identifier: "/app-store",           contextId: "integrations" },
  // Files / Runtime Kernel
  { kind: "route", identifier: "/files",               contextId: "runtime-kernel" },
  { kind: "route", identifier: "/apps",                contextId: "runtime-kernel" },
  { kind: "route", identifier: "/desktop",             contextId: "runtime-kernel" },
  { kind: "route", identifier: "/system",              contextId: "runtime-kernel" },
  { kind: "route", identifier: "/search",              contextId: "runtime-kernel" },
  { kind: "route", identifier: "/notes",               contextId: "runtime-kernel" },
  { kind: "route", identifier: "/editor",              contextId: "runtime-kernel" },
  { kind: "route", identifier: "/clipboard-history",   contextId: "runtime-kernel" },
  { kind: "route", identifier: "/downloads",           contextId: "runtime-kernel" },
  { kind: "route", identifier: "/print-scan",          contextId: "runtime-kernel" },
  { kind: "route", identifier: "/media",               contextId: "runtime-kernel" },
  { kind: "route", identifier: "/display-modes",       contextId: "runtime-kernel" },
  { kind: "route", identifier: "/planning-canvas",     contextId: "runtime-kernel" },
  { kind: "route", identifier: "/templates",           contextId: "runtime-kernel" },
  { kind: "route", identifier: "/workspace",           contextId: "runtime-kernel" },
  // Admin
  { kind: "route", identifier: "/admin",               contextId: "admin" },
  { kind: "route", identifier: "/owner",               contextId: "admin" },
  { kind: "route", identifier: "/owner-mode",          contextId: "admin" },
  // Mobile
  { kind: "route", identifier: "/mobile",              contextId: "mobile" },
];

/**
 * Resolve a route path to its owning bounded context.
 */
export function resolveRouteContext(routePath: string): BoundedContextId | undefined {
  // Find longest matching prefix
  const matches = ROUTE_CONTEXT_BINDINGS
    .filter((b) => routePath.startsWith(b.identifier))
    .sort((a, b) => b.identifier.length - a.identifier.length);
  return matches[0]?.contextId;
}

/**
 * Resolve an edge function name to its owning bounded context (from registry).
 */
export function resolveEdgeFunctionContext(fnName: string): BoundedContextId | undefined {
  return BOUNDED_CONTEXT_REGISTRY.find((c) => c.edgeFunctions.includes(fnName))?.contextId;
}

/**
 * Resolve a service id to its owning bounded context (from registry).
 */
export function resolveServiceContext(serviceId: string): BoundedContextId | undefined {
  return BOUNDED_CONTEXT_REGISTRY.find((c) => c.services.includes(serviceId))?.contextId;
}

/**
 * Resolve a table name to its owning bounded context (from registry).
 */
export function resolveTableContext(table: string): BoundedContextId | undefined {
  return BOUNDED_CONTEXT_REGISTRY.find((c) => c.tables.includes(table))?.contextId;
}

/**
 * Find duplicates: any artifact assigned to >1 context.
 */
export function findDuplicateMemberships(): { kind: MembershipKind; identifier: string; contextIds: BoundedContextId[] }[] {
  const out: { kind: MembershipKind; identifier: string; contextIds: BoundedContextId[] }[] = [];
  const groups = new Map<string, BoundedContextId[]>();
  for (const c of BOUNDED_CONTEXT_REGISTRY) {
    for (const fn of c.edgeFunctions) {
      const k = `edge-function:${fn}`;
      groups.set(k, [...(groups.get(k) ?? []), c.contextId]);
    }
    for (const s of c.services) {
      const k = `service:${s}`;
      groups.set(k, [...(groups.get(k) ?? []), c.contextId]);
    }
    for (const t of c.tables) {
      const k = `table:${t}`;
      groups.set(k, [...(groups.get(k) ?? []), c.contextId]);
    }
  }
  for (const [k, ctxs] of groups.entries()) {
    if (ctxs.length > 1) {
      const [kind, ...rest] = k.split(":");
      out.push({ kind: kind as MembershipKind, identifier: rest.join(":"), contextIds: ctxs });
    }
  }
  return out;
}

export function membershipStats(): {
  routesBound: number;
  edgeFunctions: number;
  services: number;
  tables: number;
  duplicates: number;
} {
  let ef = 0, sv = 0, tb = 0;
  for (const c of BOUNDED_CONTEXT_REGISTRY) {
    ef += c.edgeFunctions.length;
    sv += c.services.length;
    tb += c.tables.length;
  }
  return {
    routesBound: ROUTE_CONTEXT_BINDINGS.length,
    edgeFunctions: ef,
    services: sv,
    tables: tb,
    duplicates: findDuplicateMemberships().length,
  };
}
