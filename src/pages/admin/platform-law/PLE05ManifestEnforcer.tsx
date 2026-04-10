import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  FileText, AlertTriangle, CheckCircle, TrendingUp, Waypoints, Zap, Shield, Rocket,
  Target, ClipboardList
} from "lucide-react";
import {
  MANIFEST_REQUIREMENTS, FEATURE_MANIFESTS, INTERACTION_MANIFESTS, JOURNEY_MANIFESTS,
  CONTRACT_MANIFESTS, RUNTIME_EVIDENCE_MANIFESTS, READINESS_MANIFESTS, LAUNCH_GATE_MANIFESTS,
  getManifestCompletionRate,
  type FeatureManifestRecord, type InteractionManifestRecord, type JourneyManifestRecord,
  type ContractManifestRecord
} from "@/lib/platform-law/platform-law-registry";

const PLE05ManifestEnforcer = () => {
  const [selectedFM, setSelectedFM] = useState<FeatureManifestRecord | null>(null);
  const overallRate = getManifestCompletionRate();
  const p0Required = MANIFEST_REQUIREMENTS.filter(m => m.requiredForP0);
  const p0Rate = p0Required.length > 0 ? Math.round(p0Required.reduce((s, m) => s + m.completionRate, 0) / p0Required.length) : 0;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><FileText className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Manifest Requirement Enforcer</h1>
          <p className="text-sm text-muted-foreground">{MANIFEST_REQUIREMENTS.length} types · {FEATURE_MANIFESTS.length} features · {INTERACTION_MANIFESTS.length} interactions · {JOURNEY_MANIFESTS.length} journeys</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Overall Coverage", value: `${overallRate}%`, color: overallRate >= 70 ? "text-emerald-400" : "text-amber-400" },
          { label: "Feature Manifests", value: FEATURE_MANIFESTS.length, color: "text-blue-400" },
          { label: "Interactions", value: INTERACTION_MANIFESTS.length, color: "text-purple-400" },
          { label: "Journeys", value: JOURNEY_MANIFESTS.length, color: "text-cyan-400" },
          { label: "Contracts", value: CONTRACT_MANIFESTS.length, color: "text-amber-400" },
          { label: "Runtime Evidence", value: RUNTIME_EVIDENCE_MANIFESTS.length, color: "text-emerald-400" },
          { label: "Launch Gates", value: LAUNCH_GATE_MANIFESTS.length, color: "text-red-400" },
        ].map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="coverage" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1">
          <TabsTrigger value="coverage" className="text-xs">Coverage</TabsTrigger>
          <TabsTrigger value="features" className="text-xs">Features ({FEATURE_MANIFESTS.length})</TabsTrigger>
          <TabsTrigger value="interactions" className="text-xs">Interactions ({INTERACTION_MANIFESTS.length})</TabsTrigger>
          <TabsTrigger value="journeys" className="text-xs">Journeys ({JOURNEY_MANIFESTS.length})</TabsTrigger>
          <TabsTrigger value="contracts" className="text-xs">Contracts ({CONTRACT_MANIFESTS.length})</TabsTrigger>
          <TabsTrigger value="runtime" className="text-xs">Runtime ({RUNTIME_EVIDENCE_MANIFESTS.length})</TabsTrigger>
          <TabsTrigger value="readiness" className="text-xs">Readiness ({READINESS_MANIFESTS.length})</TabsTrigger>
          <TabsTrigger value="launch" className="text-xs">Launch Gates ({LAUNCH_GATE_MANIFESTS.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="coverage">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Coverage by Manifest Type</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...MANIFEST_REQUIREMENTS].sort((a, b) => a.completionRate - b.completionRate).map(m => (
                  <div key={m.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{m.type}</span>
                        {m.requiredForP0 && <Badge variant="destructive" className="text-[10px]">P0</Badge>}
                      </div>
                      <span className="font-mono text-xs">{m.compliantFeatures}/{m.totalFeatures} ({m.completionRate}%)</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${m.completionRate >= 80 ? "bg-emerald-500" : m.completionRate >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${m.completionRate}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Domain Coverage Chart */}
          <Card className="mt-4">
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4" /> Domain Coverage</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["finance", "business", "concierge", "platform", "admin"].map(domain => {
                  const domainFeatures = FEATURE_MANIFESTS.filter(f => f.domain === domain);
                  const withInteractions = domainFeatures.filter(f => INTERACTION_MANIFESTS.some(im => im.featureId === f.featureId)).length;
                  const withJourneys = domainFeatures.filter(f => JOURNEY_MANIFESTS.some(jm => jm.featureId === f.featureId)).length;
                  const pct = domainFeatures.length > 0 ? Math.round(((withInteractions + withJourneys) / (domainFeatures.length * 2)) * 100) : 0;
                  return (
                    <div key={domain} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize font-medium">{domain}</span>
                        <span className="font-mono text-xs">{domainFeatures.length} features · {pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Coverage Trend Panel */}
          <Card className="mt-4">
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Coverage Trends</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {MANIFEST_REQUIREMENTS.map(m => {
                  const trend = m.completionRate >= 70 ? "up" : m.completionRate >= 50 ? "stable" : "down";
                  const arrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
                  const color = trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-amber-400";
                  return (
                    <div key={m.id} className="p-2 rounded bg-muted/30 text-center">
                      <div className={`text-lg font-bold ${color}`}>{arrow} {m.completionRate}%</div>
                      <div className="text-[10px] text-muted-foreground">{m.type}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Missing Manifest Lane */}
          <Card className="mt-4">
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Missing Manifests by Class</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "Feature Manifest", check: (fId: string) => FEATURE_MANIFESTS.some(f => f.featureId === fId) },
                  { label: "Interaction Manifest", check: (fId: string) => INTERACTION_MANIFESTS.some(im => im.featureId === fId) },
                  { label: "Journey Manifest", check: (fId: string) => JOURNEY_MANIFESTS.some(jm => jm.featureId === fId) },
                  { label: "Runtime Evidence", check: (fId: string) => RUNTIME_EVIDENCE_MANIFESTS.some(re => re.featureId === fId) },
                  { label: "Readiness", check: (fId: string) => READINESS_MANIFESTS.some(rm => rm.featureId === fId) },
                ].map(cls => {
                  const missing = FEATURE_MANIFESTS.filter(f => !cls.check(f.featureId));
                  return (
                    <div key={cls.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{cls.label}</span>
                        <span className="text-xs text-muted-foreground">{missing.length} missing</span>
                      </div>
                      {missing.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {missing.slice(0, 6).map(f => <Badge key={f.featureId} variant="outline" className="text-[10px]">{f.featureId}</Badge>)}
                          {missing.length > 6 && <Badge variant="secondary" className="text-[10px]">+{missing.length - 6}</Badge>}
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> All covered</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Critical Gaps */}
          <Card className="mt-4">
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Critical Gaps (P0, &lt;60%)</CardTitle></CardHeader>
            <CardContent>
              {MANIFEST_REQUIREMENTS.filter(m => m.requiredForP0 && m.completionRate < 60).length === 0 ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm"><CheckCircle className="h-4 w-4" /> All P0 manifests above 60%</div>
              ) : (
                <div className="space-y-2">
                  {MANIFEST_REQUIREMENTS.filter(m => m.requiredForP0 && m.completionRate < 60).map(m => (
                    <div key={m.id} className="p-3 rounded bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center justify-between"><span className="font-medium text-sm text-red-400">{m.type}</span><span className="text-red-400 font-mono text-xs">{m.completionRate}%</span></div>
                      <p className="text-xs text-muted-foreground mt-1">{m.totalFeatures - m.compliantFeatures} features missing. Domain: {m.domain}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="w-16">ID</TableHead><TableHead>Feature</TableHead><TableHead className="w-20">Domain</TableHead>
              <TableHead className="w-16">P</TableHead><TableHead className="w-20">Routes</TableHead><TableHead className="w-20">Contracts</TableHead>
              <TableHead className="w-16">Status</TableHead>
            </TableRow></TableHeader><TableBody>
              {FEATURE_MANIFESTS.map(fm => (
                <TableRow key={fm.featureManifestId} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelectedFM(fm)}>
                  <TableCell className="font-mono text-xs">{fm.featureManifestId}</TableCell>
                  <TableCell><div className="font-medium text-sm">{fm.canonicalName}</div><div className="text-[10px] text-muted-foreground">{fm.featureId}</div></TableCell>
                  <TableCell className="text-xs">{fm.domain}</TableCell>
                  <TableCell><Badge variant={fm.criticality === "P0" ? "destructive" : "secondary"} className="text-[10px]">{fm.criticality}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{fm.routeRefs.length}</TableCell>
                  <TableCell className="font-mono text-xs">{fm.contractRefs.length}</TableCell>
                  <TableCell><Badge variant={fm.status === "active" ? "default" : "outline"} className="text-[10px]">{fm.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </div></CardContent></Card>
          {selectedFM && (
            <Card className="border-primary/30 mt-4">
              <CardHeader className="pb-3"><div className="flex items-center justify-between">
                <CardTitle className="text-sm">{selectedFM.featureManifestId} — {selectedFM.canonicalName}</CardTitle>
                <button onClick={() => setSelectedFM(null)} className="text-muted-foreground hover:text-foreground">✕</button>
              </div></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div><span className="text-muted-foreground text-xs">Domain</span><div>{selectedFM.domain}</div></div>
                  <div><span className="text-muted-foreground text-xs">Owner</span><div>{selectedFM.owner}</div></div>
                  <div><span className="text-muted-foreground text-xs">Criticality</span><div><Badge variant={selectedFM.criticality === "P0" ? "destructive" : "secondary"}>{selectedFM.criticality}</Badge></div></div>
                  <div><span className="text-muted-foreground text-xs">Status</span><div>{selectedFM.status}</div></div>
                </div>
                <div><span className="text-muted-foreground text-xs">Readiness Criteria</span><p className="text-xs mt-1">{selectedFM.readinessCriteria}</p></div>
                {[
                  { label: "Routes", refs: selectedFM.routeRefs },
                  { label: "Shells", refs: selectedFM.shellRefs },
                  { label: "Components", refs: selectedFM.componentRefs },
                  { label: "Contracts", refs: selectedFM.contractRefs },
                  { label: "Endpoints", refs: selectedFM.endpointRefs },
                  { label: "Services", refs: selectedFM.serviceRefs },
                  { label: "Events", refs: selectedFM.eventRefs },
                  { label: "Proofs", refs: selectedFM.proofRefs },
                  { label: "Tests", refs: selectedFM.testRefs },
                  { label: "Runtime Evidence", refs: selectedFM.runtimeEvidenceRefs },
                ].filter(r => r.refs.length > 0).map(r => (
                  <div key={r.label}><span className="text-muted-foreground text-xs">{r.label}</span><div className="flex flex-wrap gap-1 mt-0.5">{r.refs.map(ref => <Badge key={ref} variant="outline" className="text-[10px] font-mono">{ref}</Badge>)}</div></div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="interactions">
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="w-16">ID</TableHead><TableHead>Interaction</TableHead><TableHead className="w-20">Type</TableHead>
              <TableHead className="w-16">P</TableHead><TableHead>Expected Behavior</TableHead><TableHead className="w-20">Mutation</TableHead>
            </TableRow></TableHeader><TableBody>
              {INTERACTION_MANIFESTS.map(im => (
                <TableRow key={im.interactionManifestId}>
                  <TableCell className="font-mono text-xs">{im.interactionManifestId}</TableCell>
                  <TableCell><div className="font-medium text-sm">{im.interactionId}</div><div className="text-[10px] text-muted-foreground">{im.component} · {im.route}</div></TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{im.elementType}</Badge></TableCell>
                  <TableCell><Badge variant={im.criticality === "P0" ? "destructive" : "secondary"} className="text-[10px]">{im.criticality}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{im.expectedBehavior}</TableCell>
                  <TableCell className="text-[10px] font-mono text-muted-foreground">{im.expectedMutation || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </div></CardContent></Card>
        </TabsContent>

        <TabsContent value="journeys">
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="w-16">ID</TableHead><TableHead>Journey</TableHead><TableHead className="w-16">P</TableHead>
              <TableHead className="w-16">Steps</TableHead><TableHead className="w-20">Coverage</TableHead><TableHead className="w-16">Probe</TableHead>
            </TableRow></TableHeader><TableBody>
              {JOURNEY_MANIFESTS.map(jm => (
                <TableRow key={jm.journeyManifestId}>
                  <TableCell className="font-mono text-xs">{jm.journeyManifestId}</TableCell>
                  <TableCell><div className="font-medium text-sm">{jm.title}</div><div className="text-[10px] text-muted-foreground">{jm.actorRole} · {jm.entryRoute}</div></TableCell>
                  <TableCell><Badge variant={jm.criticality === "P0" ? "destructive" : "secondary"} className="text-[10px]">{jm.criticality}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{jm.stepRefs.length}</TableCell>
                  <TableCell><span className={`font-mono text-xs ${jm.requiredCoverage >= 90 ? "text-emerald-400" : "text-amber-400"}`}>{jm.requiredCoverage}%</span></TableCell>
                  <TableCell>{jm.runtimeProbeRequired ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </div></CardContent></Card>
        </TabsContent>

        <TabsContent value="contracts">
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="w-16">ID</TableHead><TableHead>Contract</TableHead><TableHead className="w-20">Type</TableHead>
              <TableHead className="w-24">Domain</TableHead><TableHead className="w-20">Consumers</TableHead><TableHead className="w-16">Version</TableHead>
              <TableHead className="w-20">State</TableHead>
            </TableRow></TableHeader><TableBody>
              {CONTRACT_MANIFESTS.map(cm => (
                <TableRow key={cm.contractManifestId}>
                  <TableCell className="font-mono text-xs">{cm.contractManifestId}</TableCell>
                  <TableCell><div className="font-medium text-sm">{cm.contractName}</div><div className="text-[10px] text-muted-foreground font-mono">{cm.ownerPackage}</div></TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{cm.contractType}</Badge></TableCell>
                  <TableCell className="text-xs">{cm.ownerDomain}</TableCell>
                  <TableCell className="font-mono text-xs">{cm.frontendConsumers.length}</TableCell>
                  <TableCell className="font-mono text-xs">{cm.schemaVersion}</TableCell>
                  <TableCell><Badge variant={cm.readinessState === "stable" ? "default" : "secondary"} className="text-[10px]">{cm.readinessState}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </div></CardContent></Card>
        </TabsContent>

        <TabsContent value="runtime">
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="w-16">ID</TableHead><TableHead>Feature</TableHead><TableHead className="w-28">Evidence Type</TableHead>
              <TableHead className="w-20">Env</TableHead><TableHead className="w-20">Readiness</TableHead><TableHead className="w-16">Launch</TableHead>
              <TableHead className="w-20">Frequency</TableHead>
            </TableRow></TableHeader><TableBody>
              {RUNTIME_EVIDENCE_MANIFESTS.map(re => (
                <TableRow key={re.runtimeEvidenceManifestId}>
                  <TableCell className="font-mono text-xs">{re.runtimeEvidenceManifestId}</TableCell>
                  <TableCell className="text-xs">{re.featureId}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{re.evidenceType}</Badge></TableCell>
                  <TableCell className="text-xs">{re.environmentScope}</TableCell>
                  <TableCell>{re.requiredForReadiness ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                  <TableCell>{re.requiredForLaunch ? <CheckCircle className="h-3.5 w-3.5 text-red-400" /> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{re.expectedFrequency}</TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </div></CardContent></Card>
        </TabsContent>

        <TabsContent value="readiness">
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="w-16">ID</TableHead><TableHead>Feature</TableHead><TableHead className="w-16">Manifest</TableHead>
              <TableHead className="w-16">Tests</TableHead><TableHead className="w-16">Runtime</TableHead><TableHead className="w-16">Arch</TableHead>
              <TableHead className="w-16">Journey</TableHead><TableHead className="w-20">Threshold</TableHead>
            </TableRow></TableHeader><TableBody>
              {READINESS_MANIFESTS.map(rm => (
                <TableRow key={rm.readinessManifestId}>
                  <TableCell className="font-mono text-xs">{rm.readinessManifestId}</TableCell>
                  <TableCell className="text-xs">{rm.featureId}</TableCell>
                  <TableCell className="font-mono text-xs">{rm.requiredManifestCoverage}%</TableCell>
                  <TableCell className="font-mono text-xs">{rm.requiredTestCoverage}%</TableCell>
                  <TableCell className="font-mono text-xs">{rm.requiredRuntimeEvidenceCoverage}%</TableCell>
                  <TableCell className="font-mono text-xs">{rm.requiredArchitectureCompliance}%</TableCell>
                  <TableCell className="font-mono text-xs">{rm.requiredJourneyCoverage}%</TableCell>
                  <TableCell><Badge variant={rm.launchThreshold >= 90 ? "destructive" : "default"} className="text-[10px]">{rm.launchThreshold}%</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </div></CardContent></Card>
        </TabsContent>

        <TabsContent value="launch">
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="w-16">ID</TableHead><TableHead className="w-24">Scope</TableHead><TableHead className="w-24">Scope ID</TableHead>
              <TableHead className="w-20">Readiness</TableHead><TableHead className="w-20">Journey %</TableHead><TableHead className="w-20">Interaction %</TableHead>
              <TableHead className="w-16">Override</TableHead><TableHead>Blocking Rules</TableHead>
            </TableRow></TableHeader><TableBody>
              {LAUNCH_GATE_MANIFESTS.map(lg => (
                <TableRow key={lg.launchGateManifestId}>
                  <TableCell className="font-mono text-xs">{lg.launchGateManifestId}</TableCell>
                  <TableCell className="text-xs">{lg.scopeType}</TableCell>
                  <TableCell className="font-mono text-xs">{lg.scopeId}</TableCell>
                  <TableCell className="font-mono text-xs">{lg.requiredReadinessScore}%</TableCell>
                  <TableCell className="font-mono text-xs">{lg.minimumJourneyPassRate}%</TableCell>
                  <TableCell className="font-mono text-xs">{lg.minimumInteractionPassRate}%</TableCell>
                  <TableCell>{lg.allowOverrides ? <span className="text-amber-400 text-xs">Yes</span> : <span className="text-red-400 text-xs">No</span>}</TableCell>
                  <TableCell><div className="flex flex-wrap gap-1">{lg.blockingRuleIds.map(r => <Badge key={r} variant="outline" className="text-[10px] font-mono">{r}</Badge>)}</div></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </div></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PLE05ManifestEnforcer;