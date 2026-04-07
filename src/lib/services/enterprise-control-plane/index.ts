// SITA OS — Enterprise Control Plane
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
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

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("enterprise-control-plane", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      tenants: Array.from(this.tenants.entries()),
      packs: Array.from(this.packs.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.tenants) this.tenants = new Map(state.tenants as [string, unknown][]);
    if (state.packs) this.packs = new Map(state.packs as [string, unknown][]);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("enterprise-control-plane");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createEnterpriseControlPlane = () => new EnterpriseControlPlaneService();
