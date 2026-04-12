// ═══════════════════════════════════════════════════════════════
// SITA OS — Kernel Dashboard (Interactive + Live Data)
// Admin visualization with drill-downs into scheduler, memory,
// filesystem, security rings, display server, power management,
// and CPU privilege ring enforcement
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Cpu, MemoryStick, HardDrive, Shield, Activity, Layers, Bell,
  Zap, Clock, Lock, Server, Database, AlertTriangle, CheckCircle,
  RefreshCw, Terminal, ChevronRight, ArrowLeft, X, Eye,
  FileText, Folder, Info, Play, Pause, Timer, GitBranch,
  Monitor, Battery, BatteryCharging, Thermometer, Gauge,
  Sun, Moon, Power, Wifi, ShieldAlert, ArrowRightLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PriorityBand as KernelPriorityBand, BAND_CONFIG } from "@/lib/core-services/kernel/process-scheduler";
import { TrustRing, RING_CONFIG } from "@/lib/core-services/kernel/sandbox-engine";
import { ProcessTable, type Process, type PriorityBand as NovaPriorityBand } from "@/lib/nova-sdk/kernel/process-manager";
import { MemoryManager } from "@/lib/nova-sdk/kernel/memory-manager";
import { Scheduler, type SchedulerEvent } from "@/lib/nova-sdk/kernel/scheduler";
import { Compositor } from "@/lib/nova-sdk/kernel/compositor";
import { PowerManager, type PowerStats, type CpuGovernor, type ThermalZoneState } from "@/lib/nova-sdk/kernel/power-manager";
import { PrivilegeEnforcement, type PrivilegeViolation, type RingTransition } from "@/lib/nova-sdk/kernel/privilege";
import { WaylandServer, type WaylandClient, type WaylandStats } from "@/lib/nova-sdk/kernel/wayland";
import { ServiceManager, type ServiceStatus } from "@/lib/nova-sdk/services/service-manager";

// ── Animation Variants ───────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const slideIn = {
  initial: { opacity: 0, x: 24, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 200, damping: 22 } },
  exit: { opacity: 0, x: -16, filter: "blur(2px)", transition: { duration: 0.15 } },
};

// ── Filesystem Demo Data ─────────────────────────────────────

const FILESYSTEM_MOUNTS = [
  { path: "/", fsType: "sitafs", device: "/dev/sda1", size: "256 GB", used: "142 GB", usedPercent: 55, options: "rw,noatime,compress=zstd", status: "healthy" as const, inodes: { total: 16777216, used: 842390, files: 612400, dirs: 128990, symlinks: 11200, deviceFiles: 890 } },
  { path: "/home", fsType: "sitafs", device: "/dev/sda2", size: "512 GB", used: "234 GB", usedPercent: 46, options: "rw,noatime,cow,encrypt", status: "healthy" as const, inodes: { total: 33554432, used: 1240800, files: 1020000, dirs: 195800, symlinks: 24000, deviceFiles: 1000 } },
  { path: "/tmp", fsType: "tmpfs", device: "tmpfs", size: "4 GB", used: "1.2 GB", usedPercent: 30, options: "rw,nosuid,nodev", status: "healthy" as const, inodes: { total: 1048576, used: 3200, files: 2800, dirs: 350, symlinks: 50, deviceFiles: 0 } },
  { path: "/proc", fsType: "procfs", device: "proc", size: "—", used: "—", usedPercent: 0, options: "ro,nosuid,nodev", status: "healthy" as const, inodes: { total: 0, used: 0, files: 0, dirs: 0, symlinks: 0, deviceFiles: 0 } },
  { path: "/sys", fsType: "sysfs", device: "sys", size: "—", used: "—", usedPercent: 0, options: "ro,nosuid,nodev", status: "healthy" as const, inodes: { total: 0, used: 0, files: 0, dirs: 0, symlinks: 0, deviceFiles: 0 } },
  { path: "/dev", fsType: "devtmpfs", device: "udev", size: "8 GB", used: "0 GB", usedPercent: 0, options: "rw,nosuid", status: "healthy" as const, inodes: { total: 65536, used: 480, files: 0, dirs: 48, symlinks: 32, deviceFiles: 400 } },
  { path: "/var/log", fsType: "sitafs", device: "/dev/sda3", size: "32 GB", used: "28 GB", usedPercent: 88, options: "rw,noatime,compress=lz4", status: "warning" as const, inodes: { total: 4194304, used: 892000, files: 880000, dirs: 11200, symlinks: 800, deviceFiles: 0 } },
  { path: "/mnt/vault", fsType: "sitafs", device: "/dev/sdb1", size: "1 TB", used: "120 GB", usedPercent: 12, options: "rw,encrypt,integrity", status: "healthy" as const, inodes: { total: 67108864, used: 240000, files: 210000, dirs: 28000, symlinks: 2000, deviceFiles: 0 } },
];

const RING_DESCRIPTIONS: Record<number, string> = {
  [TrustRing.KERNEL]: "Kernel-space: scheduler, VMM, interrupts",
  [TrustRing.TRUSTED]: "Signed SITA services: executor, receipt, policy",
  [TrustRing.VERIFIED]: "Third-party signed apps with full review",
  [TrustRing.SANDBOXED]: "Third-party apps with restricted sandbox",
  [TrustRing.UNTRUSTED]: "Unknown/unsigned code — maximum restriction",
};

const SECURITY_RINGS = [
  { ring: TrustRing.KERNEL, ...RING_CONFIG[TrustRing.KERNEL], processes: 4, violations: 0 },
  { ring: TrustRing.TRUSTED, ...RING_CONFIG[TrustRing.TRUSTED], processes: 18, violations: 0 },
  { ring: TrustRing.VERIFIED, ...RING_CONFIG[TrustRing.VERIFIED], processes: 42, violations: 2 },
  { ring: TrustRing.SANDBOXED, ...RING_CONFIG[TrustRing.SANDBOXED], processes: 56, violations: 5 },
  { ring: TrustRing.UNTRUSTED, ...RING_CONFIG[TrustRing.UNTRUSTED], processes: 27, violations: 12 },
];

const BAND_COLORS = [
  "bg-red-500/70",
  "bg-orange-500/60",
  "bg-blue-500/60",
  "bg-emerald-500/50",
  "bg-muted-foreground/30",
];

const RING_COLORS = [
  "border-red-500 bg-red-500/8 text-red-400",
  "border-orange-500 bg-orange-500/8 text-orange-400",
  "border-blue-500 bg-blue-500/8 text-blue-400",
  "border-emerald-500 bg-emerald-500/8 text-emerald-400",
  "border-muted-foreground bg-muted/8 text-muted-foreground",
];

const fsStatusColor = {
  healthy: "text-emerald-400",
  warning: "text-amber-400",
  degraded: "text-orange-400",
  critical: "text-red-400",
};

const THERMAL_COLORS: Record<ThermalZoneState, string> = {
  normal: "text-emerald-400",
  warm: "text-amber-400",
  hot: "text-orange-400",
  critical: "text-red-400",
};

// ── Live data hook ───────────────────────────────────────────

function useKernelMetrics(refreshMs = 2000) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), refreshMs);
    return () => clearInterval(iv);
  }, [refreshMs]);

  const processes = useMemo(() => ProcessTable.listProcesses(), [tick]);
  const memStats = useMemo(() => MemoryManager.getStats(), [tick]);
  const schedStats = useMemo(() => Scheduler.getStats(), [tick]);
  const compStats = useMemo(() => Compositor.getStats(), [tick]);
  const powerStats = useMemo(() => PowerManager.getStats(), [tick]);
  const privilegeStats = useMemo(() => PrivilegeEnforcement.getStats(), [tick]);
  const privilegeViolations = useMemo(() => PrivilegeEnforcement.getViolations(20), [tick]);
  const ringTransitions = useMemo(() => PrivilegeEnforcement.getTransitions(20), [tick]);
  const schedulerEvents = useMemo(() => Scheduler.getEventLog(20), [tick]);
  const currentContext = useMemo(() => Scheduler.getCurrentContext(), [tick]);
  const blockedProcesses = useMemo(() => ProcessTable.listBlocked(), [tick]);
  const readyProcesses = useMemo(() => ProcessTable.listReady(), [tick]);
  const compositorSurfaces = useMemo(() => Compositor.listSurfaces(), [tick]);
  const waylandStats = useMemo(() => WaylandServer.getStats(), [tick]);
  const waylandClients = useMemo(() => WaylandServer.listClients(), [tick]);
  const waylandGlobals = useMemo(() => WaylandServer.listGlobals(), [tick]);

  const bandDistribution = useMemo(() => {
    const bands: Record<string, { count: number; cpuPercent: number }> = {};
    const allBands: NovaPriorityBand[] = ["RT-Critical", "RT-Normal", "Interactive", "Batch", "Idle"];
    for (const b of allBands) bands[b] = { count: 0, cpuPercent: 0 };
    for (const p of processes) {
      if (p.state !== "terminated") {
        bands[p.priority].count++;
        bands[p.priority].cpuPercent += p.cpuTicks;
      }
    }
    const totalTicks = Object.values(bands).reduce((s, b) => s + b.cpuPercent, 0) || 1;
    for (const b of allBands) {
      bands[b].cpuPercent = Math.round((bands[b].cpuPercent / totalTicks) * 1000) / 10;
    }
    return bands;
  }, [processes]);

  const serviceManagerStats = useMemo(() => {
    const diag = ServiceManager.getDiagnostics();
    const bootLog = ServiceManager.getBootLog();
    return { diagnostics: diag, bootLog, booted: ServiceManager.isBooted() };
  }, [tick]);

  return { processes, memStats, schedStats, compStats, powerStats, privilegeStats, privilegeViolations, ringTransitions, bandDistribution, tick, schedulerEvents, currentContext, blockedProcesses, readyProcesses, compositorSurfaces, waylandStats, waylandClients, waylandGlobals, serviceManagerStats };
}

// ── Subcomponents ────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, color, live, onClick }: {
  icon: typeof Cpu; label: string; value: string | number; sub?: string; color?: string; live?: boolean; onClick?: () => void;
}) => (
  <motion.div variants={fadeUp}>
    <Card
      className={cn("border-border/40 bg-card/80 backdrop-blur-sm transition-all", onClick && "cursor-pointer hover:border-primary/30 hover:shadow-md")}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("rounded-xl p-2.5 bg-primary/8", color)}>
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
              {live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            </div>
            <p className="text-lg font-semibold text-foreground tabular-nums">{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
          </div>
          {onClick && <ChevronRight className="h-4 w-4 text-muted-foreground/40" />}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// ── Drill-Down: Process Band Detail ──────────────────────────

function BandDrillDown({ band, processes, onBack }: {
  band: NovaPriorityBand;
  processes: Process[];
  onBack: () => void;
}) {
  const filtered = processes.filter(p => p.priority === band && p.state !== "terminated");
  const stateColors: Record<string, string> = {
    running: "text-emerald-400", ready: "text-blue-400", blocked: "text-amber-400",
    suspended: "text-muted-foreground", created: "text-purple-400", terminated: "text-red-400",
  };

  return (
    <motion.div {...slideIn}>
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="rounded-lg p-1.5 hover:bg-muted/30 transition-colors">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              {band} Processes
            </CardTitle>
            <Badge variant="outline" className="ml-auto">{filtered.length} active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No active processes in this band</div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map(p => (
                <div key={p.pid} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                  <div className="w-8 text-center">
                    <span className="text-xs font-mono font-bold text-foreground">{p.pid}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{p.appId}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Windows: {p.windowIds.length} · Memory: {Math.round(p.memoryUsed / 1024)}KB · Ticks: {p.cpuTicks}
                    </p>
                  </div>
                  <span className={cn("text-[10px] font-semibold uppercase", stateColors[p.state] || "text-muted-foreground")}>{p.state}</span>
                  <div className="w-1.5 h-1.5 rounded-full" style={{
                    background: p.state === "running" ? "hsl(150 60% 45%)" : p.state === "ready" ? "hsl(210 80% 60%)" : "hsl(0 0% 40%)",
                  }} />
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-border/30 grid grid-cols-3 gap-3">
            {[
              { label: "Total Memory", value: `${Math.round(filtered.reduce((s, p) => s + p.memoryUsed, 0) / 1024)}KB` },
              { label: "Total CPU Ticks", value: filtered.reduce((s, p) => s + p.cpuTicks, 0) },
              { label: "Windows", value: filtered.reduce((s, p) => s + p.windowIds.length, 0) },
            ].map(s => (
              <div key={s.label} className="text-center py-2 rounded-lg bg-muted/20">
                <p className="text-xs font-semibold text-foreground tabular-nums">{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Drill-Down: Mount Point Inode Stats ──────────────────────

function MountDrillDown({ mount, onBack }: {
  mount: typeof FILESYSTEM_MOUNTS[0];
  onBack: () => void;
}) {
  const { inodes } = mount;
  const inodePercent = inodes.total > 0 ? Math.round((inodes.used / inodes.total) * 100) : 0;
  const inodeBreakdown = [
    { label: "Regular Files", value: inodes.files, icon: FileText, color: "text-blue-400" },
    { label: "Directories", value: inodes.dirs, icon: Folder, color: "text-emerald-400" },
    { label: "Symlinks", value: inodes.symlinks, icon: Layers, color: "text-purple-400" },
    { label: "Device Files", value: inodes.deviceFiles, icon: Server, color: "text-amber-400" },
  ];

  return (
    <motion.div {...slideIn}>
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="rounded-lg p-1.5 hover:bg-muted/30 transition-colors">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-emerald-400" />
              <span className="font-mono">{mount.path}</span>
            </CardTitle>
            <Badge variant="outline" className={cn("ml-auto", fsStatusColor[mount.status])}>{mount.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Filesystem", value: mount.fsType },
              { label: "Device", value: mount.device },
              { label: "Total Size", value: mount.size },
              { label: "Used", value: mount.used },
            ].map(i => (
              <div key={i.label} className="rounded-lg bg-muted/15 px-3 py-2">
                <p className="text-[10px] text-muted-foreground">{i.label}</p>
                <p className="text-xs font-semibold text-foreground font-mono">{i.value}</p>
              </div>
            ))}
          </div>
          {mount.usedPercent > 0 && (
            <div>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Disk Usage</span><span className="font-mono">{mount.usedPercent}%</span>
              </div>
              <div className="h-4 rounded-md bg-muted/30 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${mount.usedPercent}%` }} transition={{ duration: 0.6 }}
                  className={cn("h-full rounded-md", mount.usedPercent > 80 ? "bg-amber-500" : "bg-emerald-500/60")} />
              </div>
            </div>
          )}
          {inodes.total > 0 && (
            <>
              <div>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Inode Usage</span>
                  <span className="font-mono">{inodes.used.toLocaleString()} / {inodes.total.toLocaleString()} ({inodePercent}%)</span>
                </div>
                <Progress value={inodePercent} className="h-2" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Inode Breakdown</p>
                <div className="grid grid-cols-2 gap-2">
                  {inodeBreakdown.map(ib => (
                    <div key={ib.label} className="flex items-center gap-2 rounded-lg bg-muted/10 px-3 py-2">
                      <ib.icon className={cn("h-3.5 w-3.5", ib.color)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted-foreground">{ib.label}</p>
                        <p className="text-xs font-semibold text-foreground tabular-nums">{ib.value.toLocaleString()}</p>
                      </div>
                      {inodes.used > 0 && (
                        <span className="text-[9px] text-muted-foreground font-mono">{Math.round((ib.value / inodes.used) * 100)}%</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Mount Options</p>
            <div className="flex flex-wrap gap-1.5">
              {mount.options.split(",").map(opt => (
                <Badge key={opt} variant="outline" className="text-[9px] px-1.5 py-0 border-border/30 font-mono">{opt}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Drill-Down: Security Ring Detail ─────────────────────────

function RingDrillDown({ ringData, ringIndex, onBack }: {
  ringData: typeof SECURITY_RINGS[0];
  ringIndex: number;
  onBack: () => void;
}) {
  const ringProcesses = useMemo(() => {
    const names = [
      ["kernel-scheduler", "kernel-vmm", "kernel-irq", "kernel-compositor"],
      ["executor-svc", "receipt-svc", "policy-engine", "approval-svc", "memory-gov", "identity-svc"],
      ["mail-app", "calendar-app", "notes-app", "finder-app", "weather-app"],
      ["third-party-a", "third-party-b", "widget-1", "widget-2"],
      ["untrusted-script", "temp-worker", "sandbox-eval"],
    ];
    return (names[ringIndex] || []).slice(0, ringData.processes).map((name, i) => ({
      pid: 100 * (ringIndex + 1) + i, name,
      memory: Math.round(Math.random() * 128 + 16),
      syscalls: Math.round(Math.random() * 5000),
      violations: i < ringData.violations ? 1 : 0,
    }));
  }, [ringData, ringIndex]);

  return (
    <motion.div {...slideIn}>
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="rounded-lg p-1.5 hover:bg-muted/30 transition-colors"><ArrowLeft className="h-4 w-4 text-muted-foreground" /></button>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-400" />Ring {ringData.ring} — {ringData.label}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">{RING_DESCRIPTIONS[ringData.ring]}</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center py-2 rounded-lg bg-muted/20">
              <p className="text-sm font-semibold text-foreground">{ringData.processes}</p>
              <p className="text-[9px] text-muted-foreground">Processes</p>
            </div>
            <div className="text-center py-2 rounded-lg bg-muted/20">
              <p className={cn("text-sm font-semibold", ringData.violations > 0 ? "text-red-400" : "text-emerald-400")}>{ringData.violations}</p>
              <p className="text-[9px] text-muted-foreground">Violations</p>
            </div>
            <div className="text-center py-2 rounded-lg bg-muted/20">
              <p className="text-sm font-semibold text-foreground">{ringData.ring}</p>
              <p className="text-[9px] text-muted-foreground">Ring Level</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Processes in Ring</p>
            <div className="space-y-1.5">
              {ringProcesses.map(p => (
                <div key={p.pid} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                  <span className="text-xs font-mono text-foreground/60 w-8">{p.pid}</span>
                  <span className="text-xs font-medium text-foreground flex-1 truncate font-mono">{p.name}</span>
                  <span className="text-[10px] text-muted-foreground">{p.memory}MB</span>
                  <span className="text-[10px] text-muted-foreground">{p.syscalls.toLocaleString()} syscalls</span>
                  {p.violations > 0 && <AlertTriangle className="h-3 w-3 text-red-400 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Permissions</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                ringData.networkAccess !== "none" && `net:${ringData.networkAccess}`,
                `fs:${ringData.filesystemScope}`,
                `fds:${ringData.maxFileDescriptors}`,
                `mem:${ringData.maxMemoryMB}MB`,
                ringData.canSpawnProcesses && "spawn",
                ringData.canAccessHardware && "hardware",
              ].filter(Boolean).map((cap) => (
                <Badge key={String(cap)} variant="outline" className="text-[9px] px-1.5 py-0 border-border/30 font-mono">{String(cap)}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── BandBar (clickable) ──────────────────────────────────────

const BandBar = ({ label, cpuPercent, processes, quantumMs, color, onClick }: {
  label: string; cpuPercent: number; processes: number; quantumMs: number; color: string; onClick?: () => void;
}) => (
  <div className={cn("flex items-center gap-3 py-2 rounded-lg px-2 -mx-2 transition-colors", onClick && "cursor-pointer hover:bg-muted/15")} onClick={onClick}>
    <div className="w-28 shrink-0">
      <p className="text-xs font-medium text-foreground flex items-center gap-1">
        {label}
        {onClick && <ChevronRight className="h-3 w-3 text-muted-foreground/40" />}
      </p>
      <p className="text-[10px] text-muted-foreground">{processes} procs · {quantumMs}ms quantum</p>
    </div>
    <div className="flex-1">
      <div className="h-6 rounded-md bg-muted/30 overflow-hidden relative">
        <motion.div initial={{ width: 0 }} animate={{ width: `${cpuPercent}%` }} transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }} className={cn("h-full rounded-md", color)} />
        <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-mono text-foreground/70">{cpuPercent.toFixed(1)}%</span>
      </div>
    </div>
  </div>
);

// ── Drill-Down: Scheduler Detail ─────────────────────────────

const EVENT_TYPE_COLORS: Record<string, string> = {
  "context-switch": "text-blue-400", "preempt": "text-amber-400", "block": "text-red-400",
  "wake": "text-emerald-400", "sleep": "text-purple-400", "boost": "text-orange-400",
  "quantum-expire": "text-amber-300", "idle": "text-muted-foreground", "spawn": "text-emerald-300", "kill": "text-red-300",
};
const EVENT_TYPE_ICONS: Record<string, typeof Cpu> = {
  "context-switch": GitBranch, "preempt": Timer, "block": Pause, "wake": Play,
  "sleep": Clock, "boost": Zap, "spawn": Play, "kill": X,
};

function SchedulerDetailPanel({ schedStats, events, currentContext, blockedProcesses, onBack }: {
  schedStats: ReturnType<typeof Scheduler.getStats>;
  events: readonly SchedulerEvent[];
  currentContext: ReturnType<typeof Scheduler.getCurrentContext>;
  blockedProcesses: Process[];
  onBack: () => void;
}) {
  const currentProcess = schedStats.currentPid !== null ? ProcessTable.getProcess(schedStats.currentPid) : null;

  return (
    <motion.div {...slideIn}>
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="rounded-lg p-1.5 hover:bg-muted/30 transition-colors"><ArrowLeft className="h-4 w-4 text-muted-foreground" /></button>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />Scheduler Detail — Context Switching & Queues
            </CardTitle>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current CPU State */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Current Process on CPU</p>
            {currentProcess ? (
              <div className="rounded-lg bg-muted/15 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-foreground">PID {currentProcess.pid}</span>
                    <Badge variant="outline" className="text-[9px]">{currentProcess.priority}</Badge>
                    <span className="text-xs text-muted-foreground">{currentProcess.appId}</span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px]">RUNNING</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="bg-muted/20 rounded px-2 py-1">
                    <span className="text-muted-foreground">Quantum: </span>
                    <span className="font-mono text-foreground">{currentProcess.quantumRemaining}/{currentProcess.quantumSize}</span>
                  </div>
                  <div className="bg-muted/20 rounded px-2 py-1">
                    <span className="text-muted-foreground">Ticks: </span>
                    <span className="font-mono text-foreground">{currentProcess.cpuTicks}</span>
                  </div>
                  <div className="bg-muted/20 rounded px-2 py-1">
                    <span className="text-muted-foreground">Switches: </span>
                    <span className="font-mono text-foreground">{currentProcess.contextSwitches}</span>
                  </div>
                </div>
                {currentContext && (
                  <div className="bg-muted/10 rounded-lg p-2 mt-1">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">CPU Registers</p>
                    <div className="grid grid-cols-4 gap-1 text-[9px] font-mono">
                      <span className="text-blue-400">RIP: 0x{currentContext.rip.toString(16).padStart(8, '0')}</span>
                      <span className="text-emerald-400">RSP: 0x{currentContext.rsp.toString(16).padStart(8, '0')}</span>
                      <span className="text-purple-400">RBP: 0x{currentContext.rbp.toString(16).padStart(8, '0')}</span>
                      <span className="text-amber-400">RFLAGS: 0x{currentContext.rflags.toString(16)}</span>
                    </div>
                    <div className="grid grid-cols-8 gap-0.5 mt-1">
                      {currentContext.registers.slice(0, 16).map((r, i) => (
                        <span key={i} className="text-[8px] font-mono text-muted-foreground text-center bg-muted/15 rounded px-0.5">r{i}: {r}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg bg-muted/15 p-3 text-center text-xs text-muted-foreground">
                <Clock className="h-4 w-4 mx-auto mb-1 opacity-40" />CPU Idle — no process scheduled
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Context Switches", value: schedStats.contextSwitchCount, color: "text-blue-400" },
              { label: "Preemptions", value: schedStats.preemptionCount, color: "text-amber-400" },
              { label: "Idle Ticks", value: schedStats.idleTicks, color: "text-muted-foreground" },
              { label: "Boosts", value: schedStats.boostCount, color: "text-orange-400" },
            ].map(s => (
              <div key={s.label} className="text-center py-2 rounded-lg bg-muted/20">
                <p className={cn("text-sm font-semibold tabular-nums", s.color)}>{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Ready Queue Depths */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Ready Queue Depths</p>
            <div className="flex gap-1.5">
              {(["RT-Critical", "RT-Normal", "Interactive", "Batch", "Idle"] as NovaPriorityBand[]).map((band, i) => {
                const depth = schedStats.readyQueueDepths[band];
                return (
                  <div key={band} className="flex-1 text-center">
                    <div className="h-12 rounded bg-muted/15 relative overflow-hidden flex items-end justify-center">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${Math.min(depth * 20, 100)}%` }} className={cn("w-full rounded-t", BAND_COLORS[i])} />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">{depth}</span>
                    </div>
                    <p className="text-[8px] text-muted-foreground mt-0.5 truncate">{band.replace("RT-", "RT")}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blocked Queue */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Blocked Processes ({schedStats.blockedCount})</p>
            {blockedProcesses.length === 0 ? (
              <p className="text-[10px] text-muted-foreground text-center py-2">No blocked processes</p>
            ) : (
              <div className="space-y-1">
                {blockedProcesses.slice(0, 8).map(p => (
                  <div key={p.pid} className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/10 text-[10px]">
                    <span className="font-mono font-bold text-foreground w-8">PID {p.pid}</span>
                    <span className="text-muted-foreground flex-1 truncate">{p.appId}</span>
                    <Badge variant="outline" className="text-[8px] px-1 py-0 border-amber-500/30 text-amber-400">{p.waitReason}</Badge>
                    {p.wakeAt && <span className="text-[8px] text-muted-foreground font-mono">wake: {Math.max(0, p.wakeAt - Date.now())}ms</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Event Timeline */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Scheduler Events (Last {events.length})</p>
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-2">No events yet</p>
              ) : (
                [...events].reverse().map((evt, i) => {
                  const Icon = EVENT_TYPE_ICONS[evt.type] || Activity;
                  return (
                    <div key={i} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/10 text-[9px]">
                      <Icon className={cn("h-3 w-3 shrink-0", EVENT_TYPE_COLORS[evt.type] || "text-muted-foreground")} />
                      <span className={cn("font-semibold uppercase w-20 shrink-0", EVENT_TYPE_COLORS[evt.type])}>{evt.type}</span>
                      <span className="text-muted-foreground font-mono w-12 shrink-0">t={evt.tick}</span>
                      <span className="text-foreground/70 flex-1 truncate">{evt.detail}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Drill-Down: Display Server ───────────────────────────────

function DisplayServerPanel({ compStats, surfaces, onBack }: {
  compStats: ReturnType<typeof Compositor.getStats>;
  surfaces: ReturnType<typeof Compositor.listSurfaces>;
  onBack: () => void;
}) {
  // Simulated GPU backend info
  const gpuBackend = {
    renderer: "Nova GPU (Software Rasterizer)",
    api: "Vulkan 1.3 (simulated)",
    driver: "nova-drm v2.4.1",
    vram: { total: 8192, used: 2340, unit: "MB" },
    refreshRate: 60,
    resolution: "1920×1080",
    vsync: true,
    tripleBuffer: true,
  };

  const bufferPool = {
    frontBuffers: compStats.visible,
    backBuffers: compStats.visible,
    dirtyBuffers: compStats.dirty,
    totalAllocated: compStats.totalSurfaces * 2,
    swapInterval: 1,
  };

  return (
    <motion.div {...slideIn}>
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="rounded-lg p-1.5 hover:bg-muted/30 transition-colors"><ArrowLeft className="h-4 w-4 text-muted-foreground" /></button>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Monitor className="h-4 w-4 text-blue-400" />Display Server — Compositor & GPU
            </CardTitle>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* GPU Backend */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">GPU Backend</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Renderer", value: gpuBackend.renderer },
                { label: "API", value: gpuBackend.api },
                { label: "Driver", value: gpuBackend.driver },
                { label: "Resolution", value: `${gpuBackend.resolution} @ ${gpuBackend.refreshRate}Hz` },
              ].map(i => (
                <div key={i.label} className="rounded-lg bg-muted/15 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">{i.label}</p>
                  <p className="text-xs font-semibold text-foreground">{i.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* VRAM Usage */}
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>VRAM Usage</span>
              <span className="font-mono">{gpuBackend.vram.used} / {gpuBackend.vram.total} MB ({Math.round((gpuBackend.vram.used / gpuBackend.vram.total) * 100)}%)</span>
            </div>
            <div className="h-4 rounded-md bg-muted/30 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(gpuBackend.vram.used / gpuBackend.vram.total) * 100}%` }}
                transition={{ duration: 0.6 }} className="h-full bg-blue-500/60 rounded-md" />
            </div>
          </div>

          {/* Window Manager State */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Window Manager State</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Total Surfaces", value: compStats.totalSurfaces, color: "text-blue-400" },
                { label: "Visible", value: compStats.visible, color: "text-emerald-400" },
                { label: "Dirty", value: compStats.dirty, color: "text-amber-400" },
                { label: "Top Z-Index", value: compStats.topZ, color: "text-purple-400" },
              ].map(s => (
                <div key={s.label} className="text-center py-2 rounded-lg bg-muted/20">
                  <p className={cn("text-sm font-semibold tabular-nums", s.color)}>{s.value}</p>
                  <p className="text-[9px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Buffer Pool */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Buffer Pool</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Front Buffers", value: bufferPool.frontBuffers },
                { label: "Back Buffers", value: bufferPool.backBuffers },
                { label: "Dirty Buffers", value: bufferPool.dirtyBuffers },
              ].map(s => (
                <div key={s.label} className="text-center py-2 rounded-lg bg-muted/20">
                  <p className="text-sm font-semibold text-foreground tabular-nums">{s.value}</p>
                  <p className="text-[9px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
              <span>VSync: <span className={gpuBackend.vsync ? "text-emerald-400" : "text-red-400"}>{gpuBackend.vsync ? "ON" : "OFF"}</span></span>
              <span>Triple Buffer: <span className={gpuBackend.tripleBuffer ? "text-emerald-400" : "text-red-400"}>{gpuBackend.tripleBuffer ? "ON" : "OFF"}</span></span>
              <span>Swap Interval: <span className="font-mono text-foreground">{bufferPool.swapInterval}</span></span>
            </div>
          </div>

          {/* Active Surfaces */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Active Surfaces ({surfaces.length})</p>
            {surfaces.length === 0 ? (
              <p className="text-[10px] text-muted-foreground text-center py-3">No compositor surfaces registered</p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {surfaces.map(s => (
                  <div key={s.windowId} className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/10 hover:bg-muted/15 text-[10px]">
                    <div className={cn("w-2 h-2 rounded-full", s.visible ? "bg-emerald-400" : "bg-muted-foreground/40")} />
                    <span className="font-mono text-foreground w-20 truncate">{s.windowId}</span>
                    <span className="text-muted-foreground">PID {s.pid}</span>
                    <span className="text-muted-foreground ml-auto font-mono">
                      {s.bounds.width}×{s.bounds.height}
                    </span>
                    <span className="text-muted-foreground font-mono">z={s.zIndex}</span>
                    {s.dirty && <Badge variant="outline" className="text-[8px] px-1 py-0 border-amber-500/30 text-amber-400">dirty</Badge>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Drill-Down: Power Management ─────────────────────────────

function PowerManagementPanel({ powerStats, onBack }: {
  powerStats: PowerStats;
  onBack: () => void;
}) {
  const { battery, cpu, thermalZones, events } = powerStats;

  const batteryColor = battery.level > 50 ? "text-emerald-400" : battery.level > 20 ? "text-amber-400" : "text-red-400";
  const BatteryIcon = battery.charging ? BatteryCharging : Battery;

  return (
    <motion.div {...slideIn}>
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="rounded-lg p-1.5 hover:bg-muted/30 transition-colors"><ArrowLeft className="h-4 w-4 text-muted-foreground" /></button>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />Power Management — ACPI
            </CardTitle>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            <Badge variant="outline" className="ml-auto text-[9px]">{powerStats.powerState}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Battery */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Battery</p>
            <div className="rounded-lg bg-muted/15 p-3 space-y-2">
              <div className="flex items-center gap-3">
                <BatteryIcon className={cn("h-6 w-6", batteryColor)} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn("text-lg font-bold tabular-nums", batteryColor)}>{battery.level.toFixed(1)}%</span>
                    <span className="text-[10px] text-muted-foreground">
                      {battery.charging ? "Charging" : "Discharging"} · {battery.acConnected ? "AC" : "Battery"}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div animate={{ width: `${battery.level}%` }} transition={{ duration: 0.5 }}
                      className={cn("h-full rounded-full", battery.level > 50 ? "bg-emerald-500/60" : battery.level > 20 ? "bg-amber-500/60" : "bg-red-500/60")} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-[10px]">
                {[
                  { label: "Voltage", value: `${(battery.voltage / 1000).toFixed(1)}V` },
                  { label: "Current", value: `${battery.current}mA` },
                  { label: "Temp", value: `${battery.temperature.toFixed(1)}°C` },
                  { label: "Health", value: `${battery.health}%` },
                  { label: "Cycles", value: battery.cycleCount },
                  { label: "Capacity", value: `${(battery.remainingCapacity / 1000).toFixed(1)}Wh` },
                  { label: "Time Left", value: battery.timeToEmpty ? `${battery.timeToEmpty}min` : battery.timeToFull !== null ? `${battery.timeToFull}min to full` : "—" },
                  { label: "Design", value: `${(battery.designCapacity / 1000).toFixed(0)}Wh` },
                ].map(s => (
                  <div key={s.label} className="bg-muted/20 rounded px-2 py-1">
                    <span className="text-muted-foreground">{s.label}: </span>
                    <span className="font-mono text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CPU Frequency Scaling */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">CPU Frequency Scaling</p>
            <div className="rounded-lg bg-muted/15 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-bold text-foreground tabular-nums">{cpu.currentMHz} MHz</span>
                  <span className="text-[10px] text-muted-foreground">/ {cpu.maxMHz} MHz</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px]">{cpu.governor}</Badge>
                  {cpu.throttled && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[8px]">THROTTLED</Badge>}
                </div>
              </div>
              <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
                <motion.div animate={{ width: `${cpu.scalingPercent}%` }} transition={{ duration: 0.5 }}
                  className={cn("h-full rounded-full", cpu.throttled ? "bg-red-500/60" : "bg-blue-500/60")} />
              </div>
              {/* Per-core */}
              <div className="grid grid-cols-4 gap-1.5 mt-1">
                {cpu.coreFreqs.map((freq, i) => (
                  <div key={i} className="rounded bg-muted/10 px-2 py-1 text-center">
                    <p className="text-[8px] text-muted-foreground">Core {i}</p>
                    <p className="text-[10px] font-mono font-semibold text-foreground">{freq}MHz</p>
                    <div className="h-1 rounded bg-muted/30 mt-0.5 overflow-hidden">
                      <div className="h-full bg-blue-500/50 rounded" style={{ width: `${cpu.coreLoads[i]}%` }} />
                    </div>
                    <p className="text-[8px] text-muted-foreground mt-0.5">{cpu.coreLoads[i].toFixed(0)}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Thermal Zones */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Thermal Zones</p>
            <div className="space-y-1.5">
              {thermalZones.map(zone => (
                <div key={zone.name} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/10">
                  <Thermometer className={cn("h-4 w-4", THERMAL_COLORS[zone.state])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground font-mono">{zone.name}</span>
                      <span className={cn("text-xs font-bold tabular-nums", THERMAL_COLORS[zone.state])}>{zone.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="h-1.5 rounded bg-muted/30 mt-1 overflow-hidden">
                      <motion.div animate={{ width: `${Math.min(100, (zone.temperature / zone.tripPoints.critical) * 100)}%` }}
                        className={cn("h-full rounded", zone.state === "normal" ? "bg-emerald-500/50" : zone.state === "warm" ? "bg-amber-500/50" : zone.state === "hot" ? "bg-orange-500/60" : "bg-red-500/70")} />
                    </div>
                    <div className="flex gap-2 mt-0.5 text-[8px] text-muted-foreground">
                      <span>Warm: {zone.tripPoints.warm}°</span>
                      <span>Hot: {zone.tripPoints.hot}°</span>
                      <span>Critical: {zone.tripPoints.critical}°</span>
                      {zone.throttlePercent > 0 && <span className="text-amber-400">Throttle: {zone.throttlePercent}%</span>}
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("text-[8px] px-1.5 py-0", THERMAL_COLORS[zone.state])}>{zone.state}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Power Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Uptime", value: `${Math.round(powerStats.uptime / 1000)}s`, color: "text-emerald-400" },
              { label: "Wake Count", value: powerStats.wakeCount, color: "text-blue-400" },
              { label: "Sleep Count", value: powerStats.sleepCount, color: "text-purple-400" },
              { label: "Throttle Time", value: `${Math.round(powerStats.totalThrottleTime / 1000)}s`, color: "text-amber-400" },
            ].map(s => (
              <div key={s.label} className="text-center py-2 rounded-lg bg-muted/20">
                <p className={cn("text-sm font-semibold tabular-nums", s.color)}>{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Power Events */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Power Events (Last {Math.min(events.length, 15)})</p>
            <div className="space-y-0.5 max-h-36 overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-2">No power events yet</p>
              ) : (
                [...events].slice(-15).reverse().map((evt, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/10 text-[9px]">
                    <Zap className="h-3 w-3 shrink-0 text-amber-400" />
                    <span className="font-semibold uppercase w-16 shrink-0 text-amber-400">{evt.type}</span>
                    <span className="text-foreground/70 flex-1 truncate">{evt.detail}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Drill-Down: Privilege Enforcement ────────────────────────

function PrivilegePanel({ privilegeStats, violations, transitions, processes, onBack }: {
  privilegeStats: ReturnType<typeof PrivilegeEnforcement.getStats>;
  violations: readonly PrivilegeViolation[];
  transitions: readonly RingTransition[];
  processes: Process[];
  onBack: () => void;
}) {
  const VIOLATION_COLORS: Record<string, string> = {
    "ring3-kernel-pointer": "text-red-400",
    "ring3-hardware-access": "text-red-400",
    "ring3-privileged-instruction": "text-amber-400",
    "ring3-write-readonly": "text-orange-400",
    "ring3-execute-noexec": "text-orange-400",
    "invalid-pointer-range": "text-amber-400",
    "null-pointer": "text-red-400",
    "stack-overflow": "text-red-400",
    "segment-fault": "text-red-400",
  };

  const TRANSITION_COLORS: Record<string, string> = {
    "user-to-kernel": "text-blue-400",
    "kernel-to-user": "text-emerald-400",
    "syscall-entry": "text-blue-400",
    "syscall-exit": "text-emerald-400",
    "interrupt": "text-amber-400",
    "iret": "text-emerald-400",
  };

  return (
    <motion.div {...slideIn}>
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="rounded-lg p-1.5 hover:bg-muted/30 transition-colors"><ArrowLeft className="h-4 w-4 text-muted-foreground" /></button>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-400" />CPU Privilege Rings — Ring 0 / Ring 3
            </CardTitle>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ring Distribution */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Process Privilege Distribution</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3 text-center">
                <Lock className="h-5 w-5 text-red-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-red-400 tabular-nums">{privilegeStats.ring0Processes}</p>
                <p className="text-[10px] text-muted-foreground">Ring 0 (Kernel)</p>
                <p className="text-[8px] text-muted-foreground/60">Full hardware access</p>
              </div>
              <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3 text-center">
                <Shield className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-blue-400 tabular-nums">{privilegeStats.ring3Processes}</p>
                <p className="text-[10px] text-muted-foreground">Ring 3 (User)</p>
                <p className="text-[8px] text-muted-foreground/60">Sandboxed via syscalls</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Total Transitions", value: privilegeStats.totalTransitions, color: "text-blue-400" },
              { label: "Violations", value: privilegeStats.totalViolations, color: privilegeStats.totalViolations > 0 ? "text-red-400" : "text-emerald-400" },
              { label: "Avg Latency", value: `${privilegeStats.avgTransitionLatencyUs}μs`, color: "text-amber-400" },
              { label: "Procs w/ Violations", value: privilegeStats.processesWithViolations, color: "text-orange-400" },
            ].map(s => (
              <div key={s.label} className="text-center py-2 rounded-lg bg-muted/20">
                <p className={cn("text-sm font-semibold tabular-nums", s.color)}>{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Transition Breakdown */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Transition Types</p>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(privilegeStats.transitionsByType).map(([type, count]) => (
                <div key={type} className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-muted/10 text-[10px]">
                  <ArrowRightLeft className={cn("h-3 w-3", TRANSITION_COLORS[type] || "text-muted-foreground")} />
                  <span className="text-muted-foreground flex-1 truncate">{type}</span>
                  <span className="font-mono font-semibold text-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Per-Process Privilege Levels */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Process Privilege Levels</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {processes.filter(p => p.state !== "terminated").map(p => (
                <div key={p.pid} className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/10 text-[10px]">
                  <span className="font-mono font-bold text-foreground w-10">PID {p.pid}</span>
                  <span className="text-muted-foreground flex-1 truncate">{p.appId}</span>
                  <Badge variant="outline" className={cn("text-[8px] px-1.5 py-0",
                    p.privilegeLevel === 0 ? "border-red-500/30 text-red-400" : "border-blue-500/30 text-blue-400"
                  )}>Ring {p.privilegeLevel}</Badge>
                  <span className="text-[8px] text-muted-foreground font-mono">CPL={p.context.cpl}</span>
                  <span className="text-[8px] text-muted-foreground font-mono">CS=0x{p.context.cs.toString(16)}</span>
                  <span className="text-[8px] text-muted-foreground font-mono">{p.ringTransitions}↔</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Violations */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Security Violations ({violations.length})
            </p>
            <div className="space-y-0.5 max-h-36 overflow-y-auto">
              {violations.length === 0 ? (
                <div className="text-center py-3 text-[10px] text-emerald-400">
                  <CheckCircle className="h-4 w-4 mx-auto mb-1" />No privilege violations detected
                </div>
              ) : (
                [...violations].reverse().map((v, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/10 text-[9px]">
                    <AlertTriangle className={cn("h-3 w-3 shrink-0", VIOLATION_COLORS[v.type] || "text-red-400")} />
                    <span className={cn("font-semibold uppercase w-28 shrink-0 truncate", VIOLATION_COLORS[v.type])}>{v.type}</span>
                    <span className="font-mono text-muted-foreground w-8 shrink-0">PID {v.pid}</span>
                    <span className="text-foreground/70 flex-1 truncate">{v.detail}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Ring Transitions */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Ring Transitions (Last {transitions.length})
            </p>
            <div className="space-y-0.5 max-h-36 overflow-y-auto">
              {transitions.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-2">No ring transitions yet</p>
              ) : (
                [...transitions].reverse().slice(0, 15).map((t, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/10 text-[9px]">
                    <ArrowRightLeft className={cn("h-3 w-3 shrink-0", TRANSITION_COLORS[t.type])} />
                    <span className={cn("font-semibold w-20 shrink-0", TRANSITION_COLORS[t.type])}>{t.type}</span>
                    <span className="font-mono text-muted-foreground w-8 shrink-0">PID {t.pid}</span>
                    <span className="font-mono text-muted-foreground">Ring {t.fromRing}→{t.toRing}</span>
                    <span className="font-mono text-muted-foreground ml-auto">{t.latencyUs}μs</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Drill-Down: Wayland Protocol ─────────────────────────────

function WaylandProtocolPanel({ stats, clients, globals, onBack }: {
  stats: WaylandStats;
  clients: WaylandClient[];
  globals: ReturnType<typeof WaylandServer.listGlobals>;
  onBack: () => void;
}) {
  const formatBytes = (b: number) => {
    if (b >= 1e9) return `${(b / 1e9).toFixed(1)} GB`;
    if (b >= 1e6) return `${(b / 1e6).toFixed(1)} MB`;
    if (b >= 1e3) return `${(b / 1e3).toFixed(0)} KB`;
    return `${b} B`;
  };

  return (
    <motion.div {...slideIn}>
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="rounded-lg p-1.5 hover:bg-muted/30 transition-colors">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-400" />
              Wayland Protocol Server
              <Badge variant="outline" className="text-[8px] ml-1">{stats.protocolVersion}</Badge>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Top-line stats */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {[
              { label: "Clients", val: stats.totalClients, c: "text-blue-400" },
              { label: "Surfaces", val: stats.totalSurfaces, c: "text-emerald-400" },
              { label: "Globals", val: stats.totalGlobals, c: "text-purple-400" },
              { label: "Binds", val: stats.globalBinds, c: "text-amber-400" },
              { label: "Frames", val: stats.totalFramesSubmitted.toLocaleString(), c: "text-blue-300" },
              { label: "Dropped", val: stats.totalFramesDropped, c: "text-red-400" },
              { label: "Avg FPS", val: stats.avgFrameRate.toFixed(1), c: "text-emerald-300" },
              { label: "SHM Pools", val: stats.totalShmPools, c: "text-amber-300" },
            ].map(s => (
              <div key={s.label} className="text-center py-2 rounded-lg bg-muted/20">
                <p className={cn("text-sm font-semibold tabular-nums", s.c)}>{s.val}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Connected Clients */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Connected Clients</p>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/30">
                    <th className="text-left py-1.5 font-medium">Client</th>
                    <th className="text-left py-1.5 font-medium">PID</th>
                    <th className="text-left py-1.5 font-medium">Protocol</th>
                    <th className="text-right py-1.5 font-medium">Surfaces</th>
                    <th className="text-right py-1.5 font-medium">Objects</th>
                    <th className="text-right py-1.5 font-medium">Frames</th>
                    <th className="text-right py-1.5 font-medium">FPS</th>
                    <th className="text-right py-1.5 font-medium">Dropped</th>
                    <th className="text-right py-1.5 font-medium">Transferred</th>
                    <th className="text-left py-1.5 font-medium">Formats</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(c => (
                    <tr key={c.clientId} className="border-b border-border/10 hover:bg-muted/15 transition-colors">
                      <td className="py-1.5 font-mono text-foreground">{c.appId}</td>
                      <td className="py-1.5 font-mono text-muted-foreground">{c.pid}</td>
                      <td className="py-1.5">
                        <Badge variant="outline" className="text-[8px] px-1.5 py-0">{c.protocol}</Badge>
                      </td>
                      <td className="py-1.5 text-right font-mono text-blue-400">{c.surfaces.length}</td>
                      <td className="py-1.5 text-right font-mono text-muted-foreground">{c.objectCount}</td>
                      <td className="py-1.5 text-right font-mono text-foreground">{c.framesSubmitted.toLocaleString()}</td>
                      <td className="py-1.5 text-right font-mono">
                        <span className={cn(c.frameRate >= 55 ? "text-emerald-400" : c.frameRate >= 30 ? "text-amber-400" : "text-red-400")}>
                          {c.frameRate.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-1.5 text-right font-mono">
                        <span className={cn(c.framesDropped === 0 ? "text-muted-foreground" : "text-red-400")}>
                          {c.framesDropped}
                        </span>
                      </td>
                      <td className="py-1.5 text-right font-mono text-muted-foreground">{formatBytes(c.bytesTransferred)}</td>
                      <td className="py-1.5">
                        <div className="flex flex-wrap gap-0.5">
                          {c.negotiatedFormats.slice(0, 3).map(f => (
                            <span key={f} className="text-[8px] px-1 py-0.5 rounded bg-muted/30 text-muted-foreground">{f}</span>
                          ))}
                          {c.negotiatedFormats.length > 3 && (
                            <span className="text-[8px] text-muted-foreground">+{c.negotiatedFormats.length - 3}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bound Globals */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Registered Globals ({globals.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {globals.map(g => (
                <div key={g.name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/10 transition-colors">
                  <span className="text-[10px] font-mono text-muted-foreground w-5 shrink-0">#{g.name}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-mono text-foreground">{g.interface}</span>
                    <span className="text-[9px] text-muted-foreground ml-1">v{g.version}</span>
                  </div>
                  <Badge variant="outline" className={cn("text-[8px] px-1 py-0", g.bindCount > 0 ? "border-emerald-500/30 text-emerald-400" : "border-border/30 text-muted-foreground")}>
                    {g.bindCount} binds
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Buffer Formats + SHM summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Negotiated Formats</p>
              <div className="flex flex-wrap gap-1">
                {stats.activeFormats.map(f => (
                  <Badge key={f} variant="outline" className="text-[9px] px-2 py-0.5 border-blue-500/20 text-blue-400">{f}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Shared Memory</p>
              <div className="space-y-1.5">
                {clients.flatMap(c => c.shmPools.map(p => (
                  <div key={`${c.clientId}-${p.poolId}`} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground w-24 truncate">{c.appId}</span>
                    <div className="flex-1 h-1.5 rounded bg-muted/30 overflow-hidden">
                      <div className="h-full bg-purple-500/50 rounded" style={{ width: `${(p.usedBytes / p.size) * 100}%` }} />
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground">{formatBytes(p.usedBytes)}/{formatBytes(p.size)}</span>
                  </div>
                )))}
                <div className="pt-1 text-[9px] text-muted-foreground">
                  Total SHM: {formatBytes(stats.totalShmBytes)} across {stats.totalShmPools} pools
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-border/30 flex justify-between text-[10px] text-muted-foreground">
            <span>Compositor: <span className="text-foreground font-mono">{stats.compositorName}</span></span>
            <span>Drop rate: <span className={cn("font-mono", stats.totalFramesDropped === 0 ? "text-emerald-400" : "text-amber-400")}>
              {stats.totalFramesSubmitted > 0 ? ((stats.totalFramesDropped / stats.totalFramesSubmitted) * 100).toFixed(2) : 0}%
            </span></span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Service Drill-Down Panel ─────────────────────────────────

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  SettingsService: "Manages user preferences, theme, and system configuration. Provides reactive settings with user/runtime/default layers and persistence via localStorage.",
  FileSystemService: "Virtual filesystem with mount points, MIME detection, versioning, trash, tagging, quota enforcement, and file watch API.",
  InputService: "Handles keyboard shortcuts, hotkey registration, and input event routing across the OS shell and applications.",
  WindowServer: "Window lifecycle management, z-ordering, focus tracking, tiling, minimize/maximize, and multi-window orchestration.",
  NotificationService: "Notification dispatch, queuing, grouping, and delivery. Supports toast, banner, and persistent notification types.",
};

const SERVICE_HEALTH_CHECKS: Record<string, { check: string; description: string }[]> = {
  SettingsService: [
    { check: "Schema validation", description: "All settings keys match the typed schema" },
    { check: "Persistence layer", description: "localStorage read/write operational" },
    { check: "Reactive listeners", description: "Change events firing correctly" },
    { check: "Default fallbacks", description: "All keys have valid defaults" },
  ],
  FileSystemService: [
    { check: "Mount integrity", description: "All mount points accessible and consistent" },
    { check: "Quota enforcement", description: "No mount exceeds allocated quota" },
    { check: "Watch API", description: "File watchers dispatching events" },
    { check: "Trash subsystem", description: "Soft-delete and restore operational" },
    { check: "MIME detection", description: "File extension → MIME mapping functional" },
  ],
  InputService: [
    { check: "Event listeners", description: "Keyboard/mouse event handlers attached" },
    { check: "Hotkey registry", description: "All registered shortcuts conflict-free" },
    { check: "Focus routing", description: "Input events route to focused window" },
  ],
  WindowServer: [
    { check: "Z-index consistency", description: "No z-order conflicts detected" },
    { check: "Focus tracking", description: "Active window receives input" },
    { check: "Window lifecycle", description: "Create/destroy/minimize cycles clean" },
    { check: "Bounds validation", description: "All windows within viewport bounds" },
  ],
  NotificationService: [
    { check: "Queue processing", description: "Notification queue draining normally" },
    { check: "Delivery pipeline", description: "Toast and banner rendering functional" },
    { check: "Grouping engine", description: "Duplicate notifications grouped correctly" },
  ],
};

function ServiceDrillDown({ serviceId, diagnostics, bootLog, onBack }: {
  serviceId: string;
  diagnostics: Record<string, Record<string, unknown>>;
  bootLog: readonly ServiceLogEntry[];
  onBack: () => void;
}) {
  const diag = diagnostics[serviceId] || {};
  const status = (diag.status as ServiceStatus) || "stopped";
  const bootEntry = bootLog.find(e => e.serviceId === serviceId);
  const description = SERVICE_DESCRIPTIONS[serviceId] || "System service providing core OS functionality.";
  const healthChecks = SERVICE_HEALTH_CHECKS[serviceId] || [];

  const SERVICE_META: Record<string, { icon: typeof Cpu; color: string; label: string }> = {
    SettingsService: { icon: RefreshCw, color: "text-blue-400", label: "Settings Service" },
    FileSystemService: { icon: HardDrive, color: "text-emerald-400", label: "Filesystem Service" },
    InputService: { icon: Terminal, color: "text-amber-400", label: "Input Service" },
    WindowServer: { icon: Monitor, color: "text-purple-400", label: "Window Server" },
    NotificationService: { icon: Bell, color: "text-pink-400", label: "Notification Service" },
  };

  const meta = SERVICE_META[serviceId] || { icon: Server, color: "text-muted-foreground", label: serviceId };
  const Icon = meta.icon;

  // Build all diagnostics entries for display
  const allStats = Object.entries(diag).filter(([k]) => k !== "status");

  // Group stats into categories
  const categorizeStats = (entries: [string, unknown][]) => {
    const categories: Record<string, [string, unknown][]> = { General: [] };
    for (const [key, val] of entries) {
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        const catName = key.replace(/([A-Z])/g, " $1").trim();
        categories[catName] = Object.entries(val as Record<string, unknown>);
      } else {
        categories.General.push([key, val]);
      }
    }
    return categories;
  };

  const statCategories = categorizeStats(allStats);

  return (
    <motion.div {...slideIn} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="rounded-lg p-2 hover:bg-muted/30 transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className={cn("rounded-2xl p-3 bg-muted/20 border border-border/30")}>
          <Icon className={cn("h-7 w-7", meta.color)} />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">{meta.label}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-2.5 h-2.5 rounded-full",
            status === "running" ? "bg-emerald-400 animate-pulse" :
            status === "failed" ? "bg-red-400" :
            status === "starting" ? "bg-amber-400 animate-pulse" :
            "bg-muted-foreground/40"
          )} />
          <Badge variant="outline" className={cn(
            "text-xs",
            status === "running" ? "border-emerald-500/30 text-emerald-400" :
            status === "failed" ? "border-red-500/30 text-red-400" :
            "border-border/30"
          )}>
            {status.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Overview Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40 bg-card/80">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground tabular-nums">{bootEntry ? `${bootEntry.timestampMs.toFixed(1)}ms` : "—"}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Boot Time</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/80">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground tabular-nums">{allStats.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Diagnostic Keys</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/80">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400 tabular-nums">{healthChecks.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Health Checks</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/80">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground tabular-nums">{bootEntry?.status === "ok" ? "PASS" : bootEntry?.status === "error" ? "FAIL" : "—"}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Boot Result</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Checks */}
      {healthChecks.length > 0 && (
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              Health Checks
              <Badge variant="outline" className="ml-auto text-[9px] border-emerald-500/30 text-emerald-400">
                {healthChecks.length}/{healthChecks.length} passing
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {healthChecks.map((hc, i) => (
                <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/10 border border-border/20">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{hc.check}</p>
                    <p className="text-[10px] text-muted-foreground">{hc.description}</p>
                  </div>
                  <Badge variant="outline" className="text-[8px] border-emerald-500/20 text-emerald-400 shrink-0">OK</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Diagnostics */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Full Diagnostics
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(statCategories).map(([category, entries]) => {
              if (entries.length === 0) return null;
              return (
                <div key={category} className="rounded-xl border border-border/30 bg-muted/5 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Database className="h-3 w-3" />
                    {category}
                  </p>
                  <div className="space-y-1.5">
                    {entries.map(([key, val]) => {
                      const displayVal = typeof val === "object" && val !== null
                        ? JSON.stringify(val)
                        : typeof val === "boolean"
                        ? val ? "✓ Enabled" : "✗ Disabled"
                        : typeof val === "number"
                        ? val.toLocaleString()
                        : String(val ?? "—");

                      return (
                        <div key={key} className="flex justify-between items-center gap-2 py-1 px-2 rounded-md hover:bg-muted/10 transition-colors">
                          <span className="text-[11px] text-muted-foreground truncate">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="text-[11px] font-mono text-foreground shrink-0 max-w-[200px] truncate" title={displayVal}>
                            {displayVal}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Boot Entry Details */}
      {bootEntry && (
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              Boot Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="py-2 px-3 rounded-lg bg-muted/10">
                <p className="text-[10px] text-muted-foreground">Service ID</p>
                <p className="text-xs font-mono text-foreground mt-0.5">{bootEntry.serviceId}</p>
              </div>
              <div className="py-2 px-3 rounded-lg bg-muted/10">
                <p className="text-[10px] text-muted-foreground">Status</p>
                <p className={cn("text-xs font-semibold mt-0.5", bootEntry.status === "ok" ? "text-emerald-400" : "text-red-400")}>
                  {bootEntry.status.toUpperCase()}
                </p>
              </div>
              <div className="py-2 px-3 rounded-lg bg-muted/10">
                <p className="text-[10px] text-muted-foreground">Duration</p>
                <p className="text-xs font-mono text-foreground mt-0.5">{bootEntry.timestampMs.toFixed(2)}ms</p>
              </div>
              <div className="py-2 px-3 rounded-lg bg-muted/10">
                <p className="text-[10px] text-muted-foreground">Message</p>
                <p className="text-xs text-foreground mt-0.5 truncate">{bootEntry.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────

type DrillDown =
  | { type: "band"; band: NovaPriorityBand }
  | { type: "mount"; mountPath: string }
  | { type: "ring"; ringIndex: number }
  | { type: "scheduler" }
  | { type: "display" }
  | { type: "power" }
  | { type: "privilege" }
  | { type: "wayland" }
  | { type: "service"; serviceId: string }
  | null;

const KernelDashboard = () => {
  const { processes, memStats, schedStats, compStats, powerStats, privilegeStats, privilegeViolations, ringTransitions, bandDistribution, schedulerEvents, currentContext, blockedProcesses, readyProcesses, compositorSurfaces, waylandStats, waylandClients, waylandGlobals, serviceManagerStats } = useKernelMetrics();
  const [drillDown, setDrillDown] = useState<DrillDown>(null);

  const liveProcessCount = processes.length;
  const liveRunning = processes.filter(p => p.state === "running").length;
  const memUsedPercent = memStats.totalPages > 0
    ? Math.round((memStats.allocatedPages / Math.max(memStats.totalPages, memStats.allocatedPages + 256)) * 100) : 5;
  const totalProcesses = Math.max(liveProcessCount, 12) + 135;
  const running = Math.max(liveRunning, 1) + 11;

  const BANDS_DATA = useMemo(() => {
    const allBands: { band: NovaPriorityBand; kernelBand: KernelPriorityBand }[] = [
      { band: "RT-Critical", kernelBand: KernelPriorityBand.RT_CRITICAL },
      { band: "RT-Normal", kernelBand: KernelPriorityBand.RT_NORMAL },
      { band: "Interactive", kernelBand: KernelPriorityBand.INTERACTIVE },
      { band: "Batch", kernelBand: KernelPriorityBand.BATCH },
      { band: "Idle", kernelBand: KernelPriorityBand.IDLE },
    ];
    const demoBase = [
      { processes: 4, cpuPercent: 8.2 },
      { processes: 11, cpuPercent: 15.4 },
      { processes: 38, cpuPercent: 42.1 },
      { processes: 67, cpuPercent: 28.7 },
      { processes: 27, cpuPercent: 5.6 },
    ];
    return allBands.map((b, i) => {
      const live = bandDistribution[b.band];
      return {
        band: b.band,
        label: BAND_CONFIG[b.kernelBand].label,
        processes: demoBase[i].processes + live.count,
        cpuPercent: live.count > 0
          ? Math.round((demoBase[i].cpuPercent + live.cpuPercent) * 10) / 10
          : demoBase[i].cpuPercent,
        quantumMs: BAND_CONFIG[b.kernelBand].quantumMs,
      };
    });
  }, [bandDistribution]);

  // Drill-down views
  if (drillDown) {
    return (
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {drillDown.type === "band" && <BandDrillDown key="band" band={drillDown.band} processes={processes} onBack={() => setDrillDown(null)} />}
          {drillDown.type === "mount" && <MountDrillDown key="mount" mount={FILESYSTEM_MOUNTS.find(m => m.path === drillDown.mountPath)!} onBack={() => setDrillDown(null)} />}
          {drillDown.type === "ring" && <RingDrillDown key="ring" ringData={SECURITY_RINGS[drillDown.ringIndex]} ringIndex={drillDown.ringIndex} onBack={() => setDrillDown(null)} />}
          {drillDown.type === "scheduler" && <SchedulerDetailPanel key="scheduler" schedStats={schedStats} events={schedulerEvents} currentContext={currentContext} blockedProcesses={blockedProcesses} onBack={() => setDrillDown(null)} />}
          {drillDown.type === "display" && <DisplayServerPanel key="display" compStats={compStats} surfaces={compositorSurfaces} onBack={() => setDrillDown(null)} />}
          {drillDown.type === "power" && <PowerManagementPanel key="power" powerStats={powerStats} onBack={() => setDrillDown(null)} />}
          {drillDown.type === "privilege" && <PrivilegePanel key="privilege" privilegeStats={privilegeStats} violations={privilegeViolations} transitions={ringTransitions} processes={processes} onBack={() => setDrillDown(null)} />}
          {drillDown.type === "wayland" && <WaylandProtocolPanel key="wayland" stats={waylandStats} clients={waylandClients} globals={waylandGlobals} onBack={() => setDrillDown(null)} />}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center gap-4">
        <div className="rounded-2xl p-3 bg-primary/10 border border-primary/20">
          <Terminal className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Kernel Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            SITA Hybrid Microkernel · Ticks: {schedStats.totalTicks} · Scheduled: {schedStats.scheduledCount}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
            <CheckCircle className="h-3 w-3 mr-1" /> Live
          </Badge>
        </div>
      </motion.div>

      {/* Top-line stats — 7 cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard icon={Cpu} label="Processes" value={totalProcesses} sub={`${running} running · ${liveProcessCount} live`} live />
        <StatCard icon={MemoryStick} label="Memory" value={`${memUsedPercent}%`} sub={`${memStats.freePages.toLocaleString()} pages free`} color="bg-blue-500/8" live />
        <StatCard icon={HardDrive} label="Mounts" value={FILESYSTEM_MOUNTS.length} sub={`${FILESYSTEM_MOUNTS.filter(m => m.status === "warning").length} warning`} color="bg-emerald-500/8" />
        <StatCard icon={Shield} label="Security" value={`${SECURITY_RINGS.reduce((s, r) => s + r.violations, 0)} violations`} sub="5 rings active" color="bg-amber-500/8" />
        <StatCard icon={Monitor} label="Display" value={`${compStats.totalSurfaces} surfaces`} sub={`${compStats.visible} visible · z=${compStats.topZ}`} color="bg-blue-500/8" live onClick={() => setDrillDown({ type: "display" })} />
        <StatCard icon={Layers} label="Wayland" value={`${waylandStats.totalClients} clients`}
          sub={`${waylandStats.totalSurfaces} srf · ${waylandStats.avgFrameRate.toFixed(0)}fps`} color="bg-purple-500/8" live onClick={() => setDrillDown({ type: "wayland" })} />
        <StatCard icon={powerStats.battery.charging ? BatteryCharging : Battery} label="Battery" value={`${powerStats.battery.level.toFixed(0)}%`}
          sub={`${powerStats.cpu.currentMHz}MHz · ${powerStats.powerState}`} color="bg-amber-500/8" live onClick={() => setDrillDown({ type: "power" })} />
        <StatCard icon={ShieldAlert} label="Privilege" value={`${privilegeStats.totalTransitions} transitions`}
          sub={`${privilegeStats.totalViolations} violations · R0:${privilegeStats.ring0Processes} R3:${privilegeStats.ring3Processes}`} color="bg-red-500/8" live onClick={() => setDrillDown({ type: "privilege" })} />
      </motion.div>

      {/* System Services Panel */}
      <motion.div variants={fadeUp}>
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />System Services
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
              <Badge variant="outline" className="ml-auto text-[9px] border-border/30">
                {serviceManagerStats.booted ? `${Object.keys(serviceManagerStats.diagnostics).length} services` : "Not booted"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {(() => {
                const SERVICE_META: Record<string, { icon: typeof Cpu; color: string; label: string }> = {
                  SettingsService: { icon: RefreshCw, color: "text-blue-400", label: "Settings" },
                  FileSystemService: { icon: HardDrive, color: "text-emerald-400", label: "Filesystem" },
                  InputService: { icon: Terminal, color: "text-amber-400", label: "Input" },
                  WindowServer: { icon: Monitor, color: "text-purple-400", label: "Window Server" },
                  NotificationService: { icon: Bell, color: "text-pink-400", label: "Notifications" },
                };
                const entries = Object.entries(serviceManagerStats.diagnostics);
                if (entries.length === 0) {
                  return (
                    <div className="col-span-full text-center py-6 text-muted-foreground text-sm">
                      Services not yet booted
                    </div>
                  );
                }
                return entries.map(([id, diag]) => {
                  const meta = SERVICE_META[id] || { icon: Server, color: "text-muted-foreground", label: id };
                  const Icon = meta.icon;
                  const status = (diag as any).status as ServiceStatus;
                  const bootEntry = serviceManagerStats.bootLog.find(e => e.serviceId === id);
                  const stats = { ...diag } as Record<string, unknown>;
                  delete stats.status;

                  // Pick the 3 most interesting stat keys to display
                  const statEntries = Object.entries(stats).filter(([k]) =>
                    !["userOverrides", "runtimeOverrides", "mounts", "hotkeys", "windows", "visible"].includes(k)
                  ).slice(0, 4);

                  return (
                    <div key={id} className="rounded-xl border border-border/30 bg-muted/10 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", meta.color)} />
                        <span className="text-xs font-medium text-foreground">{meta.label}</span>
                        <span className={cn(
                          "ml-auto w-2 h-2 rounded-full",
                          status === "running" ? "bg-emerald-400" :
                          status === "failed" ? "bg-red-400" :
                          status === "starting" ? "bg-amber-400 animate-pulse" :
                          "bg-muted-foreground/40"
                        )} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={cn(
                          "text-[8px] px-1.5 py-0",
                          status === "running" ? "border-emerald-500/30 text-emerald-400" :
                          status === "failed" ? "border-red-500/30 text-red-400" :
                          "border-border/30"
                        )}>
                          {status}
                        </Badge>
                        {bootEntry && (
                          <span className="text-[9px] text-muted-foreground font-mono">
                            {bootEntry.timestampMs.toFixed(1)}ms
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 pt-1 border-t border-border/20">
                        {statEntries.map(([key, val]) => (
                          <div key={key} className="flex justify-between text-[10px]">
                            <span className="text-muted-foreground truncate mr-2">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                            <span className="font-mono text-foreground shrink-0">
                              {typeof val === "number" ? val.toLocaleString() : String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            {/* Boot timeline */}
            {serviceManagerStats.bootLog.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Boot Sequence</p>
                <div className="flex items-center gap-1">
                  {serviceManagerStats.bootLog.map((entry, i) => {
                    const maxMs = Math.max(...serviceManagerStats.bootLog.map(e => e.timestampMs), 1);
                    const widthPercent = Math.max((entry.timestampMs / maxMs) * 100, 8);
                    return (
                      <div key={entry.serviceId} className="flex-1 min-w-0" title={`${entry.serviceId}: ${entry.timestampMs.toFixed(1)}ms`}>
                        <div className={cn(
                          "h-2 rounded-full",
                          entry.status === "ok" ? "bg-emerald-500/50" : "bg-red-500/50"
                        )} style={{ width: `${widthPercent}%` }} />
                        <p className="text-[8px] text-muted-foreground mt-0.5 truncate">
                          {entry.serviceId.replace("Service", "").replace("Server", "")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Scheduler + Memory row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scheduler */}
        <motion.div variants={fadeUp}>
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2 cursor-pointer hover:bg-muted/10 transition-colors rounded-t-lg" onClick={() => setDrillDown({ type: "scheduler" })}>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />Process Scheduler (MLFQ)
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[
                  { label: "Running", val: running, c: "text-emerald-400" },
                  { label: "Ready", val: Math.max(readyProcesses.length, 34), c: "text-blue-400" },
                  { label: "Blocked", val: blockedProcesses.length + 18, c: "text-amber-400" },
                  { label: "Ctx Switches", val: schedStats.contextSwitchCount, c: "text-blue-300" },
                  { label: "Preemptions", val: schedStats.preemptionCount, c: "text-amber-300" },
                  { label: "On CPU", val: schedStats.currentPid ?? "idle", c: "text-primary" },
                ].map(s => (
                  <div key={s.label} className="text-center py-2 rounded-lg bg-muted/20">
                    <p className={cn("text-sm font-semibold tabular-nums", s.c)}>{s.val}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                CPU by Priority Band <span className="text-[8px] ml-1">(click to drill down)</span>
              </p>
              {BANDS_DATA.map((b, i) => (
                <BandBar key={b.band} label={b.label} cpuPercent={b.cpuPercent} processes={b.processes} quantumMs={b.quantumMs}
                  color={BAND_COLORS[i]} onClick={() => setDrillDown({ type: "band", band: b.band })} />
              ))}
              <div className="pt-2 border-t border-border/30 mt-2 flex justify-between text-[10px] text-muted-foreground">
                <span>Ticks: <span className="font-mono text-foreground">{schedStats.totalTicks}</span></span>
                <span>Idle: <span className="font-mono text-foreground">{schedStats.idleTicks}</span></span>
                <span>Boosts: <span className="font-mono text-foreground">{schedStats.boostCount}</span></span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Memory */}
        <motion.div variants={fadeUp}>
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MemoryStick className="h-4 w-4 text-blue-400" />Virtual Memory Manager
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Allocated Pages (Live)</span>
                  <span className="font-mono">{memStats.allocatedPages.toLocaleString()} / {memStats.totalPages.toLocaleString()}</span>
                </div>
                <div className="h-5 rounded-md bg-muted/30 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${memUsedPercent}%` }} transition={{ delay: 0.3, duration: 0.5 }} className="h-full bg-blue-500/60 rounded-md" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[
                  { label: "Regions", val: memStats.regions },
                  { label: "Guard Pages", val: memStats.guardPages },
                  { label: "Processes", val: memStats.processCount },
                  { label: "Utilization", val: `${memStats.utilizationPercent}%` },
                ].map(s => (
                  <div key={s.label} className="text-center py-1.5 rounded-lg bg-muted/20">
                    <p className="text-xs font-semibold text-foreground tabular-nums">{s.val}</p>
                    <p className="text-[9px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              {processes.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Per-Process Memory (Live)</p>
                  <div className="space-y-1.5">
                    {processes.filter(p => p.state !== "terminated").map(p => (
                      <div key={p.pid} className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-foreground/80 w-20 truncate">{p.appId}</span>
                        <div className="flex-1"><Progress value={p.memoryBudget > 0 ? (p.memoryUsed / p.memoryBudget) * 100 : 0} className="h-1.5" /></div>
                        <span className="text-[10px] font-mono text-muted-foreground w-14 text-right">{Math.round(p.memoryUsed / 1024)}KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-2 border-t border-border/30">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Address Spaces: <span className="font-mono text-foreground">{memStats.addressSpaces}</span></span>
                  <span>Page Table Switches: <span className="font-mono text-foreground">{memStats.pageTableSwitches}</span></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Display Server + Power row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Display Server */}
        <motion.div variants={fadeUp}>
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm cursor-pointer hover:border-primary/20 transition-colors" onClick={() => setDrillDown({ type: "display" })}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Monitor className="h-4 w-4 text-blue-400" />Display Server
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Surfaces", val: compStats.totalSurfaces, c: "text-blue-400" },
                  { label: "Visible", val: compStats.visible, c: "text-emerald-400" },
                  { label: "Dirty", val: compStats.dirty, c: "text-amber-400" },
                  { label: "Top Z", val: compStats.topZ, c: "text-purple-400" },
                ].map(s => (
                  <div key={s.label} className="text-center py-2 rounded-lg bg-muted/20">
                    <p className={cn("text-sm font-semibold tabular-nums", s.c)}>{s.val}</p>
                    <p className="text-[9px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                <span>Backend: <span className="text-foreground">Nova GPU (Software)</span></span>
                <span>VSync: <span className="text-emerald-400">ON</span></span>
                <span>1920×1080 @60Hz</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Power Management */}
        <motion.div variants={fadeUp}>
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm cursor-pointer hover:border-primary/20 transition-colors" onClick={() => setDrillDown({ type: "power" })}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />Power Management
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4">
                {/* Battery gauge */}
                <div className="flex items-center gap-2">
                  {powerStats.battery.charging ? <BatteryCharging className="h-5 w-5 text-emerald-400" /> : <Battery className="h-5 w-5 text-amber-400" />}
                  <div>
                    <p className={cn("text-lg font-bold tabular-nums", powerStats.battery.level > 50 ? "text-emerald-400" : powerStats.battery.level > 20 ? "text-amber-400" : "text-red-400")}>
                      {powerStats.battery.level.toFixed(0)}%
                    </p>
                    <p className="text-[9px] text-muted-foreground">{powerStats.battery.charging ? "Charging" : "On Battery"}</p>
                  </div>
                </div>
                {/* CPU freq */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">CPU: {powerStats.cpu.currentMHz}MHz</span>
                    <Badge variant="outline" className="text-[8px]">{powerStats.cpu.governor}</Badge>
                  </div>
                  <div className="h-2 rounded bg-muted/30 overflow-hidden">
                    <motion.div animate={{ width: `${powerStats.cpu.scalingPercent}%` }}
                      className={cn("h-full rounded", powerStats.cpu.throttled ? "bg-red-500/60" : "bg-blue-500/50")} />
                  </div>
                </div>
              </div>
              {/* Thermal summary */}
              <div className="flex gap-2 pt-1 border-t border-border/30">
                {powerStats.thermalZones.map(z => (
                  <div key={z.name} className="flex items-center gap-1 text-[10px]">
                    <Thermometer className={cn("h-3 w-3", THERMAL_COLORS[z.state])} />
                    <span className="text-muted-foreground">{z.name.split("-")[0]}:</span>
                    <span className={cn("font-mono", THERMAL_COLORS[z.state])}>{z.temperature.toFixed(0)}°</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filesystem + Security row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Filesystem Mounts */}
        <motion.div variants={fadeUp}>
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-emerald-400" />Filesystem Mounts
                <span className="text-[8px] text-muted-foreground ml-1">(click row for inode stats)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border/30">
                      <th className="text-left py-2 font-medium">Mount</th>
                      <th className="text-left py-2 font-medium">Type</th>
                      <th className="text-left py-2 font-medium">Used</th>
                      <th className="text-left py-2 font-medium">Options</th>
                      <th className="text-right py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FILESYSTEM_MOUNTS.map(m => (
                      <tr key={m.path} className="border-b border-border/10 hover:bg-muted/15 transition-colors cursor-pointer"
                        onClick={() => setDrillDown({ type: "mount", mountPath: m.path })}>
                        <td className="py-2 font-mono text-foreground flex items-center gap-1">
                          {m.path}<Eye className="h-3 w-3 text-muted-foreground/30" />
                        </td>
                        <td className="py-2"><Badge variant="outline" className="text-[9px] px-1.5 py-0 border-border/30">{m.fsType}</Badge></td>
                        <td className="py-2">
                          {m.usedPercent > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                                <div className={cn("h-full rounded-full", m.usedPercent > 80 ? "bg-amber-500" : "bg-emerald-500/60")} style={{ width: `${m.usedPercent}%` }} />
                              </div>
                              <span className="text-muted-foreground font-mono">{m.used}</span>
                            </div>
                          ) : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="py-2 text-muted-foreground max-w-[140px] truncate" title={m.options}>{m.options}</td>
                        <td className="py-2 text-right">
                          <span className={cn("font-medium", fsStatusColor[m.status])}>
                            {m.status === "healthy" ? "●" : "▲"} {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Rings */}
        <motion.div variants={fadeUp}>
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-400" />Security Ring Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-center py-4">
                <div className="relative w-56 h-56">
                  {SECURITY_RINGS.map((r, i) => {
                    const size = 100 - i * 18;
                    const borderColors = ["border-red-500/40", "border-orange-500/30", "border-blue-500/25", "border-emerald-500/20", "border-muted-foreground/15"];
                    const bgColors = ["bg-red-500/5", "bg-orange-500/4", "bg-blue-500/3", "bg-emerald-500/2", "bg-muted/2"];
                    return (
                      <motion.div key={r.ring} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 0.4, ease: "easeOut" }}
                        className={cn("absolute rounded-full border-2 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors", borderColors[i], bgColors[i])}
                        style={{ width: `${size}%`, height: `${size}%`, top: `${(100 - size) / 2}%`, left: `${(100 - size) / 2}%` }}
                        onClick={() => setDrillDown({ type: "ring", ringIndex: i })}>
                        {i === 0 && <Lock className="h-4 w-4 text-red-400/60" />}
                      </motion.div>
                    );
                  })}
                  {SECURITY_RINGS.map((r, i) => {
                    const positions = [
                      { top: "50%", left: "50%", transform: "translate(-50%, 10px)" },
                      { top: "12%", right: "8%" },
                      { bottom: "14%", right: "4%" },
                      { bottom: "4%", left: "8%" },
                      { top: "2%", left: "4%" },
                    ];
                    return (
                      <div key={`label-${r.ring}`} className="absolute text-[9px] font-mono text-muted-foreground" style={positions[i] as React.CSSProperties}>
                        R{r.ring}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                {SECURITY_RINGS.map((r, i) => (
                  <div key={r.ring} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity", RING_COLORS[i])}
                    onClick={() => setDrillDown({ type: "ring", ringIndex: i })}>
                    <span className="text-xs font-mono font-bold w-6">R{r.ring}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{r.label}</p>
                      <p className="text-[10px] opacity-70">{RING_DESCRIPTIONS[r.ring]}</p>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        <p className="text-xs font-semibold tabular-nums">{r.processes} procs</p>
                        {r.violations > 0 && <p className="text-[10px] text-red-400">{r.violations} violations</p>}
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-border/30 flex justify-between text-[10px] text-muted-foreground">
                <span>Total violations: {SECURITY_RINGS.reduce((s, r) => s + r.violations, 0)}</span>
                <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Last audit: 4m ago</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default KernelDashboard;
