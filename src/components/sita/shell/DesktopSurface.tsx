// ═══════════════════════════════════════════════════════════════
// SITA OS — macOS-Style Desktop Surface
// Clean wallpaper with right-aligned widget stack
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  DesktopQuickActionsWidget,
  DesktopSystemWidget,
} from "./desktop";
import type { ContinuityContext, DesktopState } from "./useShellState";
import logo from "@/assets/logo.webp";

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

function useGreeting() {
  return useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return "Good night";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);
}

export function DesktopSurface({
  onOpenCommand,
  desktopState = "quiet",
  continuity = DEFAULT_CONTINUITY,
}: DesktopSurfaceProps) {
  const navigate = useNavigate();
  const greeting = useGreeting();

  // Legacy window manager
  const windowManager = useWindowManagerContext();
  const visibleWindows = windowManager?.visibleWindows ?? [];
  const maxZ = visibleWindows.reduce((max, w) => Math.max(max, w.zIndex), 0);

  // OS Window Engine
  const { openWindows } = useOSWindowContext();
  const hasAnyWindows = visibleWindows.length > 0 || openWindows.some(w => !w.isMinimized);

  return (
    <div className="fixed inset-0" onDoubleClick={() => onOpenCommand?.()}>
      {/* Layer 1: Ambient Wallpaper — full screen, clean */}
      <div className="absolute inset-0 z-0">
        <ShellAmbientBackground intensity="vivid" className="fixed" />
      </div>

      {/* Layer 2: Desktop Content — widgets on right, greeting center-left */}
      <div className={cn(
        "absolute inset-0 z-10 transition-all duration-700",
        hasAnyWindows && "opacity-30 blur-sm pointer-events-none"
      )}>
        {/* Center-left greeting (like macOS keeps desktop mostly clean) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-12 bottom-32 z-10 max-w-md pointer-events-none select-none hidden lg:block"
        >
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="SITA" className="h-10 w-10 rounded-xl shadow-lg" />
            <div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-white/40 font-medium">SITA OS</div>
            </div>
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            {greeting}.
          </h1>
          <p className="mt-3 text-base text-white/60 leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.3)]">
            Your operating environment is ready.
          </p>
        </motion.div>

        {/* Right-side widget column — macOS Big Sur style */}
        <div className="absolute top-8 right-5 bottom-24 z-10 flex flex-col gap-4 w-[340px] overflow-y-auto scrollbar-none pointer-events-auto">
          {/* Calendar + Clock widget (compact) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <DesktopClockWidget />
          </motion.div>

          {/* Continuity / Resume widget */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <MacOSContinuityWidget continuity={continuity} desktopState={desktopState} />
          </motion.div>

          {/* Notifications widget */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <DesktopNotificationsWidget />
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <DesktopQuickActionsWidget onOpenCommand={onOpenCommand} />
          </motion.div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <DesktopSystemWidget />
          </motion.div>
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

// ── Compact Continuity Widget (macOS style) ──────────────────
function MacOSContinuityWidget({ continuity, desktopState }: { continuity: ContinuityContext; desktopState: DesktopState }) {
  const navigate = useNavigate();
  const pending = continuity.pendingDrafts + continuity.unfinishedWorkflows;
  const resumeLabel = continuity.lastWorkspace ? `Resume ${continuity.lastWorkspace}` : "Your workspace is ready";

  return (
    <div className="rounded-[20px] border border-white/[0.12] bg-white/[0.08] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">
      {/* Accent top edge */}
      <div className="h-[2px] bg-gradient-to-r from-violet-500/60 via-fuchsia-500/40 to-cyan-400/30" />
      <div className="p-5">
        <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/50 mb-3">
          Continuity
        </div>
        <h3 className="text-lg font-semibold text-white leading-snug">{resumeLabel}</h3>
        {continuity.whatChanged.length > 0 && (
          <p className="mt-2 text-sm text-white/55 leading-relaxed">
            {continuity.whatChanged.slice(0, 2).join(". ")}.
          </p>
        )}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => navigate(continuity.lastWorkspace ? `/${continuity.lastWorkspace.toLowerCase()}` : "/business")}
            className="rounded-xl bg-white/90 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-white hover:scale-[1.02]"
          >
            Continue
          </button>
          {pending > 0 && (
            <span className="text-xs text-white/50">{pending} pending</span>
          )}
        </div>
        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-black/20 p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-white/40">Active</div>
            <div className="mt-1 text-sm font-semibold text-white">{continuity.lastWorkspace ?? "Desktop"}</div>
          </div>
          <div className="rounded-xl bg-black/20 p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-white/40">Pending</div>
            <div className="mt-1 text-sm font-semibold text-white">{pending}</div>
          </div>
          <div className="rounded-xl bg-black/20 p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-white/40">Trust</div>
            <div className="mt-1 text-sm font-semibold text-cyan-300">Safe</div>
          </div>
        </div>
      </div>
    </div>
  );
}
