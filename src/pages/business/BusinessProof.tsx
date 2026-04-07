import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState, ProofCard } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { StateBadge, ExecutionState } from "@/components/sita/StateBadge";
import { useState } from "react";
import { Receipt, Shield, CheckCircle, FileText, Clock, Eye, Search } from "lucide-react";
import { motion } from "framer-motion";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

interface ProofItem {
  id: number; action: string; customer: string; workflow: string; policy: string;
  state: ExecutionState; trust: "verified" | "review" | "degraded"; time: string;
  artifact: string; approvalNeeded: boolean; verificationResult: string;
}

const proofItems: ProofItem[] = [
  { id: 1, action: "Follow-up email sent to Sarah Chen", customer: "Sarah Chen", workflow: "Lead Follow-up", policy: "Auto follow-up within 24h of intake", state: "verified", trust: "verified", time: "1h ago", artifact: "Email delivery confirmed — opened 1x", approvalNeeded: false, verificationResult: "Delivered and opened" },
  { id: 2, action: "Quote #1042 generated and approved", customer: "Sarah Chen", workflow: "Quote Generation", policy: "Quotes > $1,000 require manual review", state: "verified", trust: "verified", time: "3h ago", artifact: "PDF generated — $2,500 — approved by owner", approvalNeeded: true, verificationResult: "Owner approved, PDF attached" },
  { id: 3, action: "Invoice #1038 payment received", customer: "Marcus Johnson", workflow: "Payment Processing", policy: "Record all payments with proof", state: "verified", trust: "verified", time: "2h ago", artifact: "Stripe confirmation — $4,200 received", approvalNeeded: false, verificationResult: "Payment matched to invoice" },
  { id: 4, action: "Payment reminder sent — Invoice #1035", customer: "David Kim", workflow: "Collections", policy: "Auto-reminder at 3, 7, 14 days overdue", state: "completed", trust: "verified", time: "3d ago", artifact: "Email delivered — 2nd reminder", approvalNeeded: false, verificationResult: "Delivered, no response" },
  { id: 5, action: "Callback completed — James Rodriguez", customer: "James Rodriguez", workflow: "Lead Follow-up", policy: "Follow up within 24h of inquiry", state: "verified", trust: "verified", time: "Yesterday", artifact: "Call log — 18 min — discussed Q2 projects", approvalNeeded: false, verificationResult: "Call recorded, notes attached" },
  { id: 6, action: "Appointment confirmation sent — Michael Park", customer: "Michael Park", workflow: "Booking Confirmation", policy: "Confirm 24h before appointment", state: "completed", trust: "verified", time: "5h ago", artifact: "SMS delivered — confirmed for tomorrow 2pm", approvalNeeded: false, verificationResult: "Delivered, awaiting reply" },
  { id: 7, action: "Re-engagement email drafted — Emily Watson", customer: "Emily Watson", workflow: "Lead Re-engagement", policy: "Suggest re-engagement after 30 days", state: "drafted", trust: "review", time: "Today", artifact: "Draft ready — pending approval", approvalNeeded: true, verificationResult: "Awaiting review" },
  { id: 8, action: "Collections escalation triggered — Green Valley", customer: "Green Valley LLC", workflow: "Collections Escalation", policy: "Escalate at 30+ days overdue", state: "escalated", trust: "degraded", time: "1d ago", artifact: "Escalation email — $2,400 outstanding", approvalNeeded: true, verificationResult: "Sent, no response" },
];

const BusinessProof = () => {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = proofItems.find(p => p.id === selectedId);

  const filtered = tab === "all" ? proofItems
    : tab === "verified" ? proofItems.filter(p => p.trust === "verified")
    : tab === "pending" ? proofItems.filter(p => ["drafted", "completed"].includes(p.state))
    : proofItems.filter(p => p.approvalNeeded);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader title="Business Proof & Receipts" subtitle="Every action has a verifiable trail" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Proofs" value={proofItems.length} icon={Receipt} />
        <KPITile label="Verified" value={proofItems.filter(p => p.trust === "verified").length} icon={CheckCircle} />
        <KPITile label="Pending Review" value={proofItems.filter(p => p.trust === "review").length} icon={Eye} />
        <KPITile label="This Week" value={proofItems.filter(p => p.time.includes("h ago") || p.time === "Today" || p.time === "Yesterday").length} icon={Clock} />
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All", count: proofItems.length },
          { key: "verified", label: "Verified", count: proofItems.filter(p => p.trust === "verified").length },
          { key: "pending", label: "Pending", count: proofItems.filter(p => ["drafted", "completed"].includes(p.state)).length },
          { key: "approvals", label: "With Approvals", count: proofItems.filter(p => p.approvalNeeded).length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input className="w-full rounded-xl border border-border bg-secondary/40 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Search proof records..." />
          </div>
          {filtered.map((p) => (
            <SitaCard key={p.id} onClick={() => setSelectedId(p.id)} selected={selectedId === p.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="rounded-lg bg-primary/8 p-2 mt-0.5"><Receipt className="h-4 w-4 text-primary" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{p.action}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.customer} · {p.workflow}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{p.artifact}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <StateBadge state={p.state} size="sm" />
                  <TrustBadge level={p.trust} size="sm" />
                  <span className="text-[10px] text-muted-foreground">{p.time}</span>
                </div>
              </div>
            </SitaCard>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <SitaCard hover={false} glow className="p-5">
                <SitaCardTitle sub={`${selected.customer} · ${selected.workflow}`}>Proof Record</SitaCardTitle>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Action</span><span className="text-foreground text-right max-w-[60%]">{selected.action}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">State</span><StateBadge state={selected.state} size="sm" /></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Trust</span><TrustBadge level={selected.trust} size="sm" /></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Time</span><span className="text-foreground">{selected.time}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Approval</span><span className="text-foreground">{selected.approvalNeeded ? "Required" : "Not required"}</span></div>
                </div>
              </SitaCard>
              <SitaCard hover={false}>
                <SitaCardTitle>Artifact</SitaCardTitle>
                <div className="mt-3 rounded-xl bg-secondary/30 p-4">
                  <p className="text-sm text-foreground">{selected.artifact}</p>
                </div>
              </SitaCard>
              <SitaCard hover={false}>
                <SitaCardTitle>Policy Applied</SitaCardTitle>
                <div className="mt-3 rounded-xl bg-secondary/30 p-4">
                  <p className="text-sm text-foreground">{selected.policy}</p>
                </div>
              </SitaCard>
              <SitaCard hover={false}>
                <SitaCardTitle>Verification Result</SitaCardTitle>
                <div className="mt-3 rounded-xl bg-secondary/30 p-4 flex items-start gap-2">
                  <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{selected.verificationResult}</p>
                </div>
              </SitaCard>
            </>
          ) : (
            <EmptyState icon={Receipt} title="Select a proof record" description="Click on any action to see the full proof trail, policy applied, and verification result" />
          )}
        </div>
      </div>
      <LiveAdvisorCard
        advisor="business"
        intent="audit_readiness"
        demoName="Audit Intelligence"
        demoRole="Compliance Advisor"
        demoConfidence="High"
        demoRecommendation="8 proof records verified this week. 1 escalation still pending approval — resolve Green Valley LLC collections proof to maintain 100% audit coverage."
        demoReasoning="Based on proof coverage analysis, policy compliance checks, and verification status across all workflows."
      />
    </motion.div>
  );
};

export default BusinessProof;
