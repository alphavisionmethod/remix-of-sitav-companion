import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radar, TrendingDown, AlertTriangle, Repeat } from "lucide-react";
import LTSubNav from "@/platform/admin/components/admin/LTSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const LT07TruthRegressionRadar = () => {
  const { data: regressions } = useQuery({
    queryKey: ["regressions-all"],
    queryFn: async () => {
      const { data } = await fromTable("behavioral_regressions").select("*").order("last_seen_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  const active = regressions?.filter((r: Record<string, any>) => !r.resolved) ?? [];
  const resolved = regressions?.filter((r: Record<string, any>) => r.resolved) ?? [];
  const highSev = active.filter((r: Record<string, any>) => r.severity === "critical" || r.severity === "high");
  const flaky = active.filter((r: Record<string, any>) => r.occurrence_count > 3);

  // Domain heatmap
  const domainCounts: Record<string, number> = {};
  active.forEach((r: Record<string, any>) => {
    const d = r.domain || "unknown";
    domainCounts[d] = (domainCounts[d] || 0) + 1;
  });

  return (
    <div className="space-y-6 p-6">
      <LTSubNav />
<div>
        <h1 className="text-2xl font-bold">Truth Regression Radar</h1>
        <p className="text-sm text-muted-foreground">Detect newly broken behaviors, flaky tests, and domain degradation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><AlertTriangle className="h-4 w-4" />Active</div>
            <div className="text-3xl font-bold text-destructive">{active.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><TrendingDown className="h-4 w-4" />High/Critical</div>
            <div className="text-3xl font-bold">{highSev.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Repeat className="h-4 w-4" />Flaky (3+ occurrences)</div>
            <div className="text-3xl font-bold">{flaky.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-1">Resolved</div>
            <div className="text-3xl font-bold text-green-600">{resolved.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Domain Heatmap */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Radar className="h-5 w-5" />Domain Trend Heatmap</CardTitle></CardHeader>
        <CardContent>
          {Object.keys(domainCounts).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {Object.entries(domainCounts).sort(([,a], [,b]) => b - a).map(([domain, count]) => (
                <div key={domain} className="flex items-center gap-2 p-3 rounded-lg border" style={{ borderColor: count > 3 ? "hsl(var(--destructive))" : undefined }}>
                  <span className="font-medium">{domain}</span>
                  <Badge variant={count > 3 ? "destructive" : count > 1 ? "secondary" : "outline"}>{count}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No regressions by domain — system is clean.</p>
          )}
        </CardContent>
      </Card>

      {/* Regression Timeline */}
      <Card>
        <CardHeader><CardTitle>Regression Timeline</CardTitle></CardHeader>
        <CardContent>
          {active.length > 0 ? (
            <div className="space-y-2">
              {active.map((r: Record<string, any>) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded border">
                  <div>
                    <p className="font-medium">{r.description || r.route || "Unknown regression"}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.domain} · {r.severity} · {r.regression_type} · seen {r.occurrence_count}x
                      {r.linked_commit && <span className="ml-1 font-mono">@ {r.linked_commit.slice(0, 8)}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">First: {new Date(r.first_seen_at).toLocaleDateString()} · Last: {new Date(r.last_seen_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="destructive">{r.severity}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No active regressions detected.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LT07TruthRegressionRadar;
