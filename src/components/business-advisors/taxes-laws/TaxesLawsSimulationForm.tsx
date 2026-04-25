// ═══════════════════════════════════════════════════════════════
// SITA OS — Taxes & Laws Advisor "Discuss a Scenario" form.
// L1-suggest authority: this is NOT a decision tool. Each scenario
// is framed as a structured DISCUSSION the operator can take to a
// licensed professional. Outputs are explicitly non-authoritative.
// Persistent professional disclaimer surrounds inputs and outputs.
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
import { ProfessionalDisclaimerBanner } from "./ProfessionalDisclaimerBanner";

interface ScenarioMeta {
  id: "entity-structure-discussion" | "deduction-prep-discussion" | "compliance-readiness-discussion";
  label: string;
  hint: string;
  buildPrompt: (delta: number, asm: string) => string;
  expectedOutputs: readonly string[];
}

const SCENARIOS: readonly ScenarioMeta[] = [
  {
    id: "entity-structure-discussion",
    label: "Entity-structure discussion",
    hint: "Compare N entity structures the operator should discuss with their attorney",
    buildPrompt: (delta, asm) =>
      `Suggest discussion points for comparing ${delta} entity structure option${delta === 1 ? "" : "s"} (e.g. sole prop / LLC / S-corp / C-corp / partnership). ` +
      `Output a structured DISCUSSION CHECKLIST the operator can take to a licensed attorney/CPA — never a recommendation, never advice. ` +
      `Cover: filing implications to ask about, governance questions, common pitfalls to flag, and what evidence to bring. ` +
      `Baseline / context: ${asm || "current operating context, jurisdiction unspecified"}. ` +
      `Suggestion only — not legal/tax advice. Remind the user to verify with a licensed professional.`,
    expectedOutputs: [
      "Discussion-point matrix",
      "Questions for attorney/CPA",
      "Evidence to bring",
      "Common pitfalls to flag",
    ],
  },
  {
    id: "deduction-prep-discussion",
    label: "Deduction-preparation discussion",
    hint: "Organize N deduction categories to discuss with a CPA",
    buildPrompt: (delta, asm) =>
      `Suggest preparation prompts for organizing ${delta} potential deduction categor${delta === 1 ? "y" : "ies"} (e.g. home office, vehicle, equipment, travel, education, contractor). ` +
      `Output a CHECKLIST of: (a) what records to assemble per category, (b) which questions to ask the CPA before claiming, (c) red-flag patterns the CPA will likely probe. ` +
      `Baseline / context: ${asm || "small business, jurisdiction unspecified"}. ` +
      `Suggestion only — never tax advice. Remind the user to verify deductibility with a licensed CPA.`,
    expectedOutputs: [
      "Records-to-assemble checklist",
      "Questions for CPA",
      "Red-flag patterns",
      "Documentation gaps",
    ],
  },
  {
    id: "compliance-readiness-discussion",
    label: "Compliance-readiness discussion",
    hint: "Stress-test N compliance domains the operator should review",
    buildPrompt: (delta, asm) =>
      `Suggest a readiness-review checklist across ${delta} compliance domain${delta === 1 ? "" : "s"} (e.g. data privacy, employment, contracts, IP, sales tax). ` +
      `Output: (a) what the operator should self-audit before engaging counsel, (b) the questions to take to counsel, (c) typical evidence the operator needs to produce. ` +
      `Baseline / context: ${asm || "early-stage business, jurisdiction unspecified"}. ` +
      `Suggestion only — not legal advice. Remind the user to engage qualified counsel.`,
    expectedOutputs: [
      "Self-audit checklist",
      "Questions for counsel",
      "Evidence inventory",
      "Escalation triggers",
    ],
  },
] as const;

export function TaxesLawsSimulationForm({ onCompleted }: { onCompleted?: () => void }) {
  const { toast } = useToast();
  const [scenarioType, setScenarioType] = useState<typeof SCENARIOS[number]["id"]>("entity-structure-discussion");
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
      advisorId: "taxes-laws-advisor" as const,
      scenarioTitle: title.trim() || `(untitled — ${scenario.label})`,
      inputs: { scenario_type: scenario.id, delta: deltaCount, suggest_only: true },
      assumptions: { narrative: assumption.trim() || scenario.hint, disclaimer: "preparation only — not legal/tax advice" },
    }),
    [scenario, title, deltaCount, assumption],
  );

  async function handleRun() {
    if (!title.trim()) {
      toast({ title: "Add a discussion title", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const r = await runAdvisorSimulation(livePayload);
      toast({
        title: r.status === "completed" ? "Discussion checklist ready" : "Discussion failed",
        description:
          r.status === "completed"
            ? `Confidence ${Math.round(r.confidence * 100)}% — verify with a licensed professional.`
            : r.riskSummary,
        variant: r.status === "completed" ? "default" : "destructive",
      });
      setTitle("");
      setAssumption("");
      onCompleted?.();
    } catch (err) {
      toast({
        title: "Discussion failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const numericLabel = scenarioType === "entity-structure-discussion"
    ? "Entity structures to compare"
    : scenarioType === "deduction-prep-discussion"
      ? "Deduction categories"
      : "Compliance domains";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FlaskConical className="h-4 w-4" /> Discuss a tax / legal scenario
        </CardTitle>
        <CardDescription>
          Structured discussion checklists you can take to a licensed CPA or attorney. Taxes & Laws Advisor never files, signs, drafts, or advises.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ProfessionalDisclaimerBanner />

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="taxlaw-scenarioType">Scenario type</Label>
            <select
              id="taxlaw-scenarioType"
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
            <Label htmlFor="taxlaw-deltaCount">{numericLabel}</Label>
            <Input
              id="taxlaw-deltaCount"
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
          <Label htmlFor="taxlaw-title">Discussion title</Label>
          <Input
            id="taxlaw-title"
            placeholder={scenario.hint}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div>
          <Label htmlFor="taxlaw-assumption">Context (optional)</Label>
          <Textarea
            id="taxlaw-assumption"
            rows={2}
            placeholder="Jurisdiction, entity stage, # employees, revenue band…"
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
          <AlertTitle className="text-xs">Suggestion only — not authoritative</AlertTitle>
          <AlertDescription className="text-xs">
            Output is a discussion checklist for use with a licensed professional. Taxes & Laws Advisor never files returns, signs documents, drafts contracts, or provides tax/legal advice.
          </AlertDescription>
        </Alert>
        <div className="flex justify-end">
          <Button onClick={handleRun} disabled={submitting}>
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Preparing…</>
            ) : (
              "Prepare discussion checklist"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}