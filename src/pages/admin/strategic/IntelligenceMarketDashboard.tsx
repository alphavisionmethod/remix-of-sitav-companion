import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

const mockAllocations = [
  { domain: "engineering", spend: 4200, roi: 12.5, quality: 88, reuse: 0.72, acceptance: 0.95, override: 0.05, budget: 28, rec: "increase_allocation", adj: 5 },
  { domain: "revenue-business", spend: 2800, roi: 8.2, quality: 82, reuse: 0.65, acceptance: 0.88, override: 0.12, budget: 19, rec: "maintain_allocation", adj: 0 },
  { domain: "investment-finance", spend: 2400, roi: 6.8, quality: 80, reuse: 0.58, acceptance: 0.85, override: 0.15, budget: 16, rec: "maintain_allocation", adj: 0 },
  { domain: "admin-ops", spend: 2000, roi: 4.2, quality: 75, reuse: 0.48, acceptance: 0.78, override: 0.22, budget: 13, rec: "investigate_waste", adj: -8 },
  { domain: "digital-presence", spend: 1800, roi: 3.5, quality: 72, reuse: 0.42, acceptance: 0.80, override: 0.20, budget: 12, rec: "rebalance_to_reuse", adj: -5 },
  { domain: "compliance-trust", spend: 1000, roi: 15.0, quality: 92, reuse: 0.45, acceptance: 0.98, override: 0.02, budget: 7, rec: "increase_allocation", adj: 8 },
  { domain: "launch-deployment", spend: 800, roi: 5.5, quality: 78, reuse: 0.55, acceptance: 0.90, override: 0.10, budget: 5, rec: "maintain_allocation", adj: 0 },
];

const recColors: Record<string,string> = { increase_allocation: "text-emerald-400 bg-emerald-500/10", maintain_allocation: "text-blue-400 bg-blue-500/10", decrease_allocation: "text-rose-400 bg-rose-500/10", rebalance_to_reuse: "text-amber-400 bg-amber-500/10", investigate_waste: "text-rose-400 bg-rose-500/10" };

const IntelligenceMarketDashboard = () => {
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;
  const totalSpend = mockAllocations.reduce((s,a)=>s+a.spend,0);
  const highestROI = mockAllocations.sort((a,b)=>b.roi-a.roi)[0];
  const reallocation = mockAllocations.filter(a=>a.adj<0).reduce((s,a)=>s+Math.abs(a.adj)*totalSpend/100,0);
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <SitaPageHeader icon={<BarChart3 className="h-6 w-6" />} title="Intelligence Market / Internal Exchange" subtitle="Capital allocation for AI intelligence — where compute yields the most value" >
        <Badge variant="secondary" className="gap-1 text-emerald-400"><TrendingUp className="h-3 w-3" /> Best ROI: {highestROI.domain}</Badge>
      </SitaPageHeader>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{l:"Total AI Spend",v:`$${(totalSpend/100).toFixed(0)}`},{l:"Highest ROI",v:`${highestROI.roi}x`,c:"text-emerald-400"},{l:"Reallocation Opp.",v:`$${(reallocation/100).toFixed(0)}`,c:"text-emerald-400"},{l:"Waste Alerts",v:String(mockAllocations.filter(a=>a.rec==="investigate_waste").length),c:"text-amber-400"}].map(m=>(
          <Card key={m.l} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center"><p className={`text-2xl font-bold ${m.c||"text-foreground"}`}>{m.v}</p><p className="text-[10px] text-muted-foreground">{m.l}</p></CardContent></Card>
        ))}
      </div>
      <Card className="bg-card/80 border-border/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Domain Allocation Table</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow>
        <TableHead className="text-xs">Domain</TableHead><TableHead className="text-xs text-right">Spend</TableHead><TableHead className="text-xs text-right">ROI</TableHead>
        <TableHead className="text-xs text-right">Quality</TableHead><TableHead className="text-xs text-right">Reuse</TableHead><TableHead className="text-xs text-right">Accept.</TableHead>
        <TableHead className="text-xs text-right">Override</TableHead><TableHead className="text-xs text-right">Budget %</TableHead><TableHead className="text-xs">Recommendation</TableHead><TableHead className="text-xs text-right">Adjust</TableHead>
      </TableRow></TableHeader><TableBody>{mockAllocations.sort((a,b)=>b.roi-a.roi).map(a=>(<TableRow key={a.domain}>
        <TableCell className="text-xs font-medium text-foreground">{a.domain}</TableCell>
        <TableCell className="text-xs text-right font-mono">${(a.spend/100).toFixed(0)}</TableCell>
        <TableCell className="text-xs text-right"><span className={a.roi>=8?"text-emerald-400":a.roi>=5?"text-foreground":"text-amber-400"}>{a.roi}x</span></TableCell>
        <TableCell className="text-xs text-right">{a.quality}</TableCell>
        <TableCell className="text-xs text-right">{(a.reuse*100).toFixed(0)}%</TableCell>
        <TableCell className="text-xs text-right">{(a.acceptance*100).toFixed(0)}%</TableCell>
        <TableCell className="text-xs text-right"><span className={a.override>0.15?"text-amber-400":"text-foreground"}>{(a.override*100).toFixed(0)}%</span></TableCell>
        <TableCell className="text-xs text-right"><div className="flex items-center justify-end gap-2"><Progress value={a.budget} className="w-10 h-1.5" /><span>{a.budget}%</span></div></TableCell>
        <TableCell><Badge className={`${recColors[a.rec]||""} text-[9px]`} variant="secondary">{a.rec.replace(/_/g," ")}</Badge></TableCell>
        <TableCell className="text-xs text-right font-mono">{a.adj>0?<span className="text-emerald-400">+{a.adj}%</span>:a.adj<0?<span className="text-rose-400">{a.adj}%</span>:"—"}</TableCell>
      </TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  );
};
export default IntelligenceMarketDashboard;
