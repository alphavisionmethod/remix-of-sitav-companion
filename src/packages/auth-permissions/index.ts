// ═══════════════════════════════════════════════════════════════
// SITA OS — Auth Permissions (Re-export Facade)
// Domain-specific import path for auth permission types.
// Canonical source: @/packages/auth/
// ═══════════════════════════════════════════════════════════════

export type { AuthRole, AuthScope, PermissionGrant, AuthSession, AuthPolicy, DeviceTrust } from "@/packages/auth";
export { hasScope, isOwnerOrAdmin, isPermissionActive, validateSession } from "@/packages/auth";
