// ═══════════════════════════════════════════════════════════════
// SITA OS — Living Desktop Surface
// Clean OS desktop: wallpaper, clock, glass widgets, dock launcher
// Boot ceremony + soft focus + zero-clutter + context menu
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback } from "react";
import { getWallpaperTheme } from "@/hooks/use-wallpaper";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  CheckCircle, DollarSign, Calendar, Brain,
  TrendingUp, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ShellAmbientBackground, type AmbientMood } from "./ShellAmbientBackground";
import type { TrustPosture, ContinuityContext, ShellNotificationDigest } from "./useShellState";
import { DEPTH_LAYERS } from "@/lib/design-system/nova-os";
import { FloatingWindow } from "./FloatingWindow";
import { useWindowManagerContext } from "@/contexts/WindowManagerContext";
import { DesktopIconGrid } from "./DesktopIconGrid";
import { DesktopContextMenu } from "./DesktopContextMenu";
import { IntentSuggestion } from "./IntentSuggestion";

// ── Types ────────────────────────────────────────────────────

interface DesktopSurfaceProps {
  userName?: string;
  trustPosture?: TrustPosture;
  notifications?: ShellNotificationDigest;
  continuity?: ContinuityContext;
  onOpenCommand?: () => void;
  onLaunchApp?: (appId: string) => void;
}

// ── Desktop Notification Toasts (Calm — fade instead of slide) ─

function DesktopToasts({ notifications }: { notifications: ShellNotificationDigest }) {
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);

  useEffect(() => {
    const items: string[] = [];
    if (notifications.approvals > 0) items.push(`${notifications.approvals} approval(s) waiting`);
    if (notifications.urgent > 0) items.push(`${notifications.urgent} urgent notification(s)`);
    if (items.length === 0) items.push("All clear — no pending items");
    setToasts(items.map((text, i) => ({ id: i, text })));

    const timer = setTimeout(() => setToasts([]), 6000);
    return () => clearTimeout(timer);
  }, [notifications.approvals, notifications.urgent]);

  return (
    <div className="absolute top-14 right-4 w-72 space-y-2 pointer-events-none" style={{ zIndex: DEPTH_LAYERS.windows + 5 }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="p-3 rounded-xl bg-[hsl(0_0%_100%/0.60)] dark:bg-[hsl(0_0%_0%/0.50)] backdrop-blur-lg shadow-lg border border-[hsl(0_0%_100%/0.20)] dark:border-[hsl(0_0%_100%/0.08)] pointer-events-auto"
          >
            <p className="text-xs text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_85%)]">{t.text}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Time-of-day wallpaper gradients (with breathing variants) ─

function getTimeConfig(): { greeting: string; mood: AmbientMood; gradient: string; gradientAlt: string } {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12)
    return {
      greeting: "Good morning",
      mood: "warm",
      gradient: "from-[hsl(35_70%_22%)] via-[hsl(265_40%_20%)] to-[hsl(280_35%_18%)]",
      gradientAlt: "from-[hsl(40_72%_24%)] via-[hsl(270_42%_22%)] to-[hsl(285_37%_20%)]",
    };
  if (hour >= 12 && hour < 18)
    return {
      greeting: "Good afternoon",
      mood: "serene",
      gradient: "from-[hsl(220_40%_20%)] via-[hsl(265_40%_24%)] to-[hsl(200_35%_18%)]",
      gradientAlt: "from-[hsl(225_42%_22%)] via-[hsl(260_38%_22%)] to-[hsl(205_37%_20%)]",
    };
  if (hour >= 18 && hour < 21)
    return {
      greeting: "Good evening",
      mood: "warm",
      gradient: "from-[hsl(280_45%_20%)] via-[hsl(320_35%_18%)] to-[hsl(38_50%_18%)]",
      gradientAlt: "from-[hsl(285_47%_22%)] via-[hsl(325_37%_20%)] to-[hsl(33_48%_16%)]",
    };
  return {
    greeting: "Good night",
    mood: "night",
    gradient: "from-[hsl(240_40%_10%)] via-[hsl(265_38%_14%)] to-[hsl(220_35%_8%)]",
    gradientAlt: "from-[hsl(245_42%_12%)] via-[hsl(270_40%_16%)] to-[hsl(225_37%_10%)]",
  };
}

// ── Clock Widget ─────────────────────────────────────────────

function DesktopClock({ greeting, userName, bootReady }: { greeting: string; userName: string; bootReady: boolean }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  const date = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div
      className={cn(
        "text-center select-none transition-all duration-700 ease-out",
        bootReady ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-95"
      )}
    >
      <p className="text-7xl md:text-8xl font-extralight tracking-tight text-[hsl(0_0%_100%/0.9)] tabular-nums drop-shadow-lg">
        {time}
      </p>
      <p className="text-lg md:text-xl font-light text-[hsl(0_0%_100%/0.6)] mt-1 tracking-wide">
        {date}
      </p>
      <p className="text-sm font-medium text-[hsl(0_0%_100%/0.45)] mt-4 tracking-wider uppercase">
        {greeting}{userName ? `, ${userName}` : ""}
      </p>
    </div>
  );
}

// ── Glass Widget ─────────────────────────────────────────────

interface GlassWidgetProps {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: string;
  onClick?: () => void;
  delay?: number;
  bootReady?: boolean;
}

function GlassWidget({ icon: Icon, label, value, accent, onClick, delay = 0, bootReady = true }: GlassWidgetProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center gap-4 rounded-2xl px-6 py-5",
        "bg-[hsl(0_0%_100%/0.08)] backdrop-blur-2xl border border-[hsl(0_0%_100%/0.12)]",
        "hover:bg-[hsl(0_0%_100%/0.14)] hover:border-[hsl(0_0%_100%/0.22)]",
        "transition-all duration-500 cursor-pointer shadow-lg shadow-black/10",
        "min-w-[200px]",
        bootReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{ transitionDelay: bootReady ? `${delay}ms` : "0ms" }}
    >
      <div className={cn("rounded-xl p-2.5", accent || "bg-[hsl(265_55%_58%/0.2)]")}>
        <Icon className="h-5 w-5 text-[hsl(0_0%_100%/0.9)]" />
      </div>
      <div className="text-left">
        <p className="text-lg font-semibold text-[hsl(0_0%_100%/0.9)] leading-tight">{value}</p>
        <p className="text-[11px] font-medium text-[hsl(0_0%_100%/0.5)] uppercase tracking-wider">{label}</p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-[hsl(0_0%_100%/0.2)] group-hover:text-[hsl(0_0%_100%/0.5)] transition-colors ml-auto" />
    </button>
  );
}

// ── Advisor Insight Strip ────────────────────────────────────

function AdvisorInsight({ bootReady }: { bootReady: boolean }) {
  const insights = [
    "3 leads are cooling — re-engage before they go cold",
    "Insurance renewal due in 12 days — I've prepared options",
    "Revenue up 14% this week — your email campaign is working",
    "2 invoices overdue — I can send reminders now",
  ];
  const [idx] = useState(() => Math.floor(Math.random() * insights.length));

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl px-5 py-3 max-w-lg mx-auto",
        "bg-[hsl(0_0%_100%/0.06)] backdrop-blur-xl border border-[hsl(0_0%_100%/0.08)]",
        "transition-all duration-500",
        bootReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      )}
      style={{ transitionDelay: bootReady ? "200ms" : "0ms" }}
    >
      <Brain className="h-4 w-4 text-[hsl(265_55%_70%)] shrink-0" />
      <p className="text-xs text-[hsl(0_0%_100%/0.55)] leading-relaxed">{insights[idx]}</p>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────

export function DesktopSurface({
  userName,
  trustPosture = "secure",
  notifications = { total: 0, approvals: 0, urgent: 0, business: 0, finance: 0, household: 0, system: 0 },
  continuity = { lastWorkspace: null, lastActivity: null, pendingDrafts: 0, unfinishedWorkflows: 0, whatChanged: [] },
  onOpenCommand,
  onLaunchApp,
}: DesktopSurfaceProps) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { greeting, mood, gradient: timeGradient, gradientAlt: timeGradientAlt } = useMemo(getTimeConfig, []);
  const wallpaper = useMemo(getWallpaperTheme, []);
  const isAuto = wallpaper.id === "auto";
  const activeGradient = isAuto ? timeGradient : wallpaper.gradient;
  const activeGradientAlt = isAuto ? timeGradientAlt : wallpaper.gradient;

  // ── Living Wallpaper — breathing gradient ──────────────────
  const [wallpaperPhase, setWallpaperPhase] = useState(false);
  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(() => setWallpaperPhase(p => !p), 30_000);
    return () => clearInterval(interval);
  }, [reduced]);

  // ── Boot Ceremony ──────────────────────────────────────────
  const [bootPhase, setBootPhase] = useState(0);
  useEffect(() => {
    if (reduced) { setBootPhase(4); return; }
    const timers = [
      setTimeout(() => setBootPhase(1), 100),   // wallpaper
      setTimeout(() => setBootPhase(2), 500),   // clock + widgets
      setTimeout(() => setBootPhase(3), 900),   // icons
      setTimeout(() => setBootPhase(4), 1200),  // settled
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduced]);

  // ── Context Menu ───────────────────────────────────────────
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);

  // ── Window Manager ─────────────────────────────────────────
  const windowManager = useWindowManagerContext();
  const visibleWindows = windowManager?.visibleWindows ?? [];
  const closeWindow = windowManager?.closeWindow;
  const focusWindow = windowManager?.focusWindow;
  const minimizeWindow = windowManager?.minimizeWindow;

  // ── Soft Focus Mode ────────────────────────────────────────
  const hasWindows = visibleWindows.length > 0;
  const maxZ = visibleWindows.reduce((max, w) => Math.max(max, w.zIndex), 0);

  const handleBackgroundClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onOpenCommand) {
      onOpenCommand();
    }
  }, [onOpenCommand]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br cursor-default",
        wallpaperPhase ? activeGradientAlt : activeGradient
      )}
      style={{ transition: "background 8s ease" }}
      onClick={(e) => { handleBackgroundClick(e); setCtxMenu(null); }}
      onContextMenu={handleContextMenu}
    >
      {/* Boot black overlay — fades out in phase 1 */}
      <div
        className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-500 ease-out"
        style={{
          zIndex: 100,
          opacity: bootPhase >= 1 ? 0 : 1,
          pointerEvents: bootPhase >= 1 ? "none" : "auto",
        }}
      />

      {/* Wallpaper overlay effect */}
      {wallpaper.overlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: DEPTH_LAYERS.orbs, background: wallpaper.overlay }}
        />
      )}
      {/* Ambient living background */}
      <div style={{ zIndex: DEPTH_LAYERS.desktop }} className="absolute inset-0">
        <ShellAmbientBackground mood={mood} intensity="vivid" className="" />
      </div>

      {/* Decorative orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: DEPTH_LAYERS.orbs }}>
        <div className="absolute top-[15%] left-[20%] w-[500px] h-[500px] rounded-full bg-[hsl(265_60%_50%/0.06)] blur-[120px]" />
        <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-[hsl(35_80%_50%/0.04)] blur-[100px]" />
        <div className="absolute top-[60%] left-[60%] w-[300px] h-[300px] rounded-full bg-[hsl(190_60%_50%/0.03)] blur-[80px]" />
      </div>

      {/* Main desktop content — dims when windows are open (Soft Focus) */}
      <div
        className={cn(
          "relative flex flex-col items-center gap-12 px-4 pb-28 pt-12 transition-opacity duration-300",
          hasWindows ? "opacity-40" : "opacity-100"
        )}
        style={{ zIndex: DEPTH_LAYERS.content }}
        onClick={e => e.stopPropagation()}
      >
        {/* Clock */}
        <DesktopClock greeting={greeting} userName={userName || ""} bootReady={bootPhase >= 2} />

        {/* Widgets */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <GlassWidget
            icon={CheckCircle}
            label="Approvals"
            value={`${notifications.approvals || 3} waiting`}
            accent="bg-[hsl(265_55%_58%/0.2)]"
            onClick={() => navigate("/approvals")}
            bootReady={bootPhase >= 2}
            delay={0}
          />
          <GlassWidget
            icon={DollarSign}
            label="Cash Position"
            value="$42K liquid"
            accent="bg-[hsl(140_50%_45%/0.2)]"
            onClick={() => navigate("/money")}
            bootReady={bootPhase >= 2}
            delay={80}
          />
          <GlassWidget
            icon={Calendar}
            label="Today"
            value="6 tasks · 2 meetings"
            accent="bg-[hsl(35_80%_55%/0.2)]"
            onClick={() => navigate("/concierge")}
            bootReady={bootPhase >= 2}
            delay={160}
          />
          <GlassWidget
            icon={TrendingUp}
            label="Revenue"
            value="+14% this week"
            accent="bg-[hsl(190_60%_50%/0.2)]"
            onClick={() => navigate("/business")}
            bootReady={bootPhase >= 2}
            delay={240}
          />
        </div>

        {/* Advisor Insight */}
        <AdvisorInsight bootReady={bootPhase >= 2} />

        {/* Intent-Aware Suggestion */}
        <IntentSuggestion
          continuity={continuity}
          notifications={notifications}
          visible={bootPhase >= 4 && !hasWindows}
          onAction={(action) => {
            if (action === "approvals") navigate("/approvals");
            else if (action === "agenda") navigate("/concierge");
            else if (action === "summary") navigate("/mission");
            else onOpenCommand?.();
          }}
        />
      </div>

      {/* Desktop Icon Grid — dims with soft focus too */}
      <div
        className={cn(
          "transition-opacity duration-300",
          hasWindows ? "opacity-40" : "opacity-100"
        )}
      >
        <DesktopIconGrid
          visible={bootPhase >= 3}
          onOpenFolder={(id) => onLaunchApp?.(id)}
        />
      </div>

      {/* Notification toasts */}
      <DesktopToasts notifications={notifications} />

      {/* Floating windows with focus differentiation */}
      <AnimatePresence>
        {visibleWindows.map(w => (
          <FloatingWindow
            key={w.id}
            title={w.title}
            initialPosition={w.position}
            width={w.width}
            onClose={() => closeWindow?.(w.id)}
            onMinimize={() => minimizeWindow?.(w.id)}
            onFocus={() => focusWindow?.(w.id)}
            isFocused={w.zIndex === maxZ}
            className="cursor-default"
            style={{ zIndex: DEPTH_LAYERS.windows + w.zIndex }}
          >
            {w.component}
          </FloatingWindow>
        ))}
      </AnimatePresence>

      {/* Desktop Context Menu */}
      <AnimatePresence>
        {ctxMenu && (
          <DesktopContextMenu
            x={ctxMenu.x}
            y={ctxMenu.y}
            onClose={() => setCtxMenu(null)}
          />
        )}
      </AnimatePresence>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: DEPTH_LAYERS.vignette,
          background: "radial-gradient(ellipse at center, transparent 40%, hsl(0 0% 0% / 0.3) 100%)",
          boxShadow: "inset 0 0 120px hsl(0 0% 0% / 0.15)",
        }}
      />
    </div>
  );
}
