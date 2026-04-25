// ═══════════════════════════════════════════════════════════════
// SITA OS — CEO Advisor detail drawer.
// Read-only deep dive on a board recommendation or a board action,
// with an optional executive-synthesis draft. CEO never executes
// or commits — recommend-only.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Crown, ListChecks, ShieldAlert, RefreshCcw, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor } from "@/lib/ai-platform/runtime";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type CEODrawerTarget =
  | { kind: "rec"; id: string; label: string }
  | { kind: "action"; id: string; label: string };

interface RecDetail {
  id: string;
  advisor_id: string;
  title: string;
  summary: string;
  rationale: string;
  domain: string;
  category: string;
  urgency_score: number;
  business_impact_score: number;
  reversibility_score: number;
  confidence_score: number;
  status: string;
  created_at: string;
}

interface ActionDetail {
  id: string;
  advisor_id: string;
  title: string;
  description: string;
  action_type: string;
  status: string;
  risk_tier: string;
  approved_at: string | null;
  executed_at: string | null;
  created_at: string;
}

interface DetailState {
  rec?: RecDetail | null;
  action?: ActionDetail | null;
  loading: boolean;
}

interface ConsistencyFinding {
  id: string;
  domain: string;
  finding_kind: string;
  severity: "info" | "warn" | "critical";
  summary: string;
  advisor_a: string;
  advisor_b: string;
  recommendation_a_id: string | null;
  recommendation_b_id: string | null;
  status: "open" | "acknowledged" | "resolved";
  created_at: string;
  run_id: string | null;
}

interface Props {
  target: CEODrawerTarget | null;
  onClose: () => void;
}

export function CEODetailDrawer({ target, onClose }: Props) {
  const [state, setState] = useState<DetailState>({ loading: false });
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [findings, setFindings] = useState<ConsistencyFinding[]>([]);
  const [findingsLoading, setFindingsLoading] = useState(false);
  const [rerunning, setRerunning] = useState(false);

  async function loadFindings() {
    setFindingsLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) {
        setFindings([]);
        return;
      }
      const { data } = await supabase
        .from("advisor_consistency_findings")
        .select("id, domain, finding_kind, severity, summary, advisor_a, advisor_b, recommendation_a_id, recommendation_b_id, status, created_at, run_id")
        .eq("user_id", userId)
        .in("status", ["open", "acknowledged"])
        .order("severity", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);
      setFindings((data ?? []) as ConsistencyFinding[]);
    } finally {
      setFindingsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setDraft(null);
    if (!target) {
      setState({ loading: false });
      setFindings([]);
      return;
    }
    setState({ loading: true });
    void loadFindings();

    async function load() {
      if (!target) return;
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) {
        if (!cancelled) setState({ loading: false });
        return;
      }

      if (target.kind === "rec") {
        const { data } = await supabase
          .from("advisor_board_recommendations")
          .select("id, advisor_id, title, summary, rationale, domain, category, urgency_score, business_impact_score, reversibility_score, confidence_score, status, created_at")
          .eq("id", target.id)
          .eq("user_id", userId)
          .maybeSingle();
        if (!cancelled) setState({ rec: (data as RecDetail | null) ?? null, loading: false });
      } else {
        const { data } = await supabase
          .from("advisor_board_actions")
          .select("id, advisor_id, title, description, action_type, status, risk_tier, approved_at, executed_at, created_at")
          .eq("id", target.id)
          .eq("user_id", userId)
          .maybeSingle();
        if (!cancelled) setState({ action: (data as ActionDetail | null) ?? null, loading: false });
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [target]);

  async function rerunCheck() {
    setRerunning(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) {
        toast.error("Sign in to re-run the consistency check.");
        return;
      }
      const { error } = await supabase.functions.invoke("cross-advisor-consistency-check", {
        body: { triggered_by: "manual" },
      });
      if (error) {
        toast.error(`Consistency check failed: ${error.message}`);
        return;
      }
      toast.success("Cross-advisor consistency check complete.");
      await loadFindings();
    } catch (err) {
      toast.error(`Consistency check failed: ${(err as Error).message}`);
    } finally {
      setRerunning(false);
    }
  }

  async function acknowledgeFinding(id: string) {
    const { error } = await supabase
      .from("advisor_consistency_findings")
      .update({ status: "acknowledged", acknowledged_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(`Could not acknowledge: ${error.message}`);
      return;
    }
    setFindings((f) => f.map((x) => (x.id === id ? { ...x, status: "acknowledged" } : x)));
  }

  async function resolveFinding(id: string) {
    const { error } = await supabase
      .from("advisor_consistency_findings")
      .update({ status: "resolved", resolved_at: new Date().toISOString(), resolution_notes: "Resolved by operator from CEO drawer" })
      .eq("id", id);
    if (error) {
      toast.error(`Could not resolve: ${error.message}`);
      return;
    }
    setFindings((f) => f.filter((x) => x.id !== id));
  }

  async function draftSynthesis() {
    if (!target) return;
    setDrafting(true);
    try {
      const subject = target.kind === "rec" && state.rec
        ? `Recommendation "${state.rec.title}" from ${state.rec.advisor_id} (${state.rec.domain}/${state.rec.category}).\nUrgency ${state.rec.urgency_score}, impact ${state.rec.business_impact_score}, reversibility ${state.rec.reversibility_score}.\nSummary: ${state.rec.summary}\nRationale: ${state.rec.rationale}`
        : target.kind === "action" && state.action
          ? `Action "${state.action.title}" from ${state.action.advisor_id}.\nType: ${state.action.action_type}, status: ${state.action.status}, risk: ${state.action.risk_tier}.\nDescription: ${state.action.description}`
          : `Subject: ${target.label}`;

      const r = await askBusinessAdvisor({
        advisorId: "ceo-advisor",
        prompt: `Produce an executive synthesis on the following:\n\n${subject}\n\nCover: (a) what this advances or risks at the company level, (b) cross-functional implications, (c) one decision the operator should make this week, (d) what evidence to gather before committing. Recommend only — never authorize.`,
        intent: "ask",
      });
      setDraft(r.response.content);
    } finally {
      setDrafting(false);
    }
  }

  const open = !!target;
  const criticalCount = findings.filter((f) => f.severity === "critical" && f.status === "open").length;
  const openFindings = findings.filter((f) => f.status === "open");
  const ackFindings = findings.filter((f) => f.status === "acknowledged");

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent className="w-full sm:max-w-lg overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-base">
            {target?.kind === "rec" ? <Crown className="h-4 w-4" /> : <ListChecks className="h-4 w-4" />}
            {target?.label ?? "—"}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {target?.kind === "rec" ? "Board recommendation" : "Board action"} · CEO Advisor synthesis (recommend-only)
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 mt-3 pr-3">
          {/* Cross-advisor consistency findings */}
          <section className="mb-4 rounded-md border border-border bg-card/40 p-2" data-testid="ceo-consistency-findings">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className={cn("h-3.5 w-3.5", criticalCount > 0 ? "text-destructive" : "text-muted-foreground")} />
                <p className="text-[11px] font-semibold uppercase tracking-wider">
                  Cross-advisor consistency
                </p>
                {findings.length > 0 && (
                  <Badge variant={criticalCount > 0 ? "destructive" : "secondary"} className="text-[10px] h-4 px-1">
                    {findings.length}
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={rerunCheck}
                disabled={rerunning}
                className="h-6 text-[10px] gap-1"
                aria-label="Re-run cross-advisor consistency check"
              >
                {rerunning ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCcw className="h-3 w-3" />
                )}
                Re-run
              </Button>
            </div>
            {findingsLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : findings.length === 0 ? (
              <p className="text-[11px] text-muted-foreground py-1">
                No contradictions detected across advisors. Nightly check runs at 03:15 UTC.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {[...openFindings, ...ackFindings].map((f) => (
                  <li
                    key={f.id}
                    className={cn(
                      "rounded border p-2 text-[11px] leading-snug",
                      f.severity === "critical"
                        ? "border-destructive/40 bg-destructive/5"
                        : f.severity === "warn"
                          ? "border-amber-500/40 bg-amber-500/5"
                          : "border-border bg-background",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <Badge variant="outline" className="text-[9px] h-4 px-1">{f.domain}</Badge>
                          <Badge variant="outline" className="text-[9px] h-4 px-1">{f.finding_kind.replace(/_/g, " ")}</Badge>
                          {f.status === "acknowledged" && (
                            <Badge variant="secondary" className="text-[9px] h-4 px-1">acknowledged</Badge>
                          )}
                        </div>
                        <p>{f.summary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      {f.status === "open" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => acknowledgeFinding(f.id)}
                          className="h-5 text-[10px] px-1.5"
                        >
                          Acknowledge
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => resolveFinding(f.id)}
                        className="h-5 text-[10px] px-1.5 gap-0.5"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Resolve
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {state.loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : state.rec ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{state.rec.advisor_id}</Badge>
                <Badge variant="secondary">{state.rec.domain}/{state.rec.category}</Badge>
                <Badge variant={state.rec.status === "resolved" ? "secondary" : "default"}>{state.rec.status}</Badge>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground mb-1">Summary</p>
                <p className="whitespace-pre-wrap">{state.rec.summary || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground mb-1">Rationale</p>
                <p className="whitespace-pre-wrap">{state.rec.rationale || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Urgency</p>
                  <p className="font-semibold">{Number(state.rec.urgency_score).toFixed(2)}</p>
                </div>
                <div className="rounded border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Business impact</p>
                  <p className="font-semibold">{Number(state.rec.business_impact_score).toFixed(2)}</p>
                </div>
                <div className="rounded border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Reversibility</p>
                  <p className="font-semibold">{Number(state.rec.reversibility_score).toFixed(2)}</p>
                </div>
                <div className="rounded border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Confidence</p>
                  <p className="font-semibold">{Number(state.rec.confidence_score).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ) : state.action ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{state.action.advisor_id}</Badge>
                <Badge variant="secondary">{state.action.action_type}</Badge>
                <Badge variant={state.action.risk_tier === "high" || state.action.risk_tier === "critical" ? "destructive" : "default"}>{state.action.risk_tier}</Badge>
                <Badge>{state.action.status}</Badge>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground mb-1">Description</p>
                <p className="whitespace-pre-wrap">{state.action.description || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Approved at</p>
                  <p>{state.action.approved_at ? new Date(state.action.approved_at).toLocaleString() : "—"}</p>
                </div>
                <div className="rounded border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Executed at</p>
                  <p>{state.action.executed_at ? new Date(state.action.executed_at).toLocaleString() : "—"}</p>
                </div>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertDescription className="text-xs">No record found. It may have been resolved or is owned by another user.</AlertDescription>
            </Alert>
          )}

          {draft && (
            <div className="mt-4 rounded-md border border-border bg-muted/30 p-2">
              <p className="text-[10px] uppercase text-muted-foreground mb-1">CEO synthesis (draft)</p>
              <p className="text-xs whitespace-pre-wrap leading-relaxed">{draft}</p>
            </div>
          )}
        </ScrollArea>

        <div className="pt-3 border-t border-border">
          <Button onClick={draftSynthesis} disabled={drafting || !target || (!state.rec && !state.action)} className="w-full" size="sm">
            {drafting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Synthesizing…</>
            ) : (
              "Draft executive synthesis"
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            CEO Advisor is recommend-only — never executes, commits, or announces.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}