// ═══════════════════════════════════════════════════════════════
// SITA OS — Tech Advisor "Run a Scenario" form.
// Test architecture decisions, scaling thresholds, and migration
// risks safely. Live preview + draft-only.
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
  id: "architecture-tradeoff" | "scaling-threshold" | "migration-risk";
  label: string;
  hint: string;
  buildPrompt: (delta: number, asm: string) => string;
  expectedOutputs: readonly string[];
}

const SCENARIOS: readonly ScenarioMeta[] = [
  {
    id: "architecture-tradeoff",
    label: "Architecture tradeoff",
    hint: "Compare N architecture options for a planned change",
    buildPrompt: (delta, asm) =>
      `Compare ${delta} architecture option${delta === 1 ? "" : "s"} for a planned change. ` +
      `Identify the tradeoffs (latency, cost, complexity, reversibility) and recommend the lowest-risk path forward. ` +
      `Baseline / assumptions: ${asm || "current stack and constraints"}.`,
    expectedOutputs: [
      "Tradeoff matrix",
      "Recommended option",
      "Reversibility plan",
      "Risks to watch",
    ],
  },
  {
    id: "scaling-threshold",
    label: "Scaling threshold",
    hint: "What happens at N× current load?",
    buildPrompt: (delta, asm) =>
      `Project the system behaviour at ${delta}× current load. ` +
      `Identify the first 2 components that will saturate, the failure mode of each, and a smallest-step mitigation. ` +
      `Baseline / assumptions: ${asm || "current load profile and infra envelope"}.`,
    expectedOutputs: [
      "First saturation point",
      "Second saturation point",
      "Mitigation steps",
      "Cost delta",
    ],
  },
  {
    id: "migration-risk",
    label: "Migration risk",
    hint: "Plan a migration with N rollback steps",
    buildPrompt: (delta, asm) =>
      `Plan a migration with ${delta} discrete rollback step${delta === 1 ? "" : "s"}. ` +
      `Identify the cutover order, the verification gates between each step, and the kill criteria. ` +
      `Baseline / assumptions: ${asm || "source and target systems, data shape"}.`,
    expectedOutputs: [
      "Cutover sequence",
      "Verification gates",
      "Kill criteria",
      "Rollback playbook",
    ],
  },
] as const;

export function TechAdvisorSimulationForm({ onCompleted }: { onCompleted?: () => void }) {
  const { toast } = useToast();
  const [scenarioType, setScenarioType] = useState<typeof SCENARIOS[number]["id"]>("architecture-tradeoff");
  const [title, setTitle] = useState("");
  const [assumption, setAssumption] = useState("");
  const [deltaPct, setDeltaPct] = useState<number>(3);
  const [submitting, setSubmitting] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === scenarioType)!;

  const livePrompt = useMemo(
    () => scenario.buildPrompt(deltaPct, assumption.trim()),
    [scenario, deltaPct, assumption],
  );

  const livePayload = useMemo(
    () => ({
      advisorId: "tech-advisor" as const,
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

  const numericLabel = scenarioType === "scaling-threshold"
    ? "Load multiplier (×)"
    : scenarioType === "migration-risk"
      ? "Rollback steps"
      : "Options";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FlaskConical className="h-4 w-4" /> Run a tech scenario
        </CardTitle>
        <CardDescription>
          Compare architectures, project scaling thresholds, and stage migrations safely. Tech Advisor never deploys, modifies infra, or commits breaking changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="tech-scenarioType">Scenario type</Label>
            <select
              id="tech-scenarioType"
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
            <Label htmlFor="tech-deltaPct">{numericLabel}</Label>
            <Input
              id="tech-deltaPct"
              type="number"
              min={1}
              max={scenarioType === "scaling-threshold" ? 100 : 10}
              value={deltaPct}
              onChange={(e) => setDeltaPct(Number(e.target.value))}
              disabled={submitting}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="tech-title">Scenario title</Label>
          <Input
            id="tech-title"
            placeholder={scenario.hint}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div>
          <Label htmlFor="tech-assumption">Assumptions (optional)</Label>
          <Textarea
            id="tech-assumption"
            rows={2}
            placeholder="Current stack, load profile, constraints…"
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
            Tech Advisor never deploys to production, modifies infra live, or commits breaking changes. Outputs are drafts you can adopt or discard.
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