import { useState } from "react";
import { Battery, BatteryCharging, Zap, Monitor, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const POWER_MODES = [
  { id: "performance", label: "Performance", icon: Zap, desc: "Max speed, higher battery use" },
  { id: "balanced", label: "Balanced", icon: Monitor, desc: "Optimized for daily use" },
  { id: "saver", label: "Power Saver", icon: Moon, desc: "Extended battery life" },
] as const;

export function SystemBatteryPanel({ onClose }: { onClose: () => void }) {
  const [level] = useState(78);
  const [charging] = useState(true);
  const [mode, setMode] = useState<string>("balanced");

  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference - (level / 100) * circumference;
  const levelColor = level > 50 ? "hsl(152, 55%, 48%)" : level > 20 ? "hsl(38, 85%, 58%)" : "hsl(0, 70%, 55%)";

  return (
    <div
      className="absolute bottom-full mb-2 right-0 w-[280px] rounded-2xl border border-white/[0.08] bg-black/70 backdrop-blur-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50"
      onPointerDown={e => e.stopPropagation()}
    >
      <div className="p-4 flex items-center gap-4 border-b border-white/[0.06]">
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="36" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="4" />
            <circle
              cx="40" cy="40" r="36" fill="none"
              stroke={levelColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {charging
              ? <BatteryCharging className="w-4 h-4 text-[hsl(152,55%,48%)]" />
              : <Battery className="w-4 h-4 text-white/40" />
            }
            <span className="text-sm font-bold text-white mt-0.5">{level}%</span>
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-white">
            {charging ? "Charging" : "On Battery"}
          </div>
          <div className="text-[10px] text-white/40 mt-0.5">
            {charging ? "~45 min to full" : "~4h 20m remaining"}
          </div>
          <div className="text-[10px] text-white/30 mt-1">
            Screen: 2h 15m today
          </div>
        </div>
      </div>

      <div className="p-2">
        <div className="text-[9px] font-medium uppercase tracking-[0.15em] text-white/20 px-2 py-1">
          Power Mode
        </div>
        {POWER_MODES.map(pm => {
          const Icon = pm.icon;
          const isActive = mode === pm.id;
          return (
            <button
              key={pm.id}
              onClick={() => setMode(pm.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all",
                isActive ? "bg-blue-500/15" : "hover:bg-white/[0.05]"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center",
                isActive ? "bg-blue-500/20" : "bg-white/[0.05]"
              )}>
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-blue-400" : "text-white/30")} />
              </div>
              <div className="flex-1">
                <div className={cn("text-[11px]", isActive ? "text-white font-medium" : "text-white/60")}>{pm.label}</div>
                <div className="text-[9px] text-white/25">{pm.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
