import {
  Zap, AlertTriangle, Clock, DollarSign, CheckCircle,
  XCircle, Activity, TrendingUp, Shield, Brain,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/platform/auth/hooks/useRequireAdmin";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
const triggerColors: Record<string, string> = {
  low_confidence: "text-amber-400 bg-amber-500/10",
  high_stakes: "text-rose-400 bg-rose-500/10",
  ambiguity: "text-blue-400 bg-blue-500/10",
  novelty: "text-purple-400 bg-purple-500/10",
  explicit_user_request: "text-foreground bg-secondary/30",
  invalidated_prior_reasoning: "text-amber-400 bg-amber-500/10",
  enterprise_policy: "text-foreground bg-secondary/30",
};

const outcomeColors: Record<string, string> = {
  accepted: "text-emerald-400",
  overridden: "text-amber-400",
  low_value: "text-rose-400",
};

const EscalationControlCenter = () => {
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;

  const totalCost = ([] as any[]).reduce((s, e) => s + e.cost, 0);
  const justified = ([] as any[]).filter(e => e.justified).length;
  const unnecessary = ([] as any[]).filter(e => !e.justified).length;
  const accepted = ([] as any[]).filter(e => e.outcome === "accepted").length;

  const byTrigger = ([] as any[]).reduce<Record<string, { count: number; cost: number }>>((acc, e) => {
    if (!acc[e.trigger]) acc[e.trigger] = { count: 0, cost: 0 };
    acc[e.trigger].count++;
    acc[e.trigger].cost += e.cost;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<SitaPageHeader
        icon={<Zap className="h-6 w-6" />}
        title="Escalation Control Center"
        subtitle="Inspect and govern deep reasoning escalation — every tier jump justified"
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Escalations", value: String(([] as any[]).length), color: "text-foreground" },
          { label: "Total Cost", value: `$${(totalCost / 100).toFixed(0)}`, color: "text-foreground" },
          { label: "Justified", value: String(justified), color: "text-emerald-400" },
          { label: "Unnecessary", value: String(unnecessary), color: "text-amber-400" },
          { label: "Accepted Outcomes", value: String(accepted), color: "text-emerald-400" },
        ].map(m => (
          <Card key={m.label} className="bg-card/80 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trigger Type Breakdown */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Escalation by Trigger Type</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(byTrigger).sort(([, a], [, b]) => b.count - a.count).map(([trigger, data]) => (
            <div key={trigger} className="p-3 rounded-lg bg-secondary/20 text-center space-y-1">
              <Badge className={`${triggerColors[trigger] || ""} text-[9px]`} variant="secondary">{trigger.replace(/_/g, " ")}</Badge>
              <p className="text-lg font-bold text-foreground">{data.count}</p>
              <p className="text-[10px] text-muted-foreground">${(data.cost / 100).toFixed(0)} cost</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Timeline Table */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Escalation Timeline</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Domain</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs">Trigger</TableHead>
                <TableHead className="text-xs">From → To</TableHead>
                <TableHead className="text-xs text-right">Cost</TableHead>
                <TableHead className="text-xs text-center">Justified</TableHead>
                <TableHead className="text-xs">Outcome</TableHead>
                <TableHead className="text-xs">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {([] as any[]).map(e => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs font-medium text-foreground">{e.domain}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{e.desc}</TableCell>
                  <TableCell><Badge className={`${triggerColors[e.trigger]} text-[9px]`} variant="secondary">{e.trigger.replace(/_/g, " ")}</Badge></TableCell>
                  <TableCell className="text-xs font-mono">{e.from} → {e.to}</TableCell>
                  <TableCell className="text-xs text-right font-mono">${(e.cost / 100).toFixed(2)}</TableCell>
                  <TableCell className="text-center">{e.justified ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mx-auto" /> : <XCircle className="h-3.5 w-3.5 text-amber-400 mx-auto" />}</TableCell>
                  <TableCell><span className={`text-xs ${outcomeColors[e.outcome]}`}>{e.outcome}</span></TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{e.ago}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Unnecessary Escalation Detail */}
      {unnecessary > 0 && (
        <Card className="bg-card/80 border-amber-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Unnecessary Escalations — Optimization Opportunities</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {([] as any[]).filter(e => !e.justified).map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5">
                <div>
                  <p className="text-xs font-medium text-foreground">{e.desc}</p>
                  <p className="text-[10px] text-muted-foreground">{e.domain} · {e.trigger.replace(/_/g, " ")} · {e.from} → {e.to}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-amber-400">${(e.cost / 100).toFixed(2)} wasted</p>
                  <p className="text-[10px] text-muted-foreground">{e.outcome}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EscalationControlCenter;
