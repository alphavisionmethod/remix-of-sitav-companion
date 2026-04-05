// ═══════════════════════════════════════════════════════════════
// SITA OS — Entity Graph Service
// Knowledge graph for entities, relationships, and context
// ═══════════════════════════════════════════════════════════════

export interface GraphEntity { id: string; type: string; name: string; properties: Record<string, unknown>; createdAt: string; updatedAt: string; }
export interface GraphRelation { id: string; fromId: string; toId: string; type: string; weight: number; properties: Record<string, unknown>; createdAt: string; }

export class EntityGraphService {
  private entities: Map<string, GraphEntity> = new Map();
  private relations: GraphRelation[] = [];

  addEntity(entity: Omit<GraphEntity, 'createdAt' | 'updatedAt'>): GraphEntity { const e = { ...entity, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; this.entities.set(e.id, e); return e; }
  getEntity(id: string): GraphEntity | undefined { return this.entities.get(id); }
  findEntities(type?: string, query?: string): GraphEntity[] { let r = [...this.entities.values()]; if (type) r = r.filter(e => e.type === type); if (query) r = r.filter(e => e.name.toLowerCase().includes(query.toLowerCase())); return r; }
  addRelation(rel: Omit<GraphRelation, 'id' | 'createdAt'>): GraphRelation { const r: GraphRelation = { ...rel, id: `rel-${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: new Date().toISOString() }; this.relations.push(r); return r; }
  getRelations(entityId: string): GraphRelation[] { return this.relations.filter(r => r.fromId === entityId || r.toId === entityId); }
  getNeighbors(entityId: string, depth: number = 1): GraphEntity[] {
    const visited = new Set<string>();
    const queue = [entityId];
    for (let d = 0; d < depth; d++) {
      const next: string[] = [];
      for (const id of queue) { visited.add(id); this.getRelations(id).forEach(r => { const n = r.fromId === id ? r.toId : r.fromId; if (!visited.has(n)) next.push(n); }); }
      queue.length = 0; queue.push(...next);
    }
    return [...visited].filter(id => id !== entityId).map(id => this.entities.get(id)!).filter(Boolean);
  }
  getStats() { return { entities: this.entities.size, relations: this.relations.length, types: [...new Set([...this.entities.values()].map(e => e.type))] }; }
}

export const createEntityGraph = () => new EntityGraphService();
