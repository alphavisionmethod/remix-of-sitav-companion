// ═══════════════════════════════════════════════════════════════
// SITA OS — CFO Advisor compact header stats strip.
// Live, RLS-scoped financial pulse: 30-day cash position,
// overdue invoices, open invoice exposure, budget breach count.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, AlarmClock, FileText, AlertOctagon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  /** Net cash flow (credits − debits) over the last 30 days, in user's primary currency. */
  cashPosition: number;
  /** Currency code displayed alongside cash position (best-effort from latest transaction). */
  currency: string;
  /** Count of invoices past due_at and not paid. */
  overdueInvoices: number;
  /** Sum (cents) of all draft/sent/open invoices — exposure not yet collected. */
  openInvoicesCents: number;
  /** Count of active budgets where spent > allocated. */
  budgetBreaches: number;
}

const OPEN_INVOICE_STATUSES = ["draft", "sent", "open", "pending"];

function formatMoney(cents: number, currency: string): string {
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

export function CFOAdvisorHeaderStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) return;

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const nowIso = new Date().toISOString();

      const [txnsRes, overdueRes, openInvRes, budgetsRes] = await Promise.all([
        supabase
          .from("transactions")
          .select("amount_cents, direction, currency")
          .eq("user_id", userId)
          .gte("occurred_at", thirtyDaysAgo)
          .limit(2000),
        supabase
          .from("invoices")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .neq("status", "paid")
          .lt("due_at", nowIso),
        supabase
          .from("invoices")
          .select("amount_cents, currency")
          .eq("user_id", userId)
          .in("status", OPEN_INVOICE_STATUSES)
          .limit(2000),
        supabase
          .from("budgets")
          .select("allocated_cents, spent_cents, status")
          .eq("user_id", userId)
          .eq("status", "active")
          .limit(500),
      ]);

      if (cancelled) return;

      const txns = (txnsRes.data ?? []) as Array<{ amount_cents: number; direction: string; currency: string }>;
      let net = 0;
      let currency = "USD";
      for (const t of txns) {
        const sign = (t.direction ?? "debit").toLowerCase() === "credit" ? 1 : -1;
        net += sign * Number(t.amount_cents ?? 0);
        if (t.currency) currency = t.currency;
      }

      const openInvs = (openInvRes.data ?? []) as Array<{ amount_cents: number; currency: string }>;
      const openTotalCents = openInvs.reduce((sum, i) => sum + Number(i.amount_cents ?? 0), 0);
      if (openInvs[0]?.currency) currency = openInvs[0].currency;

      const budgets = (budgetsRes.data ?? []) as Array<{ allocated_cents: number; spent_cents: number }>;
      const breaches = budgets.filter((b) => Number(b.spent_cents ?? 0) > Number(b.allocated_cents ?? 0)).length;

      setStats({
        cashPosition: net,
        currency,
        overdueInvoices: overdueRes.count ?? 0,
        openInvoicesCents: openTotalCents,
        budgetBreaches: breaches,
      });
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  const items = [
    {
      icon: Wallet,
      label: "Cash 30d (net)",
      value: formatMoney(stats.cashPosition, stats.currency),
    },
    { icon: AlarmClock, label: "Overdue invoices", value: String(stats.overdueInvoices) },
    {
      icon: FileText,
      label: "Open invoices",
      value: formatMoney(stats.openInvoicesCents, stats.currency),
    },
    { icon: AlertOctagon, label: "Budget breaches", value: String(stats.budgetBreaches) },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Card key={it.label} className="p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{it.label}</p>
                <p className="text-lg font-semibold truncate">{it.value}</p>
              </div>
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
