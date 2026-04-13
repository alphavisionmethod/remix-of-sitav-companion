// ═══════════════════════════════════════════════════════════════
// SITA OS — Living Desktop Surface
// Clean macOS-style desktop: wallpaper, clock, window compositor
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useWindowManagerContext } from "@/contexts/WindowManagerContext";
import { FloatingWindow } from "./FloatingWindow";
import { ShellAmbientBackground } from "./ShellAmbientBackground";

function DesktopClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  const date = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <h1 className="text-7xl font-extralight tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
        {time}
      </h1>
      <p className="text-lg font-medium text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
        {date}
      </p>
    </div>
  );
}

export function DesktopSurface({ onOpenCommand }: { onOpenCommand?: () => void }) {
  const windowManager = useWindowManagerContext();
  const visibleWindows = windowManager?.visibleWindows ?? [];
  const hasWindows = visibleWindows.length > 0;
  const maxZ = visibleWindows.reduce((max, w) => Math.max(max, w.zIndex), 0);

  return (
    <div
      className="fixed inset-0"
      onDoubleClick={() => onOpenCommand?.()}
    >
      {/* 1. macOS Style Ambient Living Wallpaper */}
      <div className="absolute inset-0 z-0">
        <ShellAmbientBackground intensity="subtle" className="fixed" />
      </div>

      {/* 2. Desktop Elements (Fades and blurs when Apps are open) */}
      <div className={cn(
        "absolute inset-0 z-10 flex items-center justify-center transition-all duration-700",
        hasWindows && "opacity-30 blur-sm"
      )}>
        <DesktopClock />
      </div>

      {/* 3. Window Compositor Layer */}
      <div className="absolute inset-0 z-20">
        <AnimatePresence>
          {visibleWindows.map((w, index) => {
            const spawnOffset = index * 30;
            const cascadedPosition = w.position || { x: 100 + spawnOffset, y: 80 + spawnOffset };

            return (
              <FloatingWindow
                key={w.id}
                windowId={w.id}
                title={w.title}
                initialPosition={cascadedPosition}
                width={w.width}
                originRect={w.originRect}
                onClose={() => windowManager?.closeWindow(w.id)}
                onMinimize={() => windowManager?.minimizeWindow(w.id)}
                onFocus={() => windowManager?.focusWindow(w.id)}
                isFocused={w.zIndex === maxZ}
                style={{ zIndex: 100 + w.zIndex }}
              >
                {w.component}
              </FloatingWindow>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
