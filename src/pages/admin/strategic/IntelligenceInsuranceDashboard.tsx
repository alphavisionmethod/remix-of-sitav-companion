import { Shield, Zap, CheckCircle, DollarSign, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

const mockEvals = [
  { domain: "investment-finance", taskClass: "portfolio_rebalance", stakes: "critical", uncertainty: 45, insured: true, actions: ["verifier_pass","consistency_check","human_review"], overhead: 85, confGain: 15 },
  { domain: "compliance-trust", taskClass: "regulatory_check", stakes: "high", uncertainty: 35, insured: true, actions: ["verifier_pass","extra_evidence","human_review"], overhead: 120, confGain: 15 },
  { domain: "engineering", taskClass: "self_heal", stakes: "medium", uncertainty: 30, insured: true, actions: ["playbook_cross_check","verifier_pass"], overhead: 28, confGain: 10 },
  { domain: "revenue-business", taskClass: "pricing_change", stakes: "high", uncertainty: 40, insured: true, actions: ["consistency_check","safer_model_route"], overhead: 42, confGain: 10 },
  { domain: "admin-ops", taskClass: "ops_alert", stakes: "low", uncertainty: 15, insured: false, actions: [], overhead: 0, confGain: 0 },
  { domain: "digital-presence", taskClass: "seo_recommendation", stakes: "low", uncertainty: 20, insured: false, actions: [], overhead: 0, confGain: 0 },
  { domain: "engineering", taskClass: "root_cause", stakes: "high", uncertainty: 32, insured: true, actions: ["verifier_pass","playbook_cross_check"], overhead: 35, confGain: 10 },
  { domain: "launch-deployment", taskClass: "release_approval", stakes: "high", uncertainty: 28, insured: true, actions: ["consistency_check","extra_evidence"], overhead: 40, confGain: 10 },
];

const IntelligenceInsuranceDashboard = () => {
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;
  const insured = mockEvals.filter(e=>e.insured);
  const totalOverhead = insured.reduce((s,e)=>s+e.overhead,0);
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <SitaPageHeader icon={<Shield className="h-6 w-6" />} title="Intelligence Insurance Layer" subtitle="Risk hedging against hallucination and false confidence — insurance for AI reasoning" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{l:"Evaluations",v:String(mockEvals.length)},{l:"Insured",v:String(insured.length),c:"text-emerald-400"},{l:"Uninsured",v:String(mockEvals.length-insured.length)},{l:"Insurance Cost",v:`$${(totalOverhead/100).toFixed(0)}`,c:"text-foreground"}].map(m=>(
          <Card key={m.l} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center"><p className={`text-2xl font-bold ${m.c||"text-foreground"}`}>{m.v}</p><p className="text-[10px] text-muted-foreground">{m.l}</p></CardContent></Card>
        ))}
      </div>
      <Card className="bg-card/80 border-border/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Insurance Evaluations</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow>
        <TableHead className="text-xs">Domain</TableHead><TableHead className="text-xs">Task</TableHead><TableHead className="text-xs">Stakes</TableHead>
        <TableHead className="text-xs text-right">Uncertainty</TableHead><TableHead className="text-xs text-center">Insured</TableHead>
        <TableHead className="text-xs">Actions</TableHead><TableHead className="text-xs text-right">Overhead</TableHead><TableHead className="text-xs text-right">Conf. Gain</TableHead>
      </TableRow></TableHeader><TableBody>{mockEvals.map((e,i)=>(<TableRow key={i}>
        <TableCell className="text-xs font-medium text-foreground">{e.domain}</TableCell>
        <TableCell className="text-xs text-muted-foreground">{e.taskClass.replace(/_/g," ")}</TableCell>
        <TableCell><Badge variant={e.stakes==="critical"?"destructive":e.stakes==="high"?"default":"secondary"} className="text-[9px]">{e.stakes}</Badge></TableCell>
        <TableCell className="text-xs text-right">{e.uncertainty}%</TableCell>
        <TableCell className="text-center">{e.insured ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mx-auto" /> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
        <TableCell><div className="flex flex-wrap gap-1">{e.actions.map(a=><Badge key={a} variant="outline" className="text-[8px]">{a.replace(/_/g," ")}</Badge>)}</div></TableCell>
        <TableCell className="text-xs text-right font-mono">{e.overhead>0?`${e.overhead}¢`:"—"}</TableCell>
        <TableCell className="text-xs text-right">{e.confGain>0?<span className="text-emerald-400">+{e.confGain}%</span>:"—"}</TableCell>
      </TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  );
};
export default IntelligenceInsuranceDashboard;
