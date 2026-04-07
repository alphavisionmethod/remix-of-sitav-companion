// ═══════════════════════════════════════════════════════════════
// SITA OS — Role & Permission Engine
// RBAC/ABAC engine for surface-level permission checks
// Canonical contracts: UserRole from _contract-scaffold
// ═══════════════════════════════════════════════════════════════

import type { UserRole as CanonicalUserRole } from "@/packages/contracts";

export type { CanonicalUserRole };

export type PermissionAction = "read" | "write" | "execute" | "approve" | "admin" | "delegate";
export type ResourceDomain = "business" | "finance" | "concierge" | "platform" | "boardroom" | "connectors";

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  inheritsFrom?: string[];
  isSystem: boolean;
}

export interface Permission {
  resource: string;
  domain: ResourceDomain;
  actions: PermissionAction[];
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: "eq" | "neq" | "in" | "gt" | "lt" | "contains";
  value: unknown;
}

export interface PermissionCheck {
  userId: string;
  action: PermissionAction;
  resource: string;
  domain: ResourceDomain;
  context?: Record<string, unknown>;
}

export interface PermissionResult {
  allowed: boolean;
  matchedRole?: string;
  matchedPermission?: Permission;
  reason: string;
  evaluatedAt: number;
}

// ── Role & Permission Engine ────────────────────────────────────

export class RolePermissionEngine {
  private roles = new Map<string, Role>();
  private userRoles = new Map<string, string[]>();
  private auditLog: { check: PermissionCheck; result: PermissionResult }[] = [];

  registerRole(role: Role): void {
    this.roles.set(role.id, role);
  }

  assignRole(userId: string, roleId: string): void {
    const existing = this.userRoles.get(userId) || [];
    if (!existing.includes(roleId)) {
      this.userRoles.set(userId, [...existing, roleId]);
    }
  }

  revokeRole(userId: string, roleId: string): void {
    const existing = this.userRoles.get(userId) || [];
    this.userRoles.set(userId, existing.filter(r => r !== roleId));
  }

  getUserRoles(userId: string): Role[] {
    const roleIds = this.userRoles.get(userId) || [];
    return roleIds.map(id => this.roles.get(id)).filter(Boolean) as Role[];
  }

  checkPermission(check: PermissionCheck): PermissionResult {
    const roles = this.getUserRoles(check.userId);
    const allRoles = this.resolveInheritedRoles(roles);

    for (const role of allRoles) {
      for (const perm of role.permissions) {
        if (perm.domain === check.domain && this.resourceMatches(perm.resource, check.resource) && perm.actions.includes(check.action)) {
          if (this.evaluateConditions(perm.conditions, check.context)) {
            const result: PermissionResult = { allowed: true, matchedRole: role.id, matchedPermission: perm, reason: `Granted by role: ${role.name}`, evaluatedAt: Date.now() };
            this.auditLog.push({ check, result });
            return result;
          }
        }
      }
    }

    const result: PermissionResult = { allowed: false, reason: "No matching permission found", evaluatedAt: Date.now() };
    this.auditLog.push({ check, result });
    return result;
  }

  private resolveInheritedRoles(roles: Role[]): Role[] {
    const resolved = new Map<string, Role>();
    const queue = [...roles];

    while (queue.length > 0) {
      const role = queue.shift()!;
      if (resolved.has(role.id)) continue;
      resolved.set(role.id, role);

      if (role.inheritsFrom) {
        for (const parentId of role.inheritsFrom) {
          const parent = this.roles.get(parentId);
          if (parent && !resolved.has(parentId)) queue.push(parent);
        }
      }
    }

    return Array.from(resolved.values());
  }

  private resourceMatches(pattern: string, resource: string): boolean {
    if (pattern === "*") return true;
    if (pattern === resource) return true;
    if (pattern.endsWith(".*")) return resource.startsWith(pattern.slice(0, -2));
    return false;
  }

  private evaluateConditions(conditions: PermissionCondition[] | undefined, context?: Record<string, unknown>): boolean {
    if (!conditions || conditions.length === 0) return true;
    if (!context) return false;

    return conditions.every(cond => {
      const value = context[cond.field];
      switch (cond.operator) {
        case "eq": return value === cond.value;
        case "neq": return value !== cond.value;
        case "in": return Array.isArray(cond.value) && (cond.value as never[]).includes(value);
        case "gt": return typeof value === "number" && typeof cond.value === "number" && value > cond.value;
        case "lt": return typeof value === "number" && typeof cond.value === "number" && value < cond.value;
        case "contains": return typeof value === "string" && typeof cond.value === "string" && value.includes(cond.value);
        default: return false;
      }
    });
  }

  getAuditLog(): typeof this.auditLog {
    return [...this.auditLog];
  }

  getHealth(): { status: "healthy"; roleCount: number; assignmentCount: number } {
    return { status: "healthy", roleCount: this.roles.size, assignmentCount: this.userRoles.size };
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createRolePermissionEngine(): RolePermissionEngine {
  const engine = new RolePermissionEngine();

  // System roles
  engine.registerRole({
    id: "owner", name: "Owner", description: "Full system access", isSystem: true,
    permissions: [
      { resource: "*", domain: "platform", actions: ["read", "write", "execute", "approve", "admin", "delegate"] },
      { resource: "*", domain: "business", actions: ["read", "write", "execute", "approve", "admin"] },
      { resource: "*", domain: "finance", actions: ["read", "write", "execute", "approve", "admin"] },
      { resource: "*", domain: "concierge", actions: ["read", "write", "execute", "approve"] },
      { resource: "*", domain: "boardroom", actions: ["read", "write", "execute", "approve"] },
      { resource: "*", domain: "connectors", actions: ["read", "write", "execute", "admin"] },
    ],
  });

  engine.registerRole({
    id: "member", name: "Member", description: "Standard household/org member", isSystem: true,
    permissions: [
      { resource: "*", domain: "concierge", actions: ["read", "write", "execute"] },
      { resource: "*", domain: "business", actions: ["read"] },
      { resource: "*", domain: "finance", actions: ["read"] },
    ],
  });

  engine.registerRole({
    id: "viewer", name: "Viewer", description: "Read-only access", isSystem: true,
    permissions: [
      { resource: "*", domain: "business", actions: ["read"] },
      { resource: "*", domain: "finance", actions: ["read"] },
      { resource: "*", domain: "concierge", actions: ["read"] },
    ],
  });

  engine.registerRole({
    id: "finance-officer", name: "Finance Officer", description: "Finance domain management", isSystem: true, inheritsFrom: ["member"],
    permissions: [
      { resource: "*", domain: "finance", actions: ["read", "write", "execute", "approve"] },
    ],
  });

  engine.registerRole({
    id: "advisor", name: "Advisor", description: "Advisory access with limited execution", isSystem: true, inheritsFrom: ["viewer"],
    permissions: [
      { resource: "*", domain: "boardroom", actions: ["read", "write"] },
    ],
  });

  return engine;
}
