// ═══════════════════════════════════════════════════════════════
// Mobile-friendly CFO Advisor: compact financial pulse + sim.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlarmClock, AlertOctagon, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor, runAdvisorSimulation } from "@/lib/ai-platform/runtime";
import { useToast } from "@/hooks/use-toast";

interface MobileSnap {
  overdueCount: number;
  overdueCents: number;
  budgetBreaches: number;
  cash30dCents: number;
  currency: string;
}

function fmtMoney(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(0)} ${currency}`;
  }
}

export function MobileCFOAdvisorPanels() {
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
      const nowIso = new Date().toISOString();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const [overdueRes, overdueListRes, budgetsRes, txnsRes] = await Promise.all([
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("user_id", userId).neq("status", "paid").lt("due_at", nowIso),
        supabase.from("invoices").select("amount_cents, currency").eq("user_id", userId).neq("status", "paid").lt("due_at", nowIso).limit(500),
        supabase.from("budgets").select("allocated_cents, spent_cents").eq("user_id", userId).eq("status", "active").limit(500),
        supabase.from("transactions").select("amount_cents, direction, currency").eq("user_id", userId).gte("occurred_at", thirtyDaysAgo).limit(2000),
      ]);
      if (cancelled) return;
      const overdues = (overdueListRes.data ?? []) as Array<{ amount_cents: number; currency: string }>;
      const budgets = (budgetsRes.data ?? []) as Array<{ allocated_cents: number; spent_cents: number }>;
      const txns = (txnsRes.data ?? []) as Array<{ amount_cents: number; direction: string; currency: string }>;
      let net = 0;
      let currency = overdues[0]?.currency || "USD";
      for (const t of txns) {
        const sign = (t.direction ?? "debit").toLowerCase() === "credit" ? 1 : -1;
        net += sign * Number(t.amount_cents ?? 0);
        if (t.currency) currency = t.currency;
      }
      setSnap({
        overdueCount: overdueRes.count ?? 0,
        overdueCents: overdues.reduce((s, i) => s + Number(i.amount_cents ?? 0), 0),
        budgetBreaches: budgets.filter((b) => Number(b.spent_cents) > Number(b.allocated_cents)).length,
        cash30dCents: net,
        currency,
      });
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function quickAsk(key: string, prompt: string) {
    setDrafting(key);
    setDraft(null);
    try {
      const r = await askBusinessAdvisor({ advisorId: "cfo-advisor", prompt, intent: "ask" });
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
        advisorId: "cfo-advisor",
        scenarioTitle: "Mobile quick scenario: revenue −20%",
        inputs: { scenario_type: "runway-shift", shift_pct: -20 },
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
              <p className="text-[10px] uppercase text-muted-foreground">Cash 30d (net)</p>
              <p className="text-base font-semibold">{fmtMoney(snap.cash30dCents, snap.currency)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Overdue exposure</p>
              <p className="text-base font-semibold">{fmtMoney(snap.overdueCents, snap.currency)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlarmClock className="h-3.5 w-3.5" /> Overdue invoices
            <Badge variant="outline" className="ml-auto text-[10px] h-4">{snap.overdueCount}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            disabled={snap.overdueCount === 0 || drafting === "overdue"}
            onClick={() => quickAsk("overdue", `I have ${snap.overdueCount} overdue invoices totalling ${fmtMoney(snap.overdueCents, snap.currency)}. Recommend a 3-step collection cadence prioritising the largest/oldest. Recommend-only.`)}
          >
            {drafting === "overdue" ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Thinking…</> : "Recommend collection plan"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertOctagon className="h-3.5 w-3.5" /> Budget breaches
            <Badge variant="outline" className="ml-auto text-[10px] h-4">{snap.budgetBreaches}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            disabled={snap.budgetBreaches === 0 || drafting === "budgets"}
            onClick={() => quickAsk("budgets", `I have ${snap.budgetBreaches} active budgets running over allocation. Recommend whether to cut, freeze, or top-up each — one line each. Recommend-only.`)}
          >
            {drafting === "budgets" ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Thinking…</> : "Recommend reallocation"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wallet className="h-3.5 w-3.5" /> Quick scenario
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button size="sm" className="w-full text-xs" disabled={simRunning} onClick={runQuickSim}>
            {simRunning ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Running…</> : "Run revenue −20% scenario"}
          </Button>
        </CardContent>
      </Card>

      {draft && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs">CFO Advisor recommendation</CardTitle></CardHeader>
          <CardContent className="pt-0"><p className="text-xs whitespace-pre-wrap">{draft.content}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
