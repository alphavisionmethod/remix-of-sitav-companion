import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { useState, useMemo } from "react";
import { DollarSign, ArrowDownLeft, ArrowUpRight, Clock, AlertTriangle, CheckCircle, Send, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useInvoices, useBills } from "@/hooks/use-sita-data";


interface ReceivablesObligationsRow {
  amount?: number;
  category?: string;
  client_name?: unknown;
  description?: string;
  due_date?: string;
  id?: string;
  invoice_number?: string;
  is_recu?: unknown;
  is_recurring?: unknown;
  name?: string;
  payee?: unknown;
  status?: string;
}

const ReceivablesObligations = () => {
  const [tab, setTab] = useState("receivables");
  const { data: invoices = [], isLoading: invLoading } = useInvoices();
  const { data: bills = [], isLoading: billsLoading } = useBills();

  const receivables = useMemo(() =>
    invoices.filter((i: ReceivablesObligationsRow) => i.status !== "paid").map((i: ReceivablesObligationsRow) => {
      const now = new Date();
      const due = new Date(i.due_date);
      const daysOut = Math.ceil((due.getTime() - now.getTime()) / 86400000);
      const status = daysOut < 0 ? "overdue" : "expected";
      return {
        id: i.id, source: i.client_name || i.description || `Invoice #${i.invoice_number}`,
        initials: (i.client_name || "??").slice(0, 2).toUpperCase(),
        amount: Number(i.amount), expected: due.toLocaleDateString("en", { month: "short", day: "numeric" }),
        type: "invoice" as const, status, daysOut, linkedTo: `Invoice #${i.invoice_number}`,
      };
    }),
  [invoices]);

  const obligations = useMemo(() =>
    bills.filter((b: ReceivablesObligationsRow) => b.status !== "paid").map((b: ReceivablesObligationsRow) => {
      const now = new Date();
      const due = new Date(b.due_date);
      const daysOut = Math.ceil((due.getTime() - now.getTime()) / 86400000);
      const status = daysOut < 0 ? "overdue" : daysOut <= 1 ? "due" : "upcoming";
      return {
        id: b.id, payee: b.name || b.payee, amount: Number(b.amount),
        due: due.toLocaleDateString("en", { month: "short", day: "numeric" }),
        type: b.category || "bill", status, recurring: b.is_recurring || false,
      };
    }),
  [bills]);

  const totalReceivable = receivables.reduce((s, r) => s + r.amount, 0);
  const totalObligation = obligations.reduce((s, o) => s + o.amount, 0);

  if (invLoading || billsLoading) return <SectionSkeleton cards={4} columns={1} />;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader title="Receivables & Obligations" subtitle="What's coming in, what's going out" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Receivable" value={`$${(totalReceivable / 1000).toFixed(1)}K`} icon={ArrowDownLeft} sub={`${receivables.length} pending`} />
        <KPITile label="Overdue Receivables" value={receivables.filter(r => r.status === "overdue").length} icon={AlertTriangle} sub="Needs follow-up" />
        <KPITile label="Total Obligations" value={`$${(totalObligation / 1000).toFixed(1)}K`} icon={ArrowUpRight} sub="Due this period" />
        <KPITile label="Net Position" value={`${totalReceivable >= totalObligation ? "+" : "-"}$${Math.abs(totalReceivable - totalObligation).toLocaleString()}`} trend={totalReceivable >= totalObligation ? "up" : "down"} icon={DollarSign} />
      </div>

      <SitaTabs
        tabs={[
          { key: "receivables", label: "Receivables", count: receivables.length },
          { key: "obligations", label: "Obligations", count: obligations.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "receivables" && (
        <div className="space-y-2">
          {receivables.length === 0 ? (
            <EmptyState icon={ArrowDownLeft} title="No pending receivables" description="All invoices are paid" />
          ) : receivables.map((r) => (
            <SitaCard key={r.id} lane={r.status === "overdue" ? "action" : "opportunity"} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-trust-verified/8 font-display text-sm font-semibold text-trust-verified shrink-0">{r.initials}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{r.source}</p>
                    <p className="text-xs text-muted-foreground">{r.linkedTo} · {r.status === "overdue" ? `${Math.abs(r.daysOut)}d overdue` : `Expected ${r.expected}`}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-sm font-bold text-foreground">${r.amount.toLocaleString()}</p>
                  <TrustBadge level={r.status === "overdue" ? "degraded" : "review"} label={r.status === "overdue" ? "Overdue" : "Expected"} size="sm" />
                </div>
              </div>
              {r.status === "overdue" && (
                <div className="mt-3 flex gap-2">
                  <SitaButton variant="accent" size="sm"><Send className="h-3 w-3" /> Send Reminder</SitaButton>
                  <SitaButton variant="ghost" size="sm"><Phone className="h-3 w-3" /> Call</SitaButton>
                </div>
              )}
            </SitaCard>
          ))}
        </div>
      )}

      {tab === "obligations" && (
        <div className="space-y-2">
          {obligations.length === 0 ? (
            <EmptyState icon={ArrowUpRight} title="No pending obligations" description="All bills are paid" />
          ) : obligations.map((o) => (
            <SitaCard key={o.id} lane={o.status === "due" ? "action" : undefined} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{o.payee}</p>
                  <p className="text-xs text-muted-foreground">{o.type} · {o.recurring ? "Recurring" : "One-time"} · Due {o.due}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-sm font-bold text-foreground">${o.amount.toLocaleString()}</p>
                  <TrustBadge level={o.status === "due" ? "degraded" : o.status === "overdue" ? "blocked" : "review"} label={o.status} size="sm" />
                </div>
              </div>
            </SitaCard>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ReceivablesObligations;
