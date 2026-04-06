import { useState } from "react";
import {
  Brain, RefreshCw, Library, DollarSign, TrendingUp, TrendingDown,
  Activity, Shield, AlertTriangle, Layers, Sparkles, Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const mockReuseData = {
  reuseRate: 0.64,
  adaptedReuseRate: 0.22,
  directReuseRate: 0.42,
  costAvoided: 8420,
  totalReuses: 187,
  invalidatedAssets: 6,
  avgConfidence: 87,
  confidenceTrend: "improving" as const,
};

const mockAssetClasses = [
  { type: "root-cause-analysis", reuses: 42, savings: 2100, trend: "up" },
  { type: "issue-fingerprint", reuses: 38, savings: 1900, trend: "up" },
  { type: "automation-playbook", reuses: 31, savings: 1550, trend: "stable" },
  { type: "strategic-summary", reuses: 24, savings: 960, trend: "up" },
  { type: "investment-thesis", reuses: 18, savings: 720, trend: "down" },
  { type: "website-diagnostic", reuses: 15, savings: 600, trend: "stable" },
  { type: "design-recommendation", reuses: 12, savings: 360, trend: "up" },
  { type: "release-readiness-packet", reuses: 7, savings: 230, trend: "stable" },
];

const mockDomainReuse = [
  { domain: "engineering", reuseRate: 0.72, savings: 3200, assets: 28, invalidated: 2 },
  { domain: "revenue-business", reuseRate: 0.68, savings: 1800, assets: 15, invalidated: 1 },
  { domain: "investment-finance", reuseRate: 0.58, savings: 1400, assets: 12, invalidated: 0 },
  { domain: "digital-presence", reuseRate: 0.52, savings: 980, assets: 10, invalidated: 2 },
  { domain: "admin-ops", reuseRate: 0.48, savings: 640, assets: 8, invalidated: 1 },
  { domain: "compliance-trust", reuseRate: 0.45, savings: 400, assets: 5, invalidated: 0 },
];

const mockInvalidationFeed = [
  { asset: "Q1 revenue projection model", reason: "pricing_change", domain: "revenue-business", ago: "2hr" },
  { asset: "Build pipeline root-cause", reason: "dependency_update", domain: "engineering", ago: "4hr" },
  { asset: "Homepage conversion diagnosis", reason: "layout_change", domain: "digital-presence", ago: "6hr" },
  { asset: "API timeout pattern", reason: "architecture_change", domain: "engineering", ago: "1d" },
  { asset: "SEO keyword strategy", reason: "content_update", domain: "digital-presence", ago: "1d" },
  { asset: "Quarterly ops synthesis", reason: "policy_change", domain: "admin-ops", ago: "2d" },
];

const mockConfidenceTrend = [
  { period: "Week 1", avg: 78 },
  { period: "Week 2", avg: 81 },
  { period: "Week 3", avg: 84 },
  { period: "Week 4", avg: 87 },
];

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
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <SitaPageHeader
        icon={<RefreshCw className="h-6 w-6" />}
        title="Intelligence Reuse Overview"
        subtitle="How much reasoning the system reuses instead of recomputing — intelligence compounds over time"
      >
        <Badge variant="outline" className="gap-1"><Activity className="h-3 w-3" /> Live</Badge>
      </SitaPageHeader>

      {/* Hero Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <HeroCard icon={RefreshCw} label="Reuse Rate" value={`${(mockReuseData.reuseRate * 100).toFixed(0)}%`} sub="of reasoning reused" color="text-emerald-400" />
        <HeroCard icon={Layers} label="Direct Reuse" value={`${(mockReuseData.directReuseRate * 100).toFixed(0)}%`} sub="no adaptation needed" />
        <HeroCard icon={Sparkles} label="Adapted Reuse" value={`${(mockReuseData.adaptedReuseRate * 100).toFixed(0)}%`} sub="with minor adaptation" />
        <HeroCard icon={DollarSign} label="Cost Avoided" value={`$${(mockReuseData.costAvoided / 100).toFixed(0)}`} sub="compute savings" color="text-emerald-400" />
        <HeroCard icon={Library} label="Total Reuses" value={String(mockReuseData.totalReuses)} sub="this period" />
        <HeroCard icon={AlertTriangle} label="Invalidated" value={String(mockReuseData.invalidatedAssets)} sub="assets expired" color="text-amber-400" />
        <HeroCard icon={Shield} label="Avg Confidence" value={`${mockReuseData.avgConfidence}%`} sub={mockReuseData.confidenceTrend} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Asset Class Heatmap */}
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Library className="h-4 w-4 text-primary" /> Asset Class Heatmap</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {mockAssetClasses.map(ac => (
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
                {mockDomainReuse.map(d => (
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
          {mockInvalidationFeed.map((inv, i) => (
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
            {mockConfidenceTrend.map(t => (
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
