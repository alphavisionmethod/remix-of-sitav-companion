// ═══════════════════════════════════════════════════════
// SITA OS — CJ03: Journey Detail View
// + root cause layer, remediation notes
// ═══════════════════════════════════════════════════════

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCustomerJourneys, useCustomerJourneyRuns } from "@/lib/customer-journey/journey-hooks";
import { useStepResults, useEvidenceAssets } from "@/lib/customer-journey/journey-evidence-hooks";
import { JOURNEY_STATUS_CONFIG, LAUNCH_IMPACT_CONFIG } from "@/lib/customer-journey/journey-registry";
import { ListChecks, Loader2, ChevronDown, ChevronRight, Image, FileText, AlertCircle, Layers, Wrench } from "lucide-react";
import { useState } from "react";
import { useDataMode } from "@/contexts/DataModeContext";



function StepResultsPanel({ runId }: { runId: string }) {
  const { data: stepResults } = useStepResults(runId);
  const { data: evidence } = useEvidenceAssets(runId);

  if (!stepResults?.length) return <p className="text-xs text-muted-foreground italic">No step-level results recorded.</p>;

  const statusIcon: Record<string, string> = { pass: "✅", fail: "❌", partial: "⚠️", skipped: "⏭️" };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Step Results</h4>
      <div className="space-y-1">
        {stepResults.map((s: any) => (
          <div key={s.id} className={`flex items-start gap-3 text-sm p-2 rounded ${s.status === "fail" ? "bg-destructive/5 border border-destructive/20" : "bg-muted/30"}`}>
            <span className="text-xs w-6">{statusIcon[s.status] || "—"}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">Step {s.step_order}</span>
                {s.duration_ms != null && <span className="text-[10px] text-muted-foreground">{s.duration_ms}ms</span>}
              </div>
              {s.actual_behavior && <p className="text-xs text-muted-foreground">{s.actual_behavior}</p>}
              {s.error_summary && (
                <div className="flex items-start gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 text-destructive mt-0.5" />
                  <p className="text-xs text-destructive">{s.error_summary}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {(evidence ?? []).length > 0 && (
        <div>
          <h4 className="text-sm font-semibold">Evidence</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            {evidence.map((e: any) => (
              <Badge key={e.id} variant="outline" className="text-[10px] gap-1">
                {e.asset_type === "screenshot" ? <Image className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                {e.label || e.asset_type}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CJ03JourneyDetailView() {
  const { isDemoMode } = useDataMode();
  const { data: journeys, isLoading } = useCustomerJourneys();
  const { data: runs } = useCustomerJourneyRuns();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpanded(expanded === id ? null : id);
    setSelectedRun(null);
  };

  return (
    <div className="space-y-6 p-6" data-testid="cj03-journey-detail">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          CJ03 — Journey Detail View
        </h1>
        <p className="text-muted-foreground mt-1">Step-by-step proof, failures, evidence, root cause, and remediation notes</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-3">
          {(journeys ?? []).map((j: any) => {
            const statusCfg = JOURNEY_STATUS_CONFIG[j.current_status] || JOURNEY_STATUS_CONFIG.unverified;
            const impactCfg = LAUNCH_IMPACT_CONFIG[j.launch_importance] || LAUNCH_IMPACT_CONFIG.non_blocking;
            const isOpen = expanded === j.id;
            const jRuns = (runs ?? []).filter((r: any) => r.journey_key === j.journey_key);
            const steps = Array.isArray(j.steps) ? j.steps : [];

            return (
              <Card key={j.id}>
                <CardContent className="p-0">
                  <button
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                    onClick={() => toggle(j.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <div>
                        <div className="font-medium text-sm">{j.display_name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{j.journey_key}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${statusCfg.color} text-[10px]`}>{statusCfg.label}</Badge>
                      <Badge variant="outline" className={`${impactCfg.color} text-[10px]`}>{impactCfg.label}</Badge>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t p-4 space-y-4">
                      {/* Journey metadata */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase">Persona</span>
                          <div className="capitalize">{j.persona}</div>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase">Domain</span>
                          <div className="capitalize">{j.domain}</div>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase">Modes</span>
                          <div>{(j.primary_modes || []).join(", ")}</div>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase">Owner</span>
                          <div>{j.owner || "—"}</div>
                        </div>
                      </div>

                      {/* Expected Steps */}
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Expected Steps</h3>
                        <div className="space-y-1">
                          {steps.map((step: any, i: number) => (
                            <div key={i} className="flex items-start gap-3 text-sm p-2 rounded bg-muted/30">
                              <span className="font-mono text-xs text-muted-foreground w-6">{step.order || i + 1}.</span>
                              <div>
                                <div className="font-medium">{step.name}</div>
                                <div className="text-xs text-muted-foreground">{step.expectedBehavior || step.expected_behavior}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold">Expected Outcome</h3>
                        <p className="text-sm text-muted-foreground">{j.expected_outcome || "Not defined"}</p>
                      </div>

                      {/* Recent Runs */}
                      {jRuns.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2">Recent Verification Runs</h3>
                          <div className="space-y-2">
                            {jRuns.slice(0, 5).map((r: any) => {
                              const rCfg = JOURNEY_STATUS_CONFIG[r.status] || JOURNEY_STATUS_CONFIG.unverified;
                              const isSelected = selectedRun === r.id;
                              return (
                                <div key={r.id}>
                                  <button
                                    className="w-full text-left p-3 rounded border bg-card space-y-1 hover:bg-muted/20 transition-colors"
                                    onClick={() => setSelectedRun(isSelected ? null : r.id)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <Badge variant="outline" className={`${rCfg.color} text-[10px]`}>{rCfg.label}</Badge>
                                      <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="text-xs">
                                      <span className="text-emerald-400">{r.steps_passed} passed</span>
                                      {r.steps_failed > 0 && <span className="text-destructive ml-2">{r.steps_failed} failed</span>}
                                      <span className="text-muted-foreground ml-2">/ {r.steps_total} total</span>
                                    </div>
                                    {r.actual_outcome && <p className="text-xs text-muted-foreground">{r.actual_outcome}</p>}
                                    {r.recommended_fix && (
                                      <p className="text-xs text-amber-400 flex items-center gap-1">
                                        <Wrench className="h-3 w-3" /> Fix: {r.recommended_fix}
                                      </p>
                                    )}
                                    {r.root_cause_layer && (
                                      <p className="text-xs text-blue-400 flex items-center gap-1">
                                        <Layers className="h-3 w-3" /> Root Cause: {r.root_cause_layer}
                                      </p>
                                    )}
                                    {r.notes && (
                                      <p className="text-xs text-muted-foreground italic mt-1">📝 {r.notes}</p>
                                    )}
                                  </button>
                                  {isSelected && (
                                    <div className="ml-4 mt-2 p-3 border-l-2 border-primary/30">
                                      <StepResultsPanel runId={r.id} />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {jRuns.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">No verification runs recorded for this journey yet.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
