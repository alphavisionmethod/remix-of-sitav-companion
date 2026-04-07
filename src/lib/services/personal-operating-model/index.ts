// SITA OS — Personal Operating Model (merge: owner-control-room)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface OperatingModel { userId: string; priorities: string[]; routines: Routine[]; goals: ModelGoal[]; energyPattern: string; preferredWorkHours: { start: string; end: string }; }
export interface Routine { id: string; name: string; frequency: string; time: string; active: boolean; }
export interface ModelGoal { id: string; title: string; domain: string; progress: number; deadline?: string; }
export class PersonalOperatingModelService {
  private models: Map<string, OperatingModel> = new Map();
  setModel(model: OperatingModel): void { this.models.set(model.userId, model); }
  getModel(userId: string): OperatingModel | undefined { return this.models.get(userId); }
  updatePriorities(userId: string, priorities: string[]): void { const m = this.models.get(userId); if (m) m.priorities = priorities; }
  addRoutine(userId: string, routine: Routine): void { const m = this.models.get(userId); if (m) m.routines.push(routine); }
  updateGoalProgress(userId: string, goalId: string, progress: number): void { const m = this.models.get(userId); if (m) { const g = m.goals.find(x => x.id === goalId); if (g) g.progress = progress; } }
  getActiveRoutines(userId: string): Routine[] { return this.models.get(userId)?.routines.filter(r => r.active) ?? []; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("personal-operating-model", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      models: Array.from(this.models.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.models) this.models = new Map(state.models as Iterable<[string, never]>) as typeof this.models;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("personal-operating-model");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createPersonalOperatingModel = () => new PersonalOperatingModelService();
