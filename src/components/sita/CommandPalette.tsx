// ═══════════════════════════════════════════════════════════════
// SITA OS — Spotlight Command Palette (Cmd+K)
// macOS-grade search: recent apps, smart suggestions, glass UI
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Sparkles, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/contexts/AppPlatformContext";

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: string;
  category: "recent" | "suggestion" | "app" | "navigate" | "action";
  action: () => void;
}

const ROUTES = [
  { label: "Daily Pulse", path: "/pulse", icon: "⚡", sublabel: "Your daily briefing" },
  { label: "Business Center", path: "/business", icon: "💼", sublabel: "Leads, invoices, CRM" },
  { label: "Money Center", path: "/money", icon: "💰", sublabel: "Finances & cash flow" },
  { label: "Concierge", path: "/concierge", icon: "🎯", sublabel: "Tasks & errands" },
  { label: "Revenue Office", path: "/revenue-office", icon: "📈", sublabel: "Sales & pipeline" },
  { label: "Boardroom", path: "/boardroom", icon: "🏛️", sublabel: "Strategic decisions" },
  { label: "Files", path: "/files", icon: "📁", sublabel: "Documents & storage" },
  { label: "Calendar", path: "/calendar", icon: "📅", sublabel: "Schedule & events" },
  { label: "Tasks", path: "/tasks", icon: "✅", sublabel: "To-dos & projects" },
  { label: "Settings", path: "/settings", icon: "⚙️", sublabel: "Preferences & config" },
  { label: "App Store", path: "/app-store", icon: "🏪", sublabel: "Browse & install apps" },
  { label: "Advisors", path: "/advisors", icon: "🧠", sublabel: "AI advisory council" },
];

const ACTIONS = [
  { label: "Ask SITA Advisor", icon: "🧠", sublabel: "Get AI recommendations", action: "advisor" },
  { label: "Create New Lead", icon: "➕", sublabel: "Add to pipeline", action: "lead" },
  { label: "Send Invoice", icon: "📄", sublabel: "Bill a client", action: "invoice" },
  { label: "Schedule Task", icon: "📋", sublabel: "Add to concierge", action: "task" },
];

// Time-based smart suggestions
function getSmartSuggestions(): { label: string; icon: string; sublabel: string; path: string }[] {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    return [
      { label: "Check today's agenda", icon: "☀️", sublabel: "Morning briefing", path: "/pulse" },
      { label: "Review pending approvals", icon: "✅", sublabel: "3 items waiting", path: "/approvals" },
    ];
  }
  if (hour >= 12 && hour < 18) {
    return [
      { label: "Pipeline check-in", icon: "📊", sublabel: "Afternoon review", path: "/revenue-office" },
      { label: "Cash position", icon: "💵", sublabel: "Today's balances", path: "/money" },
    ];
  }
  return [
    { label: "End-of-day summary", icon: "🌙", sublabel: "What got done today", path: "/pulse" },
    { label: "Tomorrow's tasks", icon: "📋", sublabel: "Plan ahead", path: "/tasks" },
  ];
}

// Recent apps (persisted in localStorage)
function getRecentApps(): string[] {
  try {
    return JSON.parse(localStorage.getItem("sita-recent-apps") || "[]").slice(0, 4);
  } catch { return []; }
}

function addRecentApp(path: string) {
  try {
    const recent = getRecentApps().filter(p => p !== path);
    recent.unshift(path);
    localStorage.setItem("sita-recent-apps", JSON.stringify(recent.slice(0, 8)));
  } catch {}
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export const CommandPalette = ({ open, onClose }: CommandPaletteProps) => {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const navigate = useNavigate();
  const { apps } = useAppPlatform();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const items = useMemo<CommandItem[]>(() => {
    const q = query.toLowerCase();
    const results: CommandItem[] = [];

    if (!q) {
      // No query: show recent apps + smart suggestions first
      const recentPaths = getRecentApps();
      recentPaths.forEach(path => {
        const route = ROUTES.find(r => r.path === path);
        if (route) {
          results.push({
            id: `recent-${route.path}`,
            label: route.label,
            sublabel: route.sublabel,
            icon: route.icon,
            category: "recent",
            action: () => { navigate(route.path); addRecentApp(route.path); onClose(); },
          });
        }
      });

      // Smart suggestions
      getSmartSuggestions().forEach(s => {
        results.push({
          id: `suggest-${s.path}`,
          label: s.label,
          sublabel: s.sublabel,
          icon: s.icon,
          category: "suggestion",
          action: () => { navigate(s.path); addRecentApp(s.path); onClose(); },
        });
      });
    }

    // Apps
    const installedApps = apps.filter(a => a.installStatus === "installed");
    installedApps.forEach(app => {
      if (!q || app.name.toLowerCase().includes(q) || app.tags.some(t => t.includes(q))) {
        results.push({
          id: `app-${app.id}`,
          label: app.name,
          sublabel: app.shortDescription,
          icon: app.icon,
          category: "app",
          action: () => {
            if (app.routePath) { navigate(app.routePath); addRecentApp(app.routePath); }
            else if (app.externalUrl) window.open(app.externalUrl, "_blank", "noopener");
            onClose();
          },
        });
      }
    });

    // Routes
    ROUTES.forEach(r => {
      if (!q || r.label.toLowerCase().includes(q) || r.sublabel.toLowerCase().includes(q)) {
        results.push({
          id: `route-${r.path}`,
          label: r.label,
          sublabel: r.sublabel,
          icon: r.icon,
          category: "navigate",
          action: () => { navigate(r.path); addRecentApp(r.path); onClose(); },
        });
      }
    });

    // Actions
    ACTIONS.forEach(a => {
      if (!q || a.label.toLowerCase().includes(q)) {
        results.push({
          id: `action-${a.action}`,
          label: a.label,
          sublabel: a.sublabel,
          icon: a.icon,
          category: "action",
          action: () => { onClose(); },
        });
      }
    });

    // Deduplicate
    const seen = new Set<string>();
    return results.filter(r => {
      if (seen.has(r.label)) return false;
      seen.add(r.label);
      return true;
    }).slice(0, 14);
  }, [query, apps, navigate, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && items[selectedIdx]) { items[selectedIdx].action(); }
    else if (e.key === "Escape") { onClose(); }
  }, [items, selectedIdx, onClose]);

  const categoryIcon = (c: CommandItem["category"]) => {
    switch (c) {
      case "recent": return <Clock className="h-2.5 w-2.5" />;
      case "suggestion": return <Zap className="h-2.5 w-2.5" />;
      default: return null;
    }
  };

  const categoryLabel = (c: CommandItem["category"]) => {
    switch (c) {
      case "recent": return "Recent";
      case "suggestion": return "Suggested";
      case "app": return "App";
      case "navigate": return "Navigate";
      case "action": return "Action";
    }
  };

  if (!open) return null;

  // Group items by category for section headers
  const grouped: { category: string; items: (CommandItem & { globalIdx: number })[] }[] = [];
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
        style={{
          background: "hsl(0 0% 0% / 0.4)",
          backdropFilter: "blur(8px)",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="w-full max-w-[560px] mx-4 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "hsl(var(--card) / 0.85)",
            backdropFilter: "blur(60px) saturate(1.8)",
            WebkitBackdropFilter: "blur(60px) saturate(1.8)",
            border: "1px solid hsl(var(--border) / 0.3)",
            boxShadow: "0 25px 80px -12px hsl(0 0% 0% / 0.5), 0 0 0 1px hsl(0 0% 100% / 0.05)",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/20">
            <Search className="h-5 w-5 text-muted-foreground/60 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Search apps, navigate, or run actions…"
              className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            <kbd className="hidden sm:inline-flex text-[10px] text-muted-foreground/40 bg-muted/50 px-2 py-0.5 rounded-md font-mono border border-border/20">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto py-2 px-2">
            {items.length === 0 && (
              <div className="py-12 text-center">
                <Sparkles className="h-6 w-6 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground/60">No results found</p>
                <p className="text-xs text-muted-foreground/40 mt-1">Try a different search term</p>
              </div>
            )}

            {grouped.map((group) => (
              <div key={group.category} className="mb-1">
                <div className="flex items-center gap-2 px-3 py-1.5">
                  {categoryIcon(group.items[0]?.category || "navigate")}
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40">
                    {categoryLabel(group.items[0]?.category || "navigate")}
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
                    <span className="text-lg shrink-0 w-7 text-center">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      {item.sublabel && (
                        <p className="text-[11px] text-muted-foreground/60 truncate">{item.sublabel}</p>
                      )}
                    </div>
                    {item.globalIdx === selectedIdx && (
                      <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
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
                <kbd className="bg-muted/40 px-1 py-0.5 rounded text-[9px] font-mono border border-border/15">↑</kbd>
                <kbd className="bg-muted/40 px-1 py-0.5 rounded text-[9px] font-mono border border-border/15">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-muted/40 px-1.5 py-0.5 rounded text-[9px] font-mono border border-border/15">↵</kbd>
                Open
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" /> SITA Spotlight
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommandPalette;
