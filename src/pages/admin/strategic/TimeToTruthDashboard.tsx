import { Clock, Activity, Zap, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { useEngineEvents } from "@/hooks/useEngineEventsData";
import { useIntelligenceOverview } from "@/hooks/useIntelligenceAPI";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const TimeToTruthDashboard = () => {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const { events, loading } = useEngineEvents("time-to-truth", { limit: 50 });
  const { data: overview } = useIntelligenceOverview();

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

  const avgUsable = entries.length > 0 ? entries.reduce((s, e) => s + e.timeToUsable, 0) / entries.length : 0;
  const avgVerified = entries.length > 0 ? entries.reduce((s, e) => s + e.timeToVerified, 0) / entries.length : 0;
  const fastest = entries.length > 0 ? Math.min(...entries.map(e => e.timeToUsable)) : 0;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<SitaPageHeader icon={<Clock className="h-6 w-6" />} title="Time-to-Truth Optimizer" subtitle="Track time to usable, confident, verified, and approved answers" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Avg → Usable", v: `${(avgUsable / 1000).toFixed(1)}s`, icon: Zap },
          { l: "Avg → Verified", v: `${(avgVerified / 1000).toFixed(1)}s`, icon: CheckCircle },
          { l: "Fastest", v: `${(fastest / 1000).toFixed(1)}s`, c: "text-emerald-400", icon: Activity },
          { l: "Optimizations", v: overview ? String(overview.topOptimizations.length) : "—", icon: Clock },
        ].map(m => (
          <Card key={m.l} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center">
            <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.c || "text-muted-foreground"}`} />
            <p className={`text-xl font-bold ${m.c || "text-foreground"}`}>{m.v}</p>
            <p className="text-[10px] text-muted-foreground">{m.l}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Optimization Suggestions from API */}
      {overview && overview.topOptimizations.length > 0 && (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Optimization Suggestions</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {overview.topOptimizations.map((opt, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3 w-3 text-amber-400 shrink-0" />
                <span>{opt}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
