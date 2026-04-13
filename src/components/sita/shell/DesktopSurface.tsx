// ═══════════════════════════════════════════════════════════════
// SITA OS — Living Desktop Surface
// Premium desktop: ambient wallpaper, widget grid, dual compositor
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useWindowManagerContext } from "@/contexts/WindowManagerContext";
import { FloatingWindow } from "./FloatingWindow";
import { ShellAmbientBackground } from "./ShellAmbientBackground";
import { WindowCompositor } from "@/components/sita/os/WindowCompositor";
import { useOSWindowContext } from "@/components/sita/os/WindowContext";
import {
  DesktopContinuityPanel,
  DesktopClockWidget,
  DesktopNotificationsWidget,
  DesktopWhatMattersWidget,
  DesktopQuickActionsWidget,
  DesktopSystemWidget,
  DesktopLeftRail,
  DesktopNotificationCenter,
} from "./desktop";
import { Sparkles, Search, ShieldCheck, Wifi, BatteryFull, Bell, Presentation } from "lucide-react";
import type { ContinuityContext, DesktopState } from "./useShellState";

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

// ── Greeting helper ──────────────────────────────────────────
function useGreeting() {
  return useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return "Good night";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);
}

// ── Desktop Surface ──────────────────────────────────────────
export function DesktopSurface({
  onOpenCommand,
  desktopState = "quiet",
  continuity = DEFAULT_CONTINUITY,
}: DesktopSurfaceProps) {
  const navigate = useNavigate();
  const greeting = useGreeting();
  const [showNotifications, setShowNotifications] = useState(false);

  // Legacy window manager
  const windowManager = useWindowManagerContext();
  const visibleWindows = windowManager?.visibleWindows ?? [];
  const maxZ = visibleWindows.reduce((max, w) => Math.max(max, w.zIndex), 0);

  // OS Window Engine
  const { openWindows } = useOSWindowContext();
  const hasAnyWindows = visibleWindows.length > 0 || openWindows.some(w => !w.isMinimized);

  return (
    <div className="fixed inset-0" onDoubleClick={() => onOpenCommand?.()}>
      {/* Layer 1: Ambient Wallpaper */}
      <div className="absolute inset-0 z-0">
        <ShellAmbientBackground intensity="subtle" className="fixed" />
        {/* Extra dot-grid texture */}
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:22px_22px]" />
        {/* Edge gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_20%,transparent_80%,rgba(255,255,255,0.03))]" />
      </div>

      {/* Layer 2: Desktop Content — fades when windows open */}
      <div className={cn(
        "absolute inset-0 z-10 transition-all duration-700 overflow-y-auto",
        hasAnyWindows && "opacity-30 blur-sm pointer-events-none"
      )}>
        {/* Top bar */}
        <div className="relative z-20 flex h-14 items-center justify-between border-b border-white/[0.08] bg-white/[0.06] px-5 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[0_8px_24px_rgba(114,92,255,0.35)]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-white">SITA OS</div>
              <div className="text-[11px] text-white/55">Calm operating environment</div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={() => onOpenCommand?.()}
              className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-2 text-sm text-white/80 backdrop-blur-xl transition hover:bg-white/[0.12]"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Command</span>
                <span className="rounded-md border border-white/10 bg-white/[0.08] px-1.5 py-0.5 text-[10px] text-white/60">⌘K</span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-2 md:flex">
              <ShieldCheck className="h-4 w-4 text-cyan-300" />
              <span className="text-white/80">Trusted</span>
            </div>
            <div className="hidden items-center gap-2 text-white/70 md:flex">
              <Wifi className="h-4 w-4" />
              <BatteryFull className="h-4 w-4" />
            </div>
            <button
              onClick={() => setShowNotifications(v => !v)}
              className="relative rounded-2xl border border-white/10 bg-white/[0.08] p-2.5 transition hover:bg-white/[0.12]"
            >
              <Bell className="h-4 w-4 text-white" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-violet-400" />
            </button>
          </div>
        </div>

        {/* Main content area with rail */}
        <div className="relative z-10 mx-auto flex max-w-[1600px] gap-6 px-6 pb-36 pt-6">
          {/* Left rail */}
          <DesktopLeftRail />

          {/* Center content */}
          <div className="min-w-0 flex-1">
            {/* Greeting header */}
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <div className="mb-2 text-[12px] uppercase tracking-[0.25em] text-white/45">Desktop</div>
                <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  {greeting}.
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65 md:text-base">
                  Your operating environment is ready. Business has follow-ups prepared,
                  Finance has one approval waiting, and Concierge updated your travel prep.
                </p>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <button
                  onClick={() => navigate("/boardroom")}
                  className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2.5 text-sm text-white/85 backdrop-blur-xl transition hover:bg-white/[0.12]"
                >
                  Open Boardroom
                </button>
                <button className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_12px_28px_rgba(124,92,255,0.35)] transition hover:scale-[1.02]">
                  What Matters Now
                </button>
              </div>
            </div>

            {/* Top widget row */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.95fr_0.95fr]">
              <DesktopContinuityPanel continuity={continuity} desktopState={desktopState} />
              <DesktopClockWidget />
              <DesktopNotificationsWidget />
            </div>

            {/* Lower widget row */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <DesktopWhatMattersWidget />
              <DesktopQuickActionsWidget onOpenCommand={onOpenCommand} />
              <DesktopSystemWidget />
            </div>
          </div>

          {/* Right notification center */}
          <DesktopNotificationCenter visible={showNotifications} />
        </div>
      </div>

      {/* Layer 3: Legacy Window Compositor */}
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

      {/* Layer 4: OS Window Engine */}
      <WindowCompositor />
    </div>
  );
}
