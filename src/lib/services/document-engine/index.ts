// SITA OS — Document Engine
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface ManagedDocument { id: string; title: string; type: string; status: 'draft' | 'review' | 'approved' | 'archived'; content: string; version: number; createdAt: string; updatedAt: string; ownerId: string; tags: string[]; }
export class DocumentEngineService {
  private docs: Map<string, ManagedDocument> = new Map();
  private counter = 0;
  create(doc: Omit<ManagedDocument, 'id' | 'createdAt' | 'updatedAt' | 'version'>): ManagedDocument { const d: ManagedDocument = { ...doc, id: `doc-${++this.counter}`, version: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; this.docs.set(d.id, d); return d; }
  get(id: string): ManagedDocument | undefined { return this.docs.get(id); }
  update(id: string, updates: Partial<ManagedDocument>): ManagedDocument | undefined { const d = this.docs.get(id); if (!d) return; Object.assign(d, updates, { updatedAt: new Date().toISOString(), version: d.version + 1 }); return d; }
  search(query: string): ManagedDocument[] { const q = query.toLowerCase(); return [...this.docs.values()].filter(d => d.title.toLowerCase().includes(q) || d.tags.some(t => t.toLowerCase().includes(q))); }
  listByStatus(status: string): ManagedDocument[] { return [...this.docs.values()].filter(d => d.status === status); }
  archive(id: string): boolean { const d = this.docs.get(id); if (d) { d.status = 'archived'; d.updatedAt = new Date().toISOString(); return true; } return false; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("document-engine", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      docs: Array.from(this.docs.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.docs) this.docs = new Map(state.docs as [string, unknown][]);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("document-engine");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createDocumentEngine = () => new DocumentEngineService();
