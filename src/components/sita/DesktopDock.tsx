// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Dock
// macOS-style floating dock with magnification + live badges + context menu
// Enhanced: bounce launch animation, glowing running bar, separator
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { useAppBadges } from "@/hooks/useAppBadges";
import type { AppDefinition } from "@/lib/app-platform/types";
import type { useWindowManager } from "@/hooks/useWindowManager";

const OS_WINDOW_APPS = new Set(["finder", "settings"]);

interface DesktopDockProps {
  onLaunchApp?: (appId: string) => void;
  windowManager?: ReturnType<typeof useWindowManager>;
  mood?: "warm" | "serene" | "night" | "focus";
}

const MOOD_TINTS: Record<string, string> = {
  warm: "bg-[hsl(35_60%_50%/0.08)]",
  serene: "bg-[hsl(0_0%_100%/0.12)]",
  night: "bg-[hsl(240_40%_30%/0.12)]",
  focus: "bg-[hsl(265_50%_40%/0.10)]",
};

export const DesktopDock = ({ onLaunchApp, windowManager, mood = "serene" }: DesktopDockProps) => {
  const navigate = useNavigate();
  const { apps } = useAppPlatform();
  const { getBadge } = useAppBadges();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ app: AppDefinition; x: number; y: number } | null>(null);
  const [bouncingApp, setBouncingApp] = useState<string | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const pinnedApps = apps.filter(a => a.pinnedToDock && a.installStatus === "installed");

  const launchApp = useCallback((app: AppDefinition) => {
    // Trigger bounce
    setBouncingApp(app.id);
    setTimeout(() => setBouncingApp(null), 500);

    if (onLaunchApp && OS_WINDOW_APPS.has(app.id)) {
      onLaunchApp(app.id);
      return;
    }
    if (app.routePath) navigate(app.routePath);
    else if (app.externalUrl) window.open(app.externalUrl, "_blank", "noopener");
  }, [navigate, onLaunchApp]);

  const handleContextMenu = useCallback((e: React.MouseEvent, app: AppDefinition) => {
    e.preventDefault();
    setContextMenu({ app, x: e.clientX, y: e.clientY });
  }, []);

  if (pinnedApps.length === 0) return null;

  const getScale = (idx: number) => {
    if (hoveredIdx === null) return 1;
    const dist = Math.abs(idx - hoveredIdx);
    if (dist === 0) return 1.45;
    if (dist === 1) return 1.2;
    if (dist === 2) return 1.05;
    return 1;
  };

  const openWindowIds = new Set(windowManager?.windows.map(w => w.id) ?? []);

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[120] hidden md:flex">
        <motion.div
          ref={dockRef}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
          className={cn(
            "flex items-end gap-1 rounded-2xl border border-[hsl(0_0%_100%/0.30)] backdrop-blur-2xl px-3 py-2",
            "shadow-[0_2px_8px_hsl(0_0%_0%/0.12),0_16px_40px_hsl(0_0%_0%/0.18)]",
            "transition-colors duration-500",
            MOOD_TINTS[mood] || MOOD_TINTS.serene
          )}
          onMouseLeave={() => { setHoveredIdx(null); setTooltip(null); }}
        >
          {pinnedApps.map((app, idx) => {
            const badge = getBadge(app.id);
            const scale = getScale(idx);
            const isRunning = openWindowIds.has(app.id);
            const isBouncing = bouncingApp === app.id;
            return (
              <div key={app.id} className="relative flex flex-col items-center">
                {/* Tooltip */}
                <AnimatePresence>
                  {tooltip === app.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 2, scale: 0.98 }}
                      transition={{ duration: 0.12, ease: "easeOut" }}
                      className="absolute -top-9 whitespace-nowrap rounded-lg bg-[hsl(0_0%_0%/0.75)] dark:bg-[hsl(0_0%_100%/0.12)] backdrop-blur-md px-2.5 py-1 text-[10px] font-medium text-[hsl(0_0%_100%/0.95)] shadow-lg"
                    >
                      {app.name}
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.button
                  ref={(el) => { if (el) iconRefs.current.set(app.id, el); }}
                  animate={{
                    scale: isBouncing ? [1, 0.8, 1.15, 0.95, 1.05, 1] : scale,
                    y: isBouncing ? [0, 2, -18, -8, -12, 0] : (scale > 1 ? -(scale - 1) * 20 : 0),
                  }}
                  transition={
                    isBouncing
                      ? { duration: 0.5, ease: "easeOut" }
                      : { type: "spring", stiffness: 300, damping: 20 }
                  }
                  onMouseEnter={() => { setHoveredIdx(idx); setTooltip(app.id); }}
                  onClick={() => launchApp(app)}
                  onContextMenu={(e) => handleContextMenu(e, app)}
                  className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-shadow duration-150 hover:shadow-xl"
                  aria-label={`Open ${app.name}`}
                >
                  <div className={cn("w-full h-full rounded-xl bg-gradient-to-br flex items-center justify-center text-lg shadow-md", app.iconBg)}>
                    {app.icon}
                  </div>
                  {/* Badge */}
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
                {/* Running indicator — glowing bar for active, dot for running */}
                <div className={cn(
                  "mt-0.5 rounded-full transition-all duration-200",
                  isRunning
                    ? "w-3 h-[3px] bg-[hsl(0_0%_100%/0.9)] shadow-[0_0_6px_hsl(0_0%_100%/0.5)]"
                    : "w-1 h-1 bg-[hsl(0_0%_100%/0.3)]"
                )} />
              </div>
            );
          })}

          {/* Separator */}
          <div className="w-px h-8 bg-[hsl(0_0%_100%/0.15)] mx-1.5" />

          {/* App Store shortcut */}
          <div className="relative flex flex-col items-center">
            <AnimatePresence>
              {tooltip === "store" && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 2, scale: 0.98 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                  className="absolute -top-9 whitespace-nowrap rounded-lg bg-[hsl(0_0%_0%/0.75)] dark:bg-[hsl(0_0%_100%/0.12)] backdrop-blur-md px-2.5 py-1 text-[10px] font-medium text-[hsl(0_0%_100%/0.95)] shadow-lg"
                >
                  App Store
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              animate={{ scale: hoveredIdx === pinnedApps.length ? 1.15 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => navigate("/app-store")}
              className="w-11 h-11 rounded-xl bg-[hsl(0_0%_100%/0.08)] border border-[hsl(0_0%_100%/0.10)] flex items-center justify-center text-[hsl(0_0%_100%/0.6)] hover:text-[hsl(0_0%_100%/0.9)] hover:bg-[hsl(0_0%_100%/0.14)] transition-all duration-150"
              aria-label="App Store"
              onMouseEnter={() => { setHoveredIdx(pinnedApps.length); setTooltip("store"); }}
            >
              <span className="text-lg">🏪</span>
            </motion.button>
            <div className="w-1 h-1 rounded-full mt-0.5 bg-transparent" />
          </div>
        </motion.div>
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
              style={{ left: contextMenu.x, top: contextMenu.y - 160 }}
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
                  className="w-full text-left px-3 py-2 rounded-lg text-[12px] font-medium text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_85%)] hover:bg-[hsl(210_80%_60%/0.12)] transition-colors duration-[80ms]"
                >
                  Open {contextMenu.app.name}
                </button>
                <button
                  onClick={() => { navigate(`/app-store/app/${contextMenu.app.id}`); setContextMenu(null); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-[12px] text-[hsl(0_0%_35%)] dark:text-[hsl(0_0%_65%)] hover:bg-[hsl(210_80%_60%/0.12)] transition-colors duration-[80ms]"
                >
                  App Info
                </button>
                <div className="h-px bg-[hsl(0_0%_50%/0.15)] my-1 mx-2" />
                <button
                  onClick={() => setContextMenu(null)}
                  className="w-full text-left px-3 py-2 rounded-lg text-[12px] text-[hsl(0_0%_45%)] dark:text-[hsl(0_0%_55%)] hover:bg-[hsl(210_80%_60%/0.12)] transition-colors duration-[80ms]"
                >
                  Unpin from Dock
                </button>
                <button
                  onClick={() => setContextMenu(null)}
                  className="w-full text-left px-3 py-2 rounded-lg text-[12px] text-[hsl(0_0%_45%)] dark:text-[hsl(0_0%_55%)] hover:bg-[hsl(210_80%_60%/0.12)] transition-colors duration-[80ms]"
                >
                  Notifications
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
