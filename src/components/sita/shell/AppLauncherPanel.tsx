// ═══════════════════════════════════════════════════════════════
// SITA OS — App Launcher Panel
// Spotlight + Launchpad hybrid: search, suggestions, categories
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, Clock, Settings, Lock, Moon, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { useAppSurfacing } from "@/hooks/useAppSurfacing";
import type { AppDefinition, AppCategory } from "@/lib/app-platform/types";
import { SoundEngine } from "@/lib/sound-engine";

interface AppLauncherPanelProps {
  open: boolean;
  onClose: () => void;
  onLaunchApp: (appId: string) => void;
}

const CATEGORY_LABELS: Partial<Record<AppCategory, { label: string; icon: string }>> = {
  browsers: { label: "Browsers", icon: "🌐" },
  communication: { label: "Communication", icon: "💬" },
  productivity: { label: "Productivity", icon: "📋" },
  "developer-tools": { label: "Developer", icon: "🛠" },
  business: { label: "Business", icon: "💼" },
  finance: { label: "Finance", icon: "💰" },
  media: { label: "Media", icon: "🎵" },
  utilities: { label: "Utilities", icon: "⚙️" },
  household: { label: "Household", icon: "🏠" },
  security: { label: "Security", icon: "🔒" },
  education: { label: "Education", icon: "📚" },
  entertainment: { label: "Entertainment", icon: "🎮" },
};

interface SystemAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

export function AppLauncherPanel({ open, onClose, onLaunchApp }: AppLauncherPanelProps) {
  const { apps } = useAppPlatform();
  const { getRecentFlow, getTopApps } = useAppSurfacing();
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["browsers", "productivity", "utilities"]));
  const inputRef = useRef<HTMLInputElement>(null);

  const installedApps = useMemo(() =>
    apps.filter(a => a.installStatus === "installed"),
    [apps]
  );

  const recentFlow = getRecentFlow(3);
  const topApps = getTopApps(3);

  // Suggestions: combine recent + top
  const suggestions = useMemo(() => {
    const seen = new Set<string>();
    const result: AppDefinition[] = [];
    for (const entry of [...recentFlow.map(f => f.appId), ...topApps.map(t => t.appId)]) {
      if (seen.has(entry)) continue;
      seen.add(entry);
      const app = installedApps.find(a => a.id === entry);
      if (app) result.push(app);
      if (result.length >= 4) break;
    }
    return result;
  }, [recentFlow, topApps, installedApps]);

  // Filter apps by query
  const filtered = useMemo(() => {
    if (!query.trim()) return installedApps;
    const q = query.toLowerCase();
    return installedApps.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.tags?.some(t => t.toLowerCase().includes(q))
    );
  }, [query, installedApps]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, AppDefinition[]> = {};
    for (const app of filtered) {
      if (!groups[app.category]) groups[app.category] = [];
      groups[app.category].push(app);
    }
    return groups;
  }, [filtered]);

  // Flat list for keyboard navigation
  const flatList = useMemo(() => {
    if (query.trim()) return filtered;
    return suggestions;
  }, [query, filtered, suggestions]);

  const systemActions: SystemAction[] = useMemo(() => [
    { id: "settings", label: "Settings", icon: <Settings className="w-3.5 h-3.5" />, action: () => onLaunchApp("settings") },
    { id: "lock", label: "Lock Screen", icon: <Lock className="w-3.5 h-3.5" />, action: () => {} },
    { id: "dark-mode", label: "Toggle Dark Mode", icon: <Moon className="w-3.5 h-3.5" />, action: () => document.documentElement.classList.toggle("dark") },
  ], [onLaunchApp]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 100);
      SoundEngine.click();
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, flatList.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const app = flatList[selectedIdx];
      if (app) {
        onLaunchApp(app.id);
        onClose();
      }
    }
  }, [flatList, selectedIdx, onClose, onLaunchApp]);

  const handleAppClick = useCallback((appId: string) => {
    SoundEngine.click();
    onLaunchApp(appId);
    onClose();
  }, [onLaunchApp, onClose]);

  const toggleCategory = useCallback((cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] bg-[hsl(0_0%_0%/0.4)] backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 28, duration: 0.15 }}
            className={cn(
              "fixed z-[201] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "w-[90vw] max-w-[560px] max-h-[70vh]",
              "rounded-2xl overflow-hidden",
              "bg-[hsl(0_0%_0%/0.65)] backdrop-blur-[40px]",
              "border border-[hsl(0_0%_100%/0.15)]",
              "shadow-[0_4px_16px_hsl(0_0%_0%/0.2),0_24px_64px_hsl(0_0%_0%/0.35)]",
              "flex flex-col"
            )}
            onKeyDown={handleKeyDown}
          >
            {/* Search */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(0_0%_100%/0.08)]">
              <Search className="w-4 h-4 text-[hsl(0_0%_100%/0.4)] flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0); }}
                placeholder="Search apps, files, actions..."
                className="flex-1 bg-transparent text-sm text-[hsl(0_0%_100%/0.9)] placeholder:text-[hsl(0_0%_100%/0.3)] outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-[hsl(0_0%_100%/0.3)] hover:text-[hsl(0_0%_100%/0.6)]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-4">
              {/* Suggestions (when no query) */}
              {!query.trim() && suggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-1 mb-2">
                    <Sparkles className="w-3 h-3 text-[hsl(265_60%_65%)]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_100%/0.4)]">
                      Suggestions
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {suggestions.map((app, i) => (
                      <motion.button
                        key={app.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.15 }}
                        whileHover={{ scale: 1.06, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAppClick(app.id)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-colors",
                          "hover:bg-[hsl(0_0%_100%/0.08)]",
                          selectedIdx === i && !query && "bg-[hsl(0_0%_100%/0.10)] ring-1 ring-[hsl(265_60%_65%/0.4)]"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-base shadow-md", app.iconBg)}>
                          {app.icon}
                        </div>
                        <span className="text-[10px] text-[hsl(0_0%_100%/0.7)] truncate w-full text-center">{app.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categorized grid */}
              {Object.entries(grouped).map(([category, categoryApps]) => {
                const catInfo = CATEGORY_LABELS[category as AppCategory];
                const isExpanded = expandedCategories.has(category) || !!query.trim();
                const displayApps = isExpanded ? categoryApps : categoryApps.slice(0, 4);

                return (
                  <div key={category}>
                    <button
                      onClick={() => toggleCategory(category)}
                      className="flex items-center gap-1.5 px-1 mb-2 group w-full text-left"
                    >
                      <span className="text-xs">{catInfo?.icon ?? "📦"}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_100%/0.4)] group-hover:text-[hsl(0_0%_100%/0.6)]">
                        {catInfo?.label ?? category}
                      </span>
                      <span className="text-[9px] text-[hsl(0_0%_100%/0.25)] ml-auto">
                        {categoryApps.length}
                      </span>
                    </button>
                    <motion.div
                      layout
                      className="grid grid-cols-5 gap-1.5"
                    >
                      {displayApps.map((app) => (
                        <motion.button
                          key={app.id}
                          layout
                          whileHover={{ scale: 1.08, y: -2 }}
                          whileTap={{ scale: 0.93 }}
                          onClick={() => handleAppClick(app.id)}
                          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                        >
                          <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-sm shadow-sm", app.iconBg)}>
                            {app.icon}
                          </div>
                          <span className="text-[9px] text-[hsl(0_0%_100%/0.6)] truncate w-full text-center leading-tight">{app.name}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                    {!query.trim() && categoryApps.length > 4 && !isExpanded && (
                      <button
                        onClick={() => toggleCategory(category)}
                        className="text-[9px] text-[hsl(265_60%_65%/0.7)] hover:text-[hsl(265_60%_65%)] px-1 mt-1"
                      >
                        +{categoryApps.length - 4} more
                      </button>
                    )}
                  </div>
                );
              })}

              {/* System Actions */}
              {!query.trim() && (
                <div>
                  <div className="flex items-center gap-1.5 px-1 mb-2">
                    <Zap className="w-3 h-3 text-[hsl(45_80%_55%)]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_100%/0.4)]">
                      Quick Actions
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {systemActions.map(action => (
                      <button
                        key={action.id}
                        onClick={() => { action.action(); onClose(); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(0_0%_100%/0.05)] hover:bg-[hsl(0_0%_100%/0.10)] text-[hsl(0_0%_100%/0.6)] hover:text-[hsl(0_0%_100%/0.9)] text-[10px] transition-colors"
                      >
                        {action.icon}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {query.trim() && filtered.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[hsl(0_0%_100%/0.4)] text-sm">No results for "{query}"</p>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-[hsl(0_0%_100%/0.06)] flex items-center justify-between">
              <span className="text-[9px] text-[hsl(0_0%_100%/0.25)]">
                ↑↓ Navigate · ↵ Open · Esc Close
              </span>
              <span className="text-[9px] text-[hsl(0_0%_100%/0.25)]">
                {installedApps.length} apps
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
