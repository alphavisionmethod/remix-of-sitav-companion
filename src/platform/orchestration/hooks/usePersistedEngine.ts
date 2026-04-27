// ═══════════════════════════════════════════════════════════════
// SITA OS — Persistence-Aware Engine Hooks
// React hooks that connect in-memory engines to Supabase persistence
// ═══════════════════════════════════════════════════════════════

import { useEffect, useCallback, useRef } from "react";
import {
  persistEngineState,
  debouncedPersistEngineState,
  loadEngineState,
  appendEngineEvent,
  fetchEngineEvents,
} from "@/data/persistence/engine-persistence-adapter";

// ── Generic hook: persist any serializable engine state ─────────
export function usePersistedEngine(
  engineName: string,
  getState: () => Record<string, unknown>,
  setState: (state: Record<string, unknown>) => void,
  opts?: { autoSaveIntervalMs?: number; enabled?: boolean },
) {
  const loaded = useRef(false);
  const enabled = opts?.enabled !== false;

  // Load on mount
  useEffect(() => {
    if (!enabled || loaded.current) return;
    loaded.current = true;

    loadEngineState(engineName).then((persisted) => {
      if (persisted) {
        setState(persisted as Record<string, unknown>);
        console.debug(`[persistence] Loaded ${engineName} from DB`);
      }
    }).catch(console.error);
  }, [engineName, setState, enabled]);

  // Auto-save on interval
  useEffect(() => {
    if (!enabled) return;
    const interval = opts?.autoSaveIntervalMs ?? 30_000;
    const timer = setInterval(() => {
      debouncedPersistEngineState(engineName, getState());
    }, interval);
    return () => clearInterval(timer);
  }, [engineName, getState, enabled, opts?.autoSaveIntervalMs]);

  // Manual save
  const save = useCallback(() => {
    if (!enabled) return Promise.resolve(false);
    return persistEngineState(engineName, getState());
  }, [engineName, getState, enabled]);

  // Log event
  const logEvent = useCallback(
    (eventType: string, eventData: Record<string, unknown> = {}) => {
      if (!enabled) return Promise.resolve(false);
      return appendEngineEvent(engineName, eventType, eventData);
    },
    [engineName, enabled],
  );

  return { save, logEvent };
}

// ── Hook for EventBus persistence ───────────────────────────────
export function useEventBusPersistence(
  eventBus: { getRecentEvents?: () => Array<Record<string, unknown>>; getDeadLetters?: () => Array<Record<string, unknown>> } | null,
  enabled: boolean = true,
) {
  useEffect(() => {
    if (!enabled || !eventBus) return;
    const interval = setInterval(() => {
      const recent = eventBus.getRecentEvents?.() ?? [];
      if (recent.length > 0) {
        debouncedPersistEngineState("event-bus", {
          recentEvents: recent.slice(-100),
          deadLetters: eventBus.getDeadLetters?.() ?? [],
        });
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [eventBus, enabled]);
}

// ── Hook for fetching engine event history ──────────────────────
export function useEngineEventHistory(
  engineName: string,
  opts?: { eventType?: string; limit?: number },
) {
  const fetchHistory = useCallback(
    () => fetchEngineEvents(engineName, opts),
    [engineName, opts?.eventType, opts?.limit],
  );
  return { fetchHistory };
}
