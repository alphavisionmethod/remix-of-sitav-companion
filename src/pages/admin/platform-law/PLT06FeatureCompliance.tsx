import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Target, CheckCircle, XCircle, FileText, Zap, Shield, Waypoints, Users, AlertTriangle, ArrowRight
} from "lucide-react";
import {
  FEATURE_MANIFESTS, INTERACTION_MANIFESTS, JOURNEY_MANIFESTS, CONTRACT_MANIFESTS,
  RUNTIME_EVIDENCE_MANIFESTS, READINESS_MANIFESTS, VALIDATION_VIOLATIONS, DRIFT_RECORDS,
  OWNERSHIP_REGISTRY,
  getFeatureComplianceScore, getInteractionsByFeature, getJourneysByFeature,
  getRuntimeEvidenceByFeature, getReadinessForFeature,
  type FeatureManifestRecord
} from "@/lib/platform-law/platform-law-registry";

const PLT06FeatureCompliance = () => {
  const [selected, setSelected] = useState<FeatureManifestRecord | null>(null);

  const featureScores = FEATURE_MANIFESTS.map(f => ({
    feature: f,
    compliance: getFeatureComplianceScore(f.featureId),
  })).sort((a, b) => a.compliance.score - b.compliance.score);

  const avgScore = Math.round(featureScores.reduce((s, f) => s + f.compliance.score, 0) / featureScores.length);
  const fullCompliant = featureScores.filter(f => f.compliance.score >= 90).length;
  const critical = featureScores.filter(f => f.compliance.score < 50).length;

  const complianceDetail = selected ? getFeatureComplianceScore(selected.featureId) : null;
  const interactions = selected ? getInteractionsByFeature(selected.featureId) : [];
  const journeys = selected ? getJourneysByFeature(selected.featureId) : [];
  const runtimeEvidence = selected ? getRuntimeEvidenceByFeature(selected.featureId) : [];
  const readiness = selected ? getReadinessForFeature(selected.featureId) : null;
  const violations = selected ? VALIDATION_VIOLATIONS.filter(v => v.featureId === selected.featureId && v.status === "open") : [];
  const drift = selected ? DRIFT_RECORDS.filter(d => d.scopeId === selected.featureId && !d.resolvedAt) : [];
  const ownership = selected ? OWNERSHIP_REGISTRY.find(o => o.area.toLowerCase().includes(selected.domain)) : null;

  const CheckItem = ({ label, passed }: { label: string; passed: boolean }) => (
    <div className={`flex items-center gap-2 p-2 rounded text-xs ${passed ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
      {passed ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {label}
    </div>
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Target className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Feature Compliance Detail</h1>
          <p className="text-sm text-muted-foreground">{FEATURE_MANIFESTS.length} features · {avgScore}% avg compliance · {fullCompliant} fully compliant · {critical} critical</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Features", value: FEATURE_MANIFESTS.length, color: "text-blue-400" },
          { label: "Avg Score", value: `${avgScore}%`, color: avgScore >= 70 ? "text-emerald-400" : "text-amber-400" },
          { label: "Fully Compliant", value: fullCompliant, color: "text-emerald-400" },
          { label: "Critical", value: critical, color: critical > 0 ? "text-red-400" : "text-emerald-400" },
        ].map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Feature Table */}
      <Card>
        <CardContent className="p-0"><div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Feature</TableHead>
              <TableHead className="w-20">Domain</TableHead>
              <TableHead className="w-16">P</TableHead>
              <TableHead className="w-20">Score</TableHead>
              <TableHead className="w-12">Man</TableHead>
              <TableHead className="w-12">Int</TableHead>
              <TableHead className="w-12">Jrn</TableHead>
              <TableHead className="w-12">Con</TableHead>
              <TableHead className="w-12">Rt</TableHead>
              <TableHead className="w-12">Rdy</TableHead>
              <TableHead className="w-16">Viol</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {featureScores.map(({ feature: f, compliance: c }) => (
                <TableRow key={f.featureManifestId} className={`cursor-pointer hover:bg-muted/30 ${c.score < 50 ? "bg-red-500/5" : ""}`} onClick={() => setSelected(f)}>
                  <TableCell className="font-mono text-xs">{f.featureManifestId}</TableCell>
                  <TableCell><div className="font-medium text-sm">{f.canonicalName}</div><div className="text-[10px] text-muted-foreground">{f.featureId}</div></TableCell>
                  <TableCell className="text-xs">{f.domain}</TableCell>
                  <TableCell><Badge variant={f.criticality === "P0" ? "destructive" : "secondary"} className="text-[10px]">{f.criticality}</Badge></TableCell>
                  <TableCell><span className={`font-mono text-sm font-bold ${c.score >= 80 ? "text-emerald-400" : c.score >= 50 ? "text-amber-400" : "text-red-400"}`}>{c.score}%</span></TableCell>
                  <TableCell>{c.hasManifest ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-red-400" />}</TableCell>
                  <TableCell>{c.hasInteractions ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-red-400" />}</TableCell>
                  <TableCell>{c.hasJourneys ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-red-400" />}</TableCell>
                  <TableCell>{c.hasContracts ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-red-400" />}</TableCell>
                  <TableCell>{c.hasRuntimeEvidence ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-red-400" />}</TableCell>
                  <TableCell>{c.hasReadiness ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-red-400" />}</TableCell>
                  <TableCell>{c.violations > 0 ? <span className="text-red-400 font-mono text-xs">{c.violations}</span> : <CheckCircle className="h-3 w-3 text-emerald-400" />}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div></CardContent>
      </Card>

      {/* Feature Detail Drawer */}
      {selected && complianceDetail && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3"><div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4" /> {selected.canonicalName} — Compliance Detail</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>✕</Button>
          </div></CardHeader>
          <CardContent className="space-y-4 text-sm">
            {/* Score Hero */}
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className={`text-3xl font-bold ${complianceDetail.score >= 80 ? "text-emerald-400" : complianceDetail.score >= 50 ? "text-amber-400" : "text-red-400"}`}>{complianceDetail.score}%</div>
              <div className="text-xs text-muted-foreground">Feature Compliance Score</div>
            </div>

            {/* Manifest Checklist */}
            <div>
              <span className="text-muted-foreground text-xs font-medium">Compliance Checklist</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                <CheckItem label="Feature Manifest" passed={complianceDetail.hasManifest} />
                <CheckItem label="Interactions" passed={complianceDetail.hasInteractions} />
                <CheckItem label="Journeys" passed={complianceDetail.hasJourneys} />
                <CheckItem label="Contracts" passed={complianceDetail.hasContracts} />
                <CheckItem label="Runtime Evidence" passed={complianceDetail.hasRuntimeEvidence} />
                <CheckItem label="Readiness" passed={complianceDetail.hasReadiness} />
              </div>
            </div>

            {/* Feature metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><span className="text-muted-foreground text-xs">Domain</span><div>{selected.domain}</div></div>
              <div><span className="text-muted-foreground text-xs">Owner</span><div>{selected.owner}</div></div>
              <div><span className="text-muted-foreground text-xs">Criticality</span><div><Badge variant={selected.criticality === "P0" ? "destructive" : "secondary"}>{selected.criticality}</Badge></div></div>
              <div><span className="text-muted-foreground text-xs">Status</span><div>{selected.status}</div></div>
            </div>

            {/* Routes / Shell / Components */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Routes", refs: selected.routeRefs },
                { label: "Shell Mappings", refs: selected.shellRefs },
                { label: "Components", refs: selected.componentRefs },
              ].map(r => (
                <div key={r.label}><span className="text-muted-foreground text-xs">{r.label} ({r.refs.length})</span>
                  <div className="flex flex-wrap gap-1 mt-1">{r.refs.map(ref => <Badge key={ref} variant="outline" className="text-[10px] font-mono">{ref}</Badge>)}</div>
                </div>
              ))}
            </div>

            {/* Interactions */}
            {interactions.length > 0 && (
              <div>
                <span className="text-muted-foreground text-xs font-medium">Interactions ({interactions.length})</span>
                <div className="space-y-1 mt-1">
                  {interactions.map(i => (
                    <div key={i.interactionManifestId} className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant={i.criticality === "P0" ? "destructive" : "secondary"} className="text-[10px]">{i.criticality}</Badge>
                        <span className="font-mono">{i.interactionId}</span>
                      </div>
                      <span className="text-muted-foreground">{i.elementType} · {i.component}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Journeys */}
            {journeys.length > 0 && (
              <div>
                <span className="text-muted-foreground text-xs font-medium">Journeys ({journeys.length})</span>
                <div className="space-y-1 mt-1">
                  {journeys.map(j => (
                    <div key={j.journeyManifestId} className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant={j.criticality === "P0" ? "destructive" : "secondary"} className="text-[10px]">{j.criticality}</Badge>
                        <span>{j.title}</span>
                      </div>
                      <span className="text-muted-foreground">{j.stepRefs.length} steps · {j.requiredCoverage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Runtime Evidence */}
            {runtimeEvidence.length > 0 && (
              <div>
                <span className="text-muted-foreground text-xs font-medium">Runtime Evidence ({runtimeEvidence.length})</span>
                <div className="space-y-1 mt-1">
                  {runtimeEvidence.map(r => (
                    <div key={r.runtimeEvidenceManifestId} className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs">
                      <Badge variant="outline" className="text-[10px]">{r.evidenceType}</Badge>
                      <div className="flex items-center gap-2">
                        {r.requiredForLaunch && <Badge variant="destructive" className="text-[10px]">Launch</Badge>}
                        {r.requiredForReadiness && <Badge variant="secondary" className="text-[10px]">Readiness</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Readiness */}
            {readiness && (
              <div>
                <span className="text-muted-foreground text-xs font-medium">Readiness Criteria</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                  {[
                    { label: "Manifest", val: readiness.requiredManifestCoverage },
                    { label: "Tests", val: readiness.requiredTestCoverage },
                    { label: "Runtime", val: readiness.requiredRuntimeEvidenceCoverage },
                    { label: "Architecture", val: readiness.requiredArchitectureCompliance },
                    { label: "Interactions", val: readiness.requiredInteractionCoverage },
                    { label: "Journeys", val: readiness.requiredJourneyCoverage },
                    { label: "Proof", val: readiness.requiredProofCompliance },
                    { label: "Launch Threshold", val: readiness.launchThreshold },
                  ].map(r => (
                    <div key={r.label} className="p-2 rounded bg-muted/30 text-center">
                      <div className="font-mono text-xs font-bold">{r.val}%</div>
                      <div className="text-[10px] text-muted-foreground">{r.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Violations */}
            {violations.length > 0 && (
              <div>
                <span className="text-red-400 text-xs font-medium">Open Violations ({violations.length})</span>
                <div className="space-y-1 mt-1">
                  {violations.map(v => (
                    <div key={v.violationId} className="p-2 rounded bg-red-500/10 border border-red-500/20 text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-[10px]">{v.severity}</Badge>
                        <span className="font-mono">{v.ruleId}</span>
                      </div>
                      <p className="text-muted-foreground mt-1">{v.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drift */}
            {drift.length > 0 && (
              <div>
                <span className="text-amber-400 text-xs font-medium">Active Drift ({drift.length})</span>
                <div className="space-y-1 mt-1">
                  {drift.map(d => (
                    <div key={d.driftEnforcementId} className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{d.driftType}</Badge>
                        {d.blocking && <Badge variant="destructive" className="text-[10px]">BLOCKING</Badge>}
                      </div>
                      <p className="text-muted-foreground mt-1">{d.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ownership */}
            {ownership && (
              <div className="p-3 rounded border border-border/50">
                <span className="text-muted-foreground text-xs font-medium">Ownership</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                  <div><span className="text-muted-foreground text-[10px]">Primary</span><div className="text-xs">{ownership.owner}</div></div>
                  <div><span className="text-muted-foreground text-[10px]">Secondary</span><div className="text-xs">{ownership.secondaryOwner || "—"}</div></div>
                  <div><span className="text-muted-foreground text-[10px]">Team</span><div className="text-xs">{ownership.team}</div></div>
                  <div><span className="text-muted-foreground text-[10px]">Escalation</span><div className="text-xs">{ownership.escalationPath}</div></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PLT06FeatureCompliance;
