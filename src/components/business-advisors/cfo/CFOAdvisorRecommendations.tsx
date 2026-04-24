// ═══════════════════════════════════════════════════════════════
// SITA OS — CFO Advisor "Recommendations" panel.
//
// Reads invoices + budgets + transactions under RLS and produces
// evidence-backed CFO recommendations:
//   • Cash-flow risks  — overdue invoices ranked by days late
//   • Budget pressure  — categories burning above 85% utilization
//   • Spend anomalies  — outsized debit transactions in last 30d
//
// Click any row → CFODetailDrawer with full record + draft memo.
// Empty-state honest — no fabricated numbers.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlarmClock, AlertOctagon, Activity, Loader2, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor } from "@/lib/ai-platform/runtime";
import { CFODetailDrawer, type CFODrawerTarget } from "./CFODetailDrawer";

interface InvoiceRow {
  id: string;
  invoice_number: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  due_at: string | null;
  issued_at: string | null;
}

interface BudgetRow {
  id: string;
  category: string;
  allocated_cents: number;
  spent_cents: number;
  status: string;
  period_start: string;
  period_end: string;
}

interface TxnRow {
  id: string;
  amount_cents: number;
  currency: string;
  direction: string;
  category: string | null;
  description: string | null;
  occurred_at: string;
}

interface CFOSnapshot {
  overdueInvoices: InvoiceRow[];
  budgetPressure: BudgetRow[];
  spendAnomalies: TxnRow[];
  totalOverdueCents: number;
  currency: string;
  loadedAt: string;
}

const PRESSURE_RATIO = 0.85;

function fmtMoney(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(0)} ${currency}`;
  }
}

function daysOverdue(due: string | null): number {
  if (!due) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(due).getTime()) / (1000 * 60 * 60 * 24)));
}

async function loadCFOSnapshot(userId: string): Promise<CFOSnapshot> {
  const nowIso = new Date().toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [overdueRes, budgetsRes, txnsRes] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, invoice_number, amount_cents, currency, status, due_at, issued_at")
      .eq("user_id", userId)
      .neq("status", "paid")
      .lt("due_at", nowIso)
      .order("due_at", { ascending: true })
      .limit(15),
    supabase
      .from("budgets")
      .select("id, category, allocated_cents, spent_cents, status, period_start, period_end")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("transactions")
      .select("id, amount_cents, currency, direction, category, description, occurred_at")
      .eq("user_id", userId)
      .eq("direction", "debit")
      .gte("occurred_at", thirtyDaysAgo)
      .order("amount_cents", { ascending: false })
      .limit(8),
  ]);

  const overdueInvoices = (overdueRes.data ?? []) as InvoiceRow[];
  const budgets = (budgetsRes.data ?? []) as BudgetRow[];
  const budgetPressure = budgets
    .filter((b) => Number(b.allocated_cents) > 0 && Number(b.spent_cents) / Number(b.allocated_cents) >= PRESSURE_RATIO)
    .sort((a, b) => Number(b.spent_cents) / Number(b.allocated_cents) - Number(a.spent_cents) / Number(a.allocated_cents))
    .slice(0, 8);

  const totalOverdueCents = overdueInvoices.reduce((s, i) => s + Number(i.amount_cents ?? 0), 0);
  const currency = overdueInvoices[0]?.currency || (txnsRes.data?.[0] as TxnRow | undefined)?.currency || "USD";

  return {
    overdueInvoices,
    budgetPressure,
    spendAnomalies: (txnsRes.data ?? []) as TxnRow[],
    totalOverdueCents,
    currency,
    loadedAt: new Date().toISOString(),
  };
}

export function CFOAdvisorRecommendations() {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<CFOSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [askLoading, setAskLoading] = useState<string | null>(null);
  const [askResult, setAskResult] = useState<{ key: string; content: string } | null>(null);
  const [drawerTarget, setDrawerTarget] = useState<CFODrawerTarget | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) {
        if (!cancelled) {
          setError("Sign in to view CFO Advisor recommendations.");
          setLoading(false);
        }
        return;
      }
      try {
        const snap = await loadCFOSnapshot(userId);
        if (!cancelled) setSnapshot(snap);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load financial context");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  async function askForDraft(key: string, prompt: string) {
    setAskLoading(key);
    setAskResult(null);
    try {
      const r = await askBusinessAdvisor({
        advisorId: "cfo-advisor",
        prompt,
        intent: "ask",
      });
      setAskResult({ key, content: r.response.content });
    } catch (e) {
      setAskResult({ key, content: e instanceof Error ? e.message : "Advisor unavailable" });
    } finally {
      setAskLoading(null);
    }
  }

  const groups = useMemo(() => {
    if (!snapshot) return [];
    return [
      {
        key: "overdue",
        icon: AlarmClock,
        title: "Cash-flow risk — overdue invoices",
        description:
          snapshot.overdueInvoices.length === 0
            ? "Nothing past due. Collections current."
            : `${snapshot.overdueInvoices.length} invoice${snapshot.overdueInvoices.length === 1 ? "" : "s"} past due — total exposure ${fmtMoney(snapshot.totalOverdueCents, snapshot.currency)}`,
        items: snapshot.overdueInvoices.map((i) => ({
          id: i.id,
          kind: "invoice" as const,
          primary: i.invoice_number ?? `Invoice ${i.id.slice(0, 8)}`,
          secondary: `${fmtMoney(i.amount_cents, i.currency)} · due ${i.due_at ? new Date(i.due_at).toLocaleDateString() : "—"}`,
          chip: `${daysOverdue(i.due_at)}d late`,
          chipVariant: "destructive" as const,
        })),
        action:
          snapshot.overdueInvoices.length > 0
            ? {
                label: "Recommend collection plan",
                prompt:
                  `I have ${snapshot.overdueInvoices.length} overdue invoices totalling ${fmtMoney(snapshot.totalOverdueCents, snapshot.currency)}. ` +
                  `Outline a 3-step collection cadence (today / +3d / +7d), highlight which invoices to escalate first based on days-late and amount, ` +
                  `and call out one risk to watch. Recommend-only — never auto-send.`,
              }
            : null,
      },
      {
        key: "budgets",
        icon: AlertOctagon,
        title: "Budget pressure — categories above 85%",
        description:
          snapshot.budgetPressure.length === 0
            ? "No active budgets at pressure."
            : `${snapshot.budgetPressure.length} categor${snapshot.budgetPressure.length === 1 ? "y" : "ies"} burning hot`,
        items: snapshot.budgetPressure.map((b) => {
          const ratio = Number(b.allocated_cents) > 0 ? Number(b.spent_cents) / Number(b.allocated_cents) : 0;
          return {
            id: b.id,
            kind: "budget" as const,
            primary: b.category,
            secondary: `${fmtMoney(b.spent_cents, "USD")} of ${fmtMoney(b.allocated_cents, "USD")} · ${b.period_start} → ${b.period_end}`,
            chip: `${(ratio * 100).toFixed(0)}%`,
            chipVariant: ratio > 1 ? ("destructive" as const) : ("outline" as const),
          };
        }),
        action:
          snapshot.budgetPressure.length > 0
            ? {
                label: "Recommend reallocation",
                prompt:
                  `These budget categories are at or above 85% utilization: ${snapshot.budgetPressure.map((b) => `${b.category} (${((Number(b.spent_cents) / Number(b.allocated_cents)) * 100).toFixed(0)}%)`).join(", ")}. ` +
                  `Recommend a reallocation strategy (cut, freeze, or top-up) for each, with one-line reasoning. ` +
                  `Flag any that look structural vs. one-off. Recommend-only.`,
              }
            : null,
      },
      {
        key: "spend",
        icon: TrendingDown,
        title: "Largest debits in last 30 days",
        description:
          snapshot.spendAnomalies.length === 0
            ? "No debit transactions in the last 30 days."
            : `Top ${snapshot.spendAnomalies.length} largest debits — review for anomalies`,
        items: snapshot.spendAnomalies.map((t) => ({
          id: t.id,
          kind: "transaction" as const,
          primary: t.description?.trim() || t.category || "(uncategorized)",
          secondary: `${t.category ?? "uncategorized"} · ${new Date(t.occurred_at).toLocaleDateString()}`,
          chip: fmtMoney(t.amount_cents, t.currency),
          chipVariant: "outline" as const,
        })),
        action:
          snapshot.spendAnomalies.length > 0
            ? {
                label: "Spot anomalies",
                prompt:
                  `Review these top debit transactions from the last 30 days and flag any that look unusual by size, category, or description:\n` +
                  snapshot.spendAnomalies
                    .map((t) => `- ${fmtMoney(t.amount_cents, t.currency)} · ${t.category ?? "uncategorized"} · ${(t.description ?? "").slice(0, 60)}`)
                    .join("\n") +
                  `\nFor each suspicious one, give a 1-line "why look closer" reason. Recommend-only.`,
              }
            : null,
      },
    ];
  }, [snapshot]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!snapshot) return null;

  function openDrawer(item: { id: string; kind: "invoice" | "budget" | "transaction"; primary: string }) {
    setDrawerTarget({ kind: item.kind, id: item.id, label: item.primary });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Cash &amp; collections snapshot</CardTitle>
              <CardDescription>
                Total overdue exposure across your RLS-scoped AR ledger
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold">
                {fmtMoney(snapshot.totalOverdueCents, snapshot.currency)}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {groups.map((g) => {
        const Icon = g.icon;
        return (
          <Card key={g.key}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">{g.title}</CardTitle>
                </div>
                {g.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => askForDraft(g.key, g.action!.prompt)}
                    disabled={askLoading === g.key}
                  >
                    {askLoading === g.key ? (
                      <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Thinking…</>
                    ) : (
                      g.action.label
                    )}
                  </Button>
                )}
              </div>
              <CardDescription>{g.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {g.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing to flag — clean here.</p>
              ) : (
                <ScrollArea className="max-h-[240px]">
                  <div className="space-y-2">
                    {g.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openDrawer(item)}
                        className="w-full flex items-center justify-between rounded-md border border-border px-3 py-2 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Open detail for ${item.primary}`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item.primary}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.secondary}</p>
                        </div>
                        <Badge variant={item.chipVariant} className="text-xs ml-2 shrink-0">{item.chip}</Badge>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
              {askResult?.key === g.key && (
                <div className="mt-3 rounded-md border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    CFO Advisor recommendation (recommend-only — review before acting):
                  </p>
                  <div className="text-sm whitespace-pre-wrap">{askResult.content}</div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <CFODetailDrawer
        target={drawerTarget}
        onOpenChange={(open) => {
          if (!open) setDrawerTarget(null);
        }}
      />
    </div>
  );
}
