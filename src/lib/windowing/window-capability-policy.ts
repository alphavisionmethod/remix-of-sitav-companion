// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Capability Policy
// Per-window permission boundaries: which windows can IPC to which.
// ═══════════════════════════════════════════════════════════════

import { getWindowEntry, type WindowRegistryEntry } from "./window-registry";

export type IPCPermission = "allowed" | "denied" | "ask";

/**
 * Check whether window A can send IPC messages to window B.
 * Returns "allowed" if they share an IPC group, "denied" otherwise.
 */
export function checkIPCPermission(sourceWindowId: string, targetWindowId: string): IPCPermission {
  if (sourceWindowId === targetWindowId) return "allowed";
  
  const source = getWindowEntry(sourceWindowId);
  const target = getWindowEntry(targetWindowId);
  
  if (!source || !target) return "denied";
  
  // System group can communicate with anything
  if (source.allowedIPCGroups.includes("system")) return "allowed";
  if (target.allowedIPCGroups.includes("system")) return "allowed";
  
  // Check for shared IPC group
  const shared = source.allowedIPCGroups.some((g) =>
    target.allowedIPCGroups.includes(g)
  );
  
  return shared ? "allowed" : "denied";
}

/**
 * Get all windows that a given window is allowed to communicate with.
 */
export function getAllowedTargets(sourceWindowId: string): string[] {
  const source = getWindowEntry(sourceWindowId);
  if (!source) return [];
  
  // Import lazily to avoid circular deps
  const { WINDOW_REGISTRY } = require("./window-registry");
  
  return (WINDOW_REGISTRY as WindowRegistryEntry[])
    .filter((w) => w.windowId !== sourceWindowId)
    .filter((w) => checkIPCPermission(sourceWindowId, w.windowId) === "allowed")
    .map((w) => w.windowId);
}

/**
 * Validate that a window action is permitted for its trust level.
 */
export function canWindowPerformAction(
  windowId: string,
  action: "minimize" | "maximize" | "close" | "resize" | "move" | "always-on-top"
): boolean {
  const entry = getWindowEntry(windowId);
  if (!entry) return false;
  
  switch (action) {
    case "minimize": return entry.minimizable;
    case "maximize": return entry.maximizable;
    case "resize": return entry.resizable;
    case "close": return true; // all windows can close
    case "move": return true;
    case "always-on-top": return true;
    default: return false;
  }
}