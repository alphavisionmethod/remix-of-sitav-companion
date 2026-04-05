import { FlaskConical, CheckCircle, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

const mockExps = [
  { dim: "cheap_vs_expensive", domain: "engineering", task: "root-cause", status: "completed", winner: "B", labelA: "utility tier", labelB: "premium tier", costA: 25, costB: 120, qualA: 72, qualB: 94, acceptA: 0.78, acceptB: 0.96, samples: 42, conf: 92, savings: 0, insight: "Premium tier 25% better quality/cost ratio for root cause" },
  { dim: "reused_vs_fresh", domain: "revenue-business", task: "lead-scoring", status: "completed", winner: "A", labelA: "reused intelligence", labelB: "fresh reasoning", costA: 8, costB: 28, qualA: 90, qualB: 91, acceptA: 0.94, acceptB: 0.92, samples: 68, conf: 96, savings: 1360, insight: "Reused intelligence nearly identical quality at 70% lower cost" },
  { dim: "compressed_vs_full", domain: "admin-ops", task: "synthesis", status: "completed", winner: "A", labelA: "compressed packet", labelB: "full context", costA: 45, costB: 150, qualA: 82, qualB: 85, acceptA: 0.88, acceptB: 0.90, samples: 24, conf: 78, savings: 2520, insight: "Compressed packets achieve 96% of full context quality" },
  { dim: "async_vs_sync", domain: "investment-finance", task: "thesis", status: "running", winner: "pending", labelA: "sync", labelB: "async premium", costA: 0, costB: 0, qualA: 0, qualB: 0, acceptA: 0, acceptB: 0, samples: 8, conf: 0, savings: 0, insight: "" },
  { dim: "premium_vs_standard", domain: "compliance-trust", task: "audit", status: "completed", winner: "B", labelA: "standard model", labelB: "premium model", costA: 40, costB: 110, qualA: 78, qualB: 96, acceptA: 0.82, acceptB: 0.99, samples: 18, conf: 88, savings: 0, insight: "Premium model critical for compliance — standard unacceptable" },
];
const totalSavings = mockExps.filter(e=>e.savings>0).reduce((s,e)=>s+e.savings,0);

const BenchmarkLabDashboard = () => {
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <SitaPageHeader icon={<FlaskConical className="h-6 w-6" />} title="Intelligence Benchmark Lab" subtitle="Continuously compare reasoning strategies — cheap vs expensive, reused vs fresh, compressed vs full" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{l:"Experiments",v:String(mockExps.length)},{l:"Completed",v:String(mockExps.filter(e=>e.status==="completed").length),c:"text-emerald-400"},{l:"Running",v:String(mockExps.filter(e=>e.status==="running").length)},{l:"Savings Found",v:`$${(totalSavings/100).toFixed(0)}`,c:"text-emerald-400"}].map(m=>(
          <Card key={m.l} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center"><p className={`text-2xl font-bold ${m.c||"text-foreground"}`}>{m.v}</p><p className="text-[10px] text-muted-foreground">{m.l}</p></CardContent></Card>
        ))}
      </div>
      <Card className="bg-card/80 border-border/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Experiments</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow>
        <TableHead className="text-xs">Dimension</TableHead><TableHead className="text-xs">Domain/Task</TableHead><TableHead className="text-xs">A</TableHead><TableHead className="text-xs">B</TableHead>
        <TableHead className="text-xs text-right">Cost A</TableHead><TableHead className="text-xs text-right">Cost B</TableHead><TableHead className="text-xs text-right">Qual A</TableHead><TableHead className="text-xs text-right">Qual B</TableHead>
        <TableHead className="text-xs text-right">Samples</TableHead><TableHead className="text-xs text-center">Winner</TableHead><TableHead className="text-xs">Status</TableHead>
      </TableRow></TableHeader><TableBody>{mockExps.map(e=>(<TableRow key={e.dim+e.domain}>
        <TableCell><Badge variant="outline" className="text-[9px]">{e.dim.replace(/_/g," ")}</Badge></TableCell>
        <TableCell className="text-xs text-muted-foreground">{e.domain}/{e.task}</TableCell>
        <TableCell className="text-[10px] text-muted-foreground">{e.labelA}</TableCell>
        <TableCell className="text-[10px] text-muted-foreground">{e.labelB}</TableCell>
        <TableCell className="text-xs text-right font-mono">{e.costA||"—"}¢</TableCell>
        <TableCell className="text-xs text-right font-mono">{e.costB||"—"}¢</TableCell>
        <TableCell className="text-xs text-right">{e.qualA||"—"}</TableCell>
        <TableCell className="text-xs text-right">{e.qualB||"—"}</TableCell>
        <TableCell className="text-xs text-right">{e.samples}</TableCell>
        <TableCell className="text-xs text-center font-bold">{e.winner==="pending"?"⏳":e.winner==="A"?<span className="text-emerald-400">A</span>:<span className="text-blue-400">B</span>}</TableCell>
        <TableCell><Badge variant={e.status==="completed"?"secondary":"outline"} className="text-[9px]">{e.status}</Badge></TableCell>
      </TableRow>))}</TableBody></Table></CardContent></Card>
      <Card className="bg-card/80 border-border/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Top Insights</CardTitle></CardHeader><CardContent className="space-y-2">
        {mockExps.filter(e=>e.insight).map(e=>(<div key={e.dim} className="p-2 rounded-lg bg-secondary/20 flex items-center justify-between">
          <span className="text-xs text-foreground">{e.insight}</span>
          {e.savings>0 && <Badge variant="secondary" className="text-[9px] text-emerald-400">${(e.savings/100).toFixed(0)} saved</Badge>}
        </div>))}
      </CardContent></Card>
    </div>
  );
};
export default BenchmarkLabDashboard;
