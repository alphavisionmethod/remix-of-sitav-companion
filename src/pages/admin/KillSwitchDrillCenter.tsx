import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  KILL_SWITCH_DRILL_INVENTORY,
  simulateDryRunDrill,
  type DrillResult,
  type KillSwitchDrillDefinition,
} from "@/lib/control-plane/kill-switch-drill-runner";
import { buildDrillSchedule, type DrillScheduleEntry } from "@/lib/control-plane/kill-switch-drill-calendar";
import {
  Shield, Play, AlertTriangle, CheckCircle2, Clock, XCircle,
  RotateCcw, FileText, ChevronDown, ChevronUp, RefreshCw, ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────

interface DbDrillResult {
  id: string;
  switch_id: string;
  drill_type: string;
  started_at: string;
  completed_at: string | null;
  success: boolean | null;
  time_to_disable_ms: number | null;
  failure_notes: string | null;
  rollback_verified: boolean | null;
  operator_id: string | null;
  created_at: string | null;
}

interface StepSignal {
  label: string;
  passed: boolean;
  detail: string;
}

// ── Helpers ────────────────────────────────────────────────────

const BLAST_COLORS: Record<string, string> = {
  low: "bg-green-500/20 text-green-300 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
};

function buildStepSignals(
  def: KillSwitchDrillDefinition,
  result: DbDrillResult | DrillResult | null,
): StepSignal[] {
  if (!result) {
    return def.successCriteria.map((c) => ({
      label: c,
      passed: false,
      detail: "Not yet executed",
    }));
  }

  const isDb = "switch_id" in result;
  const success = isDb ? (result as DbDrillResult).success : (result as DrillResult).success;
  const timeMs = isDb
    ? (result as DbDrillResult).time_to_disable_ms
    : (result as DrillResult).timeToDisableMs;
  const rollback = isDb
    ? (result as DbDrillResult).rollback_verified
    : (result as DrillResult).rollbackVerified;

  const steps: StepSignal[] = [
    {
      label: "Drill initiated",
      passed: true,
      detail: `Started at ${isDb ? (result as DbDrillResult).started_at : (result as DrillResult).startedAt}`,
    },
    {
      label: `Disable within target (${def.timeToDisableMs}ms)`,
      passed: (timeMs ?? Infinity) <= def.timeToDisableMs,
      detail: timeMs != null ? `Actual: ${timeMs}ms` : "No timing data",
    },
  ];

  def.successCriteria.forEach((criterion) => {
    steps.push({
      label: criterion,
      passed: !!success,
      detail: success ? "Verified" : "Failed or not verified",
    });
  });

  steps.push({
    label: "Rollback verified",
    passed: !!rollback,
    detail: rollback ? "Confirmed" : "Not verified",
  });

  steps.push({
    label: "Drill completed",
    passed: !!(isDb ? (result as DbDrillResult).completed_at : (result as DrillResult).completedAt),
    detail: success ? "All criteria passed" : (isDb ? (result as DbDrillResult).failure_notes : (result as DrillResult).failureNotes) ?? "Failure",
  });

  return steps;
}

function artifactLinks(switchId: string): { label: string; path: string }[] {
  return [
    { label: "Mutation Traceability Report", path: "/generated/edge-function-mutation-traceability.json" },
    { label: "RLS Crossref Report", path: "/generated/edge-function-rls-mutation-crossref.json" },
    { label: "Feature Registry Audit", path: "/generated/feature-registry-audit.json" },
    { label: "Route-Page Consistency", path: "/generated/route-page-consistency-audit.json" },
  ];
}

// ── Component ──────────────────────────────────────────────────

export default function KillSwitchDrillCenter() {
  const { toast } = useToast();
  const schedule = buildDrillSchedule();
  const overdue = schedule.filter((s) => s.isOverdue).length;

  const [sessionResults, setSessionResults] = useState<Record<string, DrillResult>>({});
  const [dbResults, setDbResults] = useState<DbDrillResult[]>([]);
  const [expandedSwitch, setExpandedSwitch] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDbResults = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("kill_switch_drill_results")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(200);
    if (data) setDbResults(data as DbDrillResult[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDbResults();
  }, [fetchDbResults]);

  const runDryDrill = (switchId: string) => {
    const result = simulateDryRunDrill(switchId, "operator-current");
    setSessionResults((prev) => ({ ...prev, [switchId]: result }));
    toast({
      title: "Dry-run drill complete",
      description: `${switchId}: ${result.timeToDisableMs}ms — ${result.success ? "PASS" : "FAIL"}`,
    });
  };

  const latestDbResult = (switchId: string): DbDrillResult | undefined =>
    dbResults.find((r) => r.switch_id === switchId);

  const passCount = KILL_SWITCH_DRILL_INVENTORY.filter((d) => {
    const db = latestDbResult(d.switchId);
    const session = sessionResults[d.switchId];
    return db?.success || session?.success;
  }).length;

  const failCount = KILL_SWITCH_DRILL_INVENTORY.filter((d) => {
    const db = latestDbResult(d.switchId);
    return db && db.success === false;
  }).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Kill Switch Drill Center</h1>
            <p className="text-sm text-muted-foreground">
              Live drill status, step-by-step verification, and evidence artifacts
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDbResults} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-foreground">{KILL_SWITCH_DRILL_INVENTORY.length}</div>
            <div className="text-xs text-muted-foreground">Registered</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-green-400">{passCount}</div>
            <div className="text-xs text-muted-foreground">Passed</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="pt-4 text-center">
            <div className={`text-3xl font-bold ${failCount > 0 ? "text-red-400" : "text-muted-foreground"}`}>{failCount}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="pt-4 text-center">
            <div className={`text-3xl font-bold ${overdue > 0 ? "text-red-400" : "text-green-400"}`}>{overdue}</div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-foreground">{dbResults.length}</div>
            <div className="text-xs text-muted-foreground">Historical Runs</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="live" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="live">Live Drill Board</TabsTrigger>
          <TabsTrigger value="history">Run History</TabsTrigger>
          <TabsTrigger value="artifacts">Evidence Artifacts</TabsTrigger>
        </TabsList>

        {/* ── Live Board ─────────────────────────────────────── */}
        <TabsContent value="live" className="space-y-3">
          {KILL_SWITCH_DRILL_INVENTORY.map((def) => {
            const sched = schedule.find((s) => s.switchId === def.switchId);
            const dbRes = latestDbResult(def.switchId);
            const sessionRes = sessionResults[def.switchId];
            const activeResult: DbDrillResult | DrillResult | null = sessionRes ?? dbRes ?? null;
            const isExpanded = expandedSwitch === def.switchId;
            const steps = buildStepSignals(def, activeResult);
            const allPassed = steps.every((s) => s.passed);
            const anyFailed = steps.some((s) => !s.passed) && activeResult != null;

            return (
              <Card key={def.switchId} className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {allPassed && activeResult ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                      ) : anyFailed ? (
                        <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                      <CardTitle className="text-base text-foreground">{def.displayName}</CardTitle>
                      <Badge variant="outline" className={BLAST_COLORS[def.blastRadius]}>
                        {def.blastRadius} blast
                      </Badge>
                      {sched?.isOverdue && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />Overdue
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedSwitch(isExpanded ? null : def.switchId)}
                        className="text-xs"
                      >
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => runDryDrill(def.switchId)} className="text-xs">
                        <Play className="h-3 w-3 mr-1" />Dry Run
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  <p className="text-xs text-muted-foreground">{def.description}</p>

                  {/* Step-by-step signal strip */}
                  <div className="flex flex-wrap gap-1">
                    {steps.map((step, i) => (
                      <span
                        key={i}
                        title={`${step.label}: ${step.detail}`}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          step.passed
                            ? "bg-green-500/10 text-green-400 border-green-500/30"
                            : activeResult
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : "bg-muted/30 text-muted-foreground border-border/30"
                        }`}
                      >
                        {step.passed ? (
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        ) : activeResult ? (
                          <XCircle className="h-2.5 w-2.5" />
                        ) : (
                          <Clock className="h-2.5 w-2.5" />
                        )}
                        Step {i + 1}
                      </span>
                    ))}
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="space-y-3 pt-2 border-t border-border/30">
                      {/* Step detail table */}
                      <div className="space-y-1">
                        {steps.map((step, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <div className="w-5 shrink-0 pt-0.5">
                              {step.passed ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                              ) : activeResult ? (
                                <XCircle className="h-3.5 w-3.5 text-red-400" />
                              ) : (
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <span className="text-foreground font-medium">{step.label}</span>
                              <span className="text-muted-foreground ml-2">— {step.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Metadata grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div><span className="text-muted-foreground">Scope:</span> <span className="text-foreground">{def.scope}</span></div>
                        <div><span className="text-muted-foreground">Target:</span> <span className="text-foreground">{def.timeToDisableMs}ms</span></div>
                        <div><span className="text-muted-foreground">Trigger:</span> <span className="text-foreground">{def.triggerMethod}</span></div>
                        <div><span className="text-muted-foreground">Cadence:</span> <span className="text-foreground">{sched?.cadence ?? "quarterly"}</span></div>
                      </div>

                      {/* Rollback & escalation */}
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1">
                          <RotateCcw className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Rollback:</span>
                          <span className="text-foreground">{def.rollbackPath}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Escalation:</span>
                          <span className="text-foreground">{def.failureEscalation}</span>
                        </div>
                      </div>

                      {/* Evidence links */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {artifactLinks(def.switchId).map((link) => (
                          <a
                            key={link.path}
                            href={link.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <FileText className="h-2.5 w-2.5" />
                            {link.label}
                            <ExternalLink className="h-2 w-2" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* ── History Tab ────────────────────────────────────── */}
        <TabsContent value="history" className="space-y-2">
          {dbResults.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                No historical drill results found. Run a drill to see results here.
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <table className="w-full text-xs">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">Switch</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">Type</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">Result</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">Time</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">Rollback</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">Started</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {dbResults.map((r) => (
                    <tr key={r.id} className="border-t border-border/30 hover:bg-muted/10">
                      <td className="px-3 py-2 text-foreground font-mono">{r.switch_id}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="text-[10px]">{r.drill_type}</Badge>
                      </td>
                      <td className="px-3 py-2">
                        {r.success === true ? (
                          <span className="flex items-center gap-1 text-green-400"><CheckCircle2 className="h-3 w-3" />Pass</span>
                        ) : r.success === false ? (
                          <span className="flex items-center gap-1 text-red-400"><XCircle className="h-3 w-3" />Fail</span>
                        ) : (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-foreground">{r.time_to_disable_ms != null ? `${r.time_to_disable_ms}ms` : "—"}</td>
                      <td className="px-3 py-2">
                        {r.rollback_verified ? (
                          <CheckCircle2 className="h-3 w-3 text-green-400" />
                        ) : (
                          <XCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{new Date(r.started_at).toLocaleString()}</td>
                      <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate">{r.failure_notes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* ── Artifacts Tab ──────────────────────────────────── */}
        <TabsContent value="artifacts" className="space-y-3">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Generated Evidence Artifacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Edge Function Mutation Traceability", path: "generated/edge-function-mutation-traceability.json", desc: "Tracks every DB write across edge functions with allowlist coverage" },
                { label: "RLS Mutation Crossref", path: "generated/edge-function-rls-mutation-crossref.json", desc: "Op-level RLS coverage matrix per table and function" },
                { label: "Feature Registry Audit", path: "generated/feature-registry-audit.json", desc: "Complete feature ownership, route, and proof surface audit" },
                { label: "Route-Page Consistency", path: "generated/route-page-consistency-audit.json", desc: "Route intent → page component → feature mapping validation" },
              ].map((artifact) => (
                <div
                  key={artifact.path}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30"
                >
                  <div>
                    <div className="text-sm font-medium text-foreground">{artifact.label}</div>
                    <div className="text-xs text-muted-foreground">{artifact.desc}</div>
                  </div>
                  <a
                    href={`/${artifact.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <FileText className="h-3 w-3" />
                    View
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}