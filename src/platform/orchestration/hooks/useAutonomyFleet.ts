// ═══════════════════════════════════════════════════════════════
// SITA OS — useAutonomyFleet (Phase 9 admin)
// Live snapshot of every advisor's controller state, queued
// actions, and breaker status. Powers the Mission Control panel.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FleetAdvisor = {
  advisorId: string;
  currentState: string;
  circuitOpenUntil: string | null;
  cooldownUntil: string | null;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastStateChangeAt: string;
  metadata: Record<string, unknown>;
  queuedCount: number;
  awaitingApprovalCount: number;
};

export type FleetTotals = {
  totalAdvisors: number;
  inIdle: number;
  inFlight: number;
  awaitingApproval: number;
  circuitOpen: number;
  totalQueued: number;
};

export function useAutonomyFleet() {
  const [advisors, setAdvisors] = useState<FleetAdvisor[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setAdvisors([]);
      setLoading(false);
      return;
    }
    const [{ data: states }, { data: queue }] = await Promise.all([
      supabase
        .from("advisor_autonomy_state")
        .select(
          "advisor_id, current_state, circuit_open_until, cooldown_until, consecutive_failures, consecutive_successes, last_state_change_at, metadata",
        )
        .eq("user_id", userId),
      supabase
        .from("advisor_action_queue")
        .select("advisor_id, status")
        .eq("user_id", userId)
        .in("status", ["awaiting_approval", "approved", "executing"]),
    ]);

    const queueByAdvisor = new Map<string, { queued: number; awaiting: number }>();
    for (const row of queue ?? []) {
      const cur = queueByAdvisor.get(row.advisor_id) ?? { queued: 0, awaiting: 0 };
      cur.queued += 1;
      if (row.status === "awaiting_approval") cur.awaiting += 1;
      queueByAdvisor.set(row.advisor_id, cur);
    }

    const fleet: FleetAdvisor[] = (states ?? []).map((s) => {
      const counts = queueByAdvisor.get(s.advisor_id) ?? { queued: 0, awaiting: 0 };
      return {
        advisorId: s.advisor_id,
        currentState: s.current_state,
        circuitOpenUntil: s.circuit_open_until,
        cooldownUntil: s.cooldown_until,
        consecutiveFailures: s.consecutive_failures,
        consecutiveSuccesses: s.consecutive_successes,
        lastStateChangeAt: s.last_state_change_at,
        metadata: (s.metadata ?? {}) as Record<string, unknown>,
        queuedCount: counts.queued,
        awaitingApprovalCount: counts.awaiting,
      };
    });
    setAdvisors(fleet);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const ch = supabase
      .channel("autonomy-fleet-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "advisor_autonomy_state" },
        () => void load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "advisor_action_queue" },
        () => void load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [load]);

  const totals: FleetTotals = {
    totalAdvisors: advisors.length,
    inIdle: advisors.filter((a) => a.currentState === "idle").length,
    inFlight: advisors.filter((a) =>
      ["observing", "proposing", "dry_run", "executing"].includes(a.currentState),
    ).length,
    awaitingApproval: advisors.filter((a) => a.currentState === "awaiting_approval").length,
    circuitOpen: advisors.filter((a) => a.currentState === "circuit_open").length,
    totalQueued: advisors.reduce((sum, a) => sum + a.queuedCount, 0),
  };

  return { advisors, totals, loading, reload: load };
}

/** Manually reset a tripped breaker (admin only). */
export async function resetCircuitBreaker(advisorId: string) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("not_authenticated");
  await supabase
    .from("advisor_autonomy_state")
    .update({
      current_state: "idle",
      circuit_open_until: null,
      cooldown_until: null,
      consecutive_failures: 0,
      last_state_change_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("advisor_id", advisorId);
}