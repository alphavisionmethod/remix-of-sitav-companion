// ═══════════════════════════════════════════════════════════════
// SITA OS — Living Desktop Surface
// Premium macOS-style desktop: wallpaper, clock, icons, continuity
// Dual compositor: legacy FloatingWindow + new OS Window Engine
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useWindowManagerContext } from "@/contexts/WindowManagerContext";
import { FloatingWindow } from "./FloatingWindow";
import { ShellAmbientBackground } from "./ShellAmbientBackground";
import { DesktopIconGrid } from "./DesktopIconGrid";
import { ContinuitySurface } from "./ContinuitySurface";
import { WindowCompositor } from "@/components/sita/os/WindowCompositor";
import { useOSWindowContext } from "@/components/sita/os/WindowContext";
import type { ContinuityContext, DesktopState } from "./useShellState";

// ── Desktop Clock ────────────────────────────────────────────
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
      <h1 className="text-7xl font-extralight tracking-tight text-[hsl(0_0%_100%)] drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
        {time}
      </h1>
      <p className="text-lg font-medium text-[hsl(0_0%_100%/0.8)] drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
        {date}
      </p>
    </div>
  );
}

// ── State-aware greeting overlay ─────────────────────────────
function ArrivalGreeting({ desktopState }: { desktopState: DesktopState }) {
  const [visible, setVisible] = useState(desktopState === "first_arrival");

  useEffect(() => {
    if (desktopState === "first_arrival") {
      const t = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(t);
    }
  }, [desktopState]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10"
    >
      <p className="text-sm font-medium text-[hsl(0_0%_100%/0.6)] tracking-wide">
        Welcome to SITA
      </p>
    </motion.div>
  );
}

// ── Props ────────────────────────────────────────────────────
interface DesktopSurfaceProps {
  onOpenCommand?: () => void;
  desktopState?: DesktopState;
  continuity?: ContinuityContext;
}

const DEFAULT_CONTINUITY: ContinuityContext = {
  lastWorkspace: null,
  lastActivity: null,
  pendingDrafts: 0,
  unfinishedWorkflows: 0,
  whatChanged: [],
};

// ── Desktop Surface ──────────────────────────────────────────
export function DesktopSurface({
  onOpenCommand,
  desktopState = "quiet",
  continuity = DEFAULT_CONTINUITY,
}: DesktopSurfaceProps) {
  const windowManager = useWindowManagerContext();
  const visibleWindows = windowManager?.visibleWindows ?? [];
  const maxZ = visibleWindows.reduce((max, w) => Math.max(max, w.zIndex), 0);

  // New OS Window Engine
  const { openWindows } = useOSWindowContext();
  const hasAnyWindows = visibleWindows.length > 0 || openWindows.some(w => !w.isMinimized);

  // Ambient intensity based on desktop state
  const ambientIntensity = desktopState === "offline" ? "subtle" as const : "subtle" as const;

  return (
    <div
      className="fixed inset-0"
      onDoubleClick={() => onOpenCommand?.()}
    >
      {/* Layer 1: macOS Style Ambient Living Wallpaper */}
      <div className="absolute inset-0 z-0">
        <ShellAmbientBackground intensity={ambientIntensity} className="fixed" />
      </div>

      {/* Layer 2: Desktop Content — fades when windows open */}
      <div className={cn(
        "absolute inset-0 z-10 transition-all duration-700",
        hasAnyWindows && "opacity-30 blur-sm pointer-events-none"
      )}>
        {/* Centered clock */}
        <div className="absolute inset-0 flex items-center justify-center">
          <DesktopClock />
        </div>

        {/* Right-aligned desktop icons */}
        <DesktopIconGrid visible={!hasAnyWindows} />

        {/* Bottom-left continuity widget */}
        <ContinuitySurface
          continuity={continuity}
          desktopState={desktopState}
          hasWindows={hasAnyWindows}
        />

        {/* First arrival greeting */}
        <AnimatePresence>
          <ArrivalGreeting desktopState={desktopState} />
        </AnimatePresence>
      </div>

      {/* Layer 3: Legacy Window Compositor (FloatingWindow) */}
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

      {/* Layer 4: New OS Window Engine Compositor */}
      <WindowCompositor />
    </div>
  );
}
