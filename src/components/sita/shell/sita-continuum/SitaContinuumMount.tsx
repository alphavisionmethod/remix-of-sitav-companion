// ═══════════════════════════════════════════════════════════════
// SITA OS — Continuum Mount (Phase J)
// ═══════════════════════════════════════════════════════════════
// Boots the episode tracker + affect loop, subscribes to existing
// signal buses (screen context, voice intent, voice reply) and
// feeds episode signals. Refreshes the Continuum snapshot every
// 30s so any HUD widget can read coherent state.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  startEpisodeTracker,
  stopEpisodeTracker,
  noteSignal,
  closeEpisode,
} from "@/lib/sita-continuum/episode-tracker";
import { startAffectLoop, stopAffectLoop } from "@/lib/sita-continuum/affect-loop";
import { refreshContinuum } from "@/lib/sita-continuum/continuum-context";
import { subscribeScreenContext } from "@/lib/sita-context";

const REFRESH_MS = 30_000;

export function SitaContinuumMount() {
  const { user } = useAuth();
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    void startEpisodeTracker(user.id);
    startAffectLoop(user.id);

    const offCtx = subscribeScreenContext((ctx) => {
      void noteSignal(ctx?.surfaceId ?? null);
    });

    const onIntent = () => { void noteSignal("voice"); };
    const onReply = () => { void noteSignal("voice-reply"); };
    const onUtterance = () => { void noteSignal("voice"); };

    window.addEventListener("sita-voice-intent", onIntent);
    window.addEventListener("sita-voice-reply", onReply);
    window.addEventListener("sita-voice-utterance", onUtterance);

    void refreshContinuum(user.id, true);
    refreshTimer.current = setInterval(() => {
      if (user?.id) void refreshContinuum(user.id);
    }, REFRESH_MS);

    const onUnload = () => { void closeEpisode("unload"); };
    window.addEventListener("beforeunload", onUnload);

    return () => {
      offCtx();
      window.removeEventListener("sita-voice-intent", onIntent);
      window.removeEventListener("sita-voice-reply", onReply);
      window.removeEventListener("sita-voice-utterance", onUtterance);
      window.removeEventListener("beforeunload", onUnload);
      if (refreshTimer.current) clearInterval(refreshTimer.current);
      stopAffectLoop();
      stopEpisodeTracker();
    };
  }, [user?.id]);

  return null;
}