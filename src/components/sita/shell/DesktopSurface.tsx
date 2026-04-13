// ═══════════════════════════════════════════════════════════════
// SITA OS — Stunning Desktop Surface
// Centered logo + bottom-left clock + right widget panel
// Inspired by KDE, Deepin, Garuda aesthetics
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useWindowManagerContext } from "@/contexts/WindowManagerContext";
import { FloatingWindow } from "./FloatingWindow";
import { ShellAmbientBackground } from "./ShellAmbientBackground";
import { WindowCompositor } from "@/components/sita/os/WindowCompositor";
import { useOSWindowContext } from "@/components/sita/os/WindowContext";
import {
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

// ── Large Bottom-Left Clock ──────────────────────────────────
function DesktopBigClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const h = now.getHours();
  const h12 = h % 12 || 12;
  const mm = now.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const blink = now.getSeconds() % 2 === 0;
  const dateLine = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="select-none">
      <div className="flex items-baseline gap-1">
        <span className="text-7xl font-extralight tracking-tight text-white tabular-nums drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
          {h12}
        </span>
        <span
          className={cn(
            "text-7xl font-extralight text-white/80 transition-opacity duration-500",
            blink ? "opacity-100" : "opacity-20"
          )}
        >
          :
        </span>
        <span className="text-7xl font-extralight tracking-tight text-white tabular-nums drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
          {mm}
        </span>
        <span className="ml-2 text-xl font-light text-white/40">{ampm}</span>
      </div>
      <div className="mt-2 text-lg font-light text-white/55 tracking-wide drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        {dateLine}
      </div>
    </div>
  );
}

// ── Compact Continuity Card ──────────────────────────────────
function ContinuityCard({ continuity, desktopState }: { continuity: ContinuityContext; desktopState: DesktopState }) {
  const navigate = useNavigate();
  const pending = continuity.pendingDrafts + continuity.unfinishedWorkflows;
  const resumeLabel = continuity.lastWorkspace ? `Resume ${continuity.lastWorkspace}` : "Workspace ready";

  return (
    <div className="rounded-2xl border border-white/[0.1] bg-white/[0.06] backdrop-blur-2xl overflow-hidden">
      <div className="h-[2px] bg-gradient-to-r from-violet-500/60 via-fuchsia-500/40 to-cyan-400/30" />
      <div className="p-4">
        <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 mb-2">Continuity</div>
        <h3 className="text-sm font-semibold text-white">{resumeLabel}</h3>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => navigate(continuity.lastWorkspace ? `/${continuity.lastWorkspace.toLowerCase()}` : "/business")}
            className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm transition hover:bg-white hover:scale-[1.02]"
          >
            Continue
          </button>
          {pending > 0 && <span className="text-[11px] text-white/45">{pending} pending</span>}
        </div>
      </div>
    </div>
  );
}

export function DesktopSurface({
  onOpenCommand,
  desktopState = "quiet",
  continuity = DEFAULT_CONTINUITY,
}: DesktopSurfaceProps) {
  const navigate = useNavigate();

  // Legacy window manager
  const windowManager = useWindowManagerContext();
  const visibleWindows = windowManager?.visibleWindows ?? [];
  const maxZ = visibleWindows.reduce((max, w) => Math.max(max, w.zIndex), 0);

  // OS Window Engine
  const { openWindows } = useOSWindowContext();
  const hasAnyWindows = visibleWindows.length > 0 || openWindows.some(w => !w.isMinimized);

  return (
    <div className="fixed inset-0" onDoubleClick={() => onOpenCommand?.()}>
      {/* Layer 0: Deep gradient base */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[hsl(265,45%,12%)] via-[hsl(280,35%,8%)] to-[hsl(220,40%,6%)]" />

      {/* Layer 1: Ambient Wallpaper */}
      <div className="absolute inset-0 z-[1]">
        <ShellAmbientBackground intensity="vivid" className="fixed" />
      </div>

      {/* Layer 2: Desktop Content */}
      <div className={cn(
        "absolute inset-0 z-10 transition-all duration-700",
        hasAnyWindows && "opacity-30 blur-sm pointer-events-none"
      )}>
        {/* ── Center Logo + Tagline ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none select-none z-10"
        >
          {/* Logo with halo glow */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-violet-500/20 blur-[40px] scale-150" />
            <img
              src={logo}
              alt="SITA"
              className="relative h-20 w-20 rounded-2xl shadow-2xl drop-shadow-[0_0_40px_rgba(114,92,255,0.4)]"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-5 text-center"
          >
            <div className="text-lg tracking-[0.2em] uppercase font-light text-white/45">
              SITA OS
            </div>
            <div className="mt-1 text-sm tracking-[0.12em] text-white/25">
              Your sovereign operating environment
            </div>
          </motion.div>
        </motion.div>

        {/* ── Bottom-Left Large Clock ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-12 bottom-24 z-10 pointer-events-none hidden lg:block"
        >
          <DesktopBigClock />
        </motion.div>

        {/* ── Right Widget Panel ── */}
        <div className="absolute top-6 right-5 bottom-20 z-10 flex flex-col gap-3 w-[320px] overflow-y-auto scrollbar-none pointer-events-auto">
          {/* App Grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <DesktopQuickActionsWidget onOpenCommand={onOpenCommand} />
          </motion.div>

          {/* System Toggles */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <DesktopSystemWidget />
          </motion.div>

          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <DesktopClockWidget />
          </motion.div>

          {/* Business Pulse */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <DesktopNotificationsWidget />
          </motion.div>

          {/* Continuity */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <ContinuityCard continuity={continuity} desktopState={desktopState} />
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
