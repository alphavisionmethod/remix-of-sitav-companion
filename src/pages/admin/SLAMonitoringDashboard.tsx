// ═══════════════════════════════════════════════════════════════
// SITA OS — Live SLA Monitoring Dashboard
// Real-time SLA snapshots with trend sparklines, breach history
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, CheckCircle, XCircle, TrendingUp, RefreshCw, Clock, Calendar,
  AlertTriangle, Shield, ArrowUpRight, ArrowDownRight, Download,
} from "lucide-react";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { motion } from "framer-motion";

interface SLASnapshot {
  id: string;
  sla_id: string;
  current_value: number;
  target_value: number;
  met: boolean;
  window_start: string;
  window_end: string;
  computed_at: string;
}

interface SLADefinition {
  id: string;
  name: string;
  metric_key: string;
  target_value: number;
  unit: string;
  time_window: string;
  breach_severity: string;
  enabled: boolean;
}

interface SLACardData {
  definition: SLADefinition;
  latest: SLASnapshot | null;
  history: SLASnapshot[];
}

export default function SLAMonitoringDashboard() {
  const [slaCards, setSlaCards] = useState<SLACardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "custom">("24h");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      let snapsQuery = supabase.from("sla_snapshots" as never).select("*").order("computed_at", { ascending: false }).limit(500);

      // Apply time window filter server-side
      if (timeRange === "custom" && customStart) {
        snapsQuery = snapsQuery.gte("computed_at", new Date(customStart).toISOString()) as typeof snapsQuery;
        if (customEnd) snapsQuery = snapsQuery.lte("computed_at", new Date(customEnd + "T23:59:59").toISOString()) as typeof snapsQuery;
      } else if (timeRange !== "custom") {
        const cutoff = new Date();
        if (timeRange === "24h") cutoff.setHours(cutoff.getHours() - 24);
        else if (timeRange === "7d") cutoff.setDate(cutoff.getDate() - 7);
        else if (timeRange === "30d") cutoff.setDate(cutoff.getDate() - 30);
        snapsQuery = snapsQuery.gte("computed_at", cutoff.toISOString()) as typeof snapsQuery;
      }

      const [defsRes, snapsRes] = await Promise.all([
        supabase.from("sla_definitions" as never).select("*").eq("enabled", true) as unknown as Promise<{ data: SLADefinition[] | null }>,
        snapsQuery as unknown as Promise<{ data: SLASnapshot[] | null }>,
      ]);

      const defs = defsRes.data ?? [];
      const snaps = snapsRes.data ?? [];

      const cards: SLACardData[] = defs.map((def) => {
        const defSnaps = snaps
          .filter((s) => s.sla_id === def.id)
          .sort((a, b) => new Date(b.computed_at).getTime() - new Date(a.computed_at).getTime());
        return {
          definition: def,
          latest: defSnaps[0] || null,
          history: defSnaps.slice(0, 24),
        };
      });

      setSlaCards(cards);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    const interval = setInterval(loadData, 60_000);
    return () => clearInterval(interval);
  }, [timeRange, customStart, customEnd]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("sla-snapshots-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sla_snapshots" }, () => {
        void loadData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const metCount = slaCards.filter((c) => c.latest?.met).length;
  const breachCount = slaCards.filter((c) => c.latest && !c.latest.met).length;
  const overallHealth = slaCards.length > 0 ? Math.round((metCount / slaCards.length) * 100) : 100;

  const breachHistory = slaCards
    .flatMap((c) => c.history.filter((s) => !s.met).map((s) => ({ ...s, name: c.definition.name, unit: c.definition.unit })))
    .sort((a, b) => new Date(b.computed_at).getTime() - new Date(a.computed_at).getTime())
    .slice(0, 20);

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={Activity}
        title="SLA Monitoring"
        subtitle="Live service level agreement tracking with real-time metrics"
        accent="primary"
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "SLAs Met", value: `${metCount}/${slaCards.length}`, icon: CheckCircle, color: "text-trust-safe" },
          { label: "Breaches", value: breachCount, icon: XCircle, color: breachCount > 0 ? "text-destructive" : "text-trust-safe" },
          { label: "Overall Health", value: `${overallHealth}%`, icon: Shield, color: overallHealth >= 99 ? "text-trust-safe" : overallHealth >= 95 ? "text-amber-400" : "text-destructive" },
          { label: "Last Evaluated", value: lastRefresh ? lastRefresh.toLocaleTimeString() : "—", icon: Clock, color: "text-muted-foreground" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(["24h", "7d", "30d"] as const).map((r) => (
            <Button
              key={r}
              variant={timeRange === r ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => setTimeRange(r)}
            >
              {r}
            </Button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={timeRange === "custom" ? "default" : "outline"} size="sm" className="text-xs gap-1">
                <Calendar className="h-3 w-3" /> Custom
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-2 p-3" align="start">
              <label className="text-[10px] text-muted-foreground">Start date</label>
              <Input type="date" className="h-7 text-xs" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
              <label className="text-[10px] text-muted-foreground">End date</label>
              <Input type="date" className="h-7 text-xs" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
              <Button size="sm" className="w-full text-xs" onClick={() => { if (customStart) setTimeRange("custom"); }}>
                Apply
              </Button>
            </PopoverContent>
          </Popover>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadData()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {timeRange === "custom" && customStart && (
        <p className="text-[10px] text-muted-foreground">
          Showing: {customStart} → {customEnd || "now"}
        </p>
      )}

      <Tabs defaultValue="metrics">
        <TabsList>
          <TabsTrigger value="metrics">SLA Metrics ({slaCards.length})</TabsTrigger>
          <TabsTrigger value="breaches">Breach History ({breachHistory.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {slaCards.map((card, i) => {
              const { definition: def, latest, history } = card;
              const isInverse = ["api_p95_latency_ms", "error_rate_pct", "mttr_minutes", "rto_minutes", "alert_response_minutes"].includes(def.metric_key);
              const progressPct = latest
                ? Math.min(
                    isInverse
                      ? (def.target_value / Math.max(latest.current_value, 0.01)) * 100
                      : (latest.current_value / def.target_value) * 100,
                    100,
                  )
                : 0;

              // Trend: compare last 2 snapshots
              const prev = history[1];
              const trending = latest && prev
                ? isInverse
                  ? latest.current_value < prev.current_value ? "improving" : "degrading"
                  : latest.current_value > prev.current_value ? "improving" : "degrading"
                : null;

              return (
                <motion.div key={def.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04 }}>
                  <Card className={`border-border/50 bg-card/80 backdrop-blur-sm ${latest && !latest.met ? "border-destructive/30" : ""}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{def.name}</CardTitle>
                        {latest ? (
                          latest.met ? (
                            <Badge variant="outline" className="text-[10px] text-trust-safe border-trust-verified/30 gap-0.5">
                              <CheckCircle className="h-2.5 w-2.5" /> Met
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px] gap-0.5">
                              <XCircle className="h-2.5 w-2.5" /> Breach
                            </Badge>
                          )
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">No data</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">
                          {latest ? latest.current_value : "—"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {def.unit} / target: {def.target_value}{def.unit}
                        </span>
                      </div>

                      <Progress value={progressPct} className="h-1.5" />

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Window: {def.time_window}</span>
                        <span className="flex items-center gap-0.5">
                          {trending === "improving" && <><ArrowUpRight className="h-3 w-3 text-trust-safe" /> Improving</>}
                          {trending === "degrading" && <><ArrowDownRight className="h-3 w-3 text-destructive" /> Degrading</>}
                          {!trending && "—"}
                        </span>
                      </div>

                      {/* Mini sparkline (text-based) */}
                      {history.length > 1 && (
                        <div className="flex items-end gap-[2px] h-6">
                          {history.slice(0, 12).reverse().map((s, j) => {
                            const pct = isInverse
                              ? Math.min((def.target_value / Math.max(s.current_value, 0.01)) * 100, 100)
                              : Math.min((s.current_value / def.target_value) * 100, 100);
                            return (
                              <div
                                key={j}
                                className={`flex-1 rounded-sm ${s.met ? "bg-trust-safe/60" : "bg-destructive/60"}`}
                                style={{ height: `${Math.max(pct * 0.24, 2)}px` }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {slaCards.length === 0 && !loading && (
            <Card className="border-border/50">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No SLA definitions configured. Run the SLA evaluator to start tracking.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="breaches" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[480px]">
                <div className="divide-y">
                  {breachHistory.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      No SLA breaches recorded. 🎉
                    </div>
                  )}
                  {breachHistory.map((b) => (
                    <div key={b.id} className="p-4 hover:bg-accent/30 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                            <span className="font-medium text-sm">{b.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Value: {b.current_value}{b.unit} — Target: {b.target_value}{b.unit}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                          <Clock className="h-3 w-3" />
                          {new Date(b.computed_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}