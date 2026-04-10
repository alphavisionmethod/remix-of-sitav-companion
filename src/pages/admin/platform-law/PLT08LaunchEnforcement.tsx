import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import {
  Rocket, AlertTriangle, CheckCircle, XCircle, Shield, Target, Layers, ArrowRight, Zap
} from "lucide-react";
import {
  FEATURE_MANIFESTS, LAUNCH_GATE_MANIFESTS, READINESS_MANIFESTS, RUNTIME_EVIDENCE_MANIFESTS,
  VALIDATION_VIOLATIONS, DRIFT_RECORDS, JOURNEY_MANIFESTS,
  getLaunchBlockers, getBlockingDrift, getOpenViolations,
  type LaunchGateManifestRecord
} from "@/lib/platform-law/platform-law-registry";

const PLT08LaunchEnforcement = () => {
  const navigate = useNavigate();
  const [selectedGate, setSelectedGate] = useState<LaunchGateManifestRecord | null>(null);

  const launchBlockers = getLaunchBlockers();
  const blockingDrift = getBlockingDrift();
  const openViolations = getOpenViolations();
  const criticalViolations = openViolations.filter(v => v.severity === "critical");
  const p0Journeys = JOURNEY_MANIFESTS.filter(j => j.criticality === "P0");
  const p0FeaturesWithoutReadiness = FEATURE_MANIFESTS.filter(f => f.criticality === "P0" && !READINESS_MANIFESTS.some(r => r.featureId === f.featureId));
  const launchRequiredEvidence = RUNTIME_EVIDENCE_MANIFESTS.filter(r => r.requiredForLaunch);
  const missingLaunchEvidence = launchRequiredEvidence.filter(r => !r.requiredForReadiness);

  const releaseEligible = launchBlockers.length === 0 && blockingDrift.length === 0 && criticalViolations.length === 0;

  const rings = [
    { name: "Development", status: "open", blockers: 0, color: "text-blue-400" },
    { name: "Staging", status: launchBlockers.length > 3 ? "blocked" : "gated", blockers: Math.min(launchBlockers.length, 3), color: "text-amber-400" },
    { name: "Canary", status: criticalViolations.length > 0 ? "blocked" : "gated", blockers: criticalViolations.length, color: criticalViolations.length > 0 ? "text-red-400" : "text-amber-400" },
    { name: "Production", status: releaseEligible ? "eligible" : "blocked", blockers: launchBlockers.length, color: releaseEligible ? "text-emerald-400" : "text-red-400" },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-500/10"><Rocket className="h-6 w-6 text-red-400" /></div>
        <div>
          <h1 className="text-2xl font-bold">Launch Enforcement Board</h1>
          <p className="text-sm text-muted-foreground">{launchBlockers.length} blocked features · {blockingDrift.length} blocking drift · {criticalViolations.length} critical violations</p>
        </div>
      </div>

      {/* Release Eligibility Hero */}
      <Card className={`border-2 ${releaseEligible ? "border-emerald-500/30" : "border-red-500/30"}`}>
        <CardContent className="p-6 text-center">
          <div className={`text-4xl font-bold ${releaseEligible ? "text-emerald-400" : "text-red-400"}`}>
            {releaseEligible ? "RELEASE ELIGIBLE" : "RELEASE BLOCKED"}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {releaseEligible ? "All launch gate conditions met" : `${launchBlockers.length} feature(s) blocking release`}
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm flex-wrap">
            <div><span className="text-muted-foreground">Blockers:</span> <span className={`font-mono ${launchBlockers.length > 0 ? "text-red-400" : "text-emerald-400"}`}>{launchBlockers.length}</span></div>
            <div><span className="text-muted-foreground">Critical Violations:</span> <span className={`font-mono ${criticalViolations.length > 0 ? "text-red-400" : "text-emerald-400"}`}>{criticalViolations.length}</span></div>
            <div><span className="text-muted-foreground">Blocking Drift:</span> <span className={`font-mono ${blockingDrift.length > 0 ? "text-red-400" : "text-emerald-400"}`}>{blockingDrift.length}</span></div>
            <div><span className="text-muted-foreground">P0 Journeys:</span> <span className="font-mono">{p0Journeys.length}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Ring Impact Matrix */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Layers className="h-4 w-4" /> Ring Impact Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {rings.map(ring => (
              <div key={ring.name} className={`p-4 rounded-lg border text-center ${ring.status === "blocked" ? "border-red-500/30 bg-red-500/5" : ring.status === "eligible" ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/50"}`}>
                <div className={`text-lg font-bold ${ring.color}`}>{ring.name}</div>
                <div className="text-xs text-muted-foreground mt-1 capitalize">{ring.status}</div>
                {ring.blockers > 0 && <div className="text-red-400 text-xs font-mono mt-1">{ring.blockers} blockers</div>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI Band */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Launch Gates", value: LAUNCH_GATE_MANIFESTS.length, color: "text-blue-400" },
          { label: "P0 Without Readiness", value: p0FeaturesWithoutReadiness.length, color: p0FeaturesWithoutReadiness.length > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "Launch Evidence", value: launchRequiredEvidence.length, color: "text-purple-400" },
          { label: "P0 Journeys", value: p0Journeys.length, color: "text-cyan-400" },
          { label: "Blocking Drift", value: blockingDrift.length, color: blockingDrift.length > 0 ? "text-red-400" : "text-emerald-400" },
        ].map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Blocking Features */}
      {launchBlockers.length > 0 && (
        <Card className="border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><XCircle className="h-4 w-4 text-red-400" /> Blocked Features ({launchBlockers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {launchBlockers.map(b => {
                const feature = FEATURE_MANIFESTS.find(f => f.featureId === b.featureId);
                return (
                  <div key={b.featureId} className="p-3 rounded border border-red-500/20 bg-red-500/5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{feature?.canonicalName || b.featureId}</span>
                        <Badge variant="destructive" className="text-[10px]">{feature?.criticality || "P0"}</Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate("/admin/platform-law/feature-compliance")}>
                        Detail <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {b.reasons.map((r, i) => <Badge key={i} variant="outline" className="text-[10px] text-red-400">{r}</Badge>)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Launch Gate Manifests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Launch Gate Manifests ({LAUNCH_GATE_MANIFESTS.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead className="w-24">Type</TableHead>
              <TableHead className="w-20">Readiness</TableHead>
              <TableHead className="w-20">Blocking Rules</TableHead>
              <TableHead className="w-20">Min Evidence</TableHead>
              <TableHead className="w-16">Override</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {LAUNCH_GATE_MANIFESTS.map(g => (
                <TableRow key={g.launchGateManifestId} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelectedGate(g)}>
                  <TableCell className="font-mono text-xs">{g.launchGateManifestId}</TableCell>
                  <TableCell className="text-sm">{g.scopeId}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{g.scopeType}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{g.requiredReadinessScore}%</TableCell>
                  <TableCell className="font-mono text-xs">{g.blockingRuleIds.length}</TableCell>
                  <TableCell className="font-mono text-xs">{g.minimumRuntimeEvidence}</TableCell>
                  <TableCell>{g.allowOverrides ? <CheckCircle className="h-3.5 w-3.5 text-amber-400" /> : <XCircle className="h-3.5 w-3.5 text-red-400" />}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div></CardContent>
      </Card>

      {/* Gate Detail */}
      {selectedGate && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3"><div className="flex items-center justify-between">
            <CardTitle className="text-sm">{selectedGate.launchGateManifestId} — {selectedGate.scopeId}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelectedGate(null)}>✕</Button>
          </div></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><span className="text-muted-foreground text-xs">Scope Type</span><div>{selectedGate.scopeType}</div></div>
              <div><span className="text-muted-foreground text-xs">Required Readiness</span><div className="font-mono">{selectedGate.requiredReadinessScore}%</div></div>
              <div><span className="text-muted-foreground text-xs">Min Journey Pass</span><div className="font-mono">{selectedGate.minimumJourneyPassRate}%</div></div>
              <div><span className="text-muted-foreground text-xs">Min Interaction Pass</span><div className="font-mono">{selectedGate.minimumInteractionPassRate}%</div></div>
            </div>
            <div><span className="text-muted-foreground text-xs">Blocking Rule IDs</span>
              <div className="flex flex-wrap gap-1 mt-1">{selectedGate.blockingRuleIds.map(r => <Badge key={r} variant="outline" className="text-[10px] font-mono">{r}</Badge>)}</div>
            </div>
            <div><span className="text-muted-foreground text-xs">Blocking Failure Types</span>
              <div className="flex flex-wrap gap-1 mt-1">{selectedGate.blockingFailureTypes.map(r => <Badge key={r} variant="destructive" className="text-[10px]">{r}</Badge>)}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blocking Drift */}
      {blockingDrift.length > 0 && (
        <Card className="border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400" /> Blocking Drift ({blockingDrift.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {blockingDrift.map(d => (
                <div key={d.driftEnforcementId} className="p-3 rounded border border-red-500/20 bg-red-500/5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-[10px]">BLOCKING</Badge>
                      <Badge variant="outline" className="text-[10px]">{d.driftType}</Badge>
                      <span className="font-mono text-xs">{d.scopeId}</span>
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

      {/* Cross-links */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Feature Compliance", path: "/admin/platform-law/feature-compliance" },
              { label: "Violation Triage", path: "/admin/platform-law/violations" },
              { label: "Drift Radar", path: "/admin/platform-law/drift-radar" },
              { label: "Implementation Truth Launch Gate", path: "/admin/implementation-truth/launch-gate" },
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

export default PLT08LaunchEnforcement;
