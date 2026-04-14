import { useState, useRef, useEffect } from "react";
import { Wifi, ShieldCheck, MoonStar, Battery, Bluetooth } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { SystemWifiPanel } from "./SystemWifiPanel";
import { SystemBluetoothPanel } from "./SystemBluetoothPanel";
import { SystemBatteryPanel } from "./SystemBatteryPanel";

interface DesktopSystemWidgetProps {
  onLaunchApp?: (appId: string) => void;
}

interface Toggle {
  id: string;
  icon: typeof Wifi;
  label: string;
  defaultOn: boolean;
  panel?: string; // which panel to open
  appId?: string; // which app to launch instead
}

const toggles: Toggle[] = [
  { id: "wifi", icon: Wifi, label: "WiFi", defaultOn: true, panel: "wifi" },
  { id: "bluetooth", icon: Bluetooth, label: "Bluetooth", defaultOn: false, panel: "bluetooth" },
  { id: "shield", icon: ShieldCheck, label: "Shield", defaultOn: true, appId: "security-center" },
  { id: "calm", icon: MoonStar, label: "Calm", defaultOn: false },
  { id: "battery", icon: Battery, label: "Battery", defaultOn: true, panel: "battery" },
];

export function DesktopSystemWidget({ onLaunchApp }: DesktopSystemWidgetProps) {
  const [active, setActive] = useState<Record<string, boolean>>(
    Object.fromEntries(toggles.map(t => [t.id, t.defaultOn]))
  );
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Close panel on outside click
  useEffect(() => {
    if (!openPanel) return;
    const handler = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [openPanel]);

  const handleClick = (t: Toggle) => {
    const isCurrentlyOn = active[t.id];

    // If OFF → turn ON only (don't open panel yet)
    if (!isCurrentlyOn) {
      setActive(prev => ({ ...prev, [t.id]: true }));

      if (t.id === "calm") {
        toast({
          title: "🌙 Focus Mode On",
          description: "Notifications silenced",
        });
      }
      setOpenPanel(null);
      return;
    }

    // Already ON → second click behavior
    // Calm: toggle OFF
    if (t.id === "calm") {
      setActive(prev => ({ ...prev, [t.id]: false }));
      toast({
        title: "☀️ Focus Mode Off",
        description: "Notifications restored",
      });
      setOpenPanel(null);
      return;
    }

    // Shield: launch security center app
    if (t.appId) {
      onLaunchApp?.(t.appId);
      setOpenPanel(null);
      return;
    }

    // WiFi/Bluetooth/Battery: toggle panel open/close
    if (t.panel) {
      setOpenPanel(prev => prev === t.panel ? null : t.panel!);
    }
  };

  // Long press to turn OFF when already ON (for WiFi/BT/Battery/Shield)
  const handleContextMenu = (e: React.MouseEvent, t: Toggle) => {
    e.preventDefault();
    e.stopPropagation();
    if (active[t.id] && t.id !== "calm") {
      setActive(prev => ({ ...prev, [t.id]: false }));
      setOpenPanel(null);
    }
  };

  return (
    <div ref={containerRef} className="relative rounded-3xl border border-white/[0.04] bg-white/[0.02] backdrop-blur-3xl p-4">
      <div className="flex items-center justify-between">
        {toggles.map((t) => {
          const isOn = active[t.id];
          const hasPanel = openPanel === t.panel;
          return (
            <div key={t.id} className="relative">
              <button
                onClick={() => handleClick(t)}
                onContextMenu={(e) => handleContextMenu(e, t)}
                onPointerDown={e => e.stopPropagation()}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200",
                  isOn
                    ? "bg-blue-500/80 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                    : "bg-white/[0.06] text-white/30 hover:bg-white/[0.1]",
                  hasPanel && "ring-2 ring-blue-400/40"
                )}>
                  <t.icon className="h-4 w-4" />
                </div>
                <span className={cn(
                  "text-[9px] transition-colors",
                  isOn ? "text-white/50" : "text-white/20"
                )}>
                  {t.label}
                </span>
              </button>

              {/* Sub-panels */}
              {openPanel === "wifi" && t.id === "wifi" && (
                <SystemWifiPanel onClose={() => setOpenPanel(null)} />
              )}
              {openPanel === "bluetooth" && t.id === "bluetooth" && (
                <SystemBluetoothPanel onClose={() => setOpenPanel(null)} />
              )}
              {openPanel === "battery" && t.id === "battery" && (
                <SystemBatteryPanel onClose={() => setOpenPanel(null)} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
