// ═══════════════════════════════════════════════════════════════
// SITA OS — Security Center Window
// 4-tab security dashboard: Sandbox, Code Signing, Permissions, FS
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Lock, Eye, HardDrive, CheckCircle, XCircle, AlertTriangle, Activity, Bug, Globe, MapPin, Loader2, User, Bell, Cpu } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AppLoader } from "@/platform/nova-sdk/runtime/loader";
import { PermissionMonitor } from "@/platform/nova-sdk/services/permission-monitor";
import { FileSystemService } from "@/platform/nova-sdk/services/filesystem-service";
import { SecurityAccountsPanel } from "./SecurityAccountsPanel";
import { DeviceIdentityPanel } from "./DeviceIdentityPanel";
import { SecurityNotificationsPanel } from "./SecurityNotificationsPanel";

// ── Tab 1: Sandbox Monitor ──

function SandboxTab() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 2000); return () => clearInterval(t); }, []);

  const manager = AppLoader.getIsolationManager();
  const sandboxes = manager.listSandboxes();
  const stats = manager.getStats();

  const levelColors: Record<string, string> = {
    none: "bg-muted text-muted-foreground",
    basic: "bg-[hsl(210_60%_50%/0.15)] text-[hsl(210_70%_55%)]",
    standard: "bg-[hsl(152_55%_48%/0.15)] text-[hsl(152_55%_40%)]",
    strict: "bg-[hsl(38_85%_58%/0.15)] text-[hsl(38_85%_45%)]",
    maximum: "bg-[hsl(0_70%_55%/0.15)] text-[hsl(0_70%_45%)]",
  };

  const stateIcons: Record<string, JSX.Element> = {
    running: <Activity className="w-3 h-3 text-[hsl(152_55%_48%)]" />,
    crashed: <XCircle className="w-3 h-3 text-destructive" />,
    suspended: <AlertTriangle className="w-3 h-3 text-[hsl(38_85%_58%)]" />,
    terminated: <XCircle className="w-3 h-3 text-muted-foreground" />,
    creating: <Activity className="w-3 h-3 text-primary animate-pulse" />,
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex gap-3 text-xs">
        <div className="px-3 py-1.5 rounded-lg bg-muted/50">
          <span className="text-muted-foreground">Active:</span>{" "}
          <span className="font-semibold text-foreground">{stats.totalSandboxes}</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-muted/50">
          <span className="text-muted-foreground">Crashes:</span>{" "}
          <span className="font-semibold text-destructive">{stats.totalCrashes}</span>
        </div>
        {Object.entries(stats.byLevel).map(([level, count]) => (
          <div key={level} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium", levelColors[level])}>
            {level}: {count}
          </div>
        ))}
      </div>

      {/* Sandbox cards */}
      {sandboxes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">No active sandboxes — launch an app to see isolation data</div>
      ) : (
        <div className="grid gap-3">
          {sandboxes.map(sb => {
            const nsFlags = Object.entries(sb.namespaces).filter(([, v]) => v).map(([k]) => k);
            return (
              <div key={sb.id} className="rounded-xl border bg-card p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {stateIcons[sb.state]}
                    <span className="font-medium text-sm text-foreground">{sb.appName}</span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", levelColors[sb.isolationLevel])}>
                      {sb.isolationLevel}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">PID {sb.pid}</span>
                </div>

                {/* Namespace flags */}
                <div className="flex gap-1 flex-wrap">
                  {["pid", "net", "mnt", "user", "ipc", "uts", "cgroup"].map(ns => (
                    <span key={ns} className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-mono",
                      nsFlags.includes(ns)
                        ? "bg-[hsl(152_55%_48%/0.12)] text-[hsl(152_55%_40%)]"
                        : "bg-muted/30 text-muted-foreground/40"
                    )}>
                      {ns}
                    </span>
                  ))}
                </div>

                {/* Resource limits */}
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <span className="text-muted-foreground">CPU</span>
                    <div className="h-1 rounded-full bg-muted mt-0.5">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, sb.cgroup.cpuQuotaPercent === -1 ? 100 : Math.random() * 60)}%` }} />
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Memory</span>
                    <div className="h-1 rounded-full bg-muted mt-0.5">
                      <div className="h-full rounded-full bg-[hsl(38_85%_58%)]" style={{ width: `${Math.random() * 40 + 10}%` }} />
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">PIDs</span>
                    <div className="h-1 rounded-full bg-muted mt-0.5">
                      <div className="h-full rounded-full bg-[hsl(265_55%_58%)]" style={{ width: `${Math.random() * 30 + 5}%` }} />
                    </div>
                  </div>
                </div>

                {sb.crashCount > 0 && (
                  <div className="text-[10px] text-destructive">⚠ {sb.crashCount} crash(es)</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tab 2: Code Signing ──

function CodeSigningTab() {
  const verifier = AppLoader.getCodeVerifier();
  const bootChain = verifier.getBootChain() ?? verifier.constructBootChain(true, true);
  const keys = verifier.getTrustedKeys();
  const log = verifier.getVerificationLog();
  const mode = verifier.getMode();
  const stats = verifier.getStats();

  const resultColors: Record<string, string> = {
    valid: "text-[hsl(152_55%_48%)]",
    invalid: "text-destructive",
    expired: "text-[hsl(38_85%_58%)]",
    revoked: "text-destructive",
    unsigned: "text-muted-foreground",
    "unknown-signer": "text-[hsl(38_85%_58%)]",
  };

  return (
    <div className="space-y-4">
      {/* Mode & Trust */}
      <div className="flex gap-3 text-xs">
        <div className={cn("px-3 py-1.5 rounded-lg font-medium", mode === "enforced" ? "bg-[hsl(152_55%_48%/0.15)] text-[hsl(152_55%_40%)]" : mode === "permissive" ? "bg-[hsl(38_85%_58%/0.15)] text-[hsl(38_85%_45%)]" : "bg-muted text-muted-foreground")}>
          Mode: {mode}
        </div>
        <div className={cn("px-3 py-1.5 rounded-lg font-medium", bootChain.trustBaseline === "full" ? "bg-[hsl(152_55%_48%/0.15)] text-[hsl(152_55%_40%)]" : "bg-[hsl(38_85%_58%/0.15)] text-[hsl(38_85%_45%)]")}>
          Trust: {bootChain.trustBaseline}
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground">
          Keys: {stats.trustedKeys}
        </div>
      </div>

      {/* Boot Chain Timeline */}
      <div className="rounded-xl border bg-card p-3">
        <h4 className="text-xs font-semibold text-foreground mb-3">Boot Chain Attestation</h4>
        <div className="space-y-1">
          {bootChain.stages.map((stage, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", stage.signatureValid ? "bg-[hsl(152_55%_48%/0.15)]" : "bg-destructive/15")}>
                {stage.signatureValid ? <CheckCircle className="w-3 h-3 text-[hsl(152_55%_48%)]" /> : <XCircle className="w-3 h-3 text-destructive" />}
              </div>
              {i < bootChain.stages.length - 1 && (
                <div className="absolute ml-2 mt-4 w-px h-3 bg-border" />
              )}
              <span className="font-medium text-foreground flex-1">{stage.name}</span>
              <span className="text-muted-foreground font-mono text-[9px]">{stage.pcrExtended.join(",")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trusted Key Ring */}
      <div className="rounded-xl border bg-card p-3">
        <h4 className="text-xs font-semibold text-foreground mb-2">Trusted Key Ring ({keys.length})</h4>
        <div className="space-y-1">
          {keys.map(key => (
            <div key={key.id} className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium text-foreground">{key.name}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground font-mono">{key.algorithm}</span>
                <span className={cn(key.revoked ? "text-destructive" : "text-[hsl(152_55%_48%)]")}>
                  {key.revoked ? "REVOKED" : "VALID"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Log */}
      {log.length > 0 && (
        <div className="rounded-xl border bg-card p-3">
          <h4 className="text-xs font-semibold text-foreground mb-2">Verification Log</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {log.slice(-10).reverse().map(entry => (
              <div key={entry.id} className="flex items-center justify-between text-[10px]">
                <span className="font-mono text-muted-foreground truncate max-w-[120px]">{entry.binaryPath}</span>
                <span className={cn("font-semibold", resultColors[entry.result])}>{entry.result}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 3: Permission Monitor ──

function PermissionsTab() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 1500); return () => clearInterval(t); }, []);

  const snapshots = PermissionMonitor.getAllSnapshots();
  const accessLog = PermissionMonitor.getAccessLog(20);
  const stats = PermissionMonitor.getStats();

  const PERM_LABELS: Record<string, string> = {
    "files.read": "Files",
    "files.write": "Files (W)",
    "system.notifications": "Notifications",
    "clipboard.read": "Clipboard",
    "clipboard.write": "Clipboard (W)",
    "camera": "Camera",
    "network": "Network",
    "location": "Location",
    "microphone": "Microphone",
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex gap-3 text-xs">
        <div className="px-3 py-1.5 rounded-lg bg-muted/50">
          <span className="text-muted-foreground">Apps:</span>{" "}
          <span className="font-semibold text-foreground">{stats.registeredApps}</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-muted/50">
          <span className="text-muted-foreground">Grants:</span>{" "}
          <span className="font-semibold text-foreground">{stats.totalGrants}</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-muted/50">
          <span className="text-muted-foreground">Denied:</span>{" "}
          <span className="font-semibold text-destructive">{stats.deniedCount}</span>
        </div>
      </div>

      {/* Per-app permission dashboard */}
      {snapshots.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">No apps registered — launch apps to see permissions</div>
      ) : (
        <div className="space-y-2">
          {snapshots.map(snap => (
            <div key={snap.appId} className="rounded-xl border bg-card p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-semibold text-foreground">{snap.appId}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{snap.totalAccesses} accesses</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {snap.permissions.map(perm => {
                  const isActive = snap.activePermissions.has(perm);
                  const label = PERM_LABELS[perm] || perm;
                  return (
                    <div key={perm} className={cn(
                      "flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg font-medium",
                      isActive
                        ? "bg-[hsl(152_55%_48%/0.12)] text-[hsl(152_55%_40%)]"
                        : "bg-muted/40 text-muted-foreground"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-[hsl(152_55%_48%)] animate-pulse" : "bg-muted-foreground/30")} />
                      {label}: {isActive ? "ACTIVE" : "OFF"}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Access log feed */}
      {accessLog.length > 0 && (
        <div className="rounded-xl border bg-card p-3">
          <h4 className="text-xs font-semibold text-foreground mb-2">Recent Access Log</h4>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {accessLog.slice().reverse().map(entry => (
              <div key={entry.id} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full", entry.granted ? "bg-[hsl(152_55%_48%)]" : "bg-destructive")} />
                  <span className="text-muted-foreground">{entry.appId}</span>
                  <span className="font-mono text-foreground">{entry.channel}</span>
                </div>
                <span className="text-muted-foreground">{new Date(entry.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 4: File System ──

function FileSystemTab() {
  const stats = FileSystemService.getStats();
  const mounts = FileSystemService.getMounts();
  const allTags = FileSystemService.getAllTags();

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex gap-3 text-xs flex-wrap">
        <div className="px-3 py-1.5 rounded-lg bg-muted/50">
          <span className="text-muted-foreground">Files:</span>{" "}
          <span className="font-semibold text-foreground">{stats.totalFiles}</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-muted/50">
          <span className="text-muted-foreground">Dirs:</span>{" "}
          <span className="font-semibold text-foreground">{stats.totalDirs}</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-muted/50">
          <span className="text-muted-foreground">Versions:</span>{" "}
          <span className="font-semibold text-foreground">{stats.totalVersions}</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-muted/50">
          <span className="text-muted-foreground">Tags:</span>{" "}
          <span className="font-semibold text-foreground">{stats.uniqueTags}</span>
        </div>
      </div>

      {/* Mounts with quota bars */}
      <div className="rounded-xl border bg-card p-3">
        <h4 className="text-xs font-semibold text-foreground mb-3">Mounts</h4>
        <div className="space-y-3">
          {mounts.map(mount => {
            const usagePercent = mount.quota > 0 ? (mount.used / mount.quota) * 100 : 0;
            const usageColor = usagePercent > 90 ? "bg-destructive" : usagePercent > 70 ? "bg-[hsl(38_85%_58%)]" : "bg-primary";
            return (
              <div key={mount.path}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium text-foreground">{mount.label}</span>
                    <span className="font-mono text-muted-foreground text-[9px]">{mount.path}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {mount.readOnly && <Lock className="w-3 h-3 inline mr-1" />}
                    {mount.quota > 0 ? `${(mount.used / 1024 / 1024).toFixed(1)}/${(mount.quota / 1024 / 1024).toFixed(0)} MB` : "unlimited"}
                  </span>
                </div>
                {mount.quota > 0 && (
                  <div className="h-1.5 rounded-full bg-muted">
                    <div className={cn("h-full rounded-full transition-all", usageColor)} style={{ width: `${Math.min(100, usagePercent)}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="rounded-xl border bg-card p-3">
          <h4 className="text-xs font-semibold text-foreground mb-2">Tags ({allTags.length})</h4>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 5: Threat Protection ──

function ThreatProtectionTab() {
  const [realTimeOn, setRealTimeOn] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleScan = () => {
    setScanning(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          return 100;
        }
        return prev + Math.random() * 8 + 2;
      });
    }, 200);
  };

  const threats = [
    { name: "Tracking script blocked", source: "analytics-cdn.io", time: "2h ago", severity: "low" },
    { name: "Suspicious API call intercepted", source: "unknown-endpoint.xyz", time: "5h ago", severity: "medium" },
  ];

  return (
    <div className="space-y-4">
      {/* Real-time protection toggle */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              realTimeOn ? "bg-[hsl(152_55%_48%/0.15)]" : "bg-muted"
            )}>
              <Shield className={cn("w-5 h-5", realTimeOn ? "text-[hsl(152_55%_48%)]" : "text-muted-foreground")} />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Real-time Protection</div>
              <div className="text-[10px] text-muted-foreground">
                {realTimeOn ? "All systems monitored" : "Protection disabled"}
              </div>
            </div>
          </div>
          <button
            onClick={() => setRealTimeOn(!realTimeOn)}
            className={cn(
              "w-11 h-6 rounded-full transition-all relative",
              realTimeOn ? "bg-[hsl(152_55%_48%)]" : "bg-muted"
            )}
          >
            <div className={cn(
              "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform",
              realTimeOn ? "translate-x-[22px]" : "translate-x-0.5"
            )} />
          </button>
        </div>
      </div>

      {/* Scan button */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-foreground">System Scan</h4>
          <span className="text-[10px] text-muted-foreground">Last scan: 3h ago</span>
        </div>
        {scanning ? (
          <div className="space-y-2">
            <Progress value={Math.min(progress, 100)} className="h-2" />
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Scanning… {Math.min(Math.round(progress), 100)}%
            </div>
          </div>
        ) : (
          <button
            onClick={handleScan}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            {progress >= 100 ? "✓ Scan Complete — No Threats" : "Run Full Scan"}
          </button>
        )}
      </div>

      {/* Threat log */}
      <div className="rounded-xl border bg-card p-3">
        <h4 className="text-xs font-semibold text-foreground mb-2">Recent Activity</h4>
        <div className="space-y-2">
          {threats.map((t, i) => (
            <div key={i} className="flex items-start gap-2.5 text-[11px]">
              <Bug className={cn("w-3.5 h-3.5 mt-0.5 shrink-0",
                t.severity === "medium" ? "text-[hsl(38_85%_58%)]" : "text-muted-foreground"
              )} />
              <div className="flex-1">
                <div className="font-medium text-foreground">{t.name}</div>
                <div className="text-[9px] text-muted-foreground">{t.source} · {t.time}</div>
              </div>
              <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-medium",
                t.severity === "medium"
                  ? "bg-[hsl(38_85%_58%/0.15)] text-[hsl(38_85%_45%)]"
                  : "bg-muted text-muted-foreground"
              )}>
                {t.severity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 text-xs">
        <div className="px-3 py-1.5 rounded-lg bg-[hsl(152_55%_48%/0.1)]">
          <span className="text-[hsl(152_55%_40%)] font-semibold">0</span>
          <span className="text-muted-foreground ml-1">threats active</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-muted/50">
          <span className="font-semibold text-foreground">247</span>
          <span className="text-muted-foreground ml-1">blocked this week</span>
        </div>
      </div>
    </div>
  );
}

// ── Tab 6: VPN ──

const VPN_SERVERS = [
  { city: "New York", country: "US", latency: 12, flag: "🇺🇸" },
  { city: "London", country: "UK", latency: 45, flag: "🇬🇧" },
  { city: "Tokyo", country: "JP", latency: 89, flag: "🇯🇵" },
  { city: "Frankfurt", country: "DE", latency: 38, flag: "🇩🇪" },
  { city: "Singapore", country: "SG", latency: 72, flag: "🇸🇬" },
  { city: "São Paulo", country: "BR", latency: 95, flag: "🇧🇷" },
];

function VPNTab() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedServer, setSelectedServer] = useState(VPN_SERVERS[0]);

  const handleToggle = () => {
    if (connected) {
      setConnected(false);
    } else {
      setConnecting(true);
      setTimeout(() => {
        setConnecting(false);
        setConnected(true);
      }, 1500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Connection status */}
      <div className="rounded-xl border bg-card p-4 text-center space-y-3">
        <div className={cn(
          "mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500",
          connected
            ? "bg-[hsl(152_55%_48%/0.15)] shadow-[0_0_24px_hsl(152_55%_48%/0.2)]"
            : connecting
              ? "bg-primary/10 animate-pulse"
              : "bg-muted"
        )}>
          <Globe className={cn("w-7 h-7 transition-colors",
            connected ? "text-[hsl(152_55%_48%)]" : connecting ? "text-primary animate-spin" : "text-muted-foreground"
          )} />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">
            {connected ? "Connected" : connecting ? "Connecting…" : "Disconnected"}
          </div>
          {connected && (
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {selectedServer.flag} {selectedServer.city} · {selectedServer.latency}ms
            </div>
          )}
        </div>
        <button
          onClick={handleToggle}
          disabled={connecting}
          className={cn(
            "px-6 py-2 rounded-lg text-xs font-medium transition-all",
            connected
              ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
            connecting && "opacity-50 cursor-wait"
          )}
        >
          {connected ? "Disconnect" : connecting ? "Connecting…" : "Connect"}
        </button>
      </div>

      {/* Encryption badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
        <Lock className="w-3.5 h-3.5 text-primary" />
        <span className="text-[11px] text-foreground font-medium">AES-256-GCM</span>
        <span className="text-[10px] text-muted-foreground">· WireGuard Protocol</span>
      </div>

      {/* Server list */}
      <div className="rounded-xl border bg-card p-3">
        <h4 className="text-xs font-semibold text-foreground mb-2">Server Locations</h4>
        <div className="space-y-1">
          {VPN_SERVERS.map(server => (
            <button
              key={server.city}
              onClick={() => setSelectedServer(server)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all",
                selectedServer.city === server.city
                  ? "bg-primary/10"
                  : "hover:bg-muted/50"
              )}
            >
              <span className="text-sm">{server.flag}</span>
              <div className="flex-1">
                <div className={cn("text-[11px]",
                  selectedServer.city === server.city ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {server.city}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                <span className={cn("text-[10px]",
                  server.latency < 50
                    ? "text-[hsl(152_55%_48%)]"
                    : server.latency < 80
                      ? "text-[hsl(38_85%_58%)]"
                      : "text-muted-foreground"
                )}>{server.latency}ms</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Transfer stats */}
      {connected && (
        <div className="flex gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-muted/50">
            <span className="text-muted-foreground">↑</span>{" "}
            <span className="font-semibold text-foreground">1.2 GB</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-muted/50">
            <span className="text-muted-foreground">↓</span>{" "}
            <span className="font-semibold text-foreground">3.8 GB</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-muted/50">
            <span className="text-muted-foreground">IP:</span>{" "}
            <span className="font-semibold text-foreground font-mono">185.xx.xx.42</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Security Center Window ──

export function SecurityCenterWindow() {
  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2 border-b">
        <div className="w-8 h-8 rounded-xl bg-[hsl(0_70%_55%/0.12)] flex items-center justify-center">
          <Shield className="w-4.5 h-4.5 text-[hsl(0_70%_55%)]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Security Center</h2>
          <p className="text-[10px] text-muted-foreground">System security, privacy & VPN</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="threats" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-2 bg-muted/50 flex-wrap h-auto gap-0.5 p-1">
          <TabsTrigger value="threats" className="text-[11px] gap-1">
            <Bug className="w-3 h-3" /> Threats
          </TabsTrigger>
          <TabsTrigger value="vpn" className="text-[11px] gap-1">
            <Globe className="w-3 h-3" /> VPN
          </TabsTrigger>
          <TabsTrigger value="sandbox" className="text-[11px] gap-1">
            <Shield className="w-3 h-3" /> Sandbox
          </TabsTrigger>
          <TabsTrigger value="signing" className="text-[11px] gap-1">
            <Lock className="w-3 h-3" /> Signing
          </TabsTrigger>
          <TabsTrigger value="permissions" className="text-[11px] gap-1">
            <Eye className="w-3 h-3" /> Perms
          </TabsTrigger>
          <TabsTrigger value="filesystem" className="text-[11px] gap-1">
            <HardDrive className="w-3 h-3" /> FS
          </TabsTrigger>
          <TabsTrigger value="accounts" className="text-[11px] gap-1">
            <User className="w-3 h-3" /> Accounts
          </TabsTrigger>
          <TabsTrigger value="device-id" className="text-[11px] gap-1">
            <Cpu className="w-3 h-3" /> Device
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-[11px] gap-1">
            <Bell className="w-3 h-3" /> Alerts
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <TabsContent value="threats" className="mt-0"><ThreatProtectionTab /></TabsContent>
          <TabsContent value="vpn" className="mt-0"><VPNTab /></TabsContent>
          <TabsContent value="sandbox" className="mt-0"><SandboxTab /></TabsContent>
          <TabsContent value="signing" className="mt-0"><CodeSigningTab /></TabsContent>
          <TabsContent value="permissions" className="mt-0"><PermissionsTab /></TabsContent>
          <TabsContent value="filesystem" className="mt-0"><FileSystemTab /></TabsContent>
          <TabsContent value="accounts" className="mt-0"><SecurityAccountsPanel /></TabsContent>
          <TabsContent value="device-id" className="mt-0"><DeviceIdentityPanel /></TabsContent>
          <TabsContent value="notifications" className="mt-0"><SecurityNotificationsPanel /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
