// ═══════════════════════════════════════════════════════════════
// SITA OS — Universal Command Layer v2
// @deprecated — Use UniversalCommandSurface (canonical OS-level command)
// or DomainCommandPalette (app-scoped). This component is retained
// for backward compatibility via ShellLiveLayer lazy import.
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowRight, Sparkles, Clock, Zap, Terminal, Calculator,
  Monitor, Moon, Sun, Lock, BellOff, Maximize, Minimize, Layout,
  Command as CommandIcon, ChevronRight, Palette, Brain, Clipboard,
  Timer, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ambientContext } from "@/lib/services/ambient-context-engine";

// ── Intent Types ──────────────────────────────────────────────

type IntentCategory =
  | "navigate" | "system" | "window" | "calculate"
  | "search" | "automation" | "action";

interface ParsedIntent {
  category: IntentCategory;
  action: string;
  args: Record<string, string>;
  confidence: number;
}

interface UniversalCommandItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  category: IntentCategory | "recent" | "suggestion" | "inline_result" | "ambient";
  action: () => void;
  keywords?: string[];
  colorPreview?: string;
}

// ── Route Aliases ─────────────────────────────────────────────

const ROUTE_ALIASES: Record<string, { path: string; label: string; icon: string }> = {
  "home": { path: "/home", label: "Desktop", icon: "🏠" },
  "desktop": { path: "/home", label: "Desktop", icon: "🖥️" },
  "pulse": { path: "/pulse", label: "Daily Pulse", icon: "⚡" },
  "biz": { path: "/business", label: "Business Center", icon: "💼" },
  "business": { path: "/business", label: "Business Center", icon: "💼" },
  "money": { path: "/money", label: "Money Center", icon: "💰" },
  "finance": { path: "/money", label: "Money Center", icon: "💰" },
  "concierge": { path: "/concierge", label: "Concierge", icon: "🎯" },
  "files": { path: "/files", label: "Files", icon: "📁" },
  "settings": { path: "/settings", label: "Settings", icon: "⚙️" },
  "boardroom": { path: "/boardroom", label: "Boardroom", icon: "🏛️" },
  "revenue": { path: "/revenue-office", label: "Revenue Office", icon: "📈" },
  "calendar": { path: "/calendar", label: "Calendar", icon: "📅" },
  "tasks": { path: "/tasks", label: "Tasks", icon: "✅" },
  "advisors": { path: "/advisors", label: "Advisors", icon: "🧠" },
  "apps": { path: "/app-store", label: "App Store", icon: "🏪" },
  "store": { path: "/app-store", label: "App Store", icon: "🏪" },
  "profile": { path: "/profile", label: "Profile", icon: "👤" },
  "admin": { path: "/admin/kernel", label: "Kernel Dashboard", icon: "🔧" },
  "kernel": { path: "/admin/kernel", label: "Kernel Dashboard", icon: "🔧" },
  "invoices": { path: "/money/invoices", label: "Invoices", icon: "📄" },
  "pipeline": { path: "/business/pipeline", label: "Pipeline", icon: "📊" },
  "leads": { path: "/business/leads", label: "Leads", icon: "👥" },
  "proof": { path: "/proof-center", label: "Proof Center", icon: "🔒" },
};

// ── NL Intent Parser ──────────────────────────────────────────

function parseIntent(input: string): ParsedIntent | null {
  const q = input.toLowerCase().trim();
  if (!q) return null;

  // "what was I doing" / "what am I working on"
  if (/^what\s+(was\s+i|am\s+i)\s+(doing|working\s+on)/.test(q)) {
    return { category: "action", action: "activity_summary", args: {}, confidence: 0.95 };
  }

  // Navigation
  const navMatch = q.match(/^(?:go\s+to|open|show|navigate\s+to|switch\s+to)\s+(.+)/);
  if (navMatch) {
    const target = navMatch[1].trim();
    const alias = ROUTE_ALIASES[target];
    if (alias) {
      return { category: "navigate", action: "goto", args: { path: alias.path, label: alias.label }, confidence: 0.95 };
    }
    for (const [key, val] of Object.entries(ROUTE_ALIASES)) {
      if (key.includes(target) || val.label.toLowerCase().includes(target)) {
        return { category: "navigate", action: "goto", args: { path: val.path, label: val.label }, confidence: 0.8 };
      }
    }
  }

  // System commands
  const systemCommands: Record<string, ParsedIntent> = {
    "dark mode": { category: "system", action: "theme", args: { theme: "dark" }, confidence: 0.95 },
    "light mode": { category: "system", action: "theme", args: { theme: "light" }, confidence: 0.95 },
    "lock screen": { category: "system", action: "lock", args: {}, confidence: 0.95 },
    "lock": { category: "system", action: "lock", args: {}, confidence: 0.9 },
    "mute notifications": { category: "system", action: "mute", args: {}, confidence: 0.95 },
    "mute": { category: "system", action: "mute", args: {}, confidence: 0.85 },
    "focus mode": { category: "system", action: "focus", args: {}, confidence: 0.95 },
    "focus": { category: "system", action: "focus", args: {}, confidence: 0.8 },
    "quiet mode": { category: "system", action: "quiet", args: {}, confidence: 0.9 },
  };
  if (systemCommands[q]) return systemCommands[q];

  // Window management
  const windowMatch = q.match(/^(?:resize|snap|tile|move)\s+(?:window\s+)?(.+)/);
  if (windowMatch) {
    return { category: "window", action: windowMatch[0].split(" ")[0], args: { direction: windowMatch[1] }, confidence: 0.85 };
  }
  if (q === "tile windows") return { category: "window", action: "tile", args: {}, confidence: 0.95 };
  if (q === "close all") return { category: "window", action: "close_all", args: {}, confidence: 0.95 };
  if (q === "minimize all" || q === "minimize background") return { category: "window", action: "minimize_all", args: {}, confidence: 0.95 };

  // Calculator
  const calcMatch = q.match(/^(?:calc(?:ulate)?|=|what\s+is)\s*(.+)/);
  if (calcMatch) {
    return { category: "calculate", action: "eval", args: { expr: calcMatch[1] }, confidence: 0.9 };
  }
  if (/^[\d\s+\-*/().,%]+$/.test(q) && q.length > 1) {
    return { category: "calculate", action: "eval", args: { expr: q }, confidence: 0.85 };
  }

  // Unit conversion
  const unitMatch = q.match(/^(\d+(?:\.\d+)?)\s*(km|mi|kg|lb|lbs|c|f|usd|eur|gbp|cm|in|inch|inches|m|ft|feet|oz|g|grams?|l|gal|gallons?)\s+(?:to|in)\s+(\w+)/i);
  if (unitMatch) {
    return { category: "calculate", action: "convert", args: { value: unitMatch[1], from: unitMatch[2].toLowerCase(), to: unitMatch[3].toLowerCase() }, confidence: 0.9 };
  }

  // Date math
  const dateMatch = q.match(/^(?:what\s+(?:day|date)\s+is\s+)?(?:today|tomorrow|yesterday|next\s+\w+)/);
  if (dateMatch) {
    return { category: "calculate", action: "date", args: { query: q }, confidence: 0.8 };
  }

  // Color preview
  if (/^#[0-9a-f]{3,8}$/i.test(q) || /^rgb\(/i.test(q) || /^hsl\(/i.test(q)) {
    return { category: "calculate", action: "color", args: { color: q }, confidence: 0.9 };
  }

  return { category: "search", action: "search", args: { query: q }, confidence: 0.3 };
}

// ── Calculator ────────────────────────────────────────────────

function safeEval(expr: string): string | null {
  try {
    const sanitized = expr.replace(/[^0-9+\-*/().%\s]/g, "");
    if (!sanitized.trim()) return null;
    const result = new Function(`return (${sanitized})`)();
    if (typeof result === "number" && isFinite(result)) {
      return result.toLocaleString(undefined, { maximumFractionDigits: 8 });
    }
    return null;
  } catch { return null; }
}

// ── Unit Conversion ───────────────────────────────────────────

function convertUnit(value: number, from: string, to: string): string | null {
  const conversions: Record<string, Record<string, (v: number) => number>> = {
    km: { mi: v => v * 0.621371, m: v => v * 1000, ft: v => v * 3280.84 },
    mi: { km: v => v * 1.60934, m: v => v * 1609.34, ft: v => v * 5280 },
    kg: { lb: v => v * 2.20462, lbs: v => v * 2.20462, oz: v => v * 35.274, g: v => v * 1000, grams: v => v * 1000 },
    lb: { kg: v => v * 0.453592, oz: v => v * 16, g: v => v * 453.592 },
    lbs: { kg: v => v * 0.453592, oz: v => v * 16 },
    c: { f: v => v * 9/5 + 32 },
    f: { c: v => (v - 32) * 5/9 },
    cm: { in: v => v / 2.54, inch: v => v / 2.54, inches: v => v / 2.54, m: v => v / 100, ft: v => v / 30.48 },
    in: { cm: v => v * 2.54, m: v => v * 0.0254, ft: v => v / 12 },
    inch: { cm: v => v * 2.54 },
    inches: { cm: v => v * 2.54 },
    m: { ft: v => v * 3.28084, feet: v => v * 3.28084, cm: v => v * 100, km: v => v / 1000, in: v => v * 39.3701 },
    ft: { m: v => v * 0.3048, cm: v => v * 30.48, in: v => v * 12 },
    feet: { m: v => v * 0.3048 },
    oz: { g: v => v * 28.3495, grams: v => v * 28.3495, kg: v => v * 0.0283495, lb: v => v / 16 },
    l: { gal: v => v * 0.264172, gallons: v => v * 0.264172 },
    gal: { l: v => v * 3.78541 },
    gallons: { l: v => v * 3.78541 },
    usd: { eur: v => v * 0.92, gbp: v => v * 0.79 },
    eur: { usd: v => v * 1.09, gbp: v => v * 0.86 },
    gbp: { usd: v => v * 1.27, eur: v => v * 1.16 },
  };

  const fn = conversions[from]?.[to];
  if (!fn) return null;
  const result = fn(value);
  return result.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function solveDateQuery(query: string): string | null {
  const q = query.toLowerCase();
  const now = new Date();
  if (q.includes("today")) return now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  if (q.includes("tomorrow")) {
    const d = new Date(now); d.setDate(d.getDate() + 1);
    return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }
  if (q.includes("yesterday")) {
    const d = new Date(now); d.setDate(d.getDate() - 1);
    return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }
  return null;
}

// ── Command History ───────────────────────────────────────────

const HISTORY_KEY = "sita-cmd-history";
const MAX_HISTORY = 50;

function getCommandHistory(): { query: string; count: number; lastUsed: number }[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}

function addToHistory(query: string) {
  try {
    const history = getCommandHistory();
    const existing = history.find(h => h.query === query);
    if (existing) { existing.count++; existing.lastUsed = Date.now(); }
    else { history.unshift({ query, count: 1, lastUsed: Date.now() }); }
    history.sort((a, b) => b.lastUsed - a.lastUsed);
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {}
}

function getRecentApps(): string[] {
  try { return JSON.parse(localStorage.getItem("sita-recent-apps") || "[]").slice(0, 4); } catch { return []; }
}

function addRecentApp(path: string) {
  try {
    const recent = getRecentApps().filter(p => p !== path);
    recent.unshift(path);
    localStorage.setItem("sita-recent-apps", JSON.stringify(recent.slice(0, 8)));
  } catch {}
}

// ── Contextual Commands ───────────────────────────────────────

function getContextualCommands(pathname: string): { label: string; sublabel: string; icon: string; path: string }[] {
  const segment = pathname.split("/").filter(Boolean)[0] || "home";
  const contextCmds: Record<string, { label: string; sublabel: string; icon: string; path: string }[]> = {
    money: [
      { label: "Show cash flow", sublabel: "View cash position", icon: "💵", path: "/money/cash-flow" },
      { label: "Add transaction", sublabel: "Record new entry", icon: "➕", path: "/money/transactions" },
      { label: "View invoices", sublabel: "Pending & paid", icon: "📄", path: "/money/invoices" },
    ],
    business: [
      { label: "New lead", sublabel: "Add to pipeline", icon: "➕", path: "/business/leads" },
      { label: "Pipeline view", sublabel: "Deal stages", icon: "📊", path: "/business/pipeline" },
      { label: "Client list", sublabel: "All clients", icon: "👥", path: "/business/clients" },
    ],
    concierge: [
      { label: "Add task", sublabel: "New to-do item", icon: "✅", path: "/concierge/tasks" },
      { label: "Errands", sublabel: "Pending errands", icon: "🏃", path: "/concierge/errands" },
    ],
  };
  return contextCmds[segment] || [];
}

// ── Smart Time Suggestions ────────────────────────────────────

function getTimeSuggestions(): { label: string; icon: string; sublabel: string; path: string }[] {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    return [
      { label: "Morning briefing", icon: "☀️", sublabel: "Check today's agenda", path: "/pulse" },
      { label: "Pending approvals", icon: "✅", sublabel: "Items waiting", path: "/approvals" },
    ];
  }
  if (hour >= 12 && hour < 18) {
    return [
      { label: "Pipeline check-in", icon: "📊", sublabel: "Afternoon review", path: "/revenue-office" },
      { label: "Cash position", icon: "💵", sublabel: "Today's balances", path: "/money" },
    ];
  }
  return [
    { label: "End-of-day summary", icon: "🌙", sublabel: "What got done", path: "/pulse" },
    { label: "Tomorrow's tasks", icon: "📋", sublabel: "Plan ahead", path: "/tasks" },
  ];
}

// ── Component ─────────────────────────────────────────────────

interface UniversalCommandProps {
  open: boolean;
  onClose: () => void;
  onSystemCommand?: (cmd: string, args?: Record<string, string>) => void;
}

export const UniversalCommand = ({ open, onClose, onSystemCommand }: UniversalCommandProps) => {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Execute system commands for real
  const executeSystemCommand = useCallback((action: string, args: Record<string, string> = {}) => {
    switch (action) {
      case "theme": {
        const html = document.documentElement;
        if (args.theme === "dark") {
          html.classList.add("dark");
          localStorage.setItem("theme", "dark");
        } else {
          html.classList.remove("dark");
          localStorage.setItem("theme", "light");
        }
        break;
      }
      case "lock":
      case "mute":
      case "focus":
      case "quiet":
        onSystemCommand?.(action, args);
        break;
    }
  }, [onSystemCommand]);

  const items = useMemo<UniversalCommandItem[]>(() => {
    const q = query.trim();
    const results: UniversalCommandItem[] = [];
    const seen = new Set<string>();

    const addUnique = (item: UniversalCommandItem) => {
      if (seen.has(item.id)) return;
      seen.add(item.id);
      results.push(item);
    };

    // 1. Parse intent for NL commands
    if (q) {
      const intent = parseIntent(q);
      if (intent && intent.confidence >= 0.7) {
        switch (intent.category) {
          case "navigate":
            addUnique({
              id: `intent-nav-${intent.args.path}`, label: `Go to ${intent.args.label}`,
              sublabel: intent.args.path, icon: <ArrowRight className="h-4 w-4" />,
              category: "navigate",
              action: () => { navigate(intent.args.path); addRecentApp(intent.args.path); addToHistory(q); onClose(); },
            });
            break;
          case "system":
            addUnique({
              id: `intent-sys-${intent.action}`,
              label: intent.action === "theme"
                ? `Switch to ${intent.args.theme} mode`
                : `System: ${intent.action}`,
              sublabel: "Execute system command",
              icon: intent.action === "theme" && intent.args.theme === "dark"
                ? <Moon className="h-4 w-4" />
                : intent.action === "theme"
                ? <Sun className="h-4 w-4" />
                : <Monitor className="h-4 w-4" />,
              category: "system",
              action: () => {
                executeSystemCommand(intent.action, intent.args);
                addToHistory(q);
                onClose();
              },
            });
            break;
          case "window":
            addUnique({
              id: `intent-win-${intent.action}`,
              label: `Window: ${intent.action} ${intent.args.direction || ""}`,
              sublabel: "Window management",
              icon: <Layout className="h-4 w-4" />,
              category: "window",
              action: () => {
                onSystemCommand?.(`window_${intent.action}`, intent.args);
                addToHistory(q);
                onClose();
              },
            });
            break;
          case "action":
            if (intent.action === "activity_summary") {
              const summary = ambientContext.getActivitySummary();
              addUnique({
                id: "activity-summary",
                label: `Working on: ${summary.currentFocus}`,
                sublabel: `${summary.durationMinutes}min session · ${summary.sessionDepth} pages visited`,
                icon: <Activity className="h-4 w-4" />,
                category: "inline_result",
                action: () => {},
              });
              for (const page of summary.recentPages.slice(0, 3)) {
                addUnique({
                  id: `summary-page-${page.path}`,
                  label: page.label,
                  sublabel: `${Math.round(page.dwellMs / 1000)}s spent`,
                  icon: <ArrowRight className="h-4 w-4" />,
                  category: "navigate",
                  action: () => { navigate(page.path); onClose(); },
                });
              }
            }
            break;
          case "calculate": {
            let result: string | null = null;
            if (intent.action === "eval") {
              result = safeEval(intent.args.expr);
            } else if (intent.action === "convert") {
              result = convertUnit(
                parseFloat(intent.args.value),
                intent.args.from,
                intent.args.to
              );
              if (result) result = `${result} ${intent.args.to}`;
            } else if (intent.action === "date") {
              result = solveDateQuery(intent.args.query || q);
            } else if (intent.action === "color") {
              addUnique({
                id: "color-preview",
                label: intent.args.color,
                sublabel: "Color preview",
                icon: <Palette className="h-4 w-4" />,
                category: "inline_result",
                colorPreview: intent.args.color,
                action: () => {
                  navigator.clipboard.writeText(intent.args.color).catch(() => {});
                  onClose();
                },
              });
            }

            if (result) {
              addUnique({
                id: "calc-result", label: `= ${result}`,
                sublabel: intent.args.expr || q,
                icon: <Calculator className="h-4 w-4" />,
                category: "inline_result",
                action: () => {
                  navigator.clipboard.writeText(result!).catch(() => {});
                  addToHistory(q);
                  onClose();
                },
              });
            }
            break;
          }
        }
      }
    }

    // 2. No query — show ambient suggestions + history + time + contextual
    if (!q) {
      // Ambient suggestions from context engine
      const ambient = ambientContext.getSuggestions().slice(0, 3);
      for (const s of ambient) {
        addUnique({
          id: `amb-${s.id}`,
          label: `SITA noticed: ${s.title}`,
          sublabel: s.subtitle,
          icon: <Sparkles className="h-4 w-4" />,
          category: "ambient",
          action: () => {
            ambientContext.acceptSuggestion(s.id);
            const [actionType, ...rest] = s.action.split(":");
            const target = rest.join(":");
            if (actionType === "navigate" || actionType === "restore") navigate(target);
            else if (actionType === "search") navigate(`/search?q=${encodeURIComponent(target)}`);
            onClose();
          },
        });
      }

      // Recent history
      const history = getCommandHistory().slice(0, 3);
      for (const h of history) {
        addUnique({
          id: `hist-${h.query}`, label: h.query, sublabel: `Used ${h.count}x`,
          icon: <Clock className="h-4 w-4" />, category: "recent",
          action: () => { setQuery(h.query); },
        });
      }

      // "What was I doing?" shortcut
      addUnique({
        id: "what-was-i-doing",
        label: "What was I doing?",
        sublabel: "See your activity summary",
        icon: <Brain className="h-4 w-4" />,
        category: "suggestion",
        action: () => { setQuery("what was I doing"); },
      });

      // Time-based
      for (const s of getTimeSuggestions()) {
        addUnique({
          id: `time-${s.path}`, label: s.label, sublabel: s.sublabel,
          icon: <span>{s.icon}</span>, category: "suggestion",
          action: () => { navigate(s.path); addRecentApp(s.path); onClose(); },
        });
      }

      // Contextual commands — wired to actual navigation
      for (const cmd of getContextualCommands(location.pathname)) {
        addUnique({
          id: `ctx-${cmd.path}`, label: cmd.label, sublabel: cmd.sublabel,
          icon: <span>{cmd.icon}</span>, category: "action",
          action: () => { navigate(cmd.path); addRecentApp(cmd.path); onClose(); },
        });
      }
    }

    // 3. Fuzzy route match
    const ql = q.toLowerCase();
    if (ql) {
      for (const [alias, route] of Object.entries(ROUTE_ALIASES)) {
        if (alias.includes(ql) || route.label.toLowerCase().includes(ql)) {
          addUnique({
            id: `route-${route.path}`, label: route.label,
            sublabel: route.path, icon: <span>{route.icon}</span>,
            category: "navigate",
            action: () => { navigate(route.path); addRecentApp(route.path); addToHistory(q); onClose(); },
          });
        }
      }
    }

    // 4. System control commands — wired to real execution
    if (ql) {
      const sysCmds = [
        { id: "sys-dark", label: "Dark Mode", sublabel: "Switch to dark theme", icon: <Moon className="h-4 w-4" />, kw: ["dark", "theme"], sysAction: "theme", sysArgs: { theme: "dark" } },
        { id: "sys-light", label: "Light Mode", sublabel: "Switch to light theme", icon: <Sun className="h-4 w-4" />, kw: ["light", "theme"], sysAction: "theme", sysArgs: { theme: "light" } },
        { id: "sys-lock", label: "Lock Screen", sublabel: "Lock the OS", icon: <Lock className="h-4 w-4" />, kw: ["lock"], sysAction: "lock", sysArgs: {} },
        { id: "sys-mute", label: "Mute Notifications", sublabel: "Silence all alerts", icon: <BellOff className="h-4 w-4" />, kw: ["mute", "quiet", "silent"], sysAction: "mute", sysArgs: {} },
        { id: "sys-focus", label: "Focus Mode", sublabel: "Minimize distractions", icon: <Maximize className="h-4 w-4" />, kw: ["focus", "zen"], sysAction: "focus", sysArgs: {} },
        { id: "sys-tile", label: "Tile Windows", sublabel: "Arrange all windows", icon: <Layout className="h-4 w-4" />, kw: ["tile", "arrange", "snap"], sysAction: "window_tile", sysArgs: {} },
        { id: "sys-minimize", label: "Minimize All", sublabel: "Clear the desktop", icon: <Minimize className="h-4 w-4" />, kw: ["minimize", "hide"], sysAction: "window_minimize_all", sysArgs: {} },
      ];
      for (const cmd of sysCmds) {
        if (cmd.kw.some(k => ql.includes(k)) || cmd.label.toLowerCase().includes(ql)) {
          addUnique({
            id: cmd.id, label: cmd.label, sublabel: cmd.sublabel,
            icon: cmd.icon, category: "system",
            action: () => {
              if (cmd.sysAction.startsWith("window_")) {
                onSystemCommand?.(cmd.sysAction, cmd.sysArgs);
              } else {
                executeSystemCommand(cmd.sysAction, cmd.sysArgs);
              }
              addToHistory(q);
              onClose();
            },
          });
        }
      }

      // Clipboard display
      if (ql.includes("paste") || ql.includes("clipboard")) {
        const lastClip = ambientContext.getLastClipboard();
        if (lastClip) {
          addUnique({
            id: "clipboard-content",
            label: `Clipboard: ${lastClip.content.slice(0, 50)}`,
            sublabel: `${lastClip.type} · copied ${Math.round((Date.now() - lastClip.timestamp) / 1000)}s ago`,
            icon: <Clipboard className="h-4 w-4" />,
            category: "inline_result",
            action: () => {},
          });
        }
      }
    }

    return results.slice(0, 16);
  }, [query, navigate, onClose, location.pathname, executeSystemCommand, onSystemCommand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && items[selectedIdx]) { items[selectedIdx].action(); }
    else if (e.key === "Escape") { onClose(); }
    else if (e.key === "Tab" && items[selectedIdx]) { e.preventDefault(); items[selectedIdx].action(); }
  }, [items, selectedIdx, onClose]);

  const categoryLabel = (c: string) => {
    const labels: Record<string, string> = {
      recent: "Recent", suggestion: "Suggested", navigate: "Navigate",
      system: "System", window: "Window", calculate: "Calculate",
      action: "Action", search: "Search", inline_result: "Result",
      ambient: "SITA Intelligence",
    };
    return labels[c] || c;
  };

  const categoryIconEl = (c: string) => {
    switch (c) {
      case "recent": return <Clock className="h-2.5 w-2.5" />;
      case "suggestion": return <Zap className="h-2.5 w-2.5" />;
      case "system": return <Monitor className="h-2.5 w-2.5" />;
      case "inline_result": return <Calculator className="h-2.5 w-2.5" />;
      case "ambient": return <Sparkles className="h-2.5 w-2.5" />;
      default: return null;
    }
  };

  if (!open) return null;

  // Group by category
  const grouped: { category: string; items: (UniversalCommandItem & { globalIdx: number })[] }[] = [];
  let currentCat = "";
  items.forEach((item, idx) => {
    if (item.category !== currentCat) {
      currentCat = item.category;
      grouped.push({ category: currentCat, items: [] });
    }
    grouped[grouped.length - 1].items.push({ ...item, globalIdx: idx });
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh]"
        style={{ background: "hsl(0 0% 0% / 0.45)", backdropFilter: "blur(12px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="w-full max-w-[600px] mx-4 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "hsl(var(--card) / 0.88)",
            backdropFilter: "blur(60px) saturate(1.8)",
            WebkitBackdropFilter: "blur(60px) saturate(1.8)",
            border: "1px solid hsl(var(--border) / 0.3)",
            boxShadow: "0 25px 80px -12px hsl(0 0% 0% / 0.5), 0 0 0 1px hsl(0 0% 100% / 0.05)",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/20">
            <Terminal className="h-5 w-5 text-primary/60 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Type a command, search, or calculate…"
              className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            <kbd className="hidden sm:inline-flex text-[10px] text-muted-foreground/40 bg-muted/50 px-2 py-0.5 rounded-md font-mono border border-border/20">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[420px] overflow-y-auto py-2 px-2">
            {items.length === 0 && query && (
              <div className="py-12 text-center">
                <Sparkles className="h-6 w-6 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground/60">No results for "{query}"</p>
                <p className="text-xs text-muted-foreground/40 mt-1">Try "go to business", "2+2", "10 km to mi", or "#ff5500"</p>
              </div>
            )}

            {grouped.map((group) => (
              <div key={group.category} className="mb-1">
                <div className="flex items-center gap-2 px-3 py-1.5">
                  {categoryIconEl(group.category)}
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40">
                    {categoryLabel(group.category)}
                  </span>
                </div>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIdx(item.globalIdx)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150",
                      item.globalIdx === selectedIdx
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted/30"
                    )}
                  >
                    {/* Color preview swatch */}
                    {item.colorPreview ? (
                      <span
                        className="shrink-0 w-7 h-7 rounded-lg border border-border/30"
                        style={{ background: item.colorPreview }}
                      />
                    ) : (
                      <span className="shrink-0 w-7 text-center flex items-center justify-center text-lg">
                        {typeof item.icon === "string" ? item.icon : item.icon}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        item.category === "inline_result" && "text-primary font-semibold text-base"
                      )}>{item.label}</p>
                      {item.sublabel && (
                        <p className="text-[11px] text-muted-foreground/60 truncate">{item.sublabel}</p>
                      )}
                    </div>
                    {item.globalIdx === selectedIdx && (
                      <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-border/15 text-[10px] text-muted-foreground/35">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="bg-muted/40 px-1 py-0.5 rounded text-[9px] font-mono border border-border/15">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-muted/40 px-1.5 py-0.5 rounded text-[9px] font-mono border border-border/15">↵</kbd>
                Execute
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-muted/40 px-1 py-0.5 rounded text-[9px] font-mono border border-border/15">Tab</kbd>
                Complete
              </span>
            </div>
            <span className="flex items-center gap-1">
              <CommandIcon className="h-2.5 w-2.5" /> Universal Command
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UniversalCommand;
