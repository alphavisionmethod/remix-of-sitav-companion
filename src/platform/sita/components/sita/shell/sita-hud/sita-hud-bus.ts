// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita HUD Event Bus (Phase A)
// ═══════════════════════════════════════════════════════════════
// Tiny in-memory pub/sub used by Phase A presentational pieces
// (orb, ambient reactor, status strip). Phase B's SitaVoiceProvider
// will publish into the same bus so the same UI keeps working
// without needing to know who is driving it.
//
// No React. No deps. SSR-safe.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";

export type SitaPresenceState = "idle" | "listening" | "thinking" | "speaking" | "muted";

export interface SitaHudSnapshot {
  /** What Sita is doing right now. */
  presence: SitaPresenceState;
  /** Optional one-line status (e.g. "Listening…", "Drafting reply"). */
  status: string | null;
  /** Last user transcript (live, may be partial). */
  transcript: string | null;
  /** Last spoken reply (truncated). */
  reply: string | null;
  /** Audio level 0-1 used for waveform / orb pulse intensity. */
  level: number;
  /** True if Sentinel wake loop is armed. */
  armed: boolean;
}

const INITIAL: SitaHudSnapshot = {
  presence: "idle",
  status: null,
  transcript: null,
  reply: null,
  level: 0,
  armed: false,
};

let snapshot: SitaHudSnapshot = INITIAL;
const listeners = new Set<(s: SitaHudSnapshot) => void>();

function emit() {
  for (const l of listeners) l(snapshot);
}

/** Replace whole snapshot or patch fields. Triggers a single emit. */
export function publishSitaHud(patch: Partial<SitaHudSnapshot>) {
  snapshot = { ...snapshot, ...patch };
  emit();
}

/** Read current snapshot synchronously (e.g. for first-render hydration). */
export function readSitaHud(): SitaHudSnapshot {
  return snapshot;
}

/** Subscribe to all changes; returns unsubscribe. */
export function subscribeSitaHud(fn: (s: SitaHudSnapshot) => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/**
 * React hook — re-renders on every snapshot change.
 * Phase A only reads; Phase B will start writing via publishSitaHud.
 */
export function useSitaHud(): SitaHudSnapshot {
  const [state, setState] = useState<SitaHudSnapshot>(snapshot);
  useEffect(() => subscribeSitaHud(setState), []);
  return state;
}
