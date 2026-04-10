// ═══════════════════════════════════════════════════════════════
// ITC06 — Drift & Traceability Radar
// Spec vs implementation drift, prompt-to-build traceability
// ═══════════════════════════════════════════════════════════════

import { Shield } from "lucide-react";
import { useSpecRegistry, useDriftDetection, STATUS_TIERS, type SpecRegistryEntry } from "@/hooks/use-implementation-truth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Radar, AlertTriangle, GitCommit, Link as LinkIcon, CheckCircle2 } from "lucide-react";

function PromptTraceCard({ spec }: { spec: SpecRegistryEntry }) {
  const tier = STATUS_TIERS.find(t => t.value === spec.implementation_status);
  const routeCount = spec.required_routes.length;
  const componentCount = spec.required_components.length;

  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
      <GitCommit className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium">{spec.canonical_name}</span>
          <Badge variant="outline" className={`text-[7px] h-4 ${tier?.color}`}>{tier?.label}</Badge>
        </div>
        <div className="text-[9px] text-muted-foreground mt-0.5">
          Origin: {spec.prompt_origin || "Unknown"} · {routeCount} routes · {componentCount} components
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

  // Group specs by prompt origin phase
  const byOrigin = new Map<string, SpecRegistryEntry[]>();
  (specs || []).forEach(s => {
    const origin = s.prompt_origin || "Unknown";
    const phase = origin.split("—")[0]?.trim() || origin;
    const list = byOrigin.get(phase) || [];
    list.push(s);
    byOrigin.set(phase, list);
  });

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-xl font-semibold text-foreground">TITLE_PLACEHOLDER</h1>
        <p className="text-sm text-muted-foreground">DESC_PLACEHOLDER</p>
      </div>

      {/* Drift Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <Radar className="h-5 w-5 mx-auto text-primary mb-1" />
            <div className="text-2xl font-bold">{driftCount}</div>
            <div className="text-[10px] text-muted-foreground">Total Drifts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-destructive">{highDrifts.length}</div>
            <div className="text-[10px] text-muted-foreground">High Severity</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{medDrifts.length}</div>
            <div className="text-[10px] text-muted-foreground">Medium</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-muted-foreground">{lowDrifts.length}</div>
            <div className="text-[10px] text-muted-foreground">Low</div>
          </CardContent>
        </Card>
      </div>

      {/* Drift Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Active Drift Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">Severity</TableHead>
                <TableHead className="text-[10px]">System</TableHead>
                <TableHead className="text-[10px]">Drift Issue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drifts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-green-500 text-[11px]">
                      <CheckCircle2 className="h-4 w-4" /> No drift detected — all systems aligned
                    </div>
                  </TableCell>
                </TableRow>
              ) : drifts.map((d, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Badge
                      variant={d.severity === "high" ? "destructive" : d.severity === "medium" ? "secondary" : "outline"}
                      className="text-[8px]"
                    >
                      {d.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] font-medium">{d.canonical_name}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{d.issue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Prompt-to-Build Traceability */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitCommit className="h-4 w-4" />
            Prompt-to-Build Traceability
          </CardTitle>
        </CardHeader>
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
                    {phaseSpecs.map(s => (
                      <PromptTraceCard key={s.spec_id} spec={s} />
                    ))}
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
