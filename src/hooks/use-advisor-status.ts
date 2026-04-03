// ═══════════════════════════════════════════════════════════════
// SITA OS — Real-Time Advisor Status Hook
// Simulates WebSocket-style live status updates for advisors
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";

export type AdvisorLiveState = "idle" | "reasoning" | "waiting-data" | "has-recommendation" | "executing" | "observing";

export interface AdvisorStatusEntry {
  advisorId: string;
  state: AdvisorLiveState;
  detail: string;
  since: number;
  pulseCount: number;
}

const STATE_TRANSITIONS: { state: AdvisorLiveState; detail: string; weight: number }[] = [
  { state: "idle", detail: "Monitoring quietly", weight: 15 },
  { state: "observing", detail: "Scanning for changes", weight: 20 },
  { state: "reasoning", detail: "Analyzing patterns", weight: 25 },
  { state: "reasoning", detail: "Evaluating options", weight: 10 },
  { state: "reasoning", detail: "Cross-referencing data", weight: 8 },
  { state: "waiting-data", detail: "Waiting on connector sync", weight: 8 },
  { state: "waiting-data", detail: "Fetching latest records", weight: 5 },
  { state: "has-recommendation", detail: "New insight ready", weight: 6 },
  { state: "has-recommendation", detail: "Action recommended", weight: 3 },
];

function pickWeightedState(): { state: AdvisorLiveState; detail: string } {
  const totalWeight = STATE_TRANSITIONS.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * totalWeight;
  for (const t of STATE_TRANSITIONS) {
    r -= t.weight;
    if (r <= 0) return { state: t.state, detail: t.detail };
  }
  return STATE_TRANSITIONS[0];
}

export function useAdvisorStatuses(advisorIds: string[]) {
  const [statuses, setStatuses] = useState<Map<string, AdvisorStatusEntry>>(() => {
    const map = new Map<string, AdvisorStatusEntry>();
    advisorIds.forEach(id => {
      map.set(id, { advisorId: id, state: "observing", detail: "Monitoring quietly", since: Date.now(), pulseCount: 0 });
    });
    return map;
  });

  useEffect(() => {
    // Simulate live updates: every 2-5s, randomly update 1-2 advisors
    const interval = setInterval(() => {
      setStatuses(prev => {
        const next = new Map(prev);
        const count = Math.random() < 0.3 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const id = advisorIds[Math.floor(Math.random() * advisorIds.length)];
          const { state, detail } = pickWeightedState();
          const existing = next.get(id);
          next.set(id, {
            advisorId: id,
            state,
            detail,
            since: Date.now(),
            pulseCount: (existing?.pulseCount || 0) + 1,
          });
        }
        return next;
      });
    }, 2500 + Math.random() * 2500);

    return () => clearInterval(interval);
  }, [advisorIds]);

  return statuses;
}

export const STATE_COLORS: Record<AdvisorLiveState, string> = {
  idle: "bg-muted-foreground",
  observing: "bg-blue-400",
  reasoning: "bg-accent animate-pulse",
  "waiting-data": "bg-amber-400 animate-pulse",
  "has-recommendation": "bg-trust-safe animate-pulse",
  executing: "bg-primary animate-pulse",
};

export const STATE_LABELS: Record<AdvisorLiveState, string> = {
  idle: "Idle",
  observing: "Observing",
  reasoning: "Reasoning",
  "waiting-data": "Waiting on Data",
  "has-recommendation": "Has Recommendation",
  executing: "Executing",
};
