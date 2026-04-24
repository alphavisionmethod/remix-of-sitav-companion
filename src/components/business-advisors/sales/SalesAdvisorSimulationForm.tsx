// ═══════════════════════════════════════════════════════════════
// SITA OS — Sales Advisor "Run a Scenario" form.
// Lets the operator project pipeline outcomes (close-rate shifts,
// pricing changes, follow-up cadence) without touching real data.
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
  { id: "close-rate-lift", label: "Close-rate lift", hint: "What if we close 5% more of qualified deals?" },
  { id: "pricing-shift", label: "Pricing shift", hint: "What if we raise prices 10% on tier-2?" },
  { id: "cadence-change", label: "Follow-up cadence", hint: "What if we follow up 3x in week 1 vs 1x?" },
] as const;

export function SalesAdvisorSimulationForm({ onCompleted }: { onCompleted?: () => void }) {
  const { toast } = useToast();
  const [scenarioType, setScenarioType] = useState<typeof SCENARIOS[number]["id"]>("close-rate-lift");
  const [title, setTitle] = useState("");
  const [assumption, setAssumption] = useState("");
  const [shiftPct, setShiftPct] = useState<number>(5);
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
        advisorId: "sales-advisor",
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
          <FlaskConical className="h-4 w-4" /> Run a Sales scenario
        </CardTitle>
        <CardDescription>Project outcomes safely. Nothing touches your live CRM.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="scenarioType">Scenario type</Label>
            <select
              id="scenarioType"
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
            <Label htmlFor="shiftPct">Shift (%)</Label>
            <Input
              id="shiftPct"
              type="number"
              min={-50}
              max={50}
              value={shiftPct}
              onChange={(e) => setShiftPct(Number(e.target.value))}
              disabled={submitting}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="title">Scenario title</Label>
          <Input
            id="title"
            placeholder={scenario.hint}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div>
          <Label htmlFor="assumption">Assumptions (optional)</Label>
          <Textarea
            id="assumption"
            rows={2}
            placeholder="What baseline are you comparing against?"
            value={assumption}
            onChange={(e) => setAssumption(e.target.value)}
            disabled={submitting}
          />
        </div>
        <Alert>
          <AlertTitle className="text-xs">Simulation only</AlertTitle>
          <AlertDescription className="text-xs">
            Sales Advisor never edits live deals. Outputs are projections you can adopt or discard.
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