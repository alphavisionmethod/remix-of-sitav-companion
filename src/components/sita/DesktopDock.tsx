// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Dock
// macOS-style floating dock with magnification + live badges + context menu
// Connected to unified window manager for OS apps (Finder, Settings)
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { useAppBadges } from "@/hooks/useAppBadges";
import type { AppDefinition } from "@/lib/app-platform/types";
import type { useWindowManager } from "@/hooks/useWindowManager";

// Known OS-level apps that open as floating windows instead of routes
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

export const DesktopDock = ({ onLaunchApp, windowManager }: DesktopDockProps) => {
  const navigate = useNavigate();
  const { apps } = useAppPlatform();
  const { getBadge } = useAppBadges();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ app: AppDefinition; x: number; y: number } | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const pinnedApps = apps.filter(a => a.pinnedToDock && a.installStatus === "installed");

  const launchApp = useCallback((app: AppDefinition) => {
    // Check if this is an OS window app and we have a launcher
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

  // Check which apps have open windows
  const openWindowIds = new Set(windowManager?.windows.map(w => w.id) ?? []);

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[120] hidden md:flex">
        <motion.div
          ref={dockRef}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
          className="flex items-end gap-1 rounded-2xl border border-[hsl(0_0%_100%/0.30)] bg-[hsl(0_0%_100%/0.12)] backdrop-blur-2xl px-3 py-2 shadow-lg shadow-[hsl(0_0%_0%/0.2)]"
          onMouseLeave={() => { setHoveredIdx(null); setTooltip(null); }}
        >
          {pinnedApps.map((app, idx) => {
            const badge = getBadge(app.id);
            const scale = getScale(idx);
            const isRunning = openWindowIds.has(app.id);
            return (
              <div key={app.id} className="relative flex flex-col items-center">
                {/* Tooltip */}
                {tooltip === app.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-8 whitespace-nowrap rounded-lg bg-popover px-2.5 py-1 text-[10px] font-medium text-popover-foreground shadow-lg border border-border/50"
                  >
                    {app.name}
                  </motion.div>
                )}
                <motion.button
                  animate={{ scale, y: scale > 1 ? -(scale - 1) * 20 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onMouseEnter={() => { setHoveredIdx(idx); setTooltip(app.id); }}
                  onClick={() => launchApp(app)}
                  onContextMenu={(e) => handleContextMenu(e, app)}
                  className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-shadow hover:shadow-lg"
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
                {/* Active dot — brighter if window is actually open */}
                <div className={cn(
                  "w-1 h-1 rounded-full mt-0.5 transition-colors",
                  isRunning ? "bg-[hsl(0_0%_100%/0.9)]" : "bg-primary/60"
                )} />
              </div>
            );
          })}

          {/* Separator + App Store shortcut */}
          <div className="w-px h-8 bg-border/30 mx-1" />
          <motion.button
            animate={{ scale: hoveredIdx !== null ? 1 : 1 }}
            onClick={() => navigate("/app-store")}
            className="w-11 h-11 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="App Store"
            onMouseEnter={() => { setHoveredIdx(pinnedApps.length); setTooltip("store"); }}
          >
            {tooltip === "store" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-8 whitespace-nowrap rounded-lg bg-popover px-2.5 py-1 text-[10px] font-medium text-popover-foreground shadow-lg border border-border/50"
              >
                App Store
              </motion.div>
            )}
            <span className="text-lg">🏪</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div className="fixed inset-0 z-[130]" onClick={() => setContextMenu(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ left: contextMenu.x, top: contextMenu.y - 160 }}
              className="fixed z-[131] w-48 rounded-xl border border-border/50 bg-popover shadow-xl overflow-hidden"
            >
              <div className="p-1.5">
                <button
                  onClick={() => { launchApp(contextMenu.app); setContextMenu(null); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-muted transition-colors"
                >
                  Open {contextMenu.app.name}
                </button>
                <button
                  onClick={() => { navigate(`/app-store/app/${contextMenu.app.id}`); setContextMenu(null); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-muted transition-colors"
                >
                  App Info
                </button>
                <div className="h-px bg-border/30 my-1" />
                <button
                  onClick={() => setContextMenu(null)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-muted transition-colors text-muted-foreground"
                >
                  Unpin from Dock
                </button>
                <button
                  onClick={() => setContextMenu(null)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-muted transition-colors text-muted-foreground"
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
