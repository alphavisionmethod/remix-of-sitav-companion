// ═══════════════════════════════════════════════════════════════
// SITA OS — EFH01 Edge Function Health Center (Phase 17.3)
// Route: /admin/edge-functions/health (gated by maintenance.view)
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Activity, RefreshCw, Shield, Database, Zap, AlertTriangle, CheckCircle2,
} from "lucide-react";
import {
  EDGE_FUNCTION_REGISTRY,
  EDGE_FUNCTION_REPLAY_MAP,
  replayCoverageSummary,
  useEdgeFunctionHealth,
  summariseHealth,
  type HealthBand,
  type EdgeFunctionHealth,
  type EdgeFunctionEntry,
  type ReplayPathKind,
} from "@/lib/backend-topology";

const BAND_VARIANT: Record<HealthBand, "default" | "secondary" | "outline" | "destructive"> = {
  green: "default",
  amber: "secondary",
  red: "destructive",
  unknown: "outline",
};

const REPLAY_TONE: Record<ReplayPathKind, "default" | "secondary" | "outline"> = {
  "job-dead-letter": "default",
  "command-replay": "default",
  "workflow-replay": "default",
  "webhook-redelivery": "default",
  "idempotent-retry": "default",
  "not-applicable": "outline",
};

const CATEGORIES = [
  "ADMIN_BFF", "PUBLIC_BFF", "DOMAIN_FUNCTION",
  "ORCHESTRATION_FUNCTION", "CONNECTOR_WEBHOOK_FUNCTION", "RUNTIME_SYSTEM_FUNCTION",
] as const;

type CategoryKey = typeof CATEGORIES[number] | "ALL";
type BandKey = HealthBand | "ALL";

export default function EFH01EdgeFunctionHealthCenter() {
  const { data, loading, error, refreshedAt, refresh } = useEdgeFunctionHealth();
  const [categoryFilter, setCategoryFilter] = useState<CategoryKey>("ALL");
  const [bandFilter, setBandFilter] = useState<BandKey>("ALL");

  const replaySummary = useMemo(() => replayCoverageSummary(), []);
  const healthSummary = useMemo(() => summariseHealth(data), [data]);

  const byName = useMemo(() => {
    const m = new Map<string, EdgeFunctionHealth>();
    for (const h of data) m.set(h.name, h);
    return m;
  }, [data]);

  const rows = useMemo(() => {
    return EDGE_FUNCTION_REGISTRY
      .filter((fn) => categoryFilter === "ALL" || fn.category === categoryFilter)
      .map((fn) => ({ fn, health: byName.get(fn.name) }))
      .filter(({ health }) => bandFilter === "ALL" || (health?.band ?? "unknown") === bandFilter);
  }, [byName, categoryFilter, bandFilter]);

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Edge Function Health Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live invocation, latency &amp; replay-path visibility for all {EDGE_FUNCTION_REGISTRY.length} edge functions.
          </p>
        </div>
        <Button onClick={refresh} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </header>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          title="Healthy"
          value={healthSummary.green}
          total={healthSummary.total}
          icon={CheckCircle2}
          tone="default"
        />
        <SummaryCard
          title="Degraded"
          value={healthSummary.amber + healthSummary.red}
          total={healthSummary.total}
          icon={AlertTriangle}
          tone={healthSummary.red > 0 ? "destructive" : "secondary"}
        />
        <SummaryCard
          title="Replay coverage"
          value={replaySummary.coveredCount}
          total={replaySummary.requiredCount}
          icon={Shield}
          tone={replaySummary.ok ? "default" : "destructive"}
        />
        <SummaryCard
          title="Unknown / no data"
          value={healthSummary.unknown}
          total={healthSummary.total}
          icon={Database}
          tone="outline"
        />
      </div>

      {error && (
        <Card className="border-destructive/30">
          <CardContent className="py-3 text-sm text-destructive">
            Telemetry unavailable: {error}. Showing registry baseline.
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Filters</CardTitle>
          <CardDescription className="text-xs">
            Last refresh: {refreshedAt ?? "—"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <FilterGroup
            label="Category"
            options={[{ key: "ALL", label: "All" }, ...CATEGORIES.map((c) => ({ key: c, label: shortCat(c) }))]}
            active={categoryFilter}
            onChange={(k) => setCategoryFilter(k as CategoryKey)}
          />
          <FilterGroup
            label="Health"
            options={[
              { key: "ALL", label: "All" },
              { key: "green", label: "Green" },
              { key: "amber", label: "Amber" },
              { key: "red", label: "Red" },
              { key: "unknown", label: "Unknown" },
            ]}
            active={bandFilter}
            onChange={(k) => setBandFilter(k as BandKey)}
          />
        </CardContent>
      </Card>

      {/* Function table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Functions ({rows.length} of {EDGE_FUNCTION_REGISTRY.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Function</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Invocations 1h</TableHead>
                  <TableHead className="text-right">Error rate</TableHead>
                  <TableHead className="text-right">p95</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Replay path</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ fn, health }) => (
                  <FunctionRow key={fn.name} fn={fn} health={health} />
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
                      No functions match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FunctionRow({ fn, health }: { fn: EdgeFunctionEntry; health?: EdgeFunctionHealth }) {
  const band = (health?.band ?? "unknown") as HealthBand;
  const replay = EDGE_FUNCTION_REPLAY_MAP[fn.name];
  return (
    <TableRow>
      <TableCell>
        <div className="font-medium text-sm">{fn.name}</div>
        <div className="text-[10px] text-muted-foreground">{fn.boundedContext}</div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-[10px]">{shortCat(fn.category)}</Badge>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">{fn.owner}</TableCell>
      <TableCell className="text-right text-sm tabular-nums">
        {health ? health.invocations1h.toLocaleString() : "—"}
      </TableCell>
      <TableCell className="text-right text-sm tabular-nums">
        {health && health.invocations1h > 0
          ? `${(health.errorRate * 100).toFixed(2)}%`
          : "—"}
      </TableCell>
      <TableCell className="text-right text-sm tabular-nums">
        {health?.p95ms != null ? `${health.p95ms} ms` : "—"}
      </TableCell>
      <TableCell>
        <Badge variant={BAND_VARIANT[band]} className="text-[10px] uppercase">
          {band}
        </Badge>
      </TableCell>
      <TableCell>
        {replay ? (
          <Badge variant={REPLAY_TONE[replay.kind]} className="text-[10px]">
            {replay.kind}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] text-muted-foreground">none</Badge>
        )}
      </TableCell>
    </TableRow>
  );
}

function SummaryCard({
  title, value, total, icon: Icon, tone,
}: {
  title: string;
  value: number;
  total: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "default" | "secondary" | "outline" | "destructive";
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">{title}</div>
            <div className="text-2xl font-bold mt-1">{value} <span className="text-sm text-muted-foreground font-normal">/ {total}</span></div>
          </div>
          <Badge variant={tone} className="h-8 w-8 rounded-full p-0 flex items-center justify-center">
            <Icon className="h-4 w-4" />
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterGroup({
  label, options, active, onChange,
}: {
  label: string;
  options: ReadonlyArray<{ key: string; label: string }>;
  active: string;
  onChange: (k: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-[10px] uppercase text-muted-foreground mr-1">{label}:</span>
      {options.map((o) => (
        <Button
          key={o.key}
          size="sm"
          variant={active === o.key ? "default" : "outline"}
          onClick={() => onChange(o.key)}
          className="h-7 px-2 text-xs"
        >
          {o.label}
        </Button>
      ))}
    </div>
  );
}

function shortCat(c: string): string {
  return c
    .replace("_FUNCTION", "")
    .replace("CONNECTOR_WEBHOOK", "CONNECTOR")
    .replace("RUNTIME_SYSTEM", "RUNTIME");
}
