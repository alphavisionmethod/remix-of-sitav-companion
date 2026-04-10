import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Layers, Shield, CheckCircle, XCircle, AlertTriangle, ArrowRight,
  Scale, Cpu, GitBranch, Eye, Zap, Rocket, BarChart3, Settings
} from "lucide-react";
import {
  ENFORCEMENT_LAYERS, getEnforcementLayerAverage, getOverallComplianceScore,
  getTotalViolations, getCIGatePassRate, getManifestCompletionRate
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

  const layerIcons: Record<string, any> = {
    L1: Scale, L2: Cpu, L3: GitBranch, L4: Eye, L5: Zap, L6: Rocket, L7: BarChart3
  };

  const modeDescriptions: Record<ComplianceMode, string> = {
    strict: "All blocking laws enforced. Merges and launches blocked on violations. Full CI gate enforcement.",
    advisory: "Laws logged but not blocking. Violations visible in dashboards but do not block merges or launches.",
    learning: "All checks run silently. Results collected for baseline analysis. No blocking, no warnings to developers.",
  };

  const verdictColor = layerAvg >= 85 ? "text-emerald-400" : layerAvg >= 70 ? "text-amber-400" : "text-red-400";
  const verdictLabel = layerAvg >= 85 ? "COMPLIANT" : layerAvg >= 70 ? "NEEDS ATTENTION" : "NON-COMPLIANT";

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Layers className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Compliance Mode Dashboard</h1>
          <p className="text-sm text-muted-foreground">7-layer enforcement health · Unified compliance view · Mode control</p>
        </div>
      </div>

      {/* Overall Verdict */}
      <Card className={`border-2 ${layerAvg >= 85 ? "border-emerald-500/30" : layerAvg >= 70 ? "border-amber-500/30" : "border-red-500/30"}`}>
        <CardContent className="p-6 text-center">
          <div className={`text-4xl font-bold ${verdictColor}`}>{layerAvg}%</div>
          <div className={`text-lg font-semibold ${verdictColor}`}>{verdictLabel}</div>
          <div className="text-sm text-muted-foreground mt-1">Platform Enforcement Health Score</div>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <div><span className="text-muted-foreground">Laws:</span> <span className="font-mono">{complianceScore}%</span></div>
            <div><span className="text-muted-foreground">CI:</span> <span className="font-mono">{ciRate}%</span></div>
            <div><span className="text-muted-foreground">Manifests:</span> <span className="font-mono">{manifestRate}%</span></div>
            <div><span className="text-muted-foreground">Violations:</span> <span className={`font-mono ${violations > 0 ? "text-red-400" : "text-emerald-400"}`}>{violations}</span></div>
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
              <button key={m} onClick={() => setMode(m)} className={`text-left p-4 rounded-lg border-2 transition-all ${mode === m ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"}`}>
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

      {/* Weakest Layers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Weakest Enforcement Layers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...ENFORCEMENT_LAYERS].sort((a, b) => a.healthScore - b.healthScore).slice(0, 3).map(layer => (
              <div key={layer.id} className="flex items-center justify-between p-2 rounded bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs ${layer.healthScore < 75 ? "text-red-400" : "text-amber-400"}`}>{layer.healthScore}%</span>
                  <span className="text-sm">{layer.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{layer.totalChecks - layer.passingChecks} failing</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PLE07ComplianceDashboard;
