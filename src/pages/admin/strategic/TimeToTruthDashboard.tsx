import { Clock, Zap, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

const mockMetrics = [
  { taskClass: "self_heal", domain: "engineering", usable: 1200, confident: 2800, verified: 4500, approved: 5000, understanding: 6000, total: 6000, bottleneck: "none" },
  { taskClass: "lead_scoring", domain: "revenue-business", usable: 800, confident: 1500, verified: 3000, approved: 3500, understanding: 4200, total: 4200, bottleneck: "none" },
  { taskClass: "root_cause", domain: "engineering", usable: 3000, confident: 8000, verified: 12000, approved: 15000, understanding: 18000, total: 18000, bottleneck: "model_inference" },
  { taskClass: "compliance_check", domain: "compliance-trust", usable: 2000, confident: 5000, verified: 15000, approved: 45000, understanding: 48000, total: 48000, bottleneck: "approval_queue" },
  { taskClass: "investment_thesis", domain: "investment-finance", usable: 5000, confident: 12000, verified: 18000, approved: 25000, understanding: 30000, total: 30000, bottleneck: "evidence_gathering" },
  { taskClass: "release_readiness", domain: "launch-deployment", usable: 4000, confident: 10000, verified: 16000, approved: 35000, understanding: 38000, total: 38000, bottleneck: "verification" },
  { taskClass: "strategy_synthesis", domain: "admin-ops", usable: 6000, confident: 15000, verified: 20000, approved: 22000, understanding: 28000, total: 28000, bottleneck: "model_inference" },
];
const fmt = (ms: number) => ms < 1000 ? `${ms}ms` : ms < 60000 ? `${(ms/1000).toFixed(1)}s` : `${(ms/60000).toFixed(1)}m`;
const bottleColors: Record<string,string> = { none: "text-emerald-400", model_inference: "text-amber-400", evidence_gathering: "text-amber-400", verification: "text-blue-400", approval_queue: "text-rose-400", operator_review: "text-rose-400" };

const TimeToTruthDashboard = () => {
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;
  const avgTotal = Math.round(mockMetrics.reduce((s,m)=>s+m.total,0)/mockMetrics.length);
  const slowest = mockMetrics.sort((a,b)=>b.total-a.total)[0];
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <SitaPageHeader icon={<Clock className="h-6 w-6" />} title="Time-to-Truth Optimizer" subtitle="Track and optimize time from request to usable, confident, verified, approved answer" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{l:"Avg Total Time",v:fmt(avgTotal)},{l:"Fastest Task",v:fmt(mockMetrics.sort((a,b)=>a.total-b.total)[0].total),c:"text-emerald-400"},{l:"Slowest Task",v:fmt(slowest.total),c:"text-amber-400"},{l:"Top Bottleneck",v:slowest.bottleneck.replace(/_/g," "),c:"text-amber-400"}].map(m=>(
          <Card key={m.l} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center"><p className={`text-xl font-bold ${m.c||"text-foreground"}`}>{m.v}</p><p className="text-[10px] text-muted-foreground">{m.l}</p></CardContent></Card>
        ))}
      </div>
      <Card className="bg-card/80 border-border/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Time-to-Truth by Task</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow>
        <TableHead className="text-xs">Task</TableHead><TableHead className="text-xs">Domain</TableHead>
        <TableHead className="text-xs text-right">→ Usable</TableHead><TableHead className="text-xs text-right">→ Confident</TableHead>
        <TableHead className="text-xs text-right">→ Verified</TableHead><TableHead className="text-xs text-right">→ Approved</TableHead>
        <TableHead className="text-xs text-right">→ Understood</TableHead><TableHead className="text-xs text-right">Total</TableHead><TableHead className="text-xs">Bottleneck</TableHead>
      </TableRow></TableHeader><TableBody>{mockMetrics.sort((a,b)=>a.total-b.total).map(m=>(<TableRow key={m.taskClass+m.domain}>
        <TableCell className="text-xs font-medium text-foreground">{m.taskClass.replace(/_/g," ")}</TableCell>
        <TableCell className="text-xs text-muted-foreground">{m.domain}</TableCell>
        <TableCell className="text-xs text-right font-mono">{fmt(m.usable)}</TableCell>
        <TableCell className="text-xs text-right font-mono">{fmt(m.confident)}</TableCell>
        <TableCell className="text-xs text-right font-mono">{fmt(m.verified)}</TableCell>
        <TableCell className="text-xs text-right font-mono">{fmt(m.approved)}</TableCell>
        <TableCell className="text-xs text-right font-mono">{fmt(m.understanding)}</TableCell>
        <TableCell className="text-xs text-right font-mono font-bold">{fmt(m.total)}</TableCell>
        <TableCell><span className={`text-xs ${bottleColors[m.bottleneck]||"text-muted-foreground"}`}>{m.bottleneck.replace(/_/g," ")}</span></TableCell>
      </TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  );
};
export default TimeToTruthDashboard;
