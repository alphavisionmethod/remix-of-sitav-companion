import { Brain, DollarSign, TrendingUp, Library, Activity, RefreshCw, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/platform/auth/hooks/useRequireAdmin";
import { useIntelligenceAssets } from "@/platform/personal-brain/hooks/useIntelligencePersistence";
import { useMemo } from "react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const H = ({ icon: I, label, value, sub, color }: any) => (
  <Card className="bg-card/80 border-border/50"><CardContent className="p-3 text-center">
    <I className={`h-4 w-4 mx-auto mb-1 ${color || "text-primary"}`} />
    <p className={`text-xl font-bold ${color || "text-foreground"}`}>{value}</p>
    <p className="text-[10px] text-muted-foreground">{label}</p>
    <p className="text-[10px] text-muted-foreground/60">{sub}</p>
  </CardContent></Card>
);

const IntelligenceCapitalDashboard = () => {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const { assets, stats, loading: dataLoading } = useIntelligenceAssets();

  const domains = useMemo(() => {
    const map: Record<string, { assets: number; active: number; totalReuse: number; totalSavings: number; totalFreshness: number }> = {};
    for (const a of assets) {
      const d = a.domain || "platform";
      if (!map[d]) map[d] = { assets: 0, active: 0, totalReuse: 0, totalSavings: 0, totalFreshness: 0 };
      map[d].assets++;
      if (!a.invalidated) map[d].active++;
      map[d].totalReuse += a.reuse_count;
      map[d].totalSavings += a.cost_avoided_cents;
      map[d].totalFreshness += Number(a.freshness_score) || 0;
    }
    return Object.entries(map).map(([domain, d]) => ({
      domain,
      assets: d.assets,
      active: d.active,
      reuseRate: d.assets > 0 ? d.totalReuse / d.assets : 0,
      costAvoided: d.totalSavings,
      freshness: d.assets > 0 ? Math.round((d.totalFreshness / d.assets) * 100) : 0,
      richness: Math.min(100, d.assets * 5 + d.active * 3),
    })).sort((a, b) => b.assets - a.assets);
  }, [assets]);

  const reuseRate = stats.total > 0 ? stats.totalReuses / stats.total : 0;
  const roi = stats.totalCostAvoided > 0 ? (stats.totalCostAvoided / Math.max(1, stats.total * 10)).toFixed(1) : "0";
  const trend = reuseRate > 0.5 ? "growing" : reuseRate > 0.2 ? "stable" : "emerging";

  if (authLoading || !isAdmin) return null;
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<SitaPageHeader icon={<Brain className="h-6 w-6" />} title="Intelligence Capital Index" subtitle="SITA's accumulated intelligence treated as a strategic asset base" >
        <Badge variant="secondary" className="gap-1 text-emerald-400"><TrendingUp className="h-3 w-3" /> {trend} · {roi}x ROI</Badge>
      </SitaPageHeader>
      {dataLoading ? (
        <div className="text-center text-muted-foreground py-12">Loading intelligence data from database…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <H icon={Library} label="Total Assets" value={stats.total} sub="intelligence units" />
            <H icon={Activity} label="Active" value={stats.total - stats.invalidatedCount} sub={`${stats.invalidatedCount} stale`} color="text-emerald-400" />
            <H icon={Layers} label="Total Reuses" value={stats.totalReuses} sub="composite score" />
            <H icon={RefreshCw} label="Reuse Rate" value={`${(reuseRate*100).toFixed(0)}%`} sub="of reasoning reused" color="text-emerald-400" />
            <H icon={DollarSign} label="Cost Avoided" value={`$${(stats.totalCostAvoided/100).toFixed(0)}`} sub="compute savings" color="text-emerald-400" />
            <H icon={DollarSign} label="Avg Freshness" value={`${(stats.avgFreshness*100).toFixed(0)}%`} sub="across all assets" />
            <H icon={Activity} label="Invalidated" value={stats.invalidatedCount} sub="need review" />
            <H icon={TrendingUp} label="Capital ROI" value={`${roi}x`} sub="value / creation cost" color="text-emerald-400" />
          </div>
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Domain Intelligence Richness</CardTitle></CardHeader>
            <CardContent>
              {domains.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">No intelligence assets yet. Assets will appear as the system generates reusable reasoning.</p>
              ) : (
                <Table><TableHeader><TableRow>
                  <TableHead className="text-xs">Domain</TableHead><TableHead className="text-xs text-right">Assets</TableHead>
                  <TableHead className="text-xs text-right">Active</TableHead><TableHead className="text-xs text-right">Avg Reuse</TableHead>
                  <TableHead className="text-xs text-right">Savings</TableHead><TableHead className="text-xs text-right">Freshness</TableHead>
                  <TableHead className="text-xs text-right">Richness</TableHead>
                </TableRow></TableHeader><TableBody>
                  {domains.map(d => (<TableRow key={d.domain}>
                    <TableCell className="text-xs font-medium text-foreground">{d.domain}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{d.assets}</TableCell>
                    <TableCell className="text-xs text-right text-emerald-400">{d.active}</TableCell>
                    <TableCell className="text-xs text-right">{d.reuseRate.toFixed(1)}</TableCell>
                    <TableCell className="text-xs text-right font-mono text-emerald-400">${(d.costAvoided/100).toFixed(0)}</TableCell>
                    <TableCell className="text-xs text-right">{d.freshness}%</TableCell>
                    <TableCell className="text-xs text-right"><div className="flex items-center justify-end gap-2"><Progress value={d.richness} className="w-12 h-1.5" /><span>{d.richness}</span></div></TableCell>
                  </TableRow>))}
                </TableBody></Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
export default IntelligenceCapitalDashboard;
