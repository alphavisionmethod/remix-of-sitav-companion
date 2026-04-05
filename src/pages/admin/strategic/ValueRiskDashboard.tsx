import { Grid3x3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { useEngineEvents } from "@/lib/hooks/useEngineEventsData";

const ValueRiskDashboard = () => {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const { events, loading } = useEngineEvents("value-risk-matrix", { limit: 50 });

  if (authLoading || !isAdmin) return null;

  const entries = events.map(e => ({
    task: (e.event_data.task as string) || "unknown",
    domain: (e.event_data.domain as string) || "platform",
    expectedValue: Number(e.event_data.expected_value) || 0,
    expectedCost: Number(e.event_data.expected_cost) || 0,
    confidence: Number(e.event_data.confidence) || 0,
    blastRadius: (e.event_data.blast_radius as string) || "low",
    reversible: (e.event_data.reversible as boolean) ?? true,
    route: (e.event_data.chosen_route as string) || "standard",
    createdAt: e.created_at,
  }));

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <SitaPageHeader icon={<Grid3x3 className="h-6 w-6" />} title="Value-Risk Matrix" subtitle="Expected value vs cost, confidence, blast radius, and reversibility for major tasks" />
      {loading ? (
        <div className="text-center text-muted-foreground py-12">Loading value-risk data…</div>
      ) : entries.length === 0 ? (
        <Card className="bg-card/80 border-border/50"><CardContent className="py-8 text-center text-muted-foreground text-sm">
          No value-risk assessments recorded yet. The matrix populates as tasks are evaluated through the routing engine.
        </CardContent></Card>
      ) : (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Task Assessments</CardTitle></CardHeader>
          <CardContent><Table><TableHeader><TableRow>
            <TableHead className="text-xs">Task</TableHead><TableHead className="text-xs">Domain</TableHead>
            <TableHead className="text-xs text-right">Value</TableHead><TableHead className="text-xs text-right">Cost</TableHead>
            <TableHead className="text-xs text-right">Conf.</TableHead><TableHead className="text-xs">Blast</TableHead>
            <TableHead className="text-xs text-center">Rev.</TableHead><TableHead className="text-xs">Route</TableHead>
          </TableRow></TableHeader><TableBody>
            {entries.map((e, i) => (<TableRow key={i}>
              <TableCell className="text-xs font-medium text-foreground">{e.task.replace(/_/g, " ")}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{e.domain}</TableCell>
              <TableCell className="text-xs text-right font-mono text-emerald-400">${(e.expectedValue / 100).toFixed(0)}</TableCell>
              <TableCell className="text-xs text-right font-mono">${(e.expectedCost / 100).toFixed(0)}</TableCell>
              <TableCell className="text-xs text-right">{e.confidence}%</TableCell>
              <TableCell><Badge variant="outline" className="text-[9px]">{e.blastRadius}</Badge></TableCell>
              <TableCell className="text-center text-xs">{e.reversible ? "✓" : "✗"}</TableCell>
              <TableCell><Badge variant="secondary" className="text-[9px]">{e.route}</Badge></TableCell>
            </TableRow>))}
          </TableBody></Table></CardContent>
        </Card>
      )}
    </div>
  );
};
export default ValueRiskDashboard;
