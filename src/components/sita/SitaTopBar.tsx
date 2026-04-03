// ═══════════════════════════════════════════════════════════════
// SITA OS — Top Bar
// Not a macOS menu bar. SITA's own command + status surface.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { useDisplayMode } from "@/contexts/DisplayModeContext";
import { useTheme } from "@/contexts/ThemeContext";
import { MISSION_MODES } from "@/lib/advisor-protocol";
import { AISpendIndicator } from "./AISpendIndicator";
import { CommandPalette } from "./CommandPalette";
import { useUnreadCount } from "./NotificationPanel";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ContextSwitcher } from "./ContextSwitcher";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Bell, Clock, Eye, EyeOff, Shield, Check, Sun, Moon, Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SitaTopBarProps {
  onNotifOpen: () => void;
  onTimelineOpen: () => void;
  pendingApprovals?: number;
  activeIncidents?: number;
}

export const SitaTopBar = ({
  onNotifOpen,
  onTimelineOpen,
  pendingApprovals = 3,
  activeIncidents = 1,
}: SitaTopBarProps) => {
  const [clock, setClock] = useState("");
  const [missionOpen, setMissionOpen] = useState(false);
  const { user } = useAuth();
  const { isDemoMode, toggleMode } = useDataMode();
  const { toggleFocus, toggleCalm, isFocus, isCalm, missionMode, setMissionMode } = useDisplayMode();
  const { theme, setTheme, resolved } = useTheme();
  const unreadCount = useUnreadCount();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleString("en-US", {
          weekday: "short",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const handleMissionSelect = (modeId: string) => {
    const mode = MISSION_MODES.find(m => m.id === modeId);
    setMissionMode(modeId);
    setMissionOpen(false);
    if (mode) toast.success(`Switched to ${mode.name}`);
  };

  return (
    <header className="sita-top-bar sticky top-0 z-50 flex h-11 items-center justify-between border-b border-border/30 bg-surface-0/85 backdrop-blur-xl px-3 select-none">
      {/* Left: Sidebar trigger + Command Palette */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-7 w-7 text-muted-foreground hover:text-foreground" />
        <ContextSwitcher />
        <div className="hidden md:block">
          <CommandPalette />
        </div>
      </div>

      {/* Right: Status indicators + actions */}
      <div className="flex items-center gap-1.5">
        {/* AI Spend */}
        <AISpendIndicator />

        {/* Mode toggle */}
        <button
          onClick={toggleMode}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors hover:bg-secondary/60"
        >
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isDemoMode ? "bg-[hsl(var(--sita-gold))]" : "bg-[hsl(var(--trust-verified))]"
            )}
          />
          <span className="text-muted-foreground">
            {isDemoMode ? "Demo" : "Live"}
          </span>
        </button>

        {/* Divider */}
        <div className="h-4 w-px bg-border/50 mx-0.5" />

        {/* Mission Mode Selector */}
        <Popover open={missionOpen} onOpenChange={setMissionOpen}>
          <PopoverTrigger asChild>
            <button
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors hover:bg-secondary/60"
            >
              <span>{missionMode.icon}</span>
              <span className="text-muted-foreground hidden sm:inline">{missionMode.name}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-1.5" align="end" sideOffset={8}>
            <div className="space-y-0.5">
              {MISSION_MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleMissionSelect(m.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                    missionMode.id === m.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-secondary/60 text-foreground"
                  )}
                >
                  <span className="text-base shrink-0">{m.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{m.description}</p>
                  </div>
                  {missionMode.id === m.id && (
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Divider */}
        <div className="h-4 w-px bg-border/50 mx-0.5" />

        {/* Focus mode */}
        <button
          onClick={toggleFocus}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
            isFocus
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          )}
          title={isFocus ? "Exit Focus Mode" : "Focus Mode"}
        >
          {isFocus ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Calm mode */}
        <button
          onClick={toggleCalm}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
            isCalm
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          )}
          title={isCalm ? "Exit Calm Mode" : "Calm Mode"}
        >
          <Shield className="h-3.5 w-3.5" />
        </button>

        {/* Divider */}
        <div className="h-4 w-px bg-border/50 mx-0.5" />

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
          title={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
        >
          {resolved === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        {/* Timeline */}
        <button
          onClick={onTimelineOpen}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
          title="Timeline"
        >
          <Clock className="h-3.5 w-3.5" />
        </button>

        {/* Action Center (approvals + notifications) */}
        <button
          onClick={onNotifOpen}
          className="relative flex h-7 items-center gap-1.5 rounded-lg px-2 text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
          title="Action Center"
        >
          <Bell className="h-3.5 w-3.5" />
          {unreadCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/20 px-1 text-[9px] font-bold text-primary">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Clock */}
        <span className="text-[11px] font-medium text-muted-foreground tabular-nums ml-1">
          {clock}
        </span>
      </div>
    </header>
  );
};
