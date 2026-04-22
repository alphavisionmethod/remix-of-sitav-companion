// ═══════════════════════════════════════════════════════════════
// SITA OS — Focus Dock (Intelligent Access Layer) v2
// Sectioned: [ Core Pinned ] | [ Active ] | [ Smart Suggestions ] | [ + ]
// Magnetic attraction, drag reorder, press-in, layout animations,
// pin/unpin, reflection, running pulse
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { cn } from "@/lib/utils";
import { LayoutGrid, LayoutDashboard } from "lucide-react";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { useAppBadges } from "@/hooks/useAppBadges";
import { useAppSurfacing } from "@/hooks/useAppSurfacing";
import { useDockContext } from "@/hooks/useDockContext";
import type { AppDefinition } from "@/domains/apps/types";
import type { useWindowManager } from "@/hooks/useWindowManager";
import { DockWindowPreview } from "./shell/DockWindowPreview";
import { RecentFlowStrip } from "./shell/RecentFlowStrip";
import { SoundEngine } from "@/platform/runtime/sound-engine";

const OS_WINDOW_APPS = new Set(["finder", "settings", "files-app", "settings-app", "notes", "com.nova.notes", "terminal", "com.nova.terminal", "calendar", "com.nova.calendar", "weather", "com.nova.weather", "nova-terminal", "com.nova.canvas-terminal", "system-monitor", "com.sita.monitor", "music-player", "calculator", "photo-viewer", "code-editor", "mail-client", "maps-app", "security-center", "com.sita.security-center", "app-library", "com.sita.app-library", "update-center", "com.sita.update-center", "cloud-sync", "com.sita.cloud-sync", "dev-tools", "com.sita.dev-tools", "extension-manager", "com.sita.extension-manager", "syscall-dashboard", "com.sita.syscall-dashboard", "finance", "money", "business", "concierge", "investment", "boardroom", "sita-business-center", "sita-money-center", "sita-concierge", "sita-boardroom", "sita-investment-office"]);

const DEFAULT_PINNED_IDS = ["finder", "chrome", "notes", "terminal", "calendar"];
const PINNED_STORAGE_KEY = "sita-dock-pinned-order";
const MAX_DOCK_ITEMS = 12;
const MAX_CORE = 5;

function loadPinnedOrder(): string[] {
  try {
    const raw = localStorage.getItem(PINNED_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, MAX_CORE);
    }
  } catch { /* noop */ }
  return DEFAULT_PINNED_IDS;
}

function savePinnedOrder(ids: string[]) {
  try { localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(ids)); } catch { /* noop */ }
}

interface DesktopDockProps {
  onLaunchApp?: (appId: string, originRect?: DOMRect) => void;
  windowManager?: ReturnType<typeof useWindowManager>;
  mood?: "warm" | "serene" | "night" | "focus";
  hasMaximizedWindow?: boolean;
  onOpenLauncher?: () => void;
}

const MOOD_TINTS: Record<string, string> = {
  warm: "bg-[hsl(35_60%_50%/0.08)]",
  serene: "bg-[hsl(0_0%_100%/0.12)]",
  night: "bg-[hsl(240_40%_30%/0.12)]",
  focus: "bg-[hsl(265_50%_40%/0.10)]",
};

// ── Separator ────────────────────────────────────────────────
function DockSeparator() {
  return (
    <div className="w-px h-8 mx-1.5 rounded-full flex-shrink-0" style={{
      background: "linear-gradient(180deg, hsl(0 0% 100% / 0.03), hsl(0 0% 100% / 0.20), hsl(0 0% 100% / 0.03))",
      boxShadow: "0 0 8px hsl(0 0% 100% / 0.06)",
    }} />
  );
}

// ── Dock Icon ────────────────────────────────────────────────
interface DockIconProps {
  app: AppDefinition;
  scale: number;
  magnetX: number; // horizontal magnetic translation
  isRunning: boolean;
  isBouncing: boolean;
  isSuggestion?: boolean;
  badge?: { count: number; urgency: string } | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  tooltipVisible: boolean;
  iconRef: (el: HTMLButtonElement | null) => void;
}

function DockIcon({ app, scale, magnetX, isRunning, isBouncing, isSuggestion, badge, onMouseEnter, onMouseLeave, onClick, onContextMenu, tooltipVisible, iconRef }: DockIconProps) {
  return (
    <motion.div
      layout
      layoutId={`dock-icon-${app.id}`}
      className="relative flex flex-col items-center"
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <AnimatePresence>
        {tooltipVisible && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.98 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute -top-9 whitespace-nowrap rounded-lg bg-[hsl(0_0%_0%/0.75)] backdrop-blur-md px-2.5 py-1 text-[10px] font-medium text-[hsl(0_0%_100%/0.95)] shadow-lg z-10 pointer-events-none"
          >
            {app.name}
            {isSuggestion && <span className="ml-1 text-[hsl(265_60%_70%)]">✦</span>}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        ref={iconRef}
        animate={{
          scale: isBouncing ? [1, 0.8, 1.15, 0.95, 1.05, 1] : scale,
          y: isBouncing ? [0, 2, -18, -8, -12, 0] : (scale > 1 ? -(scale - 1) * 24 : 0),
          x: magnetX,
        }}
        whileTap={{ scale: 0.86, y: 3 }}
        transition={
          isBouncing
            ? { duration: 0.5, ease: "easeOut" }
            : { type: "spring", stiffness: 300, damping: 20 }
        }
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        onContextMenu={onContextMenu}
        className="relative w-11 h-11 rounded-xl flex items-center justify-center"
        style={{
          filter: scale > 1.05 ? `drop-shadow(0 4px ${8 * (scale - 1)}px hsl(0 0% 0% / 0.35))` : undefined,
        }}
        aria-label={`Open ${app.name}`}
      >
        <div className={cn("w-full h-full rounded-xl bg-gradient-to-br flex items-center justify-center text-lg shadow-md", app.iconBg)}>
          {app.icon}
        </div>
        {isSuggestion && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[hsl(265_60%_65%)] shadow-[0_0_4px_hsl(265_60%_65%/0.5)] animate-pulse" />
        )}
        {badge && badge.count > 0 && (
          <span className={cn(
            "absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-bold px-1",
            badge.urgency === "critical" ? "bg-destructive text-destructive-foreground animate-pulse" :
            badge.urgency === "high" ? "bg-destructive text-destructive-foreground" :
            "bg-primary text-primary-foreground"
          )}>
            {badge.count > 99 ? "99+" : badge.count}
          </span>
        )}
      </motion.button>
      {/* Running indicator with breathing pulse */}
      {isRunning ? (
        <motion.div
          className="mt-0.5 w-3 h-[3px] rounded-full bg-[hsl(0_0%_100%/0.9)]"
          animate={{ opacity: [0.65, 1, 0.65], boxShadow: ["0 0 4px hsl(0 0% 100% / 0.3)", "0 0 8px hsl(0 0% 100% / 0.6)", "0 0 4px hsl(0 0% 100% / 0.3)"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : (
        <div className="mt-0.5 w-1 h-1 rounded-full bg-transparent" />
      )}
    </motion.div>
  );
}

// ── Main Focus Dock ──────────────────────────────────────────

export const DesktopDock = ({ onLaunchApp, windowManager, mood = "serene", hasMaximizedWindow = false, onOpenLauncher }: DesktopDockProps) => {
  const navigate = useNavigate();
  const { apps, pinToDock, unpinFromDock } = useAppPlatform();
  const { getBadge } = useAppBadges();
  const { recordLaunch, getRecentFlow, getContextualSuggestions } = useAppSurfacing();
  const dockContext = useDockContext();
  const [pinnedOrder, setPinnedOrder] = useState<string[]>(loadPinnedOrder);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ app: AppDefinition; x: number; y: number; section: "core" | "active" | "suggestion" } | null>(null);
  const [bouncingApp, setBouncingApp] = useState<string | null>(null);
  const [previewApp, setPreviewApp] = useState<{ id: string; x: number; y: number } | null>(null);
  const [dockVisible, setDockVisible] = useState(true);
  const [flowVisible, setFlowVisible] = useState(false);
  const [cursorX, setCursorX] = useState<number | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const previewTimer = useRef<ReturnType<typeof setTimeout>>();
  const flowTimer = useRef<ReturnType<typeof setTimeout>>();
  const velocityRef = useRef(0);
  const lastCursorX = useRef(0);
  const lastCursorTime = useRef(0);

  // Persist pinned order
  useEffect(() => { savePinnedOrder(pinnedOrder); }, [pinnedOrder]);

  // ── Bootstrap default pins on first launch (only if NO app is pinned anywhere) ──
  const bootstrappedRef = useRef(false);
  useEffect(() => {
    if (bootstrappedRef.current) return;
    if (apps.length === 0) return;
    const anyPinned = apps.some(a => a.pinnedToDock);
    if (!anyPinned) {
      DEFAULT_PINNED_IDS.forEach(id => {
        const app = apps.find(a => a.id === id);
        if (app && app.installStatus === "installed") pinToDock(id);
      });
    }
    bootstrappedRef.current = true;
  }, [apps, pinToDock]);

  // Auto-hide when maximized windows
  useEffect(() => {
    if (!hasMaximizedWindow) { setDockVisible(true); return; }
    setDockVisible(false);
    const handleMouseMove = (e: MouseEvent) => {
      setDockVisible(e.clientY > window.innerHeight - 20);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [hasMaximizedWindow]);

  // ── Build dock sections ────────────────────────────────────
  const openWindowIds = useMemo(() =>
    new Set(windowManager?.windows.map(w => w.id) ?? []),
    [windowManager?.windows]
  );

  // Core pinned = apps with pinnedToDock=true, ordered by pinnedOrder (unknown ids appended)
  const corePinned = useMemo(() => {
    const pinnedApps = apps.filter(a => a.pinnedToDock);
    const byId = new Map(pinnedApps.map(a => [a.id, a]));
    const ordered: AppDefinition[] = [];
    pinnedOrder.forEach(id => { const app = byId.get(id); if (app) { ordered.push(app); byId.delete(id); } });
    byId.forEach(app => ordered.push(app));
    return ordered.slice(0, MAX_CORE);
  }, [apps, pinnedOrder]);

  const pinnedIdSet = useMemo(() => new Set(corePinned.map(a => a.id)), [corePinned]);

  const activeApps = useMemo(() => {
    return Array.from(openWindowIds)
      .filter(id => !pinnedIdSet.has(id))
      .map(id => apps.find(a => a.id === id))
      .filter(Boolean) as AppDefinition[];
  }, [openWindowIds, pinnedIdSet, apps]);

  const smartSuggestions = useMemo(() => {
    const usedIds = new Set([...pinnedIdSet, ...activeApps.map(a => a.id)]);
    const remaining = MAX_DOCK_ITEMS - pinnedIdSet.size - activeApps.length - 1;
    if (remaining <= 0) return [];
    const suggestionIds = getContextualSuggestions(dockContext, usedIds, Math.min(remaining, 3));
    return suggestionIds.map(id => apps.find(a => a.id === id)).filter(Boolean) as AppDefinition[];
  }, [pinnedIdSet, activeApps, dockContext, getContextualSuggestions, apps]);

  const allDockApps = useMemo(() =>
    [...corePinned, ...activeApps, ...smartSuggestions],
    [corePinned, activeApps, smartSuggestions]
  );

  const recentFlow = getRecentFlow(4);

  // ── Interactions ───────────────────────────────────────────
  const launchApp = useCallback((app: AppDefinition) => {
    setBouncingApp(app.id);
    setTimeout(() => setBouncingApp(null), 500);
    recordLaunch(app.id);
    const rect = iconRefs.current.get(app.id)?.getBoundingClientRect();
    SoundEngine.click(rect ? rect.x + rect.width / 2 : undefined);
    if (onLaunchApp && OS_WINDOW_APPS.has(app.id)) {
      onLaunchApp(app.id, rect);
      return;
    }
    if (app.routePath) navigate(app.routePath);
    else if (app.externalUrl) window.open(app.externalUrl, "_blank", "noopener");
  }, [navigate, onLaunchApp, recordLaunch]);

  const handleContextMenu = useCallback((e: React.MouseEvent, app: AppDefinition, section: "core" | "active" | "suggestion") => {
    e.preventDefault();
    setContextMenu({ app, x: e.clientX, y: e.clientY, section });
  }, []);

  // Pin / Unpin — bridge to platform context (single source of truth)
  const pinApp = useCallback((appId: string) => {
    if (pinnedIdSet.has(appId) || pinnedIdSet.size >= MAX_CORE) return;
    pinToDock(appId);
    setPinnedOrder(prev => prev.includes(appId) ? prev : [...prev, appId].slice(0, MAX_CORE));
  }, [pinToDock, pinnedIdSet]);

  const unpinApp = useCallback((appId: string) => {
    if (pinnedIdSet.size <= 1) return; // keep at least one pinned
    unpinFromDock(appId);
    setPinnedOrder(prev => prev.filter(id => id !== appId));
  }, [unpinFromDock, pinnedIdSet]);

  // Gaussian magnification + magnetic translation
  const getIconTransform = useCallback((globalIdx: number): { scale: number; magnetX: number } => {
    if (cursorX === null) return { scale: 1, magnetX: 0 };
    const app = allDockApps[globalIdx];
    if (!app) return { scale: 1, magnetX: 0 };
    const el = iconRefs.current.get(app.id);
    if (!el) return { scale: 1, magnetX: 0 };
    const rect = el.getBoundingClientRect();
    const iconCenter = rect.left + rect.width / 2;
    const dist = cursorX - iconCenter;
    const absDist = Math.abs(dist);
    const sigma = 55;
    const gaussian = Math.exp(-(absDist * absDist) / (2 * sigma * sigma));
    const velocityFactor = Math.max(0.3, 1 - Math.min(velocityRef.current / 3000, 0.7));
    const scale = 1 + (0.5 * gaussian * velocityFactor);
    // Magnetic pull: translate toward cursor, max 3px
    const magnetX = absDist < 100 ? (dist > 0 ? 1 : -1) * gaussian * 3 * velocityFactor : 0;
    return { scale, magnetX };
  }, [cursorX, allDockApps]);

  // Flow strip visibility
  const showFlow = useCallback(() => {
    setFlowVisible(true);
    if (flowTimer.current) clearTimeout(flowTimer.current);
    flowTimer.current = setTimeout(() => setFlowVisible(false), 3000);
  }, []);

  const handleFlowAppClick = useCallback((appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (app) launchApp(app);
  }, [apps, launchApp]);

  // Reorder handler for pinned apps
  const handleReorder = useCallback((newOrder: AppDefinition[]) => {
    setPinnedOrder(newOrder.map(a => a.id));
  }, []);

  // ── Drag-and-drop: accept apps dropped from launcher ──
  const handleDockDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("application/x-sita-app")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setDropActive(true);
    }
  }, []);

  const handleDockDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if leaving the dock entirely
    if (e.currentTarget === e.target) setDropActive(false);
  }, []);

  const handleDockDrop = useCallback((e: React.DragEvent) => {
    const appId = e.dataTransfer.getData("application/x-sita-app");
    setDropActive(false);
    if (!appId) return;
    e.preventDefault();
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    if (pinnedIdSet.has(appId)) {
      SoundEngine.click();
      return; // already pinned
    }
    if (pinnedIdSet.size >= MAX_CORE) {
      // Dock is full — bounce the launcher button instead of silently failing
      return;
    }
    pinApp(appId);
    SoundEngine.click();
  }, [apps, pinApp, pinnedIdSet]);

  if (allDockApps.length === 0) return null;

  let globalIdx = 0;

  return (
    <>
      {/* Flow Strip — above dock */}
      <div className="fixed bottom-[76px] left-1/2 -translate-x-1/2 z-[119] hidden md:flex">
        <RecentFlowStrip flow={recentFlow} apps={apps} visible={flowVisible} onAppClick={handleFlowAppClick} />
      </div>

      {/* Dock */}
      <div className={cn("fixed bottom-4 left-1/2 -translate-x-1/2 z-[120] hidden md:flex transition-all duration-300", !dockVisible && "translate-y-24 opacity-0")}>
        <motion.div
          ref={dockRef}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
          className={cn(
            "flex items-end gap-1 rounded-[20px] border backdrop-blur-[40px] px-3 py-2 relative",
            "transition-all duration-300",
            dropActive
              ? "border-[hsl(210_80%_60%/0.65)] ring-2 ring-[hsl(210_80%_60%/0.35)] scale-[1.02]"
              : "border-[hsl(0_0%_100%/0.25)]",
            MOOD_TINTS[mood] || MOOD_TINTS.serene
          )}
          style={{
            boxShadow: dropActive
              ? "0 2px 8px hsl(0 0% 0% / 0.12), 0 20px 50px hsl(210 80% 50% / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.18), inset 0 -1px 0 hsl(0 0% 0% / 0.1)"
              : "0 2px 8px hsl(0 0% 0% / 0.12), 0 20px 50px hsl(0 0% 0% / 0.22), inset 0 1px 0 hsl(0 0% 100% / 0.12), inset 0 -1px 0 hsl(0 0% 0% / 0.1)",
            background: `linear-gradient(180deg, hsl(0 0% 100% / 0.14) 0%, hsl(0 0% 100% / 0.06) 100%)`,
          }}
          onMouseEnter={showFlow}
          onMouseLeave={() => { setTooltip(null); setCursorX(null); }}
          onMouseMove={(e) => {
            const now = performance.now();
            const dx = Math.abs(e.clientX - lastCursorX.current);
            const dt = now - lastCursorTime.current;
            if (dt > 0) velocityRef.current = (dx / dt) * 1000;
            lastCursorX.current = e.clientX;
            lastCursorTime.current = now;
            setCursorX(e.clientX);
          }}
          onDragOver={handleDockDragOver}
          onDragLeave={handleDockDragLeave}
          onDrop={handleDockDrop}
          data-testid="desktop-dock"
        >
          {/* ── Core Pinned Section (draggable) ── */}
          <Reorder.Group
            axis="x"
            values={corePinned}
            onReorder={handleReorder}
            className="flex items-end gap-1"
            as="div"
          >
            {corePinned.map((app) => {
              const idx = globalIdx++;
              const transform = getIconTransform(idx);
              return (
                <Reorder.Item key={app.id} value={app} as="div" className="cursor-grab active:cursor-grabbing">
                  <DockIcon
                    app={app}
                    scale={transform.scale}
                    magnetX={transform.magnetX}
                    isRunning={openWindowIds.has(app.id)}
                    isBouncing={bouncingApp === app.id}
                    badge={getBadge(app.id)}
                    tooltipVisible={tooltip === app.id}
                    iconRef={(el) => { if (el) iconRefs.current.set(app.id, el); }}
                    onMouseEnter={() => {
                      setTooltip(app.id);
                      if (openWindowIds.has(app.id)) {
                        previewTimer.current = setTimeout(() => {
                          const rect = iconRefs.current.get(app.id)?.getBoundingClientRect();
                          if (rect) setPreviewApp({ id: app.id, x: rect.left + rect.width / 2, y: window.innerHeight - rect.top });
                        }, 400);
                      }
                    }}
                    onMouseLeave={() => { clearTimeout(previewTimer.current); setPreviewApp(null); }}
                    onClick={() => launchApp(app)}
                    onContextMenu={(e) => handleContextMenu(e, app, "core")}
                  />
                </Reorder.Item>
              );
            })}
          </Reorder.Group>

          {/* ── Separator: Core → Active ── */}
          {activeApps.length > 0 && <DockSeparator />}

          {/* ── Active/Running Section ── */}
          <AnimatePresence mode="popLayout">
            {activeApps.map((app) => {
              const idx = globalIdx++;
              const transform = getIconTransform(idx);
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, scale: 0.5, width: 0 }}
                  animate={{ opacity: 1, scale: 1, width: "auto" }}
                  exit={{ opacity: 0, scale: 0.5, width: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  <DockIcon
                    app={app}
                    scale={transform.scale}
                    magnetX={transform.magnetX}
                    isRunning={true}
                    isBouncing={bouncingApp === app.id}
                    badge={getBadge(app.id)}
                    tooltipVisible={tooltip === app.id}
                    iconRef={(el) => { if (el) iconRefs.current.set(app.id, el); }}
                    onMouseEnter={() => {
                      setTooltip(app.id);
                      previewTimer.current = setTimeout(() => {
                        const rect = iconRefs.current.get(app.id)?.getBoundingClientRect();
                        if (rect) setPreviewApp({ id: app.id, x: rect.left + rect.width / 2, y: window.innerHeight - rect.top });
                      }, 400);
                    }}
                    onMouseLeave={() => { clearTimeout(previewTimer.current); setPreviewApp(null); }}
                    onClick={() => launchApp(app)}
                    onContextMenu={(e) => handleContextMenu(e, app, "active")}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* ── Separator: Active → Suggestions ── */}
          {smartSuggestions.length > 0 && <DockSeparator />}

          {/* ── Smart Suggestions Section ── */}
          <AnimatePresence mode="popLayout">
            {smartSuggestions.map((app) => {
              const idx = globalIdx++;
              const transform = getIconTransform(idx);
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  <DockIcon
                    app={app}
                    scale={transform.scale}
                    magnetX={transform.magnetX}
                    isRunning={openWindowIds.has(app.id)}
                    isBouncing={bouncingApp === app.id}
                    isSuggestion
                    badge={getBadge(app.id)}
                    tooltipVisible={tooltip === app.id}
                    iconRef={(el) => { if (el) iconRefs.current.set(app.id, el); }}
                    onMouseEnter={() => setTooltip(app.id)}
                    onMouseLeave={() => {}}
                    onClick={() => launchApp(app)}
                    onContextMenu={(e) => handleContextMenu(e, app, "suggestion")}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* ── Separator → Widgets + Launcher ── */}
          <DockSeparator />

          {/* ── Widgets Button — opens the Desktop Widget Gallery ── */}
          <div className="relative flex flex-col items-center">
            <AnimatePresence>
              {tooltip === "__widgets" && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 2, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute -top-9 whitespace-nowrap rounded-lg bg-[hsl(0_0%_0%/0.75)] backdrop-blur-md px-2.5 py-1 text-[10px] font-medium text-[hsl(0_0%_100%/0.95)] shadow-lg z-10 pointer-events-none"
                >
                  Widgets — add or remove
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.88, y: 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => {
                SoundEngine.click();
                window.dispatchEvent(new CustomEvent("sita-open-widget-picker"));
              }}
              onMouseEnter={() => setTooltip("__widgets")}
              onMouseLeave={() => setTooltip(null)}
              className="w-11 h-11 rounded-xl bg-[hsl(0_0%_100%/0.06)] border border-[hsl(0_0%_100%/0.10)] flex items-center justify-center text-[hsl(0_0%_100%/0.5)] hover:text-[hsl(0_0%_100%/0.9)] hover:bg-[hsl(0_0%_100%/0.14)] transition-all duration-150"
              aria-label="Open Widget Gallery — add or remove desktop widgets"
              data-testid="dock-widgets-button"
            >
              <LayoutDashboard className="w-5 h-5" />
            </motion.button>
            <div className="w-1 h-1 rounded-full mt-0.5 bg-transparent" />
          </div>

          {/* ── + Launcher Button ── */}
          <div className="relative flex flex-col items-center">
            <AnimatePresence>
              {tooltip === "__launcher" && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 2, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute -top-9 whitespace-nowrap rounded-lg bg-[hsl(0_0%_0%/0.75)] backdrop-blur-md px-2.5 py-1 text-[10px] font-medium text-[hsl(0_0%_100%/0.95)] shadow-lg z-10 pointer-events-none"
                >
                  App Launcher
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.88, y: 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => { SoundEngine.click(); onOpenLauncher?.(); }}
              onMouseEnter={() => setTooltip("__launcher")}
              onMouseLeave={() => setTooltip(null)}
              className="w-11 h-11 rounded-xl bg-[hsl(0_0%_100%/0.08)] border border-[hsl(0_0%_100%/0.10)] flex items-center justify-center text-[hsl(0_0%_100%/0.5)] hover:text-[hsl(0_0%_100%/0.9)] hover:bg-[hsl(0_0%_100%/0.14)] transition-all duration-150"
              aria-label="Open App Launcher"
            >
              <LayoutGrid className="w-5 h-5" />
            </motion.button>
            <div className="w-1 h-1 rounded-full mt-0.5 bg-transparent" />
          </div>
        </motion.div>

        {/* Premium reflection — mirrored dock */}
        <div
          className="absolute -bottom-4 left-4 right-4 h-6 rounded-b-2xl pointer-events-none overflow-hidden"
          style={{
            transform: "scaleY(-1)",
            opacity: 0.06,
            background: "linear-gradient(180deg, hsl(0 0% 100% / 0.12) 0%, transparent 100%)",
            filter: "blur(4px)",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div className="fixed inset-0 z-[130]" onClick={() => setContextMenu(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              style={{ left: contextMenu.x, top: contextMenu.y - 180 }}
              className={cn(
                "fixed z-[131] w-48 rounded-xl overflow-hidden",
                "bg-[hsl(0_0%_100%/0.70)] dark:bg-[hsl(0_0%_0%/0.70)]",
                "backdrop-blur-2xl",
                "border border-[hsl(0_0%_100%/0.25)] dark:border-[hsl(0_0%_100%/0.10)]",
                "shadow-[0_2px_6px_hsl(0_0%_0%/0.08),0_20px_40px_hsl(0_0%_0%/0.18)]"
              )}
            >
              <div className="p-1.5">
                <button
                  onClick={() => { launchApp(contextMenu.app); setContextMenu(null); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-[12px] font-medium text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_85%)] hover:bg-[hsl(210_80%_60%/0.12)] transition-colors duration-100"
                >
                  Open {contextMenu.app.name}
                </button>
                <button
                  onClick={() => { navigate(`/app-store/app/${contextMenu.app.id}`); setContextMenu(null); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-[12px] text-[hsl(0_0%_35%)] dark:text-[hsl(0_0%_65%)] hover:bg-[hsl(210_80%_60%/0.12)] transition-colors duration-100"
                >
                  App Info
                </button>
                <div className="h-px bg-[hsl(0_0%_50%/0.15)] my-1 mx-2" />
                {contextMenu.section === "core" ? (
                  <button
                    onClick={() => { unpinApp(contextMenu.app.id); setContextMenu(null); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-[12px] text-[hsl(0_0%_45%)] dark:text-[hsl(0_0%_55%)] hover:bg-[hsl(0_80%_60%/0.12)] transition-colors duration-100"
                  >
                    Unpin from Dock
                  </button>
                ) : (
                  <button
                    onClick={() => { pinApp(contextMenu.app.id); setContextMenu(null); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-[12px] text-[hsl(0_0%_45%)] dark:text-[hsl(0_0%_55%)] hover:bg-[hsl(210_80%_60%/0.12)] transition-colors duration-100"
                  >
                    Keep in Dock
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Window preview */}
      <AnimatePresence>
        {previewApp && (() => {
          const win = windowManager?.windows.find(w => w.id === previewApp.id);
          if (!win) return null;
          return (
            <DockWindowPreview
              title={win.title}
              appIcon={previewApp.id === "finder" ? "📁" : previewApp.id === "settings" ? "⚙️" : undefined}
              x={previewApp.x}
              y={previewApp.y}
            />
          );
        })()}
      </AnimatePresence>
    </>
  );
};
