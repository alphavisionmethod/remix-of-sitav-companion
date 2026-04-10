import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import {
  Layers, Shield, CheckCircle, XCircle, AlertTriangle, ArrowRight,
  Scale, Cpu, GitBranch, Eye, Zap, Rocket, BarChart3, Settings, Activity, Clock
} from "lucide-react";
import {
  ENFORCEMENT_LAYERS, VALIDATION_RUNS, VALIDATION_VIOLATIONS, DRIFT_RECORDS,
  getEnforcementLayerAverage, getOverallComplianceScore,
  getTotalViolations, getCIGatePassRate, getManifestCompletionRate,
  getRecentValidationRuns, getOpenViolations, getUnresolvedDrift, getBlockingDrift
} from "@/lib/platform-law/platform-law-registry";

type ComplianceMode = "strict" | "advisory" | "learning";

const PLE07ComplianceDashboard = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ComplianceMode>("strict");
  const layerAvg = getEnforcementLayerAverage();
  const complianceScore = getOverallComplianceScore();
  const violations = getTotalViolations();
  const ciRate = getCIGatePassRate();
  const manifestRate = getManifestCompletionRate();
  const recentRuns = getRecentValidationRuns(5);
  const openViolations = getOpenViolations();
  const unresolvedDrift = getUnresolvedDrift();
  const blockingDrift = getBlockingDrift();

  const layerIcons: Record<string, any> = { L1: Scale, L2: Cpu, L3: GitBranch, L4: Eye, L5: Zap, L6: Rocket, L7: BarChart3 };

  const modeDescriptions: Record<ComplianceMode, string> = {
    strict: "All blocking laws enforced. Merges and launches blocked on violations. Full CI gate enforcement.",
    advisory: "Laws logged but not blocking. Violations visible in dashboards but do not block merges or launches.",
    learning: "All checks run silently. Results collected for baseline analysis. No blocking, no warnings to developers.",
  };

  const verdictColor = layerAvg >= 85 ? "text-emerald-400" : layerAvg >= 70 ? "text-amber-400" : "text-red-400";
  const verdictLabel = layerAvg >= 85 ? "COMPLIANT" : layerAvg >= 70 ? "NEEDS ATTENTION" : "NON-COMPLIANT";

  const statusColor: Record<string, string> = { pass: "text-emerald-400", fail: "text-red-400", partial: "text-amber-400" };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Layers className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Compliance Mode Dashboard</h1>
          <p className="text-sm text-muted-foreground">7-layer enforcement health · Validation runs · Drift policing · Mode control</p>
        </div>
      </div>

      {/* Overall Verdict */}
      <Card className={`border-2 ${layerAvg >= 85 ? "border-emerald-500/30" : layerAvg >= 70 ? "border-amber-500/30" : "border-red-500/30"}`}>
        <CardContent className="p-6 text-center">
          <div className={`text-4xl font-bold ${verdictColor}`}>{layerAvg}%</div>
          <div className={`text-lg font-semibold ${verdictColor}`}>{verdictLabel}</div>
          <div className="text-sm text-muted-foreground mt-1">Platform Enforcement Health Score</div>
          <div className="flex justify-center gap-4 mt-4 text-sm flex-wrap">
            <div><span className="text-muted-foreground">Laws:</span> <span className="font-mono">{complianceScore}%</span></div>
            <div><span className="text-muted-foreground">CI:</span> <span className="font-mono">{ciRate}%</span></div>
            <div><span className="text-muted-foreground">Manifests:</span> <span className="font-mono">{manifestRate}%</span></div>
            <div><span className="text-muted-foreground">Violations:</span> <span className={`font-mono ${violations > 0 ? "text-red-400" : "text-emerald-400"}`}>{violations}</span></div>
            <div><span className="text-muted-foreground">Drift:</span> <span className={`font-mono ${unresolvedDrift.length > 0 ? "text-amber-400" : "text-emerald-400"}`}>{unresolvedDrift.length}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Mode Toggle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Settings className="h-4 w-4" /> Enforcement Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(["strict", "advisory", "learning"] as ComplianceMode[]).map(m => (
              <button key={m} onClick={() => setMode(m)} className={`text-left p-4 rounded-lg border-2 transition-all ${mode === m ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"}`} data-testid="compliance-mode-toggle">
                <div className="flex items-center gap-2 mb-2">
                  {m === "strict" && <Shield className="h-4 w-4 text-red-400" />}
                  {m === "advisory" && <AlertTriangle className="h-4 w-4 text-amber-400" />}
                  {m === "learning" && <Eye className="h-4 w-4 text-blue-400" />}
                  <span className="font-medium text-sm capitalize">{m}</span>
                  {mode === m && <Badge variant="default" className="text-[10px] ml-auto">Active</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{modeDescriptions[m]}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Validation Runs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Recent Validation Runs ({VALIDATION_RUNS.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentRuns.map(run => (
              <div key={run.validationRunId} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs font-bold ${statusColor[run.overallStatus]}`}>{run.overallStatus.toUpperCase()}</span>
                  <Badge variant="outline" className="text-[10px]">{run.runType}</Badge>
                  <span className="text-xs text-muted-foreground">{run.lawPackIds.join(", ")}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {run.blockerCount > 0 && <span className="text-red-400 font-bold">{run.blockerCount} blockers</span>}
                  {run.warningCount > 0 && <span className="text-amber-400">{run.warningCount} warnings</span>}
                  <span className="text-muted-foreground">{run.completedAt.split("T")[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Open Violations */}
      {openViolations.length > 0 && (
        <Card className="border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><XCircle className="h-4 w-4 text-red-400" /> Open Violations ({openViolations.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="w-16">ID</TableHead><TableHead className="w-20">Rule</TableHead>
                  <TableHead>Message</TableHead><TableHead className="w-20">Severity</TableHead>
                  <TableHead className="w-24">Owner</TableHead><TableHead className="w-20">Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {openViolations.map(v => (
                    <TableRow key={v.violationId}>
                      <TableCell className="font-mono text-xs">{v.violationId}</TableCell>
                      <TableCell className="font-mono text-xs">{v.ruleId}</TableCell>
                      <TableCell className="text-xs">{v.message}</TableCell>
                      <TableCell><Badge variant={v.severity === "critical" ? "destructive" : "secondary"} className="text-[10px]">{v.severity}</Badge></TableCell>
                      <TableCell className="text-xs">{v.owner}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{v.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drift Enforcement */}
      {unresolvedDrift.length > 0 && (
        <Card className="border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-amber-400" /> Drift Enforcement ({unresolvedDrift.length} unresolved · {blockingDrift.length} blocking)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unresolvedDrift.map(d => (
                <div key={d.driftEnforcementId} className={`p-3 rounded border ${d.blocking ? "border-red-500/30 bg-red-500/5" : "border-border/50 bg-muted/30"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{d.driftEnforcementId}</span>
                      {d.blocking && <Badge variant="destructive" className="text-[10px]">BLOCKING</Badge>}
                      <Badge variant="outline" className="text-[10px]">{d.driftType}</Badge>
                      <Badge variant={d.severity === "critical" ? "destructive" : "secondary"} className="text-[10px]">{d.severity}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{d.owner} · {d.detectedAt}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{d.notes}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7-Layer Detail */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Layers className="h-5 w-5" /> 7-Layer Enforcement Health</h2>
        {ENFORCEMENT_LAYERS.map(layer => {
          const Icon = layerIcons[layer.id] || Shield;
          const healthColor = layer.healthScore >= 85 ? "text-emerald-400" : layer.healthScore >= 70 ? "text-amber-400" : "text-red-400";
          const barColor = layer.healthScore >= 85 ? "bg-emerald-500" : layer.healthScore >= 70 ? "bg-amber-500" : "bg-red-500";
          return (
            <Card key={layer.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-muted/50"><Icon className={`h-5 w-5 ${healthColor}`} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{layer.id}. {layer.name}</span>
                        <Badge variant={layer.healthScore >= 85 ? "default" : layer.healthScore >= 70 ? "secondary" : "destructive"} className="text-[10px]">{layer.healthScore}%</Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate(layer.linkedPage)}>
                        View <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{layer.description}</p>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${layer.healthScore}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{layer.passingChecks}/{layer.totalChecks} checks passing</span>
                      <div className="flex flex-wrap gap-1">
                        {layer.artifacts.map(a => <Badge key={a} variant="outline" className="text-[10px]">{a}</Badge>)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PLE07ComplianceDashboard;