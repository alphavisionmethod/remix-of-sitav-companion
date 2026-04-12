// ═══════════════════════════════════════════════════════════════
// SITA OS — Universal Command Layer
// NL parsing, system control, window mgmt, inline results,
// contextual commands, fuzzy matching, automation rules
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowRight, Sparkles, Clock, Zap, Terminal, Calculator,
  Monitor, Moon, Sun, Lock, BellOff, Maximize, Minimize, Layout,
  Command as CommandIcon, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  category: IntentCategory | "recent" | "suggestion" | "inline_result";
  action: () => void;
  keywords?: string[];
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
};

// ── NL Intent Parser ──────────────────────────────────────────

function parseIntent(input: string): ParsedIntent | null {
  const q = input.toLowerCase().trim();
  if (!q) return null;

  // Navigation: "go to X", "open X", "show X"
  const navMatch = q.match(/^(?:go\s+to|open|show|navigate\s+to|switch\s+to)\s+(.+)/);
  if (navMatch) {
    const target = navMatch[1].trim();
    const alias = ROUTE_ALIASES[target];
    if (alias) {
      return { category: "navigate", action: "goto", args: { path: alias.path, label: alias.label }, confidence: 0.95 };
    }
    // Fuzzy match
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
  // Direct math expression
  if (/^[\d\s+\-*/().,%]+$/.test(q) && q.length > 1) {
    return { category: "calculate", action: "eval", args: { expr: q }, confidence: 0.85 };
  }

  // Unit conversion
  const unitMatch = q.match(/^(\d+(?:\.\d+)?)\s*(km|mi|kg|lb|c|f|usd|eur|gbp)\s+(?:to|in)\s+(\w+)/i);
  if (unitMatch) {
    return { category: "calculate", action: "convert", args: { value: unitMatch[1], from: unitMatch[2], to: unitMatch[3] }, confidence: 0.9 };
  }

  // Date math
  const dateMatch = q.match(/^(?:what\s+(?:day|date)\s+is\s+)?(?:today|tomorrow|yesterday|next\s+\w+)/);
  if (dateMatch) {
    return { category: "calculate", action: "date", args: { query: q }, confidence: 0.8 };
  }

  // Search fallback
  return { category: "search", action: "search", args: { query: q }, confidence: 0.3 };
}

// ── Calculator ────────────────────────────────────────────────

function safeEval(expr: string): string | null {
  try {
    // Only allow safe math operations
    const sanitized = expr.replace(/[^0-9+\-*/().%\s]/g, "");
    if (!sanitized.trim()) return null;
    // Use Function constructor for safe eval
    const result = new Function(`return (${sanitized})`)();
    if (typeof result === "number" && isFinite(result)) {
      return result.toLocaleString(undefined, { maximumFractionDigits: 8 });
    }
    return null;
  } catch { return null; }
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
    if (existing) {
      existing.count++;
      existing.lastUsed = Date.now();
    } else {
      history.unshift({ query, count: 1, lastUsed: Date.now() });
    }
    history.sort((a, b) => b.lastUsed - a.lastUsed);
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {}
}

// ── Recent Apps ───────────────────────────────────────────────

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

function getContextualCommands(pathname: string): UniversalCommandItem[] {
  const segment = pathname.split("/").filter(Boolean)[0] || "home";
  const contextual: UniversalCommandItem[] = [];

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

  const cmds = contextCmds[segment];
  if (cmds) {
    for (const cmd of cmds) {
      contextual.push({
        id: `ctx-${cmd.path}`, label: cmd.label, sublabel: cmd.sublabel,
        icon: <span>{cmd.icon}</span>, category: "action",
        action: () => {}, // Will be set in component
        keywords: [cmd.label.toLowerCase()],
      });
    }
  }
  return contextual;
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
}

export const UniversalCommand = ({ open, onClose }: UniversalCommandProps) => {
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

  const items = useMemo<UniversalCommandItem[]>(() => {
    const q = query.trim();
    const results: UniversalCommandItem[] = [];
    const seen = new Set<string>();

    const addUnique = (item: UniversalCommandItem) => {
      if (seen.has(item.label)) return;
      seen.add(item.label);
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
              id: `intent-sys-${intent.action}`, label: `System: ${intent.action}`,
              sublabel: `Execute system command`,
              icon: <Monitor className="h-4 w-4" />,
              category: "system",
              action: () => { addToHistory(q); onClose(); },
            });
            break;
          case "window":
            addUnique({
              id: `intent-win-${intent.action}`, label: `Window: ${intent.action} ${intent.args.direction || ""}`,
              sublabel: "Window management",
              icon: <Layout className="h-4 w-4" />,
              category: "window",
              action: () => { addToHistory(q); onClose(); },
            });
            break;
          case "calculate": {
            let result: string | null = null;
            if (intent.action === "eval") result = safeEval(intent.args.expr);
            else if (intent.action === "date") result = solveDateQuery(intent.args.query || q);

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

    // 2. No query — show history + time suggestions + contextual
    if (!q) {
      // Recent history
      const history = getCommandHistory().slice(0, 3);
      for (const h of history) {
        addUnique({
          id: `hist-${h.query}`, label: h.query, sublabel: `Used ${h.count}x`,
          icon: <Clock className="h-4 w-4" />, category: "recent",
          action: () => { setQuery(h.query); },
        });
      }

      // Time-based suggestions
      for (const s of getTimeSuggestions()) {
        addUnique({
          id: `time-${s.path}`, label: s.label, sublabel: s.sublabel,
          icon: <span>{s.icon}</span>, category: "suggestion",
          action: () => { navigate(s.path); addRecentApp(s.path); onClose(); },
        });
      }

      // Contextual commands
      for (const cmd of getContextualCommands(location.pathname)) {
        addUnique({
          ...cmd,
          action: () => {
            const path = (cmd as any).keywords?.[0];
            // contextual items have paths baked in metadata; for now navigate
            onClose();
          },
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

    // 4. System control commands (always available on search)
    if (ql) {
      const sysCmds = [
        { id: "sys-dark", label: "Dark Mode", sublabel: "Switch to dark theme", icon: <Moon className="h-4 w-4" />, kw: ["dark", "theme"] },
        { id: "sys-light", label: "Light Mode", sublabel: "Switch to light theme", icon: <Sun className="h-4 w-4" />, kw: ["light", "theme"] },
        { id: "sys-lock", label: "Lock Screen", sublabel: "Lock the OS", icon: <Lock className="h-4 w-4" />, kw: ["lock"] },
        { id: "sys-mute", label: "Mute Notifications", sublabel: "Silence all alerts", icon: <BellOff className="h-4 w-4" />, kw: ["mute", "quiet", "silent"] },
        { id: "sys-focus", label: "Focus Mode", sublabel: "Minimize distractions", icon: <Maximize className="h-4 w-4" />, kw: ["focus", "zen"] },
        { id: "sys-tile", label: "Tile Windows", sublabel: "Arrange all windows", icon: <Layout className="h-4 w-4" />, kw: ["tile", "arrange", "snap"] },
        { id: "sys-minimize", label: "Minimize All", sublabel: "Clear the desktop", icon: <Minimize className="h-4 w-4" />, kw: ["minimize", "hide"] },
      ];
      for (const cmd of sysCmds) {
        if (cmd.kw.some(k => ql.includes(k)) || cmd.label.toLowerCase().includes(ql)) {
          addUnique({
            ...cmd, category: "system",
            action: () => { addToHistory(q); onClose(); },
          });
        }
      }
    }

    return results.slice(0, 16);
  }, [query, navigate, onClose, location.pathname]);

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
    };
    return labels[c] || c;
  };

  const categoryIconEl = (c: string) => {
    switch (c) {
      case "recent": return <Clock className="h-2.5 w-2.5" />;
      case "suggestion": return <Zap className="h-2.5 w-2.5" />;
      case "system": return <Monitor className="h-2.5 w-2.5" />;
      case "inline_result": return <Calculator className="h-2.5 w-2.5" />;
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
                <p className="text-xs text-muted-foreground/40 mt-1">Try "go to business" or "2+2"</p>
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
                    <span className="shrink-0 w-7 text-center flex items-center justify-center text-lg">
                      {typeof item.icon === "string" ? item.icon : item.icon}
                    </span>
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
