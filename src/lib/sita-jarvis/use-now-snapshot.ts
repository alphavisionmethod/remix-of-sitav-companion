// ═══════════════════════════════════════════════════════════════
// SITA OS — useNowSnapshot (Phase J)
// ═══════════════════════════════════════════════════════════════
// Single hook that fuses the four most-recent "what matters now"
// signals — world model, active mission, top briefings, last
// reflection journal entries — into one read-only snapshot.
// All sources are existing tables; this is fusion, not new data.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorldModel } from "@/lib/sita-cortex/useWorldModel";
import type { NowBriefing, NowJournalEntry, NowMission, NowSnapshot } from "./types";

const BRIEFING_LIMIT = 3;
const JOURNAL_LIMIT = 5;

async function loadActiveMission(userId: string): Promise<NowMission | null> {
  const { data } = await supabase
    .from("sita_missions" as never)
    .select("id, title, description, domain, priority, target_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("priority", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as unknown as NowMission) ?? null;
}

async function loadBriefings(userId: string): Promise<NowBriefing[]> {
  const nowIso = new Date().toISOString();
  const { data } = await supabase
    .from("sita_proactive_briefings" as never)
    .select("id, kind, headline, body, priority, scheduled_for, evidence")
    .eq("user_id", userId)
    .in("status", ["queued", "delivered"])
    .lte("scheduled_for", nowIso)
    .gt("expires_at", nowIso)
    .order("priority", { ascending: false })
    .order("scheduled_for", { ascending: true })
    .limit(BRIEFING_LIMIT);
  return ((data as unknown as NowBriefing[]) ?? []);
}

async function loadJournal(userId: string): Promise<NowJournalEntry[]> {
  const { data } = await supabase
    .from("sita_journal_entries" as never)
    .select("id, kind, summary, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(JOURNAL_LIMIT);
  return ((data as unknown as NowJournalEntry[]) ?? []);
}

export function useNowSnapshot() {
  const { user } = useAuth();
  const { snapshot: worldModel } = useWorldModel();
  const [snap, setSnap] = useState<NowSnapshot>(() => ({
    loading: true,
    error: null,
    worldModel,
    activeMission: null,
    briefings: [],
    journal: [],
    generatedAt: 0,
  }));

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setSnap((s) => ({ ...s, loading: false }));
      return;
    }
    try {
      setSnap((s) => ({ ...s, loading: true, error: null }));
      const [activeMission, briefings, journal] = await Promise.all([
        loadActiveMission(user.id),
        loadBriefings(user.id),
        loadJournal(user.id),
      ]);
      setSnap({
        loading: false,
        error: null,
        worldModel,
        activeMission,
        briefings,
        journal,
        generatedAt: Date.now(),
      });
    } catch (err) {
      setSnap((s) => ({ ...s, loading: false, error: err as Error }));
    }
  }, [user?.id, worldModel]);

  useEffect(() => { void refresh(); }, [refresh]);

  // Keep worldModel slice live as it changes in memory.
  useEffect(() => {
    setSnap((s) => ({ ...s, worldModel }));
  }, [worldModel]);

  // Realtime: refresh whenever a briefing is inserted or updated for this user.
  // The cron-driven sita-briefings-generate function inserts new rows, and the
  // "Mark seen" action updates `acknowledged_at`/`status` — both should reflect
  // immediately in the Now panel without manual refresh.
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`jarvis-now-briefings:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sita_proactive_briefings",
          filter: `user_id=eq.${user.id}`,
        },
        () => { void refresh(); },
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user?.id, refresh]);

  return { snapshot: snap, refresh };
}