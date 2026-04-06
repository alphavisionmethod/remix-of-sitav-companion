import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { useEngineEvents } from "@/lib/hooks/useEngineEventsData";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const CostToConfidenceDashboard = () => {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const { events, loading } = useEngineEvents("cost-to-confidence", { limit: 50 });

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

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <SitaPageHeader icon={<TrendingUp className="h-6 w-6" />} title="Cost-to-Confidence Curve" subtitle="Confidence achieved vs cost spent, with diminishing returns identification" />
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
