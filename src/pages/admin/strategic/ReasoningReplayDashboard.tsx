import { Eye, ArrowRight, Layers, DollarSign, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

const mockReplays = [
  { id:"rr-1", taskClass:"root_cause", domain:"engineering", considered:["fingerprint→self-heal","root-cause→fix-plan","deep-analysis"], skipped:["multi-agent debate"], escalations:[{from:"utility",to:"premium",trigger:"low_confidence"}], reusedAssets:2, finalModel:"premium", finalMode:"full", confidence:92, cost:145, latency:8200, insuranceActions:["verifier_pass"], qfPasses: true, qfViolations:0 },
  { id:"rr-2", taskClass:"portfolio_rebalance", domain:"investment-finance", considered:["thesis-reuse","fresh-analysis","deep-premium"], skipped:["cheap-route"], escalations:[{from:"standard",to:"premium",trigger:"high_stakes"}], reusedAssets:1, finalModel:"premium", finalMode:"deep", confidence:88, cost:280, latency:15000, insuranceActions:["verifier_pass","consistency_check","human_review"], qfPasses: true, qfViolations:0 },
  { id:"rr-3", taskClass:"lead_scoring", domain:"revenue-business", considered:["cached-score","fresh-score"], skipped:["deep-analysis","multi-agent"], escalations:[], reusedAssets:3, finalModel:"utility", finalMode:"reuse", confidence:94, cost:12, latency:800, insuranceActions:[], qfPasses: true, qfViolations:0 },
  { id:"rr-4", taskClass:"compliance_check", domain:"compliance-trust", considered:["policy-check","full-audit","deep-regulatory"], skipped:[], escalations:[{from:"standard",to:"exceptional",trigger:"regulatory_risk"}], reusedAssets:0, finalModel:"exceptional", finalMode:"deep", confidence:96, cost:420, latency:25000, insuranceActions:["verifier_pass","extra_evidence","human_review"], qfPasses: true, qfViolations:0 },
];

const ReasoningReplayDashboard = () => {
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <SitaPageHeader icon={<Eye className="h-6 w-6" />} title="Reasoning Insurance Replay" subtitle="Inspect meta-reasoning for high-value tasks — what was considered, skipped, escalated, and why" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{l:"Replays Stored",v:String(mockReplays.length)},{l:"Avg Confidence",v:`${Math.round(mockReplays.reduce((s,r)=>s+r.confidence,0)/mockReplays.length)}%`,c:"text-emerald-400"},{l:"Avg Cost",v:`${Math.round(mockReplays.reduce((s,r)=>s+r.cost,0)/mockReplays.length)}¢`},{l:"Assets Reused",v:String(mockReplays.reduce((s,r)=>s+r.reusedAssets,0)),c:"text-emerald-400"}].map(m=>(
          <Card key={m.l} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center"><p className={`text-xl font-bold ${m.c||"text-foreground"}`}>{m.v}</p><p className="text-[10px] text-muted-foreground">{m.l}</p></CardContent></Card>
        ))}
      </div>
      {mockReplays.map(r=>(
        <Card key={r.id} className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">{r.taskClass.replace(/_/g," ")} — {r.domain} <Badge variant="secondary" className="text-[9px]">{r.finalModel} / {r.finalMode}</Badge> <span className="text-emerald-400 text-xs ml-auto">{r.confidence}% conf · {r.cost}¢ · {r.latency}ms</span></CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
            <div className="space-y-1"><p className="text-[10px] font-medium text-muted-foreground">Considered Paths</p>{r.considered.map(p=><div key={p} className="flex items-center gap-1 text-[10px] text-foreground"><ArrowRight className="h-2.5 w-2.5" />{p}</div>)}</div>
            <div className="space-y-1"><p className="text-[10px] font-medium text-muted-foreground">Skipped</p>{r.skipped.length>0?r.skipped.map(s=><div key={s} className="text-[10px] text-muted-foreground">{s}</div>):<span className="text-[10px] text-muted-foreground/60">none</span>}</div>
            <div className="space-y-1"><p className="text-[10px] font-medium text-muted-foreground">Escalations</p>{r.escalations.length>0?r.escalations.map((e,i)=><div key={i} className="text-[10px] text-amber-400"><Zap className="h-2.5 w-2.5 inline mr-1" />{e.from}→{e.to} ({e.trigger})</div>):<span className="text-[10px] text-emerald-400">none needed</span>}</div>
            <div className="space-y-1"><p className="text-[10px] font-medium text-muted-foreground">Insurance</p>{r.insuranceActions.length>0?r.insuranceActions.map(a=><Badge key={a} variant="outline" className="text-[8px] mr-1">{a.replace(/_/g," ")}</Badge>):<span className="text-[10px] text-muted-foreground/60">none</span>}<p className="text-[10px] text-muted-foreground mt-1">Reused: {r.reusedAssets} assets · QF: {r.qfPasses?"✓":"✗"}</p></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
export default ReasoningReplayDashboard;
