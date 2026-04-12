// ═══════════════════════════════════════════════════════════════
// Calm UI Engine — Idle Detector
// Tracks user activity; fades to idle after 30s of inactivity
// State machine: active → fading → idle
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";

export type IdlePhase = "active" | "fading" | "idle";

const IDLE_TIMEOUT = 30_000;   // 30s before fading
const FADE_DURATION = 2_000;   // 2s fade transition

const ACTIVITY_EVENTS = ["mousemove", "keydown", "pointerdown", "scroll", "touchstart"] as const;

export function useIdleDetector(): IdlePhase {
  const [phase, setPhase] = useState<IdlePhase>("active");
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();
  const fadeTimer = useRef<ReturnType<typeof setTimeout>>();

  const resetToActive = useCallback(() => {
    clearTimeout(idleTimer.current);
    clearTimeout(fadeTimer.current);
    setPhase("active");

    idleTimer.current = setTimeout(() => {
      setPhase("fading");
      fadeTimer.current = setTimeout(() => {
        setPhase("idle");
      }, FADE_DURATION);
    }, IDLE_TIMEOUT);
  }, []);

  useEffect(() => {
    resetToActive();

    ACTIVITY_EVENTS.forEach(evt => {
      document.addEventListener(evt, resetToActive, { passive: true });
    });

    return () => {
      clearTimeout(idleTimer.current);
      clearTimeout(fadeTimer.current);
      ACTIVITY_EVENTS.forEach(evt => {
        document.removeEventListener(evt, resetToActive);
      });
    };
  }, [resetToActive]);

  return phase;
}

/** Get opacity multiplier from idle phase */
export function idleOpacity(phase: IdlePhase, base: number = 1): number {
  if (phase === "active") return base;
  if (phase === "fading") return base * 0.5;
  return base * 0.2;
}
