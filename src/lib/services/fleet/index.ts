// SITA OS — Fleet Service (target parent: fleet-health-consolidation)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface FleetNode { id: string; name: string; type: string; status: 'online' | 'offline' | 'degraded'; version: string; lastHeartbeat: string; metrics: Record<string, number>; }
export class FleetService {
  private nodes: Map<string, FleetNode> = new Map();
  register(node: FleetNode): void { this.nodes.set(node.id, node); }
  heartbeat(id: string, metrics?: Record<string, number>): void { const n = this.nodes.get(id); if (n) { n.lastHeartbeat = new Date().toISOString(); n.status = 'online'; if (metrics) n.metrics = { ...n.metrics, ...metrics }; } }
  getNode(id: string): FleetNode | undefined { return this.nodes.get(id); }
  listNodes(): FleetNode[] { return [...this.nodes.values()]; }
  getOnline(): FleetNode[] { return [...this.nodes.values()].filter(n => n.status === 'online'); }
  getDegraded(): FleetNode[] { return [...this.nodes.values()].filter(n => n.status === 'degraded'); }
  markOffline(id: string): void { const n = this.nodes.get(id); if (n) n.status = 'offline'; }
  getHealth(): { total: number; online: number; degraded: number; offline: number } { const all = [...this.nodes.values()]; return { total: all.length, online: all.filter(n => n.status === 'online').length, degraded: all.filter(n => n.status === 'degraded').length, offline: all.filter(n => n.status === 'offline').length }; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("fleet", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      nodes: Array.from(this.nodes.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.nodes) this.nodes = new Map(state.nodes as Iterable<[string, never]>) as typeof this.nodes;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("fleet");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createFleet = () => new FleetService();

