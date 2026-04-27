import {
  Brain, RefreshCw, Library, DollarSign, TrendingUp, TrendingDown,
  Activity, Shield, AlertTriangle, Layers, Sparkles, Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/platform/auth/hooks/useRequireAdmin";
import { useReuseOverview } from "@/platform/personal-brain/hooks/use-intelligence-screen-data";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const HeroCard = ({ icon: Icon, label, value, sub, color }: { icon: typeof Brain; label: string; value: string; sub: string; color?: string }) => (
  <Card className="bg-card/80 border-border/50">
    <CardContent className="p-4 text-center">
      <Icon className={`h-5 w-5 mx-auto mb-1 ${color || "text-primary"}`} />
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground/60">{sub}</p>
    </CardContent>
  </Card>
);

const IntelligenceReuseOverview = () => {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const { stats, assetClasses, domainReuse, invalidationFeed, confidenceTrend, loading: dataLoading, isDemo } = useReuseOverview();

  if (authLoading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {isDemo && <PageTruthBanner truthState="demo" />}
      <SitaPageHeader
        icon={<RefreshCw className="h-6 w-6" />}
        title="Intelligence Reuse Overview"
        subtitle="How much reasoning the system reuses instead of recomputing — intelligence compounds over time"
      >
        <Badge variant="outline" className="gap-1"><Activity className="h-3 w-3" /> Live</Badge>
      </SitaPageHeader>

      {/* Hero Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <HeroCard icon={RefreshCw} label="Reuse Rate" value={`${(stats.reuseRate * 100).toFixed(0)}%`} sub="of reasoning reused" color="text-emerald-400" />
        <HeroCard icon={Layers} label="Direct Reuse" value={`${(stats.directReuseRate * 100).toFixed(0)}%`} sub="no adaptation needed" />
        <HeroCard icon={Sparkles} label="Adapted Reuse" value={`${(stats.adaptedReuseRate * 100).toFixed(0)}%`} sub="with minor adaptation" />
        <HeroCard icon={DollarSign} label="Cost Avoided" value={`$${(stats.costAvoided / 100).toFixed(0)}`} sub="compute savings" color="text-emerald-400" />
        <HeroCard icon={Library} label="Total Reuses" value={String(stats.totalReuses)} sub="this period" />
        <HeroCard icon={AlertTriangle} label="Invalidated" value={String(stats.invalidatedAssets)} sub="assets expired" color="text-amber-400" />
        <HeroCard icon={Shield} label="Avg Confidence" value={`${stats.avgConfidence}%`} sub={stats.confidenceTrend} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Asset Class Heatmap */}
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Library className="h-4 w-4 text-primary" /> Asset Class Heatmap</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {assetClasses.map(ac => (
              <div key={ac.type} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="outline" className="text-[9px] shrink-0">{ac.type}</Badge>
                  {ac.trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-400" />}
                  {ac.trend === "down" && <TrendingDown className="h-3 w-3 text-rose-400" />}
                  {ac.trend === "stable" && <Activity className="h-3 w-3 text-muted-foreground" />}
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="font-mono text-foreground">{ac.reuses} reuses</span>
                  <span className="font-mono text-emerald-400">${(ac.savings / 100).toFixed(0)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Domain Reuse Table */}
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Domain Reuse Breakdown</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Domain</TableHead>
                  <TableHead className="text-xs text-right">Reuse Rate</TableHead>
                  <TableHead className="text-xs text-right">Assets</TableHead>
                  <TableHead className="text-xs text-right">Savings</TableHead>
                  <TableHead className="text-xs text-right">Invalidated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domainReuse.map(d => (
                  <TableRow key={d.domain}>
                    <TableCell className="text-xs font-medium text-foreground">{d.domain}</TableCell>
                    <TableCell className="text-xs text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress value={d.reuseRate * 100} className="w-16 h-1.5" />
                        <span className={d.reuseRate >= 0.6 ? "text-emerald-400" : "text-foreground"}>{(d.reuseRate * 100).toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono">{d.assets}</TableCell>
                    <TableCell className="text-xs text-right font-mono text-emerald-400">${(d.savings / 100).toFixed(0)}</TableCell>
                    <TableCell className="text-xs text-right">{d.invalidated > 0 ? <span className="text-amber-400">{d.invalidated}</span> : "0"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Invalidation Feed */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Invalidation Feed</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {invalidationFeed.map((inv, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
                <span className="text-xs text-foreground truncate">{inv.asset}</span>
                <Badge variant="outline" className="text-[9px] shrink-0">{inv.domain}</Badge>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground shrink-0">
                <span>{inv.reason.replace(/_/g, " ")}</span>
                <span>·</span>
                <span>{inv.ago}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Confidence Trend */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Confidence Trend</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 h-24">
            {confidenceTrend.map(t => (
              <div key={t.period} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary/20 rounded-t" style={{ height: `${t.avg}%` }}>
                  <div className="w-full bg-primary rounded-t h-full" />
                </div>
                <span className="text-[10px] text-muted-foreground">{t.period}</span>
                <span className="text-xs font-mono text-foreground">{t.avg}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligenceReuseOverview;
