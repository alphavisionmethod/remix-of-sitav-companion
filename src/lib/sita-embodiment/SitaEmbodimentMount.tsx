// ═══════════════════════════════════════════════════════════════
// SITA OS — Embodiment Mount (Phase I)
// ═══════════════════════════════════════════════════════════════
// Lightweight runtime bridge: listens to the existing voice spine's
// `sita-voice-reply` event and re-emits it as a *persona-shaped*
// reply on `sita-voice-reply-shaped`. Other UI pieces (HUD whisper,
// agent receipts) can subscribe to the shaped event for consistent
// tone. We never replace the spine — only sit alongside it.
// ═══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { shapeReplyForActivePersona, isEmbodimentEnabled } from "./persona-voice-bridge";

export function SitaEmbodimentMount() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isEmbodimentEnabled()) return;

    const onReply = (e: Event) => {
      const detail = (e as CustomEvent<{ text?: string; honorific?: boolean }>).detail;
      const original = detail?.text;
      if (!original) return;
      const shaped = shapeReplyForActivePersona(original, { addHonorific: detail?.honorific });
      window.dispatchEvent(
        new CustomEvent("sita-voice-reply-shaped", {
          detail: { original, shaped, suppressed: shaped === null },
        }),
      );
    };

    window.addEventListener("sita-voice-reply", onReply);
    return () => window.removeEventListener("sita-voice-reply", onReply);
  }, []);

  return null;
}