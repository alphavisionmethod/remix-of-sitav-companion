// SITA OS — Pack Management Service (merge: enterprise-control-plane)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface VerticalPack { id: string; name: string; domain: string; version: string; modules: string[]; schemas: string[]; active: boolean; installedAt?: string; }
export class PackManagementService {
  private packs: Map<string, VerticalPack> = new Map();
  install(pack: VerticalPack): void { this.packs.set(pack.id, { ...pack, installedAt: new Date().toISOString(), active: true }); }
  uninstall(id: string): boolean { return this.packs.delete(id); }
  activate(id: string): void { const p = this.packs.get(id); if (p) p.active = true; }
  deactivate(id: string): void { const p = this.packs.get(id); if (p) p.active = false; }
  getPack(id: string): VerticalPack | undefined { return this.packs.get(id); }
  listPacks(): VerticalPack[] { return [...this.packs.values()]; }
  getActive(): VerticalPack[] { return [...this.packs.values()].filter(p => p.active); }
  getByDomain(domain: string): VerticalPack[] { return [...this.packs.values()].filter(p => p.domain === domain); }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("pack-management-service", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      packs: Array.from(this.packs.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.packs) this.packs = new Map(state.packs as Iterable<[string, never]>) as typeof this.packs;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("pack-management-service");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createPackManagement = () => new PackManagementService();
