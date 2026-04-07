// SITA OS — Search Fabric (merge: connector-control-plane)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface SearchResult { id: string; type: string; title: string; snippet: string; score: number; source: string; url?: string; }
export class SearchFabricService {
  private index: SearchResult[] = [];
  addToIndex(result: SearchResult): void { this.index.push(result); }
  search(query: string, type?: string, limit: number = 20): SearchResult[] {
    const q = query.toLowerCase();
    return this.index.filter(r => (!type || r.type === type) && (r.title.toLowerCase().includes(q) || r.snippet.toLowerCase().includes(q)))
      .sort((a, b) => b.score - a.score).slice(0, limit);
  }
  removeFromIndex(id: string): boolean { const i = this.index.findIndex(r => r.id === id); if (i >= 0) { this.index.splice(i, 1); return true; } return false; }
  getIndexSize(): number { return this.index.length; }
  getTypeBreakdown(): Record<string, number> { return this.index.reduce((a, r) => { a[r.type] = (a[r.type] || 0) + 1; return a; }, {} as Record<string, number>); }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("search-fabric", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      index: this.index,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.index) this.index = state.index as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("search-fabric");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createSearchFabric = () => new SearchFabricService();
