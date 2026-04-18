// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Runtime Contract
// Operability surface contract: what the admin SPA can actually do.
// ═══════════════════════════════════════════════════════════════

export type AdminCapability =
  | "view-audit"
  | "manage-users"
  | "rotate-secrets"
  | "trigger-kill-switch"
  | "approve-action"
  | "execute-runbook"
  | "view-receipts"
  | "manage-flags"
  | "manage-roles"
  | "emergency-maintenance"
  | "verify-architecture";

export interface AdminCapabilityEntry {
  readonly capability: AdminCapability;
  readonly permission: string; // matches admin_role_permissions
  readonly mfaRequired: boolean;
  readonly auditEmitted: boolean;
  readonly artifact: string;
}

export const ADMIN_RUNTIME_CAPABILITIES: readonly AdminCapabilityEntry[] = [
  { capability: "view-audit", permission: "audit.view", mfaRequired: false, auditEmitted: true, artifact: "src/components/auth/PermissionGatedRoute.tsx" },
  { capability: "manage-users", permission: "users.view", mfaRequired: true, auditEmitted: true, artifact: "src/pages/admin/UserManagement.tsx" },
  { capability: "rotate-secrets", permission: "maintenance.emergency", mfaRequired: true, auditEmitted: true, artifact: "src/pages/admin/SEC01SessionSecrets.tsx" },
  { capability: "trigger-kill-switch", permission: "maintenance.emergency", mfaRequired: true, auditEmitted: true, artifact: "src/lib/control-plane/kill-switch-types.ts" },
  { capability: "approve-action", permission: "support.grant", mfaRequired: true, auditEmitted: true, artifact: "src/pages/admin/HQApprovalQueue.tsx" },
  { capability: "execute-runbook", permission: "support.grant", mfaRequired: true, auditEmitted: true, artifact: "src/lib/support/runbook-types.ts" },
  { capability: "view-receipts", permission: "audit.view", mfaRequired: false, auditEmitted: true, artifact: "src/pages/admin/AIG05ReceiptsExplorer.tsx" },
  { capability: "manage-flags", permission: "flags.rollout", mfaRequired: true, auditEmitted: true, artifact: "src/pages/admin/AIT03TaskInvocation.tsx" },
  { capability: "manage-roles", permission: "users.view", mfaRequired: true, auditEmitted: true, artifact: "src/pages/admin/UserManagement.tsx" },
  { capability: "emergency-maintenance", permission: "maintenance.emergency", mfaRequired: true, auditEmitted: true, artifact: "src/pages/admin/SystemManagement.tsx" },
  { capability: "verify-architecture", permission: "audit.view", mfaRequired: false, auditEmitted: false, artifact: "src/pages/admin/META01ArchitectureAtlas.tsx" },
];

export function getAdminCapability(cap: AdminCapability): AdminCapabilityEntry | undefined {
  return ADMIN_RUNTIME_CAPABILITIES.find((c) => c.capability === cap);
}
