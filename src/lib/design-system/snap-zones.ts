// ═══════════════════════════════════════════════════════════════
// NovaOS — Window Snap Zone Engine
// CPU-friendly edge snapping with preview overlays
// ═══════════════════════════════════════════════════════════════

export type SnapZone = "left" | "right" | "top" | null;

export const SNAP_CONFIG = {
  /** Edge threshold in pixels to trigger snap detection */
  edgeThreshold: 60,
  /** Top edge threshold for maximize */
  topThreshold: 40,
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
 * Only left/right edges and top edge trigger snapping.
 */
export function detectSnapZone(
  pointerX: number,
  pointerY: number,
  viewportW: number,
  _viewportH: number
): SnapZone {
  if (pointerY <= SNAP_CONFIG.topThreshold) return "top";
  if (pointerX <= SNAP_CONFIG.edgeThreshold) return "left";
  if (pointerX >= viewportW - SNAP_CONFIG.edgeThreshold) return "right";
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

  switch (zone) {
    case "left":
      return { x: gap, y: menuBarH + gap, width: viewportW / 2 - gap * 1.5, height: availH };
    case "right":
      return { x: viewportW / 2 + gap * 0.5, y: menuBarH + gap, width: viewportW / 2 - gap * 1.5, height: availH };
    case "top":
      return { x: gap, y: menuBarH + gap, width: viewportW - gap * 2, height: availH };
  }
}
