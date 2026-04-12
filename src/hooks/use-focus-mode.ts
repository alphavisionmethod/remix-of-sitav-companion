// ═══════════════════════════════════════════════════════════════
// SITA OS — Focus Mode (Deep Work)
// Pomodoro timer, notification blocking, UI dimming, productivity log
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { SoundEngine } from "@/lib/sound-engine";

export type FocusPreset = 25 | 50 | 90; // minutes

interface FocusSession {
  startedAt: number;
  duration: number; // ms
  completedAt?: number;
}

const FOCUS_LOG_KEY = "sita-focus-log";

export function useFocusMode() {
  const [active, setActive] = useState(false);
  const [remaining, setRemaining] = useState(0); // ms
  const [totalDuration, setTotalDuration] = useState(0); // ms
  const [breakSuggested, setBreakSuggested] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const startTimeRef = useRef(0);

  const progress = totalDuration > 0 ? 1 - remaining / totalDuration : 0;

  const start = useCallback((minutes: FocusPreset = 25) => {
    const durationMs = minutes * 60 * 1000;
    setTotalDuration(durationMs);
    setRemaining(durationMs);
    setActive(true);
    setBreakSuggested(false);
    startTimeRef.current = Date.now();
    SoundEngine.approve();

    // Apply focus CSS
    document.documentElement.classList.add("sita-focus-mode");
  }, []);

  const stop = useCallback(() => {
    setActive(false);
    setBreakSuggested(false);
    document.documentElement.classList.remove("sita-focus-mode");

    if (intervalRef.current) clearInterval(intervalRef.current);

    // Log session
    if (startTimeRef.current) {
      const session: FocusSession = {
        startedAt: startTimeRef.current,
        duration: Date.now() - startTimeRef.current,
        completedAt: Date.now(),
      };
      try {
        const log = JSON.parse(localStorage.getItem(FOCUS_LOG_KEY) || "[]") as FocusSession[];
        log.push(session);
        // Keep last 50 sessions
        localStorage.setItem(FOCUS_LOG_KEY, JSON.stringify(log.slice(-50)));
      } catch {
        // Ignore storage errors
      }
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!active) return;

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1000;
        if (next <= 0) {
          // Focus complete!
          SoundEngine.boot();
          setBreakSuggested(true);
          setActive(false);
          document.documentElement.classList.remove("sita-focus-mode");
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  // Block notifications while focused
  useEffect(() => {
    if (active) {
      document.documentElement.dataset.focusMode = "true";
    } else {
      delete document.documentElement.dataset.focusMode;
    }
  }, [active]);

  const formatRemaining = useCallback(() => {
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, [remaining]);

  const getSessionLog = useCallback((): FocusSession[] => {
    try {
      return JSON.parse(localStorage.getItem(FOCUS_LOG_KEY) || "[]");
    } catch {
      return [];
    }
  }, []);

  return {
    active,
    remaining,
    totalDuration,
    progress,
    breakSuggested,
    formatRemaining,
    start,
    stop,
    getSessionLog,
  };
}
