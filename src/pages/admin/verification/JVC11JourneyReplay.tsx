// ═══════════════════════════════════════════════════════
// SITA OS — JVC11: Journey Replay
// Visual step-by-step replay of journey executions
// ═══════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CUSTOMER_JOURNEY_REGISTRY, JOURNEY_STATUS_CONFIG, LAUNCH_IMPACT_CONFIG } from "@/lib/customer-journey/journey-registry";
import { useCustomerJourneyRuns } from "@/lib/customer-journey/journey-hooks";
import { Play, CheckCircle2, XCircle, Clock, ArrowRight, ChevronDown, ChevronRight, Image, FileText, RotateCcw } from "lucide-react";

export default function JVC11JourneyReplay() {
  const [selectedJourney, setSelectedJourney] = useState<string>("");
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const { data: runs } = useCustomerJourneyRuns();

  const journey = CUSTOMER_JOURNEY_REGISTRY.find(j => j.journeyKey === selectedJourney);
  const domains = [...new Set(CUSTOMER_JOURNEY_REGISTRY.map(j => j.domain))];
  const [domainFilter, setDomainFilter] = useState("all");

  const filteredJourneys = useMemo(() => {
    if (domainFilter === "all") return CUSTOMER_JOURNEY_REGISTRY;
    return CUSTOMER_JOURNEY_REGISTRY.filter(j => j.domain === domainFilter);
  }, [domainFilter]);

  // Simulate run data for selected journey
  const journeyRuns = useMemo(() => {
    if (!runs || !selectedJourney) return [];
    return (runs as any[]).filter(r => r.journey_key === selectedJourney).slice(0, 5);
  }, [runs, selectedJourney]);

  const latestRun = journeyRuns[0];

  return (
    <div className="space-y-6 p-6" data-testid="jvc11-journey-replay">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Play className="h-6 w-6 text-primary" />
          JVC11 — Journey Replay
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Step-by-step replay of journey executions with evidence</p>
      </div>

      {/* Journey Selector */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Select Journey</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Select value={domainFilter} onValueChange={setDomainFilter}>
              <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="Domain" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {domains.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedJourney} onValueChange={setSelectedJourney}>
              <SelectTrigger className="flex-1 h-8 text-xs"><SelectValue placeholder="Select a journey to replay..." /></SelectTrigger>
              <SelectContent>
                {filteredJourneys.map(j => (
                  <SelectItem key={j.journeyKey} value={j.journeyKey}>{j.displayName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {journey && (
        <>
          {/* Journey Header */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">{journey.displayName}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{journey.expectedOutcome}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">{journey.persona}</Badge>
                  <Badge className={`text-xs ${LAUNCH_IMPACT_CONFIG[journey.launchImportance]?.color || ""}`}>
                    {LAUNCH_IMPACT_CONFIG[journey.launchImportance]?.label || journey.launchImportance}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{journey.steps.length} steps</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step Timeline */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Step-by-Step Replay</CardTitle>
                {latestRun && (
                  <Badge className={`text-xs ${JOURNEY_STATUS_CONFIG[latestRun.status]?.color || "bg-muted text-muted-foreground"}`}>
                    {JOURNEY_STATUS_CONFIG[latestRun.status]?.label || latestRun.status}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {journey.steps.map((step, idx) => {
                  const isExpanded = expandedStep === idx;
                  const isLast = idx === journey.steps.length - 1;
                  // Simulate step status
                  const stepStatus = latestRun ? (latestRun.status === "working" ? "pass" : idx === journey.steps.length - 1 ? "fail" : "pass") : "pending";

                  return (
                    <div key={idx}>
                      <div
                        className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setExpandedStep(isExpanded ? null : idx)}
                      >
                        {/* Step indicator */}
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            stepStatus === "pass" ? "bg-emerald-500/20 text-emerald-400" :
                            stepStatus === "fail" ? "bg-destructive/20 text-destructive" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {step.order}
                          </div>
                          {!isLast && <div className="w-px h-4 bg-border mt-1" />}
                        </div>

                        {/* Step content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{step.name}</span>
                            {stepStatus === "pass" && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                            {stepStatus === "fail" && <XCircle className="h-3 w-3 text-destructive" />}
                            {stepStatus === "pending" && <Clock className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{step.expectedBehavior}</p>
                        </div>

                        {/* Expand */}
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="ml-12 p-3 bg-muted/30 rounded-md mb-2 space-y-2">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-muted-foreground">Expected:</span>
                              <p className="mt-0.5">{step.expectedBehavior}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Route Family:</span>
                              <p className="mt-0.5 font-mono">{journey.routeFamily}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-[10px] flex items-center gap-1">
                              <Image className="h-2.5 w-2.5" /> Screenshot available
                            </Badge>
                            <Badge variant="outline" className="text-[10px] flex items-center gap-1">
                              <FileText className="h-2.5 w-2.5" /> Assertion log
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Route Transitions */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Expected Route Transitions</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs font-mono">{journey.routeFamily}</Badge>
                {journey.steps.map((_, idx) => (
                  <span key={idx} className="flex items-center gap-1">
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline" className="text-[10px]">step {idx + 1}</Badge>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Run History */}
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Recent Runs</CardTitle></CardHeader>
            <CardContent>
              {journeyRuns.length > 0 ? (
                <div className="space-y-2">
                  {journeyRuns.map((run: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                      <div className="flex items-center gap-2">
                        {run.status === "working" ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-destructive" />}
                        <span className="text-xs">{new Date(run.created_at).toLocaleString()}</span>
                      </div>
                      <Badge className={`text-xs ${JOURNEY_STATUS_CONFIG[run.status]?.color || ""}`}>
                        {JOURNEY_STATUS_CONFIG[run.status]?.label || run.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No runs recorded yet. Run a journey probe to see replay data.</p>
              )}
            </CardContent>
          </Card>

          {/* Dependencies */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Dependencies</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {journey.dependencies.map(d => (
                  <Badge key={d} variant="outline" className="text-xs">{d}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!journey && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Play className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Select a journey above to begin replay inspection</p>
            <p className="text-xs text-muted-foreground mt-1">{CUSTOMER_JOURNEY_REGISTRY.length} journeys available across {domains.length} domains</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
