import {
  Target, DollarSign, TrendingUp, Award, AlertTriangle,
  CheckCircle, XCircle, BarChart3, Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { useOutcomeEconomics } from "@/hooks/use-intelligence-screen-data";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const recColors: Record<string, string> = {
  expand: "text-emerald-400 bg-emerald-500/10",
  maintain: "text-blue-400 bg-blue-500/10",
  optimize: "text-amber-400 bg-amber-500/10",
  downgrade: "text-rose-400 bg-rose-500/10",
  eliminate: "text-rose-400 bg-rose-500/20",
};

const OutcomeEconomicsBoard = () => {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const { outcomes, reasoningPaths, loading: dataLoading, isDemo } = useOutcomeEconomics();

  if (authLoading || !isAdmin) return null;

  const totalCost = outcomes.reduce((s, o) => s + o.costCents, 0);
  const totalValue = outcomes.reduce((s, o) => s + o.valueCents, 0);
  const totalOutcomes = outcomes.reduce((s, o) => s + o.count, 0);
  const overallROI = totalCost > 0 ? (totalValue / totalCost).toFixed(1) : "0";
  const totalAccepted = outcomes.reduce((s, o) => s + o.accepted, 0);
  const totalRejected = outcomes.reduce((s, o) => s + o.rejected, 0);

  const highValue = outcomes.filter(o => o.roi >= 10);
  const lowValue = outcomes.filter(o => o.roi < 5);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      
      <SitaPageHeader
        icon={<Target className="h-6 w-6" />}
        title="Outcome Economics Board"
        subtitle="Track value created per AI dollar — AI economics as a strategic asset"
      >
        <Badge variant="secondary" className="gap-1 text-emerald-400"><Award className="h-3 w-3" /> ROI: {overallROI}x</Badge>
      </SitaPageHeader>

      {/* Value Hero */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Total Outcomes", value: String(totalOutcomes), color: "text-foreground" },
          { label: "AI Cost", value: `$${(totalCost / 100).toFixed(0)}`, color: "text-foreground" },
          { label: "Value Created", value: `$${(totalValue / 100).toFixed(0)}`, color: "text-emerald-400" },
          { label: "Overall ROI", value: `${overallROI}x`, color: "text-emerald-400" },
          { label: "Accepted", value: String(totalAccepted), color: "text-emerald-400" },
          { label: "Rejected", value: String(totalRejected), color: "text-rose-400" },
        ].map(m => (
          <Card key={m.label} className="bg-card/80 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cost Per Outcome Table */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Cost Per Useful Outcome</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Outcome Type</TableHead>
                <TableHead className="text-xs">Domain</TableHead>
                <TableHead className="text-xs text-right">Count</TableHead>
                <TableHead className="text-xs text-right">AI Cost</TableHead>
                <TableHead className="text-xs text-right">Value</TableHead>
                <TableHead className="text-xs text-right">ROI</TableHead>
                <TableHead className="text-xs text-right">Cost/Outcome</TableHead>
                <TableHead className="text-xs text-right">Accepted</TableHead>
                <TableHead className="text-xs text-right">Rejected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...outcomes].sort((a, b) => b.roi - a.roi).map(o => (
                <TableRow key={o.type}>
                  <TableCell className="text-xs font-medium text-foreground">{o.type.replace(/_/g, " ")}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{o.domain}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{o.count}</TableCell>
                  <TableCell className="text-xs text-right font-mono">${(o.costCents / 100).toFixed(0)}</TableCell>
                  <TableCell className="text-xs text-right font-mono text-emerald-400">${(o.valueCents / 100).toFixed(0)}</TableCell>
                  <TableCell className="text-xs text-right font-mono"><span className={o.roi >= 10 ? "text-emerald-400" : o.roi >= 5 ? "text-foreground" : "text-amber-400"}>{o.roi}x</span></TableCell>
                  <TableCell className="text-xs text-right font-mono">${(o.costCents / o.count / 100).toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-right text-emerald-400">{o.accepted}</TableCell>
                  <TableCell className="text-xs text-right">{o.rejected > 0 ? <span className="text-rose-400">{o.rejected}</span> : "0"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* High-Value Categories */}
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-400" /> High-Value Categories (ROI ≥ 10x)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {highValue.map(o => (
              <div key={o.type} className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <span className="text-xs text-foreground">{o.type.replace(/_/g, " ")}</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-emerald-400 font-mono font-bold">{o.roi}x ROI</span>
                  <span className="text-muted-foreground">${(o.valueCents / 100).toFixed(0)} value</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Waste Opportunities */}
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Optimization Opportunities (ROI &lt; 5x)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {lowValue.map(o => (
              <div key={o.type} className="flex items-center justify-between p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <span className="text-xs text-foreground">{o.type.replace(/_/g, " ")}</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-amber-400 font-mono">{o.roi}x ROI</span>
                  <span className="text-muted-foreground">${(o.costCents / 100).toFixed(0)} cost</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Reasoning Path Economics */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Reasoning Path Economics</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Path</TableHead>
                <TableHead className="text-xs text-right">Cost</TableHead>
                <TableHead className="text-xs text-right">Value</TableHead>
                <TableHead className="text-xs text-right">Payback</TableHead>
                <TableHead className="text-xs text-right">Acceptance</TableHead>
                <TableHead className="text-xs">Recommendation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reasoningPaths.map(p => (
                <TableRow key={p.path}>
                  <TableCell className="text-xs font-medium text-foreground font-mono">{p.path}</TableCell>
                  <TableCell className="text-xs text-right font-mono">${(p.cost / 100).toFixed(0)}</TableCell>
                  <TableCell className="text-xs text-right font-mono text-emerald-400">${(p.value / 100).toFixed(0)}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{(p.value / p.cost).toFixed(1)}x</TableCell>
                  <TableCell className="text-xs text-right">{(p.acceptance * 100).toFixed(0)}%</TableCell>
                  <TableCell><Badge className={`${recColors[p.recommendation]} text-[9px]`} variant="secondary">{p.recommendation}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OutcomeEconomicsBoard;
