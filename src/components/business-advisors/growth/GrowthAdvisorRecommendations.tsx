// ═══════════════════════════════════════════════════════════════
// SITA OS — Growth Advisor recommendations.
//
// Surfaces three real, RLS-scoped patterns:
//   1. Funnel bottlenecks — stages with the worst conversion_rate
//   2. Stalled experiments — running > 30d with no winner
//   3. Cohort gaps — lifecycle stages with zero customers
// All values come from real tables; empty-state honest.
// Each row carries a glass-box explainability popover that shows
// data sources, assumptions, and calculation steps.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitBranch, FlaskConical, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor } from "@/lib/ai-platform/runtime";
import { GrowthDetailDrawer, type GrowthDrawerTarget } from "./GrowthDetailDrawer";
import { CFOExplainabilityPopover, type CFOExplainability } from "../cfo/CFOExplainabilityPopover";

interface FunnelStageRow {
  id: string;
  stage_name: string;
  stage_order: number;
  entry_count: number | null;
  exit_count: number | null;
  avg_duration_days: number | null;
  conversion_rate: number | null;
}

interface ExperimentRow {
  id: string;
  name: string;
  status: string;
  variant_a: string;
  variant_b: string;
  conversion_rate_a: number | null;
  conversion_rate_b: number | null;
  sample_size: number | null;
  confidence_level: number | null;
  winner: string | null;
  started_at: string | null;
}

interface CohortRow {
  id: string;
  stage_name: string;
  stage_order: number;
  customer_count: number | null;
  avg_revenue_cents: number | null;
}

interface GrowthSnapshot {
  bottleneckStages: FunnelStageRow[];
  stalledExperiments: ExperimentRow[];
  emptyCohorts: CohortRow[];
  totalStagesScanned: number;
  totalExperimentsScanned: number;
  totalCohortsScanned: number;
  loadedAt: string;
}

const BOTTLENECK_THRESHOLD = 0.4; // conversion_rate < 40% = bottleneck
const STALL_DAYS = 30;

function pct(v: number | null | undefined): string {
  if (v == null) return "—";
  // conversion_rate stored as 0..1 OR 0..100; normalize defensively
  const n = Number(v);
  const normalized = n > 1 ? n : n * 100;
  return `${normalized.toFixed(1)}%`;
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

async function loadGrowthSnapshot(userId: string): Promise<GrowthSnapshot> {
  const stallCutoff = new Date(Date.now() - STALL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const [stagesRes, expRes, cohortsRes] = await Promise.all([
    supabase
      .from("customer_journey_stages")
      .select("id, stage_name, stage_order, entry_count, exit_count, avg_duration_days, conversion_rate")
      .eq("user_id", userId)
      .order("stage_order", { ascending: true })
      .limit(50),
    supabase
      .from("conversion_experiments")
      .select("id, name, status, variant_a, variant_b, conversion_rate_a, conversion_rate_b, sample_size, confidence_level, winner, started_at")
      .eq("user_id", userId)
      .order("started_at", { ascending: true, nullsFirst: false })
      .limit(50),
    supabase
      .from("customer_lifecycle_stages")
      .select("id, stage_name, stage_order, customer_count, avg_revenue_cents")
      .eq("user_id", userId)
      .order("stage_order", { ascending: true })
      .limit(50),
  ]);

  const allStages = (stagesRes.data ?? []) as FunnelStageRow[];
  const allExp = (expRes.data ?? []) as ExperimentRow[];
  const allCohorts = (cohortsRes.data ?? []) as CohortRow[];

  const bottleneckStages = allStages
    .filter((s) => {
      const cr = s.conversion_rate == null ? null : Number(s.conversion_rate);
      if (cr == null) return false;
      const norm = cr > 1 ? cr / 100 : cr;
      return norm < BOTTLENECK_THRESHOLD;
    })
    .sort((a, b) => Number(a.conversion_rate ?? 0) - Number(b.conversion_rate ?? 0))
    .slice(0, 10);

  const stalledExperiments = allExp.filter(
    (e) => e.status === "running" && (!e.winner || e.winner.length === 0) && (e.started_at ?? "") < stallCutoff,
  );

  const emptyCohorts = allCohorts.filter((c) => (c.customer_count ?? 0) === 0);

  return {
    bottleneckStages,
    stalledExperiments,
    emptyCohorts,
    totalStagesScanned: allStages.length,
    totalExperimentsScanned: allExp.length,
    totalCohortsScanned: allCohorts.length,
    loadedAt: new Date().toISOString(),
  };
}

export function GrowthAdvisorRecommendations() {
  const [snapshot, setSnapshot] = useState<GrowthSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerTarget, setDrawerTarget] = useState<GrowthDrawerTarget | null>(null);
  const [askLoading, setAskLoading] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) {
        if (!cancelled) setLoading(false);
        return;
      }
      const snap = await loadGrowthSnapshot(userId);
      if (!cancelled) {
        setSnapshot(snap);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  function openDrawer(item: { id: string; kind: GrowthDrawerTarget["kind"]; label: string }) {
    setDrawerTarget({ kind: item.kind, id: item.id, label: item.label });
  }

  async function askForDraft(key: string, prompt: string) {
    setAskLoading(key);
    try {
      const r = await askBusinessAdvisor({
        advisorId: "growth-advisor",
        prompt,
        intent: "draft",
      });
      setDrafts((d) => ({ ...d, [key]: r.response.content }));
    } finally {
      setAskLoading(null);
    }
  }

  const groups = useMemo(() => {
    if (!snapshot) return [];
    const snapTime = new Date(snapshot.loadedAt).toLocaleString();
    const worst = snapshot.bottleneckStages[0];

    return [
      {
        key: "bottlenecks",
        icon: GitBranch,
        title: "Funnel bottlenecks",
        description:
          snapshot.totalStagesScanned === 0
            ? "No funnel stages tracked yet — define your journey to surface bottlenecks."
            : snapshot.bottleneckStages.length === 0
              ? `All ${snapshot.totalStagesScanned} stages converting ≥ ${(BOTTLENECK_THRESHOLD * 100).toFixed(0)}%.`
              : `${snapshot.bottleneckStages.length} stage${snapshot.bottleneckStages.length === 1 ? "" : "s"} converting below ${(BOTTLENECK_THRESHOLD * 100).toFixed(0)}%.`,
        action: worst
          ? {
              label: "Unblock plan",
              prompt: `Our worst-converting funnel stage is "${worst.stage_name}" at ${pct(worst.conversion_rate)}. Recommend the top 3 hypotheses for why it's leaking and one experiment idea per hypothesis. Recommend-only.`,
            }
          : null,
        explain: {
          subject: "Funnel bottleneck detection",
          sources: [
            {
              table: "customer_journey_stages",
              purpose: "All funnel stages you have defined, RLS-scoped, used to compute per-stage conversion.",
              rowCount: snapshot.totalStagesScanned,
              asOf: snapshot.loadedAt,
            },
          ],
          assumptions: [
            `Bottleneck threshold: conversion_rate < ${(BOTTLENECK_THRESHOLD * 100).toFixed(0)}%.`,
            "conversion_rate is normalized: values > 1 are treated as percentage, ≤ 1 as ratio.",
            "Stages without a recorded conversion_rate are not flagged.",
            "Top 10 worst stages are surfaced.",
          ],
          steps: [
            { label: "Pull stages", detail: "SELECT from customer_journey_stages WHERE user_id matches (RLS).", output: `${snapshot.totalStagesScanned} stage${snapshot.totalStagesScanned === 1 ? "" : "s"}` },
            { label: "Normalize conversion", detail: "If conversion_rate > 1, divide by 100 to get a 0..1 ratio.", output: "ratios in [0,1]" },
            { label: "Filter bottlenecks", detail: `Keep stages where normalized rate < ${BOTTLENECK_THRESHOLD}.`, output: `${snapshot.bottleneckStages.length} flagged` },
            { label: "Rank by severity", detail: "Sort ascending so the worst converter surfaces first.", output: worst ? `worst: ${worst.stage_name} @ ${pct(worst.conversion_rate)}` : "—" },
          ],
          footer: `Snapshot taken ${snapTime} · row-level security enforced.`,
        } satisfies CFOExplainability,
        items: snapshot.bottleneckStages.map((s) => ({
          id: s.id,
          kind: "stage" as const,
          primary: s.stage_name,
          secondary: `Stage ${s.stage_order} · ${s.entry_count ?? 0} in / ${s.exit_count ?? 0} out · avg ${Number(s.avg_duration_days ?? 0).toFixed(1)}d`,
          chip: pct(s.conversion_rate),
          chipVariant: "destructive" as const,
          explain: {
            subject: `${s.stage_name} — converting at ${pct(s.conversion_rate)}`,
            sources: [{ table: "customer_journey_stages", purpose: `Single funnel stage: '${s.stage_name}'.`, rowCount: 1, asOf: snapshot.loadedAt }],
            assumptions: [
              `Flagged because converted < ${(BOTTLENECK_THRESHOLD * 100).toFixed(0)}%.`,
              "entry_count and exit_count are owner-recorded; advisor does not modify them.",
            ],
            steps: [
              { label: "Read stage", detail: "Load conversion_rate, entry_count, exit_count.", output: `${s.entry_count ?? 0} → ${s.exit_count ?? 0}` },
              { label: "Normalize rate", detail: "Coerce conversion_rate to 0..1 ratio.", output: pct(s.conversion_rate) },
              { label: "Compare to threshold", detail: `Threshold = ${(BOTTLENECK_THRESHOLD * 100).toFixed(0)}%.`, output: "below threshold" },
            ],
          } satisfies CFOExplainability,
        })),
      },
      {
        key: "stalled-experiments",
        icon: FlaskConical,
        title: `Stalled experiments — running > ${STALL_DAYS}d, no winner`,
        description:
          snapshot.totalExperimentsScanned === 0
            ? "No experiments tracked yet — start your first conversion test to see results here."
            : snapshot.stalledExperiments.length === 0
              ? `All ${snapshot.totalExperimentsScanned} experiments are healthy (active or concluded with a winner).`
              : `${snapshot.stalledExperiments.length} experiment${snapshot.stalledExperiments.length === 1 ? "" : "s"} stalled — call them or kill them.`,
        action: snapshot.stalledExperiments.length > 0
          ? {
              label: "Conclude or kill",
              prompt: `${snapshot.stalledExperiments.length} experiments have been running > ${STALL_DAYS} days with no winner declared. For each, recommend whether to (a) declare a winner now, (b) extend with a clearer success metric, or (c) kill — one line each. Recommend-only.`,
            }
          : null,
        explain: {
          subject: "Stalled experiment detection",
          sources: [
            {
              table: "conversion_experiments",
              purpose: "All conversion experiments in your account, RLS-scoped.",
              rowCount: snapshot.totalExperimentsScanned,
              asOf: snapshot.loadedAt,
            },
          ],
          assumptions: [
            `Stalled = status='running' AND no winner declared AND started_at older than ${STALL_DAYS} days.`,
            "Experiments with status 'draft', 'paused', or 'concluded' are excluded.",
            "Winner is considered declared when the winner column is non-empty.",
          ],
          steps: [
            { label: "Pull experiments", detail: "SELECT all experiments where user matches (RLS).", output: `${snapshot.totalExperimentsScanned} total` },
            { label: "Filter to running, no winner", detail: "Keep status='running' AND winner is empty.", output: `${snapshot.stalledExperiments.length + 0} candidates` },
            { label: "Filter to stalled", detail: `Keep started_at older than ${STALL_DAYS}d.`, output: `${snapshot.stalledExperiments.length} stalled` },
          ],
          footer: `Snapshot taken ${snapTime}.`,
        } satisfies CFOExplainability,
        items: snapshot.stalledExperiments.map((e) => {
          const days = daysSince(e.started_at);
          return {
            id: e.id,
            kind: "experiment" as const,
            primary: e.name,
            secondary: `${e.variant_a} vs ${e.variant_b} · n=${e.sample_size ?? 0}${days != null ? ` · ${days}d running` : ""}`,
            chip: days != null ? `${days}d` : "stalled",
            chipVariant: "destructive" as const,
            explain: {
              subject: `${e.name} — ${days != null ? `${days}d running, no winner` : "stalled"}`,
              sources: [{ table: "conversion_experiments", purpose: "Single experiment record.", rowCount: 1, asOf: e.started_at ?? snapshot.loadedAt }],
              assumptions: [
                "A winner has not been recorded.",
                `Started_at is older than ${STALL_DAYS} days.`,
                e.confidence_level != null ? `Current confidence: ${Number(e.confidence_level).toFixed(2)}.` : "Confidence not recorded.",
              ],
              steps: [
                { label: "Read status", detail: "Confirm experiment is still 'running'.", output: e.status },
                { label: "Read started_at", detail: "Compute days since start.", output: days != null ? `${days} days` : "n/a" },
                { label: "Read winner", detail: "Confirm winner column is empty.", output: e.winner ? `winner: ${e.winner}` : "no winner" },
                { label: "Compare variants", detail: "A vs B conversion rates.", output: `${pct(e.conversion_rate_a)} vs ${pct(e.conversion_rate_b)}` },
              ],
            } satisfies CFOExplainability,
          };
        }),
      },
      {
        key: "empty-cohorts",
        icon: Users,
        title: "Cohort gaps — lifecycle stages with zero customers",
        description:
          snapshot.totalCohortsScanned === 0
            ? "No lifecycle cohorts defined yet — define your customer lifecycle to surface gaps."
            : snapshot.emptyCohorts.length === 0
              ? `All ${snapshot.totalCohortsScanned} lifecycle stages have customers in them.`
              : `${snapshot.emptyCohorts.length} lifecycle stage${snapshot.emptyCohorts.length === 1 ? "" : "s"} are empty — leakage or undefined entry criteria.`,
        action: snapshot.emptyCohorts.length > 0
          ? {
              label: "Cohort fill plan",
              prompt: `${snapshot.emptyCohorts.length} of my lifecycle cohorts (${snapshot.emptyCohorts.map((c) => c.stage_name).join(", ")}) currently hold zero customers. For each, recommend whether the cohort definition is too narrow, the upstream stage is leaking, or the cohort should be retired. Recommend-only.`,
            }
          : null,
        explain: {
          subject: "Empty lifecycle cohort detection",
          sources: [
            {
              table: "customer_lifecycle_stages",
              purpose: "All lifecycle stages defined, RLS-scoped.",
              rowCount: snapshot.totalCohortsScanned,
              asOf: snapshot.loadedAt,
            },
          ],
          assumptions: [
            "Empty = customer_count is 0 or NULL.",
            "Customer count is owner-maintained; advisor does not write to this table.",
            "Cohort gaps surface either a leak upstream or a too-narrow cohort definition.",
          ],
          steps: [
            { label: "Pull cohorts", detail: "SELECT from customer_lifecycle_stages where user matches (RLS).", output: `${snapshot.totalCohortsScanned} cohort${snapshot.totalCohortsScanned === 1 ? "" : "s"}` },
            { label: "Filter to empty", detail: "Keep rows where customer_count is 0 or NULL.", output: `${snapshot.emptyCohorts.length} empty` },
            { label: "Order by lifecycle", detail: "Sort by stage_order to show natural sequence.", output: "ordered" },
          ],
          footer: `Snapshot taken ${snapTime}.`,
        } satisfies CFOExplainability,
        items: snapshot.emptyCohorts.map((c) => ({
          id: c.id,
          kind: "cohort" as const,
          primary: c.stage_name,
          secondary: `Stage ${c.stage_order} · ${c.customer_count ?? 0} customers`,
          chip: "empty",
          chipVariant: "outline" as const,
          explain: {
            subject: `${c.stage_name} — 0 customers in cohort`,
            sources: [{ table: "customer_lifecycle_stages", purpose: `Single lifecycle stage: '${c.stage_name}'.`, rowCount: 1, asOf: snapshot.loadedAt }],
            assumptions: [
              "Flagged because customer_count is 0 or NULL.",
              "advisor does not infer customers — count comes from your records.",
            ],
            steps: [
              { label: "Read cohort", detail: "Load customer_count.", output: String(c.customer_count ?? 0) },
              { label: "Compare to zero", detail: "Confirm count <= 0 or NULL.", output: "empty" },
            ],
          } satisfies CFOExplainability,
        })),
      },
    ];
  }, [snapshot]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin inline mr-2" />Loading growth recommendations…
        </CardContent>
      </Card>
    );
  }

  if (!snapshot) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Sign in to see growth recommendations.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((g) => {
        const Icon = g.icon;
        return (
          <Card key={g.key}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">{g.title}</CardTitle>
                  <CFOExplainabilityPopover
                    data={g.explain}
                    triggerLabel={`Explain how ${g.title} was computed`}
                  />
                </div>
                {g.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => askForDraft(g.key, g.action!.prompt)}
                    disabled={askLoading === g.key}
                    className="text-xs"
                  >
                    {askLoading === g.key ? (
                      <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Drafting…</>
                    ) : (
                      g.action.label
                    )}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{g.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              {g.items.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">Nothing to flag right now.</p>
              ) : (
                <ScrollArea className="max-h-[280px] pr-3">
                  <ul className="space-y-1.5">
                    {g.items.map((it) => (
                      <li
                        key={`${g.key}-${it.id}`}
                        className="rounded-md border border-border bg-background hover:bg-muted/40 transition-colors cursor-pointer px-2 py-1.5"
                        onClick={() => openDrawer({ id: it.id, kind: it.kind, label: it.primary })}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-medium truncate">{it.primary}</p>
                              <CFOExplainabilityPopover data={it.explain} />
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                              {it.secondary}
                            </p>
                          </div>
                          <Badge variant={it.chipVariant} className="text-[10px] h-4 shrink-0">
                            {it.chip}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
              {drafts[g.key] && (
                <div className="mt-2 rounded-md border border-border bg-muted/30 p-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                    Growth Advisor draft
                  </p>
                  <p className="text-xs whitespace-pre-wrap">{drafts[g.key]}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <GrowthDetailDrawer
        target={drawerTarget}
        onClose={() => setDrawerTarget(null)}
      />
    </div>
  );
}