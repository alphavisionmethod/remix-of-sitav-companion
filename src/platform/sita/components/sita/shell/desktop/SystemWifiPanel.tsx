// ═══════════════════════════════════════════════════════════════
// SITA OS — Advanced WiFi Panel
// Captive portal, wrong password recovery, weak signal, hidden
// SSID, enterprise auth, per-network settings, hotspot, airplane
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from "react";
import {
  Wifi, WifiOff, Check, Lock, Signal, ShieldAlert, Loader2, AlertTriangle,
  Globe, Settings2, Eye, EyeOff, Radio, Plane, Share2, ChevronRight,
  Router, X, RefreshCw, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getWifiDaemon, type WifiNetwork, type WifiState } from "@/lib/os-services/wifid";

function SignalBars({ percent, className }: { percent: number; className?: string }) {
  const bars = [percent >= 20, percent >= 40, percent >= 60, percent >= 80];
  return (
    <div className={cn("flex items-end gap-[2px] h-3", className)}>
      {bars.map((active, i) => (
        <div
          key={i}
          className={cn(
            "w-[3px] rounded-[1px] transition-colors",
            active ? "bg-blue-400" : "bg-white/10"
          )}
          style={{ height: `${40 + i * 20}%` }}
        />
      ))}
    </div>
  );
}

function SecurityBadge({ security }: { security: string }) {
  if (security === "open") return <span className="text-[8px] text-amber-400/70">OPEN</span>;
  if (security.includes("enterprise")) return <span className="text-[8px] text-purple-400/70">ENT</span>;
  if (security.includes("wpa3")) return <span className="text-[8px] text-emerald-400/70">WPA3</span>;
  return <Lock className="w-2.5 h-2.5 text-white/20" />;
}

function ConnectivityBadge({ state }: { state: string }) {
  const map: Record<string, { label: string; color: string }> = {
    online: { label: "Online", color: "text-emerald-400 bg-emerald-400/10" },
    limited: { label: "Limited", color: "text-amber-400 bg-amber-400/10" },
    captive_portal: { label: "Sign In Required", color: "text-blue-400 bg-blue-400/10" },
    offline: { label: "Offline", color: "text-white/30 bg-white/5" },
  };
  const s = map[state] || map.offline;
  return <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-medium", s.color)}>{s.label}</span>;
}

export function SystemWifiPanel({ onClose }: { onClose: () => void }) {
  const daemon = getWifiDaemon();
  const [state, setState] = useState<WifiState>(daemon.getState());
  const [passwordPrompt, setPasswordPrompt] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [settingsFor, setSettingsFor] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [hiddenSsid, setHiddenSsid] = useState("");
  const { toast } = useToast();

  useEffect(() => daemon.subscribe(setState), []);

  const handleConnect = useCallback(async (net: WifiNetwork) => {
    if (net.connected) return;
    if (net.security !== "open" && !net.saved) {
      setPasswordPrompt(net.ssid);
      return;
    }
    setConnecting(net.ssid);
    const result = await daemon.connect(net.ssid);
    setConnecting(null);
    if (result.success) {
      toast({ title: "Connected", description: `Connected to ${net.ssid}` });
    } else {
      toast({ title: "Connection Failed", description: result.error === "wrong_password" ? "Password may be incorrect" : "Could not connect", variant: "destructive" });
    }
  }, [daemon, toast]);

  const handlePasswordSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordPrompt || !password.trim()) return;
    setConnecting(passwordPrompt);
    setPasswordPrompt(null);
    const result = await daemon.connect(passwordPrompt, password);
    setConnecting(null);
    setPassword("");
    if (!result.success) {
      toast({ title: "Authentication Failed", description: "Password may be incorrect. Try again or forget this network.", variant: "destructive" });
    }
  }, [passwordPrompt, password, daemon, toast]);

  const handleHiddenConnect = useCallback(async () => {
    if (!hiddenSsid.trim()) return;
    setConnecting(hiddenSsid);
    await daemon.connectHidden(hiddenSsid, "wpa2_personal", password || undefined);
    setConnecting(null);
    setShowHidden(false);
    setHiddenSsid("");
    setPassword("");
  }, [hiddenSsid, password, daemon]);

  const current = state.currentNetwork;
  const sorted = [...state.availableNetworks].sort((a, b) => {
    if (a.connected) return -1;
    if (b.connected) return 1;
    return b.rssiPercent - a.rssiPercent;
  });

  return (
    <div
      className="absolute bottom-full mb-2 right-0 w-[320px] rounded-2xl border border-white/[0.08] bg-black/70 backdrop-blur-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50"
      onPointerDown={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-white">Wi-Fi</span>
            {state.airplaneMode && (
              <span className="flex items-center gap-1 text-[9px] text-amber-400">
                <Plane className="w-2.5 h-2.5" /> Airplane
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => daemon.scan()}
              disabled={state.scanning}
              className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              {state.scanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              {state.scanning ? "Scanning…" : "Scan"}
            </button>
          </div>
        </div>

        {/* Current connection status */}
        {current && (
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SignalBars percent={current.rssiPercent} />
              <span className="text-[10px] text-white/70 font-medium">{current.ssid}</span>
            </div>
            <ConnectivityBadge state={state.connectivity} />
          </div>
        )}

        {/* Captive portal banner */}
        {state.captivePortal.detected && !state.captivePortal.userDismissed && (
          <div className="mt-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <div>
                <p className="text-[10px] text-blue-300 font-medium">Sign in required</p>
                <p className="text-[8px] text-white/30">This network requires authentication</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => { window.open(state.captivePortal.loginUrl, "_blank"); }}
                className="px-2 py-1 rounded bg-blue-500/80 text-[9px] text-white font-medium hover:bg-blue-500"
              >
                Open
              </button>
              <button onClick={() => daemon.dismissCaptivePortal()} className="px-1.5 py-1 text-[9px] text-white/30 hover:text-white/50">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Weak signal / roaming suggestion */}
        {state.roamingSuggestion && (
          <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
            <p className="text-[9px] text-amber-300/80">{state.roamingSuggestion}</p>
          </div>
        )}
      </div>

      {/* Auth failure banner */}
      {sorted.some(n => n.authFailure) && (
        <div className="px-3 py-2 bg-red-500/5 border-b border-white/[0.04]">
          {sorted.filter(n => n.authFailure).map(n => (
            <div key={n.ssid} className="flex items-center justify-between text-[9px]">
              <span className="text-red-400">⚠ {n.ssid}: Password may be incorrect</span>
              <div className="flex gap-1">
                <button onClick={() => setPasswordPrompt(n.ssid)} className="text-blue-400 hover:underline">Retry</button>
                <button onClick={() => daemon.forgetNetwork(n.ssid)} className="text-white/30 hover:text-white/50">Forget</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Password prompt */}
      {passwordPrompt && (
        <form onSubmit={handlePasswordSubmit} className="p-3 border-b border-white/[0.06] bg-white/[0.03]">
          <p className="text-[10px] text-white/50 mb-2">
            Enter password for <span className="text-white/80 font-medium">{passwordPrompt}</span>
          </p>
          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-2.5 py-1.5 pr-7 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-blue-400/40"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40">
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
            <button type="submit" disabled={!password.trim()} className="px-2.5 py-1.5 rounded-lg bg-blue-500/80 text-white text-[10px] font-medium disabled:opacity-30 hover:bg-blue-500 transition-colors">Join</button>
            <button type="button" onClick={() => { setPasswordPrompt(null); setPassword(""); }} className="px-2 py-1.5 rounded-lg text-white/40 text-[10px] hover:text-white/60">✕</button>
          </div>
        </form>
      )}

      {/* Network list */}
      <div className="p-1.5 max-h-[220px] overflow-y-auto">
        {sorted.map(net => (
          <div key={net.bssid} className="group">
            <button
              onClick={() => handleConnect(net)}
              disabled={connecting === net.ssid}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all",
                net.connected ? "bg-blue-500/15" : "hover:bg-white/[0.05]",
                connecting === net.ssid && "opacity-60"
              )}
            >
              <div className="relative shrink-0">
                {connecting === net.ssid ? (
                  <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                ) : (
                  <SignalBars percent={net.rssiPercent} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn("text-[11px] truncate flex items-center gap-1.5", net.connected ? "text-white font-medium" : "text-white/60")}>
                  {net.ssid}
                  {net.hidden && <span className="text-[8px] text-white/20">(Hidden)</span>}
                  {net.perNetworkSettings.isMetered && <span className="text-[8px] text-amber-400/60">Metered</span>}
                </div>
                <div className="text-[9px] text-white/25 flex items-center gap-1.5">
                  <span>{net.band}</span>
                  <span>·</span>
                  <span>Ch {net.channel}</span>
                  {net.saved && <span className="text-blue-400/40">· Saved</span>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <SecurityBadge security={net.security} />
                {net.connected && <Check className="w-3 h-3 text-blue-400" />}
                <button
                  onClick={e => { e.stopPropagation(); setSettingsFor(settingsFor === net.ssid ? null : net.ssid); }}
                  className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-white/40 transition-all"
                >
                  <Settings2 className="w-3 h-3" />
                </button>
              </div>
            </button>

            {/* Per-network settings drawer */}
            {settingsFor === net.ssid && (
              <div className="mx-2 mb-1 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/40">IP Configuration</span>
                  <button
                    onClick={() => daemon.updateNetworkSettings(net.ssid, { useDhcp: !net.perNetworkSettings.useDhcp })}
                    className={cn("text-[9px] px-2 py-0.5 rounded", net.perNetworkSettings.useDhcp ? "bg-blue-500/20 text-blue-300" : "bg-white/5 text-white/40")}
                  >
                    {net.perNetworkSettings.useDhcp ? "DHCP" : "Static"}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/40">Metered Connection</span>
                  <button
                    onClick={() => daemon.updateNetworkSettings(net.ssid, { isMetered: !net.perNetworkSettings.isMetered })}
                    className={cn("w-7 h-4 rounded-full transition-colors relative", net.perNetworkSettings.isMetered ? "bg-blue-500" : "bg-white/10")}
                  >
                    <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform", net.perNetworkSettings.isMetered ? "left-3.5" : "left-0.5")} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/40">Auto Connect</span>
                  <button
                    onClick={() => daemon.updateNetworkSettings(net.ssid, { autoConnect: !net.perNetworkSettings.autoConnect })}
                    className={cn("w-7 h-4 rounded-full transition-colors relative", net.perNetworkSettings.autoConnect ? "bg-blue-500" : "bg-white/10")}
                  >
                    <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform", net.perNetworkSettings.autoConnect ? "left-3.5" : "left-0.5")} />
                  </button>
                </div>
                {net.saved && (
                  <button
                    onClick={() => { daemon.forgetNetwork(net.ssid); setSettingsFor(null); }}
                    className="flex items-center gap-1 text-[9px] text-red-400/70 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" /> Forget Network
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="p-2 border-t border-white/[0.06] space-y-1">
        {/* Hidden network */}
        {showHidden ? (
          <div className="flex gap-1.5">
            <input
              value={hiddenSsid}
              onChange={e => setHiddenSsid(e.target.value)}
              placeholder="Network name (SSID)"
              autoFocus
              className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-lg px-2 py-1 text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:border-blue-400/40"
            />
            <button onClick={handleHiddenConnect} disabled={!hiddenSsid.trim()} className="px-2 py-1 rounded-lg bg-blue-500/80 text-[9px] text-white font-medium disabled:opacity-30">Join</button>
            <button onClick={() => setShowHidden(false)} className="text-white/30 text-[9px]">✕</button>
          </div>
        ) : (
          <button onClick={() => setShowHidden(true)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] text-white/40 hover:text-white/60 hover:bg-white/[0.03]">
            <Radio className="w-3 h-3" /> Join Hidden Network…
          </button>
        )}

        {/* Hotspot toggle */}
        <button
          onClick={() => daemon.toggleHotspot(!state.hotspot.enabled)}
          className={cn(
            "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] transition-all",
            state.hotspot.enabled ? "bg-emerald-500/10 text-emerald-400" : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
          )}
        >
          <span className="flex items-center gap-2"><Share2 className="w-3 h-3" /> Personal Hotspot</span>
          {state.hotspot.enabled && <span className="text-[8px]">{state.hotspot.connectedClients.length} clients</span>}
        </button>

        {/* DNS Policy */}
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-[9px] text-white/25 flex items-center gap-1"><Router className="w-2.5 h-2.5" /> DNS: {state.systemDnsPolicy}</span>
          {state.dnsLeakPrevention && <span className="text-[8px] text-emerald-400/50">Leak protection ON</span>}
        </div>
      </div>
    </div>
  );
}
