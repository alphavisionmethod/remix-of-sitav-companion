// ═══════════════════════════════════════════════════════════════
// SITA OS — Window DPI Policy
// DPI scaling normalization and high-DPI rendering decisions.
// ═══════════════════════════════════════════════════════════════

import type { WindowPlacement } from "@/packages/window-contracts";

export function normalizePlacement(
  placement: WindowPlacement,
  fromDPI: number,
  toDPI: number
): WindowPlacement {
  if (fromDPI === toDPI || fromDPI === 0) return placement;
  const ratio = toDPI / fromDPI;
  return {
    ...placement,
    x: Math.round(placement.x * ratio),
    y: Math.round(placement.y * ratio),
    width: Math.round(placement.width * ratio),
    height: Math.round(placement.height * ratio),
    dpiScale: toDPI,
  };
}

export function getEffectiveDPI(): number {
  return typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;
}

export function shouldUseHighDPIRendering(): boolean {
  return getEffectiveDPI() > 1;
}

export function getMinMaxBounds(
  minWidth: number, minHeight: number,
  maxWidth: number, maxHeight: number,
  dpi: number
): { minWidth: number; minHeight: number; maxWidth: number; maxHeight: number } {
  return {
    minWidth: Math.round(minWidth / dpi),
    minHeight: Math.round(minHeight / dpi),
    maxWidth: Math.round(maxWidth / dpi),
    maxHeight: Math.round(maxHeight / dpi),
  };
}