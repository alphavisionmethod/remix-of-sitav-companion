import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Cable, Lock, Signal, ChevronDown, ChevronRight, Eye, EyeOff, Globe, Cloud, RefreshCw, Check, AlertTriangle, X, Plus, Smartphone, Router } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

type ConnectionType = "wifi" | "ethernet" | "cellular" | "unknown";
type ConnectionState =
  | "scanning" | "connecting" | "connected" | "failed_password"
  | "weak_signal" | "no_networks_found" | "captive_portal_required"
  | "ethernet_connected" | "offline_mode_selected";

interface Network {
  ssid: string;
  signal: number;
  secured: boolean;
  channel: number;
  band: "2.4GHz" | "5GHz" | "6GHz";
  enterprise?: boolean;
}

const NETWORKS: Network[] = [
  { ssid: "Home-Network-5G", signal: 92, secured: true, channel: 36, band: "5GHz" },
  { ssid: "OfficeWiFi", signal: 78, secured: true, channel: 6, band: "2.4GHz" },
  { ssid: "CoffeeShop_Free", signal: 65, secured: false, channel: 11, band: "2.4GHz" },
  { ssid: "CORP-Enterprise", signal: 85, secured: true, channel: 44, band: "5GHz", enterprise: true },
  { ssid: "Neighbor-Net", signal: 35, secured: true, channel: 1, band: "2.4GHz" },
  { ssid: "FastFiber-6E", signal: 88, secured: true, channel: 1, band: "6GHz" },
];

const ONLINE_CAPABILITIES = [
  { icon: RefreshCw, label: "Restore your environment", delay: 0.1 },
  { icon: Cloud, label: "Sync your workspace", delay: 0.2 },
  { icon: Globe, label: "Check essential updates", delay: 0.3 },
  { icon: Signal, label: "Prepare live suggestions and services", delay: 0.4 },
];

function SignalBars({ strength }: { strength: number }) {
  const bars = strength > 75 ? 4 : strength > 50 ? 3 : strength > 25 ? 2 : 1;
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3, 4].map(b => (
        <div key={b} className={cn("w-1 rounded-sm transition-colors", b <= bars ? "bg-primary" : "bg-muted",
          b === 1 ? "h-1" : b === 2 ? "h-2" : b === 3 ? "h-3" : "h-4")} />
      ))}
    </div>
  );
}

function detectConnectionType(): ConnectionType {
  const conn = navigator.connection;
  if (conn) {
    const t = conn.effectiveType;
    if (t === "4g") return "wifi";
    if (t === "3g" || t === "2g" || t === "slow-2g") return "cellular";
  }
  if (navigator.onLine) return "wifi";
  return "unknown";
}

interface Props {
  onNext: () => void;
  onPrev: () => void;
  onStateChange: (state: { connectionState: ConnectionState; selectedNetwork: string }) => void;
}

export function NetworkSetupStep({ onNext, onPrev, onStateChange }: Props) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("scanning");
  const [detectedType, setDetectedType] = useState<ConnectionType>("unknown");
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualSSID, setManualSSID] = useState("");
  const [manualSecurity, setManualSecurity] = useState<"wpa2" | "wpa3" | "open">("wpa2");
  const [showProxy, setShowProxy] = useState(false);
  const [proxyType, setProxyType] = useState<"none" | "http" | "socks5" | "auto">("none");
  const [proxyHost, setProxyHost] = useState("");
  const [proxyPort, setProxyPort] = useState("");
  const [proxyUser, setProxyUser] = useState("");
  const [proxyPass, setProxyPass] = useState("");
  const [pacUrl, setPacUrl] = useState("");
  const [connectProgress, setConnectProgress] = useState(0);
  const [isRescanning, setIsRescanning] = useState(false);

  // Auto-detect connection type
  useEffect(() => {
    const type = detectConnectionType();
    setDetectedType(type);
    if (type === "ethernet") {
      setConnectionState("ethernet_connected");
    }
    const conn = navigator.connection;
    if (conn) {
      const handler = () => setDetectedType(detectConnectionType());
      conn.addEventListener?.("change", handler);
      return () => conn.removeEventListener?.("change", handler);
    }
  }, []);

  // Simulate network scanning
  useEffect(() => {
    if (detectedType === ("ethernet" as ConnectionType)) return;
    const timer = setTimeout(() => {
      setNetworks(NETWORKS);
      if (navigator.onLine && detectedType !== ("ethernet" as ConnectionType)) {
        // Browser is online — auto-detect WiFi connection
        setConnectionState("connected");
        setSelectedNetwork("Detected Network");
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [detectedType]);

  useEffect(() => {
    onStateChange({ connectionState, selectedNetwork });
  }, [connectionState, selectedNetwork]);

  const rescan = useCallback(() => {
    setIsRescanning(true);
    setNetworks([]);
    setConnectionState("scanning");
    setTimeout(() => {
      setNetworks([...NETWORKS, { ssid: "NewNetwork-" + Math.floor(Math.random() * 100), signal: 70, secured: true, channel: 6, band: "2.4GHz" }]);
      setIsRescanning(false);
    }, 2500);
  }, []);

  const connectToNetwork = useCallback((network: Network) => {
    setSelectedNetwork(network.ssid);
    if (!network.secured) {
      setConnectionState("connecting");
      setConnectProgress(0);
      const steps = [20, 45, 70, 90, 100];
      steps.forEach((p, i) => setTimeout(() => {
        setConnectProgress(p);
        if (p === 100) {
          if (network.ssid.includes("Free")) {
            setConnectionState("captive_portal_required");
          } else {
            setConnectionState("connected");
          }
        }
      }, (i + 1) * 400));
    }
  }, []);

  const connectManual = useCallback(() => {
    if (!manualSSID) return;
    const net: Network = { ssid: manualSSID, signal: 70, secured: manualSecurity !== "open", channel: 1, band: "2.4GHz" };
    setNetworks(prev => [net, ...prev]);
    setSelectedNetwork(manualSSID);
    if (manualSecurity === "open") {
      setConnectionState("connecting");
      setConnectProgress(0);
      [20, 50, 80, 100].forEach((p, i) => setTimeout(() => {
        setConnectProgress(p);
        if (p === 100) setConnectionState("connected");
      }, (i + 1) * 400));
    }
    setShowAddManual(false);
    setManualSSID("");
  }, [manualSSID, manualSecurity]);

  const submitPassword = useCallback(() => {
    if (!password) return;
    setConnectionState("connecting");
    setConnectProgress(0);
    const steps = [15, 35, 55, 75, 95, 100];
    steps.forEach((p, i) => setTimeout(() => {
      setConnectProgress(p);
      if (p === 100) {
        if (password.length < 4) {
          setConnectionState("failed_password");
        } else {
          const net = networks.find(n => n.ssid === selectedNetwork);
          if (net && net.signal < 40) {
            setConnectionState("weak_signal");
          } else {
            setConnectionState("connected");
          }
        }
      }
    }, (i + 1) * 350));
  }, [password, selectedNetwork, networks]);

  const isOnline = connectionState === "connected" || connectionState === "ethernet_connected";

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto">
      <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
        <div className="p-8 pb-0">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mb-4">
            {isOnline ? <Wifi className="h-7 w-7 text-primary-foreground" /> : <WifiOff className="h-7 w-7 text-primary-foreground" />}
          </motion.div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Connect to your network</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Bring SITA online to sync, restore, protect, and assist in real time</p>

          {/* Auto-detected connection type badge */}
          <div className="mt-3 flex items-center gap-2">
            <div className={cn("rounded-full px-3 py-1 text-[10px] font-medium flex items-center gap-1.5 border",
              detectedType === "ethernet" ? "border-primary/30 bg-primary/10 text-primary" :
              detectedType === "wifi" ? "border-primary/30 bg-primary/10 text-primary" :
              detectedType === "cellular" ? "border-[hsl(var(--trust-warn))]/30 bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]" :
              "border-border bg-secondary/30 text-muted-foreground"
            )}>
              {detectedType === "ethernet" && <><Cable className="h-3 w-3" /> Ethernet detected</>}
              {detectedType === "wifi" && <><Wifi className="h-3 w-3" /> Wi-Fi detected</>}
              {detectedType === "cellular" && <><Smartphone className="h-3 w-3" /> Cellular detected</>}
              {detectedType === "unknown" && <><Router className="h-3 w-3" /> Scanning…</>}
            </div>
          </div>
        </div>

        <div className="p-8 pt-6">
          <div className="flex gap-6">
            {/* Left: Network list */}
            <div className="flex-1 space-y-4">
              {/* Ethernet banner */}
              {(detectedType === "ethernet" || connectionState === "ethernet_connected") && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
                  <Cable className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Ethernet connected</p>
                    <p className="text-xs text-muted-foreground">Wired connection detected — fastest & most stable</p>
                  </div>
                  <Check className="h-4 w-4 text-primary" />
                </motion.div>
              )}

              {/* Connection status banners */}
              <AnimatePresence mode="wait">
                {connectionState === "connecting" && (
                  <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="rounded-xl border border-border bg-secondary/30 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <RefreshCw className="h-4 w-4 text-primary" />
                      </motion.div>
                      <span className="text-sm text-foreground">Connecting to {selectedNetwork}…</span>
                    </div>
                    <Progress value={connectProgress} className="h-1" />
                  </motion.div>
                )}
                {connectionState === "failed_password" && (
                  <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-foreground">Incorrect password. Please try again.</span>
                    <button onClick={() => { setConnectionState("scanning"); setPassword(""); }}
                      className="ml-auto text-xs text-primary hover:underline">Retry</button>
                  </motion.div>
                )}
                {connectionState === "weak_signal" && (
                  <motion.div key="weak" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="rounded-xl border border-[hsl(var(--trust-warn))]/30 bg-[hsl(var(--trust-warn))]/5 p-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[hsl(var(--trust-warn))]" />
                    <span className="text-sm text-foreground">Connected with weak signal. Performance may be limited.</span>
                    <button onClick={onNext} className="ml-auto text-xs text-primary hover:underline">Continue anyway</button>
                  </motion.div>
                )}
                {connectionState === "captive_portal_required" && (
                  <motion.div key="captive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="rounded-xl border border-[hsl(var(--trust-warn))]/30 bg-[hsl(var(--trust-warn))]/5 p-3 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[hsl(var(--trust-warn))]" />
                    <span className="text-sm text-foreground">This network requires sign-in.</span>
                    <button className="ml-auto text-xs text-primary hover:underline"
                      onClick={() => { setConnectionState("connected"); }}>Open portal</button>
                  </motion.div>
                )}
                {connectionState === "connected" && (
                  <motion.div key="conn-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="rounded-xl border border-[hsl(var(--trust-safe))]/30 bg-[hsl(var(--trust-safe))]/5 p-3 flex items-center gap-2">
                    <Check className="h-4 w-4 text-[hsl(var(--trust-safe))]" />
                    <span className="text-sm font-medium text-foreground">Connected{selectedNetwork && selectedNetwork !== "Detected Network" ? ` to ${selectedNetwork}` : ""}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* WiFi Networks list */}
              {!isOnline && connectionState !== "connecting" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available Wi-Fi Networks</p>
                    <button onClick={rescan} disabled={isRescanning}
                      className="flex items-center gap-1 text-[10px] text-primary hover:underline">
                      <RefreshCw className={cn("h-3 w-3", isRescanning && "animate-spin")} />
                      {isRescanning ? "Scanning…" : "Rescan"}
                    </button>
                  </div>
                  {networks.length === 0 ? (
                    <div className="text-center py-8">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                        <RefreshCw className="h-6 w-6 text-muted-foreground mx-auto" />
                      </motion.div>
                      <p className="text-sm text-muted-foreground mt-3">Scanning for networks…</p>
                    </div>
                  ) : (
                    networks.map((net, i) => (
                      <motion.button key={net.ssid} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => {
                          setSelectedNetwork(net.ssid);
                          if (!net.secured) connectToNetwork(net);
                        }}
                        className={cn("w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                          selectedNetwork === net.ssid ? "border-primary/40 bg-primary/5" : "border-border bg-secondary/20 hover:border-primary/20"
                        )}>
                        <SignalBars strength={net.signal} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{net.ssid}</p>
                          <p className="text-[10px] text-muted-foreground">{net.band} · Ch {net.channel}{net.enterprise ? " · Enterprise" : ""}</p>
                        </div>
                        {net.secured && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                      </motion.button>
                    ))
                  )}
                </div>
              )}

              {/* Password entry for secured networks */}
              {selectedNetwork && !isOnline && connectionState !== "connecting" && networks.find(n => n.ssid === selectedNetwork)?.secured && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3 pt-2">
                  {/* Enterprise-specific fields */}
                  {networks.find(n => n.ssid === selectedNetwork)?.enterprise && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">EAP Type</label>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {["PEAP", "EAP-TLS", "EAP-TTLS", "EAP-FAST"].map(eap => (
                            <button key={eap}
                              className="rounded-full px-3 py-1.5 text-xs font-medium transition-all border bg-primary/15 border-primary/40 text-primary first:bg-primary/15">
                              {eap}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input placeholder="Identity / Username"
                        className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none" />
                      <div className="rounded-lg border border-dashed border-border bg-secondary/20 p-3 text-center">
                        <p className="text-[10px] text-muted-foreground">Certificate (optional) — drag or click to upload</p>
                      </div>
                    </div>
                  )}
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="Enter password"
                      onKeyDown={e => e.key === "Enter" && submitPassword()}
                      className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                    <button onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <button onClick={submitPassword} disabled={!password}
                    className={cn("w-full rounded-xl py-2.5 text-sm font-semibold transition-all",
                      password ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}>Connect</button>
                </motion.div>
              )}

              {/* Add Wi-Fi manually */}
              <button onClick={() => setShowAddManual(!showAddManual)}
                className="flex items-center gap-2 text-xs text-primary hover:underline transition-colors w-full">
                <Plus className="h-3 w-3" />
                Add Wi-Fi network manually
              </button>
              {showAddManual && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
                  <input value={manualSSID} onChange={e => setManualSSID(e.target.value)} placeholder="Network name (SSID)"
                    className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none" />
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Security</label>
                    <div className="mt-1 flex gap-2">
                      {(["wpa2", "wpa3", "open"] as const).map(s => (
                        <button key={s} onClick={() => setManualSecurity(s)}
                          className={cn("rounded-lg px-3 py-1.5 text-xs font-medium border transition-all",
                            manualSecurity === s ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground")}>
                          {s.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  {manualSecurity !== "open" && (
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
                      className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none" />
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => setShowAddManual(false)}
                      className="flex-1 rounded-lg border border-border py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                    <button onClick={connectManual} disabled={!manualSSID}
                      className={cn("flex-1 rounded-lg py-2 text-xs font-semibold transition-all",
                        manualSSID ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
                      Add & Connect
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Proxy settings */}
              <button onClick={() => setShowProxy(!showProxy)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
                {showProxy ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                Proxy settings
              </button>
              {showProxy && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Proxy type</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {(["none", "http", "socks5", "auto"] as const).map(t => (
                        <button key={t} onClick={() => setProxyType(t)}
                          className={cn("rounded-lg px-3 py-1.5 text-xs font-medium border transition-all",
                            proxyType === t ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground")}>
                          {t === "none" ? "None" : t === "http" ? "HTTP/HTTPS" : t === "socks5" ? "SOCKS5" : "Auto (PAC)"}
                        </button>
                      ))}
                    </div>
                  </div>
                  {proxyType === "auto" && (
                    <input value={pacUrl} onChange={e => setPacUrl(e.target.value)} placeholder="PAC URL (e.g. http://proxy.company.com/proxy.pac)"
                      className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none" />
                  )}
                  {(proxyType === "http" || proxyType === "socks5") && (
                    <>
                      <div className="flex gap-2">
                        <input value={proxyHost} onChange={e => setProxyHost(e.target.value)} placeholder="Proxy host"
                          className="flex-1 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none" />
                        <input value={proxyPort} onChange={e => setProxyPort(e.target.value)} placeholder="Port"
                          className="w-20 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none" />
                      </div>
                      <div className="flex gap-2">
                        <input value={proxyUser} onChange={e => setProxyUser(e.target.value)} placeholder="Username (optional)"
                          className="flex-1 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none" />
                        <input value={proxyPass} onChange={e => setProxyPass(e.target.value)} placeholder="Password" type="password"
                          className="flex-1 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none" />
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Offline option */}
              {!isOnline && connectionState !== "connecting" && (
                <button onClick={() => { setConnectionState("offline_mode_selected"); }}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
                  Continue with limited offline setup →
                </button>
              )}

              {connectionState === "offline_mode_selected" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-xl border border-border bg-secondary/20 p-3">
                  <p className="text-xs font-medium text-foreground mb-1">Limited mode enabled</p>
                  <p className="text-[10px] text-muted-foreground">Restore, sync, and live updates will be unavailable until you connect.</p>
                </motion.div>
              )}
            </div>

            {/* Right: Capabilities preview */}
            <div className="w-48 shrink-0 hidden md:block">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">When online, SITA can:</p>
              <div className="space-y-3">
                {ONLINE_CAPABILITIES.map((cap) => (
                  <motion.div key={cap.label} initial={{ opacity: 0.3, x: 10 }}
                    animate={{ opacity: isOnline ? 1 : 0.3, x: isOnline ? 0 : 10 }}
                    transition={{ delay: isOnline ? cap.delay : 0, duration: 0.4 }}
                    className="flex items-start gap-2">
                    <cap.icon className={cn("h-3.5 w-3.5 mt-0.5 transition-colors", isOnline ? "text-primary" : "text-muted-foreground/40")} />
                    <span className={cn("text-xs transition-colors", isOnline ? "text-foreground" : "text-muted-foreground/40")}>{cap.label}</span>
                  </motion.div>
                ))}
              </div>
              {isOnline && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                  className="mt-6 rounded-xl bg-primary/5 border border-primary/20 p-3 text-center">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-[10px] text-primary font-medium">Connected & Ready</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3 pt-6 mt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
              <button onClick={onNext}
                disabled={!isOnline && connectionState !== "offline_mode_selected" && connectionState !== "weak_signal"}
                className={cn("rounded-xl px-6 py-2.5 text-sm font-semibold transition-all flex items-center gap-2",
                  (isOnline || connectionState === "offline_mode_selected" || connectionState === "weak_signal")
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}>
                Continue <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
