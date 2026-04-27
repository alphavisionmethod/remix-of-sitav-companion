import { FileSearch, GitBranch, RotateCcw, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/platform/auth/hooks/useRequireAdmin";
import { useEngineEvents } from "@/platform/personal-brain/hooks/useEngineEventsData";
import { useIntelligenceOverview } from "@/platform/personal-brain/hooks/useIntelligenceAPI";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const ReasoningReplayDashboard = () => {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const { events, loading } = useEngineEvents("reasoning-replay", { limit: 50 });
  const { data: overview } = useIntelligenceOverview();

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

  const totalConsidered = replays.reduce((s, r) => s + r.stepsConsidered, 0);
  const totalSkipped = replays.reduce((s, r) => s + r.stepsSkipped, 0);
  const totalReused = replays.reduce((s, r) => s + r.assetsReused, 0);
  const escalatedCount = replays.filter(r => r.escalated).length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<SitaPageHeader icon={<FileSearch className="h-6 w-6" />} title="Reasoning Insurance Replay" subtitle="Meta-reasoning traces — what was considered, skipped, reused, and why" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Steps Considered", v: String(totalConsidered), icon: GitBranch },
          { l: "Steps Skipped", v: String(totalSkipped), c: "text-muted-foreground", icon: RotateCcw },
          { l: "Assets Reused", v: String(totalReused), c: "text-emerald-400", icon: FileSearch },
          { l: "Escalated", v: String(escalatedCount), c: escalatedCount > 0 ? "text-amber-400" : "text-emerald-400", icon: Shield },
        ].map(m => (
          <Card key={m.l} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center">
            <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.c || "text-muted-foreground"}`} />
            <p className={`text-xl font-bold ${m.c || "text-foreground"}`}>{m.v}</p>
            <p className="text-[10px] text-muted-foreground">{m.l}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Pattern Summary from API */}
      {overview && (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Intelligence Patterns</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{overview.patternSummary.total}</p>
                <p className="text-[10px] text-muted-foreground">Total Patterns</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-400">{overview.patternSummary.active}</p>
                <p className="text-[10px] text-muted-foreground">Active</p>
              </div>
              {overview.decayAlerts.length > 0 && (
                <div className="text-center">
                  <p className="text-lg font-bold text-amber-400">{overview.decayAlerts.length}</p>
                  <p className="text-[10px] text-muted-foreground">Decay Alerts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
