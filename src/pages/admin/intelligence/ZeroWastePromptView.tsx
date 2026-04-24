import {
  Sparkles, AlertTriangle, Activity, TrendingDown,
  Target, Layers, BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const PROFILES: any[] = [];
const offenders = PROFILES
  .filter(p => p.redundancy > 20)
  .sort((a, b) => b.redundancy - a.redundancy);


const ZeroWastePromptView = () => {
  
  const avgCostReduction = Math.round(([] as never[]).reduce((s, p) => s + p.costReduction, 0) / Math.max(([] as never[]).length, 1));
  const packetDrivenPct = Math.round((([] as never[]).filter(p => p.packetDriven).length / Math.max(([] as never[]).length, 1)) * 100);
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<SitaPageHeader
        icon={<Sparkles className="h-6 w-6" />}
        title="Zero-Waste Prompt Architecture"
        subtitle="Inspect prompt efficiency, redundancy, and packet-driven architecture quality"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Prompt Profiles", value: String(([] as never[]).length) },
          { label: "Avg Cost Reduction", value: `${avgCostReduction}%`, color: "text-emerald-400" },
          { label: "Packet-Driven", value: `${packetDrivenPct}%` },
          { label: "Offenders", value: String(offenders.length), color: offenders.length > 0 ? "text-amber-400" : "text-emerald-400" },
        ].map(m => (
          <Card key={m.label} className="bg-card/80 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold ${m.color || "text-foreground"}`}>{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile Table */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Prompt Profile Table</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Domain</TableHead>
                <TableHead className="text-xs">Task Type</TableHead>
                <TableHead className="text-xs">Version</TableHead>
                <TableHead className="text-xs">Context Class</TableHead>
                <TableHead className="text-xs text-center">Packet-Driven</TableHead>
                <TableHead className="text-xs text-right">Redundancy</TableHead>
                <TableHead className="text-xs text-right">Cost Reduction</TableHead>
                <TableHead className="text-xs text-right">Quality Impact</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {([] as never[]).map((p, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs font-medium text-foreground">{p.domain}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.taskType}</TableCell>
                  <TableCell className="text-xs font-mono">{p.version}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[9px]">Class {p.maxContext}</Badge></TableCell>
                  <TableCell className="text-center">{p.packetDriven ? <span className="text-emerald-400 text-xs">✓</span> : <span className="text-muted-foreground text-xs">✗</span>}</TableCell>
                  <TableCell className="text-xs text-right">
                    <span className={p.redundancy > 20 ? "text-amber-400" : p.redundancy > 10 ? "text-foreground" : "text-emerald-400"}>{p.redundancy}%</span>
                  </TableCell>
                  <TableCell className="text-xs text-right font-mono text-emerald-400">{p.costReduction}%</TableCell>
                  <TableCell className="text-xs text-right">
                    <span className={p.qualityImpact > 0 ? "text-emerald-400" : p.qualityImpact < 0 ? "text-rose-400" : "text-foreground"}>{p.qualityImpact > 0 ? "+" : ""}{p.qualityImpact}%</span>
                  </TableCell>
                  <TableCell><Badge variant={p.active ? "secondary" : "destructive"} className="text-[9px]">{p.active ? "active" : "disabled"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Offender List */}
      {offenders.length > 0 && (
        <Card className="bg-card/80 border-amber-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Oversized Prompt Offenders</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {offenders.map((o, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5">
                <div>
                  <p className="text-xs font-medium text-foreground">{o.domain} / {o.taskType}</p>
                  <p className="text-[10px] text-muted-foreground">Redundancy: {o.redundancy}% · Not packet-driven · Quality impact: {o.qualityImpact}%</p>
                </div>
                <Badge variant="outline" className="text-[9px] text-amber-400">optimize</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Redundancy Heatmap */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Redundancy by Domain</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(
            ([] as never[]).reduce<Record<string, number[]>>((acc, p) => {
              if (!acc[p.domain]) acc[p.domain] = [];
              acc[p.domain].push(p.redundancy);
              return acc;
            }, {})
          ).map(([domain, values]) => {
            const avg = Math.round(values.reduce((s, v) => s + v, 0) / values.length);
            return (
              <div key={domain} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-[160px] truncate">{domain}</span>
                <Progress value={avg} className="flex-1 h-2" />
                <span className={`text-xs font-mono w-[40px] text-right ${avg > 20 ? "text-amber-400" : "text-emerald-400"}`}>{avg}%</span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default ZeroWastePromptView;
