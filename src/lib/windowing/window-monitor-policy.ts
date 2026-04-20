// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Monitor Policy
// Multi-monitor placement, off-screen recovery, detach handling.
// ═══════════════════════════════════════════════════════════════

import type { WindowPlacement } from "@/packages/window-contracts";

export interface MonitorInfo {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dpiScale: number;
  primary: boolean;
}

export function getSystemMonitors(): MonitorInfo[] {
  return [{
    id: "primary",
    x: 0, y: 0,
    width: window.innerWidth || 1920,
    height: window.innerHeight || 1080,
    dpiScale: window.devicePixelRatio || 1,
    primary: true,
  }];
}

export function resolveMonitorPlacement(
  placement: WindowPlacement,
  monitors: MonitorInfo[]
): WindowPlacement {
  const target = monitors.find(m => m.id === placement.monitorId) ?? monitors.find(m => m.primary) ?? monitors[0];
  if (!target) return placement;
  return { ...placement, monitorId: target.id };
}

export function recoverOffScreen(
  placement: WindowPlacement,
  viewport: { width: number; height: number }
): WindowPlacement {
  let { x, y, width, height } = placement;
  const MARGIN = 32;
  if (x + width < MARGIN) x = MARGIN;
  if (y < 0) y = 0;
  if (x > viewport.width - MARGIN) x = viewport.width - width;
  if (y > viewport.height - MARGIN) y = viewport.height - height;
  return { ...placement, x, y };
}

export function handleMonitorDetach(
  detachedMonitorId: string,
  windows: { windowId: string; placement: WindowPlacement }[],
  fallbackMonitor: MonitorInfo
): { windowId: string; placement: WindowPlacement }[] {
  return windows.map(w => {
    if (w.placement.monitorId !== detachedMonitorId) return w;
    return {
      ...w,
      placement: {
        ...w.placement,
        monitorId: fallbackMonitor.id,
        x: Math.min(w.placement.x, fallbackMonitor.width - w.placement.width),
        y: Math.min(w.placement.y, fallbackMonitor.height - w.placement.height),
      },
    };
  });
}

export function getSafePlacement(
  size: { width: number; height: number },
  monitors: MonitorInfo[]
): WindowPlacement {
  const primary = monitors.find(m => m.primary) ?? monitors[0];
  const pw = primary?.width ?? 1920;
  const ph = primary?.height ?? 1080;
  return {
    x: Math.max(0, Math.floor((pw - size.width) / 2)),
    y: Math.max(0, Math.floor((ph - size.height) / 2)),
    width: size.width,
    height: size.height,
    monitorId: primary?.id ?? "primary",
    workspaceId: "default",
    dpiScale: primary?.dpiScale ?? 1,
  };
}