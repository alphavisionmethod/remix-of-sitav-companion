import { PieChart, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

const cats = [
  { cat: "defensive", target: 25, actual: 32, spent: 4800, desc: "Monitoring, self-healing, compliance" },
  { cat: "growth", target: 35, actual: 28, spent: 4200, desc: "Revenue, lead scoring, optimization" },
  { cat: "strategic_premium", target: 20, actual: 24, spent: 3600, desc: "Deep analysis, synthesis, strategy" },
  { cat: "experimentation", target: 10, actual: 8, spent: 1200, desc: "New capabilities, benchmark tests" },
  { cat: "emergency_reserve", target: 10, actual: 8, spent: 1200, desc: "Incident response, critical escalation" },
];
const drifts = cats.filter(c=>Math.abs(c.actual-c.target)>5);
const rebalances = [
  { from: "defensive", to: "growth", amount: 900, reason: "Defensive 7% over target; Growth 7% under target" },
  { from: "strategic_premium", to: "experimentation", amount: 450, reason: "Premium 4% over; Experimentation 2% under" },
];

const PortfolioAllocationDashboard = () => {
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;
  const total = cats.reduce((s,c)=>s+c.spent,0);
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <SitaPageHeader icon={<PieChart className="h-6 w-6" />} title="AI Portfolio Allocation" subtitle="Treat AI spend like an investment portfolio — defensive, growth, strategic, experimental" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {cats.map(c=>(<Card key={c.cat} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center space-y-1">
          <p className="text-lg font-bold text-foreground">{c.actual}%</p>
          <p className="text-[10px] text-muted-foreground">{c.cat.replace(/_/g," ")}</p>
          <Progress value={c.actual} className="h-1.5" />
          <p className="text-[9px] text-muted-foreground/60">target: {c.target}% · ${(c.spent/100).toFixed(0)}</p>
        </CardContent></Card>))}
      </div>
      {drifts.length>0 && <Card className="bg-card/80 border-amber-500/20"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Drift Alerts</CardTitle></CardHeader><CardContent className="space-y-2">
        {drifts.map(d=>(<div key={d.cat} className="p-2 rounded-lg bg-amber-500/5 flex items-center justify-between">
          <span className="text-xs text-foreground">{d.cat.replace(/_/g," ")}: {d.actual}% actual vs {d.target}% target</span>
          <Badge variant="outline" className="text-[9px] text-amber-400">{d.actual>d.target?"over":"under"} by {Math.abs(d.actual-d.target)}%</Badge>
        </div>))}
      </CardContent></Card>}
      <Card className="bg-card/80 border-border/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Rebalance Recommendations</CardTitle></CardHeader><CardContent className="space-y-2">
        {rebalances.map((r,i)=>(<div key={i} className="p-3 rounded-lg bg-secondary/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs"><span className="font-medium text-foreground">{r.from}</span><ArrowRight className="h-3 w-3 text-primary" /><span className="font-medium text-foreground">{r.to}</span></div>
          <div className="text-right"><p className="text-xs font-mono text-emerald-400">${(r.amount/100).toFixed(0)}</p><p className="text-[10px] text-muted-foreground">{r.reason}</p></div>
        </div>))}
      </CardContent></Card>
    </div>
  );
};
export default PortfolioAllocationDashboard;
