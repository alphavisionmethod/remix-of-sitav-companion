import { Heart, Settings, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

const mockProfile = {
  summaryDepth: "standard", explanationStyle: "mixed", confidenceThreshold: 78, evidenceFormat: "inline", interventionStyle: "proactive",
  avgApprovalTime: "28s", autoApproveThreshold: 90, alwaysReviewDomains: ["investment-finance","compliance-trust"], quickApproveTypes: ["self_heal","monitoring"],
  predictedAcceptance: 0.87, wasteReduction: 18,
};
const rejections = [
  { reason: "Too verbose explanation", frequency: 5, domains: ["admin-ops","revenue-business"] },
  { reason: "Missing evidence links", frequency: 3, domains: ["investment-finance"] },
  { reason: "Low confidence not flagged", frequency: 2, domains: ["engineering"] },
];
const overrides = [
  { original: "Detailed multi-page synthesis", corrected: "1-paragraph summary", frequency: 4, domains: ["admin-ops"] },
  { original: "Aggressive growth recommendation", corrected: "Conservative approach", frequency: 2, domains: ["investment-finance"] },
];
const domainPrefs = [
  { domain: "engineering", depth: "brief", confThreshold: 80, agents: ["Self-Healing","Monitor"] },
  { domain: "investment-finance", depth: "detailed", confThreshold: 85, agents: ["Finance Advisor"] },
  { domain: "admin-ops", depth: "brief", confThreshold: 70, agents: ["Strategy Synthesizer"] },
  { domain: "compliance-trust", depth: "detailed", confThreshold: 90, agents: ["Compliance Agent"] },
];

const OperatorTasteDashboard = () => {
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <SitaPageHeader icon={<Heart className="h-6 w-6" />} title="Operator Taste Memory" subtitle="Learned preferences — summary depth, explanation style, confidence thresholds, approval patterns" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[{l:"Summary Depth",v:mockProfile.summaryDepth},{l:"Explanation",v:mockProfile.explanationStyle},{l:"Conf. Threshold",v:`${mockProfile.confidenceThreshold}%`},{l:"Evidence Format",v:mockProfile.evidenceFormat},{l:"Predicted Accept.",v:`${(mockProfile.predictedAcceptance*100).toFixed(0)}%`,c:"text-emerald-400"},{l:"Waste Reduction",v:`${mockProfile.wasteReduction}%`,c:"text-emerald-400"}].map(m=>(
          <Card key={m.l} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center"><p className={`text-lg font-bold ${m.c||"text-foreground"}`}>{m.v}</p><p className="text-[10px] text-muted-foreground">{m.l}</p></CardContent></Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-card/80 border-border/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Approval Behavior</CardTitle></CardHeader><CardContent className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Avg approval time</span><span className="text-foreground">{mockProfile.avgApprovalTime}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Auto-approve above</span><span className="text-foreground">{mockProfile.autoApproveThreshold}% confidence</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Always review</span><span>{mockProfile.alwaysReviewDomains.map(d=><Badge key={d} variant="outline" className="text-[8px] ml-1">{d}</Badge>)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Quick approve</span><span>{mockProfile.quickApproveTypes.map(t=><Badge key={t} variant="secondary" className="text-[8px] ml-1">{t}</Badge>)}</span></div>
        </CardContent></Card>
        <Card className="bg-card/80 border-border/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Domain Preferences</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow>
          <TableHead className="text-xs">Domain</TableHead><TableHead className="text-xs">Depth</TableHead><TableHead className="text-xs text-right">Conf.</TableHead><TableHead className="text-xs">Preferred Agents</TableHead>
        </TableRow></TableHeader><TableBody>{domainPrefs.map(d=>(<TableRow key={d.domain}>
          <TableCell className="text-xs font-medium text-foreground">{d.domain}</TableCell>
          <TableCell><Badge variant="outline" className="text-[9px]">{d.depth}</Badge></TableCell>
          <TableCell className="text-xs text-right">{d.confThreshold}%</TableCell>
          <TableCell className="text-[10px] text-muted-foreground">{d.agents.join(", ")}</TableCell>
        </TableRow>))}</TableBody></Table></CardContent></Card>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-card/80 border-border/50"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><XCircle className="h-4 w-4 text-rose-400" /> Common Rejections</CardTitle></CardHeader><CardContent className="space-y-2">
          {rejections.map(r=>(<div key={r.reason} className="p-2 rounded-lg bg-secondary/20 flex items-center justify-between">
            <span className="text-xs text-foreground">{r.reason}</span>
            <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{r.frequency}x</span>{r.domains.map(d=><Badge key={d} variant="outline" className="text-[8px]">{d}</Badge>)}</div>
          </div>))}
        </CardContent></Card>
        <Card className="bg-card/80 border-border/50"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Settings className="h-4 w-4 text-amber-400" /> Common Overrides</CardTitle></CardHeader><CardContent className="space-y-2">
          {overrides.map(o=>(<div key={o.original} className="p-2 rounded-lg bg-secondary/20">
            <div className="flex items-center gap-2 text-[10px]"><span className="text-muted-foreground line-through">{o.original}</span><span className="text-foreground">→ {o.corrected}</span></div>
            <div className="flex items-center gap-2 mt-1"><span className="text-[10px] text-muted-foreground">{o.frequency}x</span>{o.domains.map(d=><Badge key={d} variant="outline" className="text-[8px]">{d}</Badge>)}</div>
          </div>))}
        </CardContent></Card>
      </div>
    </div>
  );
};
export default OperatorTasteDashboard;
