// ═══════════════════════════════════════════════════════════════
// SITA OS — Top Bar (Shell Frame Layer A)
// Persistent system bar: command, trust, status, navigation
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { useDisplayMode } from "@/contexts/DisplayModeContext";
import { useTheme } from "@/contexts/ThemeContext";
import { MISSION_MODES } from "@/lib/advisor-protocol";
import { AISpendIndicator } from "./AISpendIndicator";
import { useUnreadCount } from "./NotificationPanel";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ContextSwitcher } from "./ContextSwitcher";
import { TrustPostureChip } from "./shell/TrustPostureChip";
import { ShellStatusBar } from "./shell/ShellStatusBar";
import { useShellIndicators } from "@/hooks/use-shell-indicators";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Bell, Clock, Eye, EyeOff, Shield, Check, Sun, Moon, Search, Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SitaTopBarProps {
  onNotifOpen: () => void;
  onTimelineOpen: () => void;
  onCommandOpen?: () => void;
}

export const SitaTopBar = ({
  onNotifOpen,
  onTimelineOpen,
  onCommandOpen,
}: SitaTopBarProps) => {
  const [clock, setClock] = useState("");
  const [missionOpen, setMissionOpen] = useState(false);
  const { user } = useAuth();
  const { isDemoMode, toggleMode } = useDataMode();
  const { toggleFocus, toggleCalm, isFocus, isCalm, missionMode, setMissionMode } = useDisplayMode();
  const { theme, setTheme, resolved } = useTheme();
  const unreadCount = useUnreadCount();
  const indicators = useShellIndicators();
  const navigate = useNavigate();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit", hour12: true }));
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
    <header className="sita-top-bar sticky top-0 z-50 flex h-11 items-center justify-between border-b border-border/30 glass-panel px-3 select-none">
      {/* Left: Sidebar + Context + Command */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-7 w-7 text-muted-foreground hover:text-foreground" />
        <ContextSwitcher />

        {/* Command pill — primary affordance */}
        <div className="hidden md:block">
          {onCommandOpen ? (
            <button
              onClick={onCommandOpen}
              className="flex items-center gap-2.5 rounded-xl border border-border/40 glass-panel px-3.5 py-2 text-xs text-muted-foreground transition-all duration-200 hover:bg-secondary/60 hover:text-foreground hover:border-border/60 w-72 group"
            >
              <Search className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
              <span className="flex-1 text-left">Ask, search, or go anywhere…</span>
              <kbd className="rounded-md border border-border/40 bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium">⌘K</kbd>
            </button>
          ) : null}
        </div>
      </div>

      {/* Center: Status indicators (desktop only) */}
      <div className="hidden lg:flex items-center gap-2">
        <ShellStatusBar />
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1">
        {/* AI Spend */}
        <AISpendIndicator />

        {/* Trust posture */}
        <TrustPostureChip posture={indicators.trustPosture} showLabel={false} />

        {/* Mode toggle */}
        <button
          onClick={toggleMode}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors hover:bg-secondary/60"
        >
          <div className={cn("h-1.5 w-1.5 rounded-full", isDemoMode ? "bg-[hsl(var(--sita-gold))]" : "bg-[hsl(var(--trust-verified))]")} />
          <span className="text-muted-foreground hidden sm:inline">{isDemoMode ? "Demo" : "Live"}</span>
        </button>

        <div className="h-4 w-px bg-border/40 mx-0.5" />

        {/* Mission Mode */}
        <Popover open={missionOpen} onOpenChange={setMissionOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors hover:bg-secondary/60">
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
                    missionMode.id === m.id ? "bg-primary/10 text-primary" : "hover:bg-secondary/60 text-foreground"
                  )}
                >
                  <span className="text-base shrink-0">{m.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{m.description}</p>
                  </div>
                  {missionMode.id === m.id && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="h-4 w-px bg-border/40 mx-0.5" />

        {/* Focus + Calm */}
        <button
          onClick={toggleFocus}
          className={cn("flex h-7 w-7 items-center justify-center rounded-lg transition-colors", isFocus ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary/60")}
          title={isFocus ? "Exit Focus Mode" : "Focus Mode"}
        >
          {isFocus ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={toggleCalm}
          className={cn("flex h-7 w-7 items-center justify-center rounded-lg transition-colors", isCalm ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary/60")}
          title={isCalm ? "Exit Calm Mode" : "Calm Mode"}
        >
          <Shield className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-px bg-border/40 mx-0.5" />

        {/* Theme */}
        <button
          onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/60 transition-colors"
          title={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
        >
          {resolved === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        {/* Proof/Receipts */}
        <button
          onClick={() => navigate("/proof")}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/60 transition-colors"
          title="Proof Center"
        >
          <Receipt className="h-3.5 w-3.5" />
        </button>

        {/* Timeline */}
        <button
          onClick={onTimelineOpen}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/60 transition-colors"
          title="Timeline"
        >
          <Clock className="h-3.5 w-3.5" />
        </button>

        {/* Notifications */}
        <button
          onClick={onNotifOpen}
          className="relative flex h-7 items-center gap-1 rounded-lg px-2 text-muted-foreground hover:bg-secondary/60 transition-colors"
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
        <span className="text-[11px] font-medium text-muted-foreground tabular-nums ml-1 hidden sm:inline">{clock}</span>
      </div>
    </header>
  );
};
