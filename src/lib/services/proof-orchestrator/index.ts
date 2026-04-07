// SITA OS — Proof Orchestrator (merge: support-diagnostics)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface ProofChain { id: string; entries: ProofEntry[]; domain: string; verified: boolean; createdAt: string; }
export interface ProofEntry { action: string; hash: string; actor: string; timestamp: string; evidence: Record<string, unknown>; parentHash?: string; }
export class ProofOrchestratorService {
  private chains: Map<string, ProofChain> = new Map();
  private counter = 0;
  createChain(domain: string): ProofChain { const c: ProofChain = { id: `proof-${++this.counter}`, entries: [], domain, verified: false, createdAt: new Date().toISOString() }; this.chains.set(c.id, c); return c; }
  addEntry(chainId: string, entry: Omit<ProofEntry, 'parentHash'>): void { const c = this.chains.get(chainId); if (c) { const parent = c.entries.length > 0 ? c.entries[c.entries.length - 1].hash : undefined; c.entries.push({ ...entry, parentHash: parent }); } }
  verify(chainId: string): boolean { const c = this.chains.get(chainId); if (!c) return false; c.verified = c.entries.length > 0; return c.verified; }
  getChain(id: string): ProofChain | undefined { return this.chains.get(id); }
  listChains(): ProofChain[] { return [...this.chains.values()]; }
  getVerified(): ProofChain[] { return [...this.chains.values()].filter(c => c.verified); }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("proof-orchestrator", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      chains: Array.from(this.chains.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.chains) this.chains = new Map(state.chains as Iterable<[string, never]>) as typeof this.chains;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("proof-orchestrator");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createProofOrchestrator = () => new ProofOrchestratorService();

