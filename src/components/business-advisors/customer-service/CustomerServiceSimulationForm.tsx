// ═══════════════════════════════════════════════════════════════
// SITA OS — Customer Service Advisor "Run a Scenario" form.
// Project response-time, staffing, and escalation policy outcomes
// without touching live cases or customers.
//
// Includes a live preview that re-renders as you edit the inputs
// so you see exactly what the advisor will receive.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FlaskConical, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { runAdvisorSimulation } from "@/lib/ai-platform/runtime";
import { useToast } from "@/hooks/use-toast";

interface ScenarioMeta {
  id: "response-time-target" | "staffing-change" | "escalation-policy";
  label: string;
  hint: string;
  /** Build the natural-language prompt the advisor will see. */
  buildPrompt: (shiftPct: number, assumption: string) => string;
  /** What the advisor is expected to return. */
  expectedOutputs: readonly string[];
}

const SCENARIOS: readonly ScenarioMeta[] = [
  {
    id: "response-time-target",
    label: "Response-time target",
    hint: "What if our first-response SLA dropped to 1h?",
    buildPrompt: (shift, asm) =>
      `Project the impact of tightening our first-response SLA target by ${shift}%. ` +
      `Compare projected handle time, CSAT, and breach rate against the current baseline. ` +
      `Baseline / assumptions: ${asm || "current SLA + current staffing"}.`,
    expectedOutputs: [
      "Projected breach-rate change (%)",
      "Projected CSAT delta (pts)",
      "Required handle-time uplift",
      "Top 3 risks + mitigations",
    ],
  },
  {
    id: "staffing-change",
    label: "Staffing change",
    hint: "What if we add 1 support rep to peak hours?",
    buildPrompt: (shift, asm) =>
      `Project the impact of changing peak-hour staffing capacity by ${shift}%. ` +
      `Estimate queue depth, wait-time, and weekly cost change. ` +
      `Baseline / assumptions: ${asm || "current shift coverage and ticket volume"}.`,
    expectedOutputs: [
      "Projected average wait-time change",
      "Projected queue-depth at peak",
      "Estimated weekly cost delta",
      "Recommended shift pattern",
    ],
  },
  {
    id: "escalation-policy",
    label: "Escalation policy",
    hint: "What if all priority=high cases auto-escalate at 4h?",
    buildPrompt: (shift, asm) =>
      `Project the impact of tightening the escalation trigger by ${shift}% (earlier auto-escalation on priority=high cases). ` +
      `Estimate L2/L3 load shift, customer-impact reduction, and false-escalation risk. ` +
      `Baseline / assumptions: ${asm || "current 8h auto-escalation rule on priority=high"}.`,
    expectedOutputs: [
      "Projected L2/L3 load shift (%)",
      "Projected customer-impact reduction",
      "False-escalation risk estimate",
      "Recommended guardrails",
    ],
  },
] as const;

export function CustomerServiceSimulationForm({ onCompleted }: { onCompleted?: () => void }) {
  const { toast } = useToast();
  const [scenarioType, setScenarioType] = useState<typeof SCENARIOS[number]["id"]>("response-time-target");
  const [title, setTitle] = useState("");
  const [assumption, setAssumption] = useState("");
  const [shiftPct, setShiftPct] = useState<number>(10);
  const [submitting, setSubmitting] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === scenarioType)!;

  const livePrompt = useMemo(
    () => scenario.buildPrompt(shiftPct, assumption.trim()),
    [scenario, shiftPct, assumption],
  );

  const livePayload = useMemo(
    () => ({
      advisorId: "customer-service-advisor" as const,
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
          <FlaskConical className="h-4 w-4" /> Run a Customer Service scenario
        </CardTitle>
        <CardDescription>Project SLA, staffing, and escalation outcomes safely. Nothing touches live cases.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="cs-scenarioType">Scenario type</Label>
            <select
              id="cs-scenarioType"
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
            <Label htmlFor="cs-shiftPct">Shift (%)</Label>
            <Input
              id="cs-shiftPct"
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
          <Label htmlFor="cs-title">Scenario title</Label>
          <Input
            id="cs-title"
            placeholder={scenario.hint}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div>
          <Label htmlFor="cs-assumption">Assumptions (optional)</Label>
          <Textarea
            id="cs-assumption"
            rows={2}
            placeholder="What's the baseline (current SLA, staffing, escalation rule)?"
            value={assumption}
            onChange={(e) => setAssumption(e.target.value)}
            disabled={submitting}
          />
        </div>

        {/* ── Live preview ─────────────────────────────────────── */}
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
                <Badge key={o} variant="outline" className="text-[10px] font-normal">
                  {o}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Alert>
          <AlertTitle className="text-xs">Simulation only</AlertTitle>
          <AlertDescription className="text-xs">
            Customer Service Advisor never edits live cases, sends customer messages, or issues refunds. Outputs are projections you can adopt or discard.
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