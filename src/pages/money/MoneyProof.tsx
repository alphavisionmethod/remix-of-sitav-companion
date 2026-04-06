import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState, ProofCard } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { StateBadge } from "@/components/sita/StateBadge";
import { useState } from "react";
import { Shield, CheckCircle, Clock, FileText, DollarSign, Receipt, AlertTriangle, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

interface FinancialProof {
  id: number;
  action: string;
  amount?: string;
  linkedItem: string;
  category: "bill" | "subscription" | "reserve" | "transfer" | "invoice" | "approval";
  policy: string;
  approvalRecord?: string;
  result: "success" | "pending" | "failed";
  verification: "verified" | "unverified" | "pending";
  timestamp: string;
  relatedDocs?: string[];
  stateAfter: string;
}

const proofItems: FinancialProof[] = [
  {
    id: 1, action: "Rent payment scheduled via auto-pay", amount: "$2,400", linkedItem: "Office Rent — Apr 1",
    category: "bill", policy: "Auto-pay enabled for recurring bills > $500", result: "success",
    verification: "verified", timestamp: "2h ago", stateAfter: "Payment confirmed — next due May 1",
    relatedDocs: ["Bank confirmation #8823"]
  },
  {
    id: 2, action: "Invoice payment received — Stripe", amount: "$4,200", linkedItem: "Invoice #1038 — Marcus Johnson",
    category: "invoice", policy: "Automatic receivable reconciliation", result: "success",
    verification: "verified", timestamp: "2h ago", stateAfter: "Invoice marked as paid · Revenue recorded"
  },
  {
    id: 3, action: "Subscription flagged as waste", amount: "$15.99/mo", linkedItem: "Zoom Pro",
    category: "subscription", policy: "Low-usage subscription auto-flag (< 2 uses in 30 days)",
    result: "success", verification: "verified", timestamp: "Today", stateAfter: "Awaiting cancellation approval"
  },
  {
    id: 4, action: "Reserve contribution completed", amount: "$500", linkedItem: "Emergency Fund",
    category: "reserve", policy: "Monthly auto-contribution per savings policy",
    result: "success", verification: "verified", timestamp: "Yesterday",
    stateAfter: "Balance: $12,000 / $15,000 (80%)", relatedDocs: ["Transfer receipt #T-4401"]
  },
  {
    id: 5, action: "Cash timing warning generated", linkedItem: "Apr 15 — payment cluster $3,685",
    category: "bill", policy: "Alert when single-day outflow > $3,000",
    result: "success", verification: "verified", timestamp: "Yesterday",
    stateAfter: "Warning active · Monitoring balance"
  },
  {
    id: 6, action: "Transfer approval requested", amount: "$1,000", linkedItem: "Savings → Personal Checking",
    category: "transfer", policy: "Transfer alerts on amounts > $500",
    result: "pending", verification: "pending", timestamp: "Today",
    stateAfter: "Pending approval"
  },
  {
    id: 7, action: "Overdue receivable follow-up triggered", amount: "$1,800", linkedItem: "Invoice #1035 — David Kim",
    category: "invoice", policy: "Auto-reminder after 7 days overdue",
    result: "success", verification: "verified", timestamp: "3 days ago",
    stateAfter: "Reminder sent · Awaiting response", relatedDocs: ["Email reminder #RM-221"]
  },
  {
    id: 8, action: "Quarterly tax estimate approval granted", amount: "$3,200", linkedItem: "Tax Reserve → IRS",
    category: "approval", policy: "Tax payments > $1,000 require approval", approvalRecord: "Approved by Owner",
    result: "success", verification: "verified", timestamp: "1 day ago",
    stateAfter: "Scheduled for Apr 14"
  },
];

const categoryLabels: Record<string, string> = {
  bill: "Bill", subscription: "Subscription", reserve: "Reserve", transfer: "Transfer", invoice: "Invoice", approval: "Approval"
};

const MoneyProof = () => {
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = proofItems.find(p => p.id === selectedId);

  const filtered = tab === "all" ? proofItems
    : tab === "verified" ? proofItems.filter(p => p.verification === "verified")
    : tab === "pending" ? proofItems.filter(p => p.verification === "pending" || p.result === "pending")
    : proofItems;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader title="Financial Proof & Receipts" subtitle="Every financial action leaves a verifiable trail" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Proof Items" value={String(proofItems.length)} icon={Shield} />
        <KPITile label="Verified" value={String(proofItems.filter(p => p.verification === "verified").length)} icon={CheckCircle} sub="Confirmed & auditable" />
        <KPITile label="Pending" value={String(proofItems.filter(p => p.verification === "pending").length)} icon={Clock} sub="Awaiting confirmation" />
        <KPITile label="Total Value" value="$13.1K" icon={DollarSign} sub="Actions with amounts" />
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All Proof", count: proofItems.length },
          { key: "verified", label: "Verified", count: proofItems.filter(p => p.verification === "verified").length },
          { key: "pending", label: "Pending", count: proofItems.filter(p => p.verification === "pending").length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-2">
          {filtered.map((p) => (
            <SitaCard key={p.id} onClick={() => setSelectedId(p.id)} selected={selectedId === p.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`rounded-xl p-2 shrink-0 ${p.verification === "verified" ? "bg-trust-verified/8" : "bg-state-queued/8"}`}>
                    {p.verification === "verified" ? <CheckCircle className="h-4 w-4 text-trust-verified" /> : <Clock className="h-4 w-4 text-state-queued" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{p.action}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">{p.linkedItem}</span>
                      <span className="rounded bg-secondary px-1.5 py-px text-[10px] text-muted-foreground">{categoryLabels[p.category]}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{p.timestamp}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {p.amount && <p className="font-display text-sm font-bold text-foreground">{p.amount}</p>}
                  <TrustBadge level={p.verification === "verified" ? "verified" : "review"} label={p.verification} size="sm" />
                </div>
              </div>
            </SitaCard>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <SitaCard hover={false} glow className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-primary" />
                  <SitaCardTitle>Proof Detail</SitaCardTitle>
                </div>
                <p className="text-sm font-medium text-foreground">{selected.action}</p>
                {selected.amount && <p className="mt-1 font-display text-2xl font-bold gradient-sita-text">{selected.amount}</p>}
                <div className="mt-4 space-y-2.5">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Linked Item</span><span className="text-foreground text-right text-xs max-w-[180px]">{selected.linkedItem}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Category</span><span className="text-foreground">{categoryLabels[selected.category]}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Result</span><TrustBadge level={selected.result === "success" ? "verified" : selected.result === "pending" ? "review" : "degraded"} label={selected.result} size="sm" /></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Verification</span><TrustBadge level={selected.verification === "verified" ? "verified" : "review"} label={selected.verification} size="sm" /></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Time</span><span className="text-foreground">{selected.timestamp}</span></div>
                </div>
              </SitaCard>

              <SitaCard hover={false}>
                <SitaCardTitle>Policy Snapshot</SitaCardTitle>
                <div className="mt-2 rounded-xl bg-secondary/30 p-3">
                  <p className="text-sm text-foreground">{selected.policy}</p>
                </div>
              </SitaCard>

              {selected.approvalRecord && (
                <SitaCard hover={false}>
                  <SitaCardTitle>Approval Record</SitaCardTitle>
                  <div className="mt-2 rounded-xl bg-trust-verified/5 border border-trust-verified/10 p-3">
                    <p className="text-sm text-foreground">{selected.approvalRecord}</p>
                  </div>
                </SitaCard>
              )}

              <SitaCard hover={false}>
                <SitaCardTitle>State After Action</SitaCardTitle>
                <div className="mt-2 rounded-xl bg-secondary/30 p-3">
                  <p className="text-sm text-foreground">{selected.stateAfter}</p>
                </div>
              </SitaCard>

              {selected.relatedDocs && selected.relatedDocs.length > 0 && (
                <SitaCard hover={false}>
                  <SitaCardTitle>Related Documents</SitaCardTitle>
                  <div className="mt-2 space-y-1.5">
                    {selected.relatedDocs.map((doc, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary/30 p-2.5">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-foreground">{doc}</span>
                      </div>
                    ))}
                  </div>
                </SitaCard>
              )}
            </>
          ) : (
            <EmptyState icon={Shield} title="Select a proof item" description="Click on any proof record to see the full audit trail, policy snapshot, and verification details" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MoneyProof;
