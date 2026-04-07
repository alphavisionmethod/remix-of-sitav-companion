// SITA OS — Constitution Engine (merge: trust-state-service)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface ConstitutionalRule { id: string; name: string; category: string; condition: string; action: 'allow' | 'deny' | 'escalate'; priority: number; active: boolean; }
export class ConstitutionEngineService {
  private rules: ConstitutionalRule[] = [];
  addRule(rule: ConstitutionalRule): void { this.rules.push(rule); this.rules.sort((a, b) => a.priority - b.priority); }
  evaluate(context: Record<string, unknown>): { allowed: boolean; matchedRules: ConstitutionalRule[]; action: string } {
    const matched = this.rules.filter(r => r.active);
    const denied = matched.find(r => r.action === 'deny');
    if (denied) return { allowed: false, matchedRules: [denied], action: 'deny' };
    const escalate = matched.find(r => r.action === 'escalate');
    if (escalate) return { allowed: false, matchedRules: [escalate], action: 'escalate' };
    return { allowed: true, matchedRules: matched.filter(r => r.action === 'allow'), action: 'allow' };
  }
  getRules(): ConstitutionalRule[] { return [...this.rules]; }
  toggleRule(id: string, active: boolean): void { const r = this.rules.find(x => x.id === id); if (r) r.active = active; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("constitution-engine", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      rules: this.rules,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.rules) this.rules = state.rules as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("constitution-engine");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createConstitutionEngine = () => new ConstitutionEngineService();

