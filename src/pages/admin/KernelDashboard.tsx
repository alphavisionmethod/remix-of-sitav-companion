// ═══════════════════════════════════════════════════════════════
// SITA OS — Kernel Dashboard
// Admin visualization of scheduler, memory, filesystem & security
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Cpu, MemoryStick, HardDrive, Shield, Activity, Layers,
  Zap, Clock, Lock, Server, Database, AlertTriangle, CheckCircle,
  RefreshCw, Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PriorityBand, BAND_CONFIG } from "@/lib/core-services/kernel/process-scheduler";
import { TrustRing, RING_CONFIG } from "@/lib/core-services/kernel/sandbox-engine";

// ── Animation Variants ───────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

// ── Demo Data ────────────────────────────────────────────────

const SCHEDULER_STATS = {
  totalProcesses: 147,
  running: 12,
  ready: 34,
  blocked: 18,
  sleeping: 78,
  zombie: 3,
  terminated: 2,
  contextSwitches: 14832,
  avgQuantumUtilization: 0.73,
  uptime: "14d 7h 23m",
  ticksPerSecond: 1000,
  bands: [
    { band: PriorityBand.RT_CRITICAL, processes: 4, cpuPercent: 8.2, label: BAND_CONFIG[PriorityBand.RT_CRITICAL].label },
    { band: PriorityBand.RT_NORMAL, processes: 11, cpuPercent: 15.4, label: BAND_CONFIG[PriorityBand.RT_NORMAL].label },
    { band: PriorityBand.INTERACTIVE, processes: 38, cpuPercent: 42.1, label: BAND_CONFIG[PriorityBand.INTERACTIVE].label },
    { band: PriorityBand.BATCH, processes: 67, cpuPercent: 28.7, label: BAND_CONFIG[PriorityBand.BATCH].label },
    { band: PriorityBand.IDLE, processes: 27, cpuPercent: 5.6, label: BAND_CONFIG[PriorityBand.IDLE].label },
  ],
};

const MEMORY_STATS = {
  totalPages: 262144,
  usedPages: 178432,
  freePages: 83712,
  cachedPages: 45200,
  dirtyPages: 1204,
  swapTotal: 131072,
  swapUsed: 8400,
  pageFaults: 2341,
  majorFaults: 12,
  cowForks: 892,
  slabAllocators: [
    { name: "inode_cache", objSize: 512, active: 4200, total: 8192 },
    { name: "dentry_cache", objSize: 256, active: 12400, total: 16384 },
    { name: "task_struct", objSize: 1024, active: 147, total: 512 },
    { name: "buffer_head", objSize: 128, active: 8700, total: 16384 },
  ],
  buddyFreeBlocks: [
    { order: 0, count: 12400 },
    { order: 1, count: 6200 },
    { order: 2, count: 3100 },
    { order: 3, count: 1550 },
    { order: 4, count: 780 },
    { order: 5, count: 390 },
    { order: 6, count: 112 },
    { order: 7, count: 48 },
    { order: 8, count: 16 },
    { order: 9, count: 4 },
    { order: 10, count: 1 },
  ],
};

const FILESYSTEM_MOUNTS = [
  { path: "/", fsType: "sitafs", device: "/dev/sda1", size: "256 GB", used: "142 GB", usedPercent: 55, options: "rw,noatime,compress=zstd", status: "healthy" as const },
  { path: "/home", fsType: "sitafs", device: "/dev/sda2", size: "512 GB", used: "234 GB", usedPercent: 46, options: "rw,noatime,cow,encrypt", status: "healthy" as const },
  { path: "/tmp", fsType: "tmpfs", device: "tmpfs", size: "4 GB", used: "1.2 GB", usedPercent: 30, options: "rw,nosuid,nodev", status: "healthy" as const },
  { path: "/proc", fsType: "procfs", device: "proc", size: "—", used: "—", usedPercent: 0, options: "ro,nosuid,nodev", status: "healthy" as const },
  { path: "/sys", fsType: "sysfs", device: "sys", size: "—", used: "—", usedPercent: 0, options: "ro,nosuid,nodev", status: "healthy" as const },
  { path: "/dev", fsType: "devtmpfs", device: "udev", size: "8 GB", used: "0 GB", usedPercent: 0, options: "rw,nosuid", status: "healthy" as const },
  { path: "/var/log", fsType: "sitafs", device: "/dev/sda3", size: "32 GB", used: "28 GB", usedPercent: 88, options: "rw,noatime,compress=lz4", status: "warning" as const },
  { path: "/mnt/vault", fsType: "sitafs", device: "/dev/sdb1", size: "1 TB", used: "120 GB", usedPercent: 12, options: "rw,encrypt,integrity", status: "healthy" as const },
];

const SECURITY_RINGS = [
  { ring: TrustRing.KERNEL, ...RING_CONFIG[TrustRing.KERNEL], processes: 4, violations: 0 },
  { ring: TrustRing.TRUSTED, ...RING_CONFIG[TrustRing.TRUSTED], processes: 18, violations: 0 },
  { ring: TrustRing.VERIFIED, ...RING_CONFIG[TrustRing.VERIFIED], processes: 42, violations: 2 },
  { ring: TrustRing.SANDBOXED, ...RING_CONFIG[TrustRing.SANDBOXED], processes: 56, violations: 5 },
  { ring: TrustRing.UNTRUSTED, ...RING_CONFIG[TrustRing.UNTRUSTED], processes: 27, violations: 12 },
];

// ── Subcomponents ────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, color }: {
  icon: typeof Cpu; label: string; value: string | number; sub?: string; color?: string;
}) => (
  <motion.div variants={fadeUp}>
    <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("rounded-xl p-2.5 bg-primary/8", color)}>
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-lg font-semibold text-foreground tabular-nums">{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const BandBar = ({ label, cpuPercent, processes, quantumMs, color }: {
  label: string; cpuPercent: number; processes: number; quantumMs: number; color: string;
}) => (
  <div className="flex items-center gap-3 py-2">
    <div className="w-28 shrink-0">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground">{processes} procs · {quantumMs}ms quantum</p>
    </div>
    <div className="flex-1">
      <div className="h-6 rounded-md bg-muted/30 overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${cpuPercent}%` }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className={cn("h-full rounded-md", color)}
        />
        <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-mono text-foreground/70">
          {cpuPercent.toFixed(1)}%
        </span>
      </div>
    </div>
  </div>
);

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

// ── Main Dashboard ───────────────────────────────────────────

const KernelDashboard = () => {
  const memUsedPercent = useMemo(() =>
    Math.round((MEMORY_STATS.usedPages / MEMORY_STATS.totalPages) * 100),
  []);
  const swapUsedPercent = useMemo(() =>
    Math.round((MEMORY_STATS.swapUsed / MEMORY_STATS.swapTotal) * 100),
  []);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center gap-4">
        <div className="rounded-2xl p-3 bg-primary/10 border border-primary/20">
          <Terminal className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Kernel Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            SITA Hybrid Microkernel · Uptime {SCHEDULER_STATS.uptime} · {SCHEDULER_STATS.ticksPerSecond} Hz tick
          </p>
        </div>
        <Badge variant="outline" className="ml-auto border-emerald-500/30 text-emerald-400">
          <CheckCircle className="h-3 w-3 mr-1" /> Nominal
        </Badge>
      </motion.div>

      {/* Top-line stats */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Cpu} label="Processes" value={SCHEDULER_STATS.totalProcesses} sub={`${SCHEDULER_STATS.running} running`} />
        <StatCard icon={MemoryStick} label="Memory" value={`${memUsedPercent}%`} sub={`${MEMORY_STATS.freePages.toLocaleString()} pages free`} color="bg-blue-500/8" />
        <StatCard icon={HardDrive} label="Mounts" value={FILESYSTEM_MOUNTS.length} sub={`${FILESYSTEM_MOUNTS.filter(m => m.status === "warning").length} warning`} color="bg-emerald-500/8" />
        <StatCard icon={Shield} label="Security" value={`${SECURITY_RINGS.reduce((s, r) => s + r.violations, 0)} violations`} sub="19 total" color="bg-amber-500/8" />
      </motion.div>

      {/* Scheduler + Memory row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scheduler */}
        <motion.div variants={fadeUp}>
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                Process Scheduler (MLFQ)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[
                  { label: "Running", val: SCHEDULER_STATS.running, c: "text-emerald-400" },
                  { label: "Ready", val: SCHEDULER_STATS.ready, c: "text-blue-400" },
                  { label: "Blocked", val: SCHEDULER_STATS.blocked, c: "text-amber-400" },
                  { label: "Sleeping", val: SCHEDULER_STATS.sleeping, c: "text-muted-foreground" },
                  { label: "Zombie", val: SCHEDULER_STATS.zombie, c: "text-red-400" },
                  { label: "Ctx Switches", val: SCHEDULER_STATS.contextSwitches.toLocaleString(), c: "text-foreground" },
                ].map(s => (
                  <div key={s.label} className="text-center py-2 rounded-lg bg-muted/20">
                    <p className={cn("text-sm font-semibold tabular-nums", s.c)}>{s.val}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">CPU by Priority Band</p>
              {SCHEDULER_STATS.bands.map((b, i) => (
                <BandBar key={b.band} label={b.label} cpuPercent={b.cpuPercent} processes={b.processes} quantumMs={BAND_CONFIG[b.band].quantumMs} color={BAND_COLORS[i]} />
              ))}

              <div className="pt-2 border-t border-border/30 mt-2">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Avg quantum utilization</span>
                  <span className="font-mono">{(SCHEDULER_STATS.avgQuantumUtilization * 100).toFixed(0)}%</span>
                </div>
                <Progress value={SCHEDULER_STATS.avgQuantumUtilization * 100} className="h-1.5 mt-1" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Memory */}
        <motion.div variants={fadeUp}>
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MemoryStick className="h-4 w-4 text-blue-400" />
                Virtual Memory Manager
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Physical memory bar */}
              <div>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Physical Pages</span>
                  <span className="font-mono">{MEMORY_STATS.usedPages.toLocaleString()} / {MEMORY_STATS.totalPages.toLocaleString()}</span>
                </div>
                <div className="h-5 rounded-md bg-muted/30 overflow-hidden flex">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((MEMORY_STATS.usedPages - MEMORY_STATS.cachedPages) / MEMORY_STATS.totalPages) * 100}%` }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="h-full bg-blue-500/60"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(MEMORY_STATS.cachedPages / MEMORY_STATS.totalPages) * 100}%` }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="h-full bg-blue-500/25"
                  />
                </div>
                <div className="flex gap-4 mt-1 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500/60" />Active</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500/25" />Cached</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-muted/30" />Free</span>
                </div>
              </div>

              {/* Swap */}
              <div>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Swap</span>
                  <span className="font-mono">{swapUsedPercent}% used</span>
                </div>
                <Progress value={swapUsedPercent} className="h-1.5" />
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[
                  { label: "Page Faults", val: MEMORY_STATS.pageFaults.toLocaleString() },
                  { label: "Major Faults", val: MEMORY_STATS.majorFaults },
                  { label: "Dirty Pages", val: MEMORY_STATS.dirtyPages.toLocaleString() },
                  { label: "CoW Forks", val: MEMORY_STATS.cowForks },
                ].map(s => (
                  <div key={s.label} className="text-center py-1.5 rounded-lg bg-muted/20">
                    <p className="text-xs font-semibold text-foreground tabular-nums">{s.val}</p>
                    <p className="text-[9px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* SLAB allocators */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">SLAB Allocators</p>
                <div className="space-y-1.5">
                  {MEMORY_STATS.slabAllocators.map(slab => (
                    <div key={slab.name} className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-foreground/80 w-28 truncate">{slab.name}</span>
                      <div className="flex-1">
                        <Progress value={(slab.active / slab.total) * 100} className="h-1.5" />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground w-16 text-right">
                        {slab.active}/{slab.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buddy allocator */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Buddy Free Blocks</p>
                <div className="flex items-end gap-0.5 h-12">
                  {MEMORY_STATS.buddyFreeBlocks.map((b, i) => {
                    const maxCount = Math.max(...MEMORY_STATS.buddyFreeBlocks.map(x => x.count));
                    const height = Math.max(4, (b.count / maxCount) * 100);
                    return (
                      <motion.div
                        key={b.order}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
                        className="flex-1 bg-blue-500/40 rounded-t-sm"
                        title={`Order ${b.order}: ${b.count} blocks`}
                      />
                    );
                  })}
                </div>
                <div className="flex gap-0.5">
                  {MEMORY_STATS.buddyFreeBlocks.map(b => (
                    <span key={b.order} className="flex-1 text-center text-[8px] text-muted-foreground">{b.order}</span>
                  ))}
                </div>
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
                <HardDrive className="h-4 w-4 text-emerald-400" />
                Filesystem Mounts
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
                      <tr key={m.path} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                        <td className="py-2 font-mono text-foreground">{m.path}</td>
                        <td className="py-2">
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-border/30">
                            {m.fsType}
                          </Badge>
                        </td>
                        <td className="py-2">
                          {m.usedPercent > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    m.usedPercent > 80 ? "bg-amber-500" : "bg-emerald-500/60"
                                  )}
                                  style={{ width: `${m.usedPercent}%` }}
                                />
                              </div>
                              <span className="text-muted-foreground font-mono">{m.used}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2 text-muted-foreground max-w-[140px] truncate" title={m.options}>
                          {m.options}
                        </td>
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
                <Shield className="h-4 w-4 text-amber-400" />
                Security Ring Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Concentric rings visualization */}
              <div className="flex justify-center py-4">
                <div className="relative w-56 h-56">
                  {SECURITY_RINGS.map((r, i) => {
                    const size = 100 - i * 18;
                    const borderColors = ["border-red-500/40", "border-orange-500/30", "border-blue-500/25", "border-emerald-500/20", "border-muted-foreground/15"];
                    const bgColors = ["bg-red-500/5", "bg-orange-500/4", "bg-blue-500/3", "bg-emerald-500/2", "bg-muted/2"];
                    return (
                      <motion.div
                        key={r.ring}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 0.4, ease: "easeOut" }}
                        className={cn(
                          "absolute rounded-full border-2 flex items-center justify-center",
                          borderColors[i],
                          bgColors[i]
                        )}
                        style={{
                          width: `${size}%`,
                          height: `${size}%`,
                          top: `${(100 - size) / 2}%`,
                          left: `${(100 - size) / 2}%`,
                        }}
                      >
                        {i === 0 && (
                          <Lock className="h-4 w-4 text-red-400/60" />
                        )}
                      </motion.div>
                    );
                  })}
                  {/* Ring labels */}
                  {SECURITY_RINGS.map((r, i) => {
                    const positions = [
                      { top: "50%", left: "50%", transform: "translate(-50%, 10px)" },
                      { top: "12%", right: "8%" },
                      { bottom: "14%", right: "4%" },
                      { bottom: "4%", left: "8%" },
                      { top: "2%", left: "4%" },
                    ];
                    return (
                      <div
                        key={`label-${r.ring}`}
                        className="absolute text-[9px] font-mono text-muted-foreground"
                        style={positions[i] as React.CSSProperties}
                      >
                        R{r.ring}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ring details */}
              <div className="space-y-2">
                {SECURITY_RINGS.map((r, i) => (
                  <div key={r.ring} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg border", RING_COLORS[i])}>
                    <span className="text-xs font-mono font-bold w-6">R{r.ring}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{r.label}</p>
                      <p className="text-[10px] opacity-70">{r.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold tabular-nums">{r.processes} procs</p>
                      {r.violations > 0 && (
                        <p className="text-[10px] text-red-400">{r.violations} violations</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Security summary */}
              <div className="pt-2 border-t border-border/30 flex justify-between text-[10px] text-muted-foreground">
                <span>Total violations: {SECURITY_RINGS.reduce((s, r) => s + r.violations, 0)}</span>
                <span className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" /> Last audit: 4m ago
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default KernelDashboard;
