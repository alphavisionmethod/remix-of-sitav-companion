import React from "react";
import { AnimatePresence } from "framer-motion";
import { useOSWindowContext } from "./WindowContext";
import { AppWindow } from "./AppWindow";

// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Compositor
// Renders all non-minimized OS windows in a full-screen overlay layer
// ═══════════════════════════════════════════════════════════════

export function WindowCompositor() {
  const { openWindows } = useOSWindowContext();

  const visibleWindows = openWindows.filter((w) => !w.isMinimized);

  if (visibleWindows.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      <AnimatePresence mode="popLayout">
        {visibleWindows.map((win) => (
          <AppWindow key={win.id} window={win} />
        ))}
      </AnimatePresence>
    </div>
  );
}
