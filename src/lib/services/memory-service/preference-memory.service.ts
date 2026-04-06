import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
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


// ── Persistence ──────────────────────────────────────────
const _serviceId = "memory-service/preference-memory";

function _serializeState(): Record<string, unknown> {
  return {
    preferences: Array.from(preferences.entries()),
  };
}

function _hydrateState(state: Record<string, unknown>): void {
  if (!state) return;
  if (state.preferences) { preferences.clear(); (state.preferences as any[]).forEach(([k, v]: any) => preferences.set(k, v)); }
}

export async function loadPersistedState(): Promise<void> {
  const state = await loadServiceState(_serviceId);
  if (state) _hydrateState(state as Record<string, unknown>);
}

export function persistState(): void {
  debouncedSaveServiceState(_serviceId, _serializeState());
}