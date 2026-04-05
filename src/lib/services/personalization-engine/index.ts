// SITA OS — Personalization Engine (merge: owner-control-room)
export interface UserPreferences { userId: string; theme: string; language: string; timezone: string; notifications: Record<string, boolean>; dashboardLayout: string[]; surfaceOrder: string[]; }
export class PersonalizationEngineService {
  private prefs: Map<string, UserPreferences> = new Map();
  setPreferences(prefs: UserPreferences): void { this.prefs.set(prefs.userId, prefs); }
  getPreferences(userId: string): UserPreferences | undefined { return this.prefs.get(userId); }
  updatePreference(userId: string, key: keyof UserPreferences, value: unknown): void { const p = this.prefs.get(userId); if (p) (p as any)[key] = value; }
  resetToDefaults(userId: string): UserPreferences { const d: UserPreferences = { userId, theme: 'system', language: 'en', timezone: 'UTC', notifications: { email: true, push: true, sms: false }, dashboardLayout: ['pulse', 'actions', 'metrics'], surfaceOrder: ['home', 'business', 'finance', 'concierge'] }; this.prefs.set(userId, d); return d; }
}
export const createPersonalizationEngine = () => new PersonalizationEngineService();
