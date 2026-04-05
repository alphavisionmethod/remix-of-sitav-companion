// SITA OS — Role Permission Engine
export interface RoleDefinition { id: string; name: string; permissions: string[]; inherits?: string[]; }
export class RolePermissionEngineService {
  private roles: Map<string, RoleDefinition> = new Map();
  private userRoles: Map<string, string[]> = new Map();
  defineRole(role: RoleDefinition): void { this.roles.set(role.id, role); }
  assignRole(userId: string, roleId: string): void { if (!this.userRoles.has(userId)) this.userRoles.set(userId, []); const roles = this.userRoles.get(userId)!; if (!roles.includes(roleId)) roles.push(roleId); }
  revokeRole(userId: string, roleId: string): void { const roles = this.userRoles.get(userId); if (roles) { const i = roles.indexOf(roleId); if (i >= 0) roles.splice(i, 1); } }
  hasPermission(userId: string, permission: string): boolean { const roles = this.userRoles.get(userId) ?? []; return roles.some(rId => { const r = this.roles.get(rId); return r?.permissions.includes(permission) || r?.permissions.includes('*'); }); }
  getUserPermissions(userId: string): string[] { const roles = this.userRoles.get(userId) ?? []; const perms = new Set<string>(); roles.forEach(rId => { const r = this.roles.get(rId); r?.permissions.forEach(p => perms.add(p)); }); return [...perms]; }
  getUserRoles(userId: string): string[] { return [...(this.userRoles.get(userId) ?? [])]; }
  listRoles(): RoleDefinition[] { return [...this.roles.values()]; }
}
export const createRolePermissionEngine = () => new RolePermissionEngineService();
