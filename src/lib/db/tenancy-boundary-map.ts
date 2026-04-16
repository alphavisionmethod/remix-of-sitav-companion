// ═══════════════════════════════════════════════════════════════
// SITA OS — Tenancy Boundary Map
// Classifies tables by tenancy model
// ═══════════════════════════════════════════════════════════════

export type TenancyModel = "user_id" | "org_id" | "tenant_id" | "owner_id" | "global" | "actor_user_id";

export const TENANCY_BOUNDARY_MAP: Record<string, TenancyModel> = {
  // Global (no user tenancy)
  capabilities: "global",
  admin_role_permissions: "global",
  admin_safety_actions: "global",
  api_gateway_routes: "global",
  cloud_admin_roles: "global",

  // actor_user_id tenancy
  admin_action_audit: "actor_user_id",
  admin_action_confirmations: "actor_user_id",

  // owner_id tenancy
  cloud_tenants: "owner_id",
  organizations: "owner_id",

  // All remaining use user_id — default pattern
} as const;

export function getTenancyForTable(name: string): TenancyModel {
  return TENANCY_BOUNDARY_MAP[name] ?? "user_id";
}

export function getGlobalTables(): string[] {
  return Object.entries(TENANCY_BOUNDARY_MAP)
    .filter(([, model]) => model === "global")
    .map(([name]) => name);
}

export function getTablesByTenancy(model: TenancyModel): string[] {
  return Object.entries(TENANCY_BOUNDARY_MAP)
    .filter(([, m]) => m === model)
    .map(([name]) => name);
}
