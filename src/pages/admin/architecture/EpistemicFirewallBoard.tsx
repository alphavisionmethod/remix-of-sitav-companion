import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Brain, Activity, BarChart3, FileWarning } from "lucide-react";
import { EVIDENCE_GRADE_POLICIES } from "@/lib/core-services/epistemic-firewall/evidence-grader";
import { GROUNDING_RULES, getGroundingStats } from "@/lib/core-services/epistemic-firewall/tool-grounding";
import { getInvariants, getSentinelStats, getSentinelHistory } from "@/lib/core-services/epistemic-firewall/sentinel-engine";
import { CORTEX_LOOP_CONFIGS, getOutcomeLearningStats } from "@/lib/core-services/epistemic-firewall/cortex-loop";
import { getNegativeReceiptStats, getNegativeReceipts } from "@/lib/core-services/epistemic-firewall/negative-receipt";
import { getAssumptionStats } from "@/lib/core-services/epistemic-firewall/assumption-registry";
import { pipelineOrchestrator } from "@/lib/services/canonical-pipeline/pipeline-orchestrator";

function EpistemicFirewallBoard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshKey, setRefreshKey] = useState(0);
  const invariants = getInvariants();
  const grades = Object.values(EVIDENCE_GRADE_POLICIES);

  // Live runtime data
  const negReceiptStats = getNegativeReceiptStats();
  const sentinelStats = getSentinelStats();
  const groundingStats = getGroundingStats();
  const assumptionStats = getAssumptionStats();
  const outcomeStats = getOutcomeLearningStats();
  const pipelineStats = pipelineOrchestrator.getPipelineStats();
  const recentTraces = pipelineOrchestrator.getTraceLog(10);
  const recentReceipts = getNegativeReceipts({ severity: undefined }).slice(0, 10);
  const recentSentinel = getSentinelHistory(10);

  const refresh = () => setRefreshKey(k => k + 1);

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="epistemic-firewall-board">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Epistemic Firewall</h1>
            <p className="text-sm text-muted-foreground">Truth Triangle · Sentinel Engine · Cortex Loop · Tool Grounding</p>
          </div>
        </div>
        <button onClick={refresh} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ↻ Refresh
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="evidence">Evidence Grades</TabsTrigger>
          <TabsTrigger value="grounding">Tool Grounding</TabsTrigger>
          <TabsTrigger value="sentinel">Sentinel Guard</TabsTrigger>
          <TabsTrigger value="cortex">Cortex Loops</TabsTrigger>
          <TabsTrigger value="receipts">Negative Receipts</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Traces</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4" data-testid="ef-overview">
          {/* Live Runtime Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Pipeline Runs</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pipelineStats.total}</div>
                <p className="text-xs text-muted-foreground">{pipelineStats.completed} completed · {pipelineStats.failed} failed</p>
              </CardContent>
            </Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Negative Receipts</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{negReceiptStats.total}</div>
                <p className="text-xs text-muted-foreground">{negReceiptStats.last24h} in last 24h</p>
              </CardContent>
            </Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Sentinel Health</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(sentinelStats.healthyRate * 100).toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground">{sentinelStats.totalReports} checks · {sentinelStats.totalViolations} violations</p>
              </CardContent>
            </Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Grounding Pass Rate</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(groundingStats.passRate * 100).toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground">{groundingStats.totalChecks} checks · {groundingStats.blockViolations} blocks</p>
              </CardContent>
            </Card>
          </div>

          {/* Static Config Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Evidence Grades</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{grades.length}</div><p className="text-xs text-muted-foreground">A through F hierarchy</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Grounding Rules</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{GROUNDING_RULES.length}</div><p className="text-xs text-muted-foreground">Canonical tool rules</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Invariants</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{invariants.length}</div><p className="text-xs text-muted-foreground">Runtime checks active</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Assumptions Tracked</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{assumptionStats.total}</div><p className="text-xs text-muted-foreground">{assumptionStats.active} active · {assumptionStats.highImpact} high-impact</p></CardContent></Card>
          </div>

          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Eye className="h-4 w-4" />Modules Wired to Runtime</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: "Evidence Grader (Truth Triangle Gate 1)", wired: true },
                { name: "Cite-Checker (Truth Triangle Gate 2)", wired: true },
                { name: "Assumption Registry (Truth Triangle Gate 3)", wired: true },
                { name: "Negative Receipts → Pipeline + Callable + Desk", wired: true },
                { name: "Tool Grounding → ai-capability-client", wired: true },
                { name: "Sentinel Guard → Pipeline post-completion", wired: true },
                { name: "Pipeline Orchestrator → ai-capability-client", wired: true },
                { name: "Verified Outcome Learning", wired: true },
              ].map((m) => (
                <div key={m.name} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{m.name}</span>
                  <Badge variant="outline" className="ml-auto">{m.wired ? "Wired" : "Config Only"}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4" data-testid="ef-evidence">
          <Card><CardHeader><CardTitle className="text-base">Evidence Grade Hierarchy</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">
              {grades.map((g) => (
                <div key={g.grade} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Badge variant={g.allowedForHighStakes ? "default" : "secondary"} className="text-lg px-3">{g.grade}</Badge>
                  <div className="flex-1"><div className="font-medium">{g.label}</div><p className="text-sm text-muted-foreground">{g.description}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Max age: {g.maxAgeSec}s</span><span>Trust: {g.trustFactor}</span>
                      <span>{g.allowedForHighStakes ? <CheckCircle className="inline h-3 w-3 text-green-500" /> : <XCircle className="inline h-3 w-3 text-red-500" />} High-stakes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grounding" className="space-y-4" data-testid="ef-grounding">
          {/* Live grounding stats */}
          {groundingStats.totalChecks > 0 && (
            <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" />Grounding Runtime Stats</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Total Checks:</span> <span className="font-medium">{groundingStats.totalChecks}</span></div>
                  <div><span className="text-muted-foreground">Pass Rate:</span> <span className="font-medium">{(groundingStats.passRate * 100).toFixed(0)}%</span></div>
                  <div><span className="text-muted-foreground">Violations:</span> <span className="font-medium">{groundingStats.totalViolations}</span></div>
                  <div><span className="text-muted-foreground">Blocks:</span> <span className="font-medium">{groundingStats.blockViolations}</span></div>
                </div>
                {Object.keys(groundingStats.byFieldType).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(groundingStats.byFieldType).map(([type, count]) => (
                      <Badge key={type} variant="secondary">{type}: {count}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card><CardHeader><CardTitle className="text-base">Canonical Tool Grounding Rules</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">
              {GROUNDING_RULES.map((r, i) => (
                <div key={i} className="p-3 rounded-lg border space-y-1">
                  <div className="flex items-center gap-2"><Badge variant={r.blockIfUngrounded ? "destructive" : "secondary"}>{r.blockIfUngrounded ? "Block" : "Warn"}</Badge><span className="font-medium text-sm">{r.fieldType}</span></div>
                  <p className="text-sm text-muted-foreground">{r.description}</p>
                  <p className="text-xs text-muted-foreground">Required: {r.requiredSource} · Domains: {r.domains.join(", ")}</p>
                </div>
              ))}
            </div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentinel" className="space-y-4" data-testid="ef-sentinel">
          {/* Live sentinel stats */}
          {sentinelStats.totalReports > 0 && (
            <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" />Sentinel Runtime Stats</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Reports:</span> <span className="font-medium">{sentinelStats.totalReports}</span></div>
                  <div><span className="text-muted-foreground">Health Rate:</span> <span className="font-medium">{(sentinelStats.healthyRate * 100).toFixed(0)}%</span></div>
                  <div><span className="text-muted-foreground">Violations:</span> <span className="font-medium">{sentinelStats.totalViolations}</span></div>
                </div>
                {Object.keys(sentinelStats.byInvariant).length > 0 && (
                  <div className="mt-3 space-y-1">
                    {Object.entries(sentinelStats.byInvariant).map(([id, counts]) => (
                      <div key={id} className="flex items-center gap-2 text-xs">
                        <span className="font-mono">{id}</span>
                        <Badge variant="outline" className="text-green-600">✓ {counts.passed}</Badge>
                        {counts.failed > 0 && <Badge variant="destructive">✗ {counts.failed}</Badge>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Runtime Invariants ({invariants.length})</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">
              {invariants.map((inv) => (
                <div key={inv.id} className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2"><Badge variant={inv.severity === "critical" ? "destructive" : inv.severity === "block" ? "default" : "secondary"}>{inv.severity}</Badge><span className="font-mono text-xs">{inv.id}</span><span className="font-medium text-sm">{inv.name}</span></div>
                  <p className="text-sm text-muted-foreground mt-1">{inv.description}</p>
                  <p className="text-xs text-muted-foreground">Scope: {inv.scope} · Domains: {inv.domains.join(", ")}</p>
                </div>
              ))}
            </div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cortex" className="space-y-4" data-testid="ef-cortex">
          {/* Verified outcome stats */}
          {outcomeStats.total > 0 && (
            <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" />Verified Outcomes</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Total:</span> <span className="font-medium">{outcomeStats.total}</span></div>
                  <div><span className="text-muted-foreground">Accuracy:</span> <span className="font-medium">{(outcomeStats.accuracyRate * 100).toFixed(0)}%</span></div>
                  <div><span className="text-muted-foreground">Avg Δ Confidence:</span> <span className="font-medium">{outcomeStats.avgConfidenceDelta.toFixed(3)}</span></div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4" />Cortex Loop Configurations</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">
              {CORTEX_LOOP_CONFIGS.map((c) => (
                <div key={c.loopId} className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2"><Activity className="h-4 w-4" /><span className="font-medium text-sm">{c.loopId}</span><Badge variant={c.enabled ? "default" : "secondary"}>{c.enabled ? "Enabled" : "Disabled"}</Badge></div>
                  <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Domain: {c.domain}</span><span>Max iter: {c.maxIterations}</span>
                    <span>{c.requiresApproval ? "✓ Approval" : "○ No approval"}</span>
                    <span>{c.requiresProof ? "✓ Proof" : "○ No proof"}</span>
                    <span>{c.learnFromOutcomes ? "✓ Learning" : "○ No learning"}</span>
                  </div>
                </div>
              ))}
            </div></CardContent>
          </Card>
          <Card><CardHeader><CardTitle className="text-base">Cortex Loop Stages</CardTitle></CardHeader>
            <CardContent><div className="flex flex-wrap gap-2">
              {["Sense", "State Update", "Plan", "Approve", "Execute", "Prove", "Learn"].map((s, i) => (
                <div key={s} className="flex items-center gap-1"><Badge variant="outline">{i + 1}. {s}</Badge>{i < 6 && <span className="text-muted-foreground">→</span>}</div>
              ))}
            </div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-4" data-testid="ef-receipts">
          {/* Negative receipt stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Refusals</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{negReceiptStats.total}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">By Severity</CardTitle></CardHeader>
              <CardContent><div className="flex gap-2 flex-wrap">
                {Object.entries(negReceiptStats.bySeverity).map(([sev, count]) => (
                  <Badge key={sev} variant={sev === "critical" ? "destructive" : "secondary"}>{sev}: {count}</Badge>
                ))}
                {Object.keys(negReceiptStats.bySeverity).length === 0 && <span className="text-sm text-muted-foreground">No refusals yet</span>}
              </div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">By Gate Source</CardTitle></CardHeader>
              <CardContent><div className="flex gap-2 flex-wrap">
                {Object.entries(negReceiptStats.byGateSource).map(([src, count]) => (
                  <Badge key={src} variant="outline">{src}: {count}</Badge>
                ))}
                {Object.keys(negReceiptStats.byGateSource).length === 0 && <span className="text-sm text-muted-foreground">No refusals yet</span>}
              </div></CardContent></Card>
          </div>

          {/* Recent negative receipts */}
          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><FileWarning className="h-4 w-4" />Recent Negative Receipts</CardTitle></CardHeader>
            <CardContent>
              {recentReceipts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No negative receipts emitted yet. This is a good sign — all requests passing trust checks.</p>
              ) : (
                <div className="space-y-3">
                  {recentReceipts.map((r) => (
                    <div key={r.receiptId} className="p-3 rounded-lg border space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={r.severity === "critical" ? "destructive" : r.severity === "warning" ? "default" : "secondary"}>{r.severity}</Badge>
                        <span className="font-medium text-sm">{r.blockedAction}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{new Date(r.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.blockedDescription}</p>
                      <div className="flex gap-2 flex-wrap">
                        {r.refusalReasons.map(reason => (
                          <Badge key={reason} variant="outline" className="text-xs">{reason}</Badge>
                        ))}
                      </div>
                      {r.suggestedActions.length > 0 && (
                        <p className="text-xs text-muted-foreground">Suggested: {r.suggestedActions.map(a => a.action).join(", ")}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4" data-testid="ef-pipeline">
          {/* Pipeline stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Runs</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{pipelineStats.total}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Completed</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">{pipelineStats.completed}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Failed</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-red-600">{pipelineStats.failed}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Avg Duration</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{pipelineStats.avgDurationMs.toFixed(0)}ms</div></CardContent></Card>
          </div>

          {/* Recent traces */}
          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" />Recent Pipeline Traces</CardTitle></CardHeader>
            <CardContent>
              {recentTraces.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pipeline traces yet. Traces will appear when AI capabilities with registered contracts are invoked.</p>
              ) : (
                <div className="space-y-3">
                  {recentTraces.map((t) => (
                    <div key={t.pipelineId} className="p-3 rounded-lg border space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={t.status === "completed" || t.status === "caveat" ? "default" : "destructive"}>{t.status}</Badge>
                        <span className="font-medium text-sm">{t.taskType}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{t.totalDurationMs}ms</span>
                      </div>
                      <div className="flex gap-2 flex-wrap text-xs text-muted-foreground">
                        <span>Gate: {t.gateDecision ?? "n/a"}</span>
                        <span>Critique: {t.critiqueRecommendation ?? "n/a"}</span>
                        <span>Evidence: {t.evidenceGrade ?? "n/a"}</span>
                        <span>Refusals: {t.negativeReceiptCount}</span>
                        <span>Stages: {t.stages.length}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EpistemicFirewallBoard;
