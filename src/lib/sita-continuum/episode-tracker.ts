// ═══════════════════════════════════════════════════════════════
// SITA OS — Episode Tracker (Phase J)
// ═══════════════════════════════════════════════════════════════
// Bounds the user's activity into "episodes" — durable focus
// sessions that the agent + dream consolidator can summarize.
// An episode opens when the user becomes active on a surface and
// closes after IDLE_MS of no signal or on explicit handoff.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

const IDLE_MS = 7 * 60 * 1000; // 7 minutes of silence ends an episode
const LS_OPEN = "sita.continuum.open_episode_v1";

export interface SitaEpisode {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  primary_surface: string | null;
  intent_summary: string | null;
  signals_count: number;
  energy_score: number;
}

interface OpenState {
  id: string;
  surface: string | null;
  signals: number;
  lastSignalAt: number;
  startedAt: number;
}

let state: OpenState | null = null;
let userId: string | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;

function loadOpen(): OpenState | null {
  try {
    const raw = localStorage.getItem(LS_OPEN);
    return raw ? (JSON.parse(raw) as OpenState) : null;
  } catch { return null; }
}

function saveOpen(s: OpenState | null) {
  try {
    if (s) localStorage.setItem(LS_OPEN, JSON.stringify(s));
    else localStorage.removeItem(LS_OPEN);
  } catch { /* noop */ }
}

export async function startEpisodeTracker(uid: string) {
  userId = uid;
  state = loadOpen();
  // Resume stale episode only if it's < 1h old
  if (state && Date.now() - state.lastSignalAt > 60 * 60 * 1000) {
    await closeEpisode("stale-resume");
  }
  scheduleIdle();
}

export function stopEpisodeTracker() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = null;
  userId = null;
}

function scheduleIdle() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { void closeEpisode("idle"); }, IDLE_MS);
}

export async function noteSignal(surface: string | null = null) {
  if (!userId) return;
  const now = Date.now();
  if (!state) {
    // Open new episode
    try {
      const { data, error } = await supabase
        .from("sita_episodes" as never)
        .insert({
          user_id: userId,
          primary_surface: surface,
          signals_count: 1,
        } as never)
        .select("id")
        .single();
      if (error) throw error;
      state = {
        id: (data as { id: string }).id,
        surface,
        signals: 1,
        lastSignalAt: now,
        startedAt: now,
      };
      saveOpen(state);
    } catch (err) {
      console.warn("[continuum] open episode failed", err);
    }
  } else {
    state.signals += 1;
    state.lastSignalAt = now;
    if (surface && !state.surface) state.surface = surface;
    saveOpen(state);
    // Throttled DB sync every 5 signals
    if (state.signals % 5 === 0) {
      try {
        await supabase
          .from("sita_episodes" as never)
          .update({ signals_count: state.signals, primary_surface: state.surface } as never)
          .eq("id", state.id);
      } catch { /* noop */ }
    }
  }
  scheduleIdle();
}

export async function closeEpisode(reason: string = "manual") {
  if (!state || !userId) return;
  const finalState = state;
  state = null;
  saveOpen(null);
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = null;
  const durationMin = (Date.now() - finalState.startedAt) / 60000;
  const energy = Math.min(1, finalState.signals / Math.max(1, durationMin * 2));
  const summary = `${finalState.signals} signals over ${durationMin.toFixed(1)}m on ${finalState.surface ?? "shell"} (${reason}).`;
  try {
    await supabase
      .from("sita_episodes" as never)
      .update({
        ended_at: new Date().toISOString(),
        signals_count: finalState.signals,
        energy_score: energy,
        intent_summary: summary,
      } as never)
      .eq("id", finalState.id);
  } catch (err) {
    console.warn("[continuum] close episode failed", err);
  }
}

export async function listRecentEpisodes(uid: string, limit = 10): Promise<SitaEpisode[]> {
  const { data } = await supabase
    .from("sita_episodes" as never)
    .select("*")
    .eq("user_id", uid)
    .order("started_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as SitaEpisode[];
}

export function readOpenEpisode(): { id: string; surface: string | null; signals: number; ageMs: number } | null {
  if (!state) return null;
  return { id: state.id, surface: state.surface, signals: state.signals, ageMs: Date.now() - state.startedAt };
}