// ═══════════════════════════════════════════════════════════════
// SITA OS — GOD01: God-Tier Architecture Integration Board
// Definitive integration report and governance dashboard
// ═══════════════════════════════════════════════════════════════

import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MODULE_MAPPING_MATRIX,
  INTEGRATION_DECISIONS,
  FLAGSHIP_LOOP_IMPACT,
  SECURITY_GOVERNANCE_IMPACT,
  COMPLEXITY_LEVERAGE,
  ANTI_SPRAWL_MATRIX,
  TASK_TYPE_MAPPING,
  IMPLEMENTATION_PHASES,
  CONTRACT_MAP,
  ELEVATION_CANDIDATES,
  MISSING_TO_SAFE_INTEGRATION,
  computeIntegrationScore,
  type IntegrationAction,
  type SprawlRisk,
} from "@/lib/core-services/architecture/god-tier-integration-engine";
import { Brain, Shield, Layers, Target, AlertTriangle, CheckCircle, XCircle, Clock, ArrowRight, Zap, TrendingDown } from "lucide-react";

const actionColors: Record<IntegrationAction, string> = {
  integrate_now: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  elevate: "bg-primary/10 text-primary border-primary/20",
  consolidate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  defer: "bg-muted text-muted-foreground border-border",
  reject: "bg-destructive/10 text-destructive border-destructive/20",
  rename: "bg-secondary text-secondary-foreground border-border",
};

const sprawlColors: Record<SprawlRisk, string> = {
  reduces: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  neutral: "bg-muted text-muted-foreground border-border",
  increases: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  dangerous: "bg-destructive/10 text-destructive border-destructive/20",
};

const phaseColors: Record<string, string> = {
  A: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  B: "bg-primary/10 text-primary border-primary/20",
  C: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  D: "bg-muted text-muted-foreground border-border",
};

export default function GodTierIntegrationBoard() {
  const score = computeIntegrationScore();

  return (
    <div className="space-y-6 p-6" data-testid="god-tier-integration-board">
      <AdminPageHeader
        icon={Brain}
        title="God-Tier Architecture Integration"
        subtitle="Definitive integration report — what to integrate, elevate, consolidate, defer, or reject"
        accent="primary"
      />

      {/* Executive Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" data-testid="god-tier-summary">
        <MetricCard label="Total Concepts" value={score.totalModules} />
        <MetricCard label="Ready Now (Phase A)" value={score.readyNow} accent="emerald" />
        <MetricCard label="Needs Work (Phase B)" value={score.needsWork} accent="blue" />
        <MetricCard label="Deferred (C/D)" value={score.deferred} accent="amber" />
        <MetricCard label="Rejected" value={score.rejected} accent="red" />
        <MetricCard label="Net Sprawl Delta" value={score.netSprawlDelta} accent={score.netSprawlDelta <= 0 ? "emerald" : "red"} />
      </div>

      {/* Module Mapping Matrix */}
      <Card data-testid="module-mapping-matrix">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-primary" /> Module Mapping Matrix</CardTitle>
          <CardDescription>All 9 proposed God-Tier modules mapped to current SITA equivalents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MODULE_MAPPING_MATRIX.map((m) => (
              <div key={m.proposedModule} className="rounded-lg border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">{m.proposedModule}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={actionColors[m.action]}>{m.action.replace(/_/g, " ")}</Badge>
                    <Badge variant="outline">Value: {m.strategicValue}</Badge>
                    <Badge className={sprawlColors[m.sprawlRisk]}>Sprawl: {m.sprawlRisk}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground"><ArrowRight className="inline h-3 w-3 mr-1" />{m.currentEquivalent}</p>
                <p className="text-xs text-muted-foreground">{m.rationale}</p>
                <p className="text-xs font-medium text-primary">Next: {m.nextStep}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integrate / Defer / Reject Decisions */}
      <Card data-testid="integration-decisions">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Integration Decisions</CardTitle>
          <CardDescription>Every concept classified with phase and rationale</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {INTEGRATION_DECISIONS.map((d) => (
              <div key={d.concept} className="flex items-center justify-between gap-2 rounded-lg border bg-card px-4 py-3 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm font-medium text-foreground">{d.concept}</p>
                  <p className="text-xs text-muted-foreground">{d.rationale}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={actionColors[d.decision]}>{d.decision.replace(/_/g, " ")}</Badge>
                  <Badge className={phaseColors[d.phase]}>Phase {d.phase}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Flagship Loop Impact */}
      <Card data-testid="flagship-loop-impact">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> Flagship Loop Impact</CardTitle>
          <CardDescription>How God-Tier components map to the 5 flagship loops</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {FLAGSHIP_LOOP_IMPACT.map((f) => (
              <div key={f.loopNumber} className="rounded-lg border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Loop {f.loopNumber}: {f.loop}</span>
                  <Badge variant={f.priority === "critical" ? "destructive" : "outline"}>{f.priority}</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {f.godTierComponents.map((c) => (
                    <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{f.currentState}</p>
                <p className="text-xs text-emerald-400">{f.integrationBenefit}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security / Governance Impact */}
      <Card data-testid="security-governance-impact">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Security & Governance Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 px-2">Module</th>
                  <th className="text-center py-2 px-2">Safety</th>
                  <th className="text-center py-2 px-2">Traceability</th>
                  <th className="text-center py-2 px-2">New Surface</th>
                  <th className="text-center py-2 px-2">Leak Risk</th>
                  <th className="text-center py-2 px-2">Blast Radius</th>
                </tr>
              </thead>
              <tbody>
                {SECURITY_GOVERNANCE_IMPACT.map((s) => (
                  <tr key={s.module} className="border-b border-border/50">
                    <td className="py-2 px-2 font-medium text-foreground">{s.module}</td>
                    <td className="text-center py-2 px-2">{s.improvesSafety ? <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto" /> : <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                    <td className="text-center py-2 px-2">{s.improvesTraceability ? <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto" /> : <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                    <td className="text-center py-2 px-2">{s.createsNewSurface ? <AlertTriangle className="h-4 w-4 text-amber-400 mx-auto" /> : <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto" />}</td>
                    <td className="text-center py-2 px-2"><Badge variant="outline" className="text-xs">{s.leakageRisk}</Badge></td>
                    <td className="text-center py-2 px-2"><Badge className={s.blastRadiusChange === "reduces" ? "bg-emerald-500/10 text-emerald-400" : s.blastRadiusChange === "increases" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}>{s.blastRadiusChange}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Complexity vs Leverage */}
      <Card data-testid="complexity-leverage">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingDown className="h-5 w-5 text-primary" /> Complexity vs Leverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {COMPLEXITY_LEVERAGE.sort((a, b) => b.leverageScore - a.leverageScore).map((c) => (
              <div key={c.module} className="flex items-center justify-between gap-2 rounded-lg border bg-card px-4 py-3 flex-wrap">
                <span className="text-sm font-medium text-foreground flex-1 min-w-[180px]">{c.module}</span>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-muted-foreground">{c.effortWeeks}w effort</div>
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div className="bg-primary rounded-full h-2" style={{ width: `${c.leverageScore * 10}%` }} />
                  </div>
                  <span className="text-xs font-mono text-foreground w-6">{c.leverageScore}</span>
                  <Badge variant="outline" className="text-xs">{c.riskLevel}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Anti-Sprawl Risk */}
      <Card data-testid="anti-sprawl-matrix">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-400" /> Anti-Sprawl Risk Assessment</CardTitle>
          <CardDescription>Net service delta: {score.netSprawlDelta} — {score.netSprawlDelta <= 0 ? "architecture improves" : "sprawl risk detected"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ANTI_SPRAWL_MATRIX.map((a) => (
              <div key={a.concept} className="flex items-center justify-between gap-2 rounded-lg border bg-card px-4 py-3 flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <p className="text-sm font-medium text-foreground">{a.concept}</p>
                  <p className="text-xs text-muted-foreground">{a.proposedChange}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={sprawlColors[a.sprawlEffect]}>{a.sprawlEffect}</Badge>
                  <span className="text-xs font-mono text-foreground">{a.netServiceDelta >= 0 ? "+" : ""}{a.netServiceDelta}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Type Mapping */}
      <Card data-testid="task-type-mapping">
        <CardHeader>
          <CardTitle>Task Type Mapping</CardTitle>
          <CardDescription>Maturity classification for each proposed task routing type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {TASK_TYPE_MAPPING.map((t) => (
              <div key={t.taskType} className="rounded-lg border bg-card p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground">{t.taskType}</span>
                  <Badge className={t.maturity === "immediate" ? "bg-emerald-500/10 text-emerald-400" : t.maturity === "near_term" ? "bg-primary/10 text-primary" : t.maturity === "avoid" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}>{t.maturity.replace(/_/g, " ")}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">System: {t.currentSystem || "None"}</p>
                <p className="text-xs text-muted-foreground">Value: {t.productValue}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phased Implementation */}
      <Card data-testid="implementation-phases">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Phased Implementation Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {IMPLEMENTATION_PHASES.map((p) => (
              <div key={p.phase} className="rounded-lg border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={phaseColors[p.phase]}>Phase {p.phase}</Badge>
                    <span className="font-semibold text-foreground">{p.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{p.timeframe}</span>
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-medium text-emerald-400 mb-1">Integrate</p>
                    <div className="flex flex-wrap gap-1">
                      {p.modulesToIntegrate.map((m) => <Badge key={m} variant="outline" className="text-xs">{m}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Defer</p>
                    <div className="flex flex-wrap gap-1">
                      {p.whatToDefer.map((m) => <Badge key={m} variant="outline" className="text-xs opacity-50">{m}</Badge>)}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{p.expectedValue}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contract Map */}
      <Card data-testid="contract-map">
        <CardHeader>
          <CardTitle>Contract Map Analysis</CardTitle>
          <CardDescription>Existing vs needed contracts — {CONTRACT_MAP.filter(c => c.exists).length}/{CONTRACT_MAP.length} already exist</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {CONTRACT_MAP.map((c) => (
              <div key={c.contract} className="flex items-center justify-between gap-2 rounded-lg border bg-card px-4 py-3 flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <p className="text-sm font-medium text-foreground">{c.contract}</p>
                  <p className="text-xs text-muted-foreground">{c.exists ? c.currentLocation : "Not yet created"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {c.exists ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-amber-400" />}
                  <Badge variant="outline" className="text-xs">{c.sprawlRisk}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Elevation Candidates */}
      <Card data-testid="elevation-candidates">
        <CardHeader>
          <CardTitle>What Already Exists — Elevate, Don't Rebuild</CardTitle>
          <CardDescription>{ELEVATION_CANDIDATES.length} current systems mapped to God-Tier roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ELEVATION_CANDIDATES.map((e) => (
              <div key={e.system} className="rounded-lg border bg-card px-4 py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium font-mono text-foreground">{e.system}</span>
                  <Badge variant="outline">{e.action.replace(/_/g, " ")}</Badge>
                </div>
                <p className="text-xs text-primary">→ {e.godTierRole}</p>
                <p className="text-xs text-muted-foreground">{e.details}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Missing to Safe Integration */}
      <Card data-testid="missing-to-safe">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-400" /> Missing to Safe Integration</CardTitle>
          <CardDescription>{MISSING_TO_SAFE_INTEGRATION.filter(m => m.severity === "critical").length} critical gaps remaining</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {MISSING_TO_SAFE_INTEGRATION.sort((a, b) => {
              const sev = { critical: 0, high: 1, medium: 2, low: 3 };
              return sev[a.severity] - sev[b.severity];
            }).map((m) => (
              <div key={m.gap} className="flex items-center justify-between gap-2 rounded-lg border bg-card px-4 py-3 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm font-medium text-foreground">{m.gap}</p>
                  <p className="text-xs text-muted-foreground">{m.resolution}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={m.severity === "critical" ? "destructive" : "outline"}>{m.severity}</Badge>
                  <Badge className={phaseColors[m.blocksPhase]}>Phase {m.blocksPhase}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  const colorClass = accent === "emerald" ? "text-emerald-400" : accent === "blue" ? "text-primary" : accent === "amber" ? "text-amber-400" : accent === "red" ? "text-destructive" : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}
