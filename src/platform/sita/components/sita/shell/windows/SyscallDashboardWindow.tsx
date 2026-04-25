// ═══════════════════════════════════════════════════════════════
// Nova OS — Syscall Performance Dashboard Window
// Real-time per-type metrics, rate limits, mutex contention,
// IPC subsystem overview
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Zap, Activity, Shield, Timer, Lock, Radio,
  ArrowRightLeft, AlertTriangle, BarChart3, Cpu,
} from "lucide-react";
import {
  AppLayout, VStack, HStack,
} from "@/platform/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard,
  NovaSectionLabel, NovaBadge,
} from "@/platform/nova-sdk/ui/components";
import { APP_COMPONENTS } from "@/platform/design-system/app-window-system";
import { cn } from "@/lib/utils";
import { NovaCanvasChart, type ChartSeries } from "./NovaCanvasChart";
import type { NovaColor } from "@/platform/nova-sdk/graphics/context";
import {
  getSyscallStats, getSyscallLog, getSyscallMetrics,
  getRateLimitStatus, getMutexStatus,
  type SyscallLogEntry, type SyscallTypeMetrics,
} from "@/platform/nova-sdk/kernel/syscall";
import { IPCManager } from "@/platform/nova-sdk/kernel/ipc";

const MAX_HISTORY = 60;
function pushHistory(arr: number[], val: number): number[] {
  const next = [...arr, val];
  if (next.length > MAX_HISTORY) next.shift();
  return next;
}

type Tab = "metrics" | "ratelimit" | "mutex" | "ipc";

const TABS: { id: Tab; label: string; icon: typeof Zap }[] = [
  { id: "metrics",   label: "Metrics",     icon: BarChart3 },
  { id: "ratelimit", label: "Rate Limits",  icon: Shield },
  { id: "mutex",     label: "Mutexes",      icon: Lock },
  { id: "ipc",       label: "IPC",          icon: ArrowRightLeft },
];

export function SyscallDashboardWindow() {
  const [tab, setTab] = useState<Tab>("metrics");
  const [paused, setPaused] = useState(false);

  const [stats, setStats] = useState<ReturnType<typeof getSyscallStats> | null>(null);
  const [metrics, setMetrics] = useState<SyscallTypeMetrics[]>([]);
  const [log, setLog] = useState<readonly SyscallLogEntry[]>([]);
  const [rateLimits, setRateLimits] = useState<ReturnType<typeof getRateLimitStatus>>([]);
  const [mutexes, setMutexes] = useState<ReturnType<typeof getMutexStatus>>([]);
  const [ipcStats, setIpcStats] = useState(IPCManager.getStats());

  const [totalHistory, setTotalHistory] = useState<number[]>([]);
  const [avgLatencyHistory, setAvgLatencyHistory] = useState<number[]>([]);
  const [ipcMsgHistory, setIpcMsgHistory] = useState<number[]>([]);

  useEffect(() => {
    if (paused) return;
    const iv = setInterval(() => {
      const s = getSyscallStats();
      setStats(s);
      setMetrics(getSyscallMetrics());
      setLog(getSyscallLog().slice(-50));
      setRateLimits(getRateLimitStatus());
      setMutexes(getMutexStatus());

      const ipc = IPCManager.getStats();
      setIpcStats(ipc);

      setTotalHistory(prev => pushHistory(prev, s.total));
      setAvgLatencyHistory(prev => pushHistory(prev, s.avgMs));
      setIpcMsgHistory(prev => pushHistory(prev, ipc.messagesPerSecond));
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
        {tab === "metrics" && stats && (
          <MetricsTab stats={stats} metrics={metrics} totalHistory={totalHistory} avgLatencyHistory={avgLatencyHistory} />
        )}
        {tab === "ratelimit" && (
          <RateLimitTab rateLimits={rateLimits} />
        )}
        {tab === "mutex" && (
          <MutexTab mutexes={mutexes} />
        )}
        {tab === "ipc" && (
          <IPCTab stats={ipcStats} msgHistory={ipcMsgHistory} />
        )}
      </div>
    </AppLayout>
  );
}

// ═══════════════════════════════════════════════════════════════
// METRICS TAB
// ═══════════════════════════════════════════════════════════════

function MetricsTab({
  stats, metrics, totalHistory, avgLatencyHistory,
}: {
  stats: ReturnType<typeof getSyscallStats>;
  metrics: SyscallTypeMetrics[];
  totalHistory: number[];
  avgLatencyHistory: number[];
}) {
  const totalSeries = useMemo((): ChartSeries[] => {
    const deltas = totalHistory.map((v, i) => i > 0 ? v - totalHistory[i - 1] : 0);
    return [{ key: "syscalls/s", color: { h: 265, s: 65, l: 55 } as NovaColor, data: deltas, fillOpacity: 0.2 }];
  }, [totalHistory]);

  const latencySeries = useMemo((): ChartSeries[] => [
    { key: "avg ms", color: { h: 38, s: 85, l: 58 } as NovaColor, data: avgLatencyHistory, fillOpacity: 0.2 },
  ], [avgLatencyHistory]);

  return (
    <VStack spacing="tight">
      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={Zap} label="Total" value={stats.total.toLocaleString()} />
        <StatCard icon={Timer} label="Avg Latency" value={`${stats.avgMs}ms`} />
        <StatCard icon={Shield} label="Denied" value={stats.denied.toLocaleString()} variant={stats.denied > 0 ? "warning" : "default"} />
        <StatCard icon={AlertTriangle} label="Errors" value={`${stats.errors + stats.violations}`} variant={stats.errors + stats.violations > 0 ? "danger" : "default"} />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={Activity} label="Rate Limited" value={stats.rateLimited.toLocaleString()} />
        <StatCard icon={Lock} label="Mutex Blocked" value={stats.mutexBlocked.toLocaleString()} />
        <StatCard icon={ArrowRightLeft} label="Ring Trans" value={stats.ringTransitions.toLocaleString()} />
        <StatCard icon={Radio} label="Invalid Args" value={stats.invalidArgs.toLocaleString()} />
      </div>

      <NovaCard className="p-2">
        <NovaSectionLabel>Syscall Rate Over Time</NovaSectionLabel>
        <NovaCanvasChart series={totalSeries} height={100} yUnit="/s" gridLines={3} />
      </NovaCard>

      <NovaCard className="p-2">
        <NovaSectionLabel>Average Latency Over Time</NovaSectionLabel>
        <NovaCanvasChart series={latencySeries} height={90} yUnit="ms" gridLines={3} />
      </NovaCard>

      <NovaCard className="p-2">
        <NovaSectionLabel>Per-Type Metrics ({metrics.length})</NovaSectionLabel>
        <div className="max-h-[200px] overflow-y-auto">
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
    </VStack>
  );
}

// ═══════════════════════════════════════════════════════════════
// RATE LIMIT TAB
// ═══════════════════════════════════════════════════════════════

function RateLimitTab({ rateLimits }: { rateLimits: ReturnType<typeof getRateLimitStatus> }) {
  return (
    <VStack spacing="tight">
      <NovaCard className="p-3">
        <NovaSectionLabel>Rate Limit Policy</NovaSectionLabel>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] font-mono mt-1">
          <span className="text-muted-foreground">Max calls/sec</span><span>10,000</span>
          <span className="text-muted-foreground">Window</span><span>1,000ms</span>
          <span className="text-muted-foreground">Enforcement</span><span>Per-PID</span>
          <span className="text-muted-foreground">Action</span><span>EAGAIN (-11)</span>
        </div>
      </NovaCard>

      <NovaCard className="p-2">
        <NovaSectionLabel>Active Rate Counters ({rateLimits.length})</NovaSectionLabel>
        {rateLimits.length > 0 ? (
          <div className="space-y-2 mt-1">
            {rateLimits.map(rl => {
              const pct = (rl.count / rl.limit) * 100;
              const hot = pct > 80;
              return (
                <div key={rl.pid} className="p-2 rounded-lg bg-background/50 border border-border/30">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono">PID {rl.pid}</span>
                    <span className={cn("font-mono", hot ? "text-destructive" : "text-muted-foreground")}>
                      {rl.count.toLocaleString()} / {rl.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted/30 mt-1 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", hot ? "bg-destructive" : "bg-[hsl(265_65%_55%)]")}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Window: {rl.windowMs}ms</div>
                </div>
              );
            })}
          </div>
        ) : (
          <NovaText muted className="text-[10px] mt-1">No active rate counters — system idle</NovaText>
        )}
      </NovaCard>
    </VStack>
  );
}

// ═══════════════════════════════════════════════════════════════
// MUTEX TAB
// ═══════════════════════════════════════════════════════════════

function MutexTab({ mutexes }: { mutexes: ReturnType<typeof getMutexStatus> }) {
  return (
    <VStack spacing="tight">
      <NovaCard className="p-3">
        <NovaSectionLabel>Mutex Policy</NovaSectionLabel>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] font-mono mt-1">
          <span className="text-muted-foreground">Timeout</span><span>5,000ms</span>
          <span className="text-muted-foreground">Stale detection</span><span>Auto-release</span>
          <span className="text-muted-foreground">Reentrant</span><span>Same PID</span>
          <span className="text-muted-foreground">Contention action</span><span>EBUSY (-16)</span>
        </div>
      </NovaCard>

      <NovaCard className="p-2">
        <NovaSectionLabel>Active Locks ({mutexes.length})</NovaSectionLabel>
        {mutexes.length > 0 ? (
          <div className="space-y-1.5 mt-1">
            {mutexes.map(m => {
              const stale = m.heldMs > 4000;
              return (
                <div key={m.resource} className={cn(
                  "flex items-center gap-3 p-2 rounded-lg bg-background/50 border",
                  stale ? "border-destructive/40 bg-destructive/5" : "border-border/30"
                )}>
                  <Lock size={13} className={cn(stale ? "text-destructive" : "text-muted-foreground")} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-mono block truncate">{m.resource}</span>
                    <span className="text-[9px] text-muted-foreground">PID {m.pid} · {m.heldMs}ms</span>
                  </div>
                  {stale && <NovaBadge variant="danger" className="text-[8px]">STALE</NovaBadge>}
                </div>
              );
            })}
          </div>
        ) : (
          <NovaText muted className="text-[10px] mt-1">No active mutex locks — no contention</NovaText>
        )}
      </NovaCard>
    </VStack>
  );
}

// ═══════════════════════════════════════════════════════════════
// IPC TAB
// ═══════════════════════════════════════════════════════════════

function IPCTab({ stats, msgHistory }: { stats: ReturnType<typeof IPCManager.getStats>; msgHistory: number[] }) {
  const ports = IPCManager.getPorts();
  const regions = IPCManager.getSharedRegions();
  const channels = IPCManager.getEventChannels();

  const msgSeries = useMemo((): ChartSeries[] => [
    { key: "msg/s", color: { h: 210, s: 80, l: 55 } as NovaColor, data: msgHistory, fillOpacity: 0.2 },
  ], [msgHistory]);

  return (
    <VStack spacing="tight">
      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={ArrowRightLeft} label="Messages" value={stats.totalMessages.toLocaleString()} />
        <StatCard icon={Radio} label="Ports" value={`${stats.activePorts}`} />
        <StatCard icon={Cpu} label="Shared Mem" value={`${stats.sharedRegions}`} />
        <StatCard icon={Activity} label="Channels" value={`${stats.eventChannels}`} />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={Zap} label="msg/s" value={`${stats.messagesPerSecond}`} />
        <StatCard icon={AlertTriangle} label="Dropped" value={`${stats.droppedMessages}`} variant={stats.droppedMessages > 0 ? "warning" : "default"} />
        <StatCard icon={Timer} label="Pending" value={`${stats.pendingMessages}`} />
        <StatCard icon={Shield} label="Subscribers" value={`${stats.totalSubscriptions}`} />
      </div>

      {msgHistory.length > 1 && (
        <NovaCard className="p-2">
          <NovaSectionLabel>Message Rate Over Time</NovaSectionLabel>
          <NovaCanvasChart series={msgSeries} height={90} yUnit="/s" gridLines={3} />
        </NovaCard>
      )}

      <NovaCard className="p-2">
        <NovaSectionLabel>Active Ports ({ports.length})</NovaSectionLabel>
        {ports.length > 0 ? (
          <div className="max-h-[100px] overflow-y-auto space-y-1">
            {ports.map(p => (
              <div key={p.id} className="flex items-center gap-2 text-[10px] font-mono p-1.5 rounded bg-background/50 border border-border/20">
                <Radio size={11} className="text-muted-foreground shrink-0" />
                <span className="truncate flex-1">{p.channel}</span>
                <span className="text-muted-foreground">PID {p.ownerPid}</span>
                <span className="text-muted-foreground">{p.messageCount} msg</span>
              </div>
            ))}
          </div>
        ) : (
          <NovaText muted className="text-[10px]">No active ports</NovaText>
        )}
      </NovaCard>

      <NovaCard className="p-2">
        <NovaSectionLabel>Event Channels ({channels.length})</NovaSectionLabel>
        {channels.length > 0 ? (
          <div className="space-y-1">
            {channels.map(ch => (
              <div key={ch.id} className="flex items-center gap-2 text-[10px] font-mono p-1.5 rounded bg-background/50 border border-border/20">
                <Activity size={11} className="text-[hsl(152_55%_48%)] shrink-0" />
                <span className="truncate flex-1">{ch.name}</span>
                <NovaBadge className="text-[8px]">{ch.subscribers.size} sub</NovaBadge>
                <span className="text-muted-foreground">{ch.eventCount} events</span>
              </div>
            ))}
          </div>
        ) : (
          <NovaText muted className="text-[10px]">No event channels</NovaText>
        )}
      </NovaCard>

      <NovaCard className="p-2">
        <NovaSectionLabel>Shared Memory Regions ({regions.length})</NovaSectionLabel>
        {regions.length > 0 ? (
          <div className="space-y-1">
            {regions.map(r => (
              <div key={r.id} className="flex items-center gap-2 text-[10px] font-mono p-1.5 rounded bg-background/50 border border-border/20">
                <Cpu size={11} className="text-muted-foreground shrink-0" />
                <span className="truncate flex-1">{r.name}</span>
                <span className="text-muted-foreground">{(r.sizeBytes / 1024).toFixed(0)}KB</span>
                <span className="text-muted-foreground">{r.accessList.size} proc</span>
                {r.locked && <NovaBadge variant="danger" className="text-[8px]">LOCKED</NovaBadge>}
              </div>
            ))}
          </div>
        ) : (
          <NovaText muted className="text-[10px]">No shared memory regions</NovaText>
        )}
      </NovaCard>
    </VStack>
  );
}

// ═══════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════

function StatCard({
  icon: Icon, label, value, variant = "default",
}: {
  icon: typeof Zap;
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
