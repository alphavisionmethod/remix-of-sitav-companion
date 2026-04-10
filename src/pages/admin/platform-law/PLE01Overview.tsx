import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Shield, Scale, AlertTriangle, CheckCircle, XCircle, Layers, Users, Cpu,
  FileText, GitBranch, Target, ArrowRight, Gavel, Clock, Activity, Waypoints
} from "lucide-react";
import {
  PLATFORM_LAWS, SCAFFOLD_REGISTRY, CI_GATE_REGISTRY, MANIFEST_REQUIREMENTS,
  OWNERSHIP_REGISTRY, ENFORCEMENT_LAYERS, LAW_PACKS, VALIDATION_RUNS, DRIFT_RECORDS,
  VALIDATION_VIOLATIONS,
  getOverallComplianceScore, getTotalViolations, getBlockingLaws, getViolatedLaws,
  getCIGatePassRate, getManifestCompletionRate, getOwnerComplianceAverage, getEnforcementLayerAverage,
  getRecentValidationRuns, getUnresolvedDrift, getOpenViolations
} from "@/lib/platform-law/platform-law-registry";

const PLE01Overview = () => {
  const navigate = useNavigate();
  const complianceScore = getOverallComplianceScore();
  const totalViolations = getTotalViolations();
  const blockingLaws = getBlockingLaws();
  const violatedLaws = getViolatedLaws();
  const ciPassRate = getCIGatePassRate();
  const manifestRate = getManifestCompletionRate();
  const ownerAvg = getOwnerComplianceAverage();
  const layerAvg = getEnforcementLayerAverage();
  const recentRuns = getRecentValidationRuns(4);
  const unresolvedDrift = getUnresolvedDrift();
  const openViolations = getOpenViolations();

  const kpis = [
    { label: "Platform Laws", value: PLATFORM_LAWS.length, icon: Scale, color: "text-blue-400" },
    { label: "Compliance Score", value: `${complianceScore}%`, icon: Shield, color: complianceScore >= 80 ? "text-emerald-400" : "text-amber-400" },
    { label: "Active Violations", value: totalViolations, icon: AlertTriangle, color: totalViolations === 0 ? "text-emerald-400" : "text-red-400" },
    { label: "Blocking Laws", value: blockingLaws.length, icon: XCircle, color: "text-red-400" },
    { label: "CI Gate Pass Rate", value: `${ciPassRate}%`, icon: GitBranch, color: ciPassRate >= 90 ? "text-emerald-400" : "text-amber-400" },
    { label: "Manifest Coverage", value: `${manifestRate}%`, icon: FileText, color: manifestRate >= 70 ? "text-emerald-400" : "text-amber-400" },
    { label: "Unresolved Drift", value: unresolvedDrift.length, icon: Activity, color: unresolvedDrift.length === 0 ? "text-emerald-400" : "text-amber-400" },
    { label: "Layer Health", value: `${layerAvg}%`, icon: Layers, color: layerAvg >= 80 ? "text-emerald-400" : "text-amber-400" },
  ];

  const subPages = [
    { title: "Architecture Law Registry", desc: `${PLATFORM_LAWS.length} laws · ${violatedLaws.length} violated`, path: "/admin/platform-law/laws", icon: Scale },
    { title: "Scaffold & Generator Registry", desc: `${SCAFFOLD_REGISTRY.length} generators`, path: "/admin/platform-law/scaffolds", icon: Cpu },
    { title: "CI & PR Gate Monitor", desc: `${CI_GATE_REGISTRY.length} gates · ${ciPassRate}% passing`, path: "/admin/platform-law/ci-gates", icon: GitBranch },
    { title: "Manifest Requirement Enforcer", desc: `${manifestRate}% manifest coverage`, path: "/admin/platform-law/manifests", icon: FileText },
    { title: "Ownership Accountability Board", desc: `${OWNERSHIP_REGISTRY.length} owners tracked`, path: "/admin/platform-law/ownership", icon: Users },
    { title: "Compliance Mode Dashboard", desc: `7 enforcement layers · ${layerAvg}% health`, path: "/admin/platform-law/compliance", icon: Layers },
  ];

  const statusColor: Record<string, string> = { pass: "text-emerald-400", fail: "text-red-400", partial: "text-amber-400" };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Gavel className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Platform Law & Truth Enforcement</h1>
          <p className="text-sm text-muted-foreground">Constitutional enforcement umbrella — making architecture compliance automatic, blocking, and visible</p>
        </div>
      </div>

      {/* KPI Band */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {kpis.map(k => (
          <Card key={k.label} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <k.icon className={`h-4 w-4 mx-auto mb-1 ${k.color}`} />
              <div className={`text-lg font-bold ${k.color}`}>{k.value}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{k.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Law Pack Summary Strip */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Waypoints className="h-4 w-4" /> Law Packs ({LAW_PACKS.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {LAW_PACKS.map(pack => (
              <div key={pack.lawPackId} className="p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/admin/platform-law/laws")}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-muted-foreground">{pack.lawPackId}</span>
                  <Badge variant={pack.active ? "default" : "secondary"} className="text-[10px]">v{pack.version}</Badge>
                </div>
                <div className="font-medium text-sm">{pack.name}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{pack.ruleIds.length} rules · {pack.severityModel}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Validation Runs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Recent Validation Runs</CardTitle>
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
                  {run.blockerCount > 0 && <span className="text-red-400">{run.blockerCount} blockers</span>}
                  {run.warningCount > 0 && <span className="text-amber-400">{run.warningCount} warnings</span>}
                  <span className="text-muted-foreground">{run.completedAt.split("T")[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enforcement Mode Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Enforcement Mode Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["block", "warn", "log", "disabled"] as const).map(mode => {
              const count = PLATFORM_LAWS.filter(l => l.enforcementMode === mode).length;
              const colors: Record<string, string> = { block: "bg-red-500/20 text-red-400", warn: "bg-amber-500/20 text-amber-400", log: "bg-blue-500/20 text-blue-400", disabled: "bg-muted text-muted-foreground" };
              return (
                <div key={mode} className={`rounded-lg p-3 text-center ${colors[mode]}`}>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs capitalize">{mode}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recently Triggered Laws */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Recently Triggered Laws ({violatedLaws.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {violatedLaws.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-400 text-sm"><CheckCircle className="h-4 w-4" /> All laws passing — zero violations</div>
          ) : (
            <div className="space-y-2">
              {violatedLaws.map(l => (
                <div key={l.id} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={l.severity === "critical" ? "destructive" : "secondary"} className="text-[10px]">{l.severity}</Badge>
                    <span className="font-mono text-xs text-muted-foreground">{l.id}</span>
                    <span>{l.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-mono text-xs">{l.violationCount} violations</span>
                    {l.lastTriggered && <span className="text-muted-foreground text-xs">{l.lastTriggered}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drift Alerts */}
      {unresolvedDrift.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-amber-400" /> Active Drift ({unresolvedDrift.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unresolvedDrift.slice(0, 4).map(d => (
                <div key={d.driftEnforcementId} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                  <div className="flex items-center gap-2">
                    {d.blocking && <Badge variant="destructive" className="text-[10px]">BLOCKING</Badge>}
                    <Badge variant="outline" className="text-[10px]">{d.driftType}</Badge>
                    <span className="text-xs">{d.scopeId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{d.owner}</span>
                    <span className="text-xs text-muted-foreground">{d.detectedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7-Layer Health Strip */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Layers className="h-4 w-4" /> 7-Layer Enforcement Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ENFORCEMENT_LAYERS.map(layer => (
              <button key={layer.id} onClick={() => navigate(layer.linkedPage)} className="text-left p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{layer.id}. {layer.name}</span>
                  <Badge variant={layer.healthScore >= 85 ? "default" : layer.healthScore >= 70 ? "secondary" : "destructive"} className="text-[10px]">{layer.healthScore}%</Badge>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${layer.healthScore >= 85 ? "bg-emerald-500" : layer.healthScore >= 70 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${layer.healthScore}%` }} />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">{layer.passingChecks}/{layer.totalChecks} checks passing</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sub-page Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {subPages.map(sp => (
          <Card key={sp.path} className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => navigate(sp.path)}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><sp.icon className="h-5 w-5 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{sp.title}</div>
                <div className="text-xs text-muted-foreground">{sp.desc}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cross-links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4" /> Connected Truth Systems</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Implementation Truth", path: "/admin/implementation-truth" },
              { label: "Journey Verification", path: "/admin/verification/overview" },
              { label: "Launch Truth Gate", path: "/admin/implementation-truth/launch-gate" },
              { label: "Behavioral Truth", path: "/admin/behavioral-truth" },
              { label: "Architecture Compliance", path: "/admin/implementation-truth/architecture" },
              { label: "Runtime Evidence", path: "/admin/implementation-truth/runtime" },
            ].map(link => (
              <Button key={link.path} variant="outline" size="sm" className="text-xs" onClick={() => navigate(link.path)}>
                {link.label} <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PLE01Overview;