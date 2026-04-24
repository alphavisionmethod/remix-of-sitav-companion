// ═══════════════════════════════════════════════════════════════
// SITA OS — CFO Advisor "Run a Scenario" form.
// Project runway, spend cuts, and AR collection acceleration
// without touching real money. Live preview + recommend-only.
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
  id: "runway-shift" | "spend-cut" | "collection-acceleration";
  label: string;
  hint: string;
  buildPrompt: (shift: number, asm: string) => string;
  expectedOutputs: readonly string[];
}

const SCENARIOS: readonly ScenarioMeta[] = [
  {
    id: "runway-shift",
    label: "Runway shift",
    hint: "What if revenue drops 20% next quarter?",
    buildPrompt: (shift, asm) =>
      `Project the impact on cash runway if monthly revenue shifts by ${shift}%. ` +
      `Estimate runway months remaining, breakeven burn target, and 2 highest-leverage levers to extend runway. ` +
      `Baseline / assumptions: ${asm || "current burn rate and AR aging"}.`,
    expectedOutputs: [
      "Projected runway (months)",
      "Breakeven burn target",
      "Top 2 levers to extend",
      "Risks to watch",
    ],
  },
  {
    id: "spend-cut",
    label: "Spend cut",
    hint: "What if we cut discretionary spend by 15%?",
    buildPrompt: (shift, asm) =>
      `Project the impact of cutting discretionary spend by ${shift}%. ` +
      `Estimate monthly savings, runway extension, and likely operational tradeoffs. ` +
      `Baseline / assumptions: ${asm || "current opex categories and team size"}.`,
    expectedOutputs: [
      "Monthly savings estimate",
      "Runway extension (months)",
      "Operational tradeoffs",
      "Recommended cut order",
    ],
  },
  {
    id: "collection-acceleration",
    label: "Collection acceleration",
    hint: "What if 30-day AR collected in 15 days?",
    buildPrompt: (shift, asm) =>
      `Project the impact of accelerating AR collection by ${shift}% (faster cycle). ` +
      `Estimate cash brought forward, working-capital improvement, and customer-relationship risk. ` +
      `Baseline / assumptions: ${asm || "current DSO and overdue exposure"}.`,
    expectedOutputs: [
      "Cash pulled forward",
      "DSO improvement (days)",
      "Working-capital lift",
      "Customer-relationship risk",
    ],
  },
] as const;

export function CFOAdvisorSimulationForm({ onCompleted }: { onCompleted?: () => void }) {
  const { toast } = useToast();
  const [scenarioType, setScenarioType] = useState<typeof SCENARIOS[number]["id"]>("runway-shift");
  const [title, setTitle] = useState("");
  const [assumption, setAssumption] = useState("");
  const [shiftPct, setShiftPct] = useState<number>(15);
  const [submitting, setSubmitting] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === scenarioType)!;

  const livePrompt = useMemo(
    () => scenario.buildPrompt(shiftPct, assumption.trim()),
    [scenario, shiftPct, assumption],
  );

  const livePayload = useMemo(
    () => ({
      advisorId: "cfo-advisor" as const,
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
          <FlaskConical className="h-4 w-4" /> Run a CFO scenario
        </CardTitle>
        <CardDescription>
          Project runway, spend, and AR outcomes safely. CFO Advisor never moves real money.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="cfo-scenarioType">Scenario type</Label>
            <select
              id="cfo-scenarioType"
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
            <Label htmlFor="cfo-shiftPct">Shift (%)</Label>
            <Input
              id="cfo-shiftPct"
              type="number"
              min={-50}
              max={100}
              value={shiftPct}
              onChange={(e) => setShiftPct(Number(e.target.value))}
              disabled={submitting}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="cfo-title">Scenario title</Label>
          <Input
            id="cfo-title"
            placeholder={scenario.hint}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div>
          <Label htmlFor="cfo-assumption">Assumptions (optional)</Label>
          <Textarea
            id="cfo-assumption"
            rows={2}
            placeholder="What's the baseline (burn rate, DSO, opex categories)?"
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
          <AlertTitle className="text-xs">Simulation only</AlertTitle>
          <AlertDescription className="text-xs">
            CFO Advisor never executes payments, modifies budgets live, closes books, or files returns. Outputs are projections you can adopt or discard.
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
