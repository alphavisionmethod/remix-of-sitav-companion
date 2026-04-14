// ═══════════════════════════════════════════════════════════════
// SITA OS — Advanced Bluetooth Panel
// Battery display, audio routing, codec, stale cleanup, BLE privacy,
// reconnection policy, forgotten device removal
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import {
  Bluetooth, Check, Loader2, Smartphone, Headphones, Watch, Speaker,
  Keyboard, Mouse, Gamepad2, Battery, BatteryLow, Volume2, Mic,
  Trash2, MoreHorizontal, ShieldCheck, Sparkles, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getBluetoothDaemon, type BTState, type BTDevice, type BTReconnectPolicy } from "@/lib/os-services/btd";

const DEVICE_ICONS: Record<string, typeof Smartphone> = {
  phone: Smartphone, headphones: Headphones, earbuds: Headphones,
  watch: Watch, speaker: Speaker, keyboard: Keyboard,
  mouse: Mouse, gamepad: Gamepad2,
};

function BatteryGauge({ level, size = "sm" }: { level: number; size?: "sm" | "xs" }) {
  const color = level > 50 ? "bg-emerald-400" : level > 20 ? "bg-amber-400" : "bg-red-400";
  const w = size === "sm" ? "w-6" : "w-4";
  return (
    <div className="flex items-center gap-1">
      <div className={cn("h-2.5 rounded-sm border border-white/10 overflow-hidden relative", w)}>
        <div className={cn("h-full rounded-sm transition-all", color)} style={{ width: `${level}%` }} />
      </div>
      <span className={cn("font-mono", size === "sm" ? "text-[9px] text-white/40" : "text-[8px] text-white/30")}>{level}%</span>
    </div>
  );
}

function EarbudBattery({ left, right, caseLevel }: { left?: number; right?: number; caseLevel?: number }) {
  return (
    <div className="flex items-center gap-2">
      {left !== undefined && (
        <div className="flex items-center gap-0.5">
          <span className="text-[7px] text-white/20">L</span>
          <BatteryGauge level={left} size="xs" />
        </div>
      )}
      {right !== undefined && (
        <div className="flex items-center gap-0.5">
          <span className="text-[7px] text-white/20">R</span>
          <BatteryGauge level={right} size="xs" />
        </div>
      )}
      {caseLevel !== undefined && (
        <div className="flex items-center gap-0.5">
          <span className="text-[7px] text-white/20">⬡</span>
          <BatteryGauge level={caseLevel} size="xs" />
        </div>
      )}
    </div>
  );
}

export function SystemBluetoothPanel({ onClose }: { onClose: () => void }) {
  const daemon = getBluetoothDaemon();
  const [state, setState] = useState<BTState>(daemon.getState());
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => daemon.subscribe(setState), []);

  const handleToggleConnect = useCallback(async (id: string) => {
    const connected = await daemon.toggleConnect(id);
    const dev = state.devices.find(d => d.id === id);
    toast({ title: connected ? "Connected" : "Disconnected", description: dev?.name || id });
  }, [daemon, state.devices, toast]);

  const staleDevices = daemon.getStaleDevices();
  const lowBatteryDevices = daemon.getLowBatteryDevices();
  const connectedDevices = state.devices.filter(d => d.connected);
  const pairedDevices = state.devices.filter(d => d.paired && !d.connected);
  const staleDays = state.staleDaysThreshold;

  const outputDevice = state.devices.find(d => d.id === state.audioRoute.outputDevice);
  const inputDevice = state.devices.find(d => d.id === state.audioRoute.inputDevice);

  return (
    <div
      className="absolute bottom-full mb-2 right-0 w-[320px] rounded-2xl border border-white/[0.08] bg-black/70 backdrop-blur-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50"
      onPointerDown={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bluetooth className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-white">Bluetooth</span>
          </div>
          <button
            onClick={() => daemon.discover()}
            disabled={state.discovering}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            {state.discovering ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {state.discovering ? "Scanning…" : "Discover"}
          </button>
        </div>
        <div className="mt-1 flex items-center gap-2 text-[9px] text-white/30">
          <ShieldCheck className="w-2.5 h-2.5" /> Policy-enforced pairing
          {state.blePrivacyEnabled && <span className="text-indigo-400/50">· BLE Privacy</span>}
        </div>
      </div>

      {/* Low battery warning */}
      {lowBatteryDevices.length > 0 && (
        <div className="px-3 py-2 bg-amber-500/5 border-b border-white/[0.04]">
          {lowBatteryDevices.map(d => (
            <div key={d.id} className="flex items-center gap-2 text-[9px] text-amber-400">
              <BatteryLow className="w-3 h-3" />
              <span>{d.name} — Low battery</span>
            </div>
          ))}
        </div>
      )}

      {/* Audio route section */}
      {(outputDevice || inputDevice) && (
        <div className="px-3 py-2 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-white/20 mb-1.5">Audio Route</div>
          <div className="space-y-1">
            {outputDevice && (
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5 text-white/50"><Volume2 className="w-3 h-3 text-indigo-400" /> Output</span>
                <span className="text-white/70 flex items-center gap-1">
                  {outputDevice.name}
                  {outputDevice.codec && <span className="text-[8px] text-indigo-400/50 uppercase">{outputDevice.codec}</span>}
                </span>
              </div>
            )}
            {inputDevice && (
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5 text-white/50"><Mic className="w-3 h-3 text-indigo-400" /> Input</span>
                <span className="text-white/70">{inputDevice.name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Device list */}
      <div className="max-h-[240px] overflow-y-auto">
        {/* Connected */}
        {connectedDevices.length > 0 && (
          <div className="p-1.5">
            <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-white/20 px-2 py-1">Connected</div>
            {connectedDevices.map(dev => (
              <DeviceRow key={dev.id} dev={dev} menuFor={menuFor} setMenuFor={setMenuFor} onToggle={handleToggleConnect} daemon={daemon} isStale={false} />
            ))}
          </div>
        )}

        {/* Paired */}
        {pairedDevices.length > 0 && (
          <div className="p-1.5">
            <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-white/20 px-2 py-1">Paired</div>
            {pairedDevices.map(dev => {
              const isStale = dev.lastSeen < Date.now() - staleDays * 86400000;
              return <DeviceRow key={dev.id} dev={dev} menuFor={menuFor} setMenuFor={setMenuFor} onToggle={handleToggleConnect} daemon={daemon} isStale={isStale} />;
            })}
          </div>
        )}
      </div>

      {/* Bottom: stale cleanup */}
      {staleDevices.length > 0 && (
        <div className="p-2 border-t border-white/[0.06]">
          <button
            onClick={() => {
              const count = daemon.cleanupStaleDevices();
              toast({ title: "Cleanup Complete", description: `Removed ${count} old device${count !== 1 ? "s" : ""}` });
            }}
            className="w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.03] text-[10px] text-white/40 hover:text-white/60 hover:bg-white/[0.05] transition-all"
          >
            <Sparkles className="w-3 h-3" /> Clean up {staleDevices.length} old device{staleDevices.length !== 1 ? "s" : ""}
          </button>
        </div>
      )}
    </div>
  );
}

function DeviceRow({
  dev, menuFor, setMenuFor, onToggle, daemon, isStale,
}: {
  dev: BTDevice;
  menuFor: string | null;
  setMenuFor: (id: string | null) => void;
  onToggle: (id: string) => void;
  daemon: ReturnType<typeof getBluetoothDaemon>;
  isStale: boolean;
}) {
  const Icon = DEVICE_ICONS[dev.type] || Smartphone;
  const hasBattery = dev.battery.main !== undefined || dev.battery.left !== undefined;
  const isEarbuds = dev.type === "earbuds" && (dev.battery.left !== undefined || dev.battery.right !== undefined);

  const policyLabels: Record<BTReconnectPolicy, string> = { always: "Auto", on_demand: "Manual", never: "Never" };

  return (
    <div className={cn("group", isStale && "opacity-40")}>
      <button
        onClick={() => onToggle(dev.id)}
        className={cn(
          "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all",
          dev.connected ? "bg-indigo-500/15" : "hover:bg-white/[0.05]"
        )}
      >
        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", dev.connected ? "bg-indigo-500/20" : "bg-white/[0.05]")}>
          <Icon className={cn("w-3.5 h-3.5", dev.connected ? "text-indigo-400" : "text-white/30")} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn("text-[11px] truncate", dev.connected ? "text-white font-medium" : "text-white/60")}>{dev.name}</div>
          <div className="text-[9px] text-white/25 flex items-center gap-1.5">
            {dev.connected ? "Connected" : dev.paired ? "Paired" : "Available"}
            {dev.codec && dev.connected && <span className="text-indigo-400/40 uppercase">{dev.codec}</span>}
            {isStale && <span className="text-amber-400/50">· Not seen recently</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isEarbuds ? (
            <EarbudBattery left={dev.battery.left} right={dev.battery.right} caseLevel={dev.battery.case} />
          ) : hasBattery && dev.battery.main !== undefined ? (
            <BatteryGauge level={dev.battery.main} />
          ) : null}
          {dev.connected && <Check className="w-3 h-3 text-indigo-400" />}
          <button
            onClick={e => { e.stopPropagation(); setMenuFor(menuFor === dev.id ? null : dev.id); }}
            className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-white/40 transition-all"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </button>

      {/* Device menu */}
      {menuFor === dev.id && (
        <div className="mx-2 mb-1 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-white/40">Reconnect Policy</span>
            <div className="flex gap-1">
              {(["always", "on_demand", "never"] as BTReconnectPolicy[]).map(p => (
                <button
                  key={p}
                  onClick={() => daemon.setReconnectPolicy(dev.id, p)}
                  className={cn("text-[8px] px-1.5 py-0.5 rounded transition-colors", dev.reconnectPolicy === p ? "bg-indigo-500/20 text-indigo-300" : "text-white/30 hover:text-white/50")}
                >
                  {policyLabels[p]}
                </button>
              ))}
            </div>
          </div>
          {dev.codec && (
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-white/40">Codec Profile</span>
              <span className="text-[9px] text-white/60">{dev.codecProfile}</span>
            </div>
          )}
          <button
            onClick={() => { daemon.forgetDevice(dev.id); setMenuFor(null); }}
            className="flex items-center gap-1 text-[9px] text-red-400/70 hover:text-red-400"
          >
            <Trash2 className="w-3 h-3" /> Forget Device
          </button>
        </div>
      )}
    </div>
  );
}
