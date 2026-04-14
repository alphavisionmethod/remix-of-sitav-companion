// ═══════════════════════════════════════════════════════════════
// SITA OS — Advanced Battery Panel
// Health, thermal, charger, optimized charging, app drain,
// suspend/resume, profiles with visual tuning
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import {
  Battery, BatteryCharging, Zap, Monitor, Moon, Volume, Thermometer,
  Heart, Clock, Cpu, Wifi as WifiIcon, Bell, PlugZap, TrendingDown,
  Activity, ChevronDown, ChevronUp, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPowerDaemon, type PowerState, type PowerProfile } from "@/lib/os-services/powerd";

const PROFILE_CONFIG: Record<PowerProfile, { label: string; icon: typeof Zap; desc: string; color: string }> = {
  performance: { label: "Performance", icon: Zap, desc: "Max speed, higher battery use", color: "text-orange-400" },
  balanced: { label: "Balanced", icon: Monitor, desc: "Optimized for daily use", color: "text-blue-400" },
  saver: { label: "Power Saver", icon: Moon, desc: "Extended battery life", color: "text-emerald-400" },
  quiet: { label: "Quiet", icon: Volume, desc: "Silent fans, reduced performance", color: "text-purple-400" },
};

function ThermalIndicator({ state, temp }: { state: string; temp: number }) {
  const colors: Record<string, string> = {
    nominal: "text-emerald-400 bg-emerald-400/10",
    warm: "text-amber-400 bg-amber-400/10",
    hot: "text-orange-400 bg-orange-400/10",
    throttling: "text-red-400 bg-red-400/10",
    critical: "text-red-500 bg-red-500/20",
  };
  const c = colors[state] || colors.nominal;
  return (
    <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-medium", c)}>
      <Thermometer className="w-2.5 h-2.5" />
      {temp}°C · {state}
    </div>
  );
}

export function SystemBatteryPanel({ onClose }: { onClose: () => void }) {
  const daemon = getPowerDaemon();
  const [state, setState] = useState<PowerState>(daemon.getState());
  const [showDrain, setShowDrain] = useState(false);
  const [showHealth, setShowHealth] = useState(false);

  useEffect(() => daemon.subscribe(setState), []);

  const { level, charging, health, thermal, charger, optimizedCharging, appDrain, activeProfile } = state;

  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference - (level / 100) * circumference;
  const levelColor = level > 50 ? "hsl(152, 55%, 48%)" : level > 20 ? "hsl(38, 85%, 58%)" : "hsl(0, 70%, 55%)";

  const healthPercent = health.capacityPercent;
  const healthCirc = 2 * Math.PI * 20;
  const healthDash = healthCirc - (healthPercent / 100) * healthCirc;

  return (
    <div
      className="absolute bottom-full mb-2 right-0 w-[320px] rounded-2xl border border-white/[0.08] bg-black/70 backdrop-blur-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50"
      onPointerDown={e => e.stopPropagation()}
    >
      {/* Main battery gauge + info */}
      <div className="p-4 flex items-center gap-4 border-b border-white/[0.06]">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="36" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="4" />
            <circle cx="40" cy="40" r="36" fill="none" stroke={levelColor} strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} className="transition-all duration-700" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {charging ? <BatteryCharging className="w-4 h-4 text-[hsl(152,55%,48%)]" /> : <Battery className="w-4 h-4 text-white/40" />}
            <span className="text-sm font-bold text-white mt-0.5">{level}%</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-white">{charging ? "Charging" : "On Battery"}</div>
          <div className="text-[10px] text-white/40 mt-0.5">
            {charging ? (state.timeToFullMin ? `~${state.timeToFullMin} min to full` : "Calculating…") : (state.timeRemainingMin ? `~${Math.floor(state.timeRemainingMin / 60)}h ${state.timeRemainingMin % 60}m` : "Calculating…")}
          </div>

          {/* Charger info */}
          {charging && (
            <div className="mt-1 flex items-center gap-1.5">
              <PlugZap className="w-2.5 h-2.5 text-emerald-400/60" />
              <span className="text-[9px] text-white/30">{charger.label}</span>
              {charger.isSlowCharger && <span className="text-[8px] text-amber-400/70">Slow</span>}
            </div>
          )}

          {/* Thermal + optimized charging */}
          <div className="mt-1.5 flex items-center gap-2">
            <ThermalIndicator state={thermal} temp={health.temperatureC} />
            {optimizedCharging.enabled && optimizedCharging.holdAt80 && (
              <span className="text-[8px] text-blue-400/60 flex items-center gap-0.5">
                <Shield className="w-2 h-2" /> Hold at 80%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Battery health expandable */}
      <button
        onClick={() => setShowHealth(!showHealth)}
        className="w-full px-3 py-2 flex items-center justify-between border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Heart className="w-3 h-3 text-pink-400/60" />
          <span className="text-[10px] text-white/50">Battery Health</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-medium", health.healthRating === "good" || health.healthRating === "excellent" ? "text-emerald-400" : health.healthRating === "fair" ? "text-amber-400" : "text-red-400")}>
            {health.healthRating.charAt(0).toUpperCase() + health.healthRating.slice(1)} · {healthPercent}%
          </span>
          {showHealth ? <ChevronUp className="w-3 h-3 text-white/20" /> : <ChevronDown className="w-3 h-3 text-white/20" />}
        </div>
      </button>

      {showHealth && (
        <div className="px-3 py-2 border-b border-white/[0.04] bg-white/[0.02] space-y-1.5">
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-white/30">Design / Current Capacity</span>
            <span className="text-white/50">{health.fullChargeCapacityMah} / {health.designCapacityMah} mAh</span>
          </div>
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-white/30">Charge Cycles</span>
            <span className="text-white/50">{health.cycleCount}</span>
          </div>
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-white/30">Aging Trend</span>
            <span className={cn("text-white/50", health.agingTrend === "rapid_degradation" && "text-red-400")}>{health.agingTrend.replace("_", " ")}</span>
          </div>
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-white/30">Temp Stress Events</span>
            <span className="text-white/50">{health.temperatureStressEvents}</span>
          </div>

          {/* Optimized charging toggle */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] text-white/40">Optimized Charging</span>
            <button
              onClick={() => daemon.setOptimizedCharging(!optimizedCharging.enabled)}
              className={cn("w-7 h-4 rounded-full transition-colors relative", optimizedCharging.enabled ? "bg-blue-500" : "bg-white/10")}
            >
              <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform", optimizedCharging.enabled ? "left-3.5" : "left-0.5")} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-white/40">Hold at 80%</span>
            <button
              onClick={() => daemon.setHoldAt80(!optimizedCharging.holdAt80)}
              className={cn("w-7 h-4 rounded-full transition-colors relative", optimizedCharging.holdAt80 ? "bg-blue-500" : "bg-white/10")}
            >
              <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform", optimizedCharging.holdAt80 ? "left-3.5" : "left-0.5")} />
            </button>
          </div>
        </div>
      )}

      {/* Top battery consumers expandable */}
      <button
        onClick={() => setShowDrain(!showDrain)}
        className="w-full px-3 py-2 flex items-center justify-between border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrendingDown className="w-3 h-3 text-amber-400/60" />
          <span className="text-[10px] text-white/50">Top Battery Consumers</span>
        </div>
        {showDrain ? <ChevronUp className="w-3 h-3 text-white/20" /> : <ChevronDown className="w-3 h-3 text-white/20" />}
      </button>

      {showDrain && (
        <div className="px-3 py-2 border-b border-white/[0.04] bg-white/[0.02] space-y-1.5 max-h-[140px] overflow-y-auto">
          {appDrain.sort((a, b) => b.totalDrainPercent - a.totalDrainPercent).map(app => (
            <div key={app.appName} className="flex items-center gap-2">
              <span className="text-sm w-5 text-center">{app.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/60 truncate">{app.appName}</span>
                  <span className="text-[10px] text-white/40 font-mono">{app.totalDrainPercent}%</span>
                </div>
                <div className="w-full h-1 rounded-full bg-white/5 mt-0.5">
                  <div className="h-full rounded-full bg-amber-400/40 transition-all" style={{ width: `${app.totalDrainPercent}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Power profiles */}
      <div className="p-2">
        <div className="text-[9px] font-medium uppercase tracking-[0.15em] text-white/20 px-2 py-1">Power Profile</div>
        {(Object.keys(PROFILE_CONFIG) as PowerProfile[]).map(pid => {
          const pc = PROFILE_CONFIG[pid];
          const Icon = pc.icon;
          const isActive = activeProfile === pid;
          return (
            <button
              key={pid}
              onClick={() => daemon.setProfile(pid)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all",
                isActive ? "bg-blue-500/15" : "hover:bg-white/[0.05]"
              )}
            >
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", isActive ? "bg-blue-500/20" : "bg-white/[0.05]")}>
                <Icon className={cn("w-3.5 h-3.5", isActive ? pc.color : "text-white/30")} />
              </div>
              <div className="flex-1">
                <div className={cn("text-[11px]", isActive ? "text-white font-medium" : "text-white/60")}>{pc.label}</div>
                <div className="text-[9px] text-white/25">{pc.desc}</div>
              </div>
              {isActive && (
                <div className="flex items-center gap-1">
                  <span className="text-[8px] text-white/20">CPU {state.profileTuning[pid].cpuLimit}%</span>
                  <span className="text-[8px] text-white/20">·</span>
                  <span className="text-[8px] text-white/20">{state.profileTuning[pid].displayRefreshHz}Hz</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Suspend/resume footer */}
      <div className="px-3 py-1.5 border-t border-white/[0.04] flex items-center justify-between text-[8px] text-white/20">
        <span className="flex items-center gap-1"><Activity className="w-2.5 h-2.5" /> Sleep drain: {state.suspendResume.avgDrainPerHourSleep}%/h</span>
        <span>Last wake: {state.suspendResume.lastWakeReason.replace("_", " ")}</span>
      </div>
    </div>
  );
}
