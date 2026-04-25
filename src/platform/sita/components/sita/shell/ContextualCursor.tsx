// ═══════════════════════════════════════════════════════════════
// SITA OS — Contextual Cursor
// Intelligent cursor with loading ring, glow trail, drag preview
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CursorState {
  x: number;
  y: number;
  visible: boolean;
  loading: boolean;
  trail: { x: number; y: number; opacity: number }[];
}

const TRAIL_LENGTH = 8;
const TRAIL_DECAY = 0.12;
const TRAIL_MIN_DISTANCE = 8;
const CURSOR_SIZE = 8;
const LOADING_SIZE = 20;

// Global loading state registry
const loadingListeners = new Set<(loading: boolean) => void>();
let globalLoading = false;

export function setCursorLoading(loading: boolean) {
  globalLoading = loading;
  loadingListeners.forEach(fn => fn(loading));
}

export function ContextualCursor() {
  const [state, setState] = useState<CursorState>({
    x: 0, y: 0, visible: false, loading: false, trail: [],
  });
  const rafRef = useRef<number>(0);
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const trailPoints = useRef<{ x: number; y: number; time: number }[]>([]);
  const isTouch = useRef(false);

  // Loading state listener
  useEffect(() => {
    const handler = (loading: boolean) => setState(s => ({ ...s, loading }));
    loadingListeners.add(handler);
    setState(s => ({ ...s, loading: globalLoading }));
    return () => { loadingListeners.delete(handler); };
  }, []);

  useEffect(() => {
    // Don't show on touch devices
    const checkTouch = () => { isTouch.current = true; };
    window.addEventListener("touchstart", checkTouch, { once: true, passive: true });

    const handleMouseMove = (e: MouseEvent) => {
      if (isTouch.current) return;
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Add trail point if far enough from last
      const last = trailPoints.current[trailPoints.current.length - 1];
      const dist = last
        ? Math.sqrt((e.clientX - last.x) ** 2 + (e.clientY - last.y) ** 2)
        : TRAIL_MIN_DISTANCE + 1;

      if (dist >= TRAIL_MIN_DISTANCE) {
        trailPoints.current.push({ x: e.clientX, y: e.clientY, time: Date.now() });
        if (trailPoints.current.length > TRAIL_LENGTH) {
          trailPoints.current.shift();
        }
      }
    };

    const handleMouseEnter = () => {
      if (!isTouch.current) setState(s => ({ ...s, visible: true }));
    };

    const handleMouseLeave = () => {
      setState(s => ({ ...s, visible: false }));
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Animation loop — smooth follow + trail update
    const animate = () => {
      if (isTouch.current) return;

      // Smooth follow
      const lerp = 0.35;
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * lerp;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * lerp;

      // Build trail with decay
      const now = Date.now();
      const trail = trailPoints.current
        .map((p, i) => ({
          x: p.x,
          y: p.y,
          opacity: Math.max(0, 1 - (now - p.time) / 300) * ((i + 1) / trailPoints.current.length) * 0.3,
        }))
        .filter(p => p.opacity > 0.01);

      setState({
        x: currentPos.current.x,
        y: currentPos.current.y,
        visible: true,
        loading: globalLoading,
        trail,
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchstart", checkTouch);
    };
  }, []);

  if (!state.visible || isTouch.current) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999]" aria-hidden="true">
      {/* Trail dots */}
      {state.trail.map((point, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-[hsl(var(--primary))]"
          style={{
            left: point.x - 2,
            top: point.y - 2,
            width: 4,
            height: 4,
            opacity: point.opacity,
            transition: "opacity 0.1s",
          }}
        />
      ))}

      {/* Loading ring */}
      {state.loading && (
        <svg
          className="absolute animate-spin"
          style={{
            left: state.x - LOADING_SIZE / 2,
            top: state.y - LOADING_SIZE / 2,
            width: LOADING_SIZE,
            height: LOADING_SIZE,
          }}
          viewBox="0 0 20 20"
        >
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeDasharray="25 25"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      )}

      {/* Glow dot at cursor */}
      <div
        className="absolute rounded-full"
        style={{
          left: state.x - CURSOR_SIZE / 2,
          top: state.y - CURSOR_SIZE / 2,
          width: CURSOR_SIZE,
          height: CURSOR_SIZE,
          background: `radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)`,
          transform: "scale(3)",
        }}
      />
    </div>
  );
}
