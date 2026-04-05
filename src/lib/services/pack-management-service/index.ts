// SITA OS — Pack Management Service (merge: enterprise-control-plane)
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
}
export const createPackManagement = () => new PackManagementService();
