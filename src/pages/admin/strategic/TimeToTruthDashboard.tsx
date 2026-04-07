import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { useEngineEvents } from "@/lib/hooks/useEngineEventsData";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const TimeToTruthDashboard = () => {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const { events, loading } = useEngineEvents("time-to-truth", { limit: 50 });

  if (authLoading || !isAdmin) return null;

  const entries = events.map(e => ({
    taskType: (e.event_data.task_type as string) || "unknown",
    domain: (e.event_data.domain as string) || "platform",
    timeToUsable: Number(e.event_data.time_to_usable_ms) || 0,
    timeToConfident: Number(e.event_data.time_to_confident_ms) || 0,
    timeToVerified: Number(e.event_data.time_to_verified_ms) || 0,
    timeToApproved: Number(e.event_data.time_to_approved_ms) || 0,
    createdAt: e.created_at,
  }));

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <SitaPageHeader icon={<Clock className="h-6 w-6" />} title="Time-to-Truth Optimizer" subtitle="Track time to usable, confident, verified, and approved answers" />
      {loading ? (
        <div className="text-center text-muted-foreground py-12">Loading time-to-truth data…</div>
      ) : entries.length === 0 ? (
        <Card className="bg-card/80 border-border/50"><CardContent className="py-8 text-center text-muted-foreground text-sm">
          No time-to-truth data yet. Timing measurements will appear as tasks flow through the reasoning pipeline.
        </CardContent></Card>
      ) : (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Time-to-Truth by Task</CardTitle></CardHeader>
          <CardContent><Table><TableHeader><TableRow>
            <TableHead className="text-xs">Task</TableHead><TableHead className="text-xs">Domain</TableHead>
            <TableHead className="text-xs text-right">→ Usable</TableHead><TableHead className="text-xs text-right">→ Confident</TableHead>
            <TableHead className="text-xs text-right">→ Verified</TableHead><TableHead className="text-xs text-right">→ Approved</TableHead>
          </TableRow></TableHeader><TableBody>
            {entries.map((e, i) => (<TableRow key={i}>
              <TableCell className="text-xs font-medium text-foreground">{e.taskType.replace(/_/g, " ")}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{e.domain}</TableCell>
              <TableCell className="text-xs text-right font-mono">{(e.timeToUsable / 1000).toFixed(1)}s</TableCell>
              <TableCell className="text-xs text-right font-mono">{(e.timeToConfident / 1000).toFixed(1)}s</TableCell>
              <TableCell className="text-xs text-right font-mono">{(e.timeToVerified / 1000).toFixed(1)}s</TableCell>
              <TableCell className="text-xs text-right font-mono">{(e.timeToApproved / 1000).toFixed(1)}s</TableCell>
            </TableRow>))}
          </TableBody></Table></CardContent>
        </Card>
      )}
    </div>
  );
};
export default TimeToTruthDashboard;
