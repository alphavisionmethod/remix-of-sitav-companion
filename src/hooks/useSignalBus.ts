// ═══════════════════════════════════════════════════════════════
// SITA OS — useSignalBus (Phase 1)
// React hook for the OS-state sensor bus: live feed, emit, ack.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  emitSignal,
  ensureDefaultSubscriptions,
  fetchSignalsForAdvisor,
  markSignalActedOn,
  subscribeToSignals,
  type EmitSignalInput,
  type OSStateSignal,
} from "@/lib/autonomy/signal-bus";

export type UseSignalBusOptions = {
  /** Autoload most recent signals on mount. Default true. */
  autoload?: boolean;
  /** Limit on initial load. Default 50. */
  limit?: number;
  /** Live realtime subscription. Default true. */
  live?: boolean;
};

export function useSignalBus(opts: UseSignalBusOptions = {}) {
  const { autoload = true, limit = 50, live = true } = opts;
  const [signals, setSignals] = useState<OSStateSignal[]>([]);
  const [loading, setLoading] = useState<boolean>(autoload);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setSignals([]);
      setLoading(false);
      return;
    }
    const { data, error: e } = await supabase
      .from("os_state_signals")
      .select("*")
      .eq("user_id", userId)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(limit);
    if (e) setError(e.message);
    setSignals((data as OSStateSignal[]) ?? []);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    if (autoload) void reload();
  }, [autoload, reload]);

  useEffect(() => {
    if (!live) return;
    const unsub = subscribeToSignals((sig) => {
      setSignals((prev) => [sig, ...prev].slice(0, limit));
    });
    return unsub;
  }, [live, limit]);

  const emit = useCallback((input: EmitSignalInput) => emitSignal(input), []);
  const acknowledge = useCallback(
    async (signalId: string, advisorId: string) => {
      await markSignalActedOn(signalId, advisorId);
      setSignals((prev) =>
        prev.map((s) =>
          s.id === signalId
            ? { ...s, acted_on: true, acted_on_by_advisor_id: advisorId }
            : s,
        ),
      );
    },
    [],
  );

  return {
    signals,
    unactedSignals: signals.filter((s) => !s.acted_on),
    loading,
    error,
    emit,
    acknowledge,
    reload,
    fetchForAdvisor: fetchSignalsForAdvisor,
    ensureDefaults: ensureDefaultSubscriptions,
  };
}