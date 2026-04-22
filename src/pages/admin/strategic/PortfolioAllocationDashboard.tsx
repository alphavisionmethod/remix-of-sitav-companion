import { PieChart, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { useComputeSnapshots } from "@/hooks/useIntelligencePersistence";
import { DEMO_DEFAULT_CATEGORIES } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const PortfolioAllocationDashboard = () => {
  const { isDemoMode } = useDataMode();
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const { snapshots, latest, loading: dataLoading } = useComputeSnapshots({ limit: 30 });

  if (authLoading || !isAdmin) return null;

  // Derive allocation from latest snapshot's model_mix or use defaults
  const modelMix = (latest?.model_mix as Record<string, number>) || {};
  const totalSpent = latest?.used_cents ?? 0;

  const cats = (isDemoMode ? DEMO_DEFAULT_CATEGORIES : [] as typeof DEMO_DEFAULT_CATEGORIES).map(c => {
    const actual = modelMix[c.cat] ?? c.target;
    const spent = Math.round(totalSpent * (actual / 100));
    return { ...c, actual, spent };
  });

  const drifts = cats.filter(c => Math.abs(c.actual - c.target) > 5);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<SitaPageHeader icon={<PieChart className="h-6 w-6" />} title="AI Portfolio Allocation" subtitle="Treat AI spend like an investment portfolio — defensive, growth, strategic, experimental" />

      {dataLoading ? (
        <div className="text-center text-muted-foreground py-12">Loading compute snapshots…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {cats.map(c => (<Card key={c.cat} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center space-y-1">
              <p className="text-lg font-bold text-foreground">{c.actual}%</p>
              <p className="text-[10px] text-muted-foreground">{c.cat.replace(/_/g, " ")}</p>
              <Progress value={c.actual} className="h-1.5" />
              <p className="text-[9px] text-muted-foreground/60">target: {c.target}% · ${(c.spent / 100).toFixed(0)}</p>
            </CardContent></Card>))}
          </div>

          {drifts.length > 0 && (
            <Card className="bg-card/80 border-amber-500/20">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Drift Alerts</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {drifts.map(d => (<div key={d.cat} className="p-2 rounded-lg bg-amber-500/5 flex items-center justify-between">
                  <span className="text-xs text-foreground">{d.cat.replace(/_/g, " ")}: {d.actual}% actual vs {d.target}% target</span>
                  <Badge variant="outline" className="text-[9px] text-amber-400">{d.actual > d.target ? "over" : "under"} by {Math.abs(d.actual - d.target)}%</Badge>
                </div>))}
              </CardContent>
            </Card>
          )}

          {snapshots.length === 0 && (
            <Card className="bg-card/80 border-border/50"><CardContent className="py-8 text-center text-muted-foreground text-sm">
              No compute budget snapshots recorded yet. Snapshots will appear as the system records AI spend data.
            </CardContent></Card>
          )}

          {snapshots.length > 0 && (
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Snapshots ({snapshots.length})</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                {snapshots.slice(0, 10).map(s => (
                  <div key={s.id} className="flex items-center justify-between text-xs p-2 bg-secondary/20 rounded">
                    <span className="text-muted-foreground">{new Date(s.snapshot_at).toLocaleString()}</span>
                    <span className="text-foreground font-mono">${(s.used_cents / 100).toFixed(2)} / ${(s.allocated_cents / 100).toFixed(2)}</span>
                    <Badge variant="outline" className="text-[9px]">{s.margin_posture}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
export default PortfolioAllocationDashboard;
