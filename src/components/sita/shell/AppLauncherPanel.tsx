// ═══════════════════════════════════════════════════════════════
// SITA OS — App Launcher Panel v3 (Deepin-style two-panel)
// Left: scrollable app list with category sidebar
// Right: frequently used grid + search
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Power, Globe, MessageSquare, Briefcase, DollarSign, Music, Settings, Wrench, Home, Shield, BookOpen, Gamepad2, FolderOpen, Cpu } from "lucide-react";
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

const CATEGORY_META: Partial<Record<AppCategory, { label: string; icon: React.ReactNode }>> = {
  browsers: { label: "Internet", icon: <Globe className="w-4 h-4" /> },
  communication: { label: "Chat", icon: <MessageSquare className="w-4 h-4" /> },
  productivity: { label: "Work", icon: <FolderOpen className="w-4 h-4" /> },
  "developer-tools": { label: "Dev", icon: <Wrench className="w-4 h-4" /> },
  business: { label: "Business", icon: <Briefcase className="w-4 h-4" /> },
  finance: { label: "Finance", icon: <DollarSign className="w-4 h-4" /> },
  media: { label: "Media", icon: <Music className="w-4 h-4" /> },
  utilities: { label: "System", icon: <Settings className="w-4 h-4" /> },
  household: { label: "Home", icon: <Home className="w-4 h-4" /> },
  security: { label: "Security", icon: <Shield className="w-4 h-4" /> },
  education: { label: "Learn", icon: <BookOpen className="w-4 h-4" /> },
  entertainment: { label: "Fun", icon: <Gamepad2 className="w-4 h-4" /> },
};

function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (!q) return true;
  if (t.includes(q)) return true;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi >= q.length;
}

export function AppLauncherPanel({ open, onClose, onLaunchApp }: AppLauncherPanelProps) {
  const { apps } = useAppPlatform();
  const { getRecentFlow, getTopApps } = useAppSurfacing();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const installedApps = useMemo(() => apps.filter(a => a.installStatus === "installed"), [apps]);

  // Frequently used: mix of recent + top
  const frequentApps = useMemo(() => {
    const recentFlow = getRecentFlow(8);
    const topApps = getTopApps(8);
    const seen = new Set<string>();
    const result: AppDefinition[] = [];
    for (const entry of [...recentFlow.map(f => f.appId), ...topApps.map(t => t.appId)]) {
      if (seen.has(entry)) continue;
      seen.add(entry);
      const app = installedApps.find(a => a.id === entry);
      if (app) result.push(app);
      if (result.length >= 12) break;
    }
    // Fill with first installed if not enough
    if (result.length < 8) {
      for (const app of installedApps) {
        if (!seen.has(app.id)) { result.push(app); seen.add(app.id); }
        if (result.length >= 12) break;
      }
    }
    return result;
  }, [getRecentFlow, getTopApps, installedApps]);

  // Categories that exist
  const categories = useMemo(() => {
    const cats = new Set<string>();
    installedApps.forEach(a => cats.add(a.category));
    return Array.from(cats);
  }, [installedApps]);

  // Filtered app list for left panel
  const filteredApps = useMemo(() => {
    let list = installedApps;
    if (activeCategory) list = list.filter(a => a.category === activeCategory);
    if (query.trim()) list = list.filter(a => fuzzyMatch(a.name, query) || fuzzyMatch(a.category, query));
    return list;
  }, [installedApps, activeCategory, query]);

  // Filtered frequent apps for right panel
  const filteredFrequent = useMemo(() => {
    if (!query.trim()) return frequentApps;
    return frequentApps.filter(a => fuzzyMatch(a.name, query));
  }, [frequentApps, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveCategory(null);
      setTimeout(() => inputRef.current?.focus(), 150);
      SoundEngine.click();
    }
  }, [open]);

  const handleAppClick = useCallback((appId: string) => {
    SoundEngine.click();
    onLaunchApp(appId);
    onClose();
  }, [onLaunchApp, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

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
            className="fixed inset-0 z-[200]"
            onClick={onClose}
          />

          {/* Launcher Panel — anchored bottom-left above dock */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className={cn(
              "fixed z-[201] bottom-20 left-4",
              "w-[620px] h-[480px]",
              "rounded-2xl overflow-hidden",
              "bg-[hsl(0_0%_0%/0.55)] backdrop-blur-[60px]",
              "border border-[hsl(0_0%_100%/0.12)]",
              "shadow-[0_8px_40px_hsl(0_0%_0%/0.4),0_2px_8px_hsl(0_0%_0%/0.2)]",
              "flex"
            )}
            onKeyDown={handleKeyDown}
          >
            {/* ── Category Sidebar (icon strip) ── */}
            <div className="w-12 flex flex-col items-center py-3 gap-1 border-r border-[hsl(0_0%_100%/0.06)]">
              {/* All apps */}
              <button
                onClick={() => setActiveCategory(null)}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150",
                  !activeCategory
                    ? "bg-[hsl(210_80%_55%/0.25)] text-[hsl(210_80%_70%)]"
                    : "text-[hsl(0_0%_100%/0.35)] hover:text-[hsl(0_0%_100%/0.6)] hover:bg-[hsl(0_0%_100%/0.06)]"
                )}
                title="All Apps"
              >
                <Cpu className="w-4 h-4" />
              </button>

              {categories.map(cat => {
                const meta = CATEGORY_META[cat as AppCategory];
                if (!meta) return null;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(isActive ? null : cat)}
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150",
                      isActive
                        ? "bg-[hsl(210_80%_55%/0.25)] text-[hsl(210_80%_70%)]"
                        : "text-[hsl(0_0%_100%/0.35)] hover:text-[hsl(0_0%_100%/0.6)] hover:bg-[hsl(0_0%_100%/0.06)]"
                    )}
                    title={meta.label}
                  >
                    {meta.icon}
                  </button>
                );
              })}

              <div className="flex-1" />

              {/* Power / Logout */}
              <button
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[hsl(0_0%_100%/0.3)] hover:text-[hsl(0_70%_60%)] hover:bg-[hsl(0_70%_60%/0.12)] transition-all duration-150"
                title="Log Out"
              >
                <Power className="w-4 h-4" />
              </button>
            </div>

            {/* ── Left Panel: App List ── */}
            <div className="w-[220px] flex flex-col border-r border-[hsl(0_0%_100%/0.06)]">
              <div className="px-3 pt-3 pb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_100%/0.35)]">
                  {activeCategory ? CATEGORY_META[activeCategory as AppCategory]?.label || activeCategory : "All Apps"}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin px-1.5 pb-2">
                {filteredApps.map((app, i) => (
                  <motion.button
                    key={app.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.015, 0.3), duration: 0.15 }}
                    onClick={() => handleAppClick(app.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-100",
                      "hover:bg-[hsl(0_0%_100%/0.08)] group"
                    )}
                  >
                    <div className={cn("w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center text-sm flex-shrink-0 shadow-sm", app.iconBg)}>
                      {app.icon}
                    </div>
                    <span className="text-[12px] text-[hsl(0_0%_100%/0.75)] group-hover:text-[hsl(0_0%_100%/0.95)] truncate text-left">
                      {app.name}
                    </span>
                  </motion.button>
                ))}

                {filteredApps.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-[hsl(0_0%_100%/0.3)] text-xs">No apps found</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right Panel: Frequently Used + Search ── */}
            <div className="flex-1 flex flex-col">
              <div className="px-4 pt-3 pb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_100%/0.35)]">
                  Frequently Used
                </span>
              </div>

              <div className="flex-1 overflow-y-auto px-3 pb-2">
                <div className="grid grid-cols-4 gap-1">
                  {filteredFrequent.map((app, i) => (
                    <motion.button
                      key={app.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(i * 0.025, 0.3), duration: 0.15 }}
                      whileHover={{ scale: 1.06, y: -2 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleAppClick(app.id)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                    >
                      <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-lg shadow-md", app.iconBg)}>
                        {app.icon}
                      </div>
                      <span className="text-[10px] text-[hsl(0_0%_100%/0.65)] truncate w-full text-center">
                        {app.name}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {filteredFrequent.length === 0 && query.trim() && (
                  <div className="text-center py-8">
                    <p className="text-[hsl(0_0%_100%/0.3)] text-xs">No matches</p>
                  </div>
                )}
              </div>

              {/* Search Bar at bottom */}
              <div className="px-3 pb-3 pt-1">
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[hsl(0_0%_100%/0.06)] border border-[hsl(0_0%_100%/0.08)] transition-colors focus-within:bg-[hsl(0_0%_100%/0.08)] focus-within:border-[hsl(0_0%_100%/0.15)]">
                  <Search className="w-3.5 h-3.5 text-[hsl(0_0%_100%/0.3)] flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search apps..."
                    className="flex-1 bg-transparent text-[12px] text-[hsl(0_0%_100%/0.9)] placeholder:text-[hsl(0_0%_100%/0.3)] outline-none"
                  />
                  {query && (
                    <button onClick={() => setQuery("")} className="text-[hsl(0_0%_100%/0.3)] hover:text-[hsl(0_0%_100%/0.6)]">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
