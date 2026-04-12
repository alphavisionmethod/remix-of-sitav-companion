// ═══════════════════════════════════════════════════════════════
// SITA OS — Living Desktop Surface
// Clean OS desktop: wallpaper, clock, glass widgets, dock launcher
// Boot ceremony + soft focus + zero-clutter + context menu
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback } from "react";
import { SoundEngine } from "@/lib/sound-engine";
import { getWallpaperTheme } from "@/hooks/use-wallpaper";
import { useWallpaperParallax } from "@/hooks/useWallpaperParallax";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAccentSync } from "@/hooks/use-accent-sync";
import {
  CheckCircle, DollarSign, Calendar, Brain,
  TrendingUp, ArrowRight, GripVertical,
  CloudSun, ListTodo, Battery, StickyNote, Clock,
  Briefcase, Heart, Plus, X, Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { ShellAmbientBackground, type AmbientMood } from "./ShellAmbientBackground";
import type { TrustPosture, ContinuityContext, ShellNotificationDigest } from "./useShellState";
import { DEPTH_LAYERS } from "@/lib/design-system/nova-os";
import { FloatingWindow, type SiblingWindow } from "./FloatingWindow";
import { useWindowManagerContext } from "@/contexts/WindowManagerContext";
import { DesktopIconGrid } from "./DesktopIconGrid";
import { DesktopContextMenu } from "./DesktopContextMenu";
import { IntentSuggestion } from "./IntentSuggestion";
import { useCalmEngine } from "@/contexts/CalmEngineContext";
import { lifecycleManager } from "@/lib/nova-sdk/runtime/lifecycle";
import { ProcessTable } from "@/lib/nova-sdk/kernel/process-manager";
import { Compositor } from "@/lib/nova-sdk/kernel/compositor";
import { WindowPerformanceMonitor } from "@/lib/nova-sdk/kernel/window-perf";

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
            className="flex overflow-hidden rounded-xl bg-[hsl(0_0%_100%/0.60)] dark:bg-[hsl(0_0%_0%/0.50)] backdrop-blur-lg shadow-lg border border-[hsl(0_0%_100%/0.20)] dark:border-[hsl(0_0%_100%/0.08)] pointer-events-auto"
          >
            {/* G5: Accent left edge */}
            <div className="w-[3px] bg-gradient-to-b from-[hsl(265_55%_58%)] to-[hsl(280_50%_50%)] shrink-0" />
            <div className="flex items-center gap-2.5 p-3">
              <span className="text-sm">🔔</span>
              <p className="text-xs text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_85%)]">{t.text}</p>
            </div>
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
    const id = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  const date = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
  const seconds = now.getSeconds();

  return (
    <div
      className={cn(
        "text-center select-none transition-all duration-700 ease-out",
        bootReady ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-95"
      )}
    >
      <div className="relative inline-block">
        <p className="text-7xl md:text-8xl font-extralight tracking-tight text-[hsl(0_0%_100%/0.9)] tabular-nums drop-shadow-lg">
          {time}
        </p>
        {/* W3: Analog second-hand sweep */}
        <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-8 h-8">
          <svg viewBox="0 0 32 32" className="w-full h-full">
            <circle cx="16" cy="16" r="14" fill="none" stroke="hsl(0 0% 100% / 0.1)" strokeWidth="1" />
            <line
              x1="16" y1="16" x2="16" y2="4"
              stroke="hsl(0 70% 55%)" strokeWidth="1" strokeLinecap="round"
              style={{ transform: `rotate(${seconds * 6}deg)`, transformOrigin: "16px 16px", transition: "transform 0.2s linear" }}
            />
            <circle cx="16" cy="16" r="1.5" fill="hsl(0 70% 55%)" />
          </svg>
        </div>
      </div>
      <p className="text-lg md:text-xl font-light text-[hsl(0_0%_100%/0.6)] mt-1 tracking-wide">
        {date}
      </p>
      <p className="text-sm font-medium text-[hsl(0_0%_100%/0.45)] mt-4 tracking-wider uppercase">
        {greeting}{userName ? `, ${userName}` : ""}
      </p>
    </div>
  );
}

// ── Sparkline SVG ────────────────────────────────────────────

function Sparkline({ data, color = "hsl(265 55% 65%)", width = 64, height = 24 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");

  const trend = data[data.length - 1] >= data[0];
  const gradientId = `spark-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0 overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {/* Fill area */}
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#${gradientId})`}
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {(() => {
        const lastX = width;
        const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2;
        return <circle cx={lastX} cy={lastY} r="2" fill={color} />;
      })()}
    </svg>
  );
}

// ── Simulated 7-day Sparkline Data ──────────────────────────

function useSparklineData() {
  const [data, setData] = useState(() => generateSparklines());
  useEffect(() => {
    const id = setInterval(() => {
      setData(prev => {
        const next: Record<string, number[]> = {};
        for (const key of Object.keys(prev)) {
          const cfg = ALL_WIDGET_CONFIGS[key];
          if (cfg) next[key] = driftSeries(prev[key], cfg.sparkRange[0], cfg.sparkRange[1]);
          else next[key] = prev[key];
        }
        return next;
      });
    }, 30_000);
    return () => clearInterval(id);
  }, []);
  return data;
}

function generateSparklines(): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const [id, cfg] of Object.entries(ALL_WIDGET_CONFIGS)) {
    result[id] = generateSeries(7, cfg.sparkRange[0], cfg.sparkRange[1]);
  }
  return result;
}

function generateSeries(count: number, min: number, max: number): number[] {
  const arr: number[] = [];
  let val = min + Math.random() * (max - min);
  for (let i = 0; i < count; i++) {
    val += (Math.random() - 0.45) * (max - min) * 0.2;
    val = Math.max(min, Math.min(max, val));
    arr.push(val);
  }
  return arr;
}

function driftSeries(prev: number[], min: number, max: number): number[] {
  const next = [...prev.slice(1)];
  let last = next[next.length - 1];
  last += (Math.random() - 0.45) * (max - min) * 0.15;
  last = Math.max(min, Math.min(max, last));
  next.push(last);
  return next;
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
  isDragging?: boolean;
  dragHandleProps?: Record<string, any>;
  sparkData?: number[];
  sparkColor?: string;
}

function GlassWidget({ icon: Icon, label, value, accent, onClick, delay = 0, bootReady = true, isDragging, dragHandleProps, sparkData, sparkColor }: GlassWidgetProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group widget-glow-hover flex items-center gap-4 rounded-2xl px-6 py-5 relative overflow-hidden",
        "bg-[hsl(0_0%_100%/0.08)] backdrop-blur-2xl border border-[hsl(0_0%_100%/0.12)]",
        "hover:bg-[hsl(0_0%_100%/0.14)] hover:border-[hsl(0_0%_100%/0.22)]",
        "hover:scale-[1.02] active:scale-[0.98]",
        "transition-all duration-[120ms] cursor-pointer",
        "shadow-[0_2px_8px_hsl(0_0%_0%/0.08),0_12px_28px_hsl(0_0%_0%/0.10)]",
        "hover:shadow-[0_2px_8px_hsl(0_0%_0%/0.10),0_16px_36px_hsl(0_0%_0%/0.14),inset_0_1px_0_hsl(0_0%_100%/0.12)]",
        "min-w-[200px]",
        bootReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        isDragging && "ring-2 ring-[hsl(265_55%_58%/0.6)] scale-105 shadow-[0_8px_32px_hsl(265_55%_58%/0.25)] z-50"
      )}
      style={{ transitionDelay: bootReady ? `${delay}ms` : "0ms" }}
    >
      {/* Background sparkline */}
      {sparkData && sparkData.length >= 2 && (
        <div className="absolute bottom-0 right-0 opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none">
          <Sparkline data={sparkData} color={sparkColor || "hsl(265 55% 65%)"} width={80} height={32} />
        </div>
      )}
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="flex items-center justify-center -ml-2 opacity-0 group-hover:opacity-60 transition-opacity cursor-grab active:cursor-grabbing"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5 text-[hsl(0_0%_100%/0.5)]" />
        </div>
      )}
      <div className={cn("rounded-xl p-2.5", accent || "bg-[hsl(265_55%_58%/0.2)]")}>
        <Icon className="h-5 w-5 text-[hsl(0_0%_100%/0.9)]" />
      </div>
      <div className="text-left relative z-10">
        <p className="text-lg font-semibold text-[hsl(0_0%_100%/0.9)] leading-tight">{value}</p>
        <p className="text-[11px] font-medium text-[hsl(0_0%_100%/0.5)] uppercase tracking-wider">{label}</p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-[hsl(0_0%_100%/0.2)] group-hover:text-[hsl(0_0%_100%/0.5)] transition-colors ml-auto relative z-10" />
    </button>
  );
}

// ── Widget Order Persistence ─────────────────────────────────

const WIDGET_ORDER_KEY = "sita-desktop-widget-order";
const DEFAULT_WIDGET_ORDER = ["approvals", "cash", "today", "revenue"];

function loadWidgetOrder(): string[] {
  try {
    const raw = localStorage.getItem(WIDGET_ORDER_KEY);
    if (!raw) return DEFAULT_WIDGET_ORDER;
    const parsed = JSON.parse(raw) as string[];
    // Validate all IDs exist in config
    const valid = parsed.filter(id => id in ALL_WIDGET_CONFIGS);
    return valid.length > 0 ? valid : DEFAULT_WIDGET_ORDER;
  } catch {
    return DEFAULT_WIDGET_ORDER;
  }
}

function saveWidgetOrder(order: string[]) {
  try { localStorage.setItem(WIDGET_ORDER_KEY, JSON.stringify(order)); } catch {}
}

// ── Widget Config Map ────────────────────────────────────────

interface WidgetConfig {
  icon: React.ElementType;
  label: string;
  getValue: (notifications: ShellNotificationDigest) => string;
  accent: string;
  route: string;
  sparkColor: string;
  sparkRange: [number, number];
  description: string;
}

const ALL_WIDGET_CONFIGS: Record<string, WidgetConfig> = {
  approvals: {
    icon: CheckCircle,
    label: "Approvals",
    getValue: (n) => `${n.approvals || 3} waiting`,
    accent: "bg-[hsl(265_55%_58%/0.2)]",
    route: "/approvals",
    sparkColor: "hsl(265 55% 65%)",
    sparkRange: [1, 8],
    description: "Pending approvals & decisions",
  },
  cash: {
    icon: DollarSign,
    label: "Cash Position",
    getValue: () => "$42K liquid",
    accent: "bg-[hsl(140_50%_45%/0.2)]",
    route: "/money",
    sparkColor: "hsl(140 50% 55%)",
    sparkRange: [35000, 50000],
    description: "Current cash & liquidity",
  },
  today: {
    icon: Calendar,
    label: "Today",
    getValue: () => "6 tasks · 2 meetings",
    accent: "bg-[hsl(35_80%_55%/0.2)]",
    route: "/concierge",
    sparkColor: "hsl(35 80% 60%)",
    sparkRange: [3, 12],
    description: "Today's agenda at a glance",
  },
  revenue: {
    icon: TrendingUp,
    label: "Revenue",
    getValue: () => "+14% this week",
    accent: "bg-[hsl(190_60%_50%/0.2)]",
    route: "/business",
    sparkColor: "hsl(190 60% 55%)",
    sparkRange: [-5, 25],
    description: "Weekly revenue trend",
  },
  weather: {
    icon: CloudSun,
    label: "Weather",
    getValue: () => "72°F · Sunny",
    accent: "bg-[hsl(200_70%_50%/0.2)]",
    route: "/concierge",
    sparkColor: "hsl(200 70% 60%)",
    sparkRange: [60, 85],
    description: "Current weather conditions",
  },
  tasks: {
    icon: ListTodo,
    label: "Tasks",
    getValue: () => "3 due today",
    accent: "bg-[hsl(330_60%_50%/0.2)]",
    route: "/concierge",
    sparkColor: "hsl(330 60% 55%)",
    sparkRange: [0, 10],
    description: "Active task tracker",
  },
  calendar: {
    icon: Clock,
    label: "Calendar",
    getValue: () => "Next: 2:30 PM",
    accent: "bg-[hsl(25_75%_50%/0.2)]",
    route: "/concierge",
    sparkColor: "hsl(25 75% 55%)",
    sparkRange: [1, 6],
    description: "Upcoming events & meetings",
  },
  battery: {
    icon: Battery,
    label: "Battery",
    getValue: () => "78% · 4h left",
    accent: "bg-[hsl(142_60%_45%/0.2)]",
    route: "/system-monitor",
    sparkColor: "hsl(142 60% 50%)",
    sparkRange: [20, 100],
    description: "System battery status",
  },
  notes: {
    icon: StickyNote,
    label: "Quick Notes",
    getValue: () => "2 pinned",
    accent: "bg-[hsl(50_80%_50%/0.2)]",
    route: "/concierge",
    sparkColor: "hsl(50 80% 55%)",
    sparkRange: [1, 8],
    description: "Pinned notes & reminders",
  },
  focus: {
    icon: Brain,
    label: "Focus",
    getValue: () => "2h 14m today",
    accent: "bg-[hsl(280_50%_55%/0.2)]",
    route: "/concierge",
    sparkColor: "hsl(280 50% 60%)",
    sparkRange: [0, 240],
    description: "Daily focus time tracker",
  },
  pipeline: {
    icon: Briefcase,
    label: "Pipeline",
    getValue: () => "12 active deals",
    accent: "bg-[hsl(210_55%_50%/0.2)]",
    route: "/business",
    sparkColor: "hsl(210 55% 55%)",
    sparkRange: [5, 20],
    description: "Business pipeline overview",
  },
  wellness: {
    icon: Heart,
    label: "Wellness",
    getValue: () => "Score: 82",
    accent: "bg-[hsl(350_65%_55%/0.2)]",
    route: "/concierge",
    sparkColor: "hsl(350 65% 60%)",
    sparkRange: [50, 100],
    description: "Daily wellness & energy score",
  },
};

// ── Widget Picker ────────────────────────────────────────────

function WidgetPicker({
  activeIds,
  onAdd,
  onRemove,
  onClose,
}: {
  activeIds: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const allIds = Object.keys(ALL_WIDGET_CONFIGS);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50",
        "w-[380px] max-h-[360px] overflow-y-auto",
        "rounded-2xl bg-[hsl(0_0%_0%/0.75)] backdrop-blur-2xl",
        "border border-[hsl(0_0%_100%/0.12)] shadow-[0_16px_48px_hsl(0_0%_0%/0.4)]",
        "p-4"
      )}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-[hsl(0_0%_100%/0.85)]">Desktop Widgets</p>
        <button onClick={onClose} className="rounded-lg p-1 hover:bg-[hsl(0_0%_100%/0.1)] transition-colors">
          <X className="h-3.5 w-3.5 text-[hsl(0_0%_100%/0.5)]" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {allIds.map(id => {
          const cfg = ALL_WIDGET_CONFIGS[id];
          const isActive = activeIds.includes(id);
          return (
            <button
              key={id}
              onClick={() => isActive ? onRemove(id) : onAdd(id)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl p-2.5 text-left transition-all duration-150",
                isActive
                  ? "bg-[hsl(265_55%_58%/0.25)] border border-[hsl(265_55%_58%/0.4)]"
                  : "bg-[hsl(0_0%_100%/0.04)] border border-transparent hover:bg-[hsl(0_0%_100%/0.08)]"
              )}
            >
              <div className={cn("rounded-lg p-1.5 shrink-0", isActive ? "bg-[hsl(265_55%_58%/0.3)]" : "bg-[hsl(0_0%_100%/0.06)]")}>
                <cfg.icon className={cn("h-3.5 w-3.5", isActive ? "text-[hsl(265_55%_70%)]" : "text-[hsl(0_0%_100%/0.5)]")} />
              </div>
              <div className="min-w-0">
                <p className={cn("text-xs font-medium truncate", isActive ? "text-[hsl(0_0%_100%/0.9)]" : "text-[hsl(0_0%_100%/0.6)]")}>
                  {cfg.label}
                </p>
                <p className="text-[9px] text-[hsl(0_0%_100%/0.35)] truncate">{cfg.description}</p>
              </div>
              {isActive && (
                <CheckCircle className="h-3 w-3 text-[hsl(265_55%_70%)] ml-auto shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

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
  useAccentSync();
  const { greeting, mood, gradient: timeGradient, gradientAlt: timeGradientAlt } = useMemo(getTimeConfig, []);
  const wallpaper = useMemo(getWallpaperTheme, []);
  const parallax = useWallpaperParallax(3);
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

  // ── Sparkline Data ──────────────────────────────────────────
  const sparklines = useSparklineData();

  // ── Widget Order (drag-and-drop) ────────────────────────────
  const [widgetOrder, setWidgetOrder] = useState(loadWidgetOrder);

  const handleWidgetDragEnd = useCallback((result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    setWidgetOrder(prev => {
      const next = [...prev];
      const [moved] = next.splice(result.source.index, 1);
      next.splice(result.destination!.index, 0, moved);
      saveWidgetOrder(next);
      return next;
    });
  }, []);

  // ── Context Menu ───────────────────────────────────────────
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);

  // ── Window Manager ─────────────────────────────────────────
  const windowManager = useWindowManagerContext();
  const visibleWindows = windowManager?.visibleWindows ?? [];
  const closeWindow = windowManager?.closeWindow;
  const focusWindow = windowManager?.focusWindow;
  const minimizeWindow = windowManager?.minimizeWindow;
  const updateWindowPosition = windowManager?.updateWindowPosition;

  // ── Calm Engine ─────────────────────────────────────────────
  const calm = useCalmEngine();
  const isIdle = calm.idlePhase !== "active";

  // ── Soft Focus Mode ────────────────────────────────────────
  const hasWindows = visibleWindows.length > 0;
  const maxZ = visibleWindows.reduce((max, w) => Math.max(max, w.zIndex), 0);

  // ── Frame tracking for perf instrumentation ──────────────
  useEffect(() => {
    WindowPerformanceMonitor.startFrameTracking();
    return () => WindowPerformanceMonitor.stopFrameTracking();
  }, []);

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
      style={{ transition: "background 8s ease, transform 0.3s ease-out", transform: `translate(${parallax.x}px, ${parallax.y}px) scale(1.01)` }}
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

      {/* Main desktop content — dims when windows are open (Soft Focus) + idle fade */}
      <div
        className={cn(
          "relative flex flex-col items-center gap-12 px-4 pb-28 pt-12 transition-all duration-[2000ms]",
          hasWindows ? "opacity-40" : "opacity-100"
        )}
        style={{
          zIndex: DEPTH_LAYERS.content,
          opacity: calm.idleOpacity(hasWindows ? 0.4 : 1),
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Clock */}
        <DesktopClock greeting={greeting} userName={userName || ""} bootReady={bootPhase >= 2} />

        {/* Draggable Widgets + Picker */}
        <div className="relative">
          <DragDropContext onDragEnd={handleWidgetDragEnd}>
            <Droppable droppableId="desktop-widgets" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-wrap items-center justify-center gap-3"
                >
                  {widgetOrder.map((widgetId, index) => {
                    const config = ALL_WIDGET_CONFIGS[widgetId];
                    if (!config) return null;
                    return (
                      <Draggable key={widgetId} draggableId={widgetId} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                          >
                            <GlassWidget
                              icon={config.icon}
                              label={config.label}
                              value={config.getValue(notifications)}
                              accent={config.accent}
                              onClick={() => navigate(config.route)}
                              bootReady={bootPhase >= 2}
                              delay={index * 80}
                              isDragging={dragSnapshot.isDragging}
                              dragHandleProps={dragProvided.dragHandleProps ?? undefined}
                              sparkData={sparklines[widgetId as keyof typeof sparklines]}
                              sparkColor={config.sparkColor}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                  {/* Add/Remove Widget Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowWidgetPicker(p => !p); }}
                    className={cn(
                      "flex items-center justify-center rounded-2xl w-12 h-[68px]",
                      "bg-[hsl(0_0%_100%/0.06)] backdrop-blur-xl border border-dashed border-[hsl(0_0%_100%/0.15)]",
                      "hover:bg-[hsl(0_0%_100%/0.12)] hover:border-[hsl(0_0%_100%/0.25)]",
                      "transition-all duration-150 cursor-pointer",
                      bootPhase >= 2 ? "opacity-100" : "opacity-0",
                    )}
                    title="Add or remove widgets"
                  >
                    <Settings2 className="h-4 w-4 text-[hsl(0_0%_100%/0.4)]" />
                  </button>
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Widget Picker Popover */}
          <AnimatePresence>
            {showWidgetPicker && (
              <WidgetPicker
                activeIds={widgetOrder}
                onAdd={(id) => {
                  setWidgetOrder(prev => {
                    const next = [...prev, id];
                    saveWidgetOrder(next);
                    return next;
                  });
                }}
                onRemove={(id) => {
                  setWidgetOrder(prev => {
                    const next = prev.filter(w => w !== id);
                    if (next.length === 0) return prev;
                    saveWidgetOrder(next);
                    return next;
                  });
                }}
                onClose={() => setShowWidgetPicker(false)}
              />
            )}
          </AnimatePresence>
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

      {/* Desktop Icon Grid — dims with soft focus + idle fade */}
      <div
        className="transition-all duration-[2000ms]"
        style={{
          opacity: calm.idleOpacity(hasWindows ? 0.4 : 1),
        }}
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
        {visibleWindows.map(w => {
          // Build sibling window list for physics engine
          const siblings: SiblingWindow[] = visibleWindows
            .filter(vw => vw.id !== w.id)
            .map(vw => ({
              id: vw.id,
              x: vw.position.x,
              y: vw.position.y,
              width: vw.width || 500,
              height: 400,
            }));

          return (
            <FloatingWindow
              key={w.id}
              windowId={w.id}
              title={w.title}
              appIcon={w.id === "finder" ? "📁" : w.id === "settings" ? "⚙️" : w.id === "notes" ? "📝" : w.id === "system-monitor" ? "📊" : w.id === "music-player" ? "🎵" : w.id === "calculator" ? "🔢" : w.id === "photo-viewer" ? "📷" : w.id === "code-editor" ? "👨‍💻" : w.id === "mail-client" ? "✉️" : w.id === "maps-app" ? "🗺️" : undefined}
              initialPosition={w.position}
              width={w.width}
              originRect={(w as any).originRect}
              siblingWindows={siblings}
              isOccluded={Compositor.isFullyOccluded(w.id)}
              onClose={() => {
                lifecycleManager.transition(w.id, "terminated");
                const proc = ProcessTable.getByAppId(w.id);
                if (proc) ProcessTable.kill(proc.pid);
                Compositor.removeSurface(w.id);
                closeWindow?.(w.id);
              }}
              onMinimize={() => {
                Compositor.setVisible(w.id, false);
                minimizeWindow?.(w.id);
              }}
              onFocus={() => {
                const prevFocused = visibleWindows.find(vw => vw.zIndex === maxZ && vw.id !== w.id);
                if (prevFocused) {
                  lifecycleManager.transition(prevFocused.id, "blurred");
                }
                lifecycleManager.transition(w.id, "focused");
                Compositor.bringToFront(w.id);
                SoundEngine.click();
                focusWindow?.(w.id);
              }}
              isFocused={w.zIndex === maxZ}
              onPositionChange={(pos, width) => updateWindowPosition?.(w.id, pos, width)}
              className="cursor-default"
              style={{ zIndex: DEPTH_LAYERS.windows + w.zIndex }}
            >
              {w.component}
            </FloatingWindow>
          );
        })}
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
