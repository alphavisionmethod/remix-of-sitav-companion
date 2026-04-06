// ═══════════════════════════════════════════════════════
// SITA OS — CJ03: Journey Detail View
// Step-by-step proof, failures, evidence, recommended fixes
// ═══════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCustomerJourneys, useCustomerJourneyRuns } from "@/lib/customer-journey/journey-hooks";
import { JOURNEY_STATUS_CONFIG } from "@/lib/customer-journey/journey-registry";
import { ListChecks, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function CJ03JourneyDetailView() {
  const { data: journeys, isLoading } = useCustomerJourneys();
  const { data: runs } = useCustomerJourneyRuns();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => setExpanded(expanded === id ? null : id);

  return (
    <div className="space-y-6 p-6" data-testid="cj03-journey-detail">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          CJ03 — Journey Detail View
        </h1>
        <p className="text-muted-foreground mt-1">Step-by-step proof, failures, evidence, and recommended fixes</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-3">
          {(journeys ?? []).map((j: any) => {
            const statusCfg = JOURNEY_STATUS_CONFIG[j.current_status] || JOURNEY_STATUS_CONFIG.unverified;
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
                    <Badge variant="outline" className={`${statusCfg.color} text-[10px]`}>{statusCfg.label}</Badge>
                  </button>

                  {isOpen && (
                    <div className="border-t p-4 space-y-4">
                      {/* Steps */}
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

                      {/* Expected Outcome */}
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
                              return (
                                <div key={r.id} className="p-3 rounded border bg-card space-y-1">
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
                                    <p className="text-xs text-amber-400">Fix: {r.recommended_fix}</p>
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
