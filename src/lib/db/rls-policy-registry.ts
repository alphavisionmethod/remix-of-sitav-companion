// ═══════════════════════════════════════════════════════════════
// SITA OS — RLS Policy Registry
// Documents RLS policy patterns per table
// ═══════════════════════════════════════════════════════════════

export type RlsPattern =
  | "user_id_match"        // auth.uid() = user_id
  | "owner_id_match"       // auth.uid() = owner_id
  | "actor_user_id_match"  // auth.uid() = actor_user_id
  | "org_membership"       // is_org_member(auth.uid(), org_id)
  | "tenant_membership"    // is_tenant_member(auth.uid(), tenant_id)
  | "admin_role"           // has_role(auth.uid(), 'admin')
  | "admin_permission"     // has_admin_permission(auth.uid(), permission)
  | "public_read"          // Public SELECT, authenticated write
  | "authenticated_all"    // Any authenticated user
  | "read_only"            // SELECT only, no mutations
  | "append_only"          // INSERT + SELECT, no UPDATE/DELETE
  | "service_role_only";   // Service role access only

export interface RlsPolicyEntry {
  readonly pattern: RlsPattern;
  readonly selectPolicy: boolean;
  readonly insertPolicy: boolean;
  readonly updatePolicy: boolean;
  readonly deletePolicy: boolean;
}

export const RLS_POLICY_REGISTRY: Record<string, RlsPolicyEntry> = {
  profiles: { pattern: "public_read", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: false },
  user_roles: { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true },
  capabilities: { pattern: "read_only", selectPolicy: true, insertPolicy: false, updatePolicy: false, deletePolicy: false },
  audit_logs: { pattern: "append_only", selectPolicy: true, insertPolicy: true, updatePolicy: false, deletePolicy: false },
  tenant_firewall_logs: { pattern: "append_only", selectPolicy: true, insertPolicy: true, updatePolicy: false, deletePolicy: false },
  admin_action_audit: { pattern: "actor_user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: false, deletePolicy: false },
  admin_action_confirmations: { pattern: "actor_user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: false },
  organizations: { pattern: "owner_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true },
  cloud_tenants: { pattern: "owner_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: false },
  api_gateway_routes: { pattern: "authenticated_all", selectPolicy: true, insertPolicy: false, updatePolicy: false, deletePolicy: false },
  admin_role_permissions: { pattern: "authenticated_all", selectPolicy: true, insertPolicy: false, updatePolicy: false, deletePolicy: false },
  admin_safety_actions: { pattern: "authenticated_all", selectPolicy: true, insertPolicy: false, updatePolicy: false, deletePolicy: false },
  cloud_admin_roles: { pattern: "authenticated_all", selectPolicy: true, insertPolicy: false, updatePolicy: false, deletePolicy: false },
} as const;

const DEFAULT_USER_ID_POLICY: RlsPolicyEntry = {
  pattern: "user_id_match",
  selectPolicy: true,
  insertPolicy: true,
  updatePolicy: true,
  deletePolicy: true,
};

export function getRlsPolicyForTable(name: string): RlsPolicyEntry {
  return RLS_POLICY_REGISTRY[name] ?? DEFAULT_USER_ID_POLICY;
}

export function getTablesByRlsPattern(pattern: RlsPattern): string[] {
  return Object.entries(RLS_POLICY_REGISTRY)
    .filter(([, entry]) => entry.pattern === pattern)
    .map(([name]) => name);
}

export function getAppendOnlyTables(): string[] {
  return getTablesByRlsPattern("append_only");
}

export function getReadOnlyTables(): string[] {
  return getTablesByRlsPattern("read_only");
}
