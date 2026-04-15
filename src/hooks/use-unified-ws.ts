// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified WebSocket React Hooks (Sections 17, 21, 26)
// Provides scoped subscriptions, event streams, connection status,
// and real-time cache invalidation for existing React Query hooks.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import {
  unifiedWsClient,
  type WsConnectionState,
} from "@/lib/services/realtime-gateway/unified-ws-client";
import type {
  WsEventEnvelope,
  WsEventScope,
} from "@/packages/contracts/core/ws-event-envelope";

// ── Start/Stop Bridge ─────────────────────────────────────────

/**
 * Manages the unified WS lifecycle. Mount once in PlatformInit.
 */
export function useUnifiedWsBridge() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      unifiedWsClient.start(user.id);
    } else {
      unifiedWsClient.stop();
    }
    return () => {
      unifiedWsClient.stop();
    };
  }, [user?.id]);
}

// ── Scoped Subscription ──────────────────────────────────────

/**
 * Subscribe to a specific event scope with auto-cleanup.
 */
export function useWsSubscription(
  scope: WsEventScope | "*",
  handler: (event: WsEventEnvelope) => void,
  enabled = true,
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;
    const id = unifiedWsClient.subscribe(scope, (evt) => handlerRef.current(evt));
    return () => unifiedWsClient.unsubscribe(id);
  }, [scope, enabled]);
}

// ── Event Stream Collector ────────────────────────────────────

/**
 * Collects live events matching the given scopes into a state array.
 */
export function useWsEventStream(
  scopes: WsEventScope[] | ["*"] = ["*"],
  maxEvents = 100,
) {
  const [events, setEvents] = useState<WsEventEnvelope[]>([]);

  useEffect(() => {
    const ids: string[] = [];
    for (const scope of scopes) {
      const id = unifiedWsClient.subscribe(scope as WsEventScope, (evt) => {
        setEvents((prev) => [evt, ...prev].slice(0, maxEvents));
      });
      ids.push(id);
    }
    return () => ids.forEach((id) => unifiedWsClient.unsubscribe(id));
  }, [scopes.join(","), maxEvents]);

  const clear = useCallback(() => setEvents([]), []);
  return { events, clear };
}

// ── Connection Status ─────────────────────────────────────────

/**
 * Returns current WS connection state + metrics.
 */
export function useWsConnectionStatus() {
  const [state, setState] = useState<WsConnectionState>(
    unifiedWsClient.getState(),
  );

  useEffect(() => {
    const cleanup = unifiedWsClient.onStateChange(setState);
    setState(unifiedWsClient.getState());
    return cleanup;
  }, []);

  return {
    state,
    isConnected: state === "connected",
    isDegraded: state === "degraded",
    isReconnecting: state === "reconnecting",
    metrics: unifiedWsClient.metrics,
    activeScopes: unifiedWsClient.getActiveScopes(),
  };
}

// ── Real-Time Cache Invalidation ─────────────────────────────

/**
 * Automatically invalidates React Query caches when WS events
 * arrive for matching scopes. Replaces polling with push.
 */
export function useWsCacheInvalidation() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const scopeToKeys: Record<string, string[]> = {
      command: ["os-api-commands", "commands"],
      notification: ["os-api-notifications", "notifications"],
      system: ["os-api-system-status", "os-api-system-health"],
      security: ["os-api-security-posture", "os-api-security-approvals"],
      sync: ["os-api-sync-status", "os-api-sync-conflicts"],
      device: ["os-api-devices"],
      update: ["os-api-update-history"],
      audit: ["os-api-audit-timeline"],
      timeline: ["os-api-unified-timeline"],
    };

    const id = unifiedWsClient.subscribe("*", (evt) => {
      const keys = scopeToKeys[evt.scope];
      if (keys) {
        keys.forEach((key) =>
          queryClient.invalidateQueries({ queryKey: [key] }),
        );
      }
    });

    return () => unifiedWsClient.unsubscribe(id);
  }, [queryClient]);
}

// ── Event Rate Calculator ─────────────────────────────────────

/**
 * Returns events-per-second rate over a sliding window.
 */
export function useWsEventRate(windowMs = 10_000) {
  const [rate, setRate] = useState(0);
  const countRef = useRef(0);

  useEffect(() => {
    const id = unifiedWsClient.subscribe("*", () => {
      countRef.current++;
    });

    const interval = setInterval(() => {
      setRate(countRef.current / (windowMs / 1000));
      countRef.current = 0;
    }, windowMs);

    return () => {
      unifiedWsClient.unsubscribe(id);
      clearInterval(interval);
    };
  }, [windowMs]);

  return rate;
}
