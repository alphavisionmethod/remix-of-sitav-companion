// ═══════════════════════════════════════════════════════════════
// Calm UI Engine — Adaptive App Surfacing
// Tracks app launch frequency; returns apps sorted by usage
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "calm-engine-app-usage";

interface AppUsageEntry {
  appId: string;
  count: number;
  lastLaunched: number;
}

function loadUsage(): Record<string, AppUsageEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUsage(data: Record<string, AppUsageEntry>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* noop */ }
}

export function useAppSurfacing() {
  const [usage, setUsage] = useState<Record<string, AppUsageEntry>>(loadUsage);

  // Persist on change
  useEffect(() => {
    saveUsage(usage);
  }, [usage]);

  const recordLaunch = useCallback((appId: string) => {
    setUsage(prev => {
      const entry = prev[appId] || { appId, count: 0, lastLaunched: 0 };
      return {
        ...prev,
        [appId]: {
          ...entry,
          count: entry.count + 1,
          lastLaunched: Date.now(),
        },
      };
    });
  }, []);

  /** Returns app IDs sorted by frequency (most used first) */
  const getSortedApps = useCallback((appIds: string[]): string[] => {
    return [...appIds].sort((a, b) => {
      const ua = usage[a]?.count ?? 0;
      const ub = usage[b]?.count ?? 0;
      if (ub !== ua) return ub - ua;
      // Tiebreak by recency
      return (usage[b]?.lastLaunched ?? 0) - (usage[a]?.lastLaunched ?? 0);
    });
  }, [usage]);

  const getTopApps = useCallback((n: number = 5): AppUsageEntry[] => {
    return Object.values(usage)
      .sort((a, b) => b.count - a.count)
      .slice(0, n);
  }, [usage]);

  return { recordLaunch, getSortedApps, getTopApps, usage };
}
