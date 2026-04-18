// ═══════════════════════════════════════════════════════════════
// SITA OS — Engine Events Data Hooks
// Hooks for dashboards that pull from engine_events table
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { fetchEngineEvents, loadEngineState } from "@/data/persistence/engine-persistence-adapter";

export interface EngineEventRow {
  id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

/**
 * Generic hook to load engine events for a given engine.
 * Falls back to empty array if no data.
 */
export function useEngineEvents(engineName: string, opts?: { eventType?: string; limit?: number }) {
  const [events, setEvents] = useState<EngineEventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await fetchEngineEvents(engineName, opts);
    setEvents(data);
    setLoading(false);
  }, [engineName, opts?.eventType, opts?.limit]);

  useEffect(() => { reload(); }, [reload]);

  return { events, loading, reload };
}

/**
 * Generic hook to load persisted engine state snapshot.
 */
export function useEngineState<T = Record<string, unknown>>(engineName: string) {
  const [state, setState] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await loadEngineState<T>(engineName);
    setState(data);
    setLoading(false);
  }, [engineName]);

  useEffect(() => { reload(); }, [reload]);

  return { state, loading, reload };
}
