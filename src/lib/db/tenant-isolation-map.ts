// ═══════════════════════════════════════════════════════════════
// SITA OS — Tenant Isolation Map
// Extends TENANCY_BOUNDARY_MAP with isolation proof metadata
// ═══════════════════════════════════════════════════════════════

import { TENANCY_BOUNDARY_MAP } from "./tenancy-boundary-map";
import { RLS_POLICY_REGISTRY } from "./rls-policy-registry";

export type IsolationMechanism = "rls-user-id" | "rls-org-id" | "rls-tenant-id" | "rls-admin" | "rls-service-role" | "global-no-tenant";
export type ActorClass = "end-user" | "admin" | "service-role" | "system";

export interface TenantIsolationEntry {
  readonly table: string;
  readonly isolationMechanism: IsolationMechanism;
  readonly policyMechanism: string;
  readonly actorClasses: readonly ActorClass[];
  readonly supportOverridePath: string | null;
  readonly evidenceSource: string;
  readonly verified: boolean;
}

export const TENANT_ISOLATION_REGISTRY: readonly TenantIsolationEntry[] = Object.entries(TENANCY_BOUNDARY_MAP).map(([table, boundary]) => {
  const rls = RLS_POLICY_REGISTRY[table];
  const mechanism: IsolationMechanism =
    boundary.model === "user_id" || boundary.model === "actor_user_id" || boundary.model === "owner_id"
      ? "rls-user-id"
      : boundary.model === "org_id" ? "rls-org-id"
      : boundary.model === "tenant_id" ? "rls-tenant-id"
      : "global-no-tenant";

  const actors: ActorClass[] = ["end-user"];
  if (boundary.adminException) actors.push("admin");
  if (boundary.serviceRoleException) actors.push("service-role");

  return {
    table,
    isolationMechanism: mechanism,
    policyMechanism: rls?.pattern ?? "unknown",
    actorClasses: actors,
    supportOverridePath: boundary.adminException ? "admin-escalation" : null,
    evidenceSource: "tenancy-boundary-map + rls-policy-registry",
    verified: rls !== undefined,
  };
});

export function getIsolationForTable(table: string): TenantIsolationEntry | undefined {
  return TENANT_ISOLATION_REGISTRY.find(e => e.table === table);
}

export function getUnverifiedIsolation(): readonly TenantIsolationEntry[] {
  return TENANT_ISOLATION_REGISTRY.filter(e => !e.verified);
}