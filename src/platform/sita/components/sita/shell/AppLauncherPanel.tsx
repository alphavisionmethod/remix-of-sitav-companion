// ═══════════════════════════════════════════════════════════════
// SITA OS — App Launcher Panel v2.1.1 (Production-Grade)
// Deepin-style two-panel with full keyboard nav, accessibility,
// badges, install CTAs, quick actions, pinned section
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Power, Globe, MessageSquare, Briefcase,
  DollarSign, Music, Settings, Wrench, Home, Shield,
  BookOpen, Gamepad2, FolderOpen, Cpu, Pin, PinOff,
  Lock, Download, ChevronRight, Sparkles, Star, LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/platform/app-platform/contexts/AppPlatformContext";
import { useLauncherViewModel, type LauncherAppItem, type AppInstallCTA } from "@/hooks/useLauncherViewModel";
import type { AppCategory } from "@/domains/apps/types";
import { SoundEngine } from "@/platform/runtime/sound-engine";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PillarRail } from "@/platform/sita/components/sita/shell/PillarRail";

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

// ── CTA rendering ───────────────────────────────────────────────

function CTABadge({ cta }: { cta: AppInstallCTA }) {
  switch (cta) {
    case "install":
      return (
        <span className="flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[hsl(210_80%_55%/0.2)] text-[hsl(210_80%_70%)]">
          <Download className="w-2.5 h-2.5" /> Install
        </span>
      );
    case "locked":
      return (
        <span className="flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_100%/0.3)]">
          <Lock className="w-2.5 h-2.5" /> Locked
        </span>
      );
    case "request-access":
      return (
        <span className="flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[hsl(40_80%_55%/0.2)] text-[hsl(40_80%_65%)]">
          <Lock className="w-2.5 h-2.5" /> Request
        </span>
      );
    case "update":
      return (
        <span className="flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[hsl(130_60%_45%/0.2)] text-[hsl(130_60%_65%)]">
          <Sparkles className="w-2.5 h-2.5" /> Update
        </span>
      );
    default:
      return null;
  }
}

// ── Badge indicator ─────────────────────────────────────────────

function AppBadge({ item }: { item: LauncherAppItem }) {
  if (item.badgeCount > 0) {
    return (
      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold rounded-full bg-[hsl(0_72%_51%)] text-[hsl(0_0%_100%)]">
        {item.badgeCount > 99 ? "99+" : item.badgeCount}
      </span>
    );
  }
  if (item.isNew) {
    return (
      <span className="absolute -top-1 -right-1 px-1 py-0.5 text-[7px] font-bold uppercase rounded-full bg-[hsl(210_80%_55%)] text-[hsl(0_0%_100%)]">
        New
      </span>
    );
  }
  if (item.hasUpdate) {
    return (
      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[hsl(130_60%_50%)] border border-[hsl(0_0%_0%/0.3)]" />
    );
  }
  return null;
}

export function AppLauncherPanel({ open, onClose, onLaunchApp }: AppLauncherPanelProps) {
  const { pinToDock, unpinFromDock } = useAppPlatform();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [focusIndex, setFocusIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { viewModel, launchApp, handleInstall, trackPin, trackQuickAction } = useLauncherViewModel(query, activeCategory, open);

  // Flat list of items for keyboard navigation
  const flatItems = useMemo((): LauncherAppItem[] => {
    if (viewModel.searchResults) return viewModel.searchResults;
    // Combine all left-panel items
    const items: LauncherAppItem[] = [];
    for (const group of viewModel.allAppsGrouped) {
      items.push(...group.apps);
    }
    return items;
  }, [viewModel]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveCategory(null);
      setFocusIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 150);
      SoundEngine.click();
    }
  }, [open]);

  const handleAppAction = useCallback((item: LauncherAppItem) => {
    SoundEngine.click();
    if (item.cta === "open" || item.cta === "update") {
      launchApp(item.app.id, onLaunchApp);
      onClose();
    } else if (item.cta === "install") {
      handleInstall(item.app.id);
    }
  }, [launchApp, onLaunchApp, onClose, handleInstall]);

  const handleTogglePin = useCallback((appId: string, isPinned: boolean) => {
    SoundEngine.click();
    if (isPinned) {
      unpinFromDock(appId);
      trackPin(appId, false);
    } else {
      pinToDock(appId);
      trackPin(appId, true);
    }
  }, [pinToDock, unpinFromDock, trackPin]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Escape":
        onClose();
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusIndex(prev => Math.min(prev + 1, flatItems.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIndex(prev => Math.max(prev - 1, -1));
        break;
      case "Enter":
        if (focusIndex >= 0 && focusIndex < flatItems.length) {
          handleAppAction(flatItems[focusIndex]);
        }
        break;
      case "/":
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          inputRef.current?.focus();
          setFocusIndex(-1);
        }
        break;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      inputRef.current?.focus();
      setFocusIndex(-1);
    }
  }, [onClose, flatItems, focusIndex, handleAppAction]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-launcher-item]");
      items[focusIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [focusIndex]);

  // Screen reader live region
  const srAnnouncement = useMemo(() => {
    if (viewModel.searchResults) {
      return `${viewModel.searchResults.length} app${viewModel.searchResults.length !== 1 ? "s" : ""} found`;
    }
    return "";
  }, [viewModel.searchResults]);

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
            aria-hidden="true"
          />

          {/* Launcher Panel */}
          <motion.div
            role="dialog"
            aria-label="App Launcher"
            aria-modal="true"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className={cn(
              "fixed z-[201] bottom-20 left-4",
              "w-[660px] h-[520px]",
              "rounded-2xl overflow-hidden",
              "bg-[hsl(0_0%_0%/0.55)] backdrop-blur-[60px]",
              "border border-[hsl(0_0%_100%/0.12)]",
              "shadow-[0_8px_40px_hsl(0_0%_0%/0.4),0_2px_8px_hsl(0_0%_0%/0.2)]",
              "flex"
            )}
            onKeyDown={handleKeyDown}
          >
            {/* SR live region */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {srAnnouncement}
            </div>

            {/* ── Category Sidebar ── */}
            <nav className="w-12 flex flex-col items-center py-3 gap-1 border-r border-[hsl(0_0%_100%/0.06)]" aria-label="App categories">
              <button
                onClick={() => { setActiveCategory(null); setFocusIndex(-1); }}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150",
                  !activeCategory
                    ? "bg-[hsl(210_80%_55%/0.25)] text-[hsl(210_80%_70%)]"
                    : "text-[hsl(0_0%_100%/0.35)] hover:text-[hsl(0_0%_100%/0.6)] hover:bg-[hsl(0_0%_100%/0.06)]"
                )}
                title="All Apps"
                aria-label="All Apps"
                aria-pressed={!activeCategory}
              >
                <Cpu className="w-4 h-4" />
              </button>

              {viewModel.categories.map(cat => {
                const meta = CATEGORY_META[cat.key as AppCategory];
                if (!meta) return null;
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => { setActiveCategory(isActive ? null : cat.key); setFocusIndex(-1); }}
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150",
                      isActive
                        ? "bg-[hsl(210_80%_55%/0.25)] text-[hsl(210_80%_70%)]"
                        : "text-[hsl(0_0%_100%/0.35)] hover:text-[hsl(0_0%_100%/0.6)] hover:bg-[hsl(0_0%_100%/0.06)]"
                    )}
                    title={`${meta.label} (${cat.count})`}
                    aria-label={`${meta.label}, ${cat.count} apps`}
                    aria-pressed={isActive}
                  >
                    {meta.icon}
                  </button>
                );
              })}

              <div className="flex-1" />
              <button
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[hsl(0_0%_100%/0.3)] hover:text-[hsl(0_70%_60%)] hover:bg-[hsl(0_70%_60%/0.12)] transition-all duration-150"
                title="Log Out"
                aria-label="Log Out"
              >
                <Power className="w-4 h-4" />
              </button>
            </nav>

            {/* ── Left Panel: App List ── */}
            <div className="w-[240px] flex flex-col border-r border-[hsl(0_0%_100%/0.06)]">
              <div className="px-3 pt-3 pb-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_100%/0.35)]">
                  {activeCategory ? CATEGORY_META[activeCategory as AppCategory]?.label || activeCategory : "All Apps"}
                </span>
                <span className="text-[9px] text-[hsl(0_0%_100%/0.25)]">
                  {flatItems.length}
                </span>
              </div>

              <div ref={listRef} className="flex-1 overflow-y-auto scrollbar-thin px-1.5 pb-2" role="listbox" aria-label="App list">
                {flatItems.map((item, i) => {
                  const isFocused = focusIndex === i;
                  const isLocked = item.cta === "locked" || item.cta === "request-access";
                  return (
                    <div
                      key={item.app.id}
                      data-launcher-item
                      role="option"
                      aria-selected={isFocused}
                      aria-label={`${item.app.name}${item.cta !== "open" ? `, ${item.cta}` : ""}`}
                      draggable={item.app.installStatus === "installed"}
                      onDragStart={(e) => {
                        if (item.app.installStatus !== "installed") { e.preventDefault(); return; }
                        e.dataTransfer.effectAllowed = "copy";
                        e.dataTransfer.setData("application/x-sita-app", item.app.id);
                        e.dataTransfer.setData("text/plain", item.app.name);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-100 group min-h-[44px]",
                        item.app.installStatus === "installed" ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
                        isFocused
                          ? "bg-[hsl(210_80%_55%/0.2)] ring-1 ring-[hsl(210_80%_55%/0.3)]"
                          : "hover:bg-[hsl(0_0%_100%/0.08)]",
                        isLocked && "opacity-50"
                      )}
                      onClick={() => handleAppAction(item)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (item.app.installStatus === "installed") {
                          handleTogglePin(item.app.id, item.isPinned);
                        }
                      }}
                    >
                      <div className="relative flex-shrink-0">
                        <div className={cn(
                          "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-sm shadow-sm",
                          item.app.iconBg,
                          item.firstLaunch && "animate-pulse"
                        )}>
                          {item.app.icon}
                        </div>
                        <AppBadge item={item} />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col">
                        <span className={cn(
                          "text-[12px] truncate text-left",
                          isFocused ? "text-[hsl(0_0%_100%/0.95)]" : "text-[hsl(0_0%_100%/0.75)] group-hover:text-[hsl(0_0%_100%/0.95)]"
                        )}>
                          {item.app.name}
                        </span>
                      </div>

                      {/* CTA / Pin indicator */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {item.isPinned && (
                          <Star className="w-3 h-3 text-[hsl(45_90%_55%/0.6)] fill-[hsl(45_90%_55%/0.4)]" />
                        )}
                        <CTABadge cta={item.cta} />
                      </div>
                    </div>
                  );
                })}

                {flatItems.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-[hsl(0_0%_100%/0.3)] text-xs">
                      {query.trim() ? "No apps match your search" : "No apps in this category"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right Panel: Pinned → Recent → Quick Actions ── */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 overflow-y-auto px-3 pb-2">
                {/* SITA OS Pillars — canonical 4 + Trust Center */}
                {!query.trim() && (
                  <div className="pt-3" data-testid="launcher-pillar-rail">
                    <div className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_100%/0.45)]">
                      Pillars
                    </div>
                    <PillarRail />
                  </div>
                )}
                {/* Desktop Widgets shortcut — opens the Widget Gallery */}
                <button
                  type="button"
                  onClick={() => {
                    SoundEngine.click();
                    window.dispatchEvent(new CustomEvent("sita-open-widget-picker"));
                    onClose();
                  }}
                  className="mt-3 w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-[hsl(210_80%_55%/0.10)] border border-[hsl(210_80%_55%/0.18)] hover:bg-[hsl(210_80%_55%/0.18)] hover:border-[hsl(210_80%_55%/0.28)] transition-all duration-150 group"
                  data-testid="launcher-widgets-shortcut"
                  aria-label="Open Desktop Widget Gallery — add or remove widgets"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(210_80%_55%)] to-[hsl(265_60%_55%)] flex items-center justify-center text-[hsl(0_0%_100%)] shadow-sm">
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-[12px] font-medium text-[hsl(0_0%_100%/0.9)] truncate">
                      Widgets
                    </div>
                    <div className="text-[10px] text-[hsl(0_0%_100%/0.5)] truncate">
                      Add or remove desktop widgets
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[hsl(0_0%_100%/0.35)] group-hover:text-[hsl(0_0%_100%/0.7)] transition-colors flex-shrink-0" />
                </button>

                {viewModel.pinnedSection.apps.length > 0 && !query.trim() && (
                  <div className="pt-3 pb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_100%/0.35)] px-1">
                      ★ Pinned
                    </span>
                    <div className="grid grid-cols-4 gap-1 mt-2">
                      {viewModel.pinnedSection.apps.map((item, i) => (
                        <AppGridItem key={item.app.id} item={item} index={i} onClick={handleAppAction} onTogglePin={handleTogglePin} onQuickAction={trackQuickAction} onLaunchApp={onLaunchApp} onClose={onClose} />
                      ))}
                    </div>
                  </div>
                )}

                {/* No pinned prompt */}
                {viewModel.pinnedSection.apps.length === 0 && !query.trim() && (
                  <div className="pt-3 pb-1 px-1">
                    <p className="text-[10px] text-[hsl(0_0%_100%/0.2)] italic">
                      Right-click an app to pin it here
                    </p>
                  </div>
                )}

                {/* Recent / Frequently Used */}
                {!query.trim() && viewModel.recentSection.apps.length > 0 && (
                  <div className="pt-2 pb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_100%/0.35)] px-1">
                      Frequently Used
                    </span>
                    <div className="grid grid-cols-4 gap-1 mt-2">
                      {viewModel.recentSection.apps.slice(0, 12).map((item, i) => (
                        <AppGridItem key={item.app.id} item={item} index={i} onClick={handleAppAction} onTogglePin={handleTogglePin} onQuickAction={trackQuickAction} onLaunchApp={onLaunchApp} onClose={onClose} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Search results grid */}
                {query.trim() && viewModel.searchResults && (
                  <div className="pt-3 pb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_100%/0.35)] px-1">
                      Results ({viewModel.searchResults.length})
                    </span>
                    <div className="grid grid-cols-4 gap-1 mt-2">
                      {viewModel.searchResults.slice(0, 16).map((item, i) => (
                        <AppGridItem key={item.app.id} item={item} index={i} onClick={handleAppAction} onTogglePin={handleTogglePin} onQuickAction={trackQuickAction} onLaunchApp={onLaunchApp} onClose={onClose} />
                      ))}
                    </div>
                    {viewModel.searchResults.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-[hsl(0_0%_100%/0.3)] text-xs">No apps match "{query}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Search Bar */}
              <div className="px-3 pb-3 pt-1">
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[hsl(0_0%_100%/0.06)] border border-[hsl(0_0%_100%/0.08)] transition-colors focus-within:bg-[hsl(0_0%_100%/0.08)] focus-within:border-[hsl(0_0%_100%/0.15)]">
                  <Search className="w-3.5 h-3.5 text-[hsl(0_0%_100%/0.3)] flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setFocusIndex(-1); }}
                    placeholder="Search apps…  ⌘K"
                    className="flex-1 bg-transparent text-[12px] text-[hsl(0_0%_100%/0.9)] placeholder:text-[hsl(0_0%_100%/0.3)] outline-none"
                    role="searchbox"
                    aria-label="Search apps"
                    aria-autocomplete="list"
                  />
                  {query && (
                    <button onClick={() => { setQuery(""); setFocusIndex(-1); }} className="text-[hsl(0_0%_100%/0.3)] hover:text-[hsl(0_0%_100%/0.6)]" aria-label="Clear search">
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

// ── Grid Item with quick action popover ─────────────────────────

interface AppGridItemProps {
  item: LauncherAppItem;
  index: number;
  onClick: (item: LauncherAppItem) => void;
  onTogglePin: (appId: string, isPinned: boolean) => void;
  onQuickAction: (appId: string, actionId: string) => void;
  onLaunchApp: (appId: string) => void;
  onClose: () => void;
}

function AppGridItem({ item, index, onClick, onTogglePin, onQuickAction, onLaunchApp, onClose }: AppGridItemProps) {
  const hasQuickActions = item.app.quickActions && item.app.quickActions.length > 0;
  const isLocked = item.cta === "locked" || item.cta === "request-access";
  const isInstalled = item.app.installStatus === "installed";
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Close context menu on outside click / scroll / escape
  useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setCtxMenu(null); };
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [ctxMenu]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInstalled) return;
    setCtxMenu({ x: e.clientX, y: e.clientY });
  }, [isInstalled]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (!isInstalled) { e.preventDefault(); return; }
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/x-sita-app", item.app.id);
    e.dataTransfer.setData("text/plain", item.app.name);
    setIsDragging(true);
  }, [isInstalled, item.app.id, item.app.name]);

  const handleDragEnd = useCallback(() => setIsDragging(false), []);

  const gridButton = (
    <div
      draggable={isInstalled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(isDragging && "opacity-40 scale-95", isInstalled && "cursor-grab active:cursor-grabbing")}
    >
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.15 }}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => onClick(item)}
        onContextMenu={handleContextMenu}
        className={cn(
          "flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-[hsl(0_0%_100%/0.06)] transition-all min-h-[44px] min-w-[44px]",
          isLocked && "opacity-40",
        )}
        aria-label={`${item.app.name}${item.cta !== "open" ? `, ${item.cta}` : ""}${isInstalled ? ", drag to dock to pin, right-click for options" : ""}`}
      >
        <div className="relative">
          <div className={cn(
            "w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-lg shadow-md",
            item.app.iconBg,
            item.firstLaunch && "ring-2 ring-[hsl(210_80%_55%/0.4)] animate-pulse"
          )}>
            {item.app.icon}
            {isLocked && (
              <div className="absolute inset-0 rounded-2xl bg-[hsl(0_0%_0%/0.4)] flex items-center justify-center">
                <Lock className="w-4 h-4 text-[hsl(0_0%_100%/0.6)]" />
              </div>
            )}
          </div>
          <AppBadge item={item} />
          {item.isPinned && (
            <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-[hsl(45_90%_55%/0.9)] flex items-center justify-center shadow-sm" title="Pinned to dock">
              <Pin className="w-2 h-2 text-[hsl(0_0%_10%)]" />
            </span>
          )}
        </div>
        <span className="text-[10px] text-[hsl(0_0%_100%/0.65)] truncate w-full text-center">
          {item.app.name}
        </span>
        {item.cta !== "open" && <CTABadge cta={item.cta} />}
      </motion.button>
    </div>
  );

  // Floating context menu (rendered into the document via fixed positioning)
  const contextMenuEl = ctxMenu && (
    <div
      className="fixed z-[300] min-w-[180px] rounded-xl overflow-hidden bg-[hsl(0_0%_8%/0.95)] backdrop-blur-2xl border border-[hsl(0_0%_100%/0.10)] shadow-[0_8px_32px_hsl(0_0%_0%/0.45)] p-1"
      style={{ left: Math.min(ctxMenu.x, window.innerWidth - 200), top: Math.min(ctxMenu.y, window.innerHeight - 160) }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
      role="menu"
      data-testid="launcher-app-context-menu"
    >
      <button
        role="menuitem"
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-[hsl(0_0%_100%/0.85)] hover:bg-[hsl(0_0%_100%/0.08)] transition-colors"
        onClick={() => { setCtxMenu(null); onClick(item); }}
      >
        Open {item.app.name}
      </button>
      <div className="h-px bg-[hsl(0_0%_100%/0.08)] my-1" />
      <button
        role="menuitem"
        className={cn(
          "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] transition-colors",
          item.isPinned
            ? "text-[hsl(0_70%_70%)] hover:bg-[hsl(0_70%_60%/0.12)]"
            : "text-[hsl(45_90%_70%)] hover:bg-[hsl(45_90%_55%/0.12)]"
        )}
        onClick={() => { setCtxMenu(null); onTogglePin(item.app.id, item.isPinned); }}
        data-testid={item.isPinned ? "ctx-unpin-from-dock" : "ctx-pin-to-dock"}
      >
        {item.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
        <span>{item.isPinned ? "Unpin from Dock" : "Pin to Dock"}</span>
      </button>
      {hasQuickActions && (
        <>
          <div className="h-px bg-[hsl(0_0%_100%/0.08)] my-1" />
          <div className="text-[9px] text-[hsl(0_0%_100%/0.4)] px-2.5 py-1 font-medium uppercase tracking-wider">
            Quick Actions
          </div>
          {item.app.quickActions!.map(action => (
            <button
              key={action.id}
              role="menuitem"
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-[hsl(0_0%_100%/0.7)] hover:text-[hsl(0_0%_100%/0.95)] hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
              onClick={() => {
                setCtxMenu(null);
                onQuickAction(item.app.id, action.id);
                SoundEngine.click();
                onLaunchApp(item.app.id);
                onClose();
              }}
            >
              <span>{action.label}</span>
            </button>
          ))}
        </>
      )}
    </div>
  );

  if (!hasQuickActions || isLocked) {
    return (
      <>
        {gridButton}
        {contextMenuEl}
      </>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative group">
          {gridButton}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ChevronRight className="w-3 h-3 text-[hsl(0_0%_100%/0.4)]" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className="w-44 p-1 bg-[hsl(0_0%_8%/0.95)] backdrop-blur-xl border-[hsl(0_0%_100%/0.1)]"
      >
        <div className="text-[10px] text-[hsl(0_0%_100%/0.4)] px-2 py-1 font-medium uppercase tracking-wider">
          Quick Actions
        </div>
        {item.app.quickActions!.map(action => (
          <button
            key={action.id}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-[hsl(0_0%_100%/0.7)] hover:text-[hsl(0_0%_100%/0.95)] hover:bg-[hsl(0_0%_100%/0.08)] transition-colors"
            onClick={() => {
              onQuickAction(item.app.id, action.id);
              SoundEngine.click();
              onLaunchApp(item.app.id);
              onClose();
            }}
          >
            <span className="text-xs">{action.label}</span>
          </button>
        ))}
        <div className="border-t border-[hsl(0_0%_100%/0.06)] mt-1 pt-1">
          <button
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-[hsl(0_0%_100%/0.5)] hover:text-[hsl(0_0%_100%/0.8)] hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
            onClick={() => onTogglePin(item.app.id, item.isPinned)}
          >
            {item.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
            <span>{item.isPinned ? "Unpin from Dock" : "Pin to Dock"}</span>
          </button>
        </div>
        {contextMenuEl}
      </PopoverContent>
    </Popover>
  );
}
