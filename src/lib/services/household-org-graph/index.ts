// SITA OS — Household Org Graph
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface HouseholdNode { id: string; name: string; role: string; relationships: { targetId: string; type: string }[]; }
export class HouseholdOrgGraphService {
  private nodes: Map<string, HouseholdNode> = new Map();
  addMember(node: HouseholdNode): void { this.nodes.set(node.id, node); }
  getMember(id: string): HouseholdNode | undefined { return this.nodes.get(id); }
  listMembers(): HouseholdNode[] { return [...this.nodes.values()]; }
  addRelationship(fromId: string, toId: string, type: string): void { const n = this.nodes.get(fromId); if (n) n.relationships.push({ targetId: toId, type }); }
  getRelationships(id: string): { targetId: string; type: string }[] { return this.nodes.get(id)?.relationships ?? []; }
  getByRole(role: string): HouseholdNode[] { return [...this.nodes.values()].filter(n => n.role === role); }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("household-org-graph", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      nodes: Array.from(this.nodes.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.nodes) this.nodes = new Map(state.nodes as [string, unknown][]);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("household-org-graph");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createHouseholdOrgGraph = () => new HouseholdOrgGraphService();
