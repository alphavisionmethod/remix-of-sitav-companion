import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { DEFAULT_QUALITY_FLOORS } from "@/lib/strategic-intelligence/quality-floor-engine";

const mockChecks = [
  { taskClass: "financial_recommendation", domain: "investment-finance", passes: true, score: 88, violations: 0, enforcement: "pass" },
  { taskClass: "self_heal", domain: "engineering", passes: true, score: 82, violations: 0, enforcement: "pass" },
  { taskClass: "compliance_check", domain: "compliance-trust", passes: false, score: 68, violations: 2, enforcement: "block" },
  { taskClass: "strategic_recommendation", domain: "admin-ops", passes: true, score: 76, violations: 1, enforcement: "warn" },
  { taskClass: "design_proposal", domain: "digital-presence", passes: false, score: 55, violations: 3, enforcement: "reroute" },
  { taskClass: "lead_scoring", domain: "revenue-business", passes: true, score: 79, violations: 0, enforcement: "pass" },
  { taskClass: "root_cause_analysis", domain: "engineering", passes: true, score: 85, violations: 0, enforcement: "pass" },
  { taskClass: "release_readiness", domain: "launch-deployment", passes: false, score: 62, violations: 2, enforcement: "block" },
];

const enfColors: Record<string,string> = { pass: "text-emerald-400 bg-emerald-500/10", block: "text-rose-400 bg-rose-500/10", escalate: "text-amber-400 bg-amber-500/10", reroute: "text-blue-400 bg-blue-500/10", warn: "text-amber-400 bg-amber-500/10" };

const QualityFloorDashboard = () => {
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;
  const passing = mockChecks.filter(c=>c.passes).length;
  const failing = mockChecks.filter(c=>!c.passes).length;
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <SitaPageHeader icon={<Shield className="h-6 w-6" />} title="Quality Floor Engine" subtitle="Hard quality thresholds that prevent optimization from lowering standards" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{l:"Floor Policies",v:String(DEFAULT_QUALITY_FLOORS.length)},{l:"Passing",v:String(passing),c:"text-emerald-400"},{l:"Failing",v:String(failing),c:"text-rose-400"},{l:"Blocked",v:String(mockChecks.filter(c=>c.enforcement==="block").length),c:"text-rose-400"}].map(m=>(
          <Card key={m.l} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center"><p className={`text-2xl font-bold ${m.c||"text-foreground"}`}>{m.v}</p><p className="text-[10px] text-muted-foreground">{m.l}</p></CardContent></Card>
        ))}
      </div>
      <Card className="bg-card/80 border-border/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Quality Floor Status</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow>
        <TableHead className="text-xs">Task Class</TableHead><TableHead className="text-xs">Domain</TableHead><TableHead className="text-xs text-center">Status</TableHead>
        <TableHead className="text-xs text-right">Score</TableHead><TableHead className="text-xs text-right">Violations</TableHead><TableHead className="text-xs">Enforcement</TableHead>
      </TableRow></TableHeader><TableBody>{mockChecks.map(c=>(<TableRow key={c.taskClass+c.domain}>
        <TableCell className="text-xs font-medium text-foreground">{c.taskClass.replace(/_/g," ")}</TableCell>
        <TableCell className="text-xs text-muted-foreground">{c.domain}</TableCell>
        <TableCell className="text-center">{c.passes ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mx-auto" /> : <XCircle className="h-3.5 w-3.5 text-rose-400 mx-auto" />}</TableCell>
        <TableCell className="text-xs text-right"><span className={c.score>=80?"text-emerald-400":c.score>=60?"text-foreground":"text-rose-400"}>{c.score}</span></TableCell>
        <TableCell className="text-xs text-right">{c.violations>0?<span className="text-rose-400">{c.violations}</span>:"0"}</TableCell>
        <TableCell><Badge className={`${enfColors[c.enforcement]||""} text-[9px]`} variant="secondary">{c.enforcement}</Badge></TableCell>
      </TableRow>))}</TableBody></Table></CardContent></Card>
      <Card className="bg-card/80 border-border/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Floor Definitions</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow>
        <TableHead className="text-xs">Task Class</TableHead><TableHead className="text-xs">Domain</TableHead><TableHead className="text-xs text-right">Min Conf.</TableHead>
        <TableHead className="text-xs text-right">Min Evidence</TableHead><TableHead className="text-xs">Verification</TableHead><TableHead className="text-xs text-center">Proof</TableHead>
        <TableHead className="text-xs text-right">Clarity</TableHead><TableHead className="text-xs text-right">Freshness</TableHead><TableHead className="text-xs">Enforcement</TableHead>
      </TableRow></TableHeader><TableBody>{DEFAULT_QUALITY_FLOORS.map(f=>(<TableRow key={f.taskClass+f.domain}>
        <TableCell className="text-xs font-medium text-foreground">{f.taskClass.replace(/_/g," ")}</TableCell>
        <TableCell className="text-xs text-muted-foreground">{f.domain}</TableCell>
        <TableCell className="text-xs text-right">{f.minConfidence}%</TableCell>
        <TableCell className="text-xs text-right">{f.minEvidenceCompleteness}%</TableCell>
        <TableCell><Badge variant="outline" className="text-[9px]">{f.minVerificationStandard}</Badge></TableCell>
        <TableCell className="text-center">{f.minTrustProofRequired ? <CheckCircle className="h-3 w-3 text-emerald-400 mx-auto" /> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
        <TableCell className="text-xs text-right">{f.minOperatorClarity}%</TableCell>
        <TableCell className="text-xs text-right">{f.minFreshness}%</TableCell>
        <TableCell><Badge className={`${enfColors[f.enforcementMode]||""} text-[9px]`} variant="secondary">{f.enforcementMode}</Badge></TableCell>
      </TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  );
};
export default QualityFloorDashboard;
