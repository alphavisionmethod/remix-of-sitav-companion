// ═══════════════════════════════════════════════════════════════
// SITA OS — System Menu Bar (NovaOS macOS-style)
// Fixed translucent top bar: brand, contextual menus, status indicators
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Wifi, WifiOff, BatteryFull, BatteryLow } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "../NotificationPanel";
import { TrustPostureChip } from "./TrustPostureChip";
import { useShellIndicators } from "@/hooks/use-shell-indicators";
import { DEPTH_LAYERS } from "@/lib/design-system/nova-os";
import logo from "@/assets/logo.webp";

interface SystemMenuBarProps {
  onSearchOpen?: () => void;
  onNotifOpen?: () => void;
  /** Currently active app name for contextual menus */
  activeApp?: string;
}

const MENU_ITEMS = ["File", "Edit", "View", "Window", "Help"];

export const SystemMenuBar = memo(({ onSearchOpen, onNotifOpen, activeApp }: SystemMenuBarProps) => {
  const [clock, setClock] = useState("");
  const { user } = useAuth();
  const unreadCount = useUnreadCount();
  const indicators = useShellIndicators();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
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

  return (
    <header
      className="fixed top-0 left-0 right-0 flex h-7 items-center justify-between px-4 select-none"
      style={{
        zIndex: DEPTH_LAYERS.menuBar,
        background: "hsl(0 0% 0% / 0.25)",
        backdropFilter: "blur(40px) saturate(1.8)",
        WebkitBackdropFilter: "blur(40px) saturate(1.8)",
        boxShadow: "0 1px 0 hsl(0 0% 100% / 0.05)",
      }}
    >
      {/* Left: Logo + App name + Menu items */}
      <div className="flex items-center gap-1">
        <img src={logo} alt="SITA" className="h-3.5 w-3.5 rounded-sm" />
        <span className="text-[11px] font-bold text-[hsl(0_0%_100%/0.95)] tracking-wide ml-1.5">
          {activeApp || "SITA"}
        </span>

        {/* Contextual menu items */}
        <div className="flex items-center ml-3 gap-0.5">
          {MENU_ITEMS.map((item) => (
            <button
              key={item}
              onMouseEnter={() => activeMenu && setActiveMenu(item)}
              onClick={() => setActiveMenu(activeMenu === item ? null : item)}
              className={cn(
                "px-2 py-0.5 rounded text-[11px] font-medium transition-colors",
                activeMenu === item
                  ? "bg-[hsl(0_0%_100%/0.15)] text-[hsl(0_0%_100%/0.95)]"
                  : "text-[hsl(0_0%_100%/0.6)] hover:text-[hsl(0_0%_100%/0.85)]"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Status indicators */}
      <div className="flex items-center gap-1.5">
        {/* Trust posture */}
        <TrustPostureChip posture={indicators.trustPosture} showLabel={false} />

        {/* Network */}
        <div
          className="flex h-5 w-5 items-center justify-center"
          title={isOnline ? "Online" : "Offline"}
        >
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

      {/* Close menu on click outside */}
      {activeMenu && (
        <div
          className="fixed inset-0"
          style={{ zIndex: -1 }}
          onClick={() => setActiveMenu(null)}
        />
      )}
    </header>
  );
});
SystemMenuBar.displayName = "SystemMenuBar";
