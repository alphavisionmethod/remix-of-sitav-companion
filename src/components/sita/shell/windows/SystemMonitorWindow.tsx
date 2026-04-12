// ═══════════════════════════════════════════════════════════════
// SITA OS — System Monitor Window
// Real-time CPU, memory, process list, network activity graphs
// Uses Nova SDK design system, AppLayout, recharts
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Cpu, HardDrive, Activity, Wifi, Zap, BarChart3,
  ArrowUp, ArrowDown, Pause, Play, X, ChevronRight,
} from "lucide-react";
import {
  AppLayout,
  VStack, HStack, Divider,
} from "@/lib/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard, NovaList,
  NovaSectionLabel, NovaBadge,
} from "@/lib/nova-sdk/ui/components";
import { APP_COMPONENTS } from "@/lib/design-system/app-window-system";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar,
} from "recharts";

// ── Types ────────────────────────────────────────────────────

interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  status: "running" | "sleeping" | "idle";
  threads: number;
}

interface NetworkSample {
  time: string;
  up: number;
  down: number;
}

interface CpuSample {
  time: string;
  user: number;
  system: number;
  idle: number;
}

interface MemSample {
  time: string;
  used: number;
  cached: number;
  free: number;
}

// ── Simulated Data Generators ────────────────────────────────

const PROCESS_NAMES = [
  "sita-shell", "nova-compositor", "sita-kernel", "watchdog",
  "advisor-runtime", "sound-engine", "fs-daemon", "net-stack",
  "gpu-compositor", "trust-engine", "calm-engine", "gesture-svc",
  "notif-router", "ipc-bridge", "scheduler", "memory-mgr",
  "auth-service", "render-proc", "wayland-srv", "dbus-daemon",
];

function generateProcesses(): ProcessInfo[] {
  return PROCESS_NAMES.map((name, i) => ({
    pid: 1000 + i * 7,
    name,
    cpu: name === "nova-compositor" ? 8 + Math.random() * 12
      : name === "sita-kernel" ? 3 + Math.random() * 5
      : name === "gpu-compositor" ? 5 + Math.random() * 8
      : Math.random() * 4,
    mem: name === "sita-shell" ? 120 + Math.random() * 40
      : name === "nova-compositor" ? 85 + Math.random() * 30
      : name === "advisor-runtime" ? 60 + Math.random() * 20
      : 10 + Math.random() * 50,
    status: Math.random() > 0.15 ? "running" : Math.random() > 0.5 ? "sleeping" : "idle",
    threads: Math.floor(2 + Math.random() * 12),
  }));
}

function timeLabel(i: number): string {
  const s = i % 60;
  return `${s}s`;
}

// ── Sidebar Sections ─────────────────────────────────────────

type MonitorSection = "cpu" | "memory" | "processes" | "network" | "gpu";

const SECTIONS: { id: MonitorSection; label: string; icon: React.ReactNode }[] = [
  { id: "cpu", label: "CPU", icon: <Cpu className="w-3.5 h-3.5" /> },
  { id: "memory", label: "Memory", icon: <HardDrive className="w-3.5 h-3.5" /> },
  { id: "processes", label: "Processes", icon: <Activity className="w-3.5 h-3.5" /> },
  { id: "network", label: "Network", icon: <Wifi className="w-3.5 h-3.5" /> },
  { id: "gpu", label: "GPU", icon: <Zap className="w-3.5 h-3.5" /> },
];

// ── Sparkline Mini Component ─────────────────────────────────

function Sparkline({ data, color, height = 28 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <polygon points={`0,${height} ${points} 100,${height}`} fill={`url(#spark-${color})`} />
    </svg>
  );
}

// ── Status Dot ───────────────────────────────────────────────

function StatusDot({ status }: { status: ProcessInfo["status"] }) {
  const colors = {
    running: "bg-[hsl(142_70%_50%)]",
    sleeping: "bg-[hsl(45_80%_55%)]",
    idle: "bg-[hsl(0_0%_50%)]",
  };
  return <div className={cn("w-1.5 h-1.5 rounded-full", colors[status])} />;
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export function SystemMonitorWindow() {
  const [section, setSection] = useState<MonitorSection>("cpu");
  const [paused, setPaused] = useState(false);
  const [processes, setProcesses] = useState<ProcessInfo[]>(() => generateProcesses());
  const [sortBy, setSortBy] = useState<"cpu" | "mem" | "name">("cpu");
  const [cpuHistory, setCpuHistory] = useState<CpuSample[]>([]);
  const [memHistory, setMemHistory] = useState<MemSample[]>([]);
  const [netHistory, setNetHistory] = useState<NetworkSample[]>([]);
  const [cpuSpark, setCpuSpark] = useState<number[]>(() => Array(30).fill(0));
  const [memSpark, setMemSpark] = useState<number[]>(() => Array(30).fill(0));
  const tickRef = useRef(0);

  // ── Real-time data simulation ──────────────────────────────
  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      tickRef.current++;
      const t = timeLabel(tickRef.current);

      // CPU
      const user = 15 + Math.sin(tickRef.current * 0.1) * 10 + Math.random() * 8;
      const system = 5 + Math.random() * 6;
      const idle = 100 - user - system;
      setCpuHistory(prev => [...prev.slice(-59), { time: t, user, system, idle }]);
      setCpuSpark(prev => [...prev.slice(-29), user + system]);

      // Memory
      const used = 4.2 + Math.sin(tickRef.current * 0.05) * 0.8 + Math.random() * 0.3;
      const cached = 1.8 + Math.random() * 0.4;
      const free = 16 - used - cached;
      setMemHistory(prev => [...prev.slice(-59), { time: t, used, cached, free }]);
      setMemSpark(prev => [...prev.slice(-29), (used / 16) * 100]);

      // Network
      const down = 2.5 + Math.sin(tickRef.current * 0.15) * 2 + Math.random() * 1.5;
      const up = 0.8 + Math.random() * 1.2;
      setNetHistory(prev => [...prev.slice(-59), { time: t, up, down }]);

      // Processes (update every 3 ticks)
      if (tickRef.current % 3 === 0) {
        setProcesses(generateProcesses());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [paused]);

  // ── Derived stats ──────────────────────────────────────────
  const latestCpu = cpuHistory[cpuHistory.length - 1];
  const latestMem = memHistory[memHistory.length - 1];
  const latestNet = netHistory[netHistory.length - 1];
  const totalCpu = latestCpu ? latestCpu.user + latestCpu.system : 0;
  const memPercent = latestMem ? (latestMem.used / 16) * 100 : 0;

  const sortedProcesses = useMemo(() => {
    const sorted = [...processes];
    if (sortBy === "cpu") sorted.sort((a, b) => b.cpu - a.cpu);
    else if (sortBy === "mem") sorted.sort((a, b) => b.mem - a.mem);
    else sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [processes, sortBy]);

  // ── Sidebar ────────────────────────────────────────────────
  const sidebar = (
    <VStack spacing="tight">
      <NovaSectionLabel className="!px-0 !mb-1">Monitor</NovaSectionLabel>
      <NovaList
        items={SECTIONS.map(s => ({
          id: s.id,
          label: s.label,
          icon: s.icon,
          active: section === s.id,
          onClick: () => setSection(s.id),
        }))}
      />
      <Divider className="!my-2" />

      {/* Quick stats */}
      <VStack spacing="micro" className="px-1">
        <NovaSectionLabel className="!px-0 !mb-0.5">Quick Stats</NovaSectionLabel>

        <div className="rounded-lg bg-[hsl(0_0%_0%/0.03)] dark:bg-[hsl(0_0%_100%/0.03)] p-2">
          <HStack spacing="micro" align="center" justify="between">
            <NovaText variant="label" muted>CPU</NovaText>
            <NovaText variant="label" className={cn(totalCpu > 70 ? "!text-[hsl(0_70%_55%)]" : totalCpu > 40 ? "!text-[hsl(45_80%_50%)]" : "!text-[hsl(142_70%_50%)]")}>
              {totalCpu.toFixed(0)}%
            </NovaText>
          </HStack>
          <Sparkline data={cpuSpark} color="hsl(210, 80%, 55%)" />
        </div>

        <div className="rounded-lg bg-[hsl(0_0%_0%/0.03)] dark:bg-[hsl(0_0%_100%/0.03)] p-2">
          <HStack spacing="micro" align="center" justify="between">
            <NovaText variant="label" muted>Memory</NovaText>
            <NovaText variant="label" className={cn(memPercent > 80 ? "!text-[hsl(0_70%_55%)]" : memPercent > 60 ? "!text-[hsl(45_80%_50%)]" : "!text-[hsl(142_70%_50%)]")}>
              {memPercent.toFixed(0)}%
            </NovaText>
          </HStack>
          <Sparkline data={memSpark} color="hsl(265, 55%, 58%)" />
        </div>

        <div className="rounded-lg bg-[hsl(0_0%_0%/0.03)] dark:bg-[hsl(0_0%_100%/0.03)] p-2">
          <HStack spacing="micro" align="center" justify="between">
            <NovaText variant="label" muted>Net ↓</NovaText>
            <NovaText variant="label">
              {latestNet ? `${latestNet.down.toFixed(1)} MB/s` : "—"}
            </NovaText>
          </HStack>
        </div>
      </VStack>
    </VStack>
  );

  // ── Toolbar ────────────────────────────────────────────────
  const toolbar = (
    <HStack spacing="tight" align="center" justify="between" className="w-full">
      <HStack spacing="micro" align="center">
        <BarChart3 className="w-3.5 h-3.5 text-[hsl(0_0%_45%)] dark:text-[hsl(0_0%_55%)]" />
        <NovaText variant="label" muted>System Monitor</NovaText>
        <NovaBadge variant={paused ? "warning" : "success"} className="!text-[9px]">
          {paused ? "PAUSED" : "LIVE"}
        </NovaBadge>
      </HStack>
      <HStack spacing="micro">
        <NovaButton variant="ghost" className="!p-1" onClick={() => setPaused(p => !p)}>
          {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
        </NovaButton>
      </HStack>
    </HStack>
  );

  // ── CPU Section ────────────────────────────────────────────
  const renderCpu = () => (
    <VStack spacing="normal">
      <HStack spacing="tight" justify="between" align="center">
        <VStack spacing="micro">
          <NovaText variant="heading">CPU Usage</NovaText>
          <NovaText variant="label" muted>8-core Apple Silicon (simulated)</NovaText>
        </VStack>
        <div className="text-right">
          <NovaText variant="heading" className={cn(totalCpu > 70 ? "!text-[hsl(0_70%_55%)]" : "!text-[hsl(210_80%_55%)]")}>
            {totalCpu.toFixed(1)}%
          </NovaText>
          <NovaText variant="label" muted>total</NovaText>
        </div>
      </HStack>

      <NovaCard>
        <NovaText variant="label" muted className="mb-2">CPU Load — 60s Window</NovaText>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cpuHistory} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="cpuUser" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(210, 80%, 55%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(210, 80%, 55%)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="cpuSystem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(265, 55%, 58%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(265, 55%, 58%)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: "hsl(0 0% 50%)" }} interval={9} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(0 0% 50%)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(0 0% 10% / 0.9)", border: "none", borderRadius: 8, fontSize: 11, color: "#fff" }}
                formatter={(v: number, name: string) => [`${v.toFixed(1)}%`, name]}
              />
              <Area type="monotone" dataKey="system" stackId="1" stroke="hsl(265, 55%, 58%)" fill="url(#cpuSystem)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="user" stackId="1" stroke="hsl(210, 80%, 55%)" fill="url(#cpuUser)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </NovaCard>

      {/* Per-core mini bars */}
      <NovaCard>
        <NovaText variant="label" muted className="mb-2">Core Utilization</NovaText>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }, (_, i) => {
            const load = Math.max(5, totalCpu + (Math.random() - 0.5) * 30);
            const clamped = Math.min(100, Math.max(0, load));
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-full h-[40px] rounded bg-[hsl(0_0%_0%/0.04)] dark:bg-[hsl(0_0%_100%/0.04)] relative overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-b transition-all duration-500"
                    style={{
                      height: `${clamped}%`,
                      background: clamped > 70
                        ? "linear-gradient(to top, hsl(0, 70%, 55%), hsl(30, 80%, 55%))"
                        : "linear-gradient(to top, hsl(210, 80%, 55%), hsl(210, 80%, 65%))",
                    }}
                  />
                </div>
                <NovaText variant="label" muted className="!text-[9px]">C{i}</NovaText>
              </div>
            );
          })}
        </div>
      </NovaCard>
    </VStack>
  );

  // ── Memory Section ─────────────────────────────────────────
  const renderMemory = () => (
    <VStack spacing="normal">
      <HStack spacing="tight" justify="between" align="center">
        <VStack spacing="micro">
          <NovaText variant="heading">Memory</NovaText>
          <NovaText variant="label" muted>16 GB Unified Memory</NovaText>
        </VStack>
        <div className="text-right">
          <NovaText variant="heading" className="!text-[hsl(265_55%_58%)]">
            {latestMem ? latestMem.used.toFixed(1) : "0"} GB
          </NovaText>
          <NovaText variant="label" muted>used of 16 GB</NovaText>
        </div>
      </HStack>

      {/* Memory pressure bar */}
      <NovaCard>
        <NovaText variant="label" muted className="mb-2">Memory Pressure</NovaText>
        <div className="h-4 w-full rounded-full bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.06)] overflow-hidden flex">
          <div
            className="h-full transition-all duration-500 rounded-l-full"
            style={{ width: `${memPercent}%`, background: "hsl(265, 55%, 58%)" }}
          />
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${latestMem ? (latestMem.cached / 16) * 100 : 0}%`, background: "hsl(210, 80%, 55%, 0.4)" }}
          />
        </div>
        <HStack spacing="normal" className="mt-2">
          <HStack spacing="micro" align="center">
            <div className="w-2 h-2 rounded-full bg-[hsl(265_55%_58%)]" />
            <NovaText variant="label" muted>Used</NovaText>
          </HStack>
          <HStack spacing="micro" align="center">
            <div className="w-2 h-2 rounded-full bg-[hsl(210_80%_55%/0.4)]" />
            <NovaText variant="label" muted>Cached</NovaText>
          </HStack>
          <HStack spacing="micro" align="center">
            <div className="w-2 h-2 rounded-full bg-[hsl(0_0%_0%/0.06)]" />
            <NovaText variant="label" muted>Free</NovaText>
          </HStack>
        </HStack>
      </NovaCard>

      <NovaCard>
        <NovaText variant="label" muted className="mb-2">Memory Over Time — 60s</NovaText>
        <div style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={memHistory} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="memUsed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(265, 55%, 58%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(265, 55%, 58%)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: "hsl(0 0% 50%)" }} interval={9} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 16]} tick={{ fontSize: 9, fill: "hsl(0 0% 50%)" }} axisLine={false} tickLine={false} unit=" GB" />
              <Tooltip
                contentStyle={{ background: "hsl(0 0% 10% / 0.9)", border: "none", borderRadius: 8, fontSize: 11, color: "#fff" }}
                formatter={(v: number, name: string) => [`${v.toFixed(2)} GB`, name]}
              />
              <Area type="monotone" dataKey="cached" stackId="1" stroke="hsl(210, 80%, 55%)" fill="hsl(210, 80%, 55%, 0.15)" strokeWidth={1} />
              <Area type="monotone" dataKey="used" stackId="1" stroke="hsl(265, 55%, 58%)" fill="url(#memUsed)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </NovaCard>

      {/* Top memory consumers */}
      <NovaCard>
        <NovaText variant="label" muted className="mb-2">Top Consumers</NovaText>
        <VStack spacing="micro">
          {sortedProcesses
            .sort((a, b) => b.mem - a.mem)
            .slice(0, 5)
            .map(p => (
              <HStack key={p.pid} spacing="tight" align="center" justify="between" className="px-1">
                <HStack spacing="micro" align="center">
                  <StatusDot status={p.status} />
                  <NovaText variant="body" className="!text-[11px]">{p.name}</NovaText>
                </HStack>
                <NovaText variant="label" muted>{p.mem.toFixed(0)} MB</NovaText>
              </HStack>
            ))}
        </VStack>
      </NovaCard>
    </VStack>
  );

  // ── Processes Section ──────────────────────────────────────
  const renderProcesses = () => (
    <VStack spacing="normal">
      <HStack spacing="tight" justify="between" align="center">
        <VStack spacing="micro">
          <NovaText variant="heading">Processes</NovaText>
          <NovaText variant="label" muted>{processes.length} active · {processes.filter(p => p.status === "running").length} running</NovaText>
        </VStack>
        <HStack spacing="micro">
          {(["cpu", "mem", "name"] as const).map(key => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={cn(
                APP_COMPONENTS.button.base,
                "!text-[10px] !px-2 !py-0.5",
                sortBy === key ? APP_COMPONENTS.button.primary : APP_COMPONENTS.button.ghost,
              )}
            >
              {key === "cpu" ? "CPU" : key === "mem" ? "Memory" : "Name"}
            </button>
          ))}
        </HStack>
      </HStack>

      <NovaCard className="!p-0 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-3 px-3 py-1.5 border-b border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_0%/0.02)] dark:bg-[hsl(0_0%_100%/0.02)]">
          <NovaText variant="label" muted>Process</NovaText>
          <NovaText variant="label" muted className="w-10 text-right">PID</NovaText>
          <NovaText variant="label" muted className="w-12 text-right">CPU</NovaText>
          <NovaText variant="label" muted className="w-14 text-right">Mem</NovaText>
          <NovaText variant="label" muted className="w-8 text-right">Thr</NovaText>
        </div>

        {/* Rows */}
        <div className="max-h-[320px] overflow-y-auto">
          {sortedProcesses.map(p => (
            <div
              key={p.pid}
              className={cn(
                "grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-3 px-3 py-1.5",
                "border-b border-[hsl(0_0%_0%/0.03)] dark:border-[hsl(0_0%_100%/0.03)]",
                "hover:bg-[hsl(0_0%_0%/0.02)] dark:hover:bg-[hsl(0_0%_100%/0.03)] transition-colors",
                p.cpu > 10 && "bg-[hsl(0_70%_55%/0.04)]",
              )}
            >
              <HStack spacing="micro" align="center">
                <StatusDot status={p.status} />
                <NovaText variant="body" className="!text-[11px] truncate">{p.name}</NovaText>
              </HStack>
              <NovaText variant="label" muted className="w-10 text-right !text-[10px]">{p.pid}</NovaText>
              <NovaText
                variant="label"
                className={cn("w-12 text-right !text-[10px]", p.cpu > 10 ? "!text-[hsl(0_70%_55%)]" : p.cpu > 5 ? "!text-[hsl(45_80%_50%)]" : "")}
              >
                {p.cpu.toFixed(1)}%
              </NovaText>
              <NovaText variant="label" muted className="w-14 text-right !text-[10px]">{p.mem.toFixed(0)} MB</NovaText>
              <NovaText variant="label" muted className="w-8 text-right !text-[10px]">{p.threads}</NovaText>
            </div>
          ))}
        </div>
      </NovaCard>
    </VStack>
  );

  // ── Network Section ────────────────────────────────────────
  const renderNetwork = () => (
    <VStack spacing="normal">
      <HStack spacing="tight" justify="between" align="center">
        <VStack spacing="micro">
          <NovaText variant="heading">Network Activity</NovaText>
          <NovaText variant="label" muted>Wi-Fi — SITA-5G · 866 Mbps</NovaText>
        </VStack>
        <VStack spacing="micro" className="text-right">
          <HStack spacing="micro" align="center" justify="end">
            <ArrowDown className="w-3 h-3 text-[hsl(210_80%_55%)]" />
            <NovaText variant="body" className="!text-[hsl(210_80%_55%)]">
              {latestNet ? `${latestNet.down.toFixed(1)} MB/s` : "—"}
            </NovaText>
          </HStack>
          <HStack spacing="micro" align="center" justify="end">
            <ArrowUp className="w-3 h-3 text-[hsl(142_70%_50%)]" />
            <NovaText variant="body" className="!text-[hsl(142_70%_50%)]">
              {latestNet ? `${latestNet.up.toFixed(1)} MB/s` : "—"}
            </NovaText>
          </HStack>
        </VStack>
      </HStack>

      <NovaCard>
        <NovaText variant="label" muted className="mb-2">Throughput — 60s</NovaText>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={netHistory} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="netDown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(210, 80%, 55%)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(210, 80%, 55%)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="netUp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142, 70%, 50%)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(142, 70%, 50%)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: "hsl(0 0% 50%)" }} interval={9} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(0 0% 50%)" }} axisLine={false} tickLine={false} unit=" MB/s" />
              <Tooltip
                contentStyle={{ background: "hsl(0 0% 10% / 0.9)", border: "none", borderRadius: 8, fontSize: 11, color: "#fff" }}
                formatter={(v: number, name: string) => [`${v.toFixed(2)} MB/s`, name === "down" ? "Download" : "Upload"]}
              />
              <Area type="monotone" dataKey="down" stroke="hsl(210, 80%, 55%)" fill="url(#netDown)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="up" stroke="hsl(142, 70%, 50%)" fill="url(#netUp)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </NovaCard>

      {/* Connection details */}
      <NovaCard>
        <NovaText variant="label" muted className="mb-2">Connection Details</NovaText>
        <VStack spacing="micro">
          {[
            ["Interface", "Wi-Fi (en0)"],
            ["SSID", "SITA-5G"],
            ["IP Address", "192.168.1.42"],
            ["Gateway", "192.168.1.1"],
            ["DNS", "1.1.1.1, 8.8.8.8"],
            ["Link Speed", "866 Mbps"],
            ["Signal", "-42 dBm (Excellent)"],
          ].map(([label, value]) => (
            <HStack key={label} spacing="tight" justify="between" align="center" className="px-1">
              <NovaText variant="label" muted>{label}</NovaText>
              <NovaText variant="body" className="!text-[11px]">{value}</NovaText>
            </HStack>
          ))}
        </VStack>
      </NovaCard>
    </VStack>
  );

  // ── GPU Section ────────────────────────────────────────────
  const renderGpu = () => {
    const gpuLoad = 25 + Math.sin(tickRef.current * 0.08) * 15 + Math.random() * 10;
    const gpuTemp = 45 + gpuLoad * 0.3;

    return (
      <VStack spacing="normal">
        <HStack spacing="tight" justify="between" align="center">
          <VStack spacing="micro">
            <NovaText variant="heading">GPU</NovaText>
            <NovaText variant="label" muted>Integrated — 10-core GPU</NovaText>
          </VStack>
          <div className="text-right">
            <NovaText variant="heading" className="!text-[hsl(45_80%_50%)]">
              {gpuLoad.toFixed(0)}%
            </NovaText>
            <NovaText variant="label" muted>{gpuTemp.toFixed(0)}°C</NovaText>
          </div>
        </HStack>

        <NovaCard>
          <NovaText variant="label" muted className="mb-2">GPU Core Utilization</NovaText>
          <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: 10 }, (_, i) => {
              const coreLoad = Math.max(5, gpuLoad + (Math.random() - 0.5) * 40);
              const clamped = Math.min(100, Math.max(0, coreLoad));
              return (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <div className="w-full h-[32px] rounded bg-[hsl(0_0%_0%/0.04)] dark:bg-[hsl(0_0%_100%/0.04)] relative overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-b transition-all duration-700"
                      style={{
                        height: `${clamped}%`,
                        background: clamped > 70
                          ? "linear-gradient(to top, hsl(0, 70%, 55%), hsl(45, 80%, 55%))"
                          : "linear-gradient(to top, hsl(45, 80%, 55%), hsl(45, 80%, 65%))",
                      }}
                    />
                  </div>
                  <NovaText variant="label" muted className="!text-[8px]">G{i}</NovaText>
                </div>
              );
            })}
          </div>
        </NovaCard>

        <NovaCard>
          <NovaText variant="label" muted className="mb-2">GPU Details</NovaText>
          <VStack spacing="micro">
            {[
              ["Renderer", "Apple GPU (10-core)"],
              ["VRAM", "Shared — 16 GB Unified"],
              ["Metal Support", "Metal 3"],
              ["Display", "2560 × 1600 @ 120Hz"],
              ["Power", gpuLoad > 50 ? "High Performance" : "Efficient"],
            ].map(([label, value]) => (
              <HStack key={label} spacing="tight" justify="between" align="center" className="px-1">
                <NovaText variant="label" muted>{label}</NovaText>
                <NovaText variant="body" className="!text-[11px]">{value}</NovaText>
              </HStack>
            ))}
          </VStack>
        </NovaCard>
      </VStack>
    );
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <AppLayout
      sidebar={sidebar}
      sidebarWidth={155}
      toolbar={toolbar}
      minHeight={420}
    >
      {section === "cpu" && renderCpu()}
      {section === "memory" && renderMemory()}
      {section === "processes" && renderProcesses()}
      {section === "network" && renderNetwork()}
      {section === "gpu" && renderGpu()}
    </AppLayout>
  );
}
