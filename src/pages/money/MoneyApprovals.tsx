import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { StateBadge, ExecutionState } from "@/components/sita/StateBadge";
import { useState } from "react";
import { Shield, CheckCircle, XCircle, AlertTriangle, DollarSign, Eye, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

interface MoneyApproval {
  id: number; action: string; amount: string; reason: string; impact: string; risk: "low" | "medium" | "high";
  policy: string; linkedTo: string; state: ExecutionState; ifApproved: string; ifDelayed: string;
}

const approvals: MoneyApproval[] = [
  { id: 1, action: "Transfer $1,000 from savings to personal checking", amount: "$1,000", reason: "Personal checking below $4,000 threshold", impact: "Restores buffer; savings reduced to $27,500", risk: "low", policy: "Transfer alerts on amounts > $500", linkedTo: "Personal Checking", state: "approval-requested", ifApproved: "Immediate transfer via linked accounts", ifDelayed: "Risk of overdraft if unexpected charge hits" },
  { id: 2, action: "Cancel Zoom Pro subscription", amount: "$15.99/mo", reason: "Usage: Low — Google Meet available as free alternative", impact: "Save $192/year", risk: "low", policy: "Subscription cancellations require review", linkedTo: "Subscriptions", state: "proposed", ifApproved: "Cancellation effective before next billing Apr 6", ifDelayed: "Another month billed at $15.99" },
  { id: 3, action: "Pay quarterly tax estimate", amount: "$3,200", reason: "Q1 estimated tax due Apr 15", impact: "Tax reserve drops from $8,400 to $5,200", risk: "medium", policy: "Tax payments > $1,000 require approval", linkedTo: "Tax Reserve", state: "approval-requested", ifApproved: "Payment scheduled for Apr 14", ifDelayed: "Potential IRS penalty for late payment" },
  { id: 4, action: "Increase emergency fund contribution to $700/mo", amount: "+$200/mo", reason: "Emergency fund at 80% of target — accelerate to hit goal by May", impact: "Reduces safe-to-spend by $200/mo", risk: "low", policy: "Contribution changes require review", linkedTo: "Emergency Fund", state: "proposed", ifApproved: "Next contribution adjusted immediately", ifDelayed: "Target date pushed to Jun" },
];

const MoneyApprovals = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = approvals.find(a => a.id === selectedId);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader title="Financial Actions & Approvals" subtitle="Review, approve, or adjust recommended financial moves" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <KPITile label="Pending Approvals" value={approvals.filter(a => a.state === "approval-requested").length} icon={Shield} />
        <KPITile label="Proposed Actions" value={approvals.filter(a => a.state === "proposed").length} icon={Sparkles} />
        <KPITile label="Total Impact" value={`$${approvals.reduce((s, a) => s + parseInt(a.amount.replace(/[^0-9]/g, "")), 0).toLocaleString()}`} icon={DollarSign} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-2">
          {approvals.map((a) => (
            <SitaCard key={a.id} onClick={() => setSelectedId(a.id)} selected={selectedId === a.id} lane="action" className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StateBadge state={a.state} size="sm" />
                    <span className={`text-[10px] font-medium px-1.5 py-px rounded ${a.risk === "high" ? "bg-urgency-critical/10 text-urgency-critical" : a.risk === "medium" ? "bg-urgency-high/10 text-urgency-high" : "bg-trust-verified/10 text-trust-verified"}`}>
                      {a.risk} risk
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{a.action}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.reason}</p>
                </div>
                <p className="font-display text-sm font-bold text-foreground shrink-0">{a.amount}</p>
              </div>
            </SitaCard>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <SitaCard hover={false} glow className="p-5">
                <SitaCardTitle sub={selected.linkedTo}>Financial Action</SitaCardTitle>
                <p className="mt-2 text-sm font-medium text-foreground">{selected.action}</p>
                <p className="mt-1 font-display text-2xl font-bold gradient-sita-text">{selected.amount}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">State</span><StateBadge state={selected.state} size="sm" /></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Risk</span><TrustBadge level={selected.risk === "high" ? "blocked" : selected.risk === "medium" ? "review" : "safe"} label={selected.risk} size="sm" /></div>
                </div>
              </SitaCard>
              <SitaCard hover={false}>
                <SitaCardTitle>Why This Action</SitaCardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{selected.reason}</p>
              </SitaCard>
              <SitaCard hover={false}>
                <SitaCardTitle>Impact & Outcomes</SitaCardTitle>
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl bg-secondary/30 p-3"><p className="text-xs text-muted-foreground mb-1">Impact</p><p className="text-sm text-foreground">{selected.impact}</p></div>
                  <div className="rounded-xl bg-trust-verified/5 border border-trust-verified/10 p-3"><p className="text-xs text-muted-foreground mb-1">If Approved</p><p className="text-sm text-foreground">{selected.ifApproved}</p></div>
                  <div className="rounded-xl bg-urgency-high/5 border border-urgency-high/10 p-3"><p className="text-xs text-muted-foreground mb-1">If Delayed</p><p className="text-sm text-foreground">{selected.ifDelayed}</p></div>
                </div>
              </SitaCard>
              <SitaCard hover={false}>
                <SitaCardTitle>Policy Applied</SitaCardTitle>
                <div className="mt-2 rounded-xl bg-secondary/30 p-3">
                  <p className="text-sm text-foreground">{selected.policy}</p>
                </div>
              </SitaCard>
              <div className="flex gap-2">
                <SitaButton variant="primary" size="sm" className="flex-1"><CheckCircle className="h-3.5 w-3.5" /> Approve</SitaButton>
                <SitaButton variant="secondary" size="sm"><Eye className="h-3.5 w-3.5" /> Simulate</SitaButton>
                <SitaButton variant="danger" size="sm"><XCircle className="h-3.5 w-3.5" /> Reject</SitaButton>
              </div>
            </>
          ) : (
            <EmptyState icon={Shield} title="Select an action" description="Click on a financial action to see full details, impact analysis, and approval options" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MoneyApprovals;
