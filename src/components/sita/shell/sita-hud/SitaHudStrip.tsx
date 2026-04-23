// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita HUD Status Strip (Phase A)
// ═══════════════════════════════════════════════════════════════
// One-line ambient status bar that lives at the very top of the
// desktop, above the system menu bar. It surfaces:
//   • a time-aware Sita greeting (no fake metrics)
//   • current voice state (when Sita is active)
//   • last live transcript (truncated)
//
// Empty-state honesty: if there's nothing to say and Sita is idle
// + unarmed, the strip collapses to nothing.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSitaHud, type SitaPresenceState } from "./sita-hud-bus";

function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

const PRESENCE_LABEL: Record<SitaPresenceState, string | null> = {
  idle: null,
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking",
  muted: "Mic muted",
};

export interface SitaHudStripProps {
  /** Hide on small screens — the dock takes priority on mobile. */
  className?: string;
}

export function SitaHudStrip({ className }: SitaHudStripProps) {
  const hud = useSitaHud();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const stateLabel = PRESENCE_LABEL[hud.presence];
  const showTranscript = Boolean(hud.transcript) && (hud.presence === "listening" || hud.presence === "thinking");

  const message = useMemo(() => {
    const parts: string[] = [];
    parts.push(greeting(now) + ".");
    if (hud.armed && hud.presence === "idle") parts.push("Sentinel armed.");
    if (stateLabel) parts.push(stateLabel);
    return parts.join(" ");
  }, [now, hud.armed, hud.presence, stateLabel]);

  // Hide entirely if there's nothing meaningful to say and we're not armed.
  const visible = hud.armed || hud.presence !== "idle";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sita-hud-strip"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "pointer-events-none fixed inset-x-0 top-0 z-[55] flex justify-center",
            "px-3 pt-1.5",
            className,
          )}
        >
          <div
            className={cn(
              "pointer-events-auto inline-flex max-w-[min(720px,90vw)] items-center gap-2",
              "rounded-full border border-white/10 bg-background/55 px-3 py-1",
              "text-[11px] font-medium text-foreground/85 backdrop-blur-xl",
              "shadow-[0_4px_22px_-8px_hsl(var(--primary)/0.45)]",
            )}
          >
            <span
              className={cn(
                "inline-flex h-4 w-4 items-center justify-center rounded-full",
                hud.presence === "listening" && "animate-pulse",
              )}
            >
              <Sparkles className="h-3 w-3 text-primary" />
            </span>
            <span className="truncate">{message}</span>
            {showTranscript && hud.transcript && (
              <span className="hidden truncate text-muted-foreground sm:inline">
                · "{truncate(hud.transcript, 56)}"
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return `${s.slice(0, n - 1)}…`;
}
