// ═══════════════════════════════════════════════════════════════
// ITC06 — Drift & Traceability Radar (deeper rules + drift_state)
// ═══════════════════════════════════════════════════════════════

import { useSpecRegistry, useDriftDetection, STATUS_TIERS, type SpecRegistryEntry } from "@/hooks/use-implementation-truth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Radar, AlertTriangle, GitCommit, Link as LinkIcon, CheckCircle2 } from "lucide-react";

function DriftStateBadge({ state }: { state: string }) {
  if (state === "aligned") return <Badge variant="outline" className="text-[7px] text-green-500 border-green-500/30">Aligned</Badge>;
  if (state === "drifted") return <Badge variant="destructive" className="text-[7px]">Drifted</Badge>;
  if (state === "partial") return <Badge variant="secondary" className="text-[7px] text-yellow-500">Partial</Badge>;
  return <Badge variant="outline" className="text-[7px]">Unknown</Badge>;
}

function PromptTraceCard({ spec }: { spec: SpecRegistryEntry }) {
  const tier = STATUS_TIERS.find(t => t.value === spec.implementation_status);
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
      <GitCommit className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-medium">{spec.canonical_name}</span>
          <Badge variant="outline" className={`text-[7px] h-4 ${tier?.color}`}>{tier?.label}</Badge>
          <DriftStateBadge state={spec.drift_state || "unknown"} />
        </div>
        <div className="text-[9px] text-muted-foreground mt-0.5">
          Origin: {spec.prompt_origin || "Unknown"} · {spec.required_routes.length} routes · {spec.required_components.length} components · {(spec.required_shells || []).length} shells
        </div>
        {spec.dependencies.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <LinkIcon className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[8px] text-muted-foreground">Deps: {spec.dependencies.join(", ")}</span>
          </div>
        )}
      </div>
      <div className="text-[10px] font-medium shrink-0">{spec.overall_readiness}%</div>
    </div>
  );
}

export default function ITC06DriftRadar() {
  const { data: specs, isLoading } = useSpecRegistry();
  const { drifts, driftCount } = useDriftDetection(specs);
  const highDrifts = drifts.filter(d => d.severity === "high");
  const medDrifts = drifts.filter(d => d.severity === "medium");
  const lowDrifts = drifts.filter(d => d.severity === "low");

  const byOrigin = new Map<string, SpecRegistryEntry[]>();
  (specs || []).forEach(s => {
    const phase = (s.prompt_origin || "Unknown").split("—")[0]?.trim() || "Unknown";
    const list = byOrigin.get(phase) || [];
    list.push(s);
    byOrigin.set(phase, list);
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Radar className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Drift & Traceability Radar</h1>
          <Badge variant="outline" className="text-[8px]">ITC-06</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Detect spec-to-implementation drift and trace prompt-to-build lineage</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center"><Radar className="h-5 w-5 mx-auto text-primary mb-1" /><div className="text-2xl font-bold">{driftCount}</div><div className="text-[10px] text-muted-foreground">Total Drifts</div></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-destructive">{highDrifts.length}</div><div className="text-[10px] text-muted-foreground">High Severity</div></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-yellow-500">{medDrifts.length}</div><div className="text-[10px] text-muted-foreground">Medium</div></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-muted-foreground">{lowDrifts.length}</div><div className="text-[10px] text-muted-foreground">Low</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Active Drift Alerts ({driftCount})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead className="text-[10px]">Severity</TableHead><TableHead className="text-[10px]">System</TableHead><TableHead className="text-[10px]">Drift Issue</TableHead></TableRow></TableHeader>
            <TableBody>
              {drifts.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center py-8"><div className="flex items-center justify-center gap-2 text-green-500 text-[11px]"><CheckCircle2 className="h-4 w-4" /> No drift detected</div></TableCell></TableRow>
              ) : drifts.map((d, i) => (
                <TableRow key={i}>
                  <TableCell><Badge variant={d.severity === "high" ? "destructive" : d.severity === "medium" ? "secondary" : "outline"} className="text-[8px]">{d.severity}</Badge></TableCell>
                  <TableCell className="text-[11px] font-medium">{d.canonical_name}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{d.issue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><GitCommit className="h-4 w-4" />Prompt-to-Build Traceability</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-[11px] text-muted-foreground text-center py-8">Loading…</div>
          ) : (
            <div className="space-y-4">
              {Array.from(byOrigin.entries()).map(([phase, phaseSpecs]) => (
                <div key={phase}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[9px]">{phase}</Badge>
                    <span className="text-[9px] text-muted-foreground">{phaseSpecs.length} specs</span>
                  </div>
                  <div className="pl-4 border-l-2 border-border">
                    {phaseSpecs.map(s => <PromptTraceCard key={s.spec_id} spec={s} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
