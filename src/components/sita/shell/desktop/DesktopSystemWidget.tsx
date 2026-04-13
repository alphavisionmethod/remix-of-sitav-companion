import { useState } from "react";
import { Wifi, ShieldCheck, MoonStar, Battery, Bluetooth } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toggle {
  id: string;
  icon: typeof Wifi;
  label: string;
  defaultOn: boolean;
}

const toggles: Toggle[] = [
  { id: "wifi", icon: Wifi, label: "WiFi", defaultOn: true },
  { id: "bluetooth", icon: Bluetooth, label: "Bluetooth", defaultOn: false },
  { id: "shield", icon: ShieldCheck, label: "Shield", defaultOn: true },
  { id: "calm", icon: MoonStar, label: "Calm", defaultOn: false },
  { id: "battery", icon: Battery, label: "Battery", defaultOn: true },
];

export function DesktopSystemWidget() {
  const [active, setActive] = useState<Record<string, boolean>>(
    Object.fromEntries(toggles.map(t => [t.id, t.defaultOn]))
  );

  const toggle = (id: string) => setActive(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="rounded-3xl border border-white/[0.04] bg-white/[0.02] backdrop-blur-3xl p-4">
      <div className="flex items-center justify-between">
        {toggles.map((t) => {
          const isOn = active[t.id];
          return (
            <button
              key={t.id}
              onClick={() => toggle(t.id)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200",
                isOn
                  ? "bg-blue-500/80 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                  : "bg-white/[0.06] text-white/30 hover:bg-white/[0.1]"
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
          );
        })}
      </div>
    </div>
  );
}
