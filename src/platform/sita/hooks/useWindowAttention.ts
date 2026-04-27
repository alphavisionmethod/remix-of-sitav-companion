// ═══════════════════════════════════════════════════════════════
// Calm UI Engine — Window Attention Model
// Computes per-window attention scores based on proximity,
// recency, and focus state. Drives opacity + saturation.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";

interface WindowInfo {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isFocused: boolean;
  lastInteraction: number; // timestamp
}

export interface AttentionScore {
  id: string;
  score: number;      // 0–1
  opacity: number;     // 0.5–1
  saturation: number;  // 0–1
}

const PROXIMITY_MAX = 600;
const RECENCY_DECAY = 10_000; // 10s full decay

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function useWindowAttention(windows: WindowInfo[]): Map<string, AttentionScore> {
  const [scores, setScores] = useState<Map<string, AttentionScore>>(new Map());
  const mousePos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    document.addEventListener("mousemove", handleMouse, { passive: true });
    return () => document.removeEventListener("mousemove", handleMouse);
  }, []);

  const compute = useCallback(() => {
    const now = Date.now();
    const mx = mousePos.current.x;
    const my = mousePos.current.y;

    const newScores = new Map<string, AttentionScore>();

    for (const win of windows) {
      // Center of window
      const cx = win.x + win.width / 2;
      const cy = win.y + win.height / 2;
      const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);

      const proximity = 1 - clamp(dist / PROXIMITY_MAX, 0, 1);
      const recency = Math.max(0, 1 - (now - win.lastInteraction) / RECENCY_DECAY);
      const focused = win.isFocused ? 1 : 0;

      const score = 0.4 * proximity + 0.3 * recency + 0.3 * focused;
      const clamped = clamp(score, 0, 1);

      newScores.set(win.id, {
        id: win.id,
        score: clamped,
        opacity: 0.5 + clamped * 0.5,
        saturation: clamped,
      });
    }

    setScores(newScores);
  }, [windows]);

  useEffect(() => {
    if (windows.length === 0) {
      setScores(new Map());
      return;
    }

    const tick = () => {
      compute();
      rafId.current = requestAnimationFrame(tick);
    };

    // Run at ~15fps to save CPU
    const interval = setInterval(() => {
      cancelAnimationFrame(rafId.current);
      compute();
    }, 66);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(rafId.current);
    };
  }, [windows, compute]);

  return scores;
}
