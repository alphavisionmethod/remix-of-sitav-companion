// ═══════════════════════════════════════════════════════════════
// SITA OS — Living Desktop Surface
// Clean OS desktop: wallpaper, clock, glass widgets, dock launcher
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback } from "react";
import { getWallpaperTheme } from "@/hooks/use-wallpaper";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  CheckCircle, DollarSign, Calendar, Brain,
  TrendingUp, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ShellAmbientBackground, type AmbientMood } from "./ShellAmbientBackground";
import type { TrustPosture, ContinuityContext, ShellNotificationDigest } from "./useShellState";

// ── Types ────────────────────────────────────────────────────

interface DesktopSurfaceProps {
  userName?: string;
  trustPosture?: TrustPosture;
  notifications?: ShellNotificationDigest;
  continuity?: ContinuityContext;
  onOpenCommand?: () => void;
}

// ── Time-of-day wallpaper gradients ──────────────────────────

function getTimeConfig(): { greeting: string; mood: AmbientMood; gradient: string } {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12)
    return {
      greeting: "Good morning",
      mood: "warm",
      gradient: "from-[hsl(35_80%_15%)] via-[hsl(25_60%_12%)] to-[hsl(265_30%_10%)]",
    };
  if (hour >= 12 && hour < 18)
    return {
      greeting: "Good afternoon",
      mood: "serene",
      gradient: "from-[hsl(220_40%_12%)] via-[hsl(265_35%_14%)] to-[hsl(200_30%_10%)]",
    };
  if (hour >= 18 && hour < 21)
    return {
      greeting: "Good evening",
      mood: "warm",
      gradient: "from-[hsl(280_40%_12%)] via-[hsl(320_30%_10%)] to-[hsl(240_35%_8%)]",
    };
  return {
    greeting: "Good night",
    mood: "night",
    gradient: "from-[hsl(240_40%_6%)] via-[hsl(260_35%_8%)] to-[hsl(220_30%_5%)]",
  };
}

// ── Clock Widget ─────────────────────────────────────────────

function DesktopClock({ greeting, userName }: { greeting: string; userName: string }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  const date = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className="text-center select-none"
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
    </motion.div>
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
}

function GlassWidget({ icon: Icon, label, value, accent, onClick, delay = 0 }: GlassWidgetProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-4 rounded-2xl px-6 py-5",
        "bg-[hsl(0_0%_100%/0.08)] backdrop-blur-xl border border-[hsl(0_0%_100%/0.1)]",
        "hover:bg-[hsl(0_0%_100%/0.14)] hover:border-[hsl(0_0%_100%/0.2)]",
        "transition-all duration-300 cursor-pointer shadow-lg shadow-black/10",
        "min-w-[200px]"
      )}
    >
      <div className={cn("rounded-xl p-2.5", accent || "bg-[hsl(265_55%_58%/0.2)]")}>
        <Icon className="h-5 w-5 text-[hsl(0_0%_100%/0.9)]" />
      </div>
      <div className="text-left">
        <p className="text-lg font-semibold text-[hsl(0_0%_100%/0.9)] leading-tight">{value}</p>
        <p className="text-[11px] font-medium text-[hsl(0_0%_100%/0.5)] uppercase tracking-wider">{label}</p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-[hsl(0_0%_100%/0.2)] group-hover:text-[hsl(0_0%_100%/0.5)] transition-colors ml-auto" />
    </motion.button>
  );
}

// ── Advisor Insight Strip ────────────────────────────────────

function AdvisorInsight({ delay }: { delay: number }) {
  const insights = [
    "3 leads are cooling — re-engage before they go cold",
    "Insurance renewal due in 12 days — I've prepared options",
    "Revenue up 14% this week — your email campaign is working",
    "2 invoices overdue — I can send reminders now",
  ];
  const [idx] = useState(() => Math.floor(Math.random() * insights.length));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-5 py-3 max-w-lg mx-auto",
        "bg-[hsl(0_0%_100%/0.06)] backdrop-blur-xl border border-[hsl(0_0%_100%/0.08)]"
      )}
    >
      <Brain className="h-4 w-4 text-[hsl(265_55%_70%)] shrink-0" />
      <p className="text-xs text-[hsl(0_0%_100%/0.55)] leading-relaxed">{insights[idx]}</p>
    </motion.div>
  );
}

// ── Component ────────────────────────────────────────────────

export function DesktopSurface({
  userName,
  trustPosture = "secure",
  notifications = { total: 0, approvals: 0, urgent: 0, business: 0, finance: 0, household: 0, system: 0 },
  continuity = { lastWorkspace: null, lastActivity: null, pendingDrafts: 0, unfinishedWorkflows: 0, whatChanged: [] },
  onOpenCommand,
}: DesktopSurfaceProps) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { greeting, mood, gradient: timeGradient } = useMemo(getTimeConfig, []);
  const wallpaper = useMemo(getWallpaperTheme, []);
  const isAuto = wallpaper.id === "auto";
  const activeGradient = isAuto ? timeGradient : wallpaper.gradient;

  // Click on empty desktop background → open Spotlight
  const handleBackgroundClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only fire if clicking the background itself, not a widget/button
    if (e.target === e.currentTarget && onOpenCommand) {
      onOpenCommand();
    }
  }, [onOpenCommand]);

  return (
    <div
      className={cn(
        "fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br cursor-default",
        activeGradient
      )}
      onClick={handleBackgroundClick}
    >
      {/* Wallpaper overlay effect */}
      {wallpaper.overlay && (
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: wallpaper.overlay }}
        />
      )}
      {/* Ambient living background */}
      <ShellAmbientBackground mood={mood} intensity="vivid" className="z-0" />

      {/* Extra decorative orbs for depth */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[20%] w-[500px] h-[500px] rounded-full bg-[hsl(265_60%_50%/0.06)] blur-[120px]" />
        <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-[hsl(35_80%_50%/0.04)] blur-[100px]" />
        <div className="absolute top-[60%] left-[60%] w-[300px] h-[300px] rounded-full bg-[hsl(190_60%_50%/0.03)] blur-[80px]" />
      </div>

      {/* Main desktop content */}
      <div className="relative z-10 flex flex-col items-center gap-12 px-4 pb-28 pt-10" onClick={e => e.stopPropagation()}>
        {/* Clock + Greeting */}
        <DesktopClock greeting={greeting} userName={userName || ""} />

        {/* At-a-Glance Widgets */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <GlassWidget
            icon={CheckCircle}
            label="Approvals"
            value={`${notifications.approvals || 3} waiting`}
            accent="bg-[hsl(265_55%_58%/0.2)]"
            onClick={() => navigate("/approvals")}
            delay={0.3}
          />
          <GlassWidget
            icon={DollarSign}
            label="Cash Position"
            value="$42K liquid"
            accent="bg-[hsl(140_50%_45%/0.2)]"
            onClick={() => navigate("/money")}
            delay={0.4}
          />
          <GlassWidget
            icon={Calendar}
            label="Today"
            value="6 tasks · 2 meetings"
            accent="bg-[hsl(35_80%_55%/0.2)]"
            onClick={() => navigate("/concierge")}
            delay={0.5}
          />
          <GlassWidget
            icon={TrendingUp}
            label="Revenue"
            value="+14% this week"
            accent="bg-[hsl(190_60%_50%/0.2)]"
            onClick={() => navigate("/business")}
            delay={0.6}
          />
        </div>

        {/* Advisor Insight */}
        <AdvisorInsight delay={0.8} />
      </div>

      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 z-[2] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(0_0%_0%/0.3)_100%)]" />
    </div>
  );
}
