// ═══════════════════════════════════════════════════════════════
// SITA OS — Imports & Exports Advisor "Run a Scenario" form.
// Test sourcing options, tariff exposure, and logistics tradeoffs
// safely. Live preview + draft-only.
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
  id: "sourcing-comparison" | "tariff-exposure" | "logistics-tradeoff";
  label: string;
  hint: string;
  buildPrompt: (delta: number, asm: string) => string;
  expectedOutputs: readonly string[];
}

const SCENARIOS: readonly ScenarioMeta[] = [
  {
    id: "sourcing-comparison",
    label: "Sourcing comparison",
    hint: "Compare N candidate vendors / countries of origin",
    buildPrompt: (delta, asm) =>
      `Compare ${delta} candidate sourcing option${delta === 1 ? "" : "s"} for the same SKU. ` +
      `Identify the tradeoffs (unit cost, lead time, tariff exposure, supplier risk, MOQ) and recommend the lowest-risk path forward. ` +
      `Baseline / assumptions: ${asm || "current sourcing constraints and target margin"}.`,
    expectedOutputs: [
      "Sourcing matrix",
      "Recommended vendor",
      "Risk register",
      "Switching cost",
    ],
  },
  {
    id: "tariff-exposure",
    label: "Tariff exposure",
    hint: "What is the impact of an N% tariff change?",
    buildPrompt: (delta, asm) =>
      `Project the landed-cost impact of a ${delta}% tariff change on the current import flow. ` +
      `Identify the SKUs most exposed, the margin compression, and a smallest-step mitigation (re-source, re-classify, absorb, pass through). ` +
      `Baseline / assumptions: ${asm || "current HS codes, country mix, and pricing"}.`,
    expectedOutputs: [
      "Most-exposed SKUs",
      "Margin impact",
      "Mitigation options",
      "Validation steps",
    ],
  },
  {
    id: "logistics-tradeoff",
    label: "Logistics tradeoff",
    hint: "Compare N freight modes / routes",
    buildPrompt: (delta, asm) =>
      `Compare ${delta} freight mode/route option${delta === 1 ? "" : "s"} for an inbound shipment. ` +
      `Score each on cost, transit time, reliability, customs friction, and carbon footprint. Recommend the option that best fits the constraint. ` +
      `Baseline / assumptions: ${asm || "origin, destination, volume, and SLA"}.`,
    expectedOutputs: [
      "Mode/route matrix",
      "Recommended path",
      "Customs friction notes",
      "Fallback plan",
    ],
  },
] as const;

export function ImportsExportsSimulationForm({ onCompleted }: { onCompleted?: () => void }) {
  const { toast } = useToast();
  const [scenarioType, setScenarioType] = useState<typeof SCENARIOS[number]["id"]>("sourcing-comparison");
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
      advisorId: "imports-exports-advisor" as const,
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

  const numericLabel = scenarioType === "tariff-exposure"
    ? "Tariff change (%)"
    : scenarioType === "logistics-tradeoff"
      ? "Modes/routes to compare"
      : "Vendors to compare";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FlaskConical className="h-4 w-4" /> Run a trade scenario
        </CardTitle>
        <CardDescription>
          Compare sourcing, tariff exposure, and logistics tradeoffs safely. Imports & Exports Advisor never files customs, commits supplier contracts, or modifies live shipments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="impexp-scenarioType">Scenario type</Label>
            <select
              id="impexp-scenarioType"
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
            <Label htmlFor="impexp-deltaPct">{numericLabel}</Label>
            <Input
              id="impexp-deltaPct"
              type="number"
              min={1}
              max={scenarioType === "tariff-exposure" ? 100 : 10}
              value={deltaPct}
              onChange={(e) => setDeltaPct(Number(e.target.value))}
              disabled={submitting}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="impexp-title">Scenario title</Label>
          <Input
            id="impexp-title"
            placeholder={scenario.hint}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div>
          <Label htmlFor="impexp-assumption">Assumptions (optional)</Label>
          <Textarea
            id="impexp-assumption"
            rows={2}
            placeholder="HS codes, current vendors, target margin, lead time…"
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
            Imports & Exports Advisor never files customs, commits supplier contracts, or modifies live shipments. Outputs are drafts you can adopt or discard.
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