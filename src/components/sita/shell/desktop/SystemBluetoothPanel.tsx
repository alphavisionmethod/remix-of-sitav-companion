// ═══════════════════════════════════════════════════════════════
// SITA OS — Bluetooth Panel (wired through controlcenterd)
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { Bluetooth, Check, Loader2, Smartphone, Headphones, Watch, Speaker, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { isOSSecurityBooted } from "@/lib/os-security";
import { getControlCenterDaemon } from "@/lib/os-security/controlcenterd";
import { getSessionDaemon } from "@/lib/os-security/sessiond";

const DEVICE_ICONS: Record<string, typeof Smartphone> = {
  phone: Smartphone,
  headphones: Headphones,
  watch: Watch,
  speaker: Speaker,
};

interface BTDevice {
  name: string;
  type: string;
  paired: boolean;
  connected: boolean;
}

const MOCK_DEVICES: BTDevice[] = [
  { name: "AirPods Pro", type: "headphones", paired: true, connected: true },
  { name: "Apple Watch", type: "watch", paired: true, connected: false },
  { name: "iPhone 16", type: "phone", paired: true, connected: true },
  { name: "HomePod Mini", type: "speaker", paired: false, connected: false },
];

export function SystemBluetoothPanel({ onClose }: { onClose: () => void }) {
  const [devices, setDevices] = useState<BTDevice[]>(MOCK_DEVICES);
  const [scanning, setScanning] = useState(false);
  const [pairing, setPairing] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleConnect = useCallback(async (name: string) => {
    const device = devices.find(d => d.name === name);
    if (!device) return;

    // Policy check for pairing new devices
    if (!device.paired && isOSSecurityBooted()) {
      setPairing(name);
      try {
        const sessiond = getSessionDaemon();
        const ccd = getControlCenterDaemon();
        const session = sessiond.getAllSessions()[0];
        if (session) {
          const result = await ccd.executeCommand({
            commandId: crypto.randomUUID(),
            callerUserId: session.userId,
            callerSessionId: session.sessionId,
            callerService: "bluetooth-panel",
            action: "bluetooth.pair",
            payload: { deviceName: name, deviceType: device.type },
            timestamp: Date.now(),
          });

          if (result.status === "denied") {
            toast({ title: "Pairing Denied", description: result.error || "Bluetooth pairing denied by policy", variant: "destructive" });
            setPairing(null);
            return;
          }
        }
      } catch {
        // fallback: allow
      }
    }

    // Simulate pair/connect
    await new Promise(r => setTimeout(r, 600));
    setDevices(prev =>
      prev.map(d => d.name === name ? { ...d, connected: !d.connected, paired: true } : d)
    );
    setPairing(null);

    const newState = !device.connected;
    toast({
      title: newState ? "Connected" : "Disconnected",
      description: `${name} ${newState ? "connected" : "disconnected"}`,
    });
  }, [devices, toast]);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 2500);
  };

  return (
    <div
      className="absolute bottom-full mb-2 right-0 w-[280px] rounded-2xl border border-white/[0.08] bg-black/70 backdrop-blur-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50"
      onPointerDown={e => e.stopPropagation()}
    >
      <div className="p-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bluetooth className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-white">Bluetooth</span>
          </div>
          <button
            onClick={handleScan}
            className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            {scanning && <Loader2 className="w-3 h-3 animate-spin" />}
            {scanning ? "Scanning…" : "Discover"}
          </button>
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-white/40">
          <ShieldCheck className="w-2.5 h-2.5" />
          Policy-enforced pairing
        </div>
      </div>

      <div className="p-1.5 max-h-[220px] overflow-y-auto">
        {devices.map(dev => {
          const Icon = DEVICE_ICONS[dev.type] || Smartphone;
          const isPairing = pairing === dev.name;
          return (
            <button
              key={dev.name}
              onClick={() => toggleConnect(dev.name)}
              disabled={isPairing}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all",
                dev.connected ? "bg-blue-500/15" : "hover:bg-white/[0.05]",
                isPairing && "opacity-60"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center",
                dev.connected ? "bg-blue-500/20" : "bg-white/[0.05]"
              )}>
                {isPairing ? (
                  <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                ) : (
                  <Icon className={cn("w-3.5 h-3.5", dev.connected ? "text-blue-400" : "text-white/30")} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn("text-[11px] truncate", dev.connected ? "text-white font-medium" : "text-white/60")}>
                  {dev.name}
                </div>
                <div className="text-[9px] text-white/25">
                  {isPairing ? "Pairing…" : dev.connected ? "Connected" : dev.paired ? "Paired" : "Available"}
                </div>
              </div>
              {dev.connected && <Check className="w-3 h-3 text-blue-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}