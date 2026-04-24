// ═══════════════════════════════════════════════════════════════
// SITA OS — Growth Advisor "Run a Scenario" form.
// Test activation lifts, retention plays, and experiment designs
// without committing strategic shifts. Live preview + draft-only.
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
  id: "activation-lift" | "retention-play" | "experiment-design";
  label: string;
  hint: string;
  buildPrompt: (delta: number, asm: string) => string;
  expectedOutputs: readonly string[];
}

const SCENARIOS: readonly ScenarioMeta[] = [
  {
    id: "activation-lift",
    label: "Activation lift",
    hint: "What if we lift activation by N%?",
    buildPrompt: (delta, asm) =>
      `Project the impact of lifting activation rate by ${delta}% (positive = improvement, negative = regression). ` +
      `Estimate downstream effect on 30-day retention and revenue, plus the 2 highest-leverage activation interventions to test first. ` +
      `Baseline / assumptions: ${asm || "current activation rate and onboarding flow"}.`,
    expectedOutputs: [
      "Projected 30-day retention delta",
      "Revenue impact estimate",
      "Top 2 activation interventions",
      "Risks to watch",
    ],
  },
  {
    id: "retention-play",
    label: "Retention play",
    hint: "What if we cut churn by N% in a specific cohort?",
    buildPrompt: (delta, asm) =>
      `Project the impact of cutting churn by ${delta}% in a target cohort. ` +
      `Estimate LTV change, CAC payback shift, and the smallest test that would prove the play works. ` +
      `Baseline / assumptions: ${asm || "current cohort churn rates and LTV"}.`,
    expectedOutputs: [
      "LTV change",
      "CAC payback shift",
      "Minimum viable retention test",
      "Kill criteria",
    ],
  },
  {
    id: "experiment-design",
    label: "Experiment design",
    hint: "Design a 2-week experiment with N variants",
    buildPrompt: (delta, asm) =>
      `Design a 2-week conversion experiment with ${delta} variant${delta === 1 ? "" : "s"} (plus control). ` +
      `Estimate sample-size needed for a statistically meaningful read, primary success metric, and roll-out plan for the winner. ` +
      `Baseline / assumptions: ${asm || "current top funnel stage and traffic volume"}.`,
    expectedOutputs: [
      "Variants brief",
      "Required sample size",
      "Primary success metric",
      "Roll-out plan",
    ],
  },
] as const;

export function GrowthAdvisorSimulationForm({ onCompleted }: { onCompleted?: () => void }) {
  const { toast } = useToast();
  const [scenarioType, setScenarioType] = useState<typeof SCENARIOS[number]["id"]>("activation-lift");
  const [title, setTitle] = useState("");
  const [assumption, setAssumption] = useState("");
  const [deltaPct, setDeltaPct] = useState<number>(20);
  const [submitting, setSubmitting] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === scenarioType)!;

  const livePrompt = useMemo(
    () => scenario.buildPrompt(deltaPct, assumption.trim()),
    [scenario, deltaPct, assumption],
  );

  const livePayload = useMemo(
    () => ({
      advisorId: "growth-advisor" as const,
      scenarioTitle: title.trim() || `(untitled — ${scenario.label})`,
      inputs: { scenario_type: scenario.id, delta: deltaPct },
      assumptions: { narrative: assumption.trim() || scenario.hint },
    }),
    [scenario, title, deltaPct, assumption],
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
        title: r.status === "completed" ? "Scenario complete" : "Scenario failed",
        description:
          r.status === "completed"
            ? `Confidence ${Math.round(r.confidence * 100)}%`
            : r.riskSummary,
        variant: r.status === "completed" ? "default" : "destructive",
      });
      setTitle("");
      setAssumption("");
      onCompleted?.();
    } catch (err) {
      toast({
        title: "Simulation failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const numericLabel = scenarioType === "experiment-design" ? "Variants" : "Delta (%)";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FlaskConical className="h-4 w-4" /> Run a growth scenario
        </CardTitle>
        <CardDescription>
          Test activation lifts, retention plays, and experiment designs safely. Growth Advisor never modifies pricing or launches external experiments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="growth-scenarioType">Scenario type</Label>
            <select
              id="growth-scenarioType"
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
            <Label htmlFor="growth-deltaPct">{numericLabel}</Label>
            <Input
              id="growth-deltaPct"
              type="number"
              min={scenarioType === "experiment-design" ? 1 : -50}
              max={scenarioType === "experiment-design" ? 5 : 100}
              value={deltaPct}
              onChange={(e) => setDeltaPct(Number(e.target.value))}
              disabled={submitting}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="growth-title">Scenario title</Label>
          <Input
            id="growth-title"
            placeholder={scenario.hint}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div>
          <Label htmlFor="growth-assumption">Assumptions (optional)</Label>
          <Textarea
            id="growth-assumption"
            rows={2}
            placeholder="What's the baseline (current activation rate, churn, traffic)?"
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
          <AlertTitle className="text-xs">Draft only</AlertTitle>
          <AlertDescription className="text-xs">
            Growth Advisor never modifies pricing live, launches external experiments, or commits strategic shifts. Outputs are drafts you can adopt or discard.
          </AlertDescription>
        </Alert>
        <div className="flex justify-end">
          <Button onClick={handleRun} disabled={submitting}>
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Running…</>
            ) : (
              "Run scenario"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}