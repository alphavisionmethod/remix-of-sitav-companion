// SITA OS — Trust State Service (target parent: trust-evaluation-consolidation)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface TrustScore { entityId: string; entityType: string; score: number; level: 'full' | 'elevated' | 'standard' | 'reduced' | 'untrusted'; factors: TrustFactor[]; computedAt: string; }
export interface TrustFactor { name: string; weight: number; value: number; source: string; }
export class TrustStateService {
  private states: Map<string, TrustScore> = new Map();
  evaluate(entityId: string, entityType: string, factors: TrustFactor[]): TrustScore {
    const weighted = factors.reduce((s, f) => s + f.value * f.weight, 0);
    const totalWeight = factors.reduce((s, f) => s + f.weight, 0);
    const score = totalWeight > 0 ? weighted / totalWeight : 0;
    const level = score >= 0.9 ? 'full' : score >= 0.75 ? 'elevated' : score >= 0.5 ? 'standard' : score >= 0.25 ? 'reduced' : 'untrusted';
    const state: TrustScore = { entityId, entityType, score, level, factors, computedAt: new Date().toISOString() };
    this.states.set(entityId, state);
    return state;
  }
  getState(entityId: string): TrustScore | undefined { return this.states.get(entityId); }
  listStates(): TrustScore[] { return [...this.states.values()]; }
  getByLevel(level: string): TrustScore[] { return [...this.states.values()].filter(s => s.level === level); }
  getUntrusted(): TrustScore[] { return this.getByLevel('untrusted'); }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("trust-state-service", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      states: Array.from(this.states.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.states) this.states = new Map(state.states as [string, unknown][]);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("trust-state-service");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createTrustStateService = () => new TrustStateService();
