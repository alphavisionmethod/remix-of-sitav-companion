// ═══════════════════════════════════════════════════════════════
// SITA OS — App Launcher Panel v2
// Spotlight + Launchpad hybrid: fuzzy search, app stacks,
// system commands, full keyboard navigation, match highlighting
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, Settings, Lock, Moon, Zap, ChevronDown, ChevronRight, Terminal, Volume2, Sun } from "lucide-react";
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

interface SystemCommand {
  id: string;
  label: string;
  keywords: string[];
  icon: React.ReactNode;
  action: () => void;
}

// Fuzzy match scoring: returns score (0 = no match, higher = better) + match indices
function fuzzyMatch(text: string, query: string): { score: number; indices: number[] } {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (!q) return { score: 1, indices: [] };

  // Exact substring match (highest)
  const substringIdx = t.indexOf(q);
  if (substringIdx !== -1) {
    const indices = Array.from({ length: q.length }, (_, i) => substringIdx + i);
    return { score: 100 - substringIdx, indices };
  }

  // Fuzzy character match
  let qi = 0;
  const indices: number[] = [];
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      indices.push(ti);
      qi++;
    }
  }
  if (qi < q.length) return { score: 0, indices: [] };
  // Score based on how consecutive / early the matches are
  let score = 10;
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] === indices[i - 1] + 1) score += 5; // consecutive bonus
  }
  score -= indices[0]; // earlier start = better
  return { score: Math.max(1, score), indices };
}

function HighlightedText({ text, indices }: { text: string; indices: number[] }) {
  if (indices.length === 0) return <>{text}</>;
  const set = new Set(indices);
  return (
    <>
      {text.split("").map((ch, i) =>
        set.has(i) ? (
          <span key={i} className="text-[hsl(265_60%_70%)] font-semibold">{ch}</span>
        ) : (
          <span key={i}>{ch}</span>
        )
      )}
    </>
  );
}

export function AppLauncherPanel({ open, onClose, onLaunchApp }: AppLauncherPanelProps) {
  const { apps } = useAppPlatform();
  const { getRecentFlow, getTopApps } = useAppSurfacing();
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["browsers", "productivity", "utilities"]));
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const installedApps = useMemo(() => apps.filter(a => a.installStatus === "installed"), [apps]);
  const recentFlow = getRecentFlow(3);
  const topApps = getTopApps(3);

  const systemCommands: SystemCommand[] = useMemo(() => [
    { id: "cmd-settings", label: "Open Settings", keywords: ["settings", "preferences", "config"], icon: <Settings className="w-3.5 h-3.5" />, action: () => onLaunchApp("settings") },
    { id: "cmd-lock", label: "Lock Screen", keywords: ["lock", "security"], icon: <Lock className="w-3.5 h-3.5" />, action: () => {} },
    { id: "cmd-dark", label: "Toggle Dark Mode", keywords: ["dark", "light", "theme", "mode", "appearance"], icon: <Moon className="w-3.5 h-3.5" />, action: () => document.documentElement.classList.toggle("dark") },
    { id: "cmd-terminal", label: "Open Terminal", keywords: ["terminal", "console", "shell", "command"], icon: <Terminal className="w-3.5 h-3.5" />, action: () => onLaunchApp("terminal") },
  ], [onLaunchApp]);

  // Suggestions
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

  // Fuzzy search with weighted scoring
  const searchResults = useMemo(() => {
    if (!query.trim()) return { apps: installedApps, commands: [], appMatches: new Map<string, number[]>() };
    const q = query.trim();
    const appMatches = new Map<string, number[]>();
    const scored: { app: AppDefinition; score: number }[] = [];

    for (const app of installedApps) {
      const nameMatch = fuzzyMatch(app.name, q);
      const catMatch = fuzzyMatch(app.category, q);
      const tagMatch = app.tags?.reduce((best, tag) => {
        const m = fuzzyMatch(tag, q);
        return m.score > best.score ? m : best;
      }, { score: 0, indices: [] as number[] }) ?? { score: 0, indices: [] };

      const bestScore = nameMatch.score * 3 + catMatch.score * 1.5 + tagMatch.score;
      if (bestScore > 0) {
        scored.push({ app, score: bestScore });
        appMatches.set(app.id, nameMatch.indices);
      }
    }

    scored.sort((a, b) => b.score - a.score);

    const matchedCommands = systemCommands.filter(cmd => {
      const labelMatch = fuzzyMatch(cmd.label, q);
      const keywordMatch = cmd.keywords.some(kw => fuzzyMatch(kw, q).score > 0);
      return labelMatch.score > 0 || keywordMatch;
    });

    return { apps: scored.map(s => s.app), commands: matchedCommands, appMatches };
  }, [query, installedApps, systemCommands]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, AppDefinition[]> = {};
    for (const app of searchResults.apps) {
      if (!groups[app.category]) groups[app.category] = [];
      groups[app.category].push(app);
    }
    return groups;
  }, [searchResults.apps]);

  // Flat list for keyboard nav: suggestions (or search results) + commands
  const flatItems = useMemo((): Array<{ type: "app"; app: AppDefinition } | { type: "command"; command: SystemCommand }> => {
    const items: Array<{ type: "app"; app: AppDefinition } | { type: "command"; command: SystemCommand }> = [];
    if (query.trim()) {
      for (const app of searchResults.apps) items.push({ type: "app", app });
      for (const cmd of searchResults.commands) items.push({ type: "command", command: cmd });
    } else {
      for (const app of suggestions) items.push({ type: "app", app });
    }
    return items;
  }, [query, searchResults, suggestions]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 100);
      SoundEngine.click();
    }
  }, [open]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === "Tab") {
      e.preventDefault();
      setSelectedIdx(i => (i + 1) % Math.max(flatItems.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flatItems[selectedIdx];
      if (item?.type === "app") { onLaunchApp(item.app.id); onClose(); }
      else if (item?.type === "command") { item.command.action(); onClose(); }
    }
  }, [flatItems, selectedIdx, onClose, onLaunchApp]);

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] bg-[hsl(0_0%_0%/0.4)] backdrop-blur-sm"
            onClick={onClose}
          />

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
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search apps, commands, actions..."
                className="flex-1 bg-transparent text-sm text-[hsl(0_0%_100%/0.9)] placeholder:text-[hsl(0_0%_100%/0.3)] outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-[hsl(0_0%_100%/0.3)] hover:text-[hsl(0_0%_100%/0.6)]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-4">
              {/* Suggestions (no query) */}
              {!query.trim() && suggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-1 mb-2">
                    <Sparkles className="w-3 h-3 text-[hsl(265_60%_65%)]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_100%/0.4)]">
                      Continue where you left off
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
                        whileTap={{ scale: 0.93 }}
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

              {/* Search result: matched commands */}
              {query.trim() && searchResults.commands.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-1 mb-2">
                    <Zap className="w-3 h-3 text-[hsl(45_80%_55%)]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_100%/0.4)]">Commands</span>
                  </div>
                  <div className="space-y-0.5">
                    {searchResults.commands.map((cmd) => {
                      const cmdIdx = flatItems.findIndex(fi => fi.type === "command" && (fi as any).command.id === cmd.id);
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => { cmd.action(); onClose(); }}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-colors",
                            "text-[hsl(0_0%_100%/0.7)] hover:bg-[hsl(0_0%_100%/0.08)]",
                            selectedIdx === cmdIdx && "bg-[hsl(0_0%_100%/0.10)] ring-1 ring-[hsl(265_60%_65%/0.3)]"
                          )}
                        >
                          <span className="text-[hsl(0_0%_100%/0.5)]">{cmd.icon}</span>
                          {cmd.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* App Stacks (categorized grid) */}
              {Object.entries(grouped).map(([category, categoryApps]) => {
                const catInfo = CATEGORY_LABELS[category as AppCategory];
                const isExpanded = expandedCategories.has(category) || !!query.trim();
                const displayApps = isExpanded ? categoryApps : [];
                const isCollapsed = !isExpanded && !query.trim();

                return (
                  <div key={category}>
                    <button
                      onClick={() => toggleCategory(category)}
                      className="flex items-center gap-1.5 px-1 mb-2 group w-full text-left"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-3 h-3 text-[hsl(0_0%_100%/0.3)] group-hover:text-[hsl(0_0%_100%/0.5)] transition-colors" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-[hsl(0_0%_100%/0.3)] group-hover:text-[hsl(0_0%_100%/0.5)] transition-colors" />
                      )}
                      <span className="text-xs">{catInfo?.icon ?? "📦"}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_100%/0.4)] group-hover:text-[hsl(0_0%_100%/0.6)]">
                        {catInfo?.label ?? category}
                      </span>
                      <span className="text-[9px] text-[hsl(0_0%_100%/0.25)] ml-auto">{categoryApps.length}</span>
                      {/* Stack preview when collapsed */}
                      {isCollapsed && (
                        <div className="flex -space-x-2 ml-2">
                          {categoryApps.slice(0, 3).map((app, si) => (
                            <div
                              key={app.id}
                              className={cn("w-6 h-6 rounded-md bg-gradient-to-br flex items-center justify-center text-[10px] shadow-sm border border-[hsl(0_0%_0%/0.3)]", app.iconBg)}
                              style={{ zIndex: 3 - si, transform: `translateY(${si * -1}px)` }}
                            >
                              {app.icon}
                            </div>
                          ))}
                        </div>
                      )}
                    </button>
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-5 gap-1.5">
                            {displayApps.map((app, di) => {
                              const matchIndices = searchResults.appMatches.get(app.id) ?? [];
                              const appIdx = flatItems.findIndex(fi => fi.type === "app" && fi.app.id === app.id);
                              return (
                                <motion.button
                                  key={app.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: di * 0.015, duration: 0.12 }}
                                  whileHover={{ scale: 1.08, y: -2 }}
                                  whileTap={{ scale: 0.91 }}
                                  onClick={() => handleAppClick(app.id)}
                                  className={cn(
                                    "flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[hsl(0_0%_100%/0.06)] transition-colors",
                                    query.trim() && appIdx === selectedIdx && "bg-[hsl(0_0%_100%/0.10)] ring-1 ring-[hsl(265_60%_65%/0.3)]"
                                  )}
                                >
                                  <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-sm shadow-sm", app.iconBg)}>
                                    {app.icon}
                                  </div>
                                  <span className="text-[9px] text-[hsl(0_0%_100%/0.6)] truncate w-full text-center leading-tight">
                                    {query.trim() && matchIndices.length > 0 ? (
                                      <HighlightedText text={app.name} indices={matchIndices} />
                                    ) : app.name}
                                  </span>
                                </motion.button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Quick Actions (no query) */}
              {!query.trim() && (
                <div>
                  <div className="flex items-center gap-1.5 px-1 mb-2">
                    <Zap className="w-3 h-3 text-[hsl(45_80%_55%)]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_100%/0.4)]">Quick Actions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {systemCommands.map(cmd => (
                      <button
                        key={cmd.id}
                        onClick={() => { cmd.action(); onClose(); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(0_0%_100%/0.05)] hover:bg-[hsl(0_0%_100%/0.10)] text-[hsl(0_0%_100%/0.6)] hover:text-[hsl(0_0%_100%/0.9)] text-[10px] transition-colors"
                      >
                        {cmd.icon}
                        {cmd.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {query.trim() && searchResults.apps.length === 0 && searchResults.commands.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[hsl(0_0%_100%/0.4)] text-sm">No results for "{query}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-[hsl(0_0%_100%/0.06)] flex items-center justify-between">
              <span className="text-[9px] text-[hsl(0_0%_100%/0.25)]">
                ↑↓ Navigate · Tab Cycle · ↵ Open · Esc Close
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
