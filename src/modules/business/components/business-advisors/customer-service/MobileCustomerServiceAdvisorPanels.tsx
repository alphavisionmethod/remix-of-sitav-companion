// ═══════════════════════════════════════════════════════════════
// Mobile-friendly Customer Service Advisor: compact queue + sim
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlarmClock, AlertTriangle, HeartPulse } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor, runAdvisorSimulation } from "@/lib/ai-platform/runtime";
import { useToast } from "@/hooks/use-toast";

interface MobileSnap {
  open: number;
  urgent: number;
  escalated: number;
  atRisk: number;
}

const URGENT_PRIORITIES = ["high", "urgent"];
const RESOLVED_STATUSES = "(resolved,closed)";

export function MobileCustomerServiceAdvisorPanels() {
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
      const [openRes, urgentRes, escRes, atRiskRes] = await Promise.all([
        supabase
          .from("support_cases")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .not("status", "in", RESOLVED_STATUSES),
        supabase
          .from("support_cases")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .in("priority", URGENT_PRIORITIES)
          .not("status", "in", RESOLVED_STATUSES),
        supabase
          .from("support_cases")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .not("escalated_to_role", "is", null)
          .not("status", "in", RESOLVED_STATUSES),
        supabase
          .from("customers")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .lt("health_score", 40),
      ]);
      if (cancelled) return;
      setSnap({
        open: openRes.count ?? 0,
        urgent: urgentRes.count ?? 0,
        escalated: escRes.count ?? 0,
        atRisk: atRiskRes.count ?? 0,
      });
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function quickAsk(key: string, prompt: string) {
    setDrafting(key);
    setDraft(null);
    try {
      const r = await askBusinessAdvisor({ advisorId: "customer-service-advisor", prompt, intent: "draft" });
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
        advisorId: "customer-service-advisor",
        scenarioTitle: "Mobile quick scenario: 1h SLA target",
        inputs: { scenario_type: "response-time-target", shift_pct: 50 },
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
              <p className="text-[10px] uppercase text-muted-foreground">Open cases</p>
              <p className="text-base font-semibold">{snap.open}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">At-risk customers</p>
              <p className="text-base font-semibold">{snap.atRisk}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlarmClock className="h-3.5 w-3.5" /> Urgent / SLA-risk
            <Badge variant="outline" className="ml-auto text-[10px] h-4">{snap.urgent}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            disabled={snap.urgent === 0 || drafting === "urgent"}
            onClick={() => quickAsk("urgent", `I have ${snap.urgent} urgent/high-priority cases open. Draft an empathetic, action-oriented reply template, under 120 words.`)}
          >
            {drafting === "urgent" ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Drafting…</> : "Draft urgent reply"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" /> Escalated
            <Badge variant="outline" className="ml-auto text-[10px] h-4">{snap.escalated}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            disabled={snap.escalated === 0 || drafting === "escalated"}
            onClick={() => quickAsk("escalated", `Draft a concise internal hand-off note for ${snap.escalated} escalated cases — context, impact, recommended next step.`)}
          >
            {drafting === "escalated" ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Drafting…</> : "Draft hand-off note"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <HeartPulse className="h-3.5 w-3.5" /> Quick scenario
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button size="sm" className="w-full text-xs" disabled={simRunning} onClick={runQuickSim}>
            {simRunning ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Running…</> : "Run 1h SLA scenario"}
          </Button>
        </CardContent>
      </Card>

      {draft && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Customer Service Advisor draft</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs whitespace-pre-wrap">{draft.content}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}