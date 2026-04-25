// ═══════════════════════════════════════════════════════════════
// SITA OS — Marketing & Advertising Advisor "Run a Scenario" form.
// Test campaign budget shifts, channel pivots, and creative angles
// without touching live channels. Live preview + draft-only.
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
  id: "budget-shift" | "channel-pivot" | "creative-test";
  label: string;
  hint: string;
  buildPrompt: (shift: number, asm: string) => string;
  expectedOutputs: readonly string[];
}

const SCENARIOS: readonly ScenarioMeta[] = [
  {
    id: "budget-shift",
    label: "Budget shift",
    hint: "What if we shift spend by ±20% across channels?",
    buildPrompt: (shift, asm) =>
      `Project the impact of shifting marketing spend by ${shift}% (positive = more budget, negative = cut). ` +
      `Estimate expected change in qualified leads, CAC pressure, and the 2 channels most likely to absorb (or break under) the change. ` +
      `Baseline / assumptions: ${asm || "current channel mix and conversion rates"}.`,
    expectedOutputs: [
      "Projected qualified-lead delta",
      "CAC pressure estimate",
      "Top 2 channels to lean in / cut",
      "Risks to watch",
    ],
  },
  {
    id: "channel-pivot",
    label: "Channel pivot",
    hint: "What if we move 30% of budget to a new channel?",
    buildPrompt: (shift, asm) =>
      `Project the impact of pivoting ${shift}% of marketing budget into a new or under-used channel. ` +
      `Estimate ramp time, lead quality risk, and the smallest test that would prove or kill the bet. ` +
      `Baseline / assumptions: ${asm || "current top channel and team capacity"}.`,
    expectedOutputs: [
      "Ramp time (weeks)",
      "Lead quality risk",
      "Minimum viable test",
      "Kill criteria",
    ],
  },
  {
    id: "creative-test",
    label: "Creative test",
    hint: "What if we test 3 new creative angles next sprint?",
    buildPrompt: (shift, asm) =>
      `Design a ${shift}-week creative test plan with 3 angle variants. ` +
      `Estimate sample-size needed for a meaningful read, success metric, and what to do with the winner. ` +
      `Baseline / assumptions: ${asm || "current top-performing message and audience"}.`,
    expectedOutputs: [
      "3 angle variants",
      "Required sample size",
      "Primary success metric",
      "Roll-out plan for winner",
    ],
  },
] as const;

export function MarketingAdvisorSimulationForm({ onCompleted }: { onCompleted?: () => void }) {
  const { toast } = useToast();
  const [scenarioType, setScenarioType] = useState<typeof SCENARIOS[number]["id"]>("budget-shift");
  const [title, setTitle] = useState("");
  const [assumption, setAssumption] = useState("");
  const [shiftPct, setShiftPct] = useState<number>(20);
  const [submitting, setSubmitting] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === scenarioType)!;

  const livePrompt = useMemo(
    () => scenario.buildPrompt(shiftPct, assumption.trim()),
    [scenario, shiftPct, assumption],
  );

  const livePayload = useMemo(
    () => ({
      advisorId: "marketing-advertising-advisor" as const,
      scenarioTitle: title.trim() || `(untitled — ${scenario.label})`,
      inputs: { scenario_type: scenario.id, shift_pct: shiftPct },
      assumptions: { narrative: assumption.trim() || scenario.hint },
    }),
    [scenario, title, shiftPct, assumption],
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FlaskConical className="h-4 w-4" /> Run a marketing scenario
        </CardTitle>
        <CardDescription>
          Test budget shifts, channel pivots, and creative angles safely. Marketing Advisor never launches paid campaigns.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="mkt-scenarioType">Scenario type</Label>
            <select
              id="mkt-scenarioType"
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
            <Label htmlFor="mkt-shiftPct">
              {scenarioType === "creative-test" ? "Test length (weeks)" : "Shift (%)"}
            </Label>
            <Input
              id="mkt-shiftPct"
              type="number"
              min={scenarioType === "creative-test" ? 1 : -50}
              max={scenarioType === "creative-test" ? 12 : 100}
              value={shiftPct}
              onChange={(e) => setShiftPct(Number(e.target.value))}
              disabled={submitting}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="mkt-title">Scenario title</Label>
          <Input
            id="mkt-title"
            placeholder={scenario.hint}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div>
          <Label htmlFor="mkt-assumption">Assumptions (optional)</Label>
          <Textarea
            id="mkt-assumption"
            rows={2}
            placeholder="What's the baseline (top channel, conversion rates, audience)?"
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
            Marketing Advisor never launches paid campaigns, modifies brand assets live, or sends external email. Outputs are drafts you can adopt or discard.
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