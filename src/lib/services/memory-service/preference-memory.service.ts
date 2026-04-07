// ═══════════════════════════════════════════════════════════════
// SITA OS — Preference Memory Service
// UI and behavioral preferences
// ═══════════════════════════════════════════════════════════════

export interface UserPreference {
  key: string;
  value: unknown;
  category: "notification" | "display" | "workflow" | "privacy" | "ai";
  updatedAt: string;
}

const preferences = new Map<string, UserPreference>();

const DEFAULTS: UserPreference[] = [
  { key: "notifications.email", value: true, category: "notification", updatedAt: new Date().toISOString() },
  { key: "notifications.push", value: true, category: "notification", updatedAt: new Date().toISOString() },
  { key: "notifications.sms", value: false, category: "notification", updatedAt: new Date().toISOString() },
  { key: "display.theme", value: "dark", category: "display", updatedAt: new Date().toISOString() },
  { key: "display.density", value: "comfortable", category: "display", updatedAt: new Date().toISOString() },
  { key: "ai.autonomyLevel", value: "L2-recommend", category: "ai", updatedAt: new Date().toISOString() },
  { key: "ai.showConfidence", value: true, category: "ai", updatedAt: new Date().toISOString() },
  { key: "privacy.shareAnalytics", value: false, category: "privacy", updatedAt: new Date().toISOString() },
];

DEFAULTS.forEach((p) => preferences.set(p.key, p));

export function getPreference(key: string): unknown {
  return preferences.get(key)?.value;
}

export function setPreference(key: string, value: unknown, category: UserPreference["category"]): UserPreference {
  const pref: UserPreference = { key, value, category, updatedAt: new Date().toISOString() };
  preferences.set(key, pref);
  return pref;
}

export function listPreferences(category?: UserPreference["category"]): UserPreference[] {
  const all = Array.from(preferences.values());
  return category ? all.filter((p) => p.category === category) : all;
}

export function resetToDefaults(): void {
  preferences.clear();
  DEFAULTS.forEach((p) => preferences.set(p.key, { ...p, updatedAt: new Date().toISOString() }));
}

export function exportPreferences(): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  preferences.forEach((p) => { result[p.key] = p.value; });
  return result;
}

