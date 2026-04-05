// SITA OS — Household Org Graph
export interface HouseholdNode { id: string; name: string; role: string; relationships: { targetId: string; type: string }[]; }
export class HouseholdOrgGraphService {
  private nodes: Map<string, HouseholdNode> = new Map();
  addMember(node: HouseholdNode): void { this.nodes.set(node.id, node); }
  getMember(id: string): HouseholdNode | undefined { return this.nodes.get(id); }
  listMembers(): HouseholdNode[] { return [...this.nodes.values()]; }
  addRelationship(fromId: string, toId: string, type: string): void { const n = this.nodes.get(fromId); if (n) n.relationships.push({ targetId: toId, type }); }
  getRelationships(id: string): { targetId: string; type: string }[] { return this.nodes.get(id)?.relationships ?? []; }
  getByRole(role: string): HouseholdNode[] { return [...this.nodes.values()].filter(n => n.role === role); }
}
export const createHouseholdOrgGraph = () => new HouseholdOrgGraphService();
