// ═══════════════════════════════════════════════════════════════
// SITA OS — CEO Simulation Comparison Runner
//
// Runs all 4 CEO Advisor simulation contracts in parallel against
// the SAME shared inputs so the operator can compare tradeoffs and
// conflict triage outputs side-by-side.
//
// Contracts (from ceo-advisor.spec.ts):
//   1. binding-constraint-detection-scenario
//   2. tradeoff-framing-scenario
//   3. advisor-conflict-triage-scenario
//   4. executive-stress-test-scenario       (nonAuthoritative)
//
// Recommend-only — outputs are framings for the operator's decision.
// Empty-state honest, semantic tokens only.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, GitCompareArrows, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { runAdvisorSimulation } from "@/lib/ai-platform/runtime";
import { useToast } from "@/hooks/use-toast";

interface CeoContract {
  id:
    | "binding-constraint-detection-scenario"
    | "tradeoff-framing-scenario"
    | "advisor-conflict-triage-scenario"
    | "executive-stress-test-scenario";
  label: string;
  shortLabel: string;
  authoritative: boolean;
  description: string;
  buildPrompt: (shared: SharedInputs) => string;
  expectedOutputs: readonly string[];
}

interface SharedInputs {
  decisionContext: string;
  optionA: string;
  optionB: string;
  shock: string;
  horizonDays: number;
}

const CONTRACTS: readonly CeoContract[] = [
  {
    id: "binding-constraint-detection-scenario",
    label: "Binding-constraint detection",
    shortLabel: "Constraint",
    authoritative: true,
    description: "Names the single binding constraint with cross-advisor evidence.",
    buildPrompt: (s) =>
      `Run the binding-constraint detection scenario for the next ${s.horizonDays} days. ` +
      `Decision context: ${s.decisionContext || "(unspecified)"}. ` +
      `Examine cross-function metrics (cash, pipeline, capacity, compliance, platform, trade) and name the SINGLE binding constraint with evidence from ≥2 advisor councils. ` +
      `Return: bindingConstraintNamed, evidencePerAdvisor, recommendedPriority, owningAdvisorHandoffs, assumptionsUsed. ` +
      `Recommend only — operator decides.`,
    expectedOutputs: [
      "bindingConstraintNamed",
      "evidencePerAdvisor",
      "recommendedPriority",
      "owningAdvisorHandoffs",
    ],
  },
  {
    id: "tradeoff-framing-scenario",
    label: "Tradeoff framing",
    shortLabel: "Tradeoff",
    authoritative: true,
    description: "Frames option × cross-function impact × reversibility.",
    buildPrompt: (s) =>
      `Frame the strategic tradeoff between Option A "${s.optionA || "(missing)"}" and Option B "${s.optionB || "(missing)"}" for the next ${s.horizonDays} days. ` +
      `Decision context: ${s.decisionContext || "(unspecified)"}. ` +
      `Return: optionMatrix, crossFunctionImpactPerOption (Sales/CFO/Marketing/Growth/Tech/Service/Imports/Taxes), reversibilityPerOption, recommendedOptionWithRationale, givenUpByRecommendation, owningAdvisorHandoffs, assumptionsUsed. ` +
      `Always frame — never deliver as a verdict.`,
    expectedOutputs: [
      "optionMatrix",
      "crossFunctionImpactPerOption",
      "reversibilityPerOption",
      "recommendedOptionWithRationale",
      "givenUpByRecommendation",
    ],
  },
  {
    id: "advisor-conflict-triage-scenario",
    label: "Advisor-conflict triage",
    shortLabel: "Conflict",
    authoritative: true,
    description: "Surfaces both advisor positions; routes the call to the operator.",
    buildPrompt: (s) =>
      `Triage a two-advisor conflict where Advisor A argues for "${s.optionA || "(missing)"}" and Advisor B argues for "${s.optionB || "(missing)"}". ` +
      `Decision context: ${s.decisionContext || "(unspecified)"}. Horizon: ${s.horizonDays} days. ` +
      `Return: advisorAPositionFramed, advisorBPositionFramed, crossFunctionTradeoffNamed, recommendedResolutionWithRationale, owningAdvisorHandoffs, assumptionsUsed. ` +
      `Surface BOTH rationales — never silently pick a side. Operator decides.`,
    expectedOutputs: [
      "advisorAPositionFramed",
      "advisorBPositionFramed",
      "crossFunctionTradeoffNamed",
      "recommendedResolutionWithRationale",
    ],
  },
  {
    id: "executive-stress-test-scenario",
    label: "Executive stress test",
    shortLabel: "Stress",
    authoritative: false,
    description: "Projects shocked-state cross-function impact (preparation brief, not a forecast).",
    buildPrompt: (s) =>
      `Stress-test the business against the shock: "${s.shock || "(unspecified)"}" over ${s.horizonDays} days. ` +
      `Decision context: ${s.decisionContext || "(unspecified)"}. ` +
      `Return: crossFunctionImpactProjection (per advisor council), firstCutsRecommended, contingencyPriorityWithRationale, owningAdvisorHandoffs, assumptionsUsed. ` +
      `Frame as a preparation brief — never as a forecast.`,
    expectedOutputs: [
      "crossFunctionImpactProjection",
      "firstCutsRecommended",
      "contingencyPriorityWithRationale",
    ],
  },
] as const;

interface ContractRunState {
  status: "idle" | "running" | "completed" | "failed";
  confidence?: number;
  riskSummary?: string;
  outcomes?: Record<string, unknown>;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
}

function summarizeOutcome(outcomes: Record<string, unknown> | undefined): string {
  if (!outcomes) return "—";
  if (typeof outcomes.narrative === "string") return outcomes.narrative;
  // Render the first 2 keys as a brief preview.
  const entries = Object.entries(outcomes).slice(0, 3);
  return entries
    .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v).slice(0, 120)}`)
    .join(" · ");
}

export function CEOSimulationComparisonRunner() {
  const { toast } = useToast();
  const [shared, setShared] = useState<SharedInputs>({
    decisionContext: "",
    optionA: "",
    optionB: "",
    shock: "",
    horizonDays: 30,
  });
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(CONTRACTS.map((c) => [c.id, true])),
  );
  const [runs, setRuns] = useState<Record<string, ContractRunState>>(
    Object.fromEntries(CONTRACTS.map((c) => [c.id, { status: "idle" }])),
  );
  const [running, setRunning] = useState(false);

  const selectedCount = useMemo(
    () => Object.values(enabled).filter(Boolean).length,
    [enabled],
  );

  const inputsValid = shared.decisionContext.trim().length > 0;

  async function runAll() {
    if (!inputsValid) {
      toast({
        title: "Add a decision context",
        description: "Shared inputs need a decision context to compare contracts fairly.",
        variant: "destructive",
      });
      return;
    }
    setRunning(true);
    const startedAt = new Date().toISOString();
    setRuns((prev) => {
      const next = { ...prev };
      for (const c of CONTRACTS) {
        if (enabled[c.id]) next[c.id] = { status: "running", startedAt };
      }
      return next;
    });

    await Promise.all(
      CONTRACTS.filter((c) => enabled[c.id]).map(async (c) => {
        try {
          const res = await runAdvisorSimulation({
            advisorId: "ceo-advisor",
            scenarioTitle: `${c.label} — comparison run`,
            inputs: {
              scenario_type: c.id,
              shared_inputs: shared,
              recommend_only: true,
              comparison_run: true,
            },
            assumptions: {
              narrative: c.buildPrompt(shared),
              authority: c.authoritative ? "L2-recommend" : "L1-suggest (non-authoritative)",
              shared_decision_context: shared.decisionContext,
            },
          });
          setRuns((prev) => ({
            ...prev,
            [c.id]: {
              status: res.status,
              confidence: res.confidence,
              riskSummary: res.riskSummary,
              outcomes: res.projectedOutcomes,
              startedAt,
              finishedAt: new Date().toISOString(),
            },
          }));
        } catch (err) {
          setRuns((prev) => ({
            ...prev,
            [c.id]: {
              status: "failed",
              startedAt,
              finishedAt: new Date().toISOString(),
              error: err instanceof Error ? err.message : "Unknown error",
            },
          }));
        }
      }),
    );

    setRunning(false);
    toast({
      title: "Comparison run complete",
      description: `${selectedCount} contract${selectedCount === 1 ? "" : "s"} executed against the same shared inputs.`,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <GitCompareArrows className="h-4 w-4" /> Compare CEO simulation contracts
        </CardTitle>
        <CardDescription>
          Run the four CEO Advisor contracts against the same shared inputs and view tradeoffs and conflict triage side-by-side. Recommend-only — every output requires the operator's decision.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Shared inputs */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="ceo-cmp-context">Decision context (shared)</Label>
            <Textarea
              id="ceo-cmp-context"
              rows={2}
              placeholder="What strategic decision is on the table? Stage, runway, deadline, stakeholders…"
              value={shared.decisionContext}
              onChange={(e) => setShared({ ...shared, decisionContext: e.target.value })}
              disabled={running}
            />
          </div>
          <div>
            <Label htmlFor="ceo-cmp-optA">Option A / Advisor A position</Label>
            <Input
              id="ceo-cmp-optA"
              placeholder="e.g. Raise prices 12%"
              value={shared.optionA}
              onChange={(e) => setShared({ ...shared, optionA: e.target.value })}
              disabled={running}
            />
          </div>
          <div>
            <Label htmlFor="ceo-cmp-optB">Option B / Advisor B position</Label>
            <Input
              id="ceo-cmp-optB"
              placeholder="e.g. Open second sales channel"
              value={shared.optionB}
              onChange={(e) => setShared({ ...shared, optionB: e.target.value })}
              disabled={running}
            />
          </div>
          <div>
            <Label htmlFor="ceo-cmp-shock">Stress-test shock</Label>
            <Input
              id="ceo-cmp-shock"
              placeholder="e.g. 20% revenue drop, key supplier loss…"
              value={shared.shock}
              onChange={(e) => setShared({ ...shared, shock: e.target.value })}
              disabled={running}
            />
          </div>
          <div>
            <Label htmlFor="ceo-cmp-horizon">Horizon (days)</Label>
            <Input
              id="ceo-cmp-horizon"
              type="number"
              min={7}
              max={365}
              value={shared.horizonDays}
              onChange={(e) => setShared({ ...shared, horizonDays: Number(e.target.value) || 30 })}
              disabled={running}
            />
          </div>
        </div>

        {/* Contract toggles */}
        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Contracts to include ({selectedCount}/{CONTRACTS.length})
          </Label>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {CONTRACTS.map((c) => {
              const isOn = enabled[c.id];
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setEnabled((p) => ({ ...p, [c.id]: !p[c.id] }))}
                  disabled={running}
                  className={`text-left rounded-md border px-3 py-2 transition-colors ${
                    isOn
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/20 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{c.label}</span>
                    {!c.authoritative && (
                      <Badge variant="outline" className="text-[10px]">non-authoritative</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle className="text-xs">Recommend-only · operator decides</AlertTitle>
          <AlertDescription className="text-xs">
            CEO Advisor never commits strategic shifts, executes org changes, or makes external announcements. Every contract output is a framing for the operator's judgment.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            All contracts share the same inputs above so the comparison is fair.
          </p>
          <Button onClick={runAll} disabled={running || selectedCount === 0}>
            {running ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Running {selectedCount}…</>
            ) : (
              <>Run {selectedCount} contract{selectedCount === 1 ? "" : "s"}</>
            )}
          </Button>
        </div>

        {/* Results comparison grid */}
        <div className="grid gap-3 lg:grid-cols-2">
          {CONTRACTS.filter((c) => enabled[c.id]).map((c) => {
            const r = runs[c.id];
            return (
              <Card key={c.id} className="border-border/60">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm">{c.label}</CardTitle>
                    <div className="flex items-center gap-1.5">
                      {r.status === "running" && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                      {r.status === "completed" && <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />}
                      {r.status === "failed" && <XCircle className="h-3.5 w-3.5 text-destructive" />}
                      {r.confidence !== undefined && (
                        <Badge variant="outline" className="text-[10px]">
                          {Math.round(r.confidence * 100)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-xs">{c.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {r.status === "idle" && (
                    <p className="text-xs text-muted-foreground italic">Not yet run.</p>
                  )}
                  {r.status === "running" && (
                    <p className="text-xs text-muted-foreground">Synthesizing against shared inputs…</p>
                  )}
                  {r.status === "failed" && (
                    <p className="text-xs text-destructive">{r.error ?? "Failed."}</p>
                  )}
                  {r.status === "completed" && (
                    <>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                          Expected output keys
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {c.expectedOutputs.map((k) => {
                            const present = r.outcomes && Object.prototype.hasOwnProperty.call(r.outcomes, k);
                            return (
                              <Badge
                                key={k}
                                variant={present ? "default" : "outline"}
                                className="text-[10px] font-normal"
                              >
                                {k}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                          Synthesis preview
                        </p>
                        <ScrollArea className="h-32 rounded border border-border/40 bg-muted/30 p-2">
                          <p className="text-[11px] whitespace-pre-wrap leading-relaxed">
                            {summarizeOutcome(r.outcomes)}
                          </p>
                        </ScrollArea>
                      </div>
                      {r.riskSummary && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Risk</p>
                          <p className="text-[11px] text-muted-foreground">{r.riskSummary}</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}