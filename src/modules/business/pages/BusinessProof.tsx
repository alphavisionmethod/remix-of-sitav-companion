// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Proof & Receipts (Migrated)
// Every action has a verifiable trail
// ═══════════════════════════════════════════════════════════════

import { SplitWorkspace } from "@/platform/sita/components/sita/surfaces/SplitWorkspace";
import { HeroCard, QueueCard, ProofCard, StatusCard } from "@/platform/sita/components/sita/cards";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { StateBadge, type ExecutionState } from "@/platform/sita/components/sita/StateBadge";
import { useState } from "react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";
import { Receipt, Shield, CheckCircle, Clock, Eye, Search } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";

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
  const { primaryMode } = useBusinessProfile();
  const moduleConfig = getModuleAdaptation("proof", primaryMode);
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = proofItems.find(p => p.id === selectedId);

  const filtered = tab === "all" ? proofItems
    : tab === "verified" ? proofItems.filter(p => p.trust === "verified")
    : tab === "pending" ? proofItems.filter(p => ["drafted", "completed"].includes(p.state))
    : proofItems.filter(p => p.approvalNeeded);

  const tabs = [
    { key: "all", label: `All (${proofItems.length})` },
    { key: "verified", label: `Verified (${proofItems.filter(p => p.trust === "verified").length})` },
    { key: "pending", label: `Pending (${proofItems.filter(p => ["drafted", "completed"].includes(p.state)).length})` },
    { key: "approvals", label: `Approvals (${proofItems.filter(p => p.approvalNeeded).length})` },
  ];

  const listPane = (
    <div className="p-3 space-y-3">
      <PageTruthBanner />
      
      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total", value: proofItems.length, icon: <Receipt className="h-3 w-3" /> },
          { label: "Verified", value: proofItems.filter(p => p.trust === "verified").length, icon: <CheckCircle className="h-3 w-3" /> },
          { label: "Pending", value: proofItems.filter(p => p.trust === "review").length, icon: <Eye className="h-3 w-3" /> },
          { label: "This Week", value: proofItems.filter(p => p.time.includes("h ago") || p.time === "Today" || p.time === "Yesterday").length, icon: <Clock className="h-3 w-3" /> },
        ].map(kpi => (
          <StatusCard key={kpi.label} label={kpi.label} status="healthy" icon={kpi.icon} confidence={100} />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap micro-press",
              tab === t.key ? "bg-[hsl(0_0%_100%/0.08)] text-foreground" : "text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_70%)]"
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(0_0%_40%)]" />
        <input className="w-full rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_6%)] py-2 pl-9 pr-3 text-[12px] text-foreground placeholder:text-[hsl(0_0%_40%)] focus:border-[hsl(265_55%_58%/0.4)] focus:outline-none transition-colors" placeholder="Search proof records..." />
      </div>

      {/* Proof list */}
      {filtered.length === 0 ? (
        <PremiumEmptyState variant="no-results" icon={Receipt} title="No matching proofs" description="Try adjusting your filter" domain="business" />
      ) : (
        <QueueCard
          title="Proof Records"
          items={filtered.map(p => ({
            id: String(p.id),
            label: p.action,
            meta: `${p.customer} · ${p.workflow} · ${p.time}`,
            urgency: p.trust === "degraded" ? "critical" as const : p.trust === "review" ? "high" as const : "normal" as const,
          }))}
          maxVisible={20}
          onItemClick={(id) => setSelectedId(Number(id))}
        />
      )}
    </div>
  );

  const detailPane = selected ? (
    <div className="p-4 space-y-4">
      <ProofCard
        title={`${selected.customer} — ${selected.workflow}`}
        status={selected.trust === "verified" ? "verified" : selected.trust === "review" ? "pending" : "failed"}
        chain={[
          { label: "Action Triggered", timestamp: selected.time, verified: true },
          { label: selected.action, verified: selected.trust === "verified" },
          { label: `Policy: ${selected.policy}`, verified: true },
          { label: selected.artifact, verified: selected.trust === "verified" },
          { label: `Verification: ${selected.verificationResult}`, verified: selected.trust === "verified" },
        ]}
      />
      
      <div className="flex items-center gap-2">
        <StateBadge state={selected.state} size="sm" />
        <TrustBadge level={selected.trust} size="sm" />
        {selected.approvalNeeded && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[hsl(38_85%_58%/0.12)] text-[hsl(38_85%_58%)]">Approval Required</span>
        )}
      </div>
    </div>
  ) : (
    <PremiumEmptyState variant="no-data" icon={Receipt} title="Select a proof record" description="Click on any action to see the full proof trail, policy applied, and verification result" domain="business" />
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full space-y-4">
      <SplitWorkspace
        list={listPane}
        detail={detailPane}
        hasSelection={!!selected}
        defaultSplit={45}
        className="h-[calc(100vh-200px)] rounded-xl border border-[hsl(0_0%_100%/0.06)] overflow-hidden"
      />
      <ModuleAdvisorInsight
        advisorName="Compliance Advisor"
        domain="business"
        insight={`${proofItems.filter(p => p.trust === "verified").length} proof records verified this week. ${proofItems.filter(p => p.trust !== "verified").length > 0 ? `${proofItems.filter(p => p.trust !== "verified").length} item(s) still pending — resolve to maintain 100% audit coverage.` : "100% audit coverage achieved."}`}
        confidence={92}
      />
    </motion.div>
  );
};

export default BusinessProof;
