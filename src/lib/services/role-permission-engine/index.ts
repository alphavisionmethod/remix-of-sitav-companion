// SITA OS — Role Permission Engine
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
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

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("role-permission-engine", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      roles: Array.from(this.roles.entries()),
      userRoles: Array.from(this.userRoles.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.roles) this.roles = new Map(state.roles as Iterable<[string, never]>) as typeof this.roles;
    if (state.userRoles) this.userRoles = new Map(state.userRoles as Iterable<[string, never]>) as typeof this.userRoles;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("role-permission-engine");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createRolePermissionEngine = () => new RolePermissionEngineService();

