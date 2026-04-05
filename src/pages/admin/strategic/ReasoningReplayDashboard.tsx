import { FileSearch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { useEngineEvents } from "@/lib/hooks/useEngineEventsData";

const ReasoningReplayDashboard = () => {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const { events, loading } = useEngineEvents("reasoning-replay", { limit: 50 });

  if (authLoading || !isAdmin) return null;

  const replays = events.map(e => ({
    taskType: (e.event_data.task_type as string) || "unknown",
    domain: (e.event_data.domain as string) || "platform",
    stepsConsidered: Number(e.event_data.steps_considered) || 0,
    stepsSkipped: Number(e.event_data.steps_skipped) || 0,
    assetsReused: Number(e.event_data.assets_reused) || 0,
    escalated: (e.event_data.escalated as boolean) ?? false,
    finalRoute: (e.event_data.final_route as string) || "standard",
    confidence: Number(e.event_data.confidence) || 0,
    createdAt: e.created_at,
  }));

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <SitaPageHeader icon={<FileSearch className="h-6 w-6" />} title="Reasoning Insurance Replay" subtitle="Meta-reasoning traces — what was considered, skipped, reused, and why" />
      {loading ? (
        <div className="text-center text-muted-foreground py-12">Loading reasoning replays…</div>
      ) : replays.length === 0 ? (
        <Card className="bg-card/80 border-border/50"><CardContent className="py-8 text-center text-muted-foreground text-sm">
          No reasoning replays recorded yet. Replays will be captured for high-value tasks showing the full decision trace.
        </CardContent></Card>
      ) : (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Reasoning Traces</CardTitle></CardHeader>
          <CardContent><Table><TableHeader><TableRow>
            <TableHead className="text-xs">Task</TableHead><TableHead className="text-xs">Domain</TableHead>
            <TableHead className="text-xs text-right">Considered</TableHead><TableHead className="text-xs text-right">Skipped</TableHead>
            <TableHead className="text-xs text-right">Reused</TableHead><TableHead className="text-xs text-center">Escalated</TableHead>
            <TableHead className="text-xs">Route</TableHead><TableHead className="text-xs text-right">Conf.</TableHead>
          </TableRow></TableHeader><TableBody>
            {replays.map((r, i) => (<TableRow key={i}>
              <TableCell className="text-xs font-medium text-foreground">{r.taskType.replace(/_/g, " ")}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{r.domain}</TableCell>
              <TableCell className="text-xs text-right">{r.stepsConsidered}</TableCell>
              <TableCell className="text-xs text-right">{r.stepsSkipped}</TableCell>
              <TableCell className="text-xs text-right text-emerald-400">{r.assetsReused}</TableCell>
              <TableCell className="text-center">{r.escalated ? <Badge variant="outline" className="text-[9px] text-amber-400">yes</Badge> : "—"}</TableCell>
              <TableCell><Badge variant="secondary" className="text-[9px]">{r.finalRoute}</Badge></TableCell>
              <TableCell className="text-xs text-right">{r.confidence}%</TableCell>
            </TableRow>))}
          </TableBody></Table></CardContent>
        </Card>
      )}
    </div>
  );
};
export default ReasoningReplayDashboard;
