import { Target, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

const mockScores = [
  { task: "Self-heal cache flush", domain: "engineering", value: 82, risk: 15, net: 72, quadrant: "high_value_low_risk", route: "fast_cheap_route", blast: "local", reversibility: "fully", urgency: "high" },
  { task: "Portfolio rebalance $200k", domain: "investment-finance", value: 88, risk: 72, net: 38, quadrant: "high_value_high_risk", route: "premium_with_insurance", blast: "system-wide", reversibility: "partially", urgency: "medium" },
  { task: "Lead follow-up sequence", domain: "revenue-business", value: 45, risk: 12, net: 37, quadrant: "low_value_low_risk", route: "standard_route", blast: "none", reversibility: "fully", urgency: "low" },
  { task: "Regulatory compliance audit", domain: "compliance-trust", value: 75, risk: 65, net: 30, quadrant: "high_value_high_risk", route: "premium_with_insurance", blast: "system-wide", reversibility: "irreversible", urgency: "critical" },
  { task: "Homepage A/B test", domain: "digital-presence", value: 35, risk: 8, net: 29, quadrant: "low_value_low_risk", route: "fast_cheap_route", blast: "local", reversibility: "fully", urgency: "low" },
  { task: "Experimental model test", domain: "engineering", value: 20, risk: 55, net: -19, quadrant: "low_value_high_risk", route: "defer_or_skip", blast: "domain", reversibility: "partially", urgency: "low" },
];

const quadColors: Record<string,string> = { high_value_low_risk: "text-emerald-400 bg-emerald-500/10", high_value_high_risk: "text-amber-400 bg-amber-500/10", low_value_low_risk: "text-blue-400 bg-blue-500/10", low_value_high_risk: "text-rose-400 bg-rose-500/10" };
const routeColors: Record<string,string> = { fast_cheap_route: "text-emerald-400", standard_route: "text-blue-400", premium_careful_route: "text-amber-400", premium_with_insurance: "text-amber-400", defer_or_skip: "text-rose-400", human_required: "text-rose-400" };

const ValueRiskDashboard = () => {
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <SitaPageHeader icon={<Target className="h-6 w-6" />} title="Value-Risk Matrix" subtitle="Score every major task on expected value vs risk to drive intelligent routing" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries({high_value_low_risk:0,high_value_high_risk:0,low_value_low_risk:0,low_value_high_risk:0}).map(([q])=>{
          const count = mockScores.filter(s=>s.quadrant===q).length;
          return <Card key={q} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center"><p className={`text-2xl font-bold ${quadColors[q]?.split(" ")[0]||"text-foreground"}`}>{count}</p><p className="text-[10px] text-muted-foreground">{q.replace(/_/g," ")}</p></CardContent></Card>;
        })}
      </div>
      <Card className="bg-card/80 border-border/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Value-Risk Scores</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow>
        <TableHead className="text-xs">Task</TableHead><TableHead className="text-xs">Domain</TableHead><TableHead className="text-xs text-right">Value</TableHead>
        <TableHead className="text-xs text-right">Risk</TableHead><TableHead className="text-xs text-right">Net</TableHead><TableHead className="text-xs">Quadrant</TableHead>
        <TableHead className="text-xs">Blast</TableHead><TableHead className="text-xs">Reversibility</TableHead><TableHead className="text-xs">Urgency</TableHead><TableHead className="text-xs">Route</TableHead>
      </TableRow></TableHeader><TableBody>{mockScores.sort((a,b)=>b.net-a.net).map(s=>(<TableRow key={s.task}>
        <TableCell className="text-xs font-medium text-foreground">{s.task}</TableCell>
        <TableCell className="text-xs text-muted-foreground">{s.domain}</TableCell>
        <TableCell className="text-xs text-right"><span className={s.value>=60?"text-emerald-400":"text-foreground"}>{s.value}</span></TableCell>
        <TableCell className="text-xs text-right"><span className={s.risk>=50?"text-rose-400":s.risk>=30?"text-amber-400":"text-emerald-400"}>{s.risk}</span></TableCell>
        <TableCell className="text-xs text-right font-mono font-bold"><span className={s.net>=30?"text-emerald-400":s.net>=0?"text-foreground":"text-rose-400"}>{s.net}</span></TableCell>
        <TableCell><Badge className={`${quadColors[s.quadrant]||""} text-[8px]`} variant="secondary">{s.quadrant.replace(/_/g," ")}</Badge></TableCell>
        <TableCell className="text-xs">{s.blast}</TableCell>
        <TableCell className="text-xs">{s.reversibility}</TableCell>
        <TableCell className="text-xs">{s.urgency}</TableCell>
        <TableCell><span className={`text-xs ${routeColors[s.route]||""}`}>{s.route.replace(/_/g," ")}</span></TableCell>
      </TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  );
};
export default ValueRiskDashboard;
