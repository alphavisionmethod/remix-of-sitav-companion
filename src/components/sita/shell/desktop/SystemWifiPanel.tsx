// ═══════════════════════════════════════════════════════════════
// SITA OS — WiFi Panel (wired through controlcenterd)
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { Wifi, WifiOff, Check, Lock, Signal, ShieldAlert, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { isOSSecurityBooted } from "@/lib/os-security";
import { wifiConnectFlow } from "@/lib/os-security/flows";
import { getSessionDaemon } from "@/lib/os-security/sessiond";

interface Network {
  ssid: string;
  signal: number;
  secured: boolean;
  connected: boolean;
}

const MOCK_NETWORKS: Network[] = [
  { ssid: "SITA-Secure-5G", signal: 95, secured: true, connected: true },
  { ssid: "SITA-Guest", signal: 80, secured: false, connected: false },
  { ssid: "Neighbor-WiFi", signal: 45, secured: true, connected: false },
  { ssid: "CoffeeShop-Free", signal: 30, secured: false, connected: false },
  { ssid: "Office-LAN", signal: 60, secured: true, connected: false },
];

export function SystemWifiPanel({ onClose }: { onClose: () => void }) {
  const [networks, setNetworks] = useState<Network[]>(MOCK_NETWORKS);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [passwordPrompt, setPasswordPrompt] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const doConnect = useCallback(async (ssid: string, pwd?: string) => {
    setConnecting(ssid);
    setPasswordPrompt(null);
    setPassword("");

    try {
      if (isOSSecurityBooted()) {
        const sessiond = getSessionDaemon();
        const sessions = sessiond.getAllSessions();
        const session = sessions[0];
        if (session) {
          const result = await wifiConnectFlow(session.sessionId, session.userId, ssid, pwd);
          if (result.status === "denied") {
            toast({ title: "Access Denied", description: result.error || "WiFi connection denied by policy", variant: "destructive" });
            setConnecting(null);
            return;
          }
        }
      }

      // Simulate connection delay
      await new Promise(r => setTimeout(r, 800));
      setNetworks(prev => prev.map(n => ({ ...n, connected: n.ssid === ssid })));
      toast({ title: "Connected", description: `Connected to ${ssid}` });
    } catch {
      toast({ title: "Connection Failed", description: `Could not connect to ${ssid}`, variant: "destructive" });
    } finally {
      setConnecting(null);
    }
  }, [toast]);

  const handleConnect = useCallback((net: Network) => {
    if (net.connected) return;
    if (net.secured && !net.connected) {
      setPasswordPrompt(net.ssid);
      return;
    }
    doConnect(net.ssid);
  }, [doConnect]);

  const handlePasswordSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (passwordPrompt && password.trim()) {
      doConnect(passwordPrompt, password);
    }
  }, [passwordPrompt, password, doConnect]);

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
            className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            {scanning && <Loader2 className="w-3 h-3 animate-spin" />}
            {scanning ? "Scanning…" : "Scan"}
          </button>
        </div>
        {connected && (
          <div className="mt-1.5 text-[10px] text-white/50">
            Connected to <span className="text-white/80 font-medium">{connected.ssid}</span>
            {connected.secured && (
              <span className="ml-1.5 inline-flex items-center gap-0.5 text-emerald-400">
                <ShieldAlert className="w-2.5 h-2.5" /> Secured
              </span>
            )}
          </div>
        )}
      </div>

      {/* Password prompt overlay */}
      {passwordPrompt && (
        <form onSubmit={handlePasswordSubmit} className="p-3 border-b border-white/[0.06] bg-white/[0.03]">
          <p className="text-[10px] text-white/50 mb-2">
            Enter password for <span className="text-white/80 font-medium">{passwordPrompt}</span>
          </p>
          <div className="flex gap-1.5">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-blue-400/40"
            />
            <button
              type="submit"
              disabled={!password.trim()}
              className="px-2.5 py-1.5 rounded-lg bg-blue-500/80 text-white text-[10px] font-medium disabled:opacity-30 hover:bg-blue-500 transition-colors"
            >
              Join
            </button>
            <button
              type="button"
              onClick={() => { setPasswordPrompt(null); setPassword(""); }}
              className="px-2 py-1.5 rounded-lg text-white/40 text-[10px] hover:text-white/60 transition-colors"
            >
              ✕
            </button>
          </div>
        </form>
      )}

      <div className="p-1.5 max-h-[200px] overflow-y-auto">
        {networks.map(net => (
          <button
            key={net.ssid}
            onClick={() => handleConnect(net)}
            disabled={connecting === net.ssid}
            className={cn(
              "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all",
              net.connected ? "bg-blue-500/15" : "hover:bg-white/[0.05]",
              connecting === net.ssid && "opacity-60"
            )}
          >
            <div className="relative">
              {connecting === net.ssid ? (
                <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              ) : (
                <Signal className={cn("w-3.5 h-3.5", net.connected ? "text-blue-400" : "text-white/30")} />
              )}
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