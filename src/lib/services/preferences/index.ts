// SITA OS — Preferences Service (merge: owner-control-room)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export class PreferencesService {
  private store: Map<string, Record<string, unknown>> = new Map();
  get(userId: string, key: string): unknown { return this.store.get(userId)?.[key]; }
  set(userId: string, key: string, value: unknown): void { if (!this.store.has(userId)) this.store.set(userId, {}); this.store.get(userId)![key] = value; }
  getAll(userId: string): Record<string, unknown> { return { ...(this.store.get(userId) ?? {}) }; }
  delete(userId: string, key: string): void { const s = this.store.get(userId); if (s) delete s[key]; }
  reset(userId: string): void { this.store.delete(userId); }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("preferences", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      store: Array.from(this.store.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.store) this.store = new Map(state.store as Iterable<[string, never]>) as typeof this.store;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("preferences");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createPreferences = () => new PreferencesService();
