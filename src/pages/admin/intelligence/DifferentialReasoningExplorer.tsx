import {
  GitCompare, Activity, DollarSign, Shield, AlertTriangle,
  CheckCircle, ArrowRight, Layers, Gauge,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const DEMO_DIFFS: any[] = [];

const actionColors: Record<string, string> = {
  "reuse-as-is": "text-emerald-400 bg-emerald-500/10",
  "partial-update": "text-blue-400 bg-blue-500/10",
  "full-reanalysis": "text-amber-400 bg-amber-500/10",
  "escalate": "text-rose-400 bg-rose-500/10",
};

const DifferentialReasoningExplorer = () => {
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;

  const totalSaved = ([] as typeof DEMO_DIFFS).reduce((s, d) => s + (d.costFull - d.costActual), 0);
  const reuseCount = ([] as typeof DEMO_DIFFS).filter(d => d.action === "reuse-as-is").length;
  const partialCount = ([] as typeof DEMO_DIFFS).filter(d => d.action === "partial-update").length;
  const fullCount = ([] as typeof DEMO_DIFFS).filter(d => d.action === "full-reanalysis").length;
  const totalPreserved = ([] as typeof DEMO_DIFFS).reduce((s, d) => s + d.preserved, 0);
  const totalInvalidated = ([] as typeof DEMO_DIFFS).reduce((s, d) => s + d.invalidated, 0);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<SitaPageHeader
        icon={<GitCompare className="h-6 w-6" />}
        title="Differential Reasoning Explorer"
        subtitle="See how the system reasons over what changed — avoiding redundant thinking visibly"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Reused As-Is", value: String(reuseCount), color: "text-emerald-400" },
          { label: "Partial Updates", value: String(partialCount), color: "text-blue-400" },
          { label: "Full Reanalysis", value: String(fullCount), color: "text-amber-400" },
          { label: "Compute Saved", value: `$${(totalSaved / 100).toFixed(0)}`, color: "text-emerald-400" },
          { label: "Preserved Intel", value: String(totalPreserved), color: "text-foreground" },
          { label: "Invalidated Intel", value: String(totalInvalidated), color: "text-rose-400" },
        ].map(m => (
          <Card key={m.label} className="bg-card/80 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Differential Analysis Table */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><GitCompare className="h-4 w-4 text-primary" /> State Diff Viewer</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Domain</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs text-right">Materiality</TableHead>
                <TableHead className="text-xs text-right">Deltas</TableHead>
                <TableHead className="text-xs text-right">Confidence</TableHead>
                <TableHead className="text-xs text-right">Preserved</TableHead>
                <TableHead className="text-xs text-right">Invalidated</TableHead>
                <TableHead className="text-xs text-right">Full Cost</TableHead>
                <TableHead className="text-xs text-right">Actual Cost</TableHead>
                <TableHead className="text-xs">Mode</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {([] as typeof DEMO_DIFFS).map(d => (
                <TableRow key={d.id}>
                  <TableCell className="text-xs font-medium text-foreground">{d.domain}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{d.desc}</TableCell>
                  <TableCell className="text-xs text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Progress value={d.materiality} className="w-12 h-1.5" />
                      <span className={d.materiality > 60 ? "text-amber-400" : d.materiality > 30 ? "text-foreground" : "text-emerald-400"}>{d.materiality}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-right">{d.deltas}</TableCell>
                  <TableCell className="text-xs text-right">{d.confidence}%</TableCell>
                  <TableCell className="text-xs text-right font-mono text-emerald-400">{d.preserved}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{d.invalidated > 0 ? <span className="text-rose-400">{d.invalidated}</span> : "0"}</TableCell>
                  <TableCell className="text-xs text-right font-mono text-muted-foreground">${(d.costFull / 100).toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-right font-mono text-emerald-400">${(d.costActual / 100).toFixed(2)}</TableCell>
                  <TableCell><Badge className={`${actionColors[d.action]} text-[9px]`} variant="secondary">{d.action}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detected Changes Detail */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Detected Changes by Domain</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {([] as typeof DEMO_DIFFS).filter(d => d.changes.length > 0).map(d => (
            <div key={d.id} className="p-3 rounded-lg bg-secondary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{d.domain}</span>
                <Badge className={`${actionColors[d.action]} text-[9px]`} variant="secondary">{d.action}</Badge>
              </div>
              <div className="space-y-1">
                {d.changes.map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <ArrowRight className="h-2.5 w-2.5 shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-emerald-400">Saved ${((d.costFull - d.costActual) / 100).toFixed(2)}</span>
                <span className="text-muted-foreground">Materiality: {d.materiality}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Escalation Gates */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Reasoning Mode Decision Policy</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-3">
          {[
            { gate: "Reuse as-is", trigger: "Materiality < 10, confidence > 90%", tier: "utility", cost: "~$0.05", color: "border-emerald-500/30" },
            { gate: "Partial update", trigger: "Materiality 10-70, some deltas", tier: "standard", cost: "~$0.35", color: "border-blue-500/30" },
            { gate: "Full reanalysis", trigger: "Materiality > 70 or invalidation", tier: "premium", cost: "~$1.20", color: "border-amber-500/30" },
            { gate: "Escalate", trigger: "Low confidence + new deltas + high stakes", tier: "exceptional", cost: "~$2.00+", color: "border-rose-500/30" },
          ].map(g => (
            <div key={g.gate} className={`p-4 rounded-lg bg-secondary/20 border ${g.color} space-y-2 text-center`}>
              <p className="text-sm font-medium text-foreground">{g.gate}</p>
              <p className="text-[10px] text-muted-foreground">{g.trigger}</p>
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="text-[9px]">{g.tier}</Badge>
                <span className="text-[10px] text-muted-foreground">{g.cost}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DifferentialReasoningExplorer;
