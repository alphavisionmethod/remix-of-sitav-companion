// ═══════════════════════════════════════════════════════════════
// Mobile-friendly Tech Advisor: compact reliability pulse + quick sim.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlertTriangle, Bug, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor, runAdvisorSimulation } from "@/lib/ai-platform/runtime";
import { useToast } from "@/hooks/use-toast";

interface MobileSnap {
  highSevCount: number;
  worstIncidentTitle: string | null;
  worstIncidentSeverity: string | null;
  recurringErrorCount: number;
  noisyFingerprint: string | null;
  noisyCount: number;
  errors7d: number;
}

const RECURRING_THRESHOLD = 3;

export function MobileTechAdvisorPanels() {
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
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [incRes, errRes, errors7dRes] = await Promise.all([
        supabase
          .from("incidents")
          .select("title, severity, status")
          .eq("user_id", userId)
          .neq("status", "resolved")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("error_events")
          .select("fingerprint, count")
          .eq("user_id", userId)
          .is("resolved_at", null)
          .order("count", { ascending: false })
          .limit(50),
        supabase
          .from("error_events")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("last_seen_at", sevenDaysAgo),
      ]);
      if (cancelled) return;

      const incidents = (incRes.data ?? []) as Array<{ title: string; severity: string; status: string }>;
      const high = incidents.filter((i) => i.severity === "critical" || i.severity === "high");
      const errors = (errRes.data ?? []) as Array<{ fingerprint: string; count: number }>;
      const recurring = errors.filter((e) => (e.count ?? 0) >= RECURRING_THRESHOLD);

      setSnap({
        highSevCount: high.length,
        worstIncidentTitle: high[0]?.title ?? null,
        worstIncidentSeverity: high[0]?.severity ?? null,
        recurringErrorCount: recurring.length,
        noisyFingerprint: recurring[0]?.fingerprint ?? null,
        noisyCount: recurring[0]?.count ?? 0,
        errors7d: errors7dRes.count ?? 0,
      });
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function quickAsk(key: string, prompt: string) {
    setDrafting(key);
    setDraft(null);
    try {
      const r = await askBusinessAdvisor({ advisorId: "tech-advisor", prompt, intent: "ask" });
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
        advisorId: "tech-advisor",
        scenarioTitle: "Mobile quick scenario: 3× load",
        inputs: { scenario_type: "scaling-threshold", delta: 3 },
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
              <p className="text-[10px] uppercase text-muted-foreground">Errors 7d</p>
              <p className="text-base font-semibold">{snap.errors7d}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Worst incident</p>
              <p className="text-base font-semibold truncate">
                {snap.worstIncidentSeverity ?? "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" /> High-severity incidents
            <Badge variant="outline" className="ml-auto text-[10px] h-4">{snap.highSevCount}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            disabled={snap.highSevCount === 0 || drafting === "high-sev"}
            onClick={() => quickAsk("high-sev", `My most-recent high-severity open incident is "${snap.worstIncidentTitle ?? "(unknown)"}" (${snap.worstIncidentSeverity ?? "—"}). Recommend the top 3 triage steps. Recommend-only.`)}
          >
            {drafting === "high-sev" ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Thinking…</> : "Recommend triage"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bug className="h-3.5 w-3.5" /> Recurring errors
            <Badge variant="outline" className="ml-auto text-[10px] h-4">{snap.recurringErrorCount}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            disabled={snap.recurringErrorCount === 0 || drafting === "recurring"}
            onClick={() => quickAsk("recurring", `My noisiest unresolved error fingerprint is "${snap.noisyFingerprint ?? "(unknown)"}" with ${snap.noisyCount} occurrences. Recommend the top 2 likely root causes. Recommend-only.`)}
          >
            {drafting === "recurring" ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Thinking…</> : "Recommend root causes"}
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
            {simRunning ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Running…</> : "Run 3× load scenario"}
          </Button>
        </CardContent>
      </Card>

      {draft && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs">Tech Advisor recommendation</CardTitle></CardHeader>
          <CardContent className="pt-0"><p className="text-xs whitespace-pre-wrap">{draft.content}</p></CardContent>
        </Card>
      )}
    </div>
  );
}