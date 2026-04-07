// SITA OS — Mnemosyne (merge: memory-service) — Long-term memory consolidation
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface ConsolidatedMemory { id: string; key: string; value: unknown; source: string; consolidatedAt: string; accessCount: number; lastAccessedAt: string; importance: number; }
export class MnemosyneService {
  private memories: Map<string, ConsolidatedMemory> = new Map();
  private counter = 0;
  consolidate(key: string, value: unknown, source: string, importance: number = 0.5): ConsolidatedMemory { const m: ConsolidatedMemory = { id: `mem-${++this.counter}`, key, value, source, consolidatedAt: new Date().toISOString(), accessCount: 0, lastAccessedAt: new Date().toISOString(), importance }; this.memories.set(key, m); return m; }
  recall(key: string): ConsolidatedMemory | undefined { const m = this.memories.get(key); if (m) { m.accessCount++; m.lastAccessedAt = new Date().toISOString(); } return m; }
  forget(key: string): boolean { return this.memories.delete(key); }
  search(query: string): ConsolidatedMemory[] { const q = query.toLowerCase(); return [...this.memories.values()].filter(m => m.key.toLowerCase().includes(q)); }
  prune(minImportance: number = 0.2): number { let pruned = 0; this.memories.forEach((m, k) => { if (m.importance < minImportance && m.accessCount < 3) { this.memories.delete(k); pruned++; } }); return pruned; }
  getAll(): ConsolidatedMemory[] { return [...this.memories.values()]; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("mnemosyne", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      memories: Array.from(this.memories.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.memories) this.memories = new Map(state.memories as [string, unknown][]);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("mnemosyne");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createMnemosyne = () => new MnemosyneService();

// ── Context Assembler (God-Tier Mnemosyne expansion) ──────────
export { ContextAssembler, contextAssembler } from "./context-assembler";
export type { AssembledContext, ContextSource, ScopingDecision } from "./context-assembler";
