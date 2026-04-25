// ═══════════════════════════════════════════════════════════════
// SITA OS — Traces Panel (Phase 20.1.C)
// Live latency aggregates over `trace_spans` for the last 1h.
// p50 / p95 / p99 per service+operation, plus top-20 slowest spans.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpanRow {
  trace_id: string;
  span_id: string;
  service: string;
  operation: string;
  duration_ms: number | null;
  status: string | null;
  http_status: number | null;
  start_ts: string;
  error: string | null;
}

interface AggRow {
  service: string;
  operation: string;
  count: number;
  p50: number;
  p95: number;
  p99: number;
  errorRate: number;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

export function TracesPanel() {
  const [rows, setRows] = useState<SpanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    const since = new Date(Date.now() - 60 * 60_000).toISOString();
    const { data, error } = await supabase
      .from("trace_spans")
      .select("trace_id,span_id,service,operation,duration_ms,status,http_status,start_ts,error")
      .gte("start_ts", since)
      .order("start_ts", { ascending: false })
      .limit(2000);
    if (error) setErr(error.message);
    setRows((data as SpanRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, []);

  const aggregates: AggRow[] = useMemo(() => {
    const groups = new Map<string, SpanRow[]>();
    for (const r of rows) {
      const k = `${r.service}::${r.operation}`;
      const arr = groups.get(k) ?? [];
      arr.push(r);
      groups.set(k, arr);
    }
    const out: AggRow[] = [];
    for (const [k, arr] of groups) {
      const [service, operation] = k.split("::");
      const durations = arr
        .map((r) => r.duration_ms ?? 0)
        .filter((n) => n > 0)
        .sort((a, b) => a - b);
      const errors = arr.filter(
        (r) => r.status === "error" || (r.http_status ?? 0) >= 500,
      ).length;
      out.push({
        service,
        operation,
        count: arr.length,
        p50: percentile(durations, 50),
        p95: percentile(durations, 95),
        p99: percentile(durations, 99),
        errorRate: arr.length > 0 ? errors / arr.length : 0,
      });
    }
    return out.sort((a, b) => b.count - a.count).slice(0, 30);
  }, [rows]);

  const slowest = useMemo(
    () =>
      [...rows]
        .filter((r) => (r.duration_ms ?? 0) > 0)
        .sort((a, b) => (b.duration_ms ?? 0) - (a.duration_ms ?? 0))
        .slice(0, 20),
    [rows],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Distributed Traces</h3>
          <p className="text-[10px] text-muted-foreground">
            Last 60 minutes · {rows.length} spans · live from <code className="text-[10px]">trace_spans</code>
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={cn("h-3 w-3 mr-1.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {err && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {err}
        </div>
      )}

      <SitaCard hover={false}>
        <SitaCardTitle sub={`${aggregates.length} service+operation pairs`}>
          Latency Aggregates (p50 / p95 / p99)
        </SitaCardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] text-muted-foreground border-b border-border">
                <th className="text-left py-2 pr-3">Service</th>
                <th className="text-left py-2 pr-3">Operation</th>
                <th className="text-right py-2 pr-3">Count</th>
                <th className="text-right py-2 pr-3">p50</th>
                <th className="text-right py-2 pr-3">p95</th>
                <th className="text-right py-2 pr-3">p99</th>
                <th className="text-right py-2">Errors</th>
              </tr>
            </thead>
            <tbody>
              {aggregates.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-muted-foreground">
                    No spans in the last hour. Trigger an instrumented edge function to populate.
                  </td>
                </tr>
              )}
              {aggregates.map((a) => (
                <tr key={`${a.service}-${a.operation}`} className="border-b border-border/40">
                  <td className="py-1.5 pr-3 font-medium text-foreground">{a.service}</td>
                  <td className="py-1.5 pr-3 text-muted-foreground">{a.operation}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{a.count}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{Math.round(a.p50)}ms</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{Math.round(a.p95)}ms</td>
                  <td className={cn("py-1.5 pr-3 text-right tabular-nums", a.p99 > 1500 && "text-accent font-semibold")}>
                    {Math.round(a.p99)}ms
                  </td>
                  <td className={cn("py-1.5 text-right tabular-nums", a.errorRate > 0.05 && "text-destructive font-semibold")}>
                    {(a.errorRate * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SitaCard>

      <SitaCard hover={false}>
        <SitaCardTitle sub="Top-20 slowest spans in window">Slowest Spans</SitaCardTitle>
        <div className="mt-3 space-y-1">
          {slowest.length === 0 && (
            <p className="text-xs text-muted-foreground py-3 text-center">No span data yet.</p>
          )}
          {slowest.map((s) => (
            <div
              key={s.span_id}
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-3 py-2"
            >
              <Activity className="h-3 w-3 text-muted-foreground shrink-0" />
              <code className="text-[10px] text-muted-foreground truncate w-40" title={s.trace_id}>
                {s.trace_id.slice(0, 10)}
              </code>
              <span className="text-xs font-medium text-foreground truncate flex-1">
                {s.service} · {s.operation}
              </span>
              {s.error && (
                <Badge variant="outline" className="text-[9px] text-destructive border-destructive/40">
                  err
                </Badge>
              )}
              <span className="text-xs font-mono tabular-nums text-accent shrink-0">
                {Math.round(s.duration_ms ?? 0)}ms
              </span>
            </div>
          ))}
        </div>
      </SitaCard>
    </div>
  );
}
