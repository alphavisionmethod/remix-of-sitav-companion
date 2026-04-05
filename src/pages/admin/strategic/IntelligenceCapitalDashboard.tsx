import { Brain, DollarSign, TrendingUp, Library, Activity, RefreshCw, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

const mock = {
  totalAssets: 142, activeAssets: 118, staleAssets: 14, weightedValue: 8420,
  reuseRate: 0.64, costAvoided: 12400, valueCreated: 48600, freshness: 78,
  decayRate: 9.8, roi: 6.2, trend: "growing" as const,
};
const domains = [
  { domain: "engineering", assets: 38, active: 32, reuseRate: 0.72, costAvoided: 4200, freshness: 82, richness: 88 },
  { domain: "revenue-business", assets: 24, active: 20, reuseRate: 0.68, costAvoided: 2800, freshness: 76, richness: 78 },
  { domain: "investment-finance", assets: 22, active: 19, reuseRate: 0.58, costAvoided: 2100, freshness: 80, richness: 75 },
  { domain: "digital-presence", assets: 18, active: 14, reuseRate: 0.52, costAvoided: 1400, freshness: 70, richness: 65 },
  { domain: "admin-ops", assets: 16, active: 13, reuseRate: 0.48, costAvoided: 960, freshness: 74, richness: 60 },
  { domain: "compliance-trust", assets: 12, active: 10, reuseRate: 0.45, costAvoided: 540, freshness: 85, richness: 55 },
  { domain: "launch-deployment", assets: 12, active: 10, reuseRate: 0.55, costAvoided: 400, freshness: 72, richness: 52 },
];

const H = ({ icon: I, label, value, sub, color }: any) => (
  <Card className="bg-card/80 border-border/50"><CardContent className="p-3 text-center">
    <I className={`h-4 w-4 mx-auto mb-1 ${color || "text-primary"}`} />
    <p className={`text-xl font-bold ${color || "text-foreground"}`}>{value}</p>
    <p className="text-[10px] text-muted-foreground">{label}</p>
    <p className="text-[10px] text-muted-foreground/60">{sub}</p>
  </CardContent></Card>
);

const IntelligenceCapitalDashboard = () => {
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <SitaPageHeader icon={<Brain className="h-6 w-6" />} title="Intelligence Capital Index" subtitle="SITA's accumulated intelligence treated as a strategic asset base" >
        <Badge variant="secondary" className="gap-1 text-emerald-400"><TrendingUp className="h-3 w-3" /> {mock.trend} · {mock.roi}x ROI</Badge>
      </SitaPageHeader>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <H icon={Library} label="Total Assets" value={mock.totalAssets} sub="intelligence units" />
        <H icon={Activity} label="Active" value={mock.activeAssets} sub={`${mock.staleAssets} stale`} color="text-emerald-400" />
        <H icon={Layers} label="Weighted Value" value={mock.weightedValue} sub="composite score" />
        <H icon={RefreshCw} label="Reuse Rate" value={`${(mock.reuseRate*100).toFixed(0)}%`} sub="of reasoning reused" color="text-emerald-400" />
        <H icon={DollarSign} label="Cost Avoided" value={`$${(mock.costAvoided/100).toFixed(0)}`} sub="compute savings" color="text-emerald-400" />
        <H icon={DollarSign} label="Value Created" value={`$${(mock.valueCreated/100).toFixed(0)}`} sub="from intelligence" color="text-emerald-400" />
        <H icon={Activity} label="Freshness" value={`${mock.freshness}%`} sub="avg across assets" />
        <H icon={TrendingUp} label="Capital ROI" value={`${mock.roi}x`} sub="value / creation cost" color="text-emerald-400" />
      </div>
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Domain Intelligence Richness</CardTitle></CardHeader>
        <CardContent><Table><TableHeader><TableRow>
          <TableHead className="text-xs">Domain</TableHead><TableHead className="text-xs text-right">Assets</TableHead>
          <TableHead className="text-xs text-right">Active</TableHead><TableHead className="text-xs text-right">Reuse</TableHead>
          <TableHead className="text-xs text-right">Savings</TableHead><TableHead className="text-xs text-right">Freshness</TableHead>
          <TableHead className="text-xs text-right">Richness</TableHead>
        </TableRow></TableHeader><TableBody>
          {domains.map(d => (<TableRow key={d.domain}>
            <TableCell className="text-xs font-medium text-foreground">{d.domain}</TableCell>
            <TableCell className="text-xs text-right font-mono">{d.assets}</TableCell>
            <TableCell className="text-xs text-right text-emerald-400">{d.active}</TableCell>
            <TableCell className="text-xs text-right">{(d.reuseRate*100).toFixed(0)}%</TableCell>
            <TableCell className="text-xs text-right font-mono text-emerald-400">${(d.costAvoided/100).toFixed(0)}</TableCell>
            <TableCell className="text-xs text-right">{d.freshness}%</TableCell>
            <TableCell className="text-xs text-right"><div className="flex items-center justify-end gap-2"><Progress value={d.richness} className="w-12 h-1.5" /><span>{d.richness}</span></div></TableCell>
          </TableRow>))}
        </TableBody></Table></CardContent>
      </Card>
    </div>
  );
};
export default IntelligenceCapitalDashboard;
