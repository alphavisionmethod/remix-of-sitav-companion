// SITA OS — Enterprise Control Plane
export interface TenantConfig { id: string; name: string; tier: string; limits: Record<string, number>; features: string[]; createdAt: string; }
export interface VerticalPack { id: string; name: string; domain: string; modules: string[]; active: boolean; }
export class EnterpriseControlPlaneService {
  private tenants: Map<string, TenantConfig> = new Map();
  private packs: Map<string, VerticalPack> = new Map();
  registerTenant(config: TenantConfig): void { this.tenants.set(config.id, config); }
  getTenant(id: string): TenantConfig | undefined { return this.tenants.get(id); }
  listTenants(): TenantConfig[] { return [...this.tenants.values()]; }
  registerPack(pack: VerticalPack): void { this.packs.set(pack.id, pack); }
  activatePack(tenantId: string, packId: string): boolean { const p = this.packs.get(packId); if (p) { p.active = true; return true; } return false; }
  listPacks(): VerticalPack[] { return [...this.packs.values()]; }
  getActivePacks(): VerticalPack[] { return [...this.packs.values()].filter(p => p.active); }
  checkLimit(tenantId: string, metric: string): { within: boolean; limit: number } { const t = this.tenants.get(tenantId); const limit = t?.limits[metric] ?? Infinity; return { within: true, limit }; }
}
export const createEnterpriseControlPlane = () => new EnterpriseControlPlaneService();
