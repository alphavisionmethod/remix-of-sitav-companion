// ═══════════════════════════════════════════════════════════════
// SITA OS — Uptime Panel (Phase 20.1.C)
// Real availability % per subsystem from `uptime_heartbeats`,
// with rolling 24h / 7d / 30d windows and a 60-minute heatmap.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface Heartbeat {
  ts: string;
  source: string;
  subsystem: string;
  status: string;
  latency_ms: number | null;
}

interface SubsystemSummary {
  subsystem: string;
  windows: { h24: number; d7: number; d30: number };
  recent: { ts: number; ok: boolean }[];
  lastStatus: string;
}

const WINDOWS = {
  h24: 24 * 60 * 60_000,
  d7: 7 * 24 * 60 * 60_000,
  d30: 30 * 24 * 60 * 60_000,
};

function pctHealthy(rows: Heartbeat[]): number {
  if (rows.length === 0) return 100;
  const ok = rows.filter((r) => r.status === "healthy" || r.status === "ok").length;
  return (ok / rows.length) * 100;
}

export function UptimePanel() {
  const [rows, setRows] = useState<Heartbeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    const since = new Date(Date.now() - WINDOWS.d30).toISOString();
    const { data, error } = await supabase
      .from("uptime_heartbeats")
      .select("ts,source,subsystem,status,latency_ms")
      .gte("ts", since)
      .order("ts", { ascending: false })
      .limit(5000);
    if (error) setErr(error.message);
    setRows((data as unknown as Heartbeat[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  const summaries: SubsystemSummary[] = useMemo(() => {
    const bySubsystem = new Map<string, Heartbeat[]>();
    for (const r of rows) {
      const arr = bySubsystem.get(r.subsystem) ?? [];
      arr.push(r);
      bySubsystem.set(r.subsystem, arr);
    }
    const out: SubsystemSummary[] = [];
    const now = Date.now();
    for (const [subsystem, arr] of bySubsystem) {
      const sorted = [...arr].sort(
        (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime(),
      );
      const inWindow = (ms: number) =>
        sorted.filter((r) => now - new Date(r.ts).getTime() <= ms);
      const last60 = inWindow(60 * 60_000);
      // 60 buckets of 1 minute
      const recent = Array.from({ length: 60 }, (_, i) => {
        const bucketStart = now - (60 - i) * 60_000;
        const bucketEnd = bucketStart + 60_000;
        const inBucket = last60.filter((r) => {
          const t = new Date(r.ts).getTime();
          return t >= bucketStart && t < bucketEnd;
        });
        if (inBucket.length === 0) return { ts: bucketStart, ok: true };
        const ok = inBucket.every((r) => r.status === "healthy" || r.status === "ok");
        return { ts: bucketStart, ok };
      });
      out.push({
        subsystem,
        windows: {
          h24: pctHealthy(inWindow(WINDOWS.h24)),
          d7: pctHealthy(inWindow(WINDOWS.d7)),
          d30: pctHealthy(inWindow(WINDOWS.d30)),
        },
        recent,
        lastStatus: sorted[0]?.status ?? "unknown",
      });
    }
    return out.sort((a, b) => a.subsystem.localeCompare(b.subsystem));
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Uptime Monitor</h3>
          <p className="text-[10px] text-muted-foreground">
            Real heartbeats · {rows.length} samples (last 30d) · live from <code className="text-[10px]">uptime_heartbeats</code>
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

      {summaries.length === 0 && !loading && (
        <SitaCard hover={false}>
          <div className="py-6 text-center">
            <Activity className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              No heartbeats yet. The <code>sita-health-cron-1m</code> job will populate this within
              a minute.
            </p>
          </div>
        </SitaCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {summaries.map((s) => (
          <SitaCard key={s.subsystem} hover={false}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground capitalize">{s.subsystem}</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px]",
                  s.lastStatus === "healthy" || s.lastStatus === "ok"
                    ? "text-trust-safe border-trust-safe/30"
                    : "text-destructive border-destructive/30",
                )}
              >
                {s.lastStatus}
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "24h", value: s.windows.h24 },
                { label: "7d", value: s.windows.d7 },
                { label: "30d", value: s.windows.d30 },
              ].map((w) => (
                <div key={w.label} className="rounded-lg bg-secondary/30 p-2 text-center">
                  <p
                    className={cn(
                      "font-display text-sm font-bold tabular-nums",
                      w.value >= 99.9
                        ? "text-trust-safe"
                        : w.value >= 99
                          ? "text-accent"
                          : "text-destructive",
                    )}
                  >
                    {w.value.toFixed(2)}%
                  </p>
                  <p className="text-[9px] text-muted-foreground">{w.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <p className="text-[10px] text-muted-foreground mb-1">Last 60 minutes</p>
              <div className="flex gap-[2px]">
                {s.recent.map((b) => (
                  <div
                    key={b.ts}
                    className={cn(
                      "h-4 flex-1 rounded-sm",
                      b.ok ? "bg-trust-safe/60" : "bg-destructive/70",
                    )}
                    title={new Date(b.ts).toLocaleTimeString()}
                  />
                ))}
              </div>
            </div>
          </SitaCard>
        ))}
      </div>
    </div>
  );
}
