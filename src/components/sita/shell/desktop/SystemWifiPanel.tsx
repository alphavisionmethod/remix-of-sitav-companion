import { useState } from "react";
import { Wifi, WifiOff, Check, Lock, Signal } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_NETWORKS = [
  { ssid: "SITA-Secure-5G", signal: 95, secured: true, connected: true },
  { ssid: "SITA-Guest", signal: 80, secured: false, connected: false },
  { ssid: "Neighbor-WiFi", signal: 45, secured: true, connected: false },
  { ssid: "CoffeeShop-Free", signal: 30, secured: false, connected: false },
  { ssid: "Office-LAN", signal: 60, secured: true, connected: false },
];

export function SystemWifiPanel({ onClose }: { onClose: () => void }) {
  const [networks, setNetworks] = useState(MOCK_NETWORKS);
  const [scanning, setScanning] = useState(false);

  const handleConnect = (ssid: string) => {
    setNetworks(prev =>
      prev.map(n => ({ ...n, connected: n.ssid === ssid }))
    );
  };

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 2000);
  };

  const connected = networks.find(n => n.connected);

  return (
    <div
      className="absolute bottom-full mb-2 right-0 w-[280px] rounded-2xl border border-white/[0.08] bg-black/70 backdrop-blur-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50"
      onPointerDown={e => e.stopPropagation()}
    >
      <div className="p-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-white">Wi-Fi</span>
          </div>
          <button
            onClick={handleScan}
            className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
          >
            {scanning ? "Scanning…" : "Scan"}
          </button>
        </div>
        {connected && (
          <div className="mt-1.5 text-[10px] text-white/50">
            Connected to <span className="text-white/80 font-medium">{connected.ssid}</span>
          </div>
        )}
      </div>

      <div className="p-1.5 max-h-[200px] overflow-y-auto">
        {networks.map(net => (
          <button
            key={net.ssid}
            onClick={() => handleConnect(net.ssid)}
            className={cn(
              "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all",
              net.connected
                ? "bg-blue-500/15"
                : "hover:bg-white/[0.05]"
            )}
          >
            <div className="relative">
              <Signal className={cn("w-3.5 h-3.5", net.connected ? "text-blue-400" : "text-white/30")} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn("text-[11px] truncate", net.connected ? "text-white font-medium" : "text-white/60")}>
                {net.ssid}
              </div>
              <div className="text-[9px] text-white/25">
                {net.signal}% signal{net.secured ? " · Secured" : ""}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {net.secured && <Lock className="w-2.5 h-2.5 text-white/20" />}
              {net.connected && <Check className="w-3 h-3 text-blue-400" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
