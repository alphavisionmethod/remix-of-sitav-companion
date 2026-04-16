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
  { kind: "route", identifier: "/business",       contextId: "business-os" },
  { kind: "route", identifier: "/money",          contextId: "finance-os" },
  { kind: "route", identifier: "/finance",        contextId: "finance-os" },
  { kind: "route", identifier: "/concierge",      contextId: "concierge-os" },
  { kind: "route", identifier: "/communications", contextId: "concierge-os" },
  { kind: "route", identifier: "/investment",     contextId: "investment-office" },
  { kind: "route", identifier: "/capital",        contextId: "investment-office" },
  { kind: "route", identifier: "/boardroom",      contextId: "boardroom" },
  { kind: "route", identifier: "/files",          contextId: "runtime-kernel" },
  { kind: "route", identifier: "/apps",           contextId: "runtime-kernel" },
  { kind: "route", identifier: "/settings",       contextId: "setup-identity" },
  { kind: "route", identifier: "/auth",           contextId: "setup-identity" },
  { kind: "route", identifier: "/login",          contextId: "setup-identity" },
  { kind: "route", identifier: "/signup",         contextId: "setup-identity" },
  { kind: "route", identifier: "/onboarding",     contextId: "setup-identity" },
  { kind: "route", identifier: "/admin",          contextId: "admin" },
  { kind: "route", identifier: "/m/",             contextId: "mobile" },
  { kind: "route", identifier: "/mobile",         contextId: "mobile" },
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
