// ═══════════════════════════════════════════════════════════════
// SITA OS — Security Center Window
// 4-tab security dashboard: Sandbox, Code Signing, Permissions, FS
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Lock, Eye, HardDrive, CheckCircle, XCircle, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLoader } from "@/lib/nova-sdk/runtime/loader";
import { PermissionMonitor } from "@/lib/nova-sdk/services/permission-monitor";
import { FileSystemService } from "@/lib/nova-sdk/services/filesystem-service";

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
          <p className="text-[10px] text-muted-foreground">System security & privacy dashboard</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sandbox" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-2 bg-muted/50">
          <TabsTrigger value="sandbox" className="text-[11px] gap-1">
            <Shield className="w-3 h-3" /> Sandbox
          </TabsTrigger>
          <TabsTrigger value="signing" className="text-[11px] gap-1">
            <Lock className="w-3 h-3" /> Signing
          </TabsTrigger>
          <TabsTrigger value="permissions" className="text-[11px] gap-1">
            <Eye className="w-3 h-3" /> Permissions
          </TabsTrigger>
          <TabsTrigger value="filesystem" className="text-[11px] gap-1">
            <HardDrive className="w-3 h-3" /> File System
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <TabsContent value="sandbox" className="mt-0"><SandboxTab /></TabsContent>
          <TabsContent value="signing" className="mt-0"><CodeSigningTab /></TabsContent>
          <TabsContent value="permissions" className="mt-0"><PermissionsTab /></TabsContent>
          <TabsContent value="filesystem" className="mt-0"><FileSystemTab /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
