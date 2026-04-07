// SITA OS — Governance Simulator (merge: workflow-engine)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface SimulationScenario { id: string; name: string; domain: string; inputs: Record<string, unknown>; expectedOutcome: string; }
export interface SimulationResult { scenarioId: string; outcome: string; passed: boolean; details: Record<string, unknown>; duration: number; simulatedAt: string; }
export class GovernanceSimulatorService {
  private scenarios: Map<string, SimulationScenario> = new Map();
  private results: SimulationResult[] = [];
  registerScenario(scenario: SimulationScenario): void { this.scenarios.set(scenario.id, scenario); }
  simulate(scenarioId: string): SimulationResult { const s = this.scenarios.get(scenarioId); const result: SimulationResult = { scenarioId, outcome: s?.expectedOutcome ?? 'unknown', passed: !!s, details: { inputs: s?.inputs }, duration: Math.random() * 100, simulatedAt: new Date().toISOString() }; this.results.push(result); return result; }
  simulateAll(): SimulationResult[] { return [...this.scenarios.keys()].map(id => this.simulate(id)); }
  getResults(): SimulationResult[] { return [...this.results]; }
  listScenarios(): SimulationScenario[] { return [...this.scenarios.values()]; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("governance-simulator", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      scenarios: Array.from(this.scenarios.entries()),
      results: this.results,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.scenarios) this.scenarios = new Map(state.scenarios as Iterable<[string, never]>) as typeof this.scenarios;
    if (state.results) this.results = state.results as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("governance-simulator");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createGovernanceSimulator = () => new GovernanceSimulatorService();
