// ═══════════════════════════════════════════════════════════════
// SITA OS — CEO Advisor recommendations.
//
// L2-recommend authority. Synthesizes across ALL business advisors
// using the live `advisor_board_recommendations` and
// `advisor_board_actions` tables (both RLS-scoped per-user).
//
// Three groups, each with full CFO-style explainability:
//   1. Top strategic priorities  — urgency * business_impact
//   2. Cross-advisor conflicts   — same domain, opposite directions
//   3. Stalled approved actions  — approved >7d ago, never executed
//
// Empty-state honest. Never executes — synthesis only.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, GitBranch, AlarmClock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor } from "@/lib/ai-platform/runtime";
import { CEODetailDrawer, type CEODrawerTarget } from "./CEODetailDrawer";
import { CFOExplainabilityPopover, type CFOExplainability } from "../cfo/CFOExplainabilityPopover";

interface RecRow {
  id: string;
  advisor_id: string;
  title: string;
  summary: string;
  domain: string;
  category: string;
  urgency_score: number;
  business_impact_score: number;
  reversibility_score: number;
  confidence_score: number;
  status: string;
  created_at: string;
}

interface ActionRow {
  id: string;
  advisor_id: string;
  title: string;
  status: string;
  approved_at: string | null;
  executed_at: string | null;
  risk_tier: string;
  created_at: string;
}

interface ConflictPair {
  id: string;
  primary: string;        // e.g. "growth-advisor wants spend ↑"
  secondary: string;      // e.g. "cfo-advisor wants spend ↓"
  domain: string;
  recA: RecRow;
  recB: RecRow;
}

interface CEOSnapshot {
  topPriorities: RecRow[];
  conflicts: ConflictPair[];
  stalledActions: ActionRow[];
  totalRecs: number;
  totalActions: number;
  loadedAt: string;
}

const STALLED_DAYS = 7;

function priorityScore(r: RecRow): number {
  return Number(r.urgency_score) * Number(r.business_impact_score);
}

/** Heuristic: same domain + opposite-leaning categories implies a conflict to surface. */
const OPPOSING_CATEGORY_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["spend_increase", "spend_decrease"],
  ["expansion", "contraction"],
  ["hire", "freeze"],
  ["raise_price", "discount"],
  ["accelerate", "pause"],
] as const;

function detectConflicts(recs: RecRow[]): ConflictPair[] {
  const out: ConflictPair[] = [];
  // Group recommendations by domain for O(n²) within-domain comparison.
  const byDomain = new Map<string, RecRow[]>();
  for (const r of recs) {
    if (r.status === "resolved") continue;
    const arr = byDomain.get(r.domain) ?? [];
    arr.push(r);
    byDomain.set(r.domain, arr);
  }
  for (const [domain, list] of byDomain) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        if (a.advisor_id === b.advisor_id) continue;
        for (const [catA, catB] of OPPOSING_CATEGORY_PAIRS) {
          const matchAB = a.category === catA && b.category === catB;
          const matchBA = a.category === catB && b.category === catA;
          if (matchAB || matchBA) {
            out.push({
              id: `${a.id}::${b.id}`,
              primary: `${a.advisor_id} → ${a.category}`,
              secondary: `${b.advisor_id} → ${b.category}`,
              domain,
              recA: a,
              recB: b,
            });
          }
        }
      }
    }
  }
  return out.slice(0, 10);
}

async function loadCEOSnapshot(userId: string): Promise<CEOSnapshot> {
  const [recRes, actRes] = await Promise.all([
    supabase
      .from("advisor_board_recommendations")
      .select("id, advisor_id, title, summary, domain, category, urgency_score, business_impact_score, reversibility_score, confidence_score, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("advisor_board_actions")
      .select("id, advisor_id, title, status, approved_at, executed_at, risk_tier, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const recs = (recRes.data ?? []) as RecRow[];
  const actions = (actRes.data ?? []) as ActionRow[];

  const topPriorities = [...recs]
    .filter((r) => r.status !== "resolved")
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .slice(0, 8);

  const conflicts = detectConflicts(recs);

  const staleCutoff = Date.now() - STALLED_DAYS * 24 * 60 * 60 * 1000;
  const stalledActions = actions
    .filter((a) => a.status === "approved" && a.approved_at && new Date(a.approved_at).getTime() < staleCutoff && !a.executed_at)
    .slice(0, 10);

  return {
    topPriorities,
    conflicts,
    stalledActions,
    totalRecs: recs.length,
    totalActions: actions.length,
    loadedAt: new Date().toISOString(),
  };
}

export function CEOAdvisorRecommendations() {
  const [snapshot, setSnapshot] = useState<CEOSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerTarget, setDrawerTarget] = useState<CEODrawerTarget | null>(null);
  const [askLoading, setAskLoading] = useState<string | null>(null);
  const [synthesis, setSynthesis] = useState<Record<string, string>>({});

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
      const snap = await loadCEOSnapshot(userId);
      if (!cancelled) {
        setSnapshot(snap);
        setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function askForSynthesis(key: string, prompt: string) {
    setAskLoading(key);
    try {
      const r = await askBusinessAdvisor({
        advisorId: "ceo-advisor",
        prompt: `${prompt}\n\nReply as a structured EXECUTIVE SYNTHESIS — never commit org changes, never make external announcements, never authorize spend. Recommend only.`,
        intent: "ask",
      });
      setSynthesis((d) => ({ ...d, [key]: r.response.content }));
    } finally {
      setAskLoading(null);
    }
  }

  const groups = useMemo(() => {
    if (!snapshot) return [];
    const snapTime = new Date(snapshot.loadedAt).toLocaleString();
    const firstPriority = snapshot.topPriorities[0];
    const firstConflict = snapshot.conflicts[0];
    const firstStalled = snapshot.stalledActions[0];

    return [
      {
        key: "top-priorities",
        icon: Crown,
        title: "Top strategic priorities",
        description:
          snapshot.totalRecs === 0
            ? "No advisor recommendations yet — once advisors produce recommendations they'll be ranked here."
            : snapshot.topPriorities.length === 0
              ? `All ${snapshot.totalRecs} recommendation${snapshot.totalRecs === 1 ? "" : "s"} are resolved.`
              : `${snapshot.topPriorities.length} highest-impact recommendation${snapshot.topPriorities.length === 1 ? "" : "s"} ranked by urgency × business impact.`,
        action: firstPriority
          ? {
              label: "Synthesize top 3",
              prompt: `Produce an executive synthesis of the top 3 strategic priorities across our advisors:\n\n${snapshot.topPriorities.slice(0, 3).map((p, i) => `${i + 1}. [${p.advisor_id}] ${p.title} — ${p.summary} (urgency ${p.urgency_score}, impact ${p.business_impact_score})`).join("\n")}\n\nFor each: (a) what it advances, (b) what it costs, (c) what to decide first, (d) sequencing recommendation.`,
            }
          : null,
        explain: {
          subject: "Top strategic priorities",
          sources: [
            {
              table: "advisor_board_recommendations",
              purpose: "All open recommendations from every advisor (RLS-scoped).",
              rowCount: snapshot.totalRecs,
              asOf: snapshot.loadedAt,
            },
          ],
          assumptions: [
            "Priority score = urgency_score × business_impact_score.",
            "Resolved recommendations are excluded.",
            "Top 8 surfaced; CEO advisor is recommend-only and never executes.",
          ],
          steps: [
            { label: "Pull all recs", detail: "SELECT advisor_board_recommendations (RLS).", output: `${snapshot.totalRecs} row${snapshot.totalRecs === 1 ? "" : "s"}` },
            { label: "Drop resolved", detail: "Exclude status = resolved.", output: `${snapshot.totalRecs - snapshot.topPriorities.length} dropped (or already-top)` },
            { label: "Rank", detail: "Sort by urgency × impact descending.", output: `${snapshot.topPriorities.length} surfaced` },
          ],
          footer: `Snapshot taken ${snapTime} · row-level security enforced.`,
        } satisfies CFOExplainability,
        items: snapshot.topPriorities.map((p) => ({
          id: p.id,
          primary: p.title,
          secondary: `${p.advisor_id} · ${p.domain}/${p.category} · score ${priorityScore(p).toFixed(2)}`,
          chip: `u${Number(p.urgency_score).toFixed(1)}·i${Number(p.business_impact_score).toFixed(1)}`,
          chipVariant: priorityScore(p) >= 0.7 ? "destructive" : "outline",
          target: { kind: "rec" as const, id: p.id, label: p.title },
          explain: {
            subject: `${p.title} — priority breakdown`,
            sources: [{ table: "advisor_board_recommendations", purpose: "Single recommendation row.", rowCount: 1, asOf: p.created_at }],
            assumptions: [`urgency=${p.urgency_score}`, `business_impact=${p.business_impact_score}`, `confidence=${p.confidence_score}`, `reversibility=${p.reversibility_score}`],
            steps: [
              { label: "Read recommendation", detail: "Pull single row by id.", output: p.title },
              { label: "Compute priority", detail: "urgency × impact.", output: priorityScore(p).toFixed(3) },
            ],
          } satisfies CFOExplainability,
        })),
      },
      {
        key: "cross-advisor-conflicts",
        icon: GitBranch,
        title: "Cross-advisor conflicts",
        description:
          snapshot.totalRecs === 0
            ? "No advisor recommendations yet."
            : snapshot.conflicts.length === 0
              ? "No opposing recommendations detected across advisors right now."
              : `${snapshot.conflicts.length} opposing recommendation pair${snapshot.conflicts.length === 1 ? "" : "s"} need an executive call.`,
        action: firstConflict
          ? {
              label: "Resolve top conflict",
              prompt: `Two advisors are giving opposing recommendations in the ${firstConflict.domain} domain:\n\nA. ${firstConflict.recA.advisor_id} — "${firstConflict.recA.title}" (category: ${firstConflict.recA.category})\n   ${firstConflict.recA.summary}\nB. ${firstConflict.recB.advisor_id} — "${firstConflict.recB.title}" (category: ${firstConflict.recB.category})\n   ${firstConflict.recB.summary}\n\nProvide an executive synthesis: (a) what each side optimizes for, (b) the underlying tradeoff, (c) what evidence would tilt the call, (d) a recommended sequencing or compromise. Recommend only — do not commit any change.`,
            }
          : null,
        explain: {
          subject: "Cross-advisor conflict detection",
          sources: [
            {
              table: "advisor_board_recommendations",
              purpose: "Compare every pair of unresolved recommendations within each domain.",
              rowCount: snapshot.totalRecs,
              asOf: snapshot.loadedAt,
            },
          ],
          assumptions: [
            "Conflict heuristic: same domain, different advisors, opposing categories.",
            `Opposing pairs: ${OPPOSING_CATEGORY_PAIRS.map(([a, b]) => `${a}↔${b}`).join(", ")}.`,
            "Resolved recommendations are excluded.",
          ],
          steps: [
            { label: "Group by domain", detail: "Bucket recs per domain.", output: `domains: ${new Set(snapshot.topPriorities.map((p) => p.domain)).size}+` },
            { label: "Pairwise scan", detail: "Within each domain, check opposing-category pairs.", output: `${snapshot.conflicts.length} pair${snapshot.conflicts.length === 1 ? "" : "s"}` },
          ],
          footer: `Snapshot taken ${snapTime}.`,
        } satisfies CFOExplainability,
        items: snapshot.conflicts.map((c) => ({
          id: c.id,
          primary: `${c.domain} — opposing calls`,
          secondary: `${c.primary}  vs  ${c.secondary}`,
          chip: c.domain,
          chipVariant: "destructive" as const,
          target: { kind: "rec" as const, id: c.recA.id, label: c.recA.title },
          explain: {
            subject: `${c.domain} conflict`,
            sources: [{ table: "advisor_board_recommendations", purpose: "Two opposing recommendations.", rowCount: 2 }],
            assumptions: [`Pair: ${c.recA.category} vs ${c.recB.category}`],
            steps: [
              { label: "Read pair", detail: "Pull both recommendation rows.", output: `${c.recA.advisor_id} & ${c.recB.advisor_id}` },
              { label: "Match opposing categories", detail: "Categories are on the opposing-pair list.", output: "conflict" },
            ],
          } satisfies CFOExplainability,
        })),
      },
      {
        key: "stalled-actions",
        icon: AlarmClock,
        title: `Approved actions stalled > ${STALLED_DAYS}d`,
        description:
          snapshot.totalActions === 0
            ? "No board-level actions yet."
            : snapshot.stalledActions.length === 0
              ? `Every approved action is moving — none stalled past ${STALLED_DAYS} days.`
              : `${snapshot.stalledActions.length} approved action${snapshot.stalledActions.length === 1 ? "" : "s"} stalled — escalate or unblock.`,
        action: firstStalled
          ? {
              label: "Suggest unblocks",
              prompt: `These board-approved actions have not executed in over ${STALLED_DAYS} days:\n\n${snapshot.stalledActions.slice(0, 5).map((a, i) => `${i + 1}. [${a.advisor_id}] ${a.title} (risk: ${a.risk_tier}, approved: ${a.approved_at ?? "—"})`).join("\n")}\n\nFor each, suggest: (a) likely blocker, (b) the question to ask the owning advisor, (c) escalate / re-prioritize / void recommendation. CEO is recommend-only.`,
            }
          : null,
        explain: {
          subject: "Stalled-action detection",
          sources: [
            {
              table: "advisor_board_actions",
              purpose: "All actions for the operator (RLS-scoped).",
              rowCount: snapshot.totalActions,
              asOf: snapshot.loadedAt,
            },
          ],
          assumptions: [
            `Stalled = status='approved' AND approved_at older than ${STALLED_DAYS}d AND executed_at IS NULL.`,
            "CEO advisor never executes or unblocks — synthesis only.",
          ],
          steps: [
            { label: "Pull actions", detail: "SELECT advisor_board_actions (RLS).", output: `${snapshot.totalActions}` },
            { label: "Filter stalled", detail: "approved + old + not executed.", output: `${snapshot.stalledActions.length}` },
          ],
          footer: `Snapshot taken ${snapTime}.`,
        } satisfies CFOExplainability,
        items: snapshot.stalledActions.map((a) => {
          const days = a.approved_at
            ? Math.floor((Date.now() - new Date(a.approved_at).getTime()) / (1000 * 60 * 60 * 24))
            : null;
          return {
            id: a.id,
            primary: a.title,
            secondary: `${a.advisor_id} · ${a.risk_tier} risk · approved ${days ?? "?"}d ago`,
            chip: `${days ?? "?"}d`,
            chipVariant: "outline" as const,
            target: { kind: "action" as const, id: a.id, label: a.title },
            explain: {
              subject: `${a.title} — stalled`,
              sources: [{ table: "advisor_board_actions", purpose: "Single action row.", rowCount: 1, asOf: a.created_at }],
              assumptions: [`approved_at older than ${STALLED_DAYS}d`, "executed_at is NULL"],
              steps: [{ label: "Read approved_at", detail: "Compute staleness.", output: `${days ?? "?"}d ago` }],
            } satisfies CFOExplainability,
          };
        }),
      },
    ];
  }, [snapshot]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin inline mr-2" />Synthesizing across advisors…
        </CardContent>
      </Card>
    );
  }

  if (!snapshot) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Sign in to see CEO synthesis.
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
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
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
                    onClick={() => askForSynthesis(g.key, g.action!.prompt)}
                    disabled={askLoading === g.key}
                    className="text-xs"
                  >
                    {askLoading === g.key ? (
                      <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Synthesizing…</>
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
                        onClick={() => setDrawerTarget(it.target)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-medium truncate">{it.primary}</p>
                              <CFOExplainabilityPopover data={it.explain} />
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">{it.secondary}</p>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${it.chipVariant === "destructive" ? "border-destructive/40 text-destructive" : "border-border text-muted-foreground"}`}>
                            {it.chip}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
              {synthesis[g.key] && (
                <div className="mt-2 rounded-md border border-border bg-muted/30 p-2">
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">CEO synthesis</p>
                  <p className="text-xs whitespace-pre-wrap leading-relaxed">{synthesis[g.key]}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      <CEODetailDrawer target={drawerTarget} onClose={() => setDrawerTarget(null)} />
    </div>
  );
}