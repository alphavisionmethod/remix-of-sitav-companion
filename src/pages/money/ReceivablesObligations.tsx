import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { StateBadge } from "@/components/sita/StateBadge";
import { useState } from "react";
import { DollarSign, ArrowDownLeft, ArrowUpRight, Clock, AlertTriangle, CheckCircle, Send, Phone } from "lucide-react";
import { motion } from "framer-motion";

interface Receivable {
  id: number; source: string; initials: string; amount: string; expected: string; type: "invoice" | "reimbursement" | "payment";
  status: "expected" | "overdue" | "received" | "partial"; daysOut: number; linkedTo?: string;
}

interface Obligation {
  id: number; payee: string; amount: string; due: string; type: "bill" | "loan" | "subscription" | "contract";
  status: "upcoming" | "due" | "overdue" | "paid"; recurring: boolean;
}

const receivables: Receivable[] = [
  { id: 1, source: "Apex Corp", initials: "AC", amount: "$3,200", expected: "Apr 5", type: "invoice", status: "expected", daysOut: 5, linkedTo: "Invoice #1039" },
  { id: 2, source: "Lisa Thompson", initials: "LT", amount: "$4,200", expected: "Apr 12", type: "invoice", status: "expected", daysOut: 12, linkedTo: "Invoice #1040" },
  { id: 3, source: "David Kim", initials: "DK", amount: "$1,800", expected: "Mar 21", type: "invoice", status: "overdue", daysOut: -12, linkedTo: "Invoice #1035" },
  { id: 4, source: "Insurance Claim", initials: "IC", amount: "$650", expected: "Apr 15", type: "reimbursement", status: "expected", daysOut: 15 },
];

const obligations: Obligation[] = [
  { id: 1, payee: "Office Rent", amount: "$2,400", due: "Apr 1", type: "bill", status: "due", recurring: true },
  { id: 2, payee: "Car Loan", amount: "$485", due: "Apr 15", type: "loan", status: "upcoming", recurring: true },
  { id: 3, payee: "Tax Quarterly", amount: "$3,200", due: "Apr 15", type: "bill", status: "upcoming", recurring: true },
  { id: 4, payee: "Office Lease Contract", amount: "$2,400/mo", due: "Ongoing", type: "contract", status: "upcoming", recurring: true },
];

const ReceivablesObligations = () => {
  const [tab, setTab] = useState("receivables");

  const totalReceivable = receivables.filter(r => r.status !== "received").reduce((s, r) => s + parseInt(r.amount.replace(/[^0-9]/g, "")), 0);
  const totalObligation = obligations.filter(o => o.status !== "paid").reduce((s, o) => s + parseInt(o.amount.replace(/[^0-9]/g, "")), 0);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SitaPageHeader title="Receivables & Obligations" subtitle="What's coming in, what's going out" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Receivable" value={`$${(totalReceivable / 1000).toFixed(1)}K`} icon={ArrowDownLeft} sub={`${receivables.filter(r => r.status !== "received").length} pending`} />
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
          {receivables.map((r) => (
            <SitaCard key={r.id} lane={r.status === "overdue" ? "action" : r.status === "expected" ? "opportunity" : undefined} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-trust-verified/8 font-display text-sm font-semibold text-trust-verified shrink-0">{r.initials}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{r.source}</p>
                    <p className="text-xs text-muted-foreground">{r.linkedTo || r.type} · {r.status === "overdue" ? `${Math.abs(r.daysOut)}d overdue` : `Expected ${r.expected}`}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-sm font-bold text-foreground">{r.amount}</p>
                  <TrustBadge level={r.status === "overdue" ? "degraded" : r.status === "received" ? "verified" : "review"} label={r.status === "overdue" ? "Overdue" : r.status === "received" ? "Received" : "Expected"} size="sm" />
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
          {obligations.map((o) => (
            <SitaCard key={o.id} lane={o.status === "due" ? "action" : undefined} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{o.payee}</p>
                  <p className="text-xs text-muted-foreground">{o.type} · {o.recurring ? "Recurring" : "One-time"} · Due {o.due}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-sm font-bold text-foreground">{o.amount}</p>
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
