import { AlertTriangle, Activity, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

const mockAlerts = [
  { type: "stale_asset", asset: "Q1 revenue projection model", domain: "revenue-business", severity: "high" as const, metric: "age_vs_ttl", current: 15840, threshold: 10080, rec: "Refresh or invalidate", action: "downgrade" },
  { type: "rising_false_positive", asset: "Dark mode contrast pattern", domain: "digital-presence", severity: "medium" as const, metric: "false_positive_rate", current: 18, threshold: 15, rec: "Retrain pattern", action: "alert_operator" },
  { type: "degraded_recommendation", asset: "SEO keyword strategy", domain: "digital-presence", severity: "medium" as const, metric: "acceptance_rate", current: 62, threshold: 70, rec: "Review and regenerate", action: "alert_operator" },
  { type: "reuse_downgrade", asset: "Old pricing model", domain: "revenue-business", severity: "critical" as const, metric: "quality_score", current: 35, threshold: 60, rec: "Downgrade reuse", action: "invalidate" },
  { type: "stale_asset", asset: "Build pipeline RCA v1", domain: "engineering", severity: "medium" as const, metric: "age_vs_ttl", current: 20160, threshold: 10080, rec: "Archive", action: "downgrade" },
  { type: "outdated_template", asset: "Quarterly ops template", domain: "admin-ops", severity: "low" as const, metric: "days_without_reuse", current: 21, threshold: 14, rec: "Archive or remove", action: "none" },
];

const sevColors: Record<string,string> = { critical: "text-rose-400 bg-rose-500/10", high: "text-amber-400 bg-amber-500/10", medium: "text-foreground bg-secondary/30", low: "text-muted-foreground bg-secondary/20" };

const DecayMonitorDashboard = () => {
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <SitaPageHeader icon={<AlertTriangle className="h-6 w-6" />} title="Intelligence Decay Monitor" subtitle="Detect stale, degraded, and invalid intelligence before it causes harm" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{l:"Total Alerts",v:String(mockAlerts.length)},{l:"Critical",v:String(mockAlerts.filter(a=>a.severity==="critical").length),c:"text-rose-400"},{l:"High",v:String(mockAlerts.filter(a=>a.severity==="high").length),c:"text-amber-400"},{l:"Auto-Actions",v:String(mockAlerts.filter(a=>a.action!=="none"&&a.action!=="alert_operator").length)}].map(m=>(
          <Card key={m.l} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center"><p className={`text-2xl font-bold ${m.c||"text-foreground"}`}>{m.v}</p><p className="text-[10px] text-muted-foreground">{m.l}</p></CardContent></Card>
        ))}
      </div>
      <Card className="bg-card/80 border-border/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Decay Alerts</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow>
        <TableHead className="text-xs">Type</TableHead><TableHead className="text-xs">Asset</TableHead><TableHead className="text-xs">Domain</TableHead>
        <TableHead className="text-xs">Severity</TableHead><TableHead className="text-xs text-right">Current</TableHead><TableHead className="text-xs text-right">Threshold</TableHead>
        <TableHead className="text-xs">Recommendation</TableHead><TableHead className="text-xs">Action</TableHead>
      </TableRow></TableHeader><TableBody>{mockAlerts.map((a,i)=>(<TableRow key={i}>
        <TableCell><Badge variant="outline" className="text-[9px]">{a.type.replace(/_/g," ")}</Badge></TableCell>
        <TableCell className="text-xs font-medium text-foreground max-w-[180px] truncate">{a.asset}</TableCell>
        <TableCell className="text-xs text-muted-foreground">{a.domain}</TableCell>
        <TableCell><Badge className={`${sevColors[a.severity]} text-[9px]`} variant="secondary">{a.severity}</Badge></TableCell>
        <TableCell className="text-xs text-right font-mono">{a.current}</TableCell>
        <TableCell className="text-xs text-right font-mono">{a.threshold}</TableCell>
        <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">{a.rec}</TableCell>
        <TableCell><Badge variant="outline" className="text-[9px]">{a.action.replace(/_/g," ")}</Badge></TableCell>
      </TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  );
};
export default DecayMonitorDashboard;
