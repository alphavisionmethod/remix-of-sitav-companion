// ═══════════════════════════════════════════════════════════════
// SITA OS — useUnifiedTimeline (Phase J)
// ═══════════════════════════════════════════════════════════════
// One chronological feed across:
//   - sita_episodes              (intent sessions, last 7d)
//   - sita_perception_events     (last 24h, opt-in only)
//   - advisor_board_actions      (executed advisor actions)
//   - sita_journal_entries       (nightly reflections)
// Pure read-fusion of existing tables.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { JarvisTimelineItem } from "./types";

const TIMELINE_LIMIT = 50;

function fromEpisode(row: Record<string, unknown>): JarvisTimelineItem {
  const ended = row.ended_at ? String(row.ended_at) : null;
  const surface = row.primary_surface ? String(row.primary_surface) : "session";
  return {
    key: `sita_episodes:${row.id}`,
    source: "sita_episodes",
    id: String(row.id),
    title: String(row.intent_summary ?? `${surface} session`),
    summary: ended
      ? `Closed at ${new Date(ended).toLocaleTimeString()} · ${row.signals_count ?? 0} signals`
      : `Open · ${row.signals_count ?? 0} signals`,
    ts: String(row.started_at ?? row.created_at ?? new Date().toISOString()),
    icon: "episode",
    raw: row,
  };
}

function fromPerception(row: Record<string, unknown>): JarvisTimelineItem {
  return {
    key: `sita_perception_events:${row.id}`,
    source: "sita_perception_events",
    id: String(row.id),
    title: String(row.kind ?? "Perception event"),
    summary: typeof row.note === "string" ? row.note : "Captured signal",
    ts: String(row.created_at ?? new Date().toISOString()),
    icon: "perception",
    raw: row,
  };
}

function fromAction(row: Record<string, unknown>): JarvisTimelineItem {
  const status = String(row.status ?? "executed");
  return {
    key: `advisor_board_actions:${row.id}`,
    source: "advisor_board_actions",
    id: String(row.id),
    title: String(row.title ?? row.action_type ?? "Advisor action"),
    summary: `${status} · ${row.advisor_id ?? "advisor"}`,
    ts: String(row.executed_at ?? row.created_at ?? new Date().toISOString()),
    icon: status === "executed" ? "receipt" : "action",
    raw: row,
  };
}

function fromJournal(row: Record<string, unknown>): JarvisTimelineItem {
  return {
    key: `sita_journal_entries:${row.id}`,
    source: "sita_journal_entries",
    id: String(row.id),
    title: String(row.kind ?? "Reflection"),
    summary: String(row.summary ?? ""),
    ts: String(row.created_at ?? new Date().toISOString()),
    icon: "journal",
    raw: row,
  };
}

export function useUnifiedTimeline() {
  const { user } = useAuth();
  const [items, setItems] = useState<JarvisTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
      const oneDayAgo = new Date(Date.now() - 86400_000).toISOString();

      // Run in parallel; tolerate individual failures (some tables may be empty / RLS-empty).
      const [epRes, percRes, actRes, jrnRes] = await Promise.allSettled([
        supabase.from("sita_episodes" as never)
          .select("*").eq("user_id", user.id)
          .gte("started_at", sevenDaysAgo)
          .order("started_at", { ascending: false }).limit(TIMELINE_LIMIT),
        supabase.from("sita_perception_events" as never)
          .select("*").eq("user_id", user.id)
          .gte("created_at", oneDayAgo)
          .order("created_at", { ascending: false }).limit(TIMELINE_LIMIT),
        supabase.from("advisor_board_actions" as never)
          .select("*").eq("user_id", user.id)
          .order("created_at", { ascending: false }).limit(TIMELINE_LIMIT),
        supabase.from("sita_journal_entries" as never)
          .select("*").eq("user_id", user.id)
          .order("created_at", { ascending: false }).limit(TIMELINE_LIMIT),
      ]);

      const pickRows = (r: PromiseSettledResult<{ data: unknown }>): Array<Record<string, unknown>> => {
        if (r.status !== "fulfilled") return [];
        const data = (r.value?.data as Array<Record<string, unknown>> | null) ?? [];
        return data;
      };

      const merged: JarvisTimelineItem[] = [
        ...pickRows(epRes).map(fromEpisode),
        ...pickRows(percRes).map(fromPerception),
        ...pickRows(actRes).map(fromAction),
        ...pickRows(jrnRes).map(fromJournal),
      ];

      const seen = new Set<string>();
      const deduped: JarvisTimelineItem[] = [];
      for (const it of merged) {
        if (seen.has(it.key)) continue;
        seen.add(it.key);
        deduped.push(it);
      }
      deduped.sort((a, b) => b.ts.localeCompare(a.ts));
      setItems(deduped.slice(0, TIMELINE_LIMIT));
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { void refresh(); }, [refresh]);

  return { items, loading, error, refresh };
}

export const __testables = { fromEpisode, fromPerception, fromAction, fromJournal };