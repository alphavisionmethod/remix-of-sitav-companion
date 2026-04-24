// ═══════════════════════════════════════════════════════════════
// SITA OS — Growth Advisor detail drawer.
//
// Opens when you click a row in any Growth recommendation list:
//   • stage      → full funnel-stage record + neighbour stages
//   • experiment → full experiment record (variants, lift, n)
//   • cohort     → lifecycle stage + revenue + customer count
// Drafts a Growth memo on demand. Read-only — Growth Advisor never
// touches pricing or external experiments live.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, GitBranch, FlaskConical, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor } from "@/lib/ai-platform/runtime";

export type GrowthDrawerTarget =
  | { kind: "stage"; id: string; label: string }
  | { kind: "experiment"; id: string; label: string }
  | { kind: "cohort"; id: string; label: string };

interface StageDetail {
  id: string;
  stage_name: string;
  stage_order: number;
  entry_count: number | null;
  exit_count: number | null;
  avg_duration_days: number | null;
  conversion_rate: number | null;
  description: string | null;
}

interface ExperimentDetail {
  id: string;
  name: string;
  description: string | null;
  status: string;
  variant_a: string;
  variant_b: string;
  conversion_rate_a: number | null;
  conversion_rate_b: number | null;
  sample_size: number | null;
  confidence_level: number | null;
  winner: string | null;
  started_at: string | null;
  ended_at: string | null;
}

interface CohortDetail {
  id: string;
  stage_name: string;
  stage_order: number;
  customer_count: number | null;
  avg_revenue_cents: number | null;
  description: string | null;
  criteria: string | null;
}

interface DetailState {
  stage?: StageDetail | null;
  neighbours?: StageDetail[];
  experiment?: ExperimentDetail | null;
  cohort?: CohortDetail | null;
  loading: boolean;
}

function pct(v: number | null | undefined): string {
  if (v == null) return "—";
  const n = Number(v);
  const normalized = n > 1 ? n : n * 100;
  return `${normalized.toFixed(2)}%`;
}

function fmtMoney(cents: number | null | undefined): string {
  if (cents == null) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(cents) / 100);
  } catch {
    return `${(Number(cents) / 100).toFixed(0)} USD`;
  }
}

interface Props {
  target: GrowthDrawerTarget | null;
  onClose: () => void;
}

export function GrowthDetailDrawer({ target, onClose }: Props) {
  const [state, setState] = useState<DetailState>({ loading: false });
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDraft(null);
    if (!target) {
      setState({ loading: false });
      return;
    }
    setState({ loading: true });

    async function load() {
      if (!target) return;
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) {
        if (!cancelled) setState({ loading: false });
        return;
      }

      if (target.kind === "stage") {
        const { data: stage } = await supabase
          .from("customer_journey_stages")
          .select("id, stage_name, stage_order, entry_count, exit_count, avg_duration_days, conversion_rate, description")
          .eq("user_id", userId)
          .eq("id", target.id)
          .maybeSingle();
        const order = stage?.stage_order ?? 0;
        const { data: neighbours } = await supabase
          .from("customer_journey_stages")
          .select("id, stage_name, stage_order, entry_count, exit_count, avg_duration_days, conversion_rate, description")
          .eq("user_id", userId)
          .gte("stage_order", Math.max(0, order - 1))
          .lte("stage_order", order + 1)
          .order("stage_order", { ascending: true });
        if (!cancelled) {
          setState({
            loading: false,
            stage: (stage ?? null) as StageDetail | null,
            neighbours: ((neighbours ?? []) as StageDetail[]).filter((s) => s.id !== target.id),
          });
        }
      } else if (target.kind === "experiment") {
        const { data: experiment } = await supabase
          .from("conversion_experiments")
          .select("id, name, description, status, variant_a, variant_b, conversion_rate_a, conversion_rate_b, sample_size, confidence_level, winner, started_at, ended_at")
          .eq("user_id", userId)
          .eq("id", target.id)
          .maybeSingle();
        if (!cancelled) {
          setState({ loading: false, experiment: (experiment ?? null) as ExperimentDetail | null });
        }
      } else {
        const { data: cohort } = await supabase
          .from("customer_lifecycle_stages")
          .select("id, stage_name, stage_order, customer_count, avg_revenue_cents, description, criteria")
          .eq("user_id", userId)
          .eq("id", target.id)
          .maybeSingle();
        if (!cancelled) {
          setState({ loading: false, cohort: (cohort ?? null) as CohortDetail | null });
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [target]);

  async function draftMemo() {
    if (!target) return;
    setDrafting(true);
    try {
      let prompt = "";
      if (target.kind === "stage" && state.stage) {
        prompt = `Funnel stage "${state.stage.stage_name}" (order ${state.stage.stage_order}) is converting at ${pct(state.stage.conversion_rate)} with ${state.stage.entry_count ?? 0} entries and ${state.stage.exit_count ?? 0} exits, average duration ${Number(state.stage.avg_duration_days ?? 0).toFixed(1)}d. Recommend the top 3 hypotheses for the leak and one cheap experiment per hypothesis. Recommend-only.`;
      } else if (target.kind === "experiment" && state.experiment) {
        prompt = `Experiment "${state.experiment.name}" — ${state.experiment.variant_a} vs ${state.experiment.variant_b}, n=${state.experiment.sample_size ?? 0}, confidence ${state.experiment.confidence_level ?? "—"}, started ${state.experiment.started_at ?? "—"}. Recommend whether to declare a winner, extend, or kill. Recommend-only.`;
      } else if (target.kind === "cohort" && state.cohort) {
        prompt = `Lifecycle cohort "${state.cohort.stage_name}" currently holds ${state.cohort.customer_count ?? 0} customers (criteria: ${state.cohort.criteria ?? "not specified"}). Recommend whether the cohort definition is too narrow, the upstream stage is leaking, or the cohort should be retired. Recommend-only.`;
      } else {
        return;
      }
      const r = await askBusinessAdvisor({
        advisorId: "growth-advisor",
        prompt,
        intent: "draft",
      });
      setDraft(r.response.content);
    } finally {
      setDrafting(false);
    }
  }

  return (
    <Sheet open={!!target} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-md w-full overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-base flex items-center gap-2">
            {target?.kind === "stage" && <GitBranch className="h-4 w-4" />}
            {target?.kind === "experiment" && <FlaskConical className="h-4 w-4" />}
            {target?.kind === "cohort" && <Users className="h-4 w-4" />}
            {target?.label ?? "Growth detail"}
          </SheetTitle>
          <SheetDescription className="text-xs">
            Read-only — Growth Advisor never modifies pricing or launches external experiments.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-3 mt-3">
          {state.loading && <Skeleton className="h-32 w-full" />}

          {!state.loading && target?.kind === "stage" && state.stage && (
            <div className="space-y-3">
              <div className="rounded-md border border-border p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Funnel stage</p>
                <p className="text-sm font-semibold">{state.stage.stage_name}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div><span className="text-muted-foreground">Conversion: </span>{pct(state.stage.conversion_rate)}</div>
                  <div><span className="text-muted-foreground">Order: </span>{state.stage.stage_order}</div>
                  <div><span className="text-muted-foreground">Entries: </span>{state.stage.entry_count ?? 0}</div>
                  <div><span className="text-muted-foreground">Exits: </span>{state.stage.exit_count ?? 0}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Avg duration: </span>{Number(state.stage.avg_duration_days ?? 0).toFixed(2)} days</div>
                </div>
                {state.stage.description && (
                  <p className="text-xs text-muted-foreground mt-2">{state.stage.description}</p>
                )}
              </div>
              {state.neighbours && state.neighbours.length > 0 && (
                <div className="rounded-md border border-border p-3">
                  <p className="text-[10px] uppercase text-muted-foreground mb-2">Adjacent stages</p>
                  <ul className="space-y-1.5">
                    {state.neighbours.map((n) => (
                      <li key={n.id} className="flex items-center justify-between text-xs">
                        <span className="truncate">#{n.stage_order} · {n.stage_name}</span>
                        <Badge variant="outline" className="text-[10px] h-4">{pct(n.conversion_rate)}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!state.loading && target?.kind === "experiment" && state.experiment && (
            <div className="space-y-3">
              <div className="rounded-md border border-border p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Experiment</p>
                <p className="text-sm font-semibold">{state.experiment.name}</p>
                {state.experiment.description && (
                  <p className="text-xs text-muted-foreground mt-1">{state.experiment.description}</p>
                )}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div><span className="text-muted-foreground">Status: </span>{state.experiment.status}</div>
                  <div><span className="text-muted-foreground">n: </span>{state.experiment.sample_size ?? 0}</div>
                  <div><span className="text-muted-foreground">A: </span>{state.experiment.variant_a}</div>
                  <div><span className="text-muted-foreground">B: </span>{state.experiment.variant_b}</div>
                  <div><span className="text-muted-foreground">Rate A: </span>{pct(state.experiment.conversion_rate_a)}</div>
                  <div><span className="text-muted-foreground">Rate B: </span>{pct(state.experiment.conversion_rate_b)}</div>
                  <div><span className="text-muted-foreground">Confidence: </span>{state.experiment.confidence_level == null ? "—" : Number(state.experiment.confidence_level).toFixed(2)}</div>
                  <div><span className="text-muted-foreground">Winner: </span>{state.experiment.winner || "—"}</div>
                </div>
              </div>
            </div>
          )}

          {!state.loading && target?.kind === "cohort" && state.cohort && (
            <div className="space-y-3">
              <div className="rounded-md border border-border p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Lifecycle cohort</p>
                <p className="text-sm font-semibold">{state.cohort.stage_name}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div><span className="text-muted-foreground">Customers: </span>{state.cohort.customer_count ?? 0}</div>
                  <div><span className="text-muted-foreground">Avg revenue: </span>{fmtMoney(state.cohort.avg_revenue_cents)}</div>
                </div>
                {state.cohort.criteria && (
                  <div className="mt-2">
                    <p className="text-[10px] uppercase text-muted-foreground">Criteria</p>
                    <p className="text-xs">{state.cohort.criteria}</p>
                  </div>
                )}
                {state.cohort.description && (
                  <p className="text-xs text-muted-foreground mt-2">{state.cohort.description}</p>
                )}
              </div>
            </div>
          )}

          {!state.loading && target && !state.stage && !state.experiment && !state.cohort && (
            <Alert>
              <AlertDescription className="text-xs">
                Could not load this record — it may have been removed or you no longer have access.
              </AlertDescription>
            </Alert>
          )}

          {draft && (
            <div className="mt-3 rounded-md border border-border bg-muted/30 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                Growth Advisor draft
              </p>
              <p className="text-xs whitespace-pre-wrap">{draft}</p>
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border pt-3 mt-2">
          <Button
            onClick={draftMemo}
            disabled={drafting || state.loading}
            className="w-full"
            size="sm"
          >
            {drafting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Drafting…</>
            ) : (
              "Draft Growth memo"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}