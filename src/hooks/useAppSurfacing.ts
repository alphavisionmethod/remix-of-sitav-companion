// ═══════════════════════════════════════════════════════════════
// Calm UI Engine — Adaptive App Surfacing
// Tracks app launch frequency; returns apps sorted by usage
// Enhanced: recent flow tracking, contextual suggestions
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "calm-engine-app-usage";

interface AppUsageEntry {
  appId: string;
  count: number;
  lastLaunched: number;
}

// Domain affinity mapping — which apps belong to which context
const DOMAIN_AFFINITY: Record<string, string[]> = {
  business: ["sita-business-center", "sita-crm", "sita-email", "chrome", "slack", "notion", "code-editor", "calendar"],
  finance: ["sita-money-center", "sita-vault", "calculator", "sita-daily-pulse"],
  concierge: ["sita-concierge", "maps-app", "calendar", "weather", "notes"],
  system: ["finder", "settings", "terminal", "system-monitor", "dev-tools", "kernel-dashboard"],
};

// Recent flow — ordered list of last N app launches
const FLOW_KEY = "calm-engine-recent-flow";
const MAX_FLOW_LENGTH = 12;

interface FlowEntry {
  appId: string;
  timestamp: number;
}

function loadFlow(): FlowEntry[] {
  try {
    const raw = localStorage.getItem(FLOW_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFlow(flow: FlowEntry[]): void {
  try {
    localStorage.setItem(FLOW_KEY, JSON.stringify(flow));
  } catch { /* noop */ }
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

export type DockContext = "business" | "finance" | "concierge" | "system" | "general";

export function useAppSurfacing() {
  const [usage, setUsage] = useState<Record<string, AppUsageEntry>>(loadUsage);
  const [flow, setFlow] = useState<FlowEntry[]>(loadFlow);

  // Persist on change
  useEffect(() => {
    saveUsage(usage);
  }, [usage]);

  useEffect(() => {
    saveFlow(flow);
  }, [flow]);

  const recordLaunch = useCallback((appId: string) => {
    const now = Date.now();
    setUsage(prev => {
      const entry = prev[appId] || { appId, count: 0, lastLaunched: 0 };
      return {
        ...prev,
        [appId]: {
          ...entry,
          count: entry.count + 1,
          lastLaunched: now,
        },
      };
    });
    // Track in flow
    setFlow(prev => {
      const updated = [{ appId, timestamp: now }, ...prev.filter(f => f.appId !== appId)];
      return updated.slice(0, MAX_FLOW_LENGTH);
    });
  }, []);

  /** Returns app IDs sorted by frequency (most used first) */
  const getSortedApps = useCallback((appIds: string[]): string[] => {
    return [...appIds].sort((a, b) => {
      const ua = usage[a]?.count ?? 0;
      const ub = usage[b]?.count ?? 0;
      if (ub !== ua) return ub - ua;
      return (usage[b]?.lastLaunched ?? 0) - (usage[a]?.lastLaunched ?? 0);
    });
  }, [usage]);

  const getTopApps = useCallback((n: number = 5): AppUsageEntry[] => {
    return Object.values(usage)
      .sort((a, b) => b.count - a.count)
      .slice(0, n);
  }, [usage]);

  /** Returns last N app launches in chronological order (most recent first) */
  const getRecentFlow = useCallback((n: number = 4): FlowEntry[] => {
    return flow.slice(0, n);
  }, [flow]);

  /** Returns contextual app suggestions based on current domain + usage patterns */
  const getContextualSuggestions = useCallback((context: DockContext, excludeIds: Set<string>, maxResults: number = 3): string[] => {
    // Get apps with affinity to current context
    const affinityApps = DOMAIN_AFFINITY[context] ?? [];
    
    // Score each app: frequency * recency * context affinity
    const now = Date.now();
    const scored: { appId: string; score: number }[] = [];
    
    for (const [appId, entry] of Object.entries(usage)) {
      if (excludeIds.has(appId)) continue;
      
      const frequencyScore = Math.log2(entry.count + 1);
      const recencyHours = (now - entry.lastLaunched) / (1000 * 60 * 60);
      const recencyScore = Math.max(0, 1 - recencyHours / 168); // decay over 7 days
      const affinityBonus = affinityApps.includes(appId) ? 2.0 : 0.5;
      
      // Time-of-day bonus: if app was often used at this hour
      const hourBonus = 1.0; // simplified — could track per-hour usage
      
      scored.push({
        appId,
        score: frequencyScore * recencyScore * affinityBonus * hourBonus,
      });
    }
    
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(s => s.appId);
  }, [usage]);

  return { recordLaunch, getSortedApps, getTopApps, getRecentFlow, getContextualSuggestions, usage, flow };
}
