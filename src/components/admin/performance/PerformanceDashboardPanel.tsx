// ═══════════════════════════════════════════════════════════════
// SITA OS — Performance Dashboard Panel
// Reports p50/p95/p99 latency and cold-start time from
// the route and AI chat performance hooks.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Zap, Clock, Gauge } from "lucide-react";
import { getPerfLog, computePercentiles } from "@/hooks/useRoutePerformance";
import { getChatPerfLog, computeChatPercentiles } from "@/hooks/useAIChatPerformance";
import { PERFORMANCE_BASELINES } from "@/lib/observability/performance-baselines";

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
  const routeStats = useMemo(() => computePercentiles(), []);
  const chatStats = useMemo(() => computeChatPercentiles(), []);
  const perfLog = useMemo(() => getPerfLog(), []);
  const chatLog = useMemo(() => getChatPerfLog(), []);

  // Per-route breakdown
  const routeMap = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const e of perfLog) {
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
  }, [perfLog]);

  return (
    <div className="space-y-4">
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

      {/* AI Chat stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" /> AI Chat Latency
            <Badge variant="outline" className="text-[9px] ml-auto">{chatStats.count} requests</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 text-center text-xs">
            <div className="p-2 rounded bg-muted/20"><p className="font-semibold">{chatStats.p50}ms</p><p className="text-muted-foreground">p50</p></div>
            <div className="p-2 rounded bg-muted/20"><p className="font-semibold">{chatStats.p95}ms</p><p className="text-muted-foreground">p95</p></div>
            <div className="p-2 rounded bg-muted/20"><p className="font-semibold">{chatStats.p99}ms</p><p className="text-muted-foreground">p99</p></div>
            <div className="p-2 rounded bg-muted/20"><p className="font-semibold">{chatStats.p50Ttft}ms</p><p className="text-muted-foreground">TTFT p50</p></div>
          </div>
        </CardContent>
      </Card>

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