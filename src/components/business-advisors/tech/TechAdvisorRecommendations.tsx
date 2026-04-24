// ═══════════════════════════════════════════════════════════════
// SITA OS — Tech Advisor recommendations.
//
// Surfaces three real, RLS-scoped patterns:
//   1. Critical/high open incidents
//   2. Recurring unresolved errors (count >= threshold)
//   3. Stale incidents — open > N days
// All values come from real tables; empty-state honest.
// Each row carries a glass-box explainability popover that shows
// data sources, assumptions, and calculation steps.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Bug, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor } from "@/lib/ai-platform/runtime";
import { TechDetailDrawer, type TechDrawerTarget } from "./TechDetailDrawer";
import { CFOExplainabilityPopover, type CFOExplainability } from "../cfo/CFOExplainabilityPopover";

interface IncidentRow {
  id: string;
  title: string;
  severity: string;
  status: string;
  created_at: string;
}

interface ErrorRow {
  id: string;
  fingerprint: string;
  message: string;
  severity: string;
  source: string;
  route: string | null;
  count: number;
  last_seen_at: string;
}

interface TechSnapshot {
  highSevIncidents: IncidentRow[];
  recurringErrors: ErrorRow[];
  staleIncidents: IncidentRow[];
  totalIncidentsScanned: number;
  totalErrorsScanned: number;
  loadedAt: string;
}

const RECURRING_THRESHOLD = 3;
const STALE_DAYS = 7;

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

async function loadTechSnapshot(userId: string): Promise<TechSnapshot> {
  const staleCutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const [incRes, errRes] = await Promise.all([
    supabase
      .from("incidents")
      .select("id, title, severity, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("error_events")
      .select("id, fingerprint, message, severity, source, route, count, last_seen_at")
      .eq("user_id", userId)
      .is("resolved_at", null)
      .order("last_seen_at", { ascending: false })
      .limit(100),
  ]);

  const allIncidents = (incRes.data ?? []) as IncidentRow[];
  const allErrors = (errRes.data ?? []) as ErrorRow[];

  const highSevIncidents = allIncidents
    .filter((i) => i.status !== "resolved" && (i.severity === "critical" || i.severity === "high"))
    .slice(0, 10);

  const recurringErrors = allErrors
    .filter((e) => (e.count ?? 0) >= RECURRING_THRESHOLD)
    .slice(0, 10);

  const staleIncidents = allIncidents.filter(
    (i) => i.status !== "resolved" && i.created_at < staleCutoff,
  );

  return {
    highSevIncidents,
    recurringErrors,
    staleIncidents,
    totalIncidentsScanned: allIncidents.length,
    totalErrorsScanned: allErrors.length,
    loadedAt: new Date().toISOString(),
  };
}

export function TechAdvisorRecommendations() {
  const [snapshot, setSnapshot] = useState<TechSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerTarget, setDrawerTarget] = useState<TechDrawerTarget | null>(null);
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
      const snap = await loadTechSnapshot(userId);
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

  function openDrawer(item: { id: string; kind: TechDrawerTarget["kind"]; label: string }) {
    setDrawerTarget({ kind: item.kind, id: item.id, label: item.label });
  }

  async function askForDraft(key: string, prompt: string) {
    setAskLoading(key);
    try {
      const r = await askBusinessAdvisor({
        advisorId: "tech-advisor",
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
    const worstInc = snapshot.highSevIncidents[0];
    const noisiest = snapshot.recurringErrors[0];

    return [
      {
        key: "high-sev-incidents",
        icon: AlertTriangle,
        title: "Critical & high-severity open incidents",
        description:
          snapshot.totalIncidentsScanned === 0
            ? "No incidents recorded yet — clean slate."
            : snapshot.highSevIncidents.length === 0
              ? `All ${snapshot.totalIncidentsScanned} incidents are below high severity or resolved.`
              : `${snapshot.highSevIncidents.length} open incident${snapshot.highSevIncidents.length === 1 ? "" : "s"} at high or critical severity.`,
        action: worstInc
          ? {
              label: "Triage plan",
              prompt: `Our most recent high-severity open incident is "${worstInc.title}" (${worstInc.severity}). Recommend the top 3 triage steps and what owner-side validation is required before each. Recommend-only.`,
            }
          : null,
        explain: {
          subject: "High-severity incident detection",
          sources: [
            {
              table: "incidents",
              purpose: "All incidents in your account, RLS-scoped, used to filter unresolved high/critical.",
              rowCount: snapshot.totalIncidentsScanned,
              asOf: snapshot.loadedAt,
            },
          ],
          assumptions: [
            "Severity is the owner-set field on the incident row.",
            "An incident is 'open' if status ≠ 'resolved'.",
            "Only severity='critical' or 'high' are surfaced here.",
            "Top 10 most recent matches are shown.",
          ],
          steps: [
            { label: "Pull incidents", detail: "SELECT all incidents WHERE user_id matches (RLS).", output: `${snapshot.totalIncidentsScanned} row${snapshot.totalIncidentsScanned === 1 ? "" : "s"}` },
            { label: "Filter unresolved", detail: "Drop status='resolved'.", output: "open subset" },
            { label: "Filter severity", detail: "Keep severity ∈ {critical, high}.", output: `${snapshot.highSevIncidents.length} flagged` },
            { label: "Order by recency", detail: "Sort by created_at DESC.", output: worstInc ? `top: ${worstInc.title}` : "—" },
          ],
          footer: `Snapshot taken ${snapTime} · row-level security enforced.`,
        } satisfies CFOExplainability,
        items: snapshot.highSevIncidents.map((i) => ({
          id: i.id,
          kind: "incident" as const,
          primary: i.title,
          secondary: `${i.status} · opened ${new Date(i.created_at).toLocaleDateString()}`,
          chip: i.severity,
          chipVariant: "destructive" as const,
          explain: {
            subject: `${i.title} — ${i.severity} / ${i.status}`,
            sources: [{ table: "incidents", purpose: `Single incident: '${i.title}'.`, rowCount: 1, asOf: i.created_at }],
            assumptions: [
              `Flagged because severity='${i.severity}' and status='${i.status}'.`,
              "Incident severity is owner-recorded.",
            ],
            steps: [
              { label: "Read severity", detail: "Confirm severity ∈ {critical, high}.", output: i.severity },
              { label: "Read status", detail: "Confirm status ≠ 'resolved'.", output: i.status },
            ],
          } satisfies CFOExplainability,
        })),
      },
      {
        key: "recurring-errors",
        icon: Bug,
        title: `Recurring unresolved errors — count ≥ ${RECURRING_THRESHOLD}`,
        description:
          snapshot.totalErrorsScanned === 0
            ? "No unresolved errors tracked — quiet system."
            : snapshot.recurringErrors.length === 0
              ? `All ${snapshot.totalErrorsScanned} unresolved errors are below the recurrence threshold.`
              : `${snapshot.recurringErrors.length} fingerprint${snapshot.recurringErrors.length === 1 ? "" : "s"} hitting ≥ ${RECURRING_THRESHOLD} times.`,
        action: noisiest
          ? {
              label: "Root-cause hypothesis",
              prompt: `The most-recurrent unresolved error fingerprint is "${noisiest.fingerprint}" with ${noisiest.count} occurrences. Message: ${noisiest.message}. Recommend the top 2 likely root causes and a triage step for each. Recommend-only.`,
            }
          : null,
        explain: {
          subject: "Recurring error detection",
          sources: [
            {
              table: "error_events",
              purpose: "Unresolved error events scoped to your records (resolved_at IS NULL).",
              rowCount: snapshot.totalErrorsScanned,
              asOf: snapshot.loadedAt,
            },
          ],
          assumptions: [
            `Recurring threshold: count >= ${RECURRING_THRESHOLD}.`,
            "Errors with resolved_at set are excluded.",
            "Top 10 by recurrence are surfaced.",
          ],
          steps: [
            { label: "Pull unresolved errors", detail: "SELECT error_events WHERE resolved_at IS NULL (RLS).", output: `${snapshot.totalErrorsScanned} row${snapshot.totalErrorsScanned === 1 ? "" : "s"}` },
            { label: "Filter recurring", detail: `Keep count >= ${RECURRING_THRESHOLD}.`, output: `${snapshot.recurringErrors.length} flagged` },
            { label: "Order by recency", detail: "Sort by last_seen_at DESC.", output: noisiest ? `top: ${noisiest.fingerprint}` : "—" },
          ],
          footer: `Snapshot taken ${snapTime}.`,
        } satisfies CFOExplainability,
        items: snapshot.recurringErrors.map((e) => ({
          id: e.id,
          kind: "error" as const,
          primary: e.fingerprint,
          secondary: `${e.severity} · ${e.source}${e.route ? ` · ${e.route}` : ""}`,
          chip: `×${e.count}`,
          chipVariant: "destructive" as const,
          explain: {
            subject: `${e.fingerprint} — ${e.count} occurrences`,
            sources: [{ table: "error_events", purpose: "Single unresolved error fingerprint.", rowCount: 1, asOf: e.last_seen_at }],
            assumptions: [
              `Flagged because count (${e.count}) >= ${RECURRING_THRESHOLD}.`,
              "Fingerprint groups identical error signatures.",
            ],
            steps: [
              { label: "Read count", detail: "Load occurrence count.", output: String(e.count) },
              { label: "Compare to threshold", detail: `Threshold = ${RECURRING_THRESHOLD}.`, output: "above threshold" },
              { label: "Read last_seen", detail: "Recency check.", output: new Date(e.last_seen_at).toLocaleString() },
            ],
          } satisfies CFOExplainability,
        })),
      },
      {
        key: "stale-incidents",
        icon: Clock,
        title: `Stale incidents — open > ${STALE_DAYS}d`,
        description:
          snapshot.totalIncidentsScanned === 0
            ? "No incidents recorded yet — staleness check N/A."
            : snapshot.staleIncidents.length === 0
              ? "All open incidents are fresh (< 7d)."
              : `${snapshot.staleIncidents.length} incident${snapshot.staleIncidents.length === 1 ? "" : "s"} open for more than ${STALE_DAYS} days.`,
        action: snapshot.staleIncidents.length > 0
          ? {
              label: "Sweep plan",
              prompt: `${snapshot.staleIncidents.length} of my incidents have been open > ${STALE_DAYS} days. For each, recommend whether to (a) close as resolved, (b) escalate, or (c) re-scope as a known-issue. Recommend-only.`,
            }
          : null,
        explain: {
          subject: "Stale incident detection",
          sources: [
            {
              table: "incidents",
              purpose: "All incidents in your account, RLS-scoped, used to compute age.",
              rowCount: snapshot.totalIncidentsScanned,
              asOf: snapshot.loadedAt,
            },
          ],
          assumptions: [
            `Stale = status ≠ 'resolved' AND created_at older than ${STALE_DAYS} days.`,
            "Age is computed from created_at, not last activity.",
          ],
          steps: [
            { label: "Pull incidents", detail: "SELECT all incidents (RLS).", output: `${snapshot.totalIncidentsScanned} row${snapshot.totalIncidentsScanned === 1 ? "" : "s"}` },
            { label: "Filter unresolved", detail: "Drop status='resolved'.", output: "open subset" },
            { label: "Filter stale", detail: `Keep created_at older than ${STALE_DAYS}d.`, output: `${snapshot.staleIncidents.length} stale` },
          ],
          footer: `Snapshot taken ${snapTime}.`,
        } satisfies CFOExplainability,
        items: snapshot.staleIncidents.map((i) => {
          const days = daysSince(i.created_at);
          return {
            id: i.id,
            kind: "incident" as const,
            primary: i.title,
            secondary: `${i.severity} · ${i.status}${days != null ? ` · ${days}d open` : ""}`,
            chip: days != null ? `${days}d` : "stale",
            chipVariant: "outline" as const,
            explain: {
              subject: `${i.title} — ${days != null ? `${days}d open, no resolution` : "stale"}`,
              sources: [{ table: "incidents", purpose: "Single incident record.", rowCount: 1, asOf: i.created_at }],
              assumptions: [
                "Status is not 'resolved'.",
                `created_at is older than ${STALE_DAYS} days.`,
              ],
              steps: [
                { label: "Read status", detail: "Confirm not resolved.", output: i.status },
                { label: "Read created_at", detail: "Compute days open.", output: days != null ? `${days} days` : "n/a" },
              ],
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
          <Loader2 className="h-4 w-4 animate-spin inline mr-2" />Loading tech recommendations…
        </CardContent>
      </Card>
    );
  }

  if (!snapshot) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Sign in to see tech recommendations.
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
                    Tech Advisor draft
                  </p>
                  <p className="text-xs whitespace-pre-wrap">{drafts[g.key]}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <TechDetailDrawer
        target={drawerTarget}
        onClose={() => setDrawerTarget(null)}
      />
    </div>
  );
}