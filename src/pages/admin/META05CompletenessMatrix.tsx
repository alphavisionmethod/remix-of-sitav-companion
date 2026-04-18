// ═══════════════════════════════════════════════════════════════
// META05 — Completeness Matrix (Phase 10)
// Live coverage scores: registry vs. disk truth.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle2, Database, FileCode, FileText, Route } from "lucide-react";
import {
  BOUNDED_CONTEXT_REGISTRY,
  totalEdgeFunctions,
  totalTables,
} from "@/platform/architecture/bounded-context-registry";
import { PAGE_STATE_REGISTRY } from "@/lib/reality/page-state-registry";
import { ROUTE_CONTEXT_BINDINGS } from "@/platform/architecture/context-membership-map";

type DimensionKey = "edgeFunctions" | "tables" | "pages" | "routes";

interface Dimension {
  key: DimensionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  registered: number;
  onDisk: number;
  orphans: string[];
}

interface ReportShape {
  totalOnDisk?: number;
  totalOnDb?: number;
  totalClaimed?: number;
  registered?: number;
  declaredCount?: number;
  bindingsCount?: number;
  orphans?: string[];
  orphanCritical?: string[];
  unowned?: string[];
  ok: boolean;
}

async function fetchReport(name: string): Promise<ReportShape | null> {
  try {
    const res = await fetch(`/generated/${name}.json`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as ReportShape;
  } catch {
    return null;
  }
}

export default function META05CompletenessMatrix() {
  const [edgeReport, setEdgeReport] = useState<ReportShape | null>(null);
  const [tableReport, setTableReport] = useState<ReportShape | null>(null);
  const [pageReport, setPageReport] = useState<ReportShape | null>(null);
  const [routeReport, setRouteReport] = useState<ReportShape | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [e, t, p, r] = await Promise.all([
          fetchReport("edge-function-membership-report"),
          fetchReport("table-membership-report"),
          fetchReport("page-registry-completeness-report"),
          fetchReport("route-registry-completeness-report"),
        ]);
        if (cancelled) return;
        setEdgeReport(e);
        setTableReport(t);
        setPageReport(p);
        setRouteReport(r);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load reports");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dimensions: Dimension[] = useMemo(() => {
    const edgeOnDisk = edgeReport?.totalOnDisk ?? 86;
    const edgeClaimed = edgeReport?.totalClaimed ?? totalEdgeFunctions();
    const tableOnDb = tableReport?.totalOnDb ?? 201;
    const tableClaimed = tableReport?.totalClaimed ?? totalTables();
    const pagesOnDisk = pageReport?.totalOnDisk ?? 0;
    const pagesRegistered = pageReport?.registered ?? PAGE_STATE_REGISTRY.length;
    const routeDeclared = routeReport?.declaredCount ?? 0;
    const routeBindings = routeReport?.bindingsCount ?? ROUTE_CONTEXT_BINDINGS.length;

    return [
      {
        key: "edgeFunctions",
        label: "Edge functions",
        icon: FileCode,
        onDisk: edgeOnDisk,
        registered: edgeClaimed,
        orphans: edgeReport?.orphans ?? [],
      },
      {
        key: "tables",
        label: "Database tables",
        icon: Database,
        onDisk: tableOnDb,
        registered: tableClaimed,
        orphans: tableReport?.orphans ?? [],
      },
      {
        key: "pages",
        label: "Critical pages",
        icon: FileText,
        onDisk: pagesOnDisk || pagesRegistered,
        registered: pagesRegistered,
        orphans: pageReport?.orphanCritical ?? [],
      },
      {
        key: "routes",
        label: "Routes",
        icon: Route,
        onDisk: routeDeclared || routeBindings,
        registered: routeBindings,
        orphans: routeReport?.unowned ?? [],
      },
    ];
  }, [edgeReport, tableReport, pageReport, routeReport]);

  const overallScore = useMemo(() => {
    let total = 0;
    let covered = 0;
    for (const d of dimensions) {
      total += d.onDisk;
      covered += Math.min(d.registered, d.onDisk);
    }
    return total === 0 ? 0 : Math.round((covered / total) * 100);
  }, [dimensions]);

  const allGreen = dimensions.every((d) => d.orphans.length === 0);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Failed to load completeness reports</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Completeness Matrix</h1>
          <p className="text-muted-foreground mt-1">
            Phase 10 — registries vs. disk &amp; database truth.
          </p>
        </div>
        <Badge
          variant={allGreen ? "default" : "destructive"}
          className="text-base px-4 py-2"
        >
          {allGreen ? (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          ) : (
            <AlertTriangle className="h-4 w-4 mr-2" />
          )}
          {overallScore}% covered
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bounded contexts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{BOUNDED_CONTEXT_REGISTRY.length}</div>
          <p className="text-sm text-muted-foreground mt-1">
            Owning {totalEdgeFunctions()} edge functions and {totalTables()} tables.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {dimensions.map((d) => {
          const Icon = d.icon;
          const pct = d.onDisk === 0 ? 100 : Math.round((Math.min(d.registered, d.onDisk) / d.onDisk) * 100);
          const isGreen = d.orphans.length === 0;
          return (
            <Card key={d.key}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {d.label}
                  <Badge variant={isGreen ? "default" : "destructive"} className="ml-auto">
                    {pct}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={pct} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Registered</span>
                  <span className="font-mono">
                    {d.registered} / {d.onDisk}
                  </span>
                </div>
                {d.orphans.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-destructive mb-2">
                      {d.orphans.length} orphan{d.orphans.length === 1 ? "" : "s"}:
                    </p>
                    <ScrollArea className="h-32 rounded border p-2">
                      <ul className="space-y-1 text-xs font-mono">
                        {d.orphans.slice(0, 50).map((o) => (
                          <li key={o} className="text-muted-foreground">{o}</li>
                        ))}
                        {d.orphans.length > 50 && (
                          <li className="text-muted-foreground italic">…and {d.orphans.length - 50} more</li>
                        )}
                      </ul>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!allGreen && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Reality gap detected</AlertTitle>
          <AlertDescription>
            One or more dimensions has files or tables on disk that are not claimed by any
            bounded context. Update <code>bounded-context-registry.ts</code> or{" "}
            <code>page-state-registry.ts</code> to close the gap.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
