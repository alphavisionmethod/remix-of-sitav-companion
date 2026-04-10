// ═══════════════════════════════════════════════════════════════
// ITC11 — Prompt Traceability Explorer
// ═══════════════════════════════════════════════════════════════

import { useSpecRegistry, STATUS_TIERS, type SpecRegistryEntry } from "@/hooks/use-implementation-truth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { GitCommit, FileText, Link as LinkIcon, AlertTriangle, CheckCircle2, BookOpen } from "lucide-react";

function PromptTraceCard({ spec }: { spec: SpecRegistryEntry }) {
  const tier = STATUS_TIERS.find(t => t.value === spec.implementation_status);
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
      <GitCommit className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-medium text-foreground">{spec.canonical_name}</span>
          <Badge variant="outline" className={`text-[7px] h-4 ${tier?.color}`}>{tier?.label}</Badge>
          <Badge variant="outline" className="text-[7px]">{spec.overall_readiness}%</Badge>
        </div>
        <div className="text-[9px] text-muted-foreground mt-0.5">
          {spec.required_routes.length} routes · {spec.required_components.length} components · {spec.required_contracts.length} contracts · {(spec.required_proofs || []).length} proofs
        </div>
        {spec.dependencies.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <LinkIcon className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[8px] text-muted-foreground">Deps: {spec.dependencies.join(", ")}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface PhaseGroup {
  phase: string;
  specs: SpecRegistryEntry[];
  avgReadiness: number;
  fullyImplemented: number;
  partial: number;
  notStarted: number;
  coverageScore: number;
}

function buildPhaseGroups(specs: SpecRegistryEntry[]): PhaseGroup[] {
  const map = new Map<string, SpecRegistryEntry[]>();
  specs.forEach(s => {
    const phase = (s.prompt_origin || "Unknown").split("—")[0]?.trim() || "Unknown";
    const list = map.get(phase) || [];
    list.push(s);
    map.set(phase, list);
  });

  return Array.from(map.entries()).map(([phase, phaseSpecs]) => {
    const avgReadiness = phaseSpecs.length > 0 ? Math.round(phaseSpecs.reduce((sum, s) => sum + (s.overall_readiness || 0), 0) / phaseSpecs.length) : 0;
    const fullyImplemented = phaseSpecs.filter(s => (s.overall_readiness || 0) >= 80).length;
    const notStarted = phaseSpecs.filter(s => s.implementation_status === "not_started").length;
    const partial = phaseSpecs.length - fullyImplemented - notStarted;
    const coverageScore = phaseSpecs.length > 0 ? Math.round((fullyImplemented / phaseSpecs.length) * 100) : 0;
    return { phase, specs: phaseSpecs, avgReadiness, fullyImplemented, partial, notStarted, coverageScore };
  }).sort((a, b) => b.specs.length - a.specs.length);
}

function CoverageHeatmap({ groups }: { groups: PhaseGroup[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {groups.map(g => {
        const color = g.coverageScore >= 80 ? "text-green-500" : g.coverageScore >= 40 ? "text-yellow-500" : "text-destructive";
        return (
          <div key={g.phase} className="border border-border rounded-lg p-3">
            <div className="text-[10px] font-medium text-foreground mb-1 truncate">{g.phase}</div>
            <div className={`text-xl font-bold ${color}`}>{g.coverageScore}%</div>
            <Progress value={g.coverageScore} className="h-1.5 mt-1" />
            <div className="text-[9px] text-muted-foreground mt-1">{g.specs.length} specs · {g.fullyImplemented} complete</div>
          </div>
        );
      })}
    </div>
  );
}

function GapByPromptPanel({ groups }: { groups: PhaseGroup[] }) {
  const gapGroups = groups.filter(g => g.notStarted > 0 || g.partial > 0);
  if (gapGroups.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 text-green-500 text-[11px] py-8">
        <CheckCircle2 className="h-4 w-4" /> All prompt phases fully covered
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-[10px]">Prompt Phase</TableHead>
          <TableHead className="text-[10px]">Total</TableHead>
          <TableHead className="text-[10px]">Not Started</TableHead>
          <TableHead className="text-[10px]">Partial</TableHead>
          <TableHead className="text-[10px]">Coverage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {gapGroups.map(g => (
          <TableRow key={g.phase}>
            <TableCell className="text-[11px] font-medium">{g.phase}</TableCell>
            <TableCell className="text-[11px]">{g.specs.length}</TableCell>
            <TableCell><Badge variant="destructive" className="text-[8px]">{g.notStarted}</Badge></TableCell>
            <TableCell><Badge variant="secondary" className="text-[8px]">{g.partial}</Badge></TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Progress value={g.coverageScore} className="w-16 h-1.5" />
                <span className="text-[10px]">{g.coverageScore}%</span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function ITC11PromptTraceability() {
  const { data: specs, isLoading } = useSpecRegistry();
  const allSpecs = specs || [];
  const groups = buildPhaseGroups(allSpecs);
  const totalCoverage = allSpecs.length > 0 ? Math.round((allSpecs.filter(s => (s.overall_readiness || 0) >= 80).length / allSpecs.length) * 100) : 0;
  const uniquePrompts = new Set(allSpecs.map(s => (s.prompt_origin || "Unknown").split("—")[0]?.trim())).size;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Prompt Traceability Explorer</h1>
          <Badge variant="outline" className="text-[8px]">ITC-11</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Map prompt-defined scope to real implementation and identify coverage gaps</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold">{uniquePrompts}</div><div className="text-[10px] text-muted-foreground">Prompt Phases</div></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold">{allSpecs.length}</div><div className="text-[10px] text-muted-foreground">Total Specs</div></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-green-500">{allSpecs.filter(s => (s.overall_readiness || 0) >= 80).length}</div><div className="text-[10px] text-muted-foreground">Fully Implemented</div></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><div className={`text-2xl font-bold ${totalCoverage >= 80 ? "text-green-500" : totalCoverage >= 40 ? "text-yellow-500" : "text-destructive"}`}>{totalCoverage}%</div><div className="text-[10px] text-muted-foreground">Platform Coverage</div></CardContent></Card>
      </div>

      {/* Coverage Heatmap */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" />Coverage Heatmap by Prompt Phase</CardTitle></CardHeader>
        <CardContent><CoverageHeatmap groups={groups} /></CardContent>
      </Card>

      {/* Gap-by-Prompt */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Gaps by Prompt Phase</CardTitle></CardHeader>
        <CardContent className="p-0"><GapByPromptPanel groups={groups} /></CardContent>
      </Card>

      {/* Full Prompt-to-Build Map */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><GitCommit className="h-4 w-4" />Prompt-to-Build Lineage</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-[11px] text-muted-foreground text-center py-8">Loading…</div>
          ) : (
            <div className="space-y-4">
              {groups.map(g => (
                <div key={g.phase}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[9px]">{g.phase}</Badge>
                    <span className="text-[9px] text-muted-foreground">{g.specs.length} specs · {g.coverageScore}% coverage</span>
                  </div>
                  <div className="pl-4 border-l-2 border-border">
                    {g.specs.map(s => <PromptTraceCard key={s.spec_id} spec={s} />)}
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
