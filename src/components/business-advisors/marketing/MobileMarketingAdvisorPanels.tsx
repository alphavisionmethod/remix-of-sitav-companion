// ═══════════════════════════════════════════════════════════════
// Mobile-friendly Marketing Advisor: compact pulse + quick sim.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Inbox, Megaphone, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor, runAdvisorSimulation } from "@/lib/ai-platform/runtime";
import { useToast } from "@/hooks/use-toast";

interface MobileSnap {
  inbound30d: number;
  untriaged: number;
  activeLeads: number;
  topChannel: { name: string; sharePct: number } | null;
}

const ACTIVE_LEAD_STATUSES = ["new", "working", "nurture", "qualified", "engaged"];

export function MobileMarketingAdvisorPanels() {
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
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [inboxCountRes, untriagedRes, leadsCountRes, channelRes] = await Promise.all([
        supabase.from("lead_inbox_items").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", thirtyDaysAgo),
        supabase.from("lead_inbox_items").select("id", { count: "exact", head: true }).eq("user_id", userId).in("triage_status", ["new", "pending", "needs_review"]),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("user_id", userId).in("status", ACTIVE_LEAD_STATUSES),
        supabase.from("leads").select("source").eq("user_id", userId).gte("created_at", thirtyDaysAgo).limit(2000),
      ]);
      if (cancelled) return;

      const channelRows = (channelRes.data ?? []) as Array<{ source: string | null }>;
      const counts = new Map<string, number>();
      for (const r of channelRows) {
        const k = (r.source ?? "(unknown)").toLowerCase().trim() || "(unknown)";
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
      let topChannel: MobileSnap["topChannel"] = null;
      if (channelRows.length > 0) {
        const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
        const [name, count] = sorted[0]!;
        topChannel = { name, sharePct: (count / channelRows.length) * 100 };
      }

      setSnap({
        inbound30d: inboxCountRes.count ?? 0,
        untriaged: untriagedRes.count ?? 0,
        activeLeads: leadsCountRes.count ?? 0,
        topChannel,
      });
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function quickAsk(key: string, prompt: string) {
    setDrafting(key);
    setDraft(null);
    try {
      const r = await askBusinessAdvisor({ advisorId: "marketing-advertising-advisor", prompt, intent: "ask" });
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
        advisorId: "marketing-advertising-advisor",
        scenarioTitle: "Mobile quick scenario: budget +20%",
        inputs: { scenario_type: "budget-shift", shift_pct: 20 },
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
              <p className="text-[10px] uppercase text-muted-foreground">Inbound 30d</p>
              <p className="text-base font-semibold">{snap.inbound30d}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Top channel</p>
              <p className="text-base font-semibold truncate">
                {snap.topChannel ? `${snap.topChannel.name} ${snap.topChannel.sharePct.toFixed(0)}%` : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Inbox className="h-3.5 w-3.5" /> Untriaged inbound
            <Badge variant="outline" className="ml-auto text-[10px] h-4">{snap.untriaged}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            disabled={snap.untriaged === 0 || drafting === "untriaged"}
            onClick={() => quickAsk("untriaged", `I have ${snap.untriaged} untriaged inbound signals. Recommend a 3-step triage cadence prioritising high urgency. Recommend-only.`)}
          >
            {drafting === "untriaged" ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Thinking…</> : "Recommend triage cadence"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-3.5 w-3.5" /> Active leads
            <Badge variant="outline" className="ml-auto text-[10px] h-4">{snap.activeLeads}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            disabled={snap.activeLeads === 0 || drafting === "leads"}
            onClick={() => quickAsk("leads", `I have ${snap.activeLeads} active leads in pipeline${snap.topChannel ? `, mostly from ${snap.topChannel.name}` : ""}. Recommend the next-best message angle and one creative variant to test. Recommend-only.`)}
          >
            {drafting === "leads" ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Thinking…</> : "Recommend message angle"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Megaphone className="h-3.5 w-3.5" /> Quick scenario
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button size="sm" className="w-full text-xs" disabled={simRunning} onClick={runQuickSim}>
            {simRunning ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Running…</> : "Run budget +20% scenario"}
          </Button>
        </CardContent>
      </Card>

      {draft && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs">Marketing Advisor recommendation</CardTitle></CardHeader>
          <CardContent className="pt-0"><p className="text-xs whitespace-pre-wrap">{draft.content}</p></CardContent>
        </Card>
      )}
    </div>
  );
}