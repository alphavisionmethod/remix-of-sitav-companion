// ═══════════════════════════════════════════════════════════════
// SITA OS — System Monitor Window
// Real-time CPU, memory, process list, network, GPU, services
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Cpu, HardDrive, Activity, Wifi, Zap, BarChart3,
  ArrowUp, ArrowDown, Pause, Play, Server, Thermometer, Fan,
  Battery, BatteryCharging, PlugZap,
} from "lucide-react";
import {
  AppLayout,
  VStack, HStack, Divider,
} from "@/platform/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard, NovaList,
  NovaSectionLabel, NovaBadge,
} from "@/platform/nova-sdk/ui/components";
import { APP_COMPONENTS } from "@/platform/design-system/app-window-system";
import { cn } from "@/lib/utils";
import { NovaCanvasChart, type ChartSeries } from "./NovaCanvasChart";
import { NovaCanvasBars, type BarItem } from "./NovaCanvasBars";
import type { NovaColor } from "@/platform/nova-sdk/graphics/context";
import { ServiceManager, type ServiceLogEntry } from "@/platform/nova-sdk/services/service-manager";
import { PowerManager } from "@/platform/nova-sdk/kernel/power-manager";

// ── Types ────────────────────────────────────────────────────

interface ProcessInfo {
  pid: number; name: string; cpu: number; mem: number;
  status: "running" | "sleeping" | "idle"; threads: number;
}

interface NetworkSample { time: string; up: number; down: number; }
interface CpuSample { time: string; user: number; system: number; idle: number; }
interface MemSample { time: string; used: number; cached: number; free: number; }

// ── Colors ───────────────────────────────────────────────────

const COLORS = {
  cpuUser:   { h: 210, s: 80, l: 55 } as NovaColor,
  cpuSystem: { h: 265, s: 55, l: 58 } as NovaColor,
  memUsed:   { h: 265, s: 55, l: 58 } as NovaColor,
  memCached: { h: 210, s: 80, l: 55 } as NovaColor,
  netDown:   { h: 210, s: 80, l: 55 } as NovaColor,
  netUp:     { h: 142, s: 70, l: 50 } as NovaColor,
  barLow:    { h: 210, s: 80, l: 55 } as NovaColor,
  barHigh:   { h: 0, s: 70, l: 55 } as NovaColor,
  gpuLow:    { h: 45, s: 80, l: 55 } as NovaColor,
  gpuHigh:   { h: 0, s: 70, l: 55 } as NovaColor,
  iopsRead:  { h: 210, s: 80, l: 55 } as NovaColor,
  iopsWrite: { h: 340, s: 75, l: 55 } as NovaColor,
  thermalCpu: { h: 0, s: 70, l: 55 } as NovaColor,
  thermalGpu: { h: 45, s: 80, l: 55 } as NovaColor,
  thermalSsd: { h: 210, s: 80, l: 55 } as NovaColor,
  battLevel:  { h: 142, s: 70, l: 50 } as NovaColor,
  battPower:  { h: 265, s: 55, l: 58 } as NovaColor,
  battTemp:   { h: 38, s: 85, l: 58 } as NovaColor,
};

// ── Simulated Data ────────────────────────────────────────────

const PROCESS_NAMES = [
  "sita-shell", "nova-compositor", "sita-kernel", "watchdog",
  "advisor-runtime", "sound-engine", "fs-daemon", "net-stack",
  "gpu-compositor", "trust-engine", "calm-engine", "gesture-svc",
  "notif-router", "ipc-bridge", "scheduler", "memory-mgr",
  "auth-service", "render-proc", "wayland-srv", "dbus-daemon",
];

function generateProcesses(): ProcessInfo[] {
  return PROCESS_NAMES.map((name, i) => ({
    pid: 1000 + i * 7, name,
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

function timeLabel(i: number): string { return `${i % 60}s`; }

// ── Sidebar Sections ─────────────────────────────────────────

type MonitorSection = "cpu" | "memory" | "processes" | "network" | "gpu" | "disk" | "thermal" | "battery" | "services";

const SECTIONS: { id: MonitorSection; label: string; icon: React.ReactNode }[] = [
  { id: "cpu", label: "CPU", icon: <Cpu className="w-3.5 h-3.5" /> },
  { id: "memory", label: "Memory", icon: <HardDrive className="w-3.5 h-3.5" /> },
  { id: "processes", label: "Processes", icon: <Activity className="w-3.5 h-3.5" /> },
  { id: "network", label: "Network", icon: <Wifi className="w-3.5 h-3.5" /> },
  { id: "gpu", label: "GPU", icon: <Zap className="w-3.5 h-3.5" /> },
  { id: "disk", label: "Disk", icon: <HardDrive className="w-3.5 h-3.5" /> },
  { id: "thermal", label: "Thermal", icon: <Thermometer className="w-3.5 h-3.5" /> },
  { id: "battery", label: "Battery", icon: <Battery className="w-3.5 h-3.5" /> },
  { id: "services", label: "Services", icon: <Server className="w-3.5 h-3.5" /> },
];

// ── Sparkline ────────────────────────────────────────────────

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
        <linearGradient id={`spark-${color.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <polygon points={`0,${height} ${points} 100,${height}`} fill={`url(#spark-${color.replace(/[^a-z0-9]/gi, "")})`} />
    </svg>
  );
}

function StatusDot({ status }: { status: ProcessInfo["status"] }) {
  const colors = { running: "bg-[hsl(142_70%_50%)]", sleeping: "bg-[hsl(45_80%_55%)]", idle: "bg-[hsl(0_0%_50%)]" };
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
  const [diskHistory, setDiskHistory] = useState<{ time: string; read: number; write: number }[]>([]);
  const [diskSpark, setDiskSpark] = useState<number[]>(() => Array(30).fill(0));
  const [iopsHistory, setIopsHistory] = useState<{ time: string; read: number; write: number }[]>([]);
  const [latencyHistory, setLatencyHistory] = useState<{ time: string; read: number; write: number }[]>([]);
  const [thermalHistory, setThermalHistory] = useState<{ time: string; cpu: number; gpu: number; ssd: number; ambient: number }[]>([]);
  const [thermalSpark, setThermalSpark] = useState<number[]>(() => Array(30).fill(0));
  const [fanRpm, setFanRpm] = useState(1200);
  const [queueDepth, setQueueDepth] = useState(4);

  // Battery state
  const [battLevelHistory, setBattLevelHistory] = useState<number[]>(() => Array(60).fill(78));
  const [battPowerHistory, setBattPowerHistory] = useState<number[]>(() => Array(60).fill(14));
  const [battTempHistory, setBattTempHistory] = useState<number[]>(() => Array(60).fill(34));
  const [battSpark, setBattSpark] = useState<number[]>(() => Array(30).fill(78));

  // Services state
  const [servicesDiag, setServicesDiag] = useState<Record<string, Record<string, unknown>>>({});
  const [bootLog, setBootLog] = useState<readonly ServiceLogEntry[]>([]);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      tickRef.current++;
      const t = timeLabel(tickRef.current);

      const user = 15 + Math.sin(tickRef.current * 0.1) * 10 + Math.random() * 8;
      const system = 5 + Math.random() * 6;
      setCpuHistory(prev => [...prev.slice(-59), { time: t, user, system, idle: 100 - user - system }]);
      setCpuSpark(prev => [...prev.slice(-29), user + system]);

      const used = 4.2 + Math.sin(tickRef.current * 0.05) * 0.8 + Math.random() * 0.3;
      const cached = 1.8 + Math.random() * 0.4;
      setMemHistory(prev => [...prev.slice(-59), { time: t, used, cached, free: 16 - used - cached }]);
      setMemSpark(prev => [...prev.slice(-29), (used / 16) * 100]);

      const down = 2.5 + Math.sin(tickRef.current * 0.15) * 2 + Math.random() * 1.5;
      const up = 0.8 + Math.random() * 1.2;
      setNetHistory(prev => [...prev.slice(-59), { time: t, up, down }]);

      const diskRead = 120 + Math.sin(tickRef.current * 0.08) * 80 + Math.random() * 40;
      const diskWrite = 45 + Math.sin(tickRef.current * 0.12) * 30 + Math.random() * 25;
      setDiskHistory(prev => [...prev.slice(-59), { time: t, read: diskRead, write: diskWrite }]);
      setDiskSpark(prev => [...prev.slice(-29), diskRead + diskWrite]);

      // IOPS
      const iopsRead = 8000 + Math.sin(tickRef.current * 0.1) * 3000 + Math.random() * 2000;
      const iopsWrite = 3000 + Math.sin(tickRef.current * 0.13) * 2000 + Math.random() * 1500;
      setIopsHistory(prev => [...prev.slice(-59), { time: t, read: iopsRead, write: iopsWrite }]);

      // Latency
      const latRead = 0.2 + Math.random() * 0.6;
      const latWrite = 0.5 + Math.random() * 1.0;
      setLatencyHistory(prev => [...prev.slice(-59), { time: t, read: latRead, write: latWrite }]);

      // Queue depth
      setQueueDepth(Math.floor(1 + Math.random() * 16 + (diskRead > 180 ? 8 : 0)));

      // Thermal sensors
      const cpuTemp = 45 + (user / 100) * 30 + Math.random() * 3;
      const gpuTemp2 = 40 + Math.sin(tickRef.current * 0.08) * 10 + Math.random() * 5;
      const ssdTemp = 38 + Math.sin(tickRef.current * 0.04) * 7 + Math.random() * 3;
      const ambientTemp = 28 + Math.sin(tickRef.current * 0.02) * 3 + Math.random() * 2;
      setThermalHistory(prev => [...prev.slice(-59), { time: t, cpu: cpuTemp, gpu: gpuTemp2, ssd: ssdTemp, ambient: ambientTemp }]);
      setThermalSpark(prev => [...prev.slice(-29), cpuTemp]);
      setFanRpm(Math.floor(1000 + cpuTemp * 15 + Math.random() * 200));

      // Battery — pull from PowerManager
      const pwrStats = PowerManager.getStats();
      setBattLevelHistory(prev => [...prev.slice(-59), pwrStats.battery.level]);
      const powerW = Math.abs(pwrStats.battery.current * pwrStats.battery.voltage) / 1_000_000;
      setBattPowerHistory(prev => [...prev.slice(-59), powerW]);
      setBattTempHistory(prev => [...prev.slice(-59), pwrStats.battery.temperature]);
      setBattSpark(prev => [...prev.slice(-29), pwrStats.battery.level]);

      if (tickRef.current % 3 === 0) setProcesses(generateProcesses());

      // Refresh services every 2s
      if (tickRef.current % 2 === 0 && section === "services") {
        setServicesDiag(ServiceManager.getDiagnostics());
        setBootLog(ServiceManager.getBootLog());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [paused, section]);

  // Load services on first view
  useEffect(() => {
    if (section === "services") {
      setServicesDiag(ServiceManager.getDiagnostics());
      setBootLog(ServiceManager.getBootLog());
    }
  }, [section]);

  const latestDisk = diskHistory[diskHistory.length - 1];
  const latestIops = iopsHistory[iopsHistory.length - 1];
  const latestLatency = latencyHistory[latencyHistory.length - 1];
  const latestThermal = thermalHistory[thermalHistory.length - 1];

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

  const cpuSeries: ChartSeries[] = useMemo(() => [
    { key: "system", color: COLORS.cpuSystem, fillOpacity: 0.3, data: cpuHistory.map(s => s.system) },
    { key: "user", color: COLORS.cpuUser, fillOpacity: 0.35, data: cpuHistory.map(s => s.user) },
  ], [cpuHistory]);

  const memSeries: ChartSeries[] = useMemo(() => [
    { key: "cached", color: COLORS.memCached, fillOpacity: 0.15, data: memHistory.map(s => s.cached) },
    { key: "used", color: COLORS.memUsed, fillOpacity: 0.35, data: memHistory.map(s => s.used) },
  ], [memHistory]);

  const netSeries: ChartSeries[] = useMemo(() => [
    { key: "download", color: COLORS.netDown, fillOpacity: 0.3, data: netHistory.map(s => s.down) },
    { key: "upload", color: COLORS.netUp, fillOpacity: 0.25, data: netHistory.map(s => s.up) },
  ], [netHistory]);

  const diskSeries: ChartSeries[] = useMemo(() => [
    { key: "read", color: { h: 142, s: 70, l: 50 } as NovaColor, fillOpacity: 0.3, data: diskHistory.map(s => s.read) },
    { key: "write", color: { h: 340, s: 75, l: 55 } as NovaColor, fillOpacity: 0.25, data: diskHistory.map(s => s.write) },
  ], [diskHistory]);

  const iopsSeries: ChartSeries[] = useMemo(() => [
    { key: "readIOPS", color: COLORS.iopsRead, fillOpacity: 0.25, data: iopsHistory.map(s => s.read) },
    { key: "writeIOPS", color: COLORS.iopsWrite, fillOpacity: 0.2, data: iopsHistory.map(s => s.write) },
  ], [iopsHistory]);

  const thermalSeries: ChartSeries[] = useMemo(() => [
    { key: "cpu", color: COLORS.thermalCpu, fillOpacity: 0.2, data: thermalHistory.map(s => s.cpu) },
    { key: "gpu", color: COLORS.thermalGpu, fillOpacity: 0.15, data: thermalHistory.map(s => s.gpu) },
    { key: "ssd", color: COLORS.thermalSsd, fillOpacity: 0.15, data: thermalHistory.map(s => s.ssd) },
  ], [thermalHistory]);

  const coreBars: BarItem[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const load = Math.max(5, totalCpu + (Math.random() - 0.5) * 30);
      return { label: `C${i}`, value: Math.min(100, Math.max(0, load)), colorLow: COLORS.barLow, colorHigh: COLORS.barHigh };
    });
  }, [totalCpu]);

  // ── Sidebar ────────────────────────────────────────────────
  const sidebar = (
    <VStack spacing="tight">
      <NovaSectionLabel className="!px-0 !mb-1">Monitor</NovaSectionLabel>
      <NovaList
        items={SECTIONS.map(s => ({
          id: s.id, label: s.label, icon: s.icon,
        }))}
        activeId={section}
        onSelect={(id) => setSection(id as MonitorSection)}
      />
      <Divider className="!my-2" />

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
            <NovaText variant="label">{latestNet ? `${latestNet.down.toFixed(1)} MB/s` : "—"}</NovaText>
          </HStack>
        </div>

        <div className="rounded-lg bg-[hsl(0_0%_0%/0.03)] dark:bg-[hsl(0_0%_100%/0.03)] p-2">
          <HStack spacing="micro" align="center" justify="between">
            <NovaText variant="label" muted>Temp</NovaText>
            <NovaText variant="label" className={cn(
              latestThermal && latestThermal.cpu > 75 ? "!text-[hsl(0_70%_55%)]"
              : latestThermal && latestThermal.cpu > 60 ? "!text-[hsl(45_80%_50%)]"
              : "!text-[hsl(142_70%_50%)]"
            )}>
              {latestThermal ? `${latestThermal.cpu.toFixed(0)}°C` : "—"}
            </NovaText>
          </HStack>
          <Sparkline data={thermalSpark} color="hsl(0, 70%, 55%)" />
        </div>

        <div className="rounded-lg bg-[hsl(0_0%_0%/0.03)] dark:bg-[hsl(0_0%_100%/0.03)] p-2">
          <HStack spacing="micro" align="center" justify="between">
            <NovaText variant="label" muted>Battery</NovaText>
            <NovaText variant="label" className={cn(
              battSpark[battSpark.length - 1] < 15 ? "!text-[hsl(0_70%_55%)]"
              : battSpark[battSpark.length - 1] < 30 ? "!text-[hsl(45_80%_50%)]"
              : "!text-[hsl(142_70%_50%)]"
            )}>
              {battSpark[battSpark.length - 1]?.toFixed(0) ?? "—"}%
            </NovaText>
          </HStack>
          <Sparkline data={battSpark} color="hsl(142, 70%, 50%)" />
        </div>
      </VStack>
    </VStack>
  );

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
        <NovaCanvasChart series={cpuSeries} stacked maxY={100} height={180} yUnit="%" />
      </NovaCard>

      <NovaCard>
        <NovaText variant="label" muted className="mb-2">Core Utilization</NovaText>
        <NovaCanvasBars bars={coreBars} vertical columns={4} />
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

      <NovaCard>
        <NovaText variant="label" muted className="mb-2">Memory Pressure</NovaText>
        <NovaCanvasBars
          bars={[
            { label: "Used", value: memPercent, colorLow: COLORS.memUsed, colorHigh: COLORS.barHigh, threshold: 80 },
            { label: "Cached", value: latestMem ? (latestMem.cached / 16) * 100 : 0, colorLow: COLORS.memCached, colorHigh: COLORS.memCached },
          ]}
          barHeight={16} gap={4}
        />
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
        <NovaCanvasChart series={memSeries} stacked maxY={16} height={160} yUnit=" GB" />
      </NovaCard>

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
                APP_COMPONENTS.button.base, "!text-[10px] !px-2 !py-0.5",
                sortBy === key ? APP_COMPONENTS.button.primary : APP_COMPONENTS.button.ghost,
              )}
            >
              {key === "cpu" ? "CPU" : key === "mem" ? "Memory" : "Name"}
            </button>
          ))}
        </HStack>
      </HStack>

      <NovaCard className="!p-0 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-3 px-3 py-1.5 border-b border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_0%/0.02)] dark:bg-[hsl(0_0%_100%/0.02)]">
          <NovaText variant="label" muted>Process</NovaText>
          <NovaText variant="label" muted className="w-10 text-right">PID</NovaText>
          <NovaText variant="label" muted className="w-12 text-right">CPU</NovaText>
          <NovaText variant="label" muted className="w-14 text-right">Mem</NovaText>
          <NovaText variant="label" muted className="w-8 text-right">Thr</NovaText>
        </div>

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
              <NovaText variant="label" className={cn("w-12 text-right !text-[10px]", p.cpu > 10 ? "!text-[hsl(0_70%_55%)]" : p.cpu > 5 ? "!text-[hsl(45_80%_50%)]" : "")}>
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
        <NovaCanvasChart series={netSeries} maxY={10} height={180} yUnit=" MB/s" />
      </NovaCard>

      <NovaCard>
        <NovaText variant="label" muted className="mb-2">Connection Details</NovaText>
        <VStack spacing="micro">
          {[
            ["Interface", "Wi-Fi (en0)"], ["SSID", "SITA-5G"], ["IP Address", "192.168.1.42"],
            ["Gateway", "192.168.1.1"], ["DNS", "1.1.1.1, 8.8.8.8"], ["Link Speed", "866 Mbps"],
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

    const gpuBars: BarItem[] = Array.from({ length: 10 }, (_, i) => {
      const coreLoad = Math.max(5, gpuLoad + (Math.random() - 0.5) * 40);
      return { label: `G${i}`, value: Math.min(100, Math.max(0, coreLoad)), colorLow: COLORS.gpuLow, colorHigh: COLORS.gpuHigh };
    });

    return (
      <VStack spacing="normal">
        <HStack spacing="tight" justify="between" align="center">
          <VStack spacing="micro">
            <NovaText variant="heading">GPU</NovaText>
            <NovaText variant="label" muted>Integrated — 10-core GPU</NovaText>
          </VStack>
          <div className="text-right">
            <NovaText variant="heading" className="!text-[hsl(45_80%_50%)]">{gpuLoad.toFixed(0)}%</NovaText>
            <NovaText variant="label" muted>{gpuTemp.toFixed(0)}°C</NovaText>
          </div>
        </HStack>

        <NovaCard>
          <NovaText variant="label" muted className="mb-2">GPU Core Utilization</NovaText>
          <NovaCanvasBars bars={gpuBars} vertical columns={5} />
        </NovaCard>

        <NovaCard>
          <NovaText variant="label" muted className="mb-2">GPU Details</NovaText>
          <VStack spacing="micro">
            {[
              ["Renderer", "Apple GPU (10-core)"], ["VRAM", "Shared — 16 GB Unified"],
              ["Metal Support", "Metal 3"], ["Display", "2560 × 1600 @ 120Hz"],
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

  // ── Services Section ───────────────────────────────────────
  const renderServices = () => {
    const serviceIds = Object.keys(servicesDiag);
    const totalServices = serviceIds.length;
    const runningCount = serviceIds.filter(id => servicesDiag[id]?.status === "running").length;
    const failedCount = serviceIds.filter(id => servicesDiag[id]?.status === "failed").length;

    const statusColor = (status: unknown) => {
      switch (status) {
        case "running": return "bg-[hsl(142_70%_50%)]";
        case "starting": return "bg-[hsl(45_80%_55%)]";
        case "failed": return "bg-[hsl(0_70%_55%)]";
        case "stopped": return "bg-[hsl(0_0%_50%)]";
        default: return "bg-[hsl(0_0%_40%)]";
      }
    };

    const statusBadge = (status: unknown) => {
      switch (status) {
        case "running": return "success" as const;
        case "starting": return "warning" as const;
        case "failed": return "default" as const;
        default: return "default" as const;
      }
    };

    return (
      <VStack spacing="normal">
        <HStack spacing="tight" justify="between" align="center">
          <VStack spacing="micro">
            <NovaText variant="heading">System Services</NovaText>
            <NovaText variant="label" muted>{totalServices} registered · {runningCount} running</NovaText>
          </VStack>
          <VStack spacing="micro" className="text-right">
            {failedCount > 0 ? (
              <NovaBadge variant="default" className="!text-[hsl(0_70%_55%)] !text-[9px]">
                {failedCount} FAILED
              </NovaBadge>
            ) : (
              <NovaBadge variant="success" className="!text-[9px]">ALL OK</NovaBadge>
            )}
          </VStack>
        </HStack>

        {/* Summary card */}
        <NovaCard>
          <HStack spacing="normal" justify="between">
            <VStack spacing="micro" align="center" className="flex-1">
              <NovaText variant="heading" className="!text-[hsl(142_70%_50%)]">{runningCount}</NovaText>
              <NovaText variant="label" muted>Running</NovaText>
            </VStack>
            <VStack spacing="micro" align="center" className="flex-1">
              <NovaText variant="heading" className={failedCount > 0 ? "!text-[hsl(0_70%_55%)]" : ""}>{failedCount}</NovaText>
              <NovaText variant="label" muted>Failed</NovaText>
            </VStack>
            <VStack spacing="micro" align="center" className="flex-1">
              <NovaText variant="heading">{totalServices}</NovaText>
              <NovaText variant="label" muted>Total</NovaText>
            </VStack>
          </HStack>
        </NovaCard>

        {/* Service list */}
        {serviceIds.length === 0 ? (
          <NovaCard>
            <VStack spacing="tight" align="center" className="py-4">
              <Server className="w-6 h-6 text-[hsl(0_0%_50%)]" />
              <NovaText variant="label" muted>No services registered</NovaText>
              <NovaText variant="label" muted className="!text-[10px]">Services boot with the kernel</NovaText>
            </VStack>
          </NovaCard>
        ) : (
          serviceIds.map(id => {
            const diag = servicesDiag[id] || {};
            const status = String(diag.status || "unknown");

            return (
              <NovaCard key={id}>
                <VStack spacing="tight">
                  <HStack spacing="tight" justify="between" align="center">
                    <HStack spacing="micro" align="center">
                      <div className={cn("w-2 h-2 rounded-full", statusColor(status))} />
                      <NovaText variant="body" className="!font-medium">{id}</NovaText>
                    </HStack>
                    <NovaBadge variant={statusBadge(status)} className="!text-[9px]">
                      {status.toUpperCase()}
                    </NovaBadge>
                  </HStack>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                    {Object.entries(diag)
                      .filter(([k]) => k !== "status" && k !== "userOverrides" && k !== "runtimeOverrides")
                      .slice(0, 6)
                      .map(([key, value]) => (
                        <HStack key={key} spacing="micro" justify="between">
                          <NovaText variant="label" muted className="!text-[10px] truncate">{key}</NovaText>
                          <NovaText variant="label" className="!text-[10px]">
                            {typeof value === "number" ? value.toFixed(value % 1 ? 1 : 0)
                              : typeof value === "boolean" ? (value ? "✓" : "✗")
                              : String(value ?? "—").slice(0, 20)}
                          </NovaText>
                        </HStack>
                      ))}
                  </div>
                </VStack>
              </NovaCard>
            );
          })
        )}

        {/* Boot log timeline */}
        {bootLog.length > 0 && (
          <NovaCard>
            <NovaSectionLabel className="!px-0 !mb-1">Boot Timeline</NovaSectionLabel>
            <VStack spacing="micro">
              {bootLog.map((entry, i) => (
                <HStack key={i} spacing="tight" align="center" justify="between" className="px-1">
                  <HStack spacing="micro" align="center">
                    <div className={cn("w-1.5 h-1.5 rounded-full", entry.status === "ok" ? "bg-[hsl(142_70%_50%)]" : "bg-[hsl(0_70%_55%)]")} />
                    <NovaText variant="label" className="!text-[10px]">{entry.serviceId}</NovaText>
                  </HStack>
                  <NovaText variant="label" muted className="!text-[10px]">
                    {entry.timestampMs.toFixed(1)}ms
                  </NovaText>
                </HStack>
              ))}
            </VStack>
          </NovaCard>
        )}
      </VStack>
    );
  };

  // ── Disk Activity Section ────────────────────────────────────
  const MOUNTED_VOLUMES = [
    { name: "/", type: "sitafs", total: 512, used: 287, label: "Root" },
    { name: "/boot/efi", type: "fat32", total: 0.5, used: 0.1, label: "EFI" },
    { name: "/home", type: "sitafs", total: 256, used: 142, label: "Home" },
    { name: "/tmp", type: "tmpfs", total: 8, used: 1.2, label: "Temp" },
    { name: "/var/data", type: "sitafs", total: 128, used: 68, label: "Data" },
  ];

  const STORAGE_BREAKDOWN = [
    { label: "System", size: 48, color: { h: 210, s: 80, l: 55 } as NovaColor },
    { label: "Applications", size: 92, color: { h: 265, s: 55, l: 58 } as NovaColor },
    { label: "User Data", size: 142, color: { h: 142, s: 70, l: 50 } as NovaColor },
    { label: "Logs & Cache", size: 34, color: { h: 45, s: 80, l: 55 } as NovaColor },
    { label: "Proof Bundles", size: 18, color: { h: 340, s: 75, l: 55 } as NovaColor },
  ];
  const totalStorageUsed = STORAGE_BREAKDOWN.reduce((s, b) => s + b.size, 0);

  const renderDisk = () => (
    <VStack spacing="normal">
      <HStack spacing="tight" justify="between" align="center">
        <VStack spacing="micro">
          <NovaText variant="heading">Disk Activity</NovaText>
          <NovaText variant="label" muted>SitaFS — CoW journaled filesystem</NovaText>
        </VStack>
        <div className="text-right">
          <NovaText variant="heading" className="!text-[hsl(142_70%_50%)]">
            {latestDisk ? (latestDisk.read + latestDisk.write).toFixed(0) : "0"} MB/s
          </NovaText>
          <NovaText variant="label" muted>throughput</NovaText>
        </div>
      </HStack>

      {/* R/W throughput chart */}
      <NovaCard>
        <NovaText variant="label" muted className="mb-2">Read / Write Throughput — 60s</NovaText>
        <NovaCanvasChart series={diskSeries} stacked={false} maxY={400} height={180} yUnit=" MB/s" />
        <HStack spacing="normal" className="mt-2">
          <HStack spacing="micro" align="center">
            <div className="w-2 h-2 rounded-full bg-[hsl(142_70%_50%)]" />
            <NovaText variant="label" muted>Read {latestDisk ? `${latestDisk.read.toFixed(0)} MB/s` : ""}</NovaText>
          </HStack>
          <HStack spacing="micro" align="center">
            <div className="w-2 h-2 rounded-full bg-[hsl(340_75%_55%)]" />
            <NovaText variant="label" muted>Write {latestDisk ? `${latestDisk.write.toFixed(0)} MB/s` : ""}</NovaText>
          </HStack>
        </HStack>
      </NovaCard>

      {/* IOPS Chart */}
      <NovaCard>
        <NovaText variant="label" muted className="mb-2">Disk IOPS — 60s</NovaText>
        <NovaCanvasChart series={iopsSeries} stacked={false} maxY={20000} height={140} yUnit=" ops" />
        <HStack spacing="normal" className="mt-2">
          <HStack spacing="micro" align="center">
            <div className="w-2 h-2 rounded-full bg-[hsl(210_80%_55%)]" />
            <NovaText variant="label" muted>Read {latestIops ? `${(latestIops.read / 1000).toFixed(1)}K` : ""}</NovaText>
          </HStack>
          <HStack spacing="micro" align="center">
            <div className="w-2 h-2 rounded-full bg-[hsl(340_75%_55%)]" />
            <NovaText variant="label" muted>Write {latestIops ? `${(latestIops.write / 1000).toFixed(1)}K` : ""}</NovaText>
          </HStack>
        </HStack>
      </NovaCard>

      {/* Latency & Queue Depth */}
      <div className="grid grid-cols-2 gap-3">
        <NovaCard>
          <NovaText variant="label" muted className="mb-1">Read Latency</NovaText>
          <NovaText variant="heading" className={cn(
            "!text-lg",
            latestLatency && latestLatency.read > 3 ? "!text-[hsl(0_70%_55%)]"
            : latestLatency && latestLatency.read > 1 ? "!text-[hsl(45_80%_50%)]"
            : "!text-[hsl(142_70%_50%)]"
          )}>
            {latestLatency ? `${latestLatency.read.toFixed(2)}ms` : "—"}
          </NovaText>
          <Sparkline data={latencyHistory.map(l => l.read)} color="hsl(142, 70%, 50%)" height={24} />
        </NovaCard>
        <NovaCard>
          <NovaText variant="label" muted className="mb-1">Write Latency</NovaText>
          <NovaText variant="heading" className={cn(
            "!text-lg",
            latestLatency && latestLatency.write > 3 ? "!text-[hsl(0_70%_55%)]"
            : latestLatency && latestLatency.write > 1 ? "!text-[hsl(45_80%_50%)]"
            : "!text-[hsl(142_70%_50%)]"
          )}>
            {latestLatency ? `${latestLatency.write.toFixed(2)}ms` : "—"}
          </NovaText>
          <Sparkline data={latencyHistory.map(l => l.write)} color="hsl(45, 80%, 55%)" height={24} />
        </NovaCard>
      </div>

      {/* Queue Depth */}
      <NovaCard>
        <HStack spacing="tight" justify="between" align="center" className="mb-2">
          <NovaText variant="label" muted>I/O Queue Depth</NovaText>
          <NovaText variant="label" className={cn(queueDepth > 24 ? "!text-[hsl(0_70%_55%)]" : queueDepth > 12 ? "!text-[hsl(45_80%_50%)]" : "")}>
            {queueDepth}
          </NovaText>
        </HStack>
        <div className="h-3 rounded-full bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, (queueDepth / 32) * 100)}%`,
              backgroundColor: queueDepth > 24 ? "hsl(0, 70%, 55%)" : queueDepth > 12 ? "hsl(45, 80%, 55%)" : "hsl(210, 80%, 55%)",
            }}
          />
        </div>
      </NovaCard>

      {/* Storage usage breakdown */}
      <NovaCard>
        <NovaText variant="label" muted className="mb-2">Storage Usage Breakdown</NovaText>
        <div className="h-4 rounded-full overflow-hidden flex bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.06)]">
          {STORAGE_BREAKDOWN.map(b => (
            <div
              key={b.label}
              className="h-full"
              style={{
                width: `${(b.size / 512) * 100}%`,
                backgroundColor: `hsl(${b.color.h}, ${b.color.s}%, ${b.color.l}%)`,
              }}
              title={`${b.label}: ${b.size} GB`}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {STORAGE_BREAKDOWN.map(b => (
            <HStack key={b.label} spacing="micro" align="center">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(${b.color.h}, ${b.color.s}%, ${b.color.l}%)` }} />
              <NovaText variant="label" muted className="!text-[10px]">{b.label}</NovaText>
              <NovaText variant="label" className="!text-[10px] ml-auto">{b.size} GB</NovaText>
            </HStack>
          ))}
        </div>
        <HStack spacing="tight" justify="between" className="mt-2 pt-2 border-t border-border/30">
          <NovaText variant="label" muted>Total Used</NovaText>
          <NovaText variant="label">{totalStorageUsed} GB / 512 GB ({((totalStorageUsed / 512) * 100).toFixed(0)}%)</NovaText>
        </HStack>
      </NovaCard>

      {/* Mounted volumes */}
      <NovaCard>
        <NovaText variant="label" muted className="mb-2">Mounted Volumes</NovaText>
        <VStack spacing="tight">
          {MOUNTED_VOLUMES.map(vol => {
            const pct = (vol.used / vol.total) * 100;
            return (
              <div key={vol.name} className="p-2 rounded-lg border border-border/30">
                <HStack spacing="tight" justify="between" align="center">
                  <VStack spacing="micro">
                    <HStack spacing="micro" align="center">
                      <HardDrive className="w-3 h-3 text-muted-foreground" />
                      <NovaText variant="body" className="!text-[11px] !font-medium">{vol.label}</NovaText>
                      <NovaBadge variant="default" className="!text-[8px]">{vol.type}</NovaBadge>
                    </HStack>
                    <NovaText variant="label" muted className="!text-[10px]">{vol.name}</NovaText>
                  </VStack>
                  <NovaText variant="label" className={cn("!text-[11px]", pct > 80 ? "!text-[hsl(0_70%_55%)]" : "")}>
                    {vol.used} / {vol.total} GB
                  </NovaText>
                </HStack>
                <div className="h-1.5 rounded-full bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.06)] mt-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      backgroundColor: pct > 80 ? "hsl(0, 70%, 55%)" : pct > 60 ? "hsl(45, 80%, 55%)" : "hsl(210, 80%, 55%)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </VStack>
      </NovaCard>
    </VStack>
  );

  // ── Thermal Sensors Section ──────────────────────────────────
  const THERMAL_SENSORS = useMemo(() => {
    if (!latestThermal) return [];
    const cpuBase = latestThermal.cpu;
    return [
      { name: "CPU Package", temp: cpuBase, min: 35, max: 95 },
      { name: "CPU Core 0", temp: cpuBase + (Math.random() - 0.5) * 4, min: 35, max: 95 },
      { name: "CPU Core 1", temp: cpuBase - 1 + (Math.random() - 0.5) * 3, min: 35, max: 95 },
      { name: "CPU Core 2", temp: cpuBase + 1 + (Math.random() - 0.5) * 3, min: 35, max: 95 },
      { name: "CPU Core 3", temp: cpuBase - 2 + (Math.random() - 0.5) * 4, min: 35, max: 95 },
      { name: "GPU Die", temp: latestThermal.gpu, min: 30, max: 90 },
      { name: "SSD Controller", temp: latestThermal.ssd, min: 25, max: 70 },
      { name: "Ambient", temp: latestThermal.ambient, min: 20, max: 50 },
    ];
  }, [latestThermal]);

  const thermalStatus = useMemo(() => {
    if (!latestThermal) return "normal";
    if (latestThermal.cpu > 80 || latestThermal.gpu > 80) return "critical";
    if (latestThermal.cpu > 65 || latestThermal.gpu > 65) return "warning";
    return "normal";
  }, [latestThermal]);

  const renderThermal = () => (
    <VStack spacing="normal">
      <HStack spacing="tight" justify="between" align="center">
        <VStack spacing="micro">
          <NovaText variant="heading">Thermal Sensors</NovaText>
          <NovaText variant="label" muted>8 sensors · Real-time monitoring</NovaText>
        </VStack>
        <NovaBadge variant={thermalStatus === "critical" ? "default" : thermalStatus === "warning" ? "warning" : "success"} className={cn("!text-[9px]", thermalStatus === "critical" && "!text-[hsl(0_70%_55%)]")}>
          {thermalStatus.toUpperCase()}
        </NovaBadge>
      </HStack>

      {/* Sensor Grid */}
      <div className="grid grid-cols-2 gap-2">
        {THERMAL_SENSORS.map(sensor => {
          const pct = ((sensor.temp - sensor.min) / (sensor.max - sensor.min)) * 100;
          const color = sensor.temp > 80 ? "hsl(0, 70%, 55%)" : sensor.temp > 60 ? "hsl(45, 80%, 55%)" : "hsl(142, 70%, 50%)";
          return (
            <NovaCard key={sensor.name} className="!p-2.5">
              <HStack spacing="micro" justify="between" align="center">
                <NovaText variant="label" muted className="!text-[10px] truncate">{sensor.name}</NovaText>
                <NovaText variant="body" className="!text-[12px] !font-semibold" style={{ color }}>
                  {sensor.temp.toFixed(0)}°C
                </NovaText>
              </HStack>
              <div className="h-1.5 rounded-full bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.06)] mt-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: color }}
                />
              </div>
              <HStack spacing="micro" justify="between" className="mt-0.5">
                <NovaText variant="label" muted className="!text-[8px]">{sensor.min}°</NovaText>
                <NovaText variant="label" muted className="!text-[8px]">{sensor.max}°</NovaText>
              </HStack>
            </NovaCard>
          );
        })}
      </div>

      {/* Temperature History Chart */}
      <NovaCard>
        <NovaText variant="label" muted className="mb-2">Temperature History — 60s</NovaText>
        <NovaCanvasChart series={thermalSeries} stacked={false} maxY={100} height={160} yUnit="°C" />
        <HStack spacing="normal" className="mt-2">
          <HStack spacing="micro" align="center">
            <div className="w-2 h-2 rounded-full bg-[hsl(0_70%_55%)]" />
            <NovaText variant="label" muted>CPU</NovaText>
          </HStack>
          <HStack spacing="micro" align="center">
            <div className="w-2 h-2 rounded-full bg-[hsl(45_80%_55%)]" />
            <NovaText variant="label" muted>GPU</NovaText>
          </HStack>
          <HStack spacing="micro" align="center">
            <div className="w-2 h-2 rounded-full bg-[hsl(210_80%_55%)]" />
            <NovaText variant="label" muted>SSD</NovaText>
          </HStack>
        </HStack>
      </NovaCard>

      {/* Fan Speed */}
      <NovaCard>
        <HStack spacing="tight" justify="between" align="center">
          <HStack spacing="micro" align="center">
            <Fan className="w-4 h-4 text-muted-foreground animate-spin" style={{ animationDuration: `${Math.max(0.3, 3 - fanRpm / 1000)}s` }} />
            <VStack spacing="micro">
              <NovaText variant="body" className="!font-medium">System Fan</NovaText>
              <NovaText variant="label" muted className="!text-[10px]">Target: {Math.floor(fanRpm * 0.95)} RPM</NovaText>
            </VStack>
          </HStack>
          <VStack spacing="micro" className="text-right">
            <NovaText variant="heading" className="!text-lg">{fanRpm}</NovaText>
            <NovaText variant="label" muted>RPM</NovaText>
          </VStack>
        </HStack>
        <div className="h-2 rounded-full bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.06)] mt-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (fanRpm / 3000) * 100)}%`,
              backgroundColor: fanRpm > 2200 ? "hsl(0, 70%, 55%)" : fanRpm > 1500 ? "hsl(45, 80%, 55%)" : "hsl(210, 80%, 55%)",
            }}
          />
        </div>
      </NovaCard>
    </VStack>
  );

  // ── Battery Health & Power Section ───────────────────────────
  const pwrStats = PowerManager.getStats();
  const batt = pwrStats.battery;

  const battLevelSeries: ChartSeries[] = useMemo(() => [
    { key: "level", color: COLORS.battLevel, fillOpacity: 0.3, data: battLevelHistory },
  ], [battLevelHistory]);

  const battPowerSeries: ChartSeries[] = useMemo(() => [
    { key: "power", color: COLORS.battPower, fillOpacity: 0.25, data: battPowerHistory },
  ], [battPowerHistory]);

  const battTempSeries: ChartSeries[] = useMemo(() => [
    { key: "temp", color: COLORS.battTemp, fillOpacity: 0.2, data: battTempHistory },
  ], [battTempHistory]);

  const battHealthColor = batt.health > 80 ? "hsl(142, 70%, 50%)" : batt.health > 50 ? "hsl(45, 80%, 55%)" : "hsl(0, 70%, 55%)";
  const battLevelColor = batt.level > 30 ? "hsl(142, 70%, 50%)" : batt.level > 15 ? "hsl(45, 80%, 55%)" : "hsl(0, 70%, 55%)";

  const renderBattery = () => (
    <VStack spacing="normal">
      <HStack spacing="tight" justify="between" align="center">
        <VStack spacing="micro">
          <NovaText variant="heading">Battery Health & Power</NovaText>
          <NovaText variant="label" muted>
            {batt.charging ? "Charging" : "On Battery"} · {batt.cycleCount} charge cycles
          </NovaText>
        </VStack>
        <HStack spacing="micro" align="center">
          {batt.acConnected ? (
            <PlugZap className="w-4 h-4 text-[hsl(142_70%_50%)]" />
          ) : batt.charging ? (
            <BatteryCharging className="w-4 h-4 text-[hsl(45_80%_55%)]" />
          ) : (
            <Battery className="w-4 h-4 text-muted-foreground" />
          )}
          <NovaText variant="heading" className="!text-lg" style={{ color: battLevelColor }}>
            {batt.level.toFixed(0)}%
          </NovaText>
        </HStack>
      </HStack>

      {/* Key metrics row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Health", value: `${batt.health}%`, color: battHealthColor },
          { label: "Cycles", value: `${batt.cycleCount}`, color: undefined },
          { label: "Voltage", value: `${(batt.voltage / 1000).toFixed(1)}V`, color: undefined },
          { label: "Current", value: `${batt.current > 0 ? "+" : ""}${batt.current}mA`, color: batt.charging ? "hsl(142, 70%, 50%)" : "hsl(0, 70%, 55%)" },
        ].map(m => (
          <NovaCard key={m.label} className="!p-2.5 text-center">
            <NovaText variant="label" muted className="!text-[9px] uppercase tracking-wider">{m.label}</NovaText>
            <NovaText variant="body" className="!text-[14px] !font-semibold" style={m.color ? { color: m.color } : undefined}>
              {m.value}
            </NovaText>
          </NovaCard>
        ))}
      </div>

      {/* Capacity & health bar */}
      <NovaCard>
        <HStack spacing="tight" justify="between" align="center" className="mb-2">
          <NovaText variant="label" muted>Battery Capacity</NovaText>
          <NovaText variant="label" muted className="!text-[10px]">
            {(batt.remainingCapacity / 1000).toFixed(1)} / {(batt.fullCapacity / 1000).toFixed(1)} Wh
          </NovaText>
        </HStack>
        {/* Level bar */}
        <div className="space-y-1.5">
          <div>
            <HStack spacing="micro" justify="between" className="mb-0.5">
              <NovaText variant="label" muted className="!text-[9px]">Charge Level</NovaText>
              <NovaText variant="label" className="!text-[9px]" style={{ color: battLevelColor }}>{batt.level.toFixed(1)}%</NovaText>
            </HStack>
            <div className="h-2 rounded-full bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${batt.level}%`, backgroundColor: battLevelColor }} />
            </div>
          </div>
          {/* Health bar */}
          <div>
            <HStack spacing="micro" justify="between" className="mb-0.5">
              <NovaText variant="label" muted className="!text-[9px]">Battery Health</NovaText>
              <NovaText variant="label" className="!text-[9px]" style={{ color: battHealthColor }}>{batt.health}%</NovaText>
            </HStack>
            <div className="h-2 rounded-full bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${batt.health}%`, backgroundColor: battHealthColor }} />
            </div>
          </div>
        </div>
        {/* Design vs actual capacity */}
        <HStack spacing="tight" justify="between" className="mt-2">
          <NovaText variant="label" muted className="!text-[9px]">Design: {(batt.designCapacity / 1000).toFixed(1)} Wh</NovaText>
          <NovaText variant="label" muted className="!text-[9px]">Actual: {(batt.fullCapacity / 1000).toFixed(1)} Wh ({((batt.fullCapacity / batt.designCapacity) * 100).toFixed(0)}%)</NovaText>
        </HStack>
      </NovaCard>

      {/* Charge level history */}
      <NovaCard>
        <NovaText variant="label" muted className="mb-2">Charge Level — 60s Window</NovaText>
        <NovaCanvasChart series={battLevelSeries} maxY={100} height={140} yUnit="%" gridLines={4} />
      </NovaCard>

      {/* Power consumption */}
      <NovaCard>
        <NovaText variant="label" muted className="mb-2">Power Consumption — 60s Window</NovaText>
        <NovaCanvasChart series={battPowerSeries} height={120} yUnit="W" gridLines={3} />
        <HStack spacing="tight" justify="between" className="mt-1">
          <NovaText variant="label" muted className="!text-[9px]">
            {batt.charging ? "Charging at" : "Discharging at"} ~{battPowerHistory[battPowerHistory.length - 1]?.toFixed(1) ?? 0}W
          </NovaText>
          <NovaText variant="label" muted className="!text-[9px]">
            {batt.timeToEmpty != null ? `${batt.timeToEmpty} min remaining` : batt.timeToFull != null ? `${batt.timeToFull} min to full` : "Calculating…"}
          </NovaText>
        </HStack>
      </NovaCard>

      {/* Battery temperature */}
      <NovaCard>
        <HStack spacing="tight" justify="between" align="center" className="mb-2">
          <NovaText variant="label" muted>Battery Temperature</NovaText>
          <NovaText variant="label" className="!text-[11px] !font-semibold" style={{
            color: batt.temperature > 45 ? "hsl(0, 70%, 55%)" : batt.temperature > 38 ? "hsl(45, 80%, 55%)" : "hsl(142, 70%, 50%)",
          }}>
            {batt.temperature.toFixed(1)}°C
          </NovaText>
        </HStack>
        <NovaCanvasChart series={battTempSeries} height={100} yUnit="°C" gridLines={3} />
      </NovaCard>

      {/* Charge cycle tracking */}
      <NovaCard>
        <NovaText variant="label" muted className="mb-2">Charge Cycle Tracking</NovaText>
        <div className="grid grid-cols-3 gap-3">
          <VStack spacing="micro" className="text-center">
            <NovaText variant="heading" className="!text-xl">{batt.cycleCount}</NovaText>
            <NovaText variant="label" muted className="!text-[9px]">Total Cycles</NovaText>
          </VStack>
          <VStack spacing="micro" className="text-center">
            <NovaText variant="heading" className="!text-xl" style={{ color: battHealthColor }}>
              {batt.health}%
            </NovaText>
            <NovaText variant="label" muted className="!text-[9px]">Capacity Retained</NovaText>
          </VStack>
          <VStack spacing="micro" className="text-center">
            <NovaText variant="heading" className="!text-xl">
              {Math.max(0, Math.round(1000 - batt.cycleCount))}
            </NovaText>
            <NovaText variant="label" muted className="!text-[9px]">Cycles Remaining</NovaText>
          </VStack>
        </div>
        {/* Cycle progress bar to 1000 */}
        <div className="mt-3">
          <HStack spacing="micro" justify="between" className="mb-0.5">
            <NovaText variant="label" muted className="!text-[9px]">Cycle Life Progress</NovaText>
            <NovaText variant="label" muted className="!text-[9px]">{batt.cycleCount} / 1000</NovaText>
          </HStack>
          <div className="h-2 rounded-full bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (batt.cycleCount / 1000) * 100)}%`,
                backgroundColor: batt.cycleCount > 800 ? "hsl(0, 70%, 55%)" : batt.cycleCount > 500 ? "hsl(45, 80%, 55%)" : "hsl(142, 70%, 50%)",
              }}
            />
          </div>
        </div>
      </NovaCard>

      {/* AC / Power source info */}
      <NovaCard>
        <HStack spacing="tight" justify="between" align="center">
          <HStack spacing="micro" align="center">
            <PlugZap className={cn("w-4 h-4", batt.acConnected ? "text-[hsl(142_70%_50%)]" : "text-muted-foreground")} />
            <VStack spacing="micro">
              <NovaText variant="body" className="!font-medium">Power Source</NovaText>
              <NovaText variant="label" muted className="!text-[10px]">
                {batt.acConnected ? "AC Adapter Connected" : "Battery (Discharging)"}
              </NovaText>
            </VStack>
          </HStack>
          <NovaBadge variant={batt.acConnected ? "success" : "warning"} className="!text-[9px]">
            {batt.acConnected ? "AC" : "BATT"}
          </NovaBadge>
        </HStack>
      </NovaCard>
    </VStack>
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <AppLayout sidebar={sidebar} sidebarWidth={155} toolbar={toolbar} minHeight={420}>
      {section === "cpu" && renderCpu()}
      {section === "memory" && renderMemory()}
      {section === "processes" && renderProcesses()}
      {section === "network" && renderNetwork()}
      {section === "gpu" && renderGpu()}
      {section === "disk" && renderDisk()}
      {section === "thermal" && renderThermal()}
      {section === "battery" && renderBattery()}
      {section === "services" && renderServices()}
    </AppLayout>
  );
}
