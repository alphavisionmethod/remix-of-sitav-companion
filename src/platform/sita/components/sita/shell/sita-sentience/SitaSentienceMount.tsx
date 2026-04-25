// ═══════════════════════════════════════════════════════════════
// SITA OS — Sentience Mount (Phase H)
// ═══════════════════════════════════════════════════════════════
// Hydrates personality, polls due briefings every 90s, surfaces
// them through the existing whisper channel. Respects quiet hours.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { hydratePersonality } from "@/lib/sita-sentience/personality";
import { listDueBriefings, markDelivered, whisperBriefing } from "@/lib/sita-sentience/briefings";

const POLL_MS = 90_000;

export function SitaSentienceMount() {
  const { user } = useAuth();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    void hydratePersonality(user.id);

    const tick = async () => {
      try {
        const due = await listDueBriefings(user.id, 3);
        for (const b of due) {
          whisperBriefing(b);
          await markDelivered(b.id);
        }
      } catch (err) {
        console.warn("[sentience] briefings tick failed", err);
      }
    };
    void tick();
    timerRef.current = setInterval(tick, POLL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [user?.id]);

  return null;
}