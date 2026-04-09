import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { StateBadge, ExecutionState } from "@/components/sita/StateBadge";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { useState } from "react";
import { Shield, CheckCircle, XCircle, AlertTriangle, DollarSign, Eye, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useMoneyApprovals, useApproveMoneyAction, useRejectMoneyAction } from "@/hooks/use-domain-data";
import { toast } from "sonner";



const MoneyApprovals = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: approvals = [], isLoading } = useMoneyApprovals();
  const approveMut = useApproveMoneyAction();
  const rejectMut = useRejectMoneyAction();

  const selected = approvals.find((a: any) => a.id === selectedId);
  const pendingCount = approvals.filter((a: any) => a.status === "pending").length;

  const handleApprove = () => {
    if (!selectedId) return;
    approveMut.mutate(selectedId, { onSuccess: () => { toast.success("Action approved"); setSelectedId(null); } });
  };
  const handleReject = () => {
    if (!selectedId) return;
    rejectMut.mutate(selectedId, { onSuccess: () => { toast.success("Action rejected"); setSelectedId(null); } });
  };

  if (isLoading) return <SectionSkeleton cards={4} columns={1} />;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader title="Financial Actions & Approvals" subtitle="Review, approve, or adjust recommended financial moves" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <KPITile label="Pending Approvals" value={pendingCount} icon={Shield} />
        <KPITile label="Total Actions" value={approvals.length} icon={Sparkles} />
        <KPITile label="Total Impact" value={`$${approvals.reduce((s: number, a: any) => s + (Number(a.proposed_action?.amount) || 0), 0).toLocaleString()}`} icon={DollarSign} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-2">
          {approvals.length === 0 ? (
            <EmptyState icon={Shield} title="No pending approvals" description="All financial actions are resolved" />
          ) : approvals.map((a: any) => {
            const pa = a.proposed_action || {};
            const risk = pa.risk || "low";
            return (
              <SitaCard key={a.id} onClick={() => setSelectedId(a.id)} selected={selectedId === a.id} lane="action" className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <StateBadge state={a.status === "pending" ? "approval-requested" : a.status === "approved" ? "completed" : "failed"} size="sm" />
                      <span className={`text-[10px] font-medium px-1.5 py-px rounded ${risk === "high" ? "bg-urgency-critical/10 text-urgency-critical" : risk === "medium" ? "bg-urgency-high/10 text-urgency-high" : "bg-trust-verified/10 text-trust-verified"}`}>
                        {risk} risk
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{a.action_summary}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{pa.reason || ""}</p>
                  </div>
                  <p className="font-display text-sm font-bold text-foreground shrink-0">${Number(pa.amount || 0).toLocaleString()}</p>
                </div>
              </SitaCard>
            );
          })}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <SitaCard hover={false} glow className="p-5">
                <SitaCardTitle sub={selected.proposed_action?.linkedTo}>Financial Action</SitaCardTitle>
                <p className="mt-2 text-sm font-medium text-foreground">{selected.action_summary}</p>
                <p className="mt-1 font-display text-2xl font-bold gradient-sita-text">${Number(selected.proposed_action?.amount || 0).toLocaleString()}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><StateBadge state={selected.status === "pending" ? "approval-requested" : "completed"} size="sm" /></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Risk</span><TrustBadge level={selected.proposed_action?.risk === "high" ? "blocked" : selected.proposed_action?.risk === "medium" ? "review" : "safe"} label={selected.proposed_action?.risk || "low"} size="sm" /></div>
                </div>
              </SitaCard>
              <SitaCard hover={false}>
                <SitaCardTitle>Why This Action</SitaCardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{selected.proposed_action?.reason}</p>
              </SitaCard>
              <SitaCard hover={false}>
                <SitaCardTitle>Impact & Outcomes</SitaCardTitle>
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl bg-secondary/30 p-3"><p className="text-xs text-muted-foreground mb-1">Impact</p><p className="text-sm text-foreground">{selected.proposed_action?.impact}</p></div>
                  <div className="rounded-xl bg-trust-verified/5 border border-trust-verified/10 p-3"><p className="text-xs text-muted-foreground mb-1">If Approved</p><p className="text-sm text-foreground">{selected.proposed_action?.ifApproved}</p></div>
                  <div className="rounded-xl bg-urgency-high/5 border border-urgency-high/10 p-3"><p className="text-xs text-muted-foreground mb-1">If Delayed</p><p className="text-sm text-foreground">{selected.proposed_action?.ifDelayed}</p></div>
                </div>
              </SitaCard>
              {selected.proposed_action?.policy && (
                <SitaCard hover={false}>
                  <SitaCardTitle>Policy Applied</SitaCardTitle>
                  <div className="mt-2 rounded-xl bg-secondary/30 p-3"><p className="text-sm text-foreground">{selected.proposed_action.policy}</p></div>
                </SitaCard>
              )}
              {selected.status === "pending" && (
                <div className="flex gap-2">
                  <SitaButton variant="primary" size="sm" className="flex-1" onClick={handleApprove}><CheckCircle className="h-3.5 w-3.5" /> Approve</SitaButton>
                  <SitaButton variant="secondary" size="sm"><Eye className="h-3.5 w-3.5" /> Simulate</SitaButton>
                  <SitaButton variant="danger" size="sm" onClick={handleReject}><XCircle className="h-3.5 w-3.5" /> Reject</SitaButton>
                </div>
              )}
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
