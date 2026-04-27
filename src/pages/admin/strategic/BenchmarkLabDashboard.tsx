import { FlaskConical, CheckCircle, Clock, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/platform/auth/hooks/useRequireAdmin";
import { useEngineEvents } from "@/platform/personal-brain/hooks/useEngineEventsData";
import { useIntelligenceOverview } from "@/platform/personal-brain/hooks/useIntelligenceAPI";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const BenchmarkLabDashboard = () => {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const { events: experiments, loading } = useEngineEvents("benchmark-lab", { limit: 50 });
  const { data: overview } = useIntelligenceOverview();

  if (authLoading || !isAdmin) return null;

  const exps = experiments.map(e => ({
    dim: (e.event_data.dimension as string) || "unknown",
    domain: (e.event_data.domain as string) || "platform",
    task: (e.event_data.task as string) || "",
    status: (e.event_data.status as string) || "completed",
    winner: (e.event_data.winner as string) || "—",
    labelA: (e.event_data.label_a as string) || "A",
    labelB: (e.event_data.label_b as string) || "B",
    costA: Number(e.event_data.cost_a) || 0,
    costB: Number(e.event_data.cost_b) || 0,
    qualA: Number(e.event_data.quality_a) || 0,
    qualB: Number(e.event_data.quality_b) || 0,
    samples: Number(e.event_data.samples) || 0,
    conf: Number(e.event_data.confidence) || 0,
    savings: Number(e.event_data.savings) || 0,
    insight: (e.event_data.insight as string) || "",
    createdAt: e.created_at,
  }));

  const totalSavings = exps.reduce((s, e) => s + e.savings, 0);
  const completed = exps.filter(e => e.status === "completed").length;
  const running = exps.filter(e => e.status === "running").length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<SitaPageHeader icon={<FlaskConical className="h-6 w-6" />} title="Intelligence Benchmark Lab" subtitle="A/B experiments comparing reasoning strategies — cheap vs expensive, reused vs fresh, compressed vs full" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Experiments", v: String(exps.length), icon: FlaskConical },
          { l: "Completed", v: String(completed), c: "text-emerald-400", icon: CheckCircle },
          { l: "Running", v: String(running), icon: Clock },
          { l: "Total Savings", v: `$${(totalSavings / 100).toFixed(0)}`, c: "text-emerald-400", icon: DollarSign },
        ].map(m => (
          <Card key={m.l} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center">
            <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.c || "text-primary"}`} />
            <p className={`text-xl font-bold ${m.c || "text-foreground"}`}>{m.v}</p>
            <p className="text-[10px] text-muted-foreground">{m.l}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Asset Intelligence Summary from API */}
      {overview && (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Intelligence Capital Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center">
              <div><p className="text-lg font-bold text-foreground">{overview.assetSummary.totalAssets}</p><p className="text-[10px] text-muted-foreground">Total Assets</p></div>
              <div><p className="text-lg font-bold text-emerald-400">{overview.assetSummary.totalReuses}</p><p className="text-[10px] text-muted-foreground">Total Reuses</p></div>
              <div><p className="text-lg font-bold text-emerald-400">${overview.assetSummary.totalCostAvoided.toFixed(0)}</p><p className="text-[10px] text-muted-foreground">Cost Avoided</p></div>
              <div><p className="text-lg font-bold text-foreground">{overview.assetSummary.avgFreshness}%</p><p className="text-[10px] text-muted-foreground">Avg Freshness</p></div>
              <div><p className="text-lg font-bold text-amber-400">{overview.assetSummary.staleAssets}</p><p className="text-[10px] text-muted-foreground">Stale</p></div>
              <div><p className="text-lg font-bold text-foreground">{Math.round(overview.reuseRate * 100)}%</p><p className="text-[10px] text-muted-foreground">Reuse Rate</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading benchmark experiments…</div>
      ) : exps.length === 0 ? (
        <Card className="bg-card/80 border-border/50"><CardContent className="py-8 text-center text-muted-foreground text-sm">
          No benchmark experiments recorded yet. Experiments will appear as the system runs A/B tests on reasoning strategies.
        </CardContent></Card>
      ) : (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Experiment Results</CardTitle></CardHeader>
          <CardContent><Table><TableHeader><TableRow>
            <TableHead className="text-xs">Dimension</TableHead><TableHead className="text-xs">Domain</TableHead>
            <TableHead className="text-xs text-center">Status</TableHead><TableHead className="text-xs text-center">Winner</TableHead>
            <TableHead className="text-xs text-right">Cost A</TableHead><TableHead className="text-xs text-right">Cost B</TableHead>
            <TableHead className="text-xs text-right">Qual A</TableHead><TableHead className="text-xs text-right">Qual B</TableHead>
            <TableHead className="text-xs text-right">Samples</TableHead><TableHead className="text-xs">Insight</TableHead>
          </TableRow></TableHeader><TableBody>
            {exps.map((e, i) => (<TableRow key={i}>
              <TableCell className="text-xs font-medium text-foreground">{e.dim.replace(/_/g, " ")}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{e.domain}</TableCell>
              <TableCell className="text-center"><Badge variant={e.status === "completed" ? "secondary" : "outline"} className="text-[9px]">{e.status}</Badge></TableCell>
              <TableCell className="text-center text-xs font-bold text-primary">{e.winner}</TableCell>
              <TableCell className="text-xs text-right font-mono">{e.costA}</TableCell>
              <TableCell className="text-xs text-right font-mono">{e.costB}</TableCell>
              <TableCell className="text-xs text-right">{e.qualA}</TableCell>
              <TableCell className="text-xs text-right">{e.qualB}</TableCell>
              <TableCell className="text-xs text-right">{e.samples}</TableCell>
              <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{e.insight}</TableCell>
            </TableRow>))}
          </TableBody></Table></CardContent>
        </Card>
      )}
    </div>
  );
};
export default BenchmarkLabDashboard;
