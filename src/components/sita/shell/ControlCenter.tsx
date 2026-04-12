// ═══════════════════════════════════════════════════════════════
// SITA OS — Control Center Pull-Down (macOS/iOS style)
// Quick-access tiles for system toggles + sliders
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi, Bluetooth, Moon, Sun, BellOff, Volume2, VolumeX,
  MonitorSmartphone, Focus, Airplay, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEPTH_LAYERS } from "@/lib/design-system/nova-os";
import { useSettingsValue } from "@/hooks/use-settings-value";
import { Slider } from "@/components/ui/slider";

interface ControlCenterProps {
  open: boolean;
  onClose: () => void;
}

interface TileConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  settingKey?: string;
  isToggle: boolean;
}

export function ControlCenter({ open, onClose }: ControlCenterProps) {
  const [theme, setTheme] = useSettingsValue("appearance.theme", "dark");
  const [volume, setVolume] = useSettingsValue("sound.volume", 0.7);
  const [muted, setMuted] = useSettingsValue("sound.mute", false);
  const [brightness, setBrightness] = useSettingsValue("display.brightness", 0.8);
  const [nightShift, setNightShift] = useSettingsValue("display.nightShift", false);
  const [reduceMotion, setReduceMotion] = useSettingsValue("appearance.reduceMotion", false);

  // Local toggles for non-persisted items
  const [wifiOn, setWifiOn] = useState(true);
  const [bluetoothOn, setBluetoothOn] = useState(false);
  const [dndOn, setDndOn] = useState(false);
  const [focusOn, setFocusOn] = useState(false);
  const [airplayOn, setAirplayOn] = useState(false);

  const isDark = theme === "dark";

  const handleThemeToggle = useCallback(() => {
    const next = isDark ? "light" : "dark";
    setTheme(next as any);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, [isDark, setTheme]);

  const tiles: Array<{ id: string; label: string; icon: React.ReactNode; active: boolean; onToggle: () => void }> = [
    { id: "wifi", label: "Wi-Fi", icon: <Wifi className="h-4 w-4" />, active: wifiOn, onToggle: () => setWifiOn(!wifiOn) },
    { id: "bluetooth", label: "Bluetooth", icon: <Bluetooth className="h-4 w-4" />, active: bluetoothOn, onToggle: () => setBluetoothOn(!bluetoothOn) },
    { id: "dark-mode", label: isDark ? "Dark Mode" : "Light Mode", icon: isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />, active: isDark, onToggle: handleThemeToggle },
    { id: "dnd", label: "Do Not Disturb", icon: <BellOff className="h-4 w-4" />, active: dndOn, onToggle: () => setDndOn(!dndOn) },
    { id: "airplay", label: "AirPlay", icon: <Airplay className="h-4 w-4" />, active: airplayOn, onToggle: () => setAirplayOn(!airplayOn) },
    { id: "focus", label: "Focus", icon: <Focus className="h-4 w-4" />, active: focusOn, onToggle: () => setFocusOn(!focusOn) },
    { id: "night-shift", label: "Night Shift", icon: <Sun className="h-4 w-4" />, active: nightShift, onToggle: () => setNightShift(!nightShift as any) },
    { id: "reduce-motion", label: "Reduce Motion", icon: <MonitorSmartphone className="h-4 w-4" />, active: reduceMotion, onToggle: () => setReduceMotion(!reduceMotion as any) },
  ];

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
            className="fixed right-2 overflow-hidden"
            style={{
              top: 32,
              width: 320,
              zIndex: DEPTH_LAYERS.menuBar + 10,
              background: "hsl(0 0% 8% / 0.82)",
              backdropFilter: "blur(50px) saturate(1.8)",
              WebkitBackdropFilter: "blur(50px) saturate(1.8)",
              borderRadius: 16,
              border: "1px solid hsl(0 0% 100% / 0.08)",
              boxShadow: "0 20px 60px hsl(0 0% 0% / 0.5), 0 0 0 1px hsl(0 0% 100% / 0.03) inset",
            }}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(0_0%_100%/0.06)]">
              <span className="text-[13px] font-semibold text-[hsl(0_0%_100%/0.9)]">Control Center</span>
              <button onClick={onClose} className="p-1 rounded text-[hsl(0_0%_100%/0.4)] hover:text-[hsl(0_0%_100%/0.8)] transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Toggle tiles grid */}
            <div className="grid grid-cols-4 gap-2 p-3">
              {tiles.map((tile, i) => (
                <motion.button
                  key={tile.id}
                  onClick={tile.onToggle}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-150",
                    tile.active
                      ? "bg-[hsl(210_80%_55%/0.25)] text-[hsl(210_80%_70%)]"
                      : "bg-[hsl(0_0%_100%/0.04)] text-[hsl(0_0%_100%/0.4)] hover:bg-[hsl(0_0%_100%/0.08)]"
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 22 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    tile.active ? "bg-[hsl(210_80%_55%)] text-white" : "bg-[hsl(0_0%_100%/0.08)]"
                  )}>
                    {tile.icon}
                  </div>
                  <span className="text-[9px] font-medium leading-tight text-center">{tile.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Sliders */}
            <div className="px-4 pb-4 space-y-4">
              {/* Volume */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setMuted(!muted as any)} className="text-[hsl(0_0%_100%/0.5)] hover:text-[hsl(0_0%_100%/0.8)] transition-colors">
                      {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    </button>
                    <span className="text-[11px] text-[hsl(0_0%_100%/0.5)]">Volume</span>
                  </div>
                  <span className="text-[10px] text-[hsl(0_0%_100%/0.3)] tabular-nums">
                    {Math.round((volume ?? 0.7) * 100)}%
                  </span>
                </div>
                <Slider
                  value={[muted ? 0 : (volume ?? 0.7) * 100]}
                  onValueChange={([v]) => { setVolume(v / 100 as any); if (muted && v > 0) setMuted(false as any); }}
                  max={100}
                  step={1}
                  className="h-2"
                />
              </div>

              {/* Brightness */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="h-3.5 w-3.5 text-[hsl(0_0%_100%/0.5)]" />
                    <span className="text-[11px] text-[hsl(0_0%_100%/0.5)]">Brightness</span>
                  </div>
                  <span className="text-[10px] text-[hsl(0_0%_100%/0.3)] tabular-nums">
                    {Math.round((brightness ?? 0.8) * 100)}%
                  </span>
                </div>
                <Slider
                  value={[(brightness ?? 0.8) * 100]}
                  onValueChange={([v]) => setBrightness(v / 100 as any)}
                  max={100}
                  step={1}
                  className="h-2"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
