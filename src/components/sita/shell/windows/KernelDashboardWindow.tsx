// ═══════════════════════════════════════════════════════════════
// Nova OS — Kernel Dashboard Window
// Real-time visualization of scheduler, memory, and syscalls
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Cpu, HardDrive, Activity, Layers, Zap, Timer,
  Shield, Clock, AlertTriangle, Monitor, Wifi, Battery,
  WifiOff, BatteryCharging, Signal, FlaskConical, Play, Square, X,
} from "lucide-react";
import {
  AppLayout,
  VStack, HStack,
} from "@/platform/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard,
  NovaSectionLabel, NovaBadge,
} from "@/platform/nova-sdk/ui/components";
import { APP_COMPONENTS } from "@/platform/design-system/app-window-system";
import { useWindowManagerContext } from "@/contexts/WindowManagerContext";
import { cn } from "@/lib/utils";
import { NovaCanvasChart, type ChartSeries } from "./NovaCanvasChart";
import { NovaCanvasBars, type BarItem } from "./NovaCanvasBars";
import type { NovaColor } from "@/platform/nova-sdk/graphics/context";
import { Scheduler, type SchedulerStats, type SchedulerEvent } from "@/platform/nova-sdk/kernel/scheduler";
import { MemoryManager, type MemoryStats, PAGE_SIZE } from "@/platform/nova-sdk/kernel/memory-manager";
import { ProcessTable, type Process, type PriorityBand } from "@/platform/nova-sdk/kernel/process-manager";
import { getSyscallStats, getSyscallLog, getSyscallMetrics, type SyscallLogEntry, type SyscallTypeMetrics } from "@/platform/nova-sdk/kernel/syscall";
import { DriverManager, type DeviceDriver } from "@/platform/nova-sdk/kernel/drivers";

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
        {tab === "stress" && (
          <StressTestTab />
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

const APP_POWER_PROFILES = [
  { name: "Compositor",     base: 18, icon: Monitor,  category: "system" },
  { name: "Scheduler",      base: 8,  icon: Cpu,      category: "system" },
  { name: "File System",    base: 5,  icon: HardDrive,category: "system" },
  { name: "Networking",     base: 12, icon: Wifi,     category: "system" },
  { name: "Browser",        base: 22, icon: Activity, category: "app" },
  { name: "Code Editor",    base: 15, icon: Layers,   category: "app" },
  { name: "Music Player",   base: 6,  icon: Zap,      category: "app" },
  { name: "Terminal",       base: 4,  icon: Shield,   category: "app" },
  { name: "Background Sync",base: 3,  icon: Clock,    category: "background" },
  { name: "Notifications",  base: 2,  icon: AlertTriangle, category: "background" },
];

function BatteryBreakdown({ batteryLevel, charging }: { batteryLevel: number; charging: boolean }) {
  const apps = useMemo(() => {
    const drain = 100 - batteryLevel;
    const jitter = () => 0.7 + Math.random() * 0.6;
    const raw = APP_POWER_PROFILES.map(a => ({ ...a, mW: Math.round(a.base * jitter() * (drain > 5 ? 1 + drain / 200 : 0.5)) }));
    const totalMW = raw.reduce((s, a) => s + a.mW, 0) || 1;
    return raw
      .map(a => ({ ...a, pct: Math.round((a.mW / totalMW) * 100) }))
      .sort((a, b) => b.mW - a.mW);
  }, [batteryLevel]);

  const totalMW = apps.reduce((s, a) => s + a.mW, 0);
  const estHoursLeft = charging ? null : batteryLevel > 0 ? ((batteryLevel / 100) * 40000 / (totalMW || 1)).toFixed(1) : "0";

  const catColors: Record<string, string> = {
    system: "bg-[hsl(265_65%_55%)]",
    app: "bg-[hsl(210_80%_55%)]",
    background: "bg-[hsl(152_55%_48%)]",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Total draw: ~{totalMW} mW</span>
        {estHoursLeft && <span>Est. remaining: ~{estHoursLeft}h</span>}
        {charging && <span className="text-[hsl(152_55%_48%)]">Charging — draw offset</span>}
      </div>

      {/* Stacked bar */}
      <div className="w-full h-3 rounded-full bg-muted/30 flex overflow-hidden">
        {apps.map(a => (
          <div
            key={a.name}
            className={cn("h-full first:rounded-l-full last:rounded-r-full", catColors[a.category])}
            style={{ width: `${Math.max(a.pct, 1)}%`, opacity: 0.6 + (a.pct / 100) * 0.4 }}
            title={`${a.name}: ${a.mW}mW (${a.pct}%)`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[hsl(265_65%_55%)]" />System</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[hsl(210_80%_55%)]" />Apps</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[hsl(152_55%_48%)]" />Background</span>
      </div>

      {/* Per-app list */}
      <div className="space-y-1 max-h-[160px] overflow-y-auto">
        {apps.map(a => {
          const Icon = a.icon;
          return (
            <div key={a.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-background/50 border border-border/20">
              <Icon size={12} className="text-muted-foreground shrink-0" />
              <span className="text-[10px] font-medium flex-1 truncate">{a.name}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{a.mW} mW</span>
              <div className="w-16 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                <div className={cn("h-full rounded-full", catColors[a.category])} style={{ width: `${a.pct}%` }} />
              </div>
              <span className="text-[9px] font-mono text-muted-foreground w-7 text-right">{a.pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


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

      {/* Per-app battery usage breakdown */}
      <NovaCard className="p-2">
        <NovaSectionLabel>Per-App Power Consumption</NovaSectionLabel>
        <BatteryBreakdown batteryLevel={(batteryDrv?.diag as any)?.level ?? 100} charging={(batteryDrv?.diag as any)?.charging ?? false} />
      </NovaCard>

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

// ═══════════════════════════════════════════════════════════════
// STRESS TEST TAB
// ═══════════════════════════════════════════════════════════════

interface StressMetrics {
  windowCount: number;
  openTimeMs: number;
  avgOpenMs: number;
  maxOpenMs: number;
  memoryMB: number;
  domNodes: number;
  fps: number;
  dragLatencyMs: number;
  phase: "idle" | "opening" | "running" | "measuring" | "done";
}

const STRESS_WINDOW_NAMES = [
  "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta",
  "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron", "Pi",
  "Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega",
  "Aleph", "Beth", "Gimel", "Daleth", "He", "Vav",
];

function StressWindowContent({ name, index }: { name: string; index: number }) {
  const [counter, setCounter] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setCounter(c => c + 1), 1000);
    return () => clearInterval(iv);
  }, []);
  const hue = (index * 37) % 360;
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 p-3" style={{ background: `hsl(${hue} 40% 12%)` }}>
      <div className="text-2xl font-bold" style={{ color: `hsl(${hue} 70% 65%)` }}>
        {name}
      </div>
      <div className="text-xs text-muted-foreground font-mono">
        Window #{index + 1} · Tick {counter}
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden bg-background/30 mt-2">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${(counter % 20) * 5}%`,
            background: `hsl(${hue} 70% 55%)`,
          }}
        />
      </div>
    </div>
  );
}

function StressTestTab() {
  const wm = useWindowManagerContext();
  const [metrics, setMetrics] = useState<StressMetrics>({
    windowCount: 0, openTimeMs: 0, avgOpenMs: 0, maxOpenMs: 0,
    memoryMB: 0, domNodes: 0, fps: 0, dragLatencyMs: 0,
    phase: "idle",
  });
  const [targetCount, setTargetCount] = useState(24);
  const [log, setLog] = useState<string[]>([]);
  const [fpsHistory, setFpsHistory] = useState<number[]>([]);
  const stressIdsRef = useRef<string[]>([]);
  const rafRef = useRef<number>(0);

  const addLog = useCallback((msg: string) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  }, []);

  // FPS measurement
  const measureFps = useCallback(() => {
    let frames = 0;
    let last = performance.now();
    const tick = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        const fps = Math.round((frames * 1000) / (now - last));
        setMetrics(prev => ({ ...prev, fps }));
        setFpsHistory(prev => pushHistory(prev, fps));
        frames = 0;
        last = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Start stress test
  const runStressTest = useCallback(async () => {
    if (!wm) return;
    setMetrics(prev => ({ ...prev, phase: "opening", windowCount: 0 }));
    setLog([]);
    addLog(`Starting stress test: ${targetCount} windows`);

    const ids: string[] = [];
    const openTimes: number[] = [];
    const totalStart = performance.now();

    for (let i = 0; i < targetCount; i++) {
      const id = `stress-${i}`;
      const name = STRESS_WINDOW_NAMES[i] || `W${i}`;
      const x = 60 + (i % 6) * 80;
      const y = 40 + Math.floor(i / 6) * 70;

      const t0 = performance.now();
      wm.openWindow(id, {
        title: `Stress: ${name}`,
        component: <StressWindowContent name={name} index={i} />,
        position: { x, y },
        width: 280,
      });
      const t1 = performance.now();
      openTimes.push(t1 - t0);
      ids.push(id);

      if (i % 5 === 4) {
        addLog(`Opened ${i + 1}/${targetCount} windows (${(t1 - t0).toFixed(1)}ms last)`);
      }
      // Small yield to keep UI responsive during batch open
      if (i % 3 === 2) await new Promise(r => setTimeout(r, 0));
    }

    const totalMs = performance.now() - totalStart;
    const avgMs = openTimes.reduce((a, b) => a + b, 0) / openTimes.length;
    const maxMs = Math.max(...openTimes);
    stressIdsRef.current = ids;

    addLog(`All ${targetCount} windows opened in ${totalMs.toFixed(0)}ms`);
    addLog(`Avg open: ${avgMs.toFixed(2)}ms · Max: ${maxMs.toFixed(2)}ms`);

    // Measure DOM + memory
    const domNodes = document.querySelectorAll("*").length;
    const memoryMB = (performance as any).memory
      ? ((performance as any).memory.usedJSHeapSize / (1024 * 1024))
      : 0;

    setMetrics({
      windowCount: targetCount,
      openTimeMs: totalMs,
      avgOpenMs: avgMs,
      maxOpenMs: maxMs,
      memoryMB,
      domNodes,
      fps: 0,
      dragLatencyMs: 0,
      phase: "running",
    });

    addLog(`DOM nodes: ${domNodes.toLocaleString()} · Heap: ${memoryMB.toFixed(1)}MB`);
    addLog("Measuring FPS…");
  }, [wm, targetCount, addLog]);

  // Close all stress windows
  const closeStressWindows = useCallback(() => {
    if (!wm) return;
    const t0 = performance.now();
    for (const id of stressIdsRef.current) {
      wm.closeWindow(id);
    }
    const t1 = performance.now();
    addLog(`Closed ${stressIdsRef.current.length} windows in ${(t1 - t0).toFixed(0)}ms`);
    stressIdsRef.current = [];
    setMetrics(prev => ({ ...prev, phase: "done", windowCount: 0 }));
    cancelAnimationFrame(rafRef.current);
  }, [wm, addLog]);

  // Start FPS measurement when running
  useEffect(() => {
    if (metrics.phase === "running") {
      const cleanup = measureFps();
      return cleanup;
    }
  }, [metrics.phase, measureFps]);

  // Periodic DOM/memory update during run
  useEffect(() => {
    if (metrics.phase !== "running") return;
    const iv = setInterval(() => {
      const domNodes = document.querySelectorAll("*").length;
      const memoryMB = (performance as any).memory
        ? ((performance as any).memory.usedJSHeapSize / (1024 * 1024))
        : 0;
      setMetrics(prev => ({ ...prev, domNodes, memoryMB }));
    }, 2000);
    return () => clearInterval(iv);
  }, [metrics.phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const fpsSeries = useMemo((): ChartSeries[] => [
    { key: "FPS", color: { h: 152, s: 55, l: 48 } as NovaColor, data: fpsHistory, fillOpacity: 0.2 },
  ], [fpsHistory]);

  const grade = metrics.fps >= 55 ? "Excellent" : metrics.fps >= 40 ? "Good" : metrics.fps >= 25 ? "Acceptable" : metrics.fps > 0 ? "Poor" : "—";
  const gradeColor = metrics.fps >= 55 ? "text-[hsl(152_55%_48%)]" : metrics.fps >= 40 ? "text-[hsl(210_80%_55%)]" : metrics.fps >= 25 ? "text-[hsl(38_85%_58%)]" : metrics.fps > 0 ? "text-destructive" : "text-muted-foreground";

  return (
    <VStack spacing="tight">
      {/* Controls */}
      <NovaCard className="p-3">
        <NovaSectionLabel>Window Stress Test</NovaSectionLabel>
        <NovaText muted className="text-[10px] mb-2">
          Opens multiple windows simultaneously to measure window manager performance, FPS stability, and memory impact.
        </NovaText>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Windows:</span>
            {[12, 20, 24, 30].map(n => (
              <button
                key={n}
                onClick={() => setTargetCount(n)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono transition-colors",
                  targetCount === n
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          {metrics.phase === "idle" || metrics.phase === "done" ? (
            <button
              onClick={runStressTest}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 transition-colors"
            >
              <Play size={12} /> Run Test
            </button>
          ) : (
            <button
              onClick={closeStressWindows}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-[11px] font-medium hover:bg-destructive/90 transition-colors"
            >
              <Square size={12} /> Stop & Close
            </button>
          )}
        </div>
      </NovaCard>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={Layers} label="Windows" value={`${metrics.windowCount}`} />
        <StatCard icon={Timer} label="Total Open" value={`${metrics.openTimeMs.toFixed(0)}ms`} />
        <StatCard icon={Activity} label="FPS" value={`${metrics.fps}`}
          variant={metrics.fps > 0 && metrics.fps < 25 ? "danger" : metrics.fps > 0 && metrics.fps < 40 ? "warning" : "default"} />
        <StatCard icon={HardDrive} label="Heap" value={metrics.memoryMB > 0 ? `${metrics.memoryMB.toFixed(0)}MB` : "—"} />
      </div>

      {/* Performance grade */}
      {metrics.phase === "running" && (
        <NovaCard className="p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Performance Grade:</span>
            <span className={cn("text-sm font-bold", gradeColor)}>{grade}</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
            <span>Avg open: {metrics.avgOpenMs.toFixed(2)}ms</span>
            <span>Max open: {metrics.maxOpenMs.toFixed(2)}ms</span>
            <span>DOM: {metrics.domNodes.toLocaleString()}</span>
          </div>
        </NovaCard>
      )}

      {/* FPS chart */}
      {fpsHistory.length > 1 && (
        <NovaCard className="p-2">
          <NovaSectionLabel>FPS Over Time</NovaSectionLabel>
          <NovaCanvasChart series={fpsSeries} height={100} maxY={65} yUnit=" fps" gridLines={3} />
        </NovaCard>
      )}

      {/* Test log */}
      <NovaCard className="p-2">
        <NovaSectionLabel>Test Log</NovaSectionLabel>
        <div className="max-h-[180px] overflow-y-auto space-y-0.5">
          {log.map((entry, i) => (
            <div key={i} className="text-[10px] font-mono text-muted-foreground py-0.5">
              {entry}
            </div>
          ))}
          {log.length === 0 && <NovaText muted className="text-[10px]">Press "Run Test" to begin</NovaText>}
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
