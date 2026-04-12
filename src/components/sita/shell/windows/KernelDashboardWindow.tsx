// ═══════════════════════════════════════════════════════════════
// Nova OS — Kernel Dashboard Window
// Real-time visualization of scheduler, memory, and syscalls
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Cpu, HardDrive, Activity, Layers, Zap, Timer,
  Shield, Clock, AlertTriangle, Monitor, Wifi, Battery,
  WifiOff, BatteryCharging, Signal, FlaskConical, Play, Square, X,
} from "lucide-react";
import {
  AppLayout,
  VStack, HStack,
} from "@/lib/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard,
  NovaSectionLabel, NovaBadge,
} from "@/lib/nova-sdk/ui/components";
import { APP_COMPONENTS } from "@/lib/design-system/app-window-system";
import { useWindowManagerContext } from "@/contexts/WindowManagerContext";
import { cn } from "@/lib/utils";
import { NovaCanvasChart, type ChartSeries } from "./NovaCanvasChart";
import { NovaCanvasBars, type BarItem } from "./NovaCanvasBars";
import type { NovaColor } from "@/lib/nova-sdk/graphics/context";
import { Scheduler, type SchedulerStats, type SchedulerEvent } from "@/lib/nova-sdk/kernel/scheduler";
import { MemoryManager, type MemoryStats, PAGE_SIZE } from "@/lib/nova-sdk/kernel/memory-manager";
import { ProcessTable, type Process, type PriorityBand } from "@/lib/nova-sdk/kernel/process-manager";
import { getSyscallStats, getSyscallLog, getSyscallMetrics, type SyscallLogEntry, type SyscallTypeMetrics } from "@/lib/nova-sdk/kernel/syscall";
import { DriverManager, type DeviceDriver } from "@/lib/nova-sdk/kernel/drivers";

// ── Colors ───────────────────────────────────────────────────

const COLORS = {
  rtCritical: { h: 0, s: 75, l: 55 } as NovaColor,
  rtNormal:   { h: 25, s: 80, l: 55 } as NovaColor,
  interactive:{ h: 210, s: 80, l: 55 } as NovaColor,
  batch:      { h: 150, s: 60, l: 50 } as NovaColor,
  idle:       { h: 0, s: 0, l: 45 } as NovaColor,
  memUsed:    { h: 265, s: 65, l: 55 } as NovaColor,
  memFree:    { h: 152, s: 55, l: 48 } as NovaColor,
  syscallErr: { h: 0, s: 75, l: 55 } as NovaColor,
  ticks:      { h: 265, s: 65, l: 55 } as NovaColor,
  switches:   { h: 38, s: 85, l: 58 } as NovaColor,
};

const BAND_COLORS: Record<PriorityBand, NovaColor> = {
  "RT-Critical": COLORS.rtCritical,
  "RT-Normal":   COLORS.rtNormal,
  "Interactive":  COLORS.interactive,
  "Batch":        COLORS.batch,
  "Idle":         COLORS.idle,
};

type Tab = "scheduler" | "memory" | "syscalls" | "drivers" | "stress";

const TABS: { id: Tab; label: string; icon: typeof Cpu }[] = [
  { id: "scheduler", label: "Scheduler", icon: Cpu },
  { id: "memory",    label: "Memory",    icon: HardDrive },
  { id: "syscalls",  label: "Syscalls",  icon: Zap },
  { id: "drivers",   label: "Drivers",   icon: Monitor },
  { id: "stress",    label: "Stress Test", icon: FlaskConical },
];

const MAX_HISTORY = 60;

function pushHistory(arr: number[], val: number): number[] {
  const next = [...arr, val];
  if (next.length > MAX_HISTORY) next.shift();
  return next;
}

// ── Main Component ───────────────────────────────────────────

export function KernelDashboardWindow() {
  const [tab, setTab] = useState<Tab>("scheduler");
  const [paused, setPaused] = useState(false);

  const [schedStats, setSchedStats] = useState<SchedulerStats | null>(null);
  const [schedEvents, setSchedEvents] = useState<readonly SchedulerEvent[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [tickHistory, setTickHistory] = useState<number[]>([]);
  const [switchHistory, setSwitchHistory] = useState<number[]>([]);

  const [memStats, setMemStats] = useState<MemoryStats | null>(null);
  const [memHistory, setMemHistory] = useState<number[]>([]);

  const [sysStats, setSysStats] = useState<ReturnType<typeof getSyscallStats> | null>(null);
  const [sysLog, setSysLog] = useState<readonly SyscallLogEntry[]>([]);
  const [sysMetrics, setSysMetrics] = useState<SyscallTypeMetrics[]>([]);

  const [driverDiags, setDriverDiags] = useState<{ driver: DeviceDriver; diag: Record<string, unknown> }[]>([]);
  const [batteryHistory, setBatteryHistory] = useState<number[]>([]);
  const [networkHistory, setNetworkHistory] = useState<number[]>([]);

  useEffect(() => {
    if (paused) return;
    const iv = setInterval(() => {
      const ss = Scheduler.getStats();
      setSchedStats(ss);
      setSchedEvents(Scheduler.getEventLog(30));
      setProcesses(ProcessTable.listProcesses().filter(p => p.state !== "terminated"));
      setTickHistory(prev => pushHistory(prev, ss.totalTicks));
      setSwitchHistory(prev => pushHistory(prev, ss.contextSwitchCount));

      const ms = MemoryManager.getStats();
      setMemStats(ms);
      setMemHistory(prev => pushHistory(prev, ms.utilizationPercent));

      setSysStats(getSyscallStats());
      setSysLog(getSyscallLog().slice(-30));
      setSysMetrics(getSyscallMetrics());

      const allDrivers = DriverManager.getAllDrivers();
      setDriverDiags(allDrivers.map(d => ({ driver: d, diag: d.getDiagnostics() })));
      const battDiag = DriverManager.getDriver("drv-battery")?.getDiagnostics();
      if (battDiag) setBatteryHistory(prev => pushHistory(prev, (battDiag as any).level ?? 0));
      const netDiag = DriverManager.getDriver("drv-network")?.getDiagnostics();
      if (netDiag) setNetworkHistory(prev => pushHistory(prev, (netDiag as any).downlinkMbps ?? 0));
    }, 500);
    return () => clearInterval(iv);
  }, [paused]);

  return (
    <AppLayout
      toolbar={
        <HStack spacing="tight" className="w-full items-center px-2">
          <HStack spacing="micro" className="flex-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  APP_COMPONENTS.button.base,
                  tab === t.id ? APP_COMPONENTS.button.primary : APP_COMPONENTS.button.ghost,
                )}
              >
                <t.icon size={13} className="inline mr-1" />
                <span className="text-[11px]">{t.label}</span>
              </button>
            ))}
          </HStack>
          <NovaButton
            variant={paused ? "primary" : "ghost"}
            onClick={() => setPaused(p => !p)}
          >
            {paused ? "Resume" : "Pause"}
          </NovaButton>
        </HStack>
      }
    >
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {tab === "scheduler" && schedStats && (
          <SchedulerTab
            stats={schedStats}
            events={schedEvents}
            processes={processes}
            tickHistory={tickHistory}
            switchHistory={switchHistory}
          />
        )}
        {tab === "memory" && memStats && (
          <MemoryTab stats={memStats} history={memHistory} />
        )}
        {tab === "syscalls" && sysStats && (
          <SyscallTab stats={sysStats} log={sysLog} metrics={sysMetrics} />
        )}
        {tab === "drivers" && (
          <DriversTab drivers={driverDiags} batteryHistory={batteryHistory} networkHistory={networkHistory} />
        )}
      </div>
    </AppLayout>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCHEDULER TAB
// ═══════════════════════════════════════════════════════════════

function SchedulerTab({
  stats, events, processes, tickHistory, switchHistory,
}: {
  stats: SchedulerStats;
  events: readonly SchedulerEvent[];
  processes: Process[];
  tickHistory: number[];
  switchHistory: number[];
}) {
  const tickRateSeries = useMemo((): ChartSeries[] => {
    const deltas = tickHistory.map((v, i) => i > 0 ? v - tickHistory[i - 1] : 0);
    const switchDeltas = switchHistory.map((v, i) => i > 0 ? v - switchHistory[i - 1] : 0);
    return [
      { key: "ticks/s", color: COLORS.ticks, data: deltas, fillOpacity: 0.2 },
      { key: "switches/s", color: COLORS.switches, data: switchDeltas, fillOpacity: 0.3 },
    ];
  }, [tickHistory, switchHistory]);

  const bandBars = useMemo((): BarItem[] => {
    const bands: PriorityBand[] = ["RT-Critical", "RT-Normal", "Interactive", "Batch", "Idle"];
    const total = bands.reduce((s, b) => s + stats.bandDistribution[b], 0) || 1;
    return bands.map(b => ({
      label: b,
      value: (stats.bandDistribution[b] / total) * 100,
      colorLow: BAND_COLORS[b],
      colorHigh: BAND_COLORS[b],
    }));
  }, [stats]);

  const queueBars = useMemo((): BarItem[] => {
    const bands: PriorityBand[] = ["RT-Critical", "RT-Normal", "Interactive", "Batch", "Idle"];
    const maxDepth = Math.max(1, ...bands.map(b => stats.readyQueueDepths[b]));
    return bands.map(b => ({
      label: b.replace("-", "\n"),
      value: (stats.readyQueueDepths[b] / maxDepth) * 100,
      colorLow: BAND_COLORS[b],
      colorHigh: { ...BAND_COLORS[b], l: 40 },
    }));
  }, [stats]);

  return (
    <VStack spacing="tight">
      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={Timer} label="Ticks" value={stats.totalTicks.toLocaleString()} />
        <StatCard icon={Activity} label="Switches" value={stats.contextSwitchCount.toLocaleString()} />
        <StatCard icon={Zap} label="Preemptions" value={stats.preemptionCount.toLocaleString()} />
        <StatCard icon={Shield} label="Ring Trans" value={stats.ringTransitionCount.toLocaleString()} />
      </div>

      <NovaCard className="p-2">
        <NovaSectionLabel>Tick Rate & Context Switches</NovaSectionLabel>
        <NovaCanvasChart series={tickRateSeries} height={120} yUnit="" gridLines={3} />
      </NovaCard>

      <div className="grid grid-cols-2 gap-2">
        <NovaCard className="p-2">
          <NovaSectionLabel>Band Distribution</NovaSectionLabel>
          <NovaCanvasBars bars={bandBars} barHeight={16} gap={4} />
        </NovaCard>
        <NovaCard className="p-2">
          <NovaSectionLabel>Ready Queue Depths</NovaSectionLabel>
          <NovaCanvasBars bars={queueBars} vertical columns={5} />
        </NovaCard>
      </div>

      <NovaCard className="p-2">
        <NovaSectionLabel>Running Process</NovaSectionLabel>
        {stats.currentPid !== null ? (
          (() => {
            const proc = processes.find(p => p.pid === stats.currentPid);
            if (!proc) return <NovaText muted>PID {stats.currentPid} (unknown)</NovaText>;
            return (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono">
                <span className="text-muted-foreground">PID</span><span>{proc.pid}</span>
                <span className="text-muted-foreground">App</span><span>{proc.appId}</span>
                <span className="text-muted-foreground">Priority</span>
                <NovaBadge>{proc.priority}</NovaBadge>
                <span className="text-muted-foreground">Ring</span>
                <NovaBadge variant={proc.privilegeLevel === 0 ? "danger" : "default"}>
                  Ring {proc.privilegeLevel}
                </NovaBadge>
                <span className="text-muted-foreground">RIP</span>
                <span>0x{proc.context.rip.toString(16).toUpperCase()}</span>
                <span className="text-muted-foreground">RSP</span>
                <span>0x{proc.context.rsp.toString(16).toUpperCase()}</span>
                <span className="text-muted-foreground">RFLAGS</span>
                <span>0x{proc.context.rflags.toString(16).toUpperCase()}</span>
                <span className="text-muted-foreground">CS</span>
                <span>0x{proc.context.cs.toString(16)}</span>
                <span className="text-muted-foreground">Quantum</span>
                <span>{proc.quantumRemaining}/{proc.quantumSize}</span>
              </div>
            );
          })()
        ) : (
          <NovaText muted className="text-[11px]">CPU idle — no process scheduled</NovaText>
        )}
      </NovaCard>

      <NovaCard className="p-2">
        <NovaSectionLabel>Process Table ({processes.length})</NovaSectionLabel>
        <div className="max-h-[140px] overflow-y-auto">
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr className="text-muted-foreground border-b border-border/30">
                <th className="text-left py-1 px-1">PID</th>
                <th className="text-left py-1 px-1">App</th>
                <th className="text-left py-1 px-1">State</th>
                <th className="text-left py-1 px-1">Band</th>
                <th className="text-right py-1 px-1">Ring</th>
                <th className="text-right py-1 px-1">Ticks</th>
              </tr>
            </thead>
            <tbody>
              {processes.map(p => (
                <tr key={p.pid} className={cn(
                  "border-b border-border/10",
                  p.pid === stats.currentPid && "bg-primary/10"
                )}>
                  <td className="py-0.5 px-1">{p.pid}</td>
                  <td className="py-0.5 px-1 truncate max-w-[80px]">{p.appId}</td>
                  <td className="py-0.5 px-1">
                    <span className={cn(
                      "inline-block w-1.5 h-1.5 rounded-full mr-1",
                      p.state === "running" ? "bg-[hsl(152_55%_48%)]" :
                      p.state === "ready" ? "bg-[hsl(210_80%_55%)]" :
                      p.state === "blocked" ? "bg-[hsl(38_85%_58%)]" : "bg-muted-foreground/30"
                    )} />
                    {p.state}
                  </td>
                  <td className="py-0.5 px-1">{p.priority}</td>
                  <td className="py-0.5 px-1 text-right">{p.privilegeLevel}</td>
                  <td className="py-0.5 px-1 text-right">{p.cpuTicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NovaCard>

      <NovaCard className="p-2">
        <NovaSectionLabel>Event Log (last 30)</NovaSectionLabel>
        <div className="max-h-[120px] overflow-y-auto space-y-0.5">
          {[...events].reverse().map((ev, i) => (
            <div key={i} className="flex items-start gap-2 text-[10px] font-mono py-0.5">
              <span className="text-muted-foreground shrink-0 w-[50px]">T{ev.tick}</span>
              <NovaBadge className="shrink-0 text-[9px]">{ev.type}</NovaBadge>
              <span className="text-muted-foreground truncate">{ev.detail}</span>
            </div>
          ))}
          {events.length === 0 && <NovaText muted className="text-[10px]">No events yet</NovaText>}
        </div>
      </NovaCard>
    </VStack>
  );
}

// ═══════════════════════════════════════════════════════════════
// MEMORY TAB
// ═══════════════════════════════════════════════════════════════

function MemoryTab({ stats, history }: { stats: MemoryStats; history: number[] }) {
  const pressure = MemoryManager.checkPressure();
  const procs = ProcessTable.listProcesses().filter(p => p.state !== "terminated");

  const utilizationSeries = useMemo((): ChartSeries[] => [
    { key: "Utilization %", color: COLORS.memUsed, data: history, fillOpacity: 0.3 },
  ], [history]);

  const memBars = useMemo((): BarItem[] => [
    {
      label: "Allocated",
      value: stats.utilizationPercent,
      colorLow: COLORS.memUsed,
      colorHigh: COLORS.syscallErr,
      threshold: 85,
    },
    {
      label: "Free",
      value: (stats.freePages / stats.totalPages) * 100,
      colorLow: COLORS.memFree,
      colorHigh: COLORS.memFree,
    },
  ], [stats]);

  const procMemory = useMemo(() => {
    return procs.map(p => {
      const usage = MemoryManager.getUsage(p.pid);
      return { pid: p.pid, appId: p.appId, pages: usage.pages, bytes: usage.bytes };
    }).filter(m => m.pages > 0).sort((a, b) => b.pages - a.pages);
  }, [procs]);

  const addressSpaces = useMemo(() => {
    return procs.map(p => {
      const as = MemoryManager.getAddressSpace(p.pid);
      return as ? { pid: p.pid, appId: p.appId, as } : null;
    }).filter(Boolean) as { pid: number; appId: string; as: any }[];
  }, [procs]);

  return (
    <VStack spacing="tight">
      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={HardDrive} label="Total" value={`${((stats.totalPages * PAGE_SIZE) / (1024 * 1024)).toFixed(0)} MB`} />
        <StatCard icon={Layers} label="Allocated" value={`${stats.allocatedPages.toLocaleString()} pg`} />
        <StatCard icon={Activity} label="Usage" value={`${stats.utilizationPercent.toFixed(1)}%`}
          variant={pressure === "critical" ? "danger" : pressure === "warning" ? "warning" : "default"} />
        <StatCard icon={Shield} label="CR3 Switches" value={stats.pageTableSwitches.toLocaleString()} />
      </div>

      {pressure !== "normal" && (
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium",
          pressure === "critical" ? "bg-destructive/15 text-destructive" : "bg-[hsl(38_85%_58%/0.15)] text-[hsl(38_85%_40%)]"
        )}>
          <AlertTriangle size={13} />
          Memory pressure: {pressure.toUpperCase()} — {stats.freePages.toLocaleString()} pages free
        </div>
      )}

      <NovaCard className="p-2">
        <NovaSectionLabel>Memory Utilization Over Time</NovaSectionLabel>
        <NovaCanvasChart series={utilizationSeries} height={120} maxY={100} yUnit="%" gridLines={4} />
      </NovaCard>

      <NovaCard className="p-2">
        <NovaSectionLabel>Allocation Overview</NovaSectionLabel>
        <NovaCanvasBars bars={memBars} barHeight={20} gap={6} />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
          <span>{stats.regions} regions</span>
          <span>{stats.guardPages} guard pages</span>
          <span>{stats.addressSpaces} addr spaces</span>
        </div>
      </NovaCard>

      <NovaCard className="p-2">
        <NovaSectionLabel>Per-Process Memory</NovaSectionLabel>
        <div className="max-h-[130px] overflow-y-auto">
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr className="text-muted-foreground border-b border-border/30">
                <th className="text-left py-1 px-1">PID</th>
                <th className="text-left py-1 px-1">App</th>
                <th className="text-right py-1 px-1">Pages</th>
                <th className="text-right py-1 px-1">Size</th>
              </tr>
            </thead>
            <tbody>
              {procMemory.map(m => (
                <tr key={m.pid} className="border-b border-border/10">
                  <td className="py-0.5 px-1">{m.pid}</td>
                  <td className="py-0.5 px-1 truncate max-w-[100px]">{m.appId}</td>
                  <td className="py-0.5 px-1 text-right">{m.pages}</td>
                  <td className="py-0.5 px-1 text-right">{(m.bytes / 1024).toFixed(0)} KB</td>
                </tr>
              ))}
              {procMemory.length === 0 && (
                <tr><td colSpan={4} className="py-2 text-center text-muted-foreground">No allocations</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </NovaCard>

      <NovaCard className="p-2">
        <NovaSectionLabel>Page Tables (Address Spaces)</NovaSectionLabel>
        <div className="max-h-[160px] overflow-y-auto space-y-2">
          {addressSpaces.map(({ pid, appId, as }) => (
            <div key={pid} className="border border-border/20 rounded-md p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold">PID {pid} — {appId}</span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  CR3=0x{as.pageTableRoot.toString(16).toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-x-3 text-[10px] font-mono text-muted-foreground">
                <span>Heap: 0x{as.heapStart.toString(16)}</span>
                <span>Stack: 0x{as.stackTop.toString(16)}</span>
                <span>Mappings: {as.mappings.length}</span>
              </div>
              {as.mappings.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {as.mappings.slice(0, 4).map((m: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-[9px] font-mono">
                      <span className="text-muted-foreground w-[60px]">virt 0x{m.virtualStart.toString(16)}</span>
                      <span>→ phys 0x{m.physicalStart.toString(16)}</span>
                      <span className="text-muted-foreground">{m.pageCount}pg</span>
                      <span className="text-muted-foreground">
                        {m.flags.readable ? "R" : "-"}{m.flags.writable ? "W" : "-"}{m.flags.executable ? "X" : "-"}
                        {m.flags.guard ? " GUARD" : ""}{m.flags.copyOnWrite ? " CoW" : ""}
                      </span>
                      <span className="text-muted-foreground/60 truncate">{m.label}</span>
                    </div>
                  ))}
                  {as.mappings.length > 4 && (
                    <span className="text-[9px] text-muted-foreground">+{as.mappings.length - 4} more</span>
                  )}
                </div>
              )}
            </div>
          ))}
          {addressSpaces.length === 0 && (
            <NovaText muted className="text-[10px]">No address spaces allocated</NovaText>
          )}
        </div>
      </NovaCard>
    </VStack>
  );
}

// ═══════════════════════════════════════════════════════════════
// SYSCALL TAB
// ═══════════════════════════════════════════════════════════════

function SyscallTab({
  stats, log, metrics,
}: {
  stats: ReturnType<typeof getSyscallStats>;
  log: readonly SyscallLogEntry[];
  metrics: SyscallTypeMetrics[];
}) {
  return (
    <VStack spacing="tight">
      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={Zap} label="Total Calls" value={stats.total.toLocaleString()} />
        <StatCard icon={Shield} label="Denied" value={stats.denied.toLocaleString()}
          variant={stats.denied > 0 ? "warning" : "default"} />
        <StatCard icon={AlertTriangle} label="Errors" value={stats.errors.toLocaleString()}
          variant={stats.errors > 0 ? "danger" : "default"} />
        <StatCard icon={Clock} label="Avg Latency" value={`${stats.avgMs}ms`} />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={Activity} label="Rate Limited" value={stats.rateLimited.toLocaleString()} />
        <StatCard icon={Shield} label="Violations" value={stats.violations.toLocaleString()} />
        <StatCard icon={Layers} label="Mutex Block" value={stats.mutexBlocked.toLocaleString()} />
        <StatCard icon={Zap} label="Ring Trans" value={stats.ringTransitions.toLocaleString()} />
      </div>

      <NovaCard className="p-2">
        <NovaSectionLabel>Per-Syscall Latency Metrics</NovaSectionLabel>
        <div className="max-h-[160px] overflow-y-auto">
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr className="text-muted-foreground border-b border-border/30">
                <th className="text-left py-1 px-1">Syscall</th>
                <th className="text-right py-1 px-1">Count</th>
                <th className="text-right py-1 px-1">Avg</th>
                <th className="text-right py-1 px-1">P95</th>
                <th className="text-right py-1 px-1">P99</th>
                <th className="text-center py-1 px-1">Block</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map(m => (
                <tr key={m.code} className="border-b border-border/10">
                  <td className="py-0.5 px-1">{m.syscall}</td>
                  <td className="py-0.5 px-1 text-right">{m.count}</td>
                  <td className="py-0.5 px-1 text-right">{m.avgMs}ms</td>
                  <td className="py-0.5 px-1 text-right">{m.p95Ms}ms</td>
                  <td className="py-0.5 px-1 text-right">{m.p99Ms}ms</td>
                  <td className="py-0.5 px-1 text-center">
                    <span className={cn(
                      "inline-block w-1.5 h-1.5 rounded-full",
                      m.blocking ? "bg-[hsl(38_85%_58%)]" : "bg-[hsl(152_55%_48%)]"
                    )} />
                  </td>
                </tr>
              ))}
              {metrics.length === 0 && (
                <tr><td colSpan={6} className="py-2 text-center text-muted-foreground">No syscalls recorded</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </NovaCard>

      <NovaCard className="p-2">
        <NovaSectionLabel>Audit Log (last 30)</NovaSectionLabel>
        <div className="max-h-[160px] overflow-y-auto space-y-0.5">
          {[...log].reverse().map((entry, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] font-mono py-0.5">
              <span className={cn(
                "shrink-0 w-1.5 h-1.5 rounded-full",
                entry.result === "ok" ? "bg-[hsl(152_55%_48%)]" :
                entry.result === "denied" ? "bg-[hsl(38_85%_58%)]" :
                "bg-destructive"
              )} />
              <span className="text-muted-foreground shrink-0 w-[28px]">P{entry.pid}</span>
              <NovaBadge className="shrink-0 text-[9px]">
                {entry.syscall}
              </NovaBadge>
              <span className="text-muted-foreground">{entry.result}</span>
              <span className="text-muted-foreground/60">{entry.durationMs.toFixed(2)}ms</span>
              {entry.ringTransition && (
                <NovaBadge variant="info" className="text-[8px]">Ring↕</NovaBadge>
              )}
            </div>
          ))}
          {log.length === 0 && <NovaText muted className="text-[10px]">No syscalls logged</NovaText>}
        </div>
      </NovaCard>
    </VStack>
  );
}

// ═══════════════════════════════════════════════════════════════
// DRIVERS TAB
// ═══════════════════════════════════════════════════════════════

const DRIVER_ICONS: Record<string, typeof Cpu> = {
  "drv-display": Monitor,
  "drv-input": Cpu,
  "drv-audio": Activity,
  "drv-storage": HardDrive,
  "drv-network": Wifi,
  "drv-battery": Battery,
};

const STATUS_COLOR: Record<string, string> = {
  ready: "bg-[hsl(152_55%_48%)]",
  loading: "bg-[hsl(38_85%_58%)]",
  error: "bg-destructive",
  shutdown: "bg-muted-foreground/30",
  unloaded: "bg-muted-foreground/20",
};

function DriversTab({
  drivers,
  batteryHistory,
  networkHistory,
}: {
  drivers: { driver: DeviceDriver; diag: Record<string, unknown> }[];
  batteryHistory: number[];
  networkHistory: number[];
}) {
  const batteryDrv = drivers.find(d => d.driver.id === "drv-battery");
  const networkDrv = drivers.find(d => d.driver.id === "drv-network");
  const displayDrv = drivers.find(d => d.driver.id === "drv-display");

  const readyCount = drivers.filter(d => d.driver.status === "ready").length;
  const errorCount = drivers.filter(d => d.driver.status === "error").length;

  const battSeries = useMemo((): ChartSeries[] => [
    { key: "Battery %", color: { h: 152, s: 55, l: 48 } as NovaColor, data: batteryHistory, fillOpacity: 0.25 },
  ], [batteryHistory]);

  const netSeries = useMemo((): ChartSeries[] => [
    { key: "Downlink Mbps", color: { h: 210, s: 80, l: 55 } as NovaColor, data: networkHistory, fillOpacity: 0.2 },
  ], [networkHistory]);

  return (
    <VStack spacing="tight">
      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={Monitor} label="Drivers" value={`${drivers.length}`} />
        <StatCard icon={Shield} label="Ready" value={`${readyCount}`} />
        <StatCard icon={AlertTriangle} label="Errors" value={`${errorCount}`} variant={errorCount > 0 ? "danger" : "default"} />
        <StatCard
          icon={Battery}
          label="Battery"
          value={`${(batteryDrv?.diag as any)?.level ?? "—"}%`}
          variant={(batteryDrv?.diag as any)?.level < 20 ? "warning" : "default"}
        />
      </div>

      {/* Battery live chart */}
      <NovaCard className="p-2">
        <NovaSectionLabel>Battery Level Over Time</NovaSectionLabel>
        <div className="flex items-center gap-2 mb-1">
          {(batteryDrv?.diag as any)?.charging ? (
            <div className="flex items-center gap-1 text-[10px] text-[hsl(152_55%_48%)]">
              <BatteryCharging size={12} /> Charging
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Battery size={12} /> On Battery
            </div>
          )}
          <span className="text-[10px] text-muted-foreground ml-auto">
            API: {(batteryDrv?.diag as any)?.apiSupported ? "Supported" : "Unavailable"}
          </span>
        </div>
        <NovaCanvasChart series={battSeries} height={90} maxY={100} yUnit="%" gridLines={4} />
      </NovaCard>

      {/* Network live chart */}
      <NovaCard className="p-2">
        <NovaSectionLabel>Network Speed Over Time</NovaSectionLabel>
        <div className="flex items-center gap-2 mb-1 text-[10px]">
          {(networkDrv?.diag as any)?.online ? (
            <div className="flex items-center gap-1 text-[hsl(152_55%_48%)]">
              <Signal size={12} /> Online
            </div>
          ) : (
            <div className="flex items-center gap-1 text-destructive">
              <WifiOff size={12} /> Offline
            </div>
          )}
          <span className="text-muted-foreground">
            Type: {(networkDrv?.diag as any)?.type ?? "—"}
          </span>
          <span className="text-muted-foreground ml-auto">
            RTT: {(networkDrv?.diag as any)?.rttMs ?? "—"}ms
          </span>
        </div>
        <NovaCanvasChart series={netSeries} height={90} yUnit=" Mbps" gridLines={3} />
      </NovaCard>

      {/* Display info */}
      <NovaCard className="p-2">
        <NovaSectionLabel>Display Information</NovaSectionLabel>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] font-mono">
          <span className="text-muted-foreground">Resolution</span>
          <span>{(displayDrv?.diag as any)?.resolution ?? "—"}</span>
          <span className="text-muted-foreground">Color Depth</span>
          <span>{(displayDrv?.diag as any)?.colorDepth ?? "—"}-bit</span>
          <span className="text-muted-foreground">Pixel Ratio</span>
          <span>{(displayDrv?.diag as any)?.pixelRatio ?? "—"}x</span>
          <span className="text-muted-foreground">Refresh Rate</span>
          <span>{(displayDrv?.diag as any)?.refreshRate ?? "—"} Hz</span>
          <span className="text-muted-foreground">HDR</span>
          <span>{(displayDrv?.diag as any)?.hdr ? "Yes" : "No"}</span>
        </div>
      </NovaCard>

      {/* All drivers table */}
      <NovaCard className="p-2">
        <NovaSectionLabel>All Device Drivers ({drivers.length})</NovaSectionLabel>
        <div className="space-y-1.5">
          {drivers.map(({ driver, diag }) => {
            const Icon = DRIVER_ICONS[driver.id] ?? Cpu;
            return (
              <div key={driver.id} className="flex items-start gap-2 p-2 rounded-lg bg-background/50 border border-border/30">
                <Icon size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium">{driver.name}</span>
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", STATUS_COLOR[driver.status])} />
                    <span className="text-[9px] text-muted-foreground uppercase">{driver.status}</span>
                    <NovaBadge className="ml-auto text-[8px]">{driver.type}</NovaBadge>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    {Object.entries(diag).map(([k, v]) => (
                      <span key={k} className="text-[9px] text-muted-foreground font-mono">
                        {k}: <span className="text-foreground/80">{String(v)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </NovaCard>
    </VStack>
  );
}



function StatCard({
  icon: Icon, label, value, variant = "default",
}: {
  icon: typeof Cpu;
  label: string;
  value: string;
  variant?: "default" | "warning" | "danger";
}) {
  return (
    <NovaCard className={cn(
      "p-2 flex flex-col items-center gap-0.5",
      variant === "danger" && "border-destructive/30 bg-destructive/5",
      variant === "warning" && "border-[hsl(38_85%_58%/0.3)] bg-[hsl(38_85%_58%/0.05)]",
    )}>
      <Icon size={13} className="text-muted-foreground" />
      <span className="text-[13px] font-semibold tabular-nums">{value}</span>
      <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</span>
    </NovaCard>
  );
}
