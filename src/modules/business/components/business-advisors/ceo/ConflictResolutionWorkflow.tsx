// ═══════════════════════════════════════════════════════════════
// SITA OS — CEO Conflict Resolution Workflow
//
// CFO-style "choose option A/B" workflow for cross-advisor
// conflicts surfaced on the CEO page. Each conflict pair becomes
// an interactive decision card:
//
//   1. Operator selects Option A, Option B, or "Need a tradeoff".
//   2. Operator MUST tick the explicit acknowledgement that the
//      CEO advisor is recommend-only — no execution, no commits,
//      no external announcements.
//   3. Only then is the "Recommend tradeoff" button enabled, which
//      asks the CEO advisor for a structured tradeoff memo
//      (recommend-only).
//
// The component is presentation-only — it composes the existing
// askBusinessAdvisor() recommend-only path. It does NOT execute
// any action, does NOT mutate recommendation rows.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, GitBranch, ShieldAlert, ThumbsUp, ThumbsDown, Scale } from "lucide-react";
import { askBusinessAdvisor } from "@/lib/ai-platform/runtime";
import { cn } from "@/lib/utils";

export interface ConflictRec {
  id: string;
  advisor_id: string;
  title: string;
  summary: string;
  category: string;
  urgency_score: number;
  business_impact_score: number;
  reversibility_score: number;
  confidence_score: number;
}

export interface ConflictResolutionItem {
  id: string;
  domain: string;
  recA: ConflictRec;
  recB: ConflictRec;
}

type Choice = "A" | "B" | "tradeoff";

interface ConflictRowState {
  choice: Choice | null;
  acknowledged: boolean;
  loading: boolean;
  memo: string | null;
}

const ACKNOWLEDGEMENT_TEXT =
  "I understand the CEO advisor is recommend-only — it will not execute the call, commit org changes, or make external announcements.";

function buildPrompt(conflict: ConflictResolutionItem, choice: Choice): string {
  const { recA, recB, domain } = conflict;
  const header = `Cross-advisor conflict in the ${domain} domain.\n\n` +
    `Option A — ${recA.advisor_id} — "${recA.title}" (category: ${recA.category}, urgency ${recA.urgency_score}, impact ${recA.business_impact_score})\n  ${recA.summary}\n\n` +
    `Option B — ${recB.advisor_id} — "${recB.title}" (category: ${recB.category}, urgency ${recB.urgency_score}, impact ${recB.business_impact_score})\n  ${recB.summary}\n\n`;

  const ask =
    choice === "tradeoff"
      ? "The operator wants a balanced TRADEOFF MEMO. Produce: (1) what each option optimizes for, (2) the underlying tradeoff in one sentence, (3) a sequencing or compromise that captures the upside of both, (4) the single signal that should tilt the call later."
      : choice === "A"
        ? "The operator is leaning toward Option A. Produce a RECOMMEND-ONLY memo: (1) the strongest case FOR Option A, (2) the principled risks of dismissing Option B, (3) a mitigation plan that preserves Option B's upside, (4) the reversal cost if A turns out wrong."
        : "The operator is leaning toward Option B. Produce a RECOMMEND-ONLY memo: (1) the strongest case FOR Option B, (2) the principled risks of dismissing Option A, (3) a mitigation plan that preserves Option A's upside, (4) the reversal cost if B turns out wrong.";

  return `${header}${ask}\n\nReply as a structured memo. Do NOT commit any change, do NOT authorize spend, do NOT trigger external communication. Recommend only.`;
}

export function ConflictResolutionWorkflow({
  conflicts,
}: {
  conflicts: ConflictResolutionItem[];
}) {
  const [state, setState] = useState<Record<string, ConflictRowState>>({});

  if (conflicts.length === 0) return null;

  function update(id: string, patch: Partial<ConflictRowState>) {
    setState((s) => ({
      ...s,
      [id]: {
        choice: null,
        acknowledged: false,
        loading: false,
        memo: null,
        ...s[id],
        ...patch,
      },
    }));
  }

  async function recommend(conflict: ConflictResolutionItem) {
    const row = state[conflict.id];
    if (!row?.choice || !row.acknowledged) return;
    update(conflict.id, { loading: true, memo: null });
    try {
      const r = await askBusinessAdvisor({
        advisorId: "ceo-advisor",
        prompt: buildPrompt(conflict, row.choice),
        intent: "ask",
      });
      update(conflict.id, { loading: false, memo: r.response.content });
    } catch (err) {
      update(conflict.id, {
        loading: false,
        memo: `Could not produce a memo right now: ${(err as Error).message}`,
      });
    }
  }

  return (
    <div className="space-y-2 mt-2" data-testid="ceo-conflict-workflow">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <GitBranch className="h-3 w-3" />
        <span>Conflict resolution workflow</span>
      </div>
      {conflicts.map((c) => {
        const row: ConflictRowState =
          state[c.id] ?? { choice: null, acknowledged: false, loading: false, memo: null };
        const canRecommend = !!row.choice && row.acknowledged && !row.loading;
        return (
          <div
            key={c.id}
            className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 space-y-3"
            data-testid={`ceo-conflict-${c.id}`}
          >
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-destructive" />
              <p className="text-xs font-semibold uppercase tracking-wide text-destructive">
                {c.domain} — choose A, B, or request tradeoff
              </p>
            </div>

            {/* Side-by-side options */}
            <div className="grid gap-2 sm:grid-cols-2">
              <OptionCard
                letter="A"
                rec={c.recA}
                selected={row.choice === "A"}
                onSelect={() => update(c.id, { choice: "A", memo: null })}
              />
              <OptionCard
                letter="B"
                rec={c.recB}
                selected={row.choice === "B"}
                onSelect={() => update(c.id, { choice: "B", memo: null })}
              />
            </div>

            {/* Choice radio group (also covers tradeoff) */}
            <RadioGroup
              value={row.choice ?? ""}
              onValueChange={(v) => update(c.id, { choice: v as Choice, memo: null })}
              className="flex flex-wrap gap-3"
            >
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="A" id={`${c.id}-A`} />
                <Label htmlFor={`${c.id}-A`} className="text-xs cursor-pointer">Lean A</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="B" id={`${c.id}-B`} />
                <Label htmlFor={`${c.id}-B`} className="text-xs cursor-pointer">Lean B</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="tradeoff" id={`${c.id}-T`} />
                <Label htmlFor={`${c.id}-T`} className="text-xs cursor-pointer">Need a tradeoff memo</Label>
              </div>
            </RadioGroup>

            {/* Mandatory acknowledgement */}
            <label
              className={cn(
                "flex items-start gap-2 rounded-md border p-2 transition-colors cursor-pointer",
                row.acknowledged
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-border bg-background",
              )}
            >
              <Checkbox
                checked={row.acknowledged}
                onCheckedChange={(v) => update(c.id, { acknowledged: v === true })}
                aria-label="Acknowledge CEO advisor is recommend-only"
                className="mt-0.5"
              />
              <div className="flex items-start gap-1.5 text-[11px] leading-snug">
                <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-foreground/80">{ACKNOWLEDGEMENT_TEXT}</span>
              </div>
            </label>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-[10px] text-muted-foreground">
                {!row.choice
                  ? "Pick A, B, or tradeoff to continue."
                  : !row.acknowledged
                    ? "Tick the acknowledgement to enable the recommendation."
                    : "Ready — request a recommend-only memo."}
              </p>
              <Button
                size="sm"
                variant={row.choice === "tradeoff" ? "default" : "outline"}
                disabled={!canRecommend}
                onClick={() => recommend(c)}
                className="text-xs"
              >
                {row.loading ? (
                  <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Drafting…</>
                ) : row.choice === "tradeoff" ? (
                  "Recommend tradeoff"
                ) : row.choice === "A" ? (
                  "Recommend choosing A"
                ) : row.choice === "B" ? (
                  "Recommend choosing B"
                ) : (
                  "Recommend"
                )}
              </Button>
            </div>

            {row.memo && (
              <div className="rounded-md border border-border bg-muted/40 p-2">
                <p className="text-[10px] uppercase text-muted-foreground mb-1">
                  CEO memo · recommend-only
                </p>
                <p className="text-xs whitespace-pre-wrap leading-relaxed">{row.memo}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function OptionCard({
  letter,
  rec,
  selected,
  onSelect,
}: {
  letter: "A" | "B";
  rec: ConflictRec;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = letter === "A" ? ThumbsUp : ThumbsDown;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "text-left rounded-md border p-2 transition-all",
        selected
          ? "border-primary bg-primary/10 ring-1 ring-primary"
          : "border-border bg-background hover:bg-muted/40",
      )}
      data-testid={`ceo-conflict-option-${letter}`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className={cn(
            "h-5 w-5 rounded-full grid place-items-center text-[10px] font-bold",
            selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {letter}
        </span>
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] uppercase text-muted-foreground truncate">{rec.advisor_id}</span>
      </div>
      <p className="text-xs font-medium leading-snug line-clamp-2">{rec.title}</p>
      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{rec.summary}</p>
      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
        <span>u{Number(rec.urgency_score).toFixed(1)}</span>
        <span>·</span>
        <span>i{Number(rec.business_impact_score).toFixed(1)}</span>
        <span>·</span>
        <span>conf {Number(rec.confidence_score).toFixed(2)}</span>
      </div>
    </button>
  );
}

export default ConflictResolutionWorkflow;