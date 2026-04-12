// ═══════════════════════════════════════════════════════════════
// SITA OS — Accent Color CSS Sync
// Reads accent from SettingsService and applies to :root CSS vars
// ═══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { SettingsService } from "@/lib/nova-sdk/services/settings-service";

const ACCENT_MAP: Record<string, string> = {
  "hsl(265, 55%, 58%)": "265 55% 58%",
  "hsl(210, 80%, 55%)": "210 80% 55%",
  "hsl(152, 55%, 48%)": "152 55% 48%",
  "hsl(38, 85%, 58%)":  "38 85% 58%",
  "hsl(0, 65%, 50%)":   "0 65% 50%",
  "hsl(330, 65%, 55%)": "330 65% 55%",
};

function applyAccent(raw: string) {
  const hsl = ACCENT_MAP[raw];
  if (!hsl) return;
  const root = document.documentElement;
  root.style.setProperty("--primary", hsl);
  const hue = parseInt(hsl);
  if (!isNaN(hue)) {
    root.style.setProperty("--accent", `${(hue + 133) % 360} 85% 58%`);
  }
}

/** Call once near the root to keep CSS --primary in sync with SettingsService */
export function useAccentSync() {
  useEffect(() => {
    // Apply on mount
    const current = SettingsService.get("appearance.accentColor");
    if (current) applyAccent(current);

    // Subscribe to future changes
    const unsub = SettingsService.subscribe("appearance.accentColor", (_k, v) => {
      if (v) applyAccent(v as string);
    });
    return unsub;
  }, []);
}
