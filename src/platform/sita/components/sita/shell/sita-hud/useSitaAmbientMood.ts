// ═══════════════════════════════════════════════════════════════
// SITA OS — Ambient mood derivation (Phase A)
// ═══════════════════════════════════════════════════════════════
// Maps Sita HUD state + time-of-day onto an AmbientMood that the
// existing ShellAmbientBackground already understands.
//
// Phase A signals only (no system-health wiring yet — that's a
// later phase). When Sita is listening/speaking we override to a
// "warm" or "focus" mood so the wallpaper subtly responds.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import type { AmbientMood } from "@/components/sita/shell/ShellAmbientBackground";
import { useSitaHud } from "./sita-hud-bus";

function timeOfDayMood(): AmbientMood {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "warm";
  if (h >= 12 && h < 18) return "serene";
  if (h >= 18 && h < 21) return "warm";
  return "night";
}

/**
 * Returns the ambient mood the desktop background should render.
 * Updates once per minute and immediately when Sita changes state.
 */
export function useSitaAmbientMood(): AmbientMood {
  const hud = useSitaHud();
  const [tod, setTod] = useState<AmbientMood>(() => timeOfDayMood());

  useEffect(() => {
    const id = window.setInterval(() => setTod(timeOfDayMood()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (hud.presence === "listening") return "focus";
  if (hud.presence === "speaking") return "warm";
  if (hud.presence === "thinking") return "focus";
  return tod;
}
