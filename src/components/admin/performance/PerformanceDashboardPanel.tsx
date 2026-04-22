// ═══════════════════════════════════════════════════════════════
// SITA OS — Performance Dashboard Panel
// Reports p50/p95/p99 latency and cold-start time from
// the route and AI chat performance hooks, with interactive filters.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Zap, Clock, Gauge, Filter, RotateCcw } from "lucide-react";
import { getPerfLog, computePercentiles, type PerfEntry } from "@/hooks/useRoutePerformance";
import {
  getChatPerfLog, computeChatPercentiles, getChatPerfModels,
  type PerfEnvironment, type ChatPerfFilter,
} from "@/hooks/useAIChatPerformance";
import { PERFORMANCE_BASELINES } from "@/lib/observability/performance-baselines";
import { Button } from "@/components/ui/button";

const ENV_OPTIONS: { value: PerfEnvironment | "all"; label: string }[] = [
  { value: "all", label: "All Environments" },
  { value: "dev", label: "Dev" },
  { value: "staging", label: "Staging" },
  { value: "prod", label: "Production" },
];

function StatusBadge({ actual, target }: { actual: number; target: number }) {
  if (actual === 0) return <Badge variant="outline" className="text-[9px]">—</Badge>;
  const ok = actual <= target;
  return (
    <Badge variant="outline" className={`text-[9px] ${ok ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"}`}>
      {actual}ms {ok ? "✓" : "✗"}
    </Badge>
  );
}

export function PerformanceDashboardPanel() {
  // ── Filter state ──
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [routeFilter, setRouteFilter] = useState("all");
  const [envFilter, setEnvFilter] = useState<PerfEnvironment | "all">("all");

  const perfLog = useMemo(() => getPerfLog(), []);
  const allChatLog = useMemo(() => getChatPerfLog(), []);
  const chatModels = useMemo(() => getChatPerfModels(), []);

  // Unique routes for the dropdown
  const uniqueRoutes = useMemo(() => {
    const set = new Set<string>();
    for (const e of perfLog) set.add(e.route);
    return [...set].sort();
  }, [perfLog]);

  // ── Filtered route log ──
  const filteredPerfLog = useMemo(() => {
    let entries: readonly PerfEntry[] = perfLog;
    if (routeFilter !== "all") entries = entries.filter((e) => e.route === routeFilter);
    if (dateFrom) entries = entries.filter((e) => e.timestamp >= dateFrom);
    if (dateTo) entries = entries.filter((e) => e.timestamp <= dateTo);
    return entries;
  }, [perfLog, routeFilter, dateFrom, dateTo]);

  // ── Chat filter ──
  const chatFilter: ChatPerfFilter | undefined = useMemo(() => {
    const f: ChatPerfFilter = {};
    if (envFilter !== "all") f.environment = envFilter;
    if (dateFrom) f.from = dateFrom;
    if (dateTo) f.to = dateTo;
    return Object.keys(f).length > 0 ? f : undefined;
  }, [envFilter, dateFrom, dateTo]);

  // ── Computed stats ──
  const routeStats = useMemo(() => {
    if (filteredPerfLog.length === 0) return { p50: 0, p95: 0, p99: 0, count: 0, coldStartMs: null as number | null };
    const sorted = filteredPerfLog.map((e) => e.durationMs).sort((a, b) => a - b);
    const p = (pct: number) => sorted[Math.min(Math.floor(sorted.length * pct), sorted.length - 1)];
    const cold = filteredPerfLog.find((e) => e.type === "cold-start");
    return { p50: Math.round(p(0.5)), p95: Math.round(p(0.95)), p99: Math.round(p(0.99)), count: sorted.length, coldStartMs: cold ? Math.round(cold.durationMs) : null };
  }, [filteredPerfLog]);

  const chatStats = useMemo(() => computeChatPercentiles(chatFilter), [chatFilter]);
  const filteredChatLog = useMemo(() => getChatPerfLog(chatFilter), [chatFilter]);

  // Per-route breakdown
  const routeMap = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const e of filteredPerfLog) {
      const arr = map.get(e.route) ?? [];
      arr.push(e.durationMs);
      map.set(e.route, arr);
    }
    return [...map.entries()]
      .map(([route, durations]) => {
        const sorted = durations.sort((a, b) => a - b);
        const p = (pct: number) => sorted[Math.min(Math.floor(sorted.length * pct), sorted.length - 1)];
        return { route, count: sorted.length, p50: Math.round(p(0.5)), p95: Math.round(p(0.95)) };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [filteredPerfLog]);

  const resetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setRouteFilter("all");
    setEnvFilter("all");
  };

  return (
    <div className="space-y-4">
      {/* ── Filter bar ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" /> Filters
            <Button variant="ghost" size="sm" className="ml-auto h-6 text-xs" onClick={resetFilters}>
              <RotateCcw className="h-3 w-3 mr-1" /> Reset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px]">From</Label>
              <Input type="datetime-local" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">To</Label>
              <Input type="datetime-local" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Route</Label>
              <Select value={routeFilter} onValueChange={setRouteFilter}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
                  {uniqueRoutes.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Environment</Label>
              <Select value={envFilter} onValueChange={(v) => setEnvFilter(v as PerfEnvironment | "all")}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENV_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xl font-bold">{routeStats.coldStartMs ?? "—"}<span className="text-xs text-muted-foreground ml-0.5">ms</span></p>
            <p className="text-[10px] text-muted-foreground">Cold Start</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xl font-bold">{routeStats.p50}<span className="text-xs text-muted-foreground ml-0.5">ms</span></p>
            <p className="text-[10px] text-muted-foreground">Route p50</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Gauge className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xl font-bold">{routeStats.p95}<span className="text-xs text-muted-foreground ml-0.5">ms</span></p>
            <p className="text-[10px] text-muted-foreground">Route p95</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xl font-bold">{chatStats.p50}<span className="text-xs text-muted-foreground ml-0.5">ms</span></p>
            <p className="text-[10px] text-muted-foreground">AI Chat p50</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Chat aggregate stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" /> AI Chat Latency
            <Badge variant="outline" className="text-[9px] ml-auto">{chatStats.count} requests</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center text-xs">
            <div className="p-2 rounded bg-muted/20"><p className="font-semibold">{chatStats.p50}ms</p><p className="text-muted-foreground">p50</p></div>
            <div className="p-2 rounded bg-muted/20"><p className="font-semibold">{chatStats.p95}ms</p><p className="text-muted-foreground">p95</p></div>
            <div className="p-2 rounded bg-muted/20"><p className="font-semibold">{chatStats.p99}ms</p><p className="text-muted-foreground">p99</p></div>
            <div className="p-2 rounded bg-muted/20"><p className="font-semibold">{chatStats.p50Ttft}ms</p><p className="text-muted-foreground">TTFT p50</p></div>
            <div className="p-2 rounded bg-muted/20"><p className="font-semibold">{chatStats.p50Gen}ms</p><p className="text-muted-foreground">Gen p50</p></div>
            <div className="p-2 rounded bg-muted/20"><p className="font-semibold">{chatStats.avgRetries}</p><p className="text-muted-foreground">Avg Retries</p></div>
          </div>
        </CardContent>
      </Card>

      {/* AI Chat per-request spans */}
      {filteredChatLog.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">AI Chat Request Spans</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Env</TableHead>
                  <TableHead className="text-center">TTFT</TableHead>
                  <TableHead className="text-center">Gen</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Retries</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...filteredChatLog].reverse().slice(0, 50).map((e) => (
                  <TableRow key={e.requestId}>
                    <TableCell className="font-mono text-[10px] max-w-[100px] truncate">{e.requestId.slice(0, 12)}</TableCell>
                    <TableCell className="text-[10px]">{e.model ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[9px]">{e.environment}</Badge></TableCell>
                    <TableCell className="text-center text-xs">{e.ttftMs != null ? `${Math.round(e.ttftMs)}ms` : "—"}</TableCell>
                    <TableCell className="text-center text-xs">{e.generationMs != null ? `${Math.round(e.generationMs)}ms` : "—"}</TableCell>
                    <TableCell className="text-center text-xs font-medium">{e.totalMs != null ? `${Math.round(e.totalMs)}ms` : "—"}</TableCell>
                    <TableCell className="text-center text-xs">{e.retryCount > 0 ? <Badge variant="outline" className="text-[9px] text-amber-500">{e.retryCount}</Badge> : "0"}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{new Date(e.timestamp).toLocaleTimeString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Baseline targets vs actual */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Performance Baselines</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Target p50</TableHead>
                <TableHead className="text-center">Target p95</TableHead>
                <TableHead className="text-center">Actual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERFORMANCE_BASELINES.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-xs font-medium">{m.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[9px]">{m.category}</Badge></TableCell>
                  <TableCell className="text-center text-xs">{m.targetP50}{m.unit}</TableCell>
                  <TableCell className="text-center text-xs">{m.targetP95}{m.unit}</TableCell>
                  <TableCell className="text-center">
                    <StatusBadge actual={m.currentBaseline ?? 0} target={m.targetP50} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Per-route breakdown */}
      {routeMap.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Route Breakdown (Session)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead className="text-center">Hits</TableHead>
                  <TableHead className="text-center">p50</TableHead>
                  <TableHead className="text-center">p95</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routeMap.map((r) => (
                  <TableRow key={r.route}>
                    <TableCell className="font-mono text-xs">{r.route}</TableCell>
                    <TableCell className="text-center text-xs">{r.count}</TableCell>
                    <TableCell className="text-center text-xs">{r.p50}ms</TableCell>
                    <TableCell className="text-center text-xs">{r.p95}ms</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}