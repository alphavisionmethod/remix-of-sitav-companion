// ═══════════════════════════════════════════════════════════════
// SITA OS — Proactive Runner (Phase D)
// ═══════════════════════════════════════════════════════════════
// Mounts once inside the shell and starts the ambient signal
// sources. Also bridges Sita Whisper actions ("intent" buttons)
// into the global voice intent router so they execute identically
// to spoken commands.
// ═══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { startSitaSignalSources } from "@/lib/sita-proactive";
import { useSitaVoice } from "@/contexts/SitaVoiceContext";

export function SitaProactiveRunner() {
  const voice = useSitaVoice();

  // Start ambient observers once.
  useEffect(() => {
    const stop = startSitaSignalSources();
    return () => stop();
  }, []);

  // Bridge "sita-voice-utterance" → voice provider so whisper
  // action buttons feel identical to a spoken command.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onUtterance = (e: Event) => {
      const detail = (e as CustomEvent).detail as { utterance?: string } | undefined;
      const utterance = detail?.utterance?.trim();
      if (!utterance) return;
      if (voice && typeof voice.dispatchIntent === "function") {
        voice.dispatchIntent(utterance);
      } else {
        // Fallback: forward as a plain intent on the window bus.
        window.dispatchEvent(
          new CustomEvent("sita-voice-intent", {
            detail: { kind: "brain", utterance, raw: utterance },
          }),
        );
      }
    };
    window.addEventListener("sita-voice-utterance", onUtterance);
    return () => window.removeEventListener("sita-voice-utterance", onUtterance);
  }, [voice]);

  return null;
}