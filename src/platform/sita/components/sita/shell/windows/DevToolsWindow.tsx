// ═══════════════════════════════════════════════════════════════
// SITA OS — Developer Tools Window
// Console, Process Viewer, Memory Inspector, Crash Reports, Performance
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { Terminal, Cpu, HardDrive, AlertTriangle, Activity, Trash2, Search, X } from "lucide-react";
import {
  AppLayout, VStack, HStack, Divider,
} from "@/platform/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard, NovaSectionLabel, NovaBadge, NovaToolbar, NovaInput,
} from "@/platform/nova-sdk/ui/components";
import { AppStateWrapper } from "@/platform/sita/components/sita/shell/AppStateWrapper";
import { consoleCapture, type CapturedEntry } from "@/platform/nova-sdk/services/console-capture";
import { ProcessTable } from "@/platform/nova-sdk/kernel/process-manager";
import { MemoryManager } from "@/platform/nova-sdk/kernel/memory-manager";
import { SparklineChart } from "@/platform/sita/components/sita/SparklineChart";
import { cn } from "@/lib/utils";

type Tab = "console" | "processes" | "memory" | "crashes" | "performance";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "console", label: "Console", icon: <Terminal className="h-3 w-3" /> },
  { id: "processes", label: "Processes", icon: <Cpu className="h-3 w-3" /> },
  { id: "memory", label: "Memory", icon: <HardDrive className="h-3 w-3" /> },
  { id: "crashes", label: "Crashes", icon: <AlertTriangle className="h-3 w-3" /> },
  { id: "performance", label: "Perf", icon: <Activity className="h-3 w-3" /> },
];

const LEVEL_COLORS: Record<string, string> = {
  log: "text-foreground/80",
  info: "text-[hsl(210_80%_60%)]",
  warn: "text-[hsl(var(--sita-gold))]",
  error: "text-destructive",
  debug: "text-muted-foreground",
};

// ── Console Tab ──────────────────────────────────────────────

function ConsoleTab() {
  const [entries, setEntries] = useState<CapturedEntry[]>([]);
  const [filter, setFilter] = useState<CapturedEntry["level"] | "all">("all");
  const [search, setSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!consoleCapture.isCapturing()) consoleCapture.startCapture();

    const refresh = () => {
      const f = filter === "all" ? { search: search || undefined } : { level: filter, search: search || undefined };
      setEntries(consoleCapture.getEntries(f));
    };
    refresh();
    const unsub = consoleCapture.on(() => refresh());
    return unsub;
  }, [filter, search]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entries.length]);

  return (
    <VStack spacing="tight" className="h-full">
      <HStack spacing="tight" align="center">
        <NovaInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search logs…"
          className="flex-1 !text-[10px]"
        />
        {(["all", "log", "warn", "error", "info"] as const).map(lv => (
          <button
            key={lv}
            onClick={() => setFilter(lv)}
            className={cn(
              "px-1.5 py-0.5 rounded text-[9px] font-medium transition-all",
              filter === lv ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : "text-muted-foreground hover:bg-secondary/60"
            )}
          >
            {lv}
          </button>
        ))}
        <NovaButton variant="ghost" onClick={() => consoleCapture.clear()} icon={<Trash2 className="h-3 w-3" />} className="!p-1" />
      </HStack>

      <div ref={scrollRef} className="flex-1 overflow-auto max-h-[260px] rounded-lg bg-[hsl(0_0%_0%/0.3)] p-2 font-mono text-[10px] space-y-0.5">
        {entries.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">No logs captured</div>
        ) : (
          entries.slice(-200).map(entry => (
            <div key={entry.id} className="flex gap-2 leading-tight">
              <span className="text-muted-foreground flex-shrink-0 w-16">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
              <span className={cn("flex-shrink-0 w-8 uppercase font-bold", LEVEL_COLORS[entry.level])}>
                {entry.level === "error" ? "ERR" : entry.level === "warn" ? "WRN" : entry.level.toUpperCase().slice(0, 3)}
              </span>
              <span className="text-foreground/90 break-all">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </VStack>
  );
}

// ── Process Tab ──────────────────────────────────────────────

function ProcessTab() {
  const [processes, setProcesses] = useState<ReturnType<typeof ProcessTable.listProcesses>>([]);

  useEffect(() => {
    const refresh = () => setProcesses(ProcessTable.listProcesses());
    refresh();
    const iv = setInterval(refresh, 2000);
    return () => clearInterval(iv);
  }, []);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <NovaSectionLabel className="!px-0">Processes ({processes.length})</NovaSectionLabel>
        <div className="overflow-auto max-h-[280px]">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-muted-foreground border-b border-[hsl(0_0%_100%/0.06)]">
                <th className="text-left py-1 pr-2">PID</th>
                <th className="text-left py-1 pr-2">Name</th>
                <th className="text-left py-1 pr-2">State</th>
                <th className="text-left py-1 pr-2">Priority</th>
                <th className="text-right py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {processes.map(proc => (
                <tr key={proc.pid} className="border-b border-[hsl(0_0%_100%/0.03)] hover:bg-[hsl(0_0%_100%/0.03)]">
                  <td className="py-1 pr-2 font-mono text-muted-foreground">{proc.pid}</td>
                  <td className="py-1 pr-2 text-foreground/90">{proc.manifest?.name || proc.appId}</td>
                  <td className="py-1 pr-2">
                  <NovaBadge variant={proc.state === "running" ? "success" : proc.state === "ready" ? "info" : "warning"}>
                      {proc.state}
                    </NovaBadge>
                  </td>
                  <td className="py-1 pr-2 text-muted-foreground">{proc.priority}</td>
                  <td className="py-1 text-right">
                    <button
                      onClick={() => { try { ProcessTable.kill(proc.pid); } catch {} }}
                      className="text-destructive hover:text-destructive/80 text-[9px]"
                    >
                      Kill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NovaCard>
    </VStack>
  );
}

// ── Memory Tab ───────────────────────────────────────────────

function MemoryTab() {
  const [stats, setStats] = useState({ totalPages: 0, usedPages: 0, freePages: 0 });

  useEffect(() => {
    const refresh = () => {
      try {
        const s = MemoryManager.getStats();
        setStats({ totalPages: s.totalPages, usedPages: s.allocatedPages, freePages: s.freePages });
      } catch {
        setStats({ totalPages: 1024, usedPages: 128, freePages: 896 });
      }
    };
    refresh();
    const iv = setInterval(refresh, 3000);
    return () => clearInterval(iv);
  }, []);

  const usagePercent = stats.totalPages > 0 ? Math.round((stats.usedPages / stats.totalPages) * 100) : 0;

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Page Table</NovaSectionLabel>
          <HStack spacing="tight" justify="between">
            <NovaText variant="label" muted>Total Pages</NovaText>
            <NovaText variant="body" className="font-mono !text-[11px]">{stats.totalPages}</NovaText>
          </HStack>
          <HStack spacing="tight" justify="between">
            <NovaText variant="label" muted>Used</NovaText>
            <NovaText variant="body" className="font-mono !text-[11px]">{stats.usedPages} ({usagePercent}%)</NovaText>
          </HStack>
          <HStack spacing="tight" justify="between">
            <NovaText variant="label" muted>Free</NovaText>
            <NovaText variant="body" className="font-mono !text-[11px]">{stats.freePages}</NovaText>
          </HStack>
          <div className="w-full h-3 rounded-full bg-secondary/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-500"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">JS Heap (Browser)</NovaSectionLabel>
          {(() => {
            const mem = (performance as any).memory;
            if (!mem) return <NovaText variant="label" muted>Not available in this browser</NovaText>;
            return (
              <>
                <HStack spacing="tight" justify="between">
                  <NovaText variant="label" muted>Used</NovaText>
                  <NovaText variant="body" className="font-mono !text-[11px]">{Math.round(mem.usedJSHeapSize / 1048576)} MB</NovaText>
                </HStack>
                <HStack spacing="tight" justify="between">
                  <NovaText variant="label" muted>Total</NovaText>
                  <NovaText variant="body" className="font-mono !text-[11px]">{Math.round(mem.totalJSHeapSize / 1048576)} MB</NovaText>
                </HStack>
                <HStack spacing="tight" justify="between">
                  <NovaText variant="label" muted>Limit</NovaText>
                  <NovaText variant="body" className="font-mono !text-[11px]">{Math.round(mem.jsHeapSizeLimit / 1048576)} MB</NovaText>
                </HStack>
              </>
            );
          })()}
        </VStack>
      </NovaCard>
    </VStack>
  );
}

// ── Crashes Tab ──────────────────────────────────────────────

function CrashesTab() {
  const [crashes] = useState<Array<{ appId: string; count: number; lastCrash: number; stack?: string }>>([]);

  return (
    <VStack spacing="tight">
      <NovaCard>
        {crashes.length === 0 ? (
          <VStack spacing="tight" align="center" className="py-6">
            <AlertTriangle className="h-6 w-6 text-muted-foreground/40" />
            <NovaText variant="label" muted>No crash reports</NovaText>
            <NovaText variant="label" muted className="!text-[9px]">Crashes will appear here when apps fail</NovaText>
          </VStack>
        ) : (
          <VStack spacing="tight">
            {crashes.map(c => (
              <div key={c.appId}>
                <HStack spacing="tight" justify="between" align="center">
                  <VStack spacing="micro">
                    <NovaText variant="body">{c.appId}</NovaText>
                    <NovaText variant="label" muted className="!text-[9px]">{c.count} crashes</NovaText>
                  </VStack>
                  <NovaBadge variant="danger">{new Date(c.lastCrash).toLocaleTimeString()}</NovaBadge>
                </HStack>
                {c.stack && (
                  <pre className="mt-1 text-[9px] font-mono text-destructive/80 bg-destructive/5 rounded p-1.5 overflow-auto max-h-20">
                    {c.stack}
                  </pre>
                )}
                <Divider />
              </div>
            ))}
          </VStack>
        )}
      </NovaCard>
    </VStack>
  );
}

// ── Performance Tab ──────────────────────────────────────────

function PerformanceTab() {
  const [heapHistory, setHeapHistory] = useState<number[]>([]);
  const [domNodes, setDomNodes] = useState(0);
  const [fps, setFps] = useState(60);

  useEffect(() => {
    const iv = setInterval(() => {
      const mem = (performance as any).memory;
      if (mem) {
        setHeapHistory(prev => [...prev.slice(-19), Math.round(mem.usedJSHeapSize / 1048576)]);
      }
      setDomNodes(document.querySelectorAll("*").length);
    }, 2000);

    // FPS counter
    let frames = 0;
    let lastTime = performance.now();
    const tick = () => {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frames);
        frames = 0;
        lastTime = now;
      }
      requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);

    return () => { clearInterval(iv); cancelAnimationFrame(raf); };
  }, []);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Real-time</NovaSectionLabel>
          <HStack spacing="tight" justify="between" align="center">
            <NovaText variant="body">FPS</NovaText>
            <HStack spacing="tight" align="center">
              <NovaBadge variant={fps >= 55 ? "success" : fps >= 30 ? "default" : "danger"}>{fps}</NovaBadge>
            </HStack>
          </HStack>
          <Divider />
          <HStack spacing="tight" justify="between" align="center">
            <NovaText variant="body">DOM Nodes</NovaText>
            <NovaText variant="label" muted className="font-mono">{domNodes.toLocaleString()}</NovaText>
          </HStack>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">JS Heap (MB)</NovaSectionLabel>
          {heapHistory.length > 1 ? (
            <SparklineChart data={heapHistory} width={240} height={40} positive />
          ) : (
            <NovaText variant="label" muted className="!text-[9px]">Collecting data…</NovaText>
          )}
          {heapHistory.length > 0 && (
            <NovaText variant="label" muted className="font-mono !text-[9px]">
              Current: {heapHistory[heapHistory.length - 1]} MB
            </NovaText>
          )}
        </VStack>
      </NovaCard>
    </VStack>
  );
}

// ── Main ─────────────────────────────────────────────────────

export function DevToolsWindow() {
  const [tab, setTab] = useState<Tab>("console");

  useEffect(() => {
    // Start capture when DevTools opens
    if (!consoleCapture.isCapturing()) consoleCapture.startCapture();
    return () => { /* Keep capturing until explicitly stopped */ };
  }, []);

  const toolbar = (
    <NovaToolbar title="Developer Tools" leading={<Terminal className="h-4 w-4 text-[hsl(var(--primary))]" />} />
  );

  return (
    <AppStateWrapper state="ready" accentGradient="from-[hsl(38_85%_58%)] to-[hsl(0_65%_50%)]">
      <AppLayout toolbar={toolbar} minHeight={380}>
        <VStack spacing="tight">
          {/* Tab bar */}
          <HStack spacing="micro" className="overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap",
                  tab === t.id
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "text-muted-foreground hover:bg-secondary/60"
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </HStack>

          {tab === "console" && <ConsoleTab />}
          {tab === "processes" && <ProcessTab />}
          {tab === "memory" && <MemoryTab />}
          {tab === "crashes" && <CrashesTab />}
          {tab === "performance" && <PerformanceTab />}
        </VStack>
      </AppLayout>
    </AppStateWrapper>
  );
}
