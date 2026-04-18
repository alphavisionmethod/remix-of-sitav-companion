// ═══════════════════════════════════════════════════════════════
// Hook: useBoardroomFollowthrough
// Real-time subscription on a Boardroom item's follow-through chain.
// Returns dispatch + outcome + reflection + timeline summary.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  DispatchRow,
  FollowthroughState,
} from "@/lib/services/boardroom/followthrough-engine";

export interface FollowthroughChainView {
  itemId: string;
  state: FollowthroughState;
  dispatch: DispatchRow | null;
  outcome: {
    id: string;
    outcome_status: string;
    actual_outcome: string;
    confidence: number;
    verification_source: string;
    created_at: string;
  } | null;
  reflection: {
    id: string;
    advisor_id: string;
    owner_action: string;
    lesson_learned: string | null;
    created_at: string;
  } | null;
  lastEventAt: string | null;
  failureReason: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useBoardroomFollowthrough(itemId: string | null): FollowthroughChainView {
  const [state, setState] = useState<FollowthroughState>("none");
  const [dispatch, setDispatch] = useState<DispatchRow | null>(null);
  const [outcome, setOutcome] = useState<FollowthroughChainView["outcome"]>(null);
  const [reflection, setReflection] = useState<FollowthroughChainView["reflection"]>(null);
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!itemId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: item } = await supabase
      .from("boardroom_items")
      .select(
        "followthrough_state, dispatch_id, last_followthrough_event_at, followthrough_failure_reason, reflection_id",
      )
      .eq("id", itemId)
      .maybeSingle();

    setState((item?.followthrough_state as FollowthroughState) ?? "none");
    setLastEventAt(item?.last_followthrough_event_at ?? null);
    setFailureReason(item?.followthrough_failure_reason ?? null);

    if (item?.dispatch_id) {
      const { data: d } = await supabase
        .from("boardroom_followthrough_dispatches")
        .select("*")
        .eq("id", item.dispatch_id)
        .maybeSingle();
      setDispatch((d as DispatchRow | null) ?? null);

      if (d?.id) {
        const { data: o } = await supabase
          .from("boardroom_outcome_records")
          .select("id, outcome_status, actual_outcome, confidence, verification_source, created_at")
          .eq("dispatch_id", d.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        setOutcome(o ?? null);
      }
    } else {
      setDispatch(null);
      setOutcome(null);
    }

    if (item?.reflection_id) {
      const { data: r } = await supabase
        .from("advisor_board_reflections")
        .select("id, advisor_id, owner_action, lesson_learned, created_at")
        .eq("id", item.reflection_id)
        .maybeSingle();
      setReflection(r ?? null);
    } else {
      setReflection(null);
    }
    setLoading(false);
  }, [itemId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!itemId) return;
    const channel = supabase
      .channel(`brd-followthrough-${itemId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "boardroom_items",
          filter: `id=eq.${itemId}`,
        },
        () => void load(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "boardroom_followthrough_dispatches",
          filter: `boardroom_item_id=eq.${itemId}`,
        },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [itemId, load]);

  return {
    itemId: itemId ?? "",
    state,
    dispatch,
    outcome,
    reflection,
    lastEventAt,
    failureReason,
    loading,
    refresh: load,
  };
}
