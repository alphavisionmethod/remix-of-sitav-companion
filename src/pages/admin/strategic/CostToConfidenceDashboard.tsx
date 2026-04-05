import { TrendingUp, DollarSign, Target, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

const mockCurves = [
  { taskType: "root-cause-analysis", domain: "engineering", maxConf: 94, optimalCost: 45, actualCost: 48, diminishing: 88, recommendation: "well_optimized", marginal: 1.2 },
  { taskType: "investment-thesis", domain: "investment-finance", maxConf: 86, optimalCost: 120, actualCost: 180, diminishing: 82, recommendation: "overspending", marginal: 3.8 },
  { taskType: "lead-scoring", domain: "revenue-business", maxConf: 91, optimalCost: 25, actualCost: 28, diminishing: 85, recommendation: "well_optimized", marginal: 0.8 },
  { taskType: "strategy-synthesis", domain: "admin-ops", maxConf: 78, optimalCost: 150, actualCost: 200, diminishing: 72, recommendation: "overspending", marginal: 5.2 },
  { taskType: "self-heal", domain: "engineering", maxConf: 96, optimalCost: 20, actualCost: 22, diminishing: 92, recommendation: "well_optimized", marginal: 0.5 },
  { taskType: "conversion-analysis", domain: "digital-presence", maxConf: 72, optimalCost: 80, actualCost: 65, diminishing: 68, recommendation: "underspending", marginal: 2.1 },
  { taskType: "compliance-check", domain: "compliance-trust", maxConf: 92, optimalCost: 100, actualCost: 110, diminishing: 88, recommendation: "well_optimized", marginal: 1.5 },
  { taskType: "release-readiness", domain: "launch-deployment", maxConf: 85, optimalCost: 90, actualCost: 95, diminishing: 80, recommendation: "well_optimized", marginal: 1.8 },
];

const recColors: Record<string,string> = { well_optimized: "text-emerald-400 bg-emerald-500/10", overspending: "text-rose-400 bg-rose-500/10", underspending: "text-amber-400 bg-amber-500/10", diminishing_returns: "text-amber-400 bg-amber-500/10" };

const CostToConfidenceDashboard = () => {
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;
  const totalSavings = mockCurves.filter(c=>c.recommendation==="overspending").reduce((s,c)=>s+(c.actualCost-c.optimalCost),0);
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <SitaPageHeader icon={<TrendingUp className="h-6 w-6" />} title="Cost-to-Confidence Curves" subtitle="Where more compute helps, where it's wasted, and where to stop" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{l:"Paths Analyzed",v:String(mockCurves.length)},{l:"Well Optimized",v:String(mockCurves.filter(c=>c.recommendation==="well_optimized").length),c:"text-emerald-400"},{l:"Overspending",v:String(mockCurves.filter(c=>c.recommendation==="overspending").length),c:"text-rose-400"},{l:"Savings Available",v:`$${(totalSavings/100).toFixed(0)}`,c:"text-emerald-400"}].map(m=>(
          <Card key={m.l} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center"><p className={`text-2xl font-bold ${m.c||"text-foreground"}`}>{m.v}</p><p className="text-[10px] text-muted-foreground">{m.l}</p></CardContent></Card>
        ))}
      </div>
      <Card className="bg-card/80 border-border/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Confidence Curves by Task Type</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow>
        <TableHead className="text-xs">Task Type</TableHead><TableHead className="text-xs">Domain</TableHead><TableHead className="text-xs text-right">Max Conf.</TableHead>
        <TableHead className="text-xs text-right">Diminishing @</TableHead><TableHead className="text-xs text-right">Optimal ¢</TableHead><TableHead className="text-xs text-right">Actual ¢</TableHead>
        <TableHead className="text-xs text-right">Marginal ¢/pt</TableHead><TableHead className="text-xs">Status</TableHead>
      </TableRow></TableHeader><TableBody>{mockCurves.map(c=>(<TableRow key={c.taskType+c.domain}>
        <TableCell className="text-xs font-medium text-foreground">{c.taskType}</TableCell>
        <TableCell className="text-xs text-muted-foreground">{c.domain}</TableCell>
        <TableCell className="text-xs text-right">{c.maxConf}%</TableCell>
        <TableCell className="text-xs text-right">{c.diminishing}%</TableCell>
        <TableCell className="text-xs text-right font-mono">{c.optimalCost}¢</TableCell>
        <TableCell className="text-xs text-right font-mono">{c.actualCost}¢</TableCell>
        <TableCell className="text-xs text-right font-mono">{c.marginal}¢</TableCell>
        <TableCell><Badge className={`${recColors[c.recommendation]||""} text-[9px]`} variant="secondary">{c.recommendation.replace(/_/g," ")}</Badge></TableCell>
      </TableRow>))}</TableBody></Table></CardContent></Card>
      {mockCurves.filter(c=>c.recommendation==="overspending").length>0 && (
        <Card className="bg-card/80 border-rose-500/20"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-400" /> Overspending Alerts</CardTitle></CardHeader><CardContent className="space-y-2">
          {mockCurves.filter(c=>c.recommendation==="overspending").map(c=>(
            <div key={c.taskType} className="p-3 rounded-lg bg-rose-500/5 flex items-center justify-between">
              <div><p className="text-xs font-medium text-foreground">{c.taskType} — {c.domain}</p><p className="text-[10px] text-muted-foreground">Spending {c.actualCost}¢ but optimal is {c.optimalCost}¢ (saves {c.actualCost-c.optimalCost}¢/task)</p></div>
              <Badge variant="outline" className="text-[9px] text-rose-400">reduce</Badge>
            </div>
          ))}
        </CardContent></Card>
      )}
    </div>
  );
};
export default CostToConfidenceDashboard;
