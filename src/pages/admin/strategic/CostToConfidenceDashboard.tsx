import { TrendingUp, BarChart3, DollarSign, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { useEngineEvents } from "@/hooks/useEngineEventsData";
import { useIntelligenceOverview, useEfficiencyScores } from "@/hooks/useIntelligenceAPI";
import { Progress } from "@/components/ui/progress";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const CostToConfidenceDashboard = () => {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const { events, loading } = useEngineEvents("cost-to-confidence", { limit: 50 });
  const { data: overview } = useIntelligenceOverview();
  const { data: effScores } = useEfficiencyScores();

  if (authLoading || !isAdmin) return null;

  const curves = events.map(e => ({
    taskType: (e.event_data.task_type as string) || "unknown",
    domain: (e.event_data.domain as string) || "platform",
    costSpent: Number(e.event_data.cost_cents) || 0,
    confidence: Number(e.event_data.confidence) || 0,
    latencyMs: Number(e.event_data.latency_ms) || 0,
    diminishingAt: Number(e.event_data.diminishing_point) || 0,
    idealStop: Number(e.event_data.ideal_stop) || 0,
    createdAt: e.created_at,
  }));

  const avgCost = curves.length > 0 ? curves.reduce((s, c) => s + c.costSpent, 0) / curves.length : 0;
  const avgConf = curves.length > 0 ? curves.reduce((s, c) => s + c.confidence, 0) / curves.length : 0;
  const avgDiminishing = curves.length > 0 ? curves.reduce((s, c) => s + c.diminishingAt, 0) / curves.length : 0;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<SitaPageHeader icon={<TrendingUp className="h-6 w-6" />} title="Cost-to-Confidence Curve" subtitle="Confidence achieved vs cost spent, with diminishing returns identification" />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Avg Cost/Task", v: `$${(avgCost / 100).toFixed(2)}`, icon: DollarSign },
          { l: "Avg Confidence", v: `${Math.round(avgConf)}%`, c: avgConf > 80 ? "text-emerald-400" : "text-amber-400", icon: BarChart3 },
          { l: "Diminishing Point", v: `${Math.round(avgDiminishing)}%`, icon: TrendingUp },
          { l: "Efficiency Score", v: overview ? `${Math.round(overview.avgEfficiency * 100)}%` : "—", c: "text-primary", icon: Zap },
        ].map(m => (
          <Card key={m.l} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center">
            <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.c || "text-muted-foreground"}`} />
            <p className={`text-xl font-bold ${m.c || "text-foreground"}`}>{m.v}</p>
            <p className="text-[10px] text-muted-foreground">{m.l}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Efficiency Trend from API */}
      {overview && overview.efficiencyTrend.length > 0 && (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Efficiency Trend (Last 30 Days)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {overview.efficiencyTrend.slice(0, 10).map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground w-20 shrink-0">{new Date(t.measuredAt).toLocaleDateString()}</span>
                <Progress value={Number(t.score) * 100} className="flex-1 h-2" />
                <span className="text-xs font-mono w-12 text-right">{(Number(t.score) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Loading cost-to-confidence data…</div>
      ) : curves.length === 0 ? (
        <Card className="bg-card/80 border-border/50"><CardContent className="py-8 text-center text-muted-foreground text-sm">
          No cost-to-confidence data recorded yet. Data will appear as the system analyzes task costs vs confidence outcomes.
        </CardContent></Card>
      ) : (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Cost vs Confidence by Task Type</CardTitle></CardHeader>
          <CardContent><Table><TableHeader><TableRow>
            <TableHead className="text-xs">Task Type</TableHead><TableHead className="text-xs">Domain</TableHead>
            <TableHead className="text-xs text-right">Cost</TableHead><TableHead className="text-xs text-right">Confidence</TableHead>
            <TableHead className="text-xs text-right">Latency</TableHead><TableHead className="text-xs text-right">Diminishing At</TableHead>
            <TableHead className="text-xs text-right">Ideal Stop</TableHead>
          </TableRow></TableHeader><TableBody>
            {curves.map((c, i) => (<TableRow key={i}>
              <TableCell className="text-xs font-medium text-foreground">{c.taskType.replace(/_/g, " ")}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{c.domain}</TableCell>
              <TableCell className="text-xs text-right font-mono">${(c.costSpent / 100).toFixed(2)}</TableCell>
              <TableCell className="text-xs text-right">{c.confidence}%</TableCell>
              <TableCell className="text-xs text-right">{c.latencyMs}ms</TableCell>
              <TableCell className="text-xs text-right">{c.diminishingAt}%</TableCell>
              <TableCell className="text-xs text-right">{c.idealStop}%</TableCell>
            </TableRow>))}
          </TableBody></Table></CardContent>
        </Card>
      )}
    </div>
  );
};
export default CostToConfidenceDashboard;
