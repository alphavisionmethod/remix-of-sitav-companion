// ═══════════════════════════════════════════════════════════════
// NovaOS — Window Snap Zone Engine
// CPU-friendly edge snapping with preview overlays
// Now with quadrant snap zones (corners)
// ═══════════════════════════════════════════════════════════════

export type SnapZone = "left" | "right" | "top" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | null;

export const SNAP_CONFIG = {
  /** Edge threshold in pixels to trigger snap detection */
  edgeThreshold: 60,
  /** Top edge threshold for maximize */
  topThreshold: 40,
  /** Corner threshold — both edges must be within this */
  cornerThreshold: 80,
  /** Preview overlay opacity */
  previewOpacity: 0.15,
  /** Snap animation duration in seconds */
  animationDuration: 0.25,
  /** Preview border radius */
  previewRadius: 12,
  /** Gap from screen edge when snapped */
  snapGap: 6,
} as const;

/**
 * Detect which snap zone the pointer is in based on viewport position.
 * Corners take priority over edges.
 */
export function detectSnapZone(
  pointerX: number,
  pointerY: number,
  viewportW: number,
  viewportH: number
): SnapZone {
  const ct = SNAP_CONFIG.cornerThreshold;
  const et = SNAP_CONFIG.edgeThreshold;
  const tt = SNAP_CONFIG.topThreshold;

  const nearLeft = pointerX <= ct;
  const nearRight = pointerX >= viewportW - ct;
  const nearTop = pointerY <= ct;
  const nearBottom = pointerY >= viewportH - ct;

  // Corner zones (priority)
  if (nearTop && nearLeft) return "top-left";
  if (nearTop && nearRight) return "top-right";
  if (nearBottom && nearLeft) return "bottom-left";
  if (nearBottom && nearRight) return "bottom-right";

  // Edge zones
  if (pointerY <= tt) return "top";
  if (pointerX <= et) return "left";
  if (pointerX >= viewportW - et) return "right";

  return null;
}

/**
 * Get the target rect for a given snap zone.
 */
export function getSnapRect(
  zone: NonNullable<SnapZone>,
  viewportW: number,
  viewportH: number,
  menuBarH = 40,
  dockH = 80
): { x: number; y: number; width: number; height: number } {
  const gap = SNAP_CONFIG.snapGap;
  const availH = viewportH - menuBarH - dockH - gap * 2;
  const halfW = viewportW / 2 - gap * 1.5;
  const halfH = availH / 2 - gap * 0.5;

  switch (zone) {
    case "left":
      return { x: gap, y: menuBarH + gap, width: halfW, height: availH };
    case "right":
      return { x: viewportW / 2 + gap * 0.5, y: menuBarH + gap, width: halfW, height: availH };
    case "top":
      return { x: gap, y: menuBarH + gap, width: viewportW - gap * 2, height: availH };
    case "top-left":
      return { x: gap, y: menuBarH + gap, width: halfW, height: halfH };
    case "top-right":
      return { x: viewportW / 2 + gap * 0.5, y: menuBarH + gap, width: halfW, height: halfH };
    case "bottom-left":
      return { x: gap, y: menuBarH + gap + halfH + gap, width: halfW, height: halfH };
    case "bottom-right":
      return { x: viewportW / 2 + gap * 0.5, y: menuBarH + gap + halfH + gap, width: halfW, height: halfH };
  }
}
