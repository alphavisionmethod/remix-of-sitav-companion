// ═══════════════════════════════════════════════════════════════
// Mobile-friendly Growth Advisor: compact growth pulse + quick sim.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, GitBranch, FlaskConical, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor, runAdvisorSimulation } from "@/lib/ai-platform/runtime";
import { useToast } from "@/hooks/use-toast";

interface MobileSnap {
  bottleneckCount: number;
  worstStageName: string | null;
  worstStageRate: number | null;
  stalledCount: number;
  emptyCohortCount: number;
  activity30d: number;
}

function pct(v: number | null): string {
  if (v == null) return "—";
  const n = Number(v);
  return `${(n > 1 ? n : n * 100).toFixed(1)}%`;
}

const BOTTLENECK_THRESHOLD = 0.4;
const STALL_DAYS = 30;

export function MobileGrowthAdvisorPanels() {
  const { toast } = useToast();
  const [snap, setSnap] = useState<MobileSnap | null>(null);
  const [drafting, setDrafting] = useState<string | null>(null);
  const [simRunning, setSimRunning] = useState(false);
  const [draft, setDraft] = useState<{ key: string; content: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) return;
      const stallCutoff = new Date(Date.now() - STALL_DAYS * 24 * 60 * 60 * 1000).toISOString();
      const thirtyDaysAgo = stallCutoff;

      const [stagesRes, expRes, cohortsRes, activityRes] = await Promise.all([
        supabase
          .from("customer_journey_stages")
          .select("stage_name, conversion_rate")
          .eq("user_id", userId)
          .order("conversion_rate", { ascending: true })
          .limit(50),
        supabase
          .from("conversion_experiments")
          .select("id, started_at, winner, status")
          .eq("user_id", userId)
          .eq("status", "running")
          .limit(50),
        supabase
          .from("customer_lifecycle_stages")
          .select("id, customer_count")
          .eq("user_id", userId)
          .limit(50),
        supabase
          .from("app_launch_events")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("created_at", thirtyDaysAgo),
      ]);
      if (cancelled) return;

      const stages = (stagesRes.data ?? []) as Array<{ stage_name: string; conversion_rate: number | null }>;
      const bottlenecks = stages.filter((s) => {
        if (s.conversion_rate == null) return false;
        const n = Number(s.conversion_rate);
        const norm = n > 1 ? n / 100 : n;
        return norm < BOTTLENECK_THRESHOLD;
      });
      const exps = (expRes.data ?? []) as Array<{ started_at: string | null; winner: string | null }>;
      const stalled = exps.filter((e) => (!e.winner || e.winner.length === 0) && (e.started_at ?? "") < stallCutoff);
      const cohorts = (cohortsRes.data ?? []) as Array<{ customer_count: number | null }>;
      const emptyCohorts = cohorts.filter((c) => (c.customer_count ?? 0) === 0);

      setSnap({
        bottleneckCount: bottlenecks.length,
        worstStageName: bottlenecks[0]?.stage_name ?? null,
        worstStageRate: bottlenecks[0]?.conversion_rate ?? null,
        stalledCount: stalled.length,
        emptyCohortCount: emptyCohorts.length,
        activity30d: activityRes.count ?? 0,
      });
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function quickAsk(key: string, prompt: string) {
    setDrafting(key);
    setDraft(null);
    try {
      const r = await askBusinessAdvisor({ advisorId: "growth-advisor", prompt, intent: "ask" });
      setDraft({ key, content: r.response.content });
    } catch (e) {
      toast({ title: "Advisor unavailable", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" });
    } finally {
      setDrafting(null);
    }
  }

  async function runQuickSim() {
    setSimRunning(true);
    try {
      const r = await runAdvisorSimulation({
        advisorId: "growth-advisor",
        scenarioTitle: "Mobile quick scenario: activation +20%",
        inputs: { scenario_type: "activation-lift", delta: 20 },
        assumptions: { source: "mobile-quickrun" },
      });
      toast({
        title: r.status === "completed" ? "Scenario ready" : "Failed",
        description: r.status === "completed" ? `Confidence ${Math.round(r.confidence * 100)}%` : r.riskSummary,
        variant: r.status === "completed" ? "default" : "destructive",
      });
    } finally {
      setSimRunning(false);
    }
  }

  if (!snap) return <Skeleton className="h-32 w-full" />;

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Activity 30d</p>
              <p className="text-base font-semibold">{snap.activity30d}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Worst stage</p>
              <p className="text-base font-semibold truncate">
                {snap.worstStageName ? `${pct(snap.worstStageRate)}` : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="h-3.5 w-3.5" /> Funnel bottlenecks
            <Badge variant="outline" className="ml-auto text-[10px] h-4">{snap.bottleneckCount}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            disabled={snap.bottleneckCount === 0 || drafting === "bottlenecks"}
            onClick={() => quickAsk("bottlenecks", `My worst-converting funnel stage is "${snap.worstStageName ?? "(unknown)"}" at ${pct(snap.worstStageRate)}. Recommend the top 3 unblock hypotheses with one experiment each. Recommend-only.`)}
          >
            {drafting === "bottlenecks" ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Thinking…</> : "Recommend unblock plan"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FlaskConical className="h-3.5 w-3.5" /> Stalled experiments
            <Badge variant="outline" className="ml-auto text-[10px] h-4">{snap.stalledCount}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            disabled={snap.stalledCount === 0 || drafting === "stalled"}
            onClick={() => quickAsk("stalled", `${snap.stalledCount} of my experiments have been running > ${STALL_DAYS} days with no winner. Recommend conclude / extend / kill for each. Recommend-only.`)}
          >
            {drafting === "stalled" ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Thinking…</> : "Recommend triage"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" /> Quick scenario
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button size="sm" className="w-full text-xs" disabled={simRunning} onClick={runQuickSim}>
            {simRunning ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Running…</> : "Run activation +20% scenario"}
          </Button>
        </CardContent>
      </Card>

      {draft && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs">Growth Advisor recommendation</CardTitle></CardHeader>
          <CardContent className="pt-0"><p className="text-xs whitespace-pre-wrap">{draft.content}</p></CardContent>
        </Card>
      )}
    </div>
  );
}