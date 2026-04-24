// ═══════════════════════════════════════════════════════════════
// Mobile-friendly Sales Advisor: compact pipeline + simulation
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Flame, Hourglass, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor, runAdvisorSimulation } from "@/lib/ai-platform/runtime";
import { useToast } from "@/hooks/use-toast";

interface MobileSnap {
  newLeads: number;
  hotOpps: number;
  stalledOpps: number;
  pipelineValue: number;
}

function fmtMoney(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function MobileSalesAdvisorPanels() {
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
      const sevenAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const staleAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

      const [leadsRes, oppsRes] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", sevenAgo),
        supabase
          .from("crm_opportunities")
          .select("id, value, probability, status, updated_at")
          .eq("user_id", userId)
          .limit(200),
      ]);

      const opps = (oppsRes.data ?? []) as Array<{ value: number | null; probability: number | null; status: string | null; updated_at: string }>;
      const open = opps.filter((o) => o.status !== "won" && o.status !== "lost" && o.status !== "closed");

      if (cancelled) return;
      setSnap({
        newLeads: leadsRes.count ?? 0,
        hotOpps: open.filter((o) => (o.probability ?? 0) >= 60).length,
        stalledOpps: open.filter((o) => o.updated_at < staleAgo).length,
        pipelineValue: open.reduce((s, o) => s + Number(o.value ?? 0), 0),
      });
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function quickAsk(key: string, prompt: string) {
    setDrafting(key);
    setDraft(null);
    try {
      const r = await askBusinessAdvisor({ advisorId: "sales-advisor", prompt, intent: "draft" });
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
        advisorId: "sales-advisor",
        scenarioTitle: "Mobile quick scenario: +5% close rate",
        inputs: { scenario_type: "close-rate-lift", shift_pct: 5 },
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
              <p className="text-[10px] uppercase text-muted-foreground">Pipeline</p>
              <p className="text-base font-semibold">{fmtMoney(snap.pipelineValue)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">New leads (7d)</p>
              <p className="text-base font-semibold">{snap.newLeads}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Flame className="h-3.5 w-3.5" /> Hot opportunities
            <Badge variant="outline" className="ml-auto text-[10px] h-4">{snap.hotOpps}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            disabled={snap.hotOpps === 0 || drafting === "hot"}
            onClick={() => quickAsk("hot", `I have ${snap.hotOpps} hot deals (≥60% probability). Draft a tight one-week close plan.`)}
          >
            {drafting === "hot" ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Drafting…</> : "Draft close plan"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Hourglass className="h-3.5 w-3.5" /> Stalled (>14d)
            <Badge variant="outline" className="ml-auto text-[10px] h-4">{snap.stalledOpps}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            disabled={snap.stalledOpps === 0 || drafting === "stalled"}
            onClick={() => quickAsk("stalled", `Draft 3 short re-engagement message variants for ${snap.stalledOpps} stalled deals.`)}
          >
            {drafting === "stalled" ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Drafting…</> : "Draft re-engagement"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> Quick scenario
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button size="sm" className="w-full text-xs" disabled={simRunning} onClick={runQuickSim}>
            {simRunning ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Running…</> : "Run +5% close-rate scenario"}
          </Button>
        </CardContent>
      </Card>

      {draft && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Sales Advisor draft</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs whitespace-pre-wrap">{draft.content}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}