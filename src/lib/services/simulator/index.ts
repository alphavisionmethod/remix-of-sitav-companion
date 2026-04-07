// SITA OS — Simulator (merge: workflow-engine)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface SimulationRun { id: string; scenario: string; inputs: Record<string, unknown>; outputs: Record<string, unknown>; duration: number; status: 'running' | 'completed' | 'failed'; startedAt: string; }
export class SimulatorService {
  private runs: SimulationRun[] = [];
  private counter = 0;
  run(scenario: string, inputs: Record<string, unknown>): SimulationRun { const r: SimulationRun = { id: `sim-${++this.counter}`, scenario, inputs, outputs: {}, duration: 0, status: 'running', startedAt: new Date().toISOString() }; this.runs.push(r); return r; }
  complete(id: string, outputs: Record<string, unknown>, duration: number): void { const r = this.runs.find(x => x.id === id); if (r) { r.outputs = outputs; r.duration = duration; r.status = 'completed'; } }
  fail(id: string): void { const r = this.runs.find(x => x.id === id); if (r) r.status = 'failed'; }
  getRun(id: string): SimulationRun | undefined { return this.runs.find(r => r.id === id); }
  listRuns(): SimulationRun[] { return [...this.runs]; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("simulator", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      runs: this.runs,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.runs) this.runs = state.runs as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("simulator");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createSimulator = () => new SimulatorService();
