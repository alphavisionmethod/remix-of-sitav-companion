// ═══════════════════════════════════════════════════════════════
// SITA OS — useBoardroomKernel (Phase 7)
// Fetches the recent inputs the kernel needs (queue, reflections,
// breakers) and returns the synthesized themes. Realtime: refetches
// when the underlying tables change.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  synthesizeBoardroomThemes,
  type BoardroomTheme,
  type KernelInputQueueItem,
  type KernelInputReflection,
  type KernelInputBreaker,
} from "@/lib/autonomy/boardroom-kernel";

const QUEUE_WINDOW_HOURS = 48;
const REFLECTION_WINDOW_HOURS = 72;

type State = {
  themes: BoardroomTheme[];
  loading: boolean;
  error: string | null;
};

export function useBoardroomKernel(): State & { reload: () => void } {
  const [state, setState] = useState<State>({
    themes: [],
    loading: true,
    error: null,
  });

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const queueCutoff = new Date(Date.now() - QUEUE_WINDOW_HOURS * 3600_000).toISOString();
      const reflectionCutoff = new Date(Date.now() - REFLECTION_WINDOW_HOURS * 3600_000).toISOString();

      const [queueRes, reflectionRes, breakerRes] = await Promise.all([
        supabase
          .from("advisor_action_queue")
          .select("id, advisor_id, domain, action_type, summary, confidence, status, created_at, payload")
          .gte("created_at", queueCutoff)
          .order("created_at", { ascending: false })
          .limit(200),
        supabase
          .from("advisor_board_reflections")
          .select("id, advisor_id, outcome_quality, execution_fitness_score, recommendation_quality_score, should_repeat, pattern_tags, owner_action, created_at, lesson_learned")
          .gte("created_at", reflectionCutoff)
          .order("created_at", { ascending: false })
          .limit(200),
        supabase
          .from("advisor_autonomy_state")
          .select("advisor_id, current_state, circuit_open_until, metadata")
          .eq("current_state", "circuit_open"),
      ]);

      const themes = synthesizeBoardroomThemes({
        queueItems: (queueRes.data ?? []) as unknown as KernelInputQueueItem[],
        reflections: (reflectionRes.data ?? []) as unknown as KernelInputReflection[],
        breakers: (breakerRes.data ?? []) as unknown as KernelInputBreaker[],
      });
      setState({ themes, loading: false, error: null });
    } catch (err) {
      setState({
        themes: [],
        loading: false,
        error: err instanceof Error ? err.message : "unknown",
      });
    }
  }, []);

  useEffect(() => {
    void reload();
    const ch = supabase
      .channel("boardroom-kernel")
      .on("postgres_changes", { event: "*", schema: "public", table: "advisor_action_queue" }, () => void reload())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "advisor_board_reflections" }, () => void reload())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "advisor_autonomy_state" }, () => void reload())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [reload]);

  return { ...state, reload };
}