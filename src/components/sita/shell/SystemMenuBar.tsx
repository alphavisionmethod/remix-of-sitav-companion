// ═══════════════════════════════════════════════════════════════
// SITA OS — System Menu Bar (NovaOS macOS-style)
// Fixed translucent top bar: brand, contextual menus, status indicators
// All menus are real dropdowns wired to system actions.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Wifi, WifiOff, SlidersHorizontal, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/AppearanceContext";
import { useWindowManagerContext } from "@/contexts/WindowManagerContext";
import { useUnreadCount } from "../NotificationPanel";
import { TrustPostureChip } from "./TrustPostureChip";
import { useShellIndicators } from "@/hooks/use-shell-indicators";
import { DEPTH_LAYERS } from "@/platform/design-system/nova-os";
import logo from "@/assets/logo.webp";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  showAbout, openSystemSettings, openAppStore, openMissionControl, lockScreen,
  signOutWithConfirm, restartShell,
  newWindow, openFileDialog, saveActive, exportActive,
  execEditCommand, findInApp,
  toggleSidebar, toggleDock, openWidgetPicker, toggleFullscreen,
  zoomIn, zoomOut, zoomReset,
  minimizeFocused, maximizeFocused, closeFocused, bringAllToFront,
  cascadeWindows, closeAllWindows,
  openHelp, openShortcuts, openDocumentation, reportIssue, whatsNew,
} from "@/lib/system-menu/menu-actions";

interface SystemMenuBarProps {
  onSearchOpen?: () => void;
  onNotifOpen?: () => void;
  onControlCenterOpen?: () => void;
  /** Currently active app name for contextual menus */
  activeApp?: string;
}

const MENU_TRIGGER_CLASS =
  "px-2 py-0.5 rounded text-[11px] font-medium transition-colors outline-none data-[state=open]:bg-[hsl(0_0%_100%/0.18)] data-[state=open]:text-[hsl(0_0%_100%/0.95)] text-[hsl(0_0%_100%/0.75)] hover:text-[hsl(0_0%_100%/0.95)] hover:bg-[hsl(0_0%_100%/0.10)]";

const MENU_CONTENT_CLASS =
  "min-w-[240px] bg-popover/95 backdrop-blur-xl border border-border/50 shadow-2xl";

const SHORTCUT_CLASS = "ml-auto pl-6 text-[10px] tracking-wider text-muted-foreground";

export const SystemMenuBar = memo(({ onSearchOpen, onNotifOpen, onControlCenterOpen, activeApp }: SystemMenuBarProps) => {
  const [clock, setClock] = useState("");
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const wm = useWindowManagerContext();
  const unreadCount = useUnreadCount();
  const indicators = useShellIndicators();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleString("en-US", {
        weekday: "short", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true,
      }));
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // Open helper used by Apple/File menus — falls back to dispatching a generic open-app event
  const openWindow = (id: string) => {
    window.dispatchEvent(new CustomEvent("sita-open-app", { detail: { appId: id } }));
  };

  const visibleWindows = wm?.windows.filter(w => !w.minimized) ?? [];
  const focusedId = useMemo(() => {
    if (!wm) return null;
    const sorted = [...visibleWindows].sort((a, b) => b.zIndex - a.zIndex);
    return sorted[0]?.id ?? null;
  }, [wm, visibleWindows]);

  return (
    <header
      className="fixed top-0 left-0 right-0 flex h-7 items-center justify-between px-4 select-none"
      style={{
        zIndex: DEPTH_LAYERS.menuBar,
        background: "linear-gradient(180deg, hsl(0 0% 100% / 0.06) 0%, hsl(0 0% 0% / 0.28) 100%)",
        backdropFilter: "blur(50px) saturate(2)",
        WebkitBackdropFilter: "blur(50px) saturate(2)",
        boxShadow: "inset 0 0.5px 0 hsl(0 0% 100% / 0.10), 0 1px 0 hsl(0 0% 0% / 0.15), 0 0 20px hsl(0 0% 0% / 0.08)",
        borderBottom: "0.5px solid hsl(0 0% 100% / 0.06)",
      }}
    >
      {/* Left: Apple menu + App menu + 5 menu bar items */}
      <div className="flex items-center gap-0.5">
        {/* 🍎 Apple / SITA brand menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(MENU_TRIGGER_CLASS, "flex items-center gap-1.5 pl-1")}>
            <img src={logo} alt="SITA" className="h-3.5 w-3.5 rounded-sm" />
            <span className="text-[11px] font-bold tracking-wide text-[hsl(0_0%_100%/0.95)]">SITA</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={MENU_CONTENT_CLASS}>
            <DropdownMenuItem onClick={showAbout}>About SITA OS</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openSystemSettings(openWindow)}>
              System Settings… <span className={SHORTCUT_CLASS}>⌘,</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openAppStore}>App Store…</DropdownMenuItem>
            <DropdownMenuItem onClick={openMissionControl}>Mission Control</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={lockScreen}>
              Lock Screen <span className={SHORTCUT_CLASS}>⌃⌘Q</span>
            </DropdownMenuItem>
            {user && (
              <DropdownMenuItem onClick={() => signOutWithConfirm(signOut)}>Sign Out…</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={restartShell}>Restart Shell</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* App label menu */}
        {activeApp && (
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(MENU_TRIGGER_CLASS, "font-semibold")}>
              {activeApp}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={MENU_CONTENT_CLASS}>
              <DropdownMenuItem onClick={showAbout}>About this app</DropdownMenuItem>
              <DropdownMenuItem onClick={() => openSystemSettings(openWindow)}>
                Preferences… <span className={SHORTCUT_CLASS}>⌘,</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={!focusedId} onClick={() => wm && minimizeFocused(wm)}>
                Hide Window <span className={SHORTCUT_CLASS}>⌘H</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!focusedId} onClick={() => wm && closeFocused(wm)}>
                Quit <span className={SHORTCUT_CLASS}>⌘Q</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* File */}
        <DropdownMenu>
          <DropdownMenuTrigger className={MENU_TRIGGER_CLASS}>File</DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={MENU_CONTENT_CLASS}>
            <DropdownMenuItem onClick={() => newWindow(openWindow)}>
              New Window <span className={SHORTCUT_CLASS}>⌘N</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSearchOpen}>
              Open Search… <span className={SHORTCUT_CLASS}>⌘K</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openFileDialog()}>
              Open File… <span className={SHORTCUT_CLASS}>⌘O</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={saveActive}>
              Save <span className={SHORTCUT_CLASS}>⌘S</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportActive}>Export…</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={!focusedId} onClick={() => wm && closeFocused(wm)}>
              Close Window <span className={SHORTCUT_CLASS}>⌘W</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit */}
        <DropdownMenu>
          <DropdownMenuTrigger className={MENU_TRIGGER_CLASS}>Edit</DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={MENU_CONTENT_CLASS}>
            <DropdownMenuItem onClick={() => execEditCommand("undo")}>
              Undo <span className={SHORTCUT_CLASS}>⌘Z</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => execEditCommand("redo")}>
              Redo <span className={SHORTCUT_CLASS}>⇧⌘Z</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => execEditCommand("cut")}>
              Cut <span className={SHORTCUT_CLASS}>⌘X</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => execEditCommand("copy")}>
              Copy <span className={SHORTCUT_CLASS}>⌘C</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => execEditCommand("paste")}>
              Paste <span className={SHORTCUT_CLASS}>⌘V</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => execEditCommand("selectAll")}>
              Select All <span className={SHORTCUT_CLASS}>⌘A</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={findInApp}>
              Find in App <span className={SHORTCUT_CLASS}>⌘F</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View */}
        <DropdownMenu>
          <DropdownMenuTrigger className={MENU_TRIGGER_CLASS}>View</DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={MENU_CONTENT_CLASS}>
            <DropdownMenuItem onClick={toggleSidebar}>
              Toggle Sidebar <span className={SHORTCUT_CLASS}>⌃⌘S</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleDock}>Toggle Dock Auto-Hide</DropdownMenuItem>
            <DropdownMenuItem onClick={openWidgetPicker}>Show Widgets Gallery</DropdownMenuItem>
            <DropdownMenuItem onClick={toggleFullscreen}>
              Enter Full Screen <span className={SHORTCUT_CLASS}>⌃⌘F</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className={MENU_CONTENT_CLASS}>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  {theme === "light" && <Check className="h-3.5 w-3.5 mr-1" />} Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  {theme === "dark" && <Check className="h-3.5 w-3.5 mr-1" />} Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  {theme === "system" && <Check className="h-3.5 w-3.5 mr-1" />} System
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={zoomIn}>
              Zoom In <span className={SHORTCUT_CLASS}>⌘+</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={zoomOut}>
              Zoom Out <span className={SHORTCUT_CLASS}>⌘−</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={zoomReset}>
              Actual Size <span className={SHORTCUT_CLASS}>⌘0</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Window */}
        <DropdownMenu>
          <DropdownMenuTrigger className={MENU_TRIGGER_CLASS}>Window</DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={MENU_CONTENT_CLASS}>
            <DropdownMenuItem disabled={!focusedId} onClick={() => wm && minimizeFocused(wm)}>
              Minimize <span className={SHORTCUT_CLASS}>⌘M</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!focusedId} onClick={() => wm && maximizeFocused(wm)}>
              Zoom (Maximize)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={!wm || wm.windows.length === 0} onClick={() => wm && bringAllToFront(wm)}>
              Bring All to Front
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!wm || visibleWindows.length === 0} onClick={() => wm && cascadeWindows(wm)}>
              Cascade Windows
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!wm || wm.windows.length === 0} onClick={() => wm && closeAllWindows(wm)}>
              Close All
            </DropdownMenuItem>
            {wm && wm.windows.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Open Windows
                </DropdownMenuLabel>
                {wm.windows.map(w => (
                  <DropdownMenuItem key={w.id} onClick={() => wm.focusWindow(w.id)}>
                    {focusedId === w.id ? <Check className="h-3.5 w-3.5 mr-1" /> : <span className="w-4 mr-1" />}
                    <span className="truncate">{w.title}</span>
                    {w.minimized && <span className="ml-auto text-[10px] text-muted-foreground">Min</span>}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help */}
        <DropdownMenu>
          <DropdownMenuTrigger className={MENU_TRIGGER_CLASS}>Help</DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={MENU_CONTENT_CLASS}>
            <DropdownMenuItem onClick={() => openHelp(openWindow)}>SITA Help…</DropdownMenuItem>
            <DropdownMenuItem onClick={openShortcuts}>
              Keyboard Shortcuts <span className={SHORTCUT_CLASS}>⌘/</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openDocumentation}>Documentation</DropdownMenuItem>
            <DropdownMenuItem onClick={reportIssue}>Report an Issue</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={whatsNew}>What's New</DropdownMenuItem>
            <DropdownMenuItem onClick={showAbout}>About SITA OS</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Status indicators */}
      <div className="flex items-center gap-1.5">
        {/* Trust posture */}
        <TrustPostureChip posture={indicators.trustPosture} showLabel={false} />

        {/* Network */}
        <div className="flex h-5 w-5 items-center justify-center" title={isOnline ? "Online" : "Offline"}>
          {isOnline ? (
            <Wifi className="h-3 w-3 text-[hsl(0_0%_100%/0.5)]" />
          ) : (
            <WifiOff className="h-3 w-3 text-[hsl(0_70%_60%)]" />
          )}
        </div>

        {/* Search */}
        {onSearchOpen && (
          <button
            onClick={onSearchOpen}
            className="flex h-5 w-5 items-center justify-center rounded text-[hsl(0_0%_100%/0.5)] hover:text-[hsl(0_0%_100%/0.9)] transition-colors"
            title="Search (⌘K)"
          >
            <Search className="h-3 w-3" />
          </button>
        )}

        {/* Control Center */}
        {onControlCenterOpen && (
          <button
            onClick={onControlCenterOpen}
            className="flex h-5 w-5 items-center justify-center rounded text-[hsl(0_0%_100%/0.5)] hover:text-[hsl(0_0%_100%/0.9)] transition-colors"
            title="Control Center"
          >
            <SlidersHorizontal className="h-3 w-3" />
          </button>
        )}

        {/* Notifications */}
        {onNotifOpen && (
          <button
            onClick={onNotifOpen}
            className="relative flex h-5 items-center justify-center rounded text-[hsl(0_0%_100%/0.5)] hover:text-[hsl(0_0%_100%/0.9)] transition-colors px-0.5"
            title="Notifications"
          >
            <Bell className="h-3 w-3" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3 min-w-3 items-center justify-center rounded-full bg-[hsl(0_80%_55%)] px-0.5 text-[7px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* Clock */}
        <span className="text-[11px] font-medium text-[hsl(0_0%_100%/0.7)] tabular-nums ml-0.5">
          {clock}
        </span>

        {/* Avatar */}
        {user && (
          <button
            onClick={() => navigate("/profile")}
            className="flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(0_0%_100%/0.15)] text-[8px] font-bold text-[hsl(0_0%_100%/0.8)] hover:bg-[hsl(0_0%_100%/0.25)] transition-colors ml-0.5"
          >
            {(user.user_metadata?.display_name || user.email || "U").charAt(0).toUpperCase()}
          </button>
        )}
      </div>
    </header>
  );
});
SystemMenuBar.displayName = "SystemMenuBar";
