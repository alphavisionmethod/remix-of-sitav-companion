// ═══════════════════════════════════════════════════════════════
// SITA OS — Control Center Pull-Down (Premium Overhaul)
// Multi-section command surface with live system data
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi, Bluetooth, Moon, Sun, BellOff, Volume2, VolumeX,
  MonitorSmartphone, Focus, Airplay, X, Shield, Lock,
  SkipBack, Play, Pause, SkipForward, Music,
  Battery, HardDrive, Activity, ArrowUp, ArrowDown,
  Camera, Timer, Calculator, Columns3, ChevronRight,
  Settings, Signal, WifiOff, BluetoothOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEPTH_LAYERS } from "@/platform/design-system/nova-os";
import { useSettingsValue } from "@/hooks/use-settings-value";
import { Slider } from "@/components/ui/slider";
import { useWindowManagerContext } from "@/contexts/WindowManagerContext";
import { SitaVoiceControlRow } from "./sita-voice/SitaVoiceControlRow";
import { SitaAutonomyControls } from "./sita-agent/SitaAutonomyControls";
import { SitaSpatialControls } from "./sita-spatial/SitaSpatialControls";
import { SitaCortexControls } from "./sita-cortex/SitaCortexControls";
import { SitaPersonalityControls } from "./sita-sentience/SitaPersonalityControls";

interface ControlCenterProps {
  open: boolean;
  onClose: () => void;
}

// ── Connectivity Cluster ─────────────────────────────────────

function ConnectivityCluster({
  onOpenSettings,
}: {
  onOpenSettings: (section: string) => void;
}) {
  const [wifiOn, setWifiOn] = useState(true);
  const [btOn, setBtOn] = useState(false);
  const [vpnOn, setVpnOn] = useState(false);
  const [airdropOn, setAirdropOn] = useState(false);

  const tiles = [
    {
      id: "wifi", label: "Wi-Fi", sub: wifiOn ? "Home-5G" : "Off",
      icon: wifiOn ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />,
      active: wifiOn, onToggle: () => setWifiOn(!wifiOn), settings: "network",
    },
    {
      id: "bluetooth", label: "Bluetooth", sub: btOn ? "AirPods Pro" : "Off",
      icon: btOn ? <Bluetooth className="h-4 w-4" /> : <BluetoothOff className="h-4 w-4" />,
      active: btOn, onToggle: () => setBtOn(!btOn), settings: "bluetooth",
    },
    {
      id: "vpn", label: "VPN", sub: vpnOn ? "Connected" : "Off",
      icon: <Shield className="h-4 w-4" />,
      active: vpnOn, onToggle: () => setVpnOn(!vpnOn), settings: "network",
    },
    {
      id: "airdrop", label: "AirDrop", sub: airdropOn ? "Everyone" : "Off",
      icon: <Airplay className="h-4 w-4" />,
      active: airdropOn, onToggle: () => setAirdropOn(!airdropOn), settings: "network",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {tiles.map((t) => (
        <button
          key={t.id}
          onClick={t.onToggle}
          onDoubleClick={() => onOpenSettings(t.settings)}
          className={cn(
            "flex items-center gap-2.5 p-2.5 rounded-xl transition-all duration-150 text-left group",
            t.active
              ? "bg-[hsl(210_80%_55%/0.22)] text-[hsl(210_80%_72%)]"
              : "bg-[hsl(0_0%_100%/0.04)] text-[hsl(0_0%_100%/0.4)] hover:bg-[hsl(0_0%_100%/0.07)]"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            t.active ? "bg-[hsl(210_80%_55%)]" : "bg-[hsl(0_0%_100%/0.08)]"
          )}>
            <span className={t.active ? "text-white" : ""}>{t.icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold leading-tight truncate">{t.label}</div>
            <div className="text-[9px] opacity-60 leading-tight truncate">{t.sub}</div>
          </div>
          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-30 transition-opacity shrink-0" />
        </button>
      ))}
    </div>
  );
}

// ── Mode Cluster ─────────────────────────────────────────────

function ModeCluster({
  isDark,
  onThemeToggle,
}: {
  isDark: boolean;
  onThemeToggle: () => void;
}) {
  const [focusOn, setFocusOn] = useState(false);
  const [dndOn, setDndOn] = useState(false);
  const [stageOn, setStageOn] = useState(false);

  const tiles = [
    {
      id: "focus", label: "Focus", sub: focusOn ? "Work" : "Off",
      icon: <Focus className="h-3.5 w-3.5" />, active: focusOn,
      onToggle: () => setFocusOn(!focusOn), color: "purple",
    },
    {
      id: "dnd", label: "DND", sub: dndOn ? "Until 5 PM" : "Off",
      icon: <BellOff className="h-3.5 w-3.5" />, active: dndOn,
      onToggle: () => setDndOn(!dndOn), color: "purple",
    },
    {
      id: "theme", label: isDark ? "Dark" : "Light", sub: "Theme",
      icon: isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />,
      active: isDark, onToggle: onThemeToggle, color: "blue",
    },
    {
      id: "stage", label: "Stage Mgr", sub: stageOn ? "On" : "Off",
      icon: <Columns3 className="h-3.5 w-3.5" />, active: stageOn,
      onToggle: () => setStageOn(!stageOn), color: "blue",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {tiles.map((t) => (
        <button
          key={t.id}
          onClick={t.onToggle}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-150",
            t.active
              ? t.color === "purple"
                ? "bg-[hsl(265_55%_55%/0.22)] text-[hsl(265_55%_72%)]"
                : "bg-[hsl(210_80%_55%/0.22)] text-[hsl(210_80%_72%)]"
              : "bg-[hsl(0_0%_100%/0.04)] text-[hsl(0_0%_100%/0.4)] hover:bg-[hsl(0_0%_100%/0.07)]"
          )}
        >
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center",
            t.active
              ? t.color === "purple" ? "bg-[hsl(265_55%_55%)]" : "bg-[hsl(210_80%_55%)]"
              : "bg-[hsl(0_0%_100%/0.08)]"
          )}>
            <span className={t.active ? "text-white" : ""}>{t.icon}</span>
          </div>
          <span className="text-[8px] font-medium leading-tight text-center">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Sliders Section ──────────────────────────────────────────

function SlidersSection() {
  const [volume, setVolume] = useSettingsValue("sound.volume", 0.7);
  const [muted, setMuted] = useSettingsValue("sound.mute", false);
  const [brightness, setBrightness] = useSettingsValue("display.brightness", 0.8);

  return (
    <div className="space-y-3">
      {/* Volume */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMuted(!muted as any)}
          className="text-[hsl(0_0%_100%/0.5)] hover:text-[hsl(0_0%_100%/0.8)] transition-colors shrink-0"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <Slider
          value={[muted ? 0 : (volume ?? 0.7) * 100]}
          onValueChange={([v]) => {
            setVolume(v / 100 as any);
            if (muted && v > 0) setMuted(false as any);
          }}
          max={100}
          step={1}
          className="flex-1"
        />
        <span className="text-[10px] text-[hsl(0_0%_100%/0.3)] tabular-nums w-7 text-right shrink-0">
          {Math.round((muted ? 0 : (volume ?? 0.7)) * 100)}%
        </span>
      </div>

      {/* Brightness */}
      <div className="flex items-center gap-3">
        <Sun className="h-4 w-4 text-[hsl(0_0%_100%/0.5)] shrink-0" />
        <Slider
          value={[(brightness ?? 0.8) * 100]}
          onValueChange={([v]) => setBrightness(v / 100 as any)}
          max={100}
          step={1}
          className="flex-1"
        />
        <span className="text-[10px] text-[hsl(0_0%_100%/0.3)] tabular-nums w-7 text-right shrink-0">
          {Math.round((brightness ?? 0.8) * 100)}%
        </span>
      </div>
    </div>
  );
}

// ── Now Playing Widget ───────────────────────────────────────

function NowPlayingWidget() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress] = useState(42);

  return (
    <div className="rounded-xl bg-[hsl(0_0%_100%/0.04)] p-3 space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(265_55%_55%)] to-[hsl(210_80%_55%)] flex items-center justify-center shrink-0">
          <Music className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold text-[hsl(0_0%_100%/0.85)] truncate">Morning Jazz</div>
          <div className="text-[9px] text-[hsl(0_0%_100%/0.4)] truncate">Ambient Sounds · Spotify</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button className="p-1 text-[hsl(0_0%_100%/0.4)] hover:text-[hsl(0_0%_100%/0.7)] transition-colors">
            <SkipBack className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-full bg-[hsl(0_0%_100%/0.1)] text-[hsl(0_0%_100%/0.8)] hover:bg-[hsl(0_0%_100%/0.15)] transition-colors"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button className="p-1 text-[hsl(0_0%_100%/0.4)] hover:text-[hsl(0_0%_100%/0.7)] transition-colors">
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-[3px] rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[hsl(0_0%_100%/0.25)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ── System Status Strip ──────────────────────────────────────

function SystemStatusStrip() {
  const [stats] = useState({
    battery: 87,
    batteryTime: "4h 12m",
    charging: false,
    storageUsed: 42,
    storageTotal: 128,
    netUp: 2.1,
    netDown: 12.4,
    ramPercent: 61,
  });

  const storagePercent = Math.round((stats.storageUsed / stats.storageTotal) * 100);

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Battery */}
      <div className="rounded-lg bg-[hsl(0_0%_100%/0.04)] p-2.5 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Battery className="h-3.5 w-3.5 text-[hsl(130_55%_50%)]" />
          <span className="text-[10px] font-semibold text-[hsl(0_0%_100%/0.7)]">{stats.battery}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              stats.battery > 20 ? "bg-[hsl(130_55%_50%)]" : "bg-[hsl(0_70%_55%)]"
            )}
            style={{ width: `${stats.battery}%` }}
          />
        </div>
        <div className="text-[8px] text-[hsl(0_0%_100%/0.3)]">{stats.batteryTime} remaining</div>
      </div>

      {/* Storage */}
      <div className="rounded-lg bg-[hsl(0_0%_100%/0.04)] p-2.5 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <HardDrive className="h-3.5 w-3.5 text-[hsl(210_80%_60%)]" />
          <span className="text-[10px] font-semibold text-[hsl(0_0%_100%/0.7)]">{stats.storageUsed}GB</span>
        </div>
        <div className="h-1.5 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[hsl(210_80%_60%)] transition-all"
            style={{ width: `${storagePercent}%` }}
          />
        </div>
        <div className="text-[8px] text-[hsl(0_0%_100%/0.3)]">{stats.storageUsed}/{stats.storageTotal} GB</div>
      </div>

      {/* Network */}
      <div className="rounded-lg bg-[hsl(0_0%_100%/0.04)] p-2.5">
        <div className="flex items-center gap-1.5 mb-1">
          <Signal className="h-3.5 w-3.5 text-[hsl(45_80%_55%)]" />
          <span className="text-[10px] font-semibold text-[hsl(0_0%_100%/0.7)]">Network</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <ArrowUp className="h-2.5 w-2.5 text-[hsl(130_55%_50%)]" />
            <span className="text-[9px] text-[hsl(0_0%_100%/0.5)] tabular-nums">{stats.netUp} MB/s</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowDown className="h-2.5 w-2.5 text-[hsl(210_80%_60%)]" />
            <span className="text-[9px] text-[hsl(0_0%_100%/0.5)] tabular-nums">{stats.netDown} MB/s</span>
          </div>
        </div>
      </div>

      {/* RAM */}
      <div className="rounded-lg bg-[hsl(0_0%_100%/0.04)] p-2.5 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-[hsl(265_55%_60%)]" />
          <span className="text-[10px] font-semibold text-[hsl(0_0%_100%/0.7)]">RAM {stats.ramPercent}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[hsl(265_55%_60%)] transition-all"
            style={{ width: `${stats.ramPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Quick Extras Grid ────────────────────────────────────────

function QuickExtrasGrid() {
  const [nightShift, setNightShift] = useSettingsValue("display.nightShift", false);
  const [reduceMotion, setReduceMotion] = useSettingsValue("appearance.reduceMotion", false);

  const extras = [
    { id: "night", label: "Night Shift", icon: <Moon className="h-3.5 w-3.5" />, active: nightShift, onToggle: () => setNightShift(!nightShift as any) },
    { id: "motion", label: "Reduce Motion", icon: <MonitorSmartphone className="h-3.5 w-3.5" />, active: reduceMotion, onToggle: () => setReduceMotion(!reduceMotion as any) },
    { id: "record", label: "Screen Rec", icon: <Camera className="h-3.5 w-3.5" />, active: false, onToggle: () => {} },
    { id: "lock", label: "Lock Screen", icon: <Lock className="h-3.5 w-3.5" />, active: false, onToggle: () => {} },
  ];

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {extras.map((e) => (
        <button
          key={e.id}
          onClick={e.onToggle}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-150",
            e.active
              ? "bg-[hsl(38_85%_55%/0.20)] text-[hsl(38_85%_65%)]"
              : "bg-[hsl(0_0%_100%/0.04)] text-[hsl(0_0%_100%/0.4)] hover:bg-[hsl(0_0%_100%/0.07)]"
          )}
        >
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center",
            e.active ? "bg-[hsl(38_85%_55%)]" : "bg-[hsl(0_0%_100%/0.08)]"
          )}>
            <span className={e.active ? "text-white" : ""}>{e.icon}</span>
          </div>
          <span className="text-[8px] font-medium leading-tight text-center">{e.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── System Pulse Bar ─────────────────────────────────────────

function SystemPulseBar() {
  const healthScore = 94;
  const activeWorkflows = 2;
  const openAlerts = 0;

  return (
    <div className="rounded-xl bg-[hsl(0_0%_100%/0.04)] p-2.5 flex items-center gap-3">
      {/* Health score */}
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8">
          <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(0 0% 100% / 0.06)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15" fill="none"
              stroke={healthScore > 80 ? "hsl(130 55% 50%)" : healthScore > 50 ? "hsl(45 80% 55%)" : "hsl(0 70% 55%)"}
              strokeWidth="3"
              strokeDasharray={`${healthScore * 0.94} 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] font-bold text-[hsl(0_0%_100%/0.8)] tabular-nums">{healthScore}</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-[hsl(130_55%_55%)]">Healthy</div>
          <div className="text-[8px] text-[hsl(0_0%_100%/0.3)]">System Health</div>
        </div>
      </div>

      <div className="w-px h-6 bg-[hsl(0_0%_100%/0.06)]" />

      {/* Workflows */}
      <div className="flex-1 flex items-center gap-3">
        <div>
          <div className="text-[10px] font-semibold text-[hsl(0_0%_100%/0.7)] tabular-nums">{activeWorkflows}</div>
          <div className="text-[8px] text-[hsl(0_0%_100%/0.3)]">Workflows</div>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-[hsl(0_0%_100%/0.7)] tabular-nums">{openAlerts}</span>
            {openAlerts > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(0_70%_55%)] animate-pulse" />
            )}
          </div>
          <div className="text-[8px] text-[hsl(0_0%_100%/0.3)]">Alerts</div>
        </div>
      </div>
    </div>
  );
}

// ── Main Control Center ──────────────────────────────────────

export function ControlCenter({ open, onClose }: ControlCenterProps) {
  const [theme, setTheme] = useSettingsValue("appearance.theme", "dark");
  const isDark = theme === "dark";
  const wm = useWindowManagerContext();

  const handleThemeToggle = useCallback(() => {
    const next = isDark ? "light" : "dark";
    setTheme(next as any);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, [isDark, setTheme]);

  const handleOpenSettings = useCallback((section?: string) => {
    if (wm?.openWindow) {
      (wm as any).openWindow("settings", { section });
    }
    onClose();
  }, [wm, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0"
            style={{ zIndex: DEPTH_LAYERS.menuBar + 5 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-2 overflow-y-auto overflow-x-hidden scrollbar-none"
            style={{
              top: 32,
              width: 340,
              maxHeight: "calc(100vh - 80px)",
              zIndex: DEPTH_LAYERS.menuBar + 10,
              background: "hsl(0 0% 7% / 0.85)",
              backdropFilter: "blur(60px) saturate(1.8)",
              WebkitBackdropFilter: "blur(60px) saturate(1.8)",
              borderRadius: 18,
              border: "1px solid hsl(0 0% 100% / 0.08)",
              boxShadow: "0 24px 80px hsl(0 0% 0% / 0.55), 0 0 0 1px hsl(0 0% 100% / 0.03) inset",
            }}
            initial={{ opacity: 0, y: -14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(0_0%_100%/0.06)] sticky top-0 z-10"
              style={{ background: "hsl(0 0% 7% / 0.9)", backdropFilter: "blur(20px)" }}
            >
              <span className="text-[13px] font-semibold text-[hsl(0_0%_100%/0.9)]">Control Center</span>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-[hsl(0_0%_100%/0.4)] hover:text-[hsl(0_0%_100%/0.8)] hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-3 space-y-3">
              {/* 1. Connectivity */}
              <ConnectivityCluster onOpenSettings={handleOpenSettings} />

              {/* 1b. Sita Voice (Phase B) */}
              <SitaVoiceControlRow />

              {/* 1c. Sita Autonomy (Phase E) */}
              <SitaAutonomyControls />

              {/* 1d. Sita Spatial (Phase F) */}
              <SitaSpatialControls />

              {/* 1e. Sita Cortex (Phase G) */}
              <SitaCortexControls />

              {/* 1f. Sita Sentience (Phase H) */}
              <SitaPersonalityControls />

              {/* 2. Mode cluster */}
              <ModeCluster isDark={isDark} onThemeToggle={handleThemeToggle} />

              {/* Divider */}
              <div className="h-px bg-[hsl(0_0%_100%/0.05)]" />

              {/* 3. Sliders */}
              <SlidersSection />

              {/* Divider */}
              <div className="h-px bg-[hsl(0_0%_100%/0.05)]" />

              {/* 4. Now Playing */}
              <NowPlayingWidget />

              {/* 5. System Status */}
              <SystemStatusStrip />

              {/* 6. Quick Extras */}
              <QuickExtrasGrid />

              {/* 7. System Pulse */}
              <SystemPulseBar />

              {/* 8. Open Settings */}
              <button
                onClick={() => handleOpenSettings()}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[hsl(0_0%_100%/0.04)] hover:bg-[hsl(0_0%_100%/0.08)] text-[hsl(0_0%_100%/0.5)] hover:text-[hsl(0_0%_100%/0.8)] transition-all text-[11px] font-medium"
              >
                <Settings className="h-3.5 w-3.5" />
                Open Settings
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
