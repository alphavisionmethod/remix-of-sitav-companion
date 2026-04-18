// ═══════════════════════════════════════════════════════════════
// SITA OS — Granular Admin RBAC Engine
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

export interface AdminPermission {
  roleKey: string;
  permission: string;
  description: string;
  granted: boolean;
}

export const PERMISSION_CATEGORIES = {
  users: ["users.view", "users.suspend", "users.delete"],
  devices: ["devices.view", "devices.revoke", "devices.force_reauth"],
  storage: ["storage.view", "storage.repair", "storage.quota"],
  sync: ["sync.view", "sync.repair"],
  policy: ["policy.view", "policy.edit"],
  flags: ["flags.view", "flags.rollout"],
  audit: ["audit.view", "audit.export"],
  support: ["support.view", "support.grant", "support.repair"],
  maintenance: ["maintenance.view", "maintenance.run", "maintenance.emergency"],
} as const;

export type PermissionCategory = keyof typeof PERMISSION_CATEGORIES;

// Cache per user
const permissionCache = new Map<string, { permissions: string[]; ts: number }>();
const CACHE_TTL = 60_000; // 1 min

export const adminRbacEngine = {
  /** Check if a user has a specific granular permission */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const cached = permissionCache.get(userId);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return cached.permissions.includes(permission);
    }
    // Use security definer function
    const { data } = await (supabase as any).rpc("has_admin_permission", {
      _user_id: userId,
      _permission: permission,
    });
    return !!data;
  },

  /** Get all permissions for a user */
  async getPermissions(userId: string): Promise<AdminPermission[]> {
    const cached = permissionCache.get(userId);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return cached.permissions.map((p) => ({
        roleKey: "",
        permission: p,
        description: "",
        granted: true,
      }));
    }

    // Get user's admin role keys
    const { data: assignments } = await fromTable("cloud_admin_role_assignments")
      .select("cloud_admin_roles(role_key)")
      .eq("user_id", userId);

    if (!assignments?.length) return [];

    const roleKeys = assignments.map((a: any) => a.cloud_admin_roles?.role_key).filter(Boolean);

    const { data: perms } = await fromTable("admin_role_permissions")
      .select("*")
      .in("role_key", roleKeys)
      .eq("granted", true);

    const permissions = (perms || []).map((p: any) => ({
      roleKey: p.role_key,
      permission: p.permission,
      description: p.description,
      granted: p.granted,
    }));

    // Update cache
    permissionCache.set(userId, {
      permissions: permissions.map((p: AdminPermission) => p.permission),
      ts: Date.now(),
    });

    return permissions;
  },

  /** Throw if user lacks permission */
  async requirePermission(userId: string, permission: string): Promise<void> {
    const has = await this.hasPermission(userId, permission);
    if (!has) {
      throw new Error(`Missing admin permission: ${permission}`);
    }
  },

  /** Get all permissions for a specific role */
  async getRolePermissions(roleKey: string): Promise<AdminPermission[]> {
    const { data } = await fromTable("admin_role_permissions")
      .select("*")
      .eq("role_key", roleKey)
      .eq("granted", true);

    return (data || []).map((p: any) => ({
      roleKey: p.role_key,
      permission: p.permission,
      description: p.description,
      granted: p.granted,
    }));
  },

  /** Log an admin action to the audit trail */
  async auditAction(params: {
    actorUserId: string;
    action: string;
    targetType?: string;
    targetId?: string;
    plane?: string;
    justification?: string;
    severity?: string;
    metadata?: Record<string, unknown>;
  }) {
    await fromTable("admin_action_audit").insert({
      actor_user_id: params.actorUserId,
      action: params.action,
      target_type: params.targetType,
      target_id: params.targetId,
      plane: params.plane || "control",
      justification: params.justification,
      severity: params.severity || "info",
      metadata: params.metadata || {},
    });
  },

  clearCache(userId?: string) {
    if (userId) permissionCache.delete(userId);
    else permissionCache.clear();
  },
};
