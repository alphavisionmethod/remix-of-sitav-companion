// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Layout Engine
// Cascade, tile, stack, and safe-start positioning.
// ═══════════════════════════════════════════════════════════════

import type { WindowPlacement } from "@/packages/window-contracts";

const CASCADE_OFFSET = 30;

export function cascadePosition(
  existingWindows: WindowPlacement[],
  newSize: { width: number; height: number }
): WindowPlacement {
  const offset = (existingWindows.length % 10) * CASCADE_OFFSET;
  return {
    x: 50 + offset,
    y: 50 + offset,
    width: newSize.width,
    height: newSize.height,
  };
}

export function tileWindows(
  windows: { windowId: string }[],
  viewport: { width: number; height: number }
): { windowId: string; placement: WindowPlacement }[] {
  const count = windows.length;
  if (count === 0) return [];
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const tileW = Math.floor(viewport.width / cols);
  const tileH = Math.floor(viewport.height / rows);

  return windows.map((w, i) => ({
    windowId: w.windowId,
    placement: {
      x: (i % cols) * tileW,
      y: Math.floor(i / cols) * tileH,
      width: tileW,
      height: tileH,
    },
  }));
}

export function stackWindows(
  windows: { windowId: string }[],
  viewport: { width: number; height: number }
): { windowId: string; placement: WindowPlacement }[] {
  const height = Math.floor(viewport.height / Math.max(windows.length, 1));
  return windows.map((w, i) => ({
    windowId: w.windowId,
    placement: { x: 0, y: i * height, width: viewport.width, height },
  }));
}

export function computeSafeStartPosition(
  size: { width: number; height: number },
  viewport: { width: number; height: number },
  existingWindows: WindowPlacement[]
): WindowPlacement {
  // Try centered first
  const cx = Math.floor((viewport.width - size.width) / 2);
  const cy = Math.floor((viewport.height - size.height) / 2);
  const candidate: WindowPlacement = { x: cx, y: cy, width: size.width, height: size.height };

  // Check overlap with existing
  const overlaps = existingWindows.some(w =>
    Math.abs(w.x - candidate.x) < 40 && Math.abs(w.y - candidate.y) < 40
  );

  if (!overlaps) return candidate;
  return cascadePosition(existingWindows, size);
}