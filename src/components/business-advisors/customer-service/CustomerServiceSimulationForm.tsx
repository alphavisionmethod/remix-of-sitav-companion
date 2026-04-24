// ═══════════════════════════════════════════════════════════════
// SITA OS — Customer Service Advisor "Run a Scenario" form.
// Project response-time, staffing, and escalation policy outcomes
// without touching live cases or customers.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FlaskConical } from "lucide-react";
import { runAdvisorSimulation } from "@/lib/ai-platform/runtime";
import { useToast } from "@/hooks/use-toast";

const SCENARIOS = [
  { id: "response-time-target", label: "Response-time target", hint: "What if our first-response SLA dropped to 1h?" },
  { id: "staffing-change", label: "Staffing change", hint: "What if we add 1 support rep to peak hours?" },
  { id: "escalation-policy", label: "Escalation policy", hint: "What if all priority=high cases auto-escalate at 4h?" },
] as const;

export function CustomerServiceSimulationForm({ onCompleted }: { onCompleted?: () => void }) {
  const { toast } = useToast();
  const [scenarioType, setScenarioType] = useState<typeof SCENARIOS[number]["id"]>("response-time-target");
  const [title, setTitle] = useState("");
  const [assumption, setAssumption] = useState("");
  const [shiftPct, setShiftPct] = useState<number>(10);
  const [submitting, setSubmitting] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === scenarioType)!;

  async function handleRun() {
    if (!title.trim()) {
      toast({ title: "Add a scenario title", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const r = await runAdvisorSimulation({
        advisorId: "customer-service-advisor",
        scenarioTitle: title.trim(),
        inputs: {
          scenario_type: scenarioType,
          shift_pct: shiftPct,
        },
        assumptions: {
          narrative: assumption.trim() || scenario.hint,
        },
      });
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