// ═══════════════════════════════════════════════════════════════
// Mobile-friendly CEO Advisor: cross-advisor pulse + quick
// strategic synthesis. L2-recommend authority — never executes.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Crown, GitBranch, AlarmClock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor, runAdvisorSimulation } from "@/lib/ai-platform/runtime";
import { useToast } from "@/hooks/use-toast";
import { CEO_HIGH_URGENCY_THRESHOLD } from "./CEOAdvisorHeaderStats";

interface MobileSnap {
  totalRecs: number;
  distinctAdvisors: number;
  highUrgencyRecs: number;
  pendingActions: number;
  topPriorityTitle: string | null;
}

export function MobileCEOAdvisorPanels() {
  const { toast } = useToast();
  const [snap, setSnap] = useState<MobileSnap | null>(null);
  const [synth, setSynth] = useState<string | null>(null);
  const [synthing, setSynthing] = useState(false);
  const [simRunning, setSimRunning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) return;

      const [recsRes, urgentRes, actionsRes] = await Promise.all([
        supabase
          .from("advisor_board_recommendations")
          .select("advisor_id, title, urgency_score, business_impact_score, status")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(200),
        supabase
          .from("advisor_board_recommendations")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("urgency_score", CEO_HIGH_URGENCY_THRESHOLD)
          .neq("status", "resolved"),
        supabase
          .from("advisor_board_actions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .in("status", ["proposed", "approved"]),
      ]);
      if (cancelled) return;

      const recs = (recsRes.data ?? []) as Array<{ advisor_id: string; title: string; urgency_score: number; business_impact_score: number; status: string }>;
      const open = recs.filter((r) => r.status !== "resolved");
      const top = [...open].sort((a, b) => Number(b.urgency_score) * Number(b.business_impact_score) - Number(a.urgency_score) * Number(a.business_impact_score))[0];

      setSnap({
        totalRecs: recs.length,
        distinctAdvisors: new Set(recs.map((r) => r.advisor_id)).size,
        highUrgencyRecs: urgentRes.count ?? 0,
        pendingActions: actionsRes.count ?? 0,
        topPriorityTitle: top?.title ?? null,
      });
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function quickSynthesize() {
    if (!snap) return;
    setSynthing(true);
    setSynth(null);
    try {
      const r = await askBusinessAdvisor({
        advisorId: "ceo-advisor",
        prompt: `Across all advisors I have ${snap.totalRecs} recommendation(s) from ${snap.distinctAdvisors} advisor(s), with ${snap.highUrgencyRecs} high-urgency and ${snap.pendingActions} pending action(s). Top priority: "${snap.topPriorityTitle ?? "(none)"}". Give me a 4-bullet executive synthesis: (a) what I should focus on this week, (b) where the biggest cross-functional risk sits, (c) what to delegate, (d) what to defer. Recommend only.`,
        intent: "ask",
      });
      setSynth(r.response.content);
    } catch (e) {
      toast({ title: "Advisor unavailable", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" });
    } finally {
      setSynthing(false);
    }
  }

  async function quickStrategicScenario() {
    setSimRunning(true);
    try {
      const r = await runAdvisorSimulation({
        advisorId: "ceo-advisor",
        scenarioTitle: "Mobile quickrun: 3-direction strategic tradeoff",
        inputs: { scenario_type: "strategic-direction", delta: 3, recommend_only: true },
        assumptions: { source: "mobile-quickrun", authority: "L2-recommend" },
      });
      toast({
        title: r.status === "completed" ? "Synthesis ready" : "Failed",
        description:
          r.status === "completed"
            ? `Confidence ${Math.round(r.confidence * 100)}% — recommend-only, requires operator decision.`
            : r.riskSummary,
        variant: r.status === "completed" ? "default" : "destructive",
      });
    } finally {
      setSimRunning(false);
    }
  }

  if (!snap) {
    return <Skeleton className="h-32 w-full" />;
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Recs</p>
              <p className="text-base font-semibold">{snap.totalRecs}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Advisors</p>
              <p className="text-base font-semibold">{snap.distinctAdvisors}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Urgent</p>
              <p className="text-base font-semibold">{snap.highUrgencyRecs}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Pending</p>
              <p className="text-base font-semibold">{snap.pendingActions}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Crown className="h-3.5 w-3.5" /> Top priority
            {snap.topPriorityTitle && (
              <Badge variant="outline" className="ml-auto text-[10px] h-4 max-w-[140px] truncate">{snap.topPriorityTitle}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            disabled={snap.totalRecs === 0 || synthing}
            onClick={quickSynthesize}
          >
            {synthing
              ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Synthesizing…</>
              : "Synthesize this week's focus"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="h-3.5 w-3.5" /> Strategic scenario
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button size="sm" className="w-full text-xs" disabled={simRunning} onClick={quickStrategicScenario}>
            {simRunning
              ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Running…</>
              : "Run 3-direction tradeoff"}
          </Button>
        </CardContent>
      </Card>

      {synth && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <AlarmClock className="h-3 w-3" />CEO synthesis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0"><p className="text-xs whitespace-pre-wrap">{synth}</p></CardContent>
        </Card>
      )}
    </div>
  );
}