// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Menu Bar (macOS-style)
// Translucent persistent bar on desktop route: logo, search, bell, clock, avatar
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Wifi, WifiOff, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "./NotificationPanel";
import { TrustPostureChip } from "./shell/TrustPostureChip";
import { useShellIndicators } from "@/hooks/use-shell-indicators";
import logo from "@/assets/logo.webp";

interface DesktopMenuBarProps {
  onSearchOpen: () => void;
  onNotifOpen: () => void;
}

export const DesktopMenuBar = memo(({ onSearchOpen, onNotifOpen }: DesktopMenuBarProps) => {
  const [clock, setClock] = useState("");
  const { user } = useAuth();
  const unreadCount = useUnreadCount();
  const indicators = useShellIndicators();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] flex h-7 items-center justify-between px-4 select-none"
      style={{
        background: "hsl(0 0% 0% / 0.25)",
        backdropFilter: "blur(40px) saturate(1.8)",
        WebkitBackdropFilter: "blur(40px) saturate(1.8)",
      }}
    >
      {/* Left: Logo + App name */}
      <div className="flex items-center gap-2">
        <img src={logo} alt="SITA" className="h-3.5 w-3.5 rounded-sm" />
        <span className="text-[11px] font-semibold text-[hsl(0_0%_100%/0.9)] tracking-wide">
          SITA
        </span>
        <span className="text-[11px] font-medium text-[hsl(0_0%_100%/0.45)]">
          Desktop
        </span>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1">
        {/* Trust posture */}
        <TrustPostureChip posture={indicators.trustPosture} showLabel={false} />

        {/* Network */}
        <div className="flex h-5 w-5 items-center justify-center" title={isOnline ? "Online" : "Offline"}>
          {isOnline
            ? <Wifi className="h-3 w-3 text-[hsl(0_0%_100%/0.5)]" />
            : <WifiOff className="h-3 w-3 text-[hsl(0_70%_60%)]" />
          }
        </div>

        {/* Search */}
        <button
          onClick={onSearchOpen}
          className="flex h-5 w-5 items-center justify-center rounded text-[hsl(0_0%_100%/0.6)] hover:text-[hsl(0_0%_100%/0.9)] transition-colors"
          title="Search (⌘K)"
        >
          <Search className="h-3 w-3" />
        </button>

        {/* Notifications */}
        <button
          onClick={onNotifOpen}
          className="relative flex h-5 items-center justify-center rounded text-[hsl(0_0%_100%/0.6)] hover:text-[hsl(0_0%_100%/0.9)] transition-colors px-1"
          title="Notifications"
        >
          <Bell className="h-3 w-3" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3 min-w-3 items-center justify-center rounded-full bg-[hsl(0_80%_55%)] px-0.5 text-[7px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Clock */}
        <span className="text-[11px] font-medium text-[hsl(0_0%_100%/0.7)] tabular-nums ml-1">
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
DesktopMenuBar.displayName = "DesktopMenuBar";
