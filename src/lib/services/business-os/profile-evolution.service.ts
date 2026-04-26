// ═══════════════════════════════════════════════════════════════
// SITA OS — Profile Evolution Persistence Service
// Owns the localStorage side effects for profile evolution data.
// Keeps `src/domains/engines/profile-evolution-engine.ts` pure.
// ═══════════════════════════════════════════════════════════════

import type {
  EvolutionSnapshot,
  EvolutionInsight,
} from "@/domains/engines/profile-evolution-engine";

const EVOLUTION_KEY = "sita-profile-evolution";
const INSIGHTS_KEY = "sita-evolution-insights";
const MAX_SNAPSHOTS = 30;

const isBrowser = (): boolean =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export function saveEvolutionSnapshot(snapshot: EvolutionSnapshot): void {
  if (!isBrowser()) return;
  try {
    const existing = loadEvolutionHistory();
    existing.push(snapshot);
    const trimmed = existing.slice(-MAX_SNAPSHOTS);
    window.localStorage.setItem(EVOLUTION_KEY, JSON.stringify(trimmed));
  } catch {
    /* storage full or unavailable */
  }
}

export function loadEvolutionHistory(): EvolutionSnapshot[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(EVOLUTION_KEY);
    return raw ? (JSON.parse(raw) as EvolutionSnapshot[]) : [];
  } catch {
    return [];
  }
}

export function saveEvolutionInsights(insights: EvolutionInsight[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(INSIGHTS_KEY, JSON.stringify(insights));
  } catch {
    /* fail silently */
  }
}

export function loadEvolutionInsights(): EvolutionInsight[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(INSIGHTS_KEY);
    return raw ? (JSON.parse(raw) as EvolutionInsight[]) : [];
  } catch {
    return [];
  }
}

export function dismissInsight(insightId: string): void {
  const insights = loadEvolutionInsights();
  const updated = insights.map((i) =>
    i.id === insightId ? { ...i, dismissed: true } : i,
  );
  saveEvolutionInsights(updated);
}
