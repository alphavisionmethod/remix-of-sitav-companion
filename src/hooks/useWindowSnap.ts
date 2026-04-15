// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Snap-to-Edge System
// Native OS-style window snapping with visual guides
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useRef } from "react";

export type SnapZone = "left" | "right" | "top" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "maximize" | null;

const SNAP_THRESHOLD = 16; // px from edge to trigger snap
const TOP_BAR_HEIGHT = 36; // OS top bar height

interface SnapResult {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Calculate snap geometry for a given zone */
function getSnapGeometry(zone: SnapZone, viewportW: number, viewportH: number): SnapResult | null {
  const usableH = viewportH - TOP_BAR_HEIGHT;
  const halfW = Math.floor(viewportW / 2);
  const halfH = Math.floor(usableH / 2);

  switch (zone) {
    case "left":
      return { x: 0, y: TOP_BAR_HEIGHT, width: halfW, height: usableH };
    case "right":
      return { x: halfW, y: TOP_BAR_HEIGHT, width: viewportW - halfW, height: usableH };
    case "maximize":
    case "top":
      return { x: 0, y: TOP_BAR_HEIGHT, width: viewportW, height: usableH };
    case "top-left":
      return { x: 0, y: TOP_BAR_HEIGHT, width: halfW, height: halfH };
    case "top-right":
      return { x: halfW, y: TOP_BAR_HEIGHT, width: viewportW - halfW, height: halfH };
    case "bottom-left":
      return { x: 0, y: TOP_BAR_HEIGHT + halfH, width: halfW, height: usableH - halfH };
    case "bottom-right":
      return { x: halfW, y: TOP_BAR_HEIGHT + halfH, width: viewportW - halfW, height: usableH - halfH };
    default:
      return null;
  }
}

/** Detect which snap zone the cursor is in */
function detectSnapZone(cursorX: number, cursorY: number): SnapZone {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const nearLeft = cursorX <= SNAP_THRESHOLD;
  const nearRight = cursorX >= vw - SNAP_THRESHOLD;
  const nearTop = cursorY <= TOP_BAR_HEIGHT + SNAP_THRESHOLD;
  const nearBottom = cursorY >= vh - SNAP_THRESHOLD;

  if (nearTop && nearLeft) return "top-left";
  if (nearTop && nearRight) return "top-right";
  if (nearBottom && nearLeft) return "bottom-left";
  if (nearBottom && nearRight) return "bottom-right";
  if (nearLeft) return "left";
  if (nearRight) return "right";
  if (nearTop) return "maximize";
  return null;
}

export interface UseWindowSnapReturn {
  /** Current snap zone being hovered */
  activeZone: SnapZone;
  /** Snap guide overlay geometry (for rendering visual indicator) */
  snapGuide: SnapResult | null;
  /** Call during drag move to detect zones */
  onDragMove: (cursorX: number, cursorY: number) => void;
  /** Call on drag end — returns snap geometry if in a zone, or null */
  onDragEnd: (cursorX: number, cursorY: number) => SnapResult | null;
  /** Reset snap state */
  reset: () => void;
}

export function useWindowSnap(): UseWindowSnapReturn {
  const [activeZone, setActiveZone] = useState<SnapZone>(null);
  const [snapGuide, setSnapGuide] = useState<SnapResult | null>(null);
  const zoneRef = useRef<SnapZone>(null);

  const onDragMove = useCallback((cursorX: number, cursorY: number) => {
    const zone = detectSnapZone(cursorX, cursorY);
    if (zone !== zoneRef.current) {
      zoneRef.current = zone;
      setActiveZone(zone);
      if (zone) {
        const geo = getSnapGeometry(zone, window.innerWidth, window.innerHeight);
        setSnapGuide(geo);
      } else {
        setSnapGuide(null);
      }
    }
  }, []);

  const onDragEnd = useCallback((cursorX: number, cursorY: number): SnapResult | null => {
    const zone = detectSnapZone(cursorX, cursorY);
    setActiveZone(null);
    setSnapGuide(null);
    zoneRef.current = null;
    if (!zone) return null;
    return getSnapGeometry(zone, window.innerWidth, window.innerHeight);
  }, []);

  const reset = useCallback(() => {
    setActiveZone(null);
    setSnapGuide(null);
    zoneRef.current = null;
  }, []);

  return { activeZone, snapGuide, onDragMove, onDragEnd, reset };
}

/** Snap guide overlay component styles */
export function getSnapGuideStyles(guide: SnapResult): React.CSSProperties {
  return {
    position: "fixed",
    left: guide.x,
    top: guide.y,
    width: guide.width,
    height: guide.height,
    background: "hsl(265 55% 58% / 0.12)",
    border: "2px solid hsl(265 55% 58% / 0.4)",
    borderRadius: 12,
    pointerEvents: "none" as const,
    zIndex: 99998,
    transition: "all 150ms cubic-bezier(0.23, 1, 0.32, 1)",
    backdropFilter: "blur(4px)",
  };
}
