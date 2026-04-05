// SITA OS — Preferences Service (merge: owner-control-room)
export class PreferencesService {
  private store: Map<string, Record<string, unknown>> = new Map();
  get(userId: string, key: string): unknown { return this.store.get(userId)?.[key]; }
  set(userId: string, key: string, value: unknown): void { if (!this.store.has(userId)) this.store.set(userId, {}); this.store.get(userId)![key] = value; }
  getAll(userId: string): Record<string, unknown> { return { ...(this.store.get(userId) ?? {}) }; }
  delete(userId: string, key: string): void { const s = this.store.get(userId); if (s) delete s[key]; }
  reset(userId: string): void { this.store.delete(userId); }
}
export const createPreferences = () => new PreferencesService();
