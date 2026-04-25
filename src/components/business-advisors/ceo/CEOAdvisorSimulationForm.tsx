// ═══════════════════════════════════════════════════════════════
// SITA OS — CEO Advisor "Run a Strategic Scenario" form.
// L2-recommend authority. Three deterministic scenarios:
//   1. Strategic-direction tradeoff — compare N strategic paths
//   2. Portfolio prioritization     — sequence N initiatives
//   3. Cross-function tradeoff      — model org-level impact
// CEO is recommend-only — never commits org changes or announces.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, FlaskConical, Eye } from "lucide-react";
import { runAdvisorSimulation } from "@/lib/ai-platform/runtime";
import { useToast } from "@/hooks/use-toast";

interface ScenarioMeta {
  id: "strategic-direction" | "portfolio-prioritization" | "cross-function-tradeoff";
  label: string;
  hint: string;
  buildPrompt: (delta: number, asm: string) => string;
  expectedOutputs: readonly string[];
}

const SCENARIOS: readonly ScenarioMeta[] = [
  {
    id: "strategic-direction",
    label: "Strategic-direction tradeoff",
    hint: "Compare N strategic paths the company could take",
    buildPrompt: (delta, asm) =>
      `Compare ${delta} strategic direction${delta === 1 ? "" : "s"} for the company across all functions. ` +
      `For each: (a) what it advances and accelerates, (b) what it costs / sacrifices, (c) which advisors strongly support / oppose, ` +
      `(d) the leading indicator that would prove the bet right within 90 days, (e) sequencing recommendation. ` +
      `Baseline / context: ${asm || "current operating posture, no constraints stated"}. ` +
      `Recommend only — never commit a strategic shift, never make external announcements.`,
    expectedOutputs: [
      "Direction comparison matrix",
      "Cost/sacrifice per direction",
      "Advisor support/opposition map",
      "90-day leading indicators",
      "Sequencing recommendation",
    ],
  },
  {
    id: "portfolio-prioritization",
    label: "Portfolio prioritization",
    hint: "Sequence N competing initiatives across advisors",
    buildPrompt: (delta, asm) =>
      `Prioritize a portfolio of ${delta} competing initiative${delta === 1 ? "" : "s"} pulled from different advisors. ` +
      `For each: (a) value (impact × urgency), (b) cost (effort, dependency, opportunity-cost), (c) confidence, ` +
      `(d) reversibility. Rank with a sequencing plan and call out where two initiatives compete for the same resource. ` +
      `Baseline / context: ${asm || "limited operator bandwidth, no fixed budget stated"}. ` +
      `Recommend only — never authorize spend or org changes.`,
    expectedOutputs: [
      "Ranked priority list",
      "Value-vs-cost grid",
      "Resource-contention callouts",
      "Sequencing plan",
    ],
  },
  {
    id: "cross-function-tradeoff",
    label: "Cross-function tradeoff",
    hint: "Stress-test how a decision moves across N functions",
    buildPrompt: (delta, asm) =>
      `Stress-test how the proposed decision moves across ${delta} function${delta === 1 ? "" : "s"} (e.g. sales, finance, support, marketing, growth, tech). ` +
      `For each function: (a) the second-order effect, (b) the advisor most likely to flag a concern, (c) the metric that will move, ` +
      `(d) the policy that needs updating. Surface the 1-2 highest-leverage compromises. ` +
      `Baseline / context: ${asm || "decision context unspecified"}. ` +
      `Recommend only — synthesis is for the operator's judgment.`,
    expectedOutputs: [
      "Per-function second-order effects",
      "Advisor-concern map",
      "Metric-impact list",
      "Policy-update list",
      "Recommended compromises",
    ],
  },
] as const;

export function CEOAdvisorSimulationForm({ onCompleted }: { onCompleted?: () => void }) {
  const { toast } = useToast();
  const [scenarioType, setScenarioType] = useState<typeof SCENARIOS[number]["id"]>("strategic-direction");
  const [title, setTitle] = useState("");
  const [assumption, setAssumption] = useState("");
  const [deltaCount, setDeltaCount] = useState<number>(3);
  const [submitting, setSubmitting] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === scenarioType)!;

  const livePrompt = useMemo(
    () => scenario.buildPrompt(deltaCount, assumption.trim()),
    [scenario, deltaCount, assumption],
  );

  const livePayload = useMemo(
    () => ({
      advisorId: "ceo-advisor" as const,
      scenarioTitle: title.trim() || `(untitled — ${scenario.label})`,
      inputs: { scenario_type: scenario.id, delta: deltaCount, recommend_only: true },
      assumptions: { narrative: assumption.trim() || scenario.hint, authority: "L2-recommend" },
    }),
    [scenario, title, deltaCount, assumption],
  );

  async function handleRun() {
    if (!title.trim()) {
      toast({ title: "Add a scenario title", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const r = await runAdvisorSimulation(livePayload);
      toast({
        title: r.status === "completed" ? "Strategic synthesis ready" : "Synthesis failed",
        description:
          r.status === "completed"
            ? `Confidence ${Math.round(r.confidence * 100)}% — recommend-only, requires operator decision.`
            : r.riskSummary,
        variant: r.status === "completed" ? "default" : "destructive",
      });
      setTitle("");
      setAssumption("");
      onCompleted?.();
    } catch (err) {
      toast({
        title: "Synthesis failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const numericLabel = scenarioType === "strategic-direction"
    ? "Strategic directions to compare"
    : scenarioType === "portfolio-prioritization"
      ? "Initiatives to prioritize"
      : "Functions to model";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FlaskConical className="h-4 w-4" /> Run a strategic scenario
        </CardTitle>
        <CardDescription>
          Cross-advisor synthesis at the executive layer. CEO Advisor recommends only — never commits org changes or announces externally.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="ceo-scenarioType">Scenario type</Label>
            <select
              id="ceo-scenarioType"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={scenarioType}
              onChange={(e) => setScenarioType(e.target.value as typeof scenarioType)}
              disabled={submitting}
            >
              {SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="ceo-deltaCount">{numericLabel}</Label>
            <Input
              id="ceo-deltaCount"
              type="number"
              min={1}
              max={6}
              value={deltaCount}
              onChange={(e) => setDeltaCount(Number(e.target.value))}
              disabled={submitting}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="ceo-title">Scenario title</Label>
          <Input
            id="ceo-title"
            placeholder={scenario.hint}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div>
          <Label htmlFor="ceo-assumption">Context (optional)</Label>
          <Textarea
            id="ceo-assumption"
            rows={2}
            placeholder="Stage, runway, team size, key constraints, decision deadline…"
            value={assumption}
            onChange={(e) => setAssumption(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="rounded-md border border-border bg-muted/30 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Live preview — what the advisor will receive
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Prompt</p>
            <p className="text-xs whitespace-pre-wrap leading-relaxed">{livePrompt}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Inputs payload</p>
            <pre className="text-[11px] font-mono whitespace-pre-wrap rounded bg-background/60 p-2 border border-border/40">
{JSON.stringify(livePayload.inputs, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Expected outputs</p>
            <div className="flex flex-wrap gap-1">
              {scenario.expectedOutputs.map((o) => (
                <Badge key={o} variant="outline" className="text-[10px] font-normal">{o}</Badge>
              ))}
            </div>
          </div>
        </div>

        <Alert>
          <AlertTitle className="text-xs">Recommend-only — operator decides</AlertTitle>
          <AlertDescription className="text-xs">
            Output is an executive synthesis to support the operator's judgment. CEO Advisor never commits strategic shifts, executes org changes, or makes external announcements.
          </AlertDescription>
        </Alert>
        <div className="flex justify-end">
          <Button onClick={handleRun} disabled={submitting}>
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Synthesizing…</>
            ) : (
              "Run strategic synthesis"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}