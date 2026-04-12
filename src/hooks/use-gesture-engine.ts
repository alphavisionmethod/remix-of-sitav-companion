// ═══════════════════════════════════════════════════════════════
// SITA OS — Gesture Engine
// Touch/trackpad gesture recognition: swipe, pinch, edge-swipe
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useCallback } from "react";

export interface GestureEvent {
  type: "swipe-left" | "swipe-right" | "swipe-up" | "swipe-down" | "pinch-in" | "pinch-out" | "edge-swipe-left" | "edge-swipe-right";
  velocity: number;
  scale?: number;
}

type GestureHandler = (event: GestureEvent) => void;

const SWIPE_THRESHOLD = 50; // px
const SWIPE_VELOCITY_MIN = 0.3; // px/ms
const EDGE_ZONE = 20; // px from screen edge
const PINCH_THRESHOLD = 0.15; // scale delta

export function useGestureEngine(onGesture: GestureHandler) {
  const touchStart = useRef<{ x: number; y: number; time: number; fingers: number } | null>(null);
  const initialPinchDist = useRef<number>(0);
  const handlerRef = useRef(onGesture);
  handlerRef.current = onGesture;

  const getTouchDist = useCallback((touches: TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStart.current = {
        x: t.clientX,
        y: t.clientY,
        time: Date.now(),
        fingers: e.touches.length,
      };
      if (e.touches.length >= 2) {
        initialPinchDist.current = getTouchDist(e.touches);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const start = touchStart.current;
      const ct = e.changedTouches[0];
      const dx = ct.clientX - start.x;
      const dy = ct.clientY - start.y;
      const dt = Date.now() - start.time;
      const velocity = Math.sqrt(dx * dx + dy * dy) / Math.max(dt, 1);

      // Pinch detection (2+ fingers)
      if (start.fingers >= 2 && e.touches.length === 0 && initialPinchDist.current > 0) {
        // Use last known distance — approximate from changedTouches
        // Pinch handled in touchmove instead
      }

      // Swipe detection (2-3 fingers for workspace switch)
      if (velocity >= SWIPE_VELOCITY_MIN) {
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDx > SWIPE_THRESHOLD && absDx > absDy) {
          // Edge swipe detection
          const isEdgeLeft = start.x < EDGE_ZONE;
          const isEdgeRight = start.x > window.innerWidth - EDGE_ZONE;

          if (isEdgeLeft && dx > 0) {
            handlerRef.current({ type: "edge-swipe-right", velocity });
          } else if (isEdgeRight && dx < 0) {
            handlerRef.current({ type: "edge-swipe-left", velocity });
          } else if (start.fingers >= 3) {
            // Three-finger swipe = workspace switch
            handlerRef.current({ type: dx > 0 ? "swipe-right" : "swipe-left", velocity });
          }
        } else if (absDy > SWIPE_THRESHOLD && absDy > absDx && start.fingers >= 3) {
          handlerRef.current({ type: dy > 0 ? "swipe-down" : "swipe-up", velocity });
        }
      }

      touchStart.current = null;
      initialPinchDist.current = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Pinch detection during move
      if (e.touches.length >= 2 && initialPinchDist.current > 0) {
        const currentDist = getTouchDist(e.touches);
        const scale = currentDist / initialPinchDist.current;

        if (Math.abs(scale - 1) > PINCH_THRESHOLD) {
          const velocity = Math.abs(scale - 1) * 2;
          handlerRef.current({
            type: scale > 1 ? "pinch-out" : "pinch-in",
            velocity,
            scale,
          });
          // Reset to prevent repeated fires
          initialPinchDist.current = currentDist;
        }
      }
    };

    // Trackpad wheel gesture detection (pinch-to-zoom on trackpad)
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        // Trackpad pinch gesture
        e.preventDefault();
        const scale = 1 - e.deltaY * 0.01;
        if (Math.abs(scale - 1) > 0.02) {
          handlerRef.current({
            type: scale > 1 ? "pinch-out" : "pinch-in",
            velocity: Math.abs(e.deltaY) * 0.01,
            scale,
          });
        }
      }
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    document.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("wheel", handleWheel);
    };
  }, [getTouchDist]);
}
