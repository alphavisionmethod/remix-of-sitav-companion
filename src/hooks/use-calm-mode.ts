// ═══════════════════════════════════════════════════════════════
// SITA OS — Progressive Calm Mode
// Auto-triggers on inactivity with 3 levels of simplification
// Breathing ambient glow in calm, exits on interaction
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { SoundEngine } from "@/lib/sound-engine";

export type CalmLevel = 0 | 1 | 2 | 3;

const INACTIVITY_THRESHOLD = 3 * 60 * 1000; // 3 min
const LEVEL_ESCALATION = 30_000; // 30s between levels
const EXIT_DURATION = 500;

export function useCalmMode() {
  const [level, setLevel] = useState<CalmLevel>(0);
  const [manualOverride, setManualOverride] = useState(false);
  const lastActivity = useRef(Date.now());
  const escalationTimer = useRef<ReturnType<typeof setTimeout>>();

  const resetActivity = useCallback(() => {
    lastActivity.current = Date.now();
    if (level > 0 && !manualOverride) {
      setLevel(0);
    }
  }, [level, manualOverride]);

  // Track user activity
  useEffect(() => {
    const events = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"];
    const handler = () => resetActivity();
    events.forEach(e => document.addEventListener(e, handler, { passive: true }));
    return () => events.forEach(e => document.removeEventListener(e, handler));
  }, [resetActivity]);

  // Auto-escalation timer
  useEffect(() => {
    if (manualOverride) return;

    const check = () => {
      const idle = Date.now() - lastActivity.current;
      if (idle >= INACTIVITY_THRESHOLD && level === 0) {
        setLevel(1);
      } else if (idle >= INACTIVITY_THRESHOLD + LEVEL_ESCALATION && level === 1) {
        setLevel(2);
      } else if (idle >= INACTIVITY_THRESHOLD + LEVEL_ESCALATION * 2 && level === 2) {
        setLevel(3);
      }
    };

    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [level, manualOverride]);

  // Apply calm CSS classes + ambient audio
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.calmLevel = String(level);

    root.classList.toggle("calm-level-1", level >= 1);
    root.classList.toggle("calm-level-2", level >= 2);
    root.classList.toggle("calm-level-3", level >= 3);
    root.classList.toggle("calm-breathing", level >= 2);

    // Start/stop ambient chimes based on calm level
    if (level >= 2) {
      SoundEngine.startCalm();
    } else {
      SoundEngine.stopCalm();
    }

    return () => {
      root.classList.remove("calm-level-1", "calm-level-2", "calm-level-3", "calm-breathing");
      delete root.dataset.calmLevel;
      SoundEngine.stopCalm();
    };
  }, [level]);

  // Cmd+, toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "," && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setManualOverride(prev => !prev);
        setLevel(prev => prev > 0 ? 0 : 3);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return { calmLevel: level, isCalm: level > 0, manualOverride };
}
