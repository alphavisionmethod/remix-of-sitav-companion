// SITA OS — Operating Autopilot (merge: workflow-engine)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface AutopilotRule { id: string; trigger: string; action: string; conditions: Record<string, unknown>; active: boolean; executionCount: number; }
export class OperatingAutopilotService {
  private rules: Map<string, AutopilotRule> = new Map();
  addRule(rule: AutopilotRule): void { this.rules.set(rule.id, rule); }
  evaluate(trigger: string): AutopilotRule[] { return [...this.rules.values()].filter(r => r.active && r.trigger === trigger); }
  execute(ruleId: string): boolean { const r = this.rules.get(ruleId); if (r) { r.executionCount++; return true; } return false; }
  toggleRule(id: string, active: boolean): void { const r = this.rules.get(id); if (r) r.active = active; }
  listRules(): AutopilotRule[] { return [...this.rules.values()]; }
  getStats(): { total: number; active: number; totalExecutions: number } { const all = [...this.rules.values()]; return { total: all.length, active: all.filter(r => r.active).length, totalExecutions: all.reduce((s, r) => s + r.executionCount, 0) }; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("operating-autopilot", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      rules: Array.from(this.rules.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.rules) this.rules = new Map(state.rules as [string, unknown][]);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("operating-autopilot");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createOperatingAutopilot = () => new OperatingAutopilotService();
