// SITA OS — Proof Orchestrator (merge: support-diagnostics)
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
}
export const createProofOrchestrator = () => new ProofOrchestratorService();
