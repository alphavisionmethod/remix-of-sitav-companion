import { useState } from "react";
import { Shield, CheckCircle, XCircle, AlertTriangle, DollarSign, Eye, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useMoneyApprovals, useApproveMoneyAction, useRejectMoneyAction } from "@/hooks/use-domain-data";
import { toast } from "sonner";

// New design system
import { HeroCard, QueueCard, ActionCard, StatusCard } from "@/platform/sita/components/sita/cards";
import { ExecutionBadge, UrgencyBadge } from "@/platform/sita/components/sita/badges";
import { SplitWorkspace } from "@/platform/sita/components/sita/surfaces/SplitWorkspace";
import { AppSurface } from "@/platform/sita/components/sita/surfaces/AppSurface";
import { ListReveal, ListRevealItem } from "@/platform/sita/components/sita/motion/AppTransitions";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { TrustBoundary } from "@/platform/trust/ui/TrustBoundary";

const MoneyApprovals = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: approvals = [], isLoading } = useMoneyApprovals();
  const approveMut = useApproveMoneyAction();
  const rejectMut = useRejectMoneyAction();

  const selected = approvals.find((a: Record<string, any>) => a.id === selectedId);
  const pendingCount = approvals.filter((a: Record<string, any>) => a.status === "pending").length;

  const handleApprove = () => {
    if (!selectedId) return;
    approveMut.mutate(selectedId, { onSuccess: () => { toast.success("Action approved"); setSelectedId(null); } });
  };
  const handleReject = () => {
    if (!selectedId) return;
    rejectMut.mutate(selectedId, { onSuccess: () => { toast.success("Action rejected"); setSelectedId(null); } });
  };

  const queueItems = approvals.map((a: Record<string, any>) => ({
    id: a.id,
    label: a.action_summary || "Unnamed action",
    meta: `$${Number(a.proposed_action?.amount || 0).toLocaleString()}`,
    urgency: (a.proposed_action?.risk === "high" ? "critical" : a.proposed_action?.risk === "medium" ? "high" : "normal") as "critical" | "high" | "normal",
    badge: <ExecutionBadge state={a.status === "pending" ? "drafted" : a.status === "approved" ? "complete" : "failed"} />,
  }));

  const listPane = (
    <div className="p-3 space-y-3">
<div className="flex items-center justify-between px-1">
        <h3 className="text-[13px] font-semibold text-[hsl(0_0%_85%)]">Financial Approvals</h3>
        <span className="text-[11px] text-[hsl(0_0%_50%)]">{pendingCount} pending</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatusCard label="Pending" status={pendingCount > 3 ? "degraded" : pendingCount > 0 ? "healthy" : "healthy"} lastChecked={`${pendingCount}`} />
        <StatusCard label="Total" status="healthy" lastChecked={`${approvals.length}`} />
        <StatusCard label="Impact" status="healthy" lastChecked={`$${approvals.reduce((s: number, a: Record<string, any>) => s + (Number(a.proposed_action?.amount) || 0), 0).toLocaleString()}`} />
      </div>

      <QueueCard
        title="APPROVAL QUEUE"
        items={queueItems}
        maxVisible={10}
        onItemClick={(id) => setSelectedId(id)}
      />
    </div>
  );

  const detailPane = selected ? (
    <div className="p-4 space-y-4">
      <HeroCard
        title="Financial Action"
        metric={`$${Number(selected.proposed_action?.amount || 0).toLocaleString()}`}
        subtitle={selected.proposed_action?.linkedTo || "Review required"}
        accentFrom="hsl(152 55% 48%)"
        accentTo="hsl(210 60% 50%)"
      >
        <ExecutionBadge state={selected.status === "pending" ? "drafted" : "complete"} />
      </HeroCard>

      <AppSurface level={2} className="p-4">
        <p className="text-[13px] font-medium text-[hsl(0_0%_85%)] mb-2">{selected.action_summary}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-[12px]">
            <span className="text-[hsl(0_0%_50%)]">Risk</span>
            <UrgencyBadge urgency={selected.proposed_action?.risk === "high" ? "critical" : selected.proposed_action?.risk === "medium" ? "high" : "low"} />
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-[hsl(0_0%_50%)]">Status</span>
            <ExecutionBadge state={selected.status === "pending" ? "drafted" : selected.status === "approved" ? "complete" : "failed"} />
          </div>
        </div>
      </AppSurface>

      {selected.proposed_action?.reason && (
        <AppSurface level={2} className="p-4">
          <p className="text-[10px] font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wider mb-1">Why This Action</p>
          <p className="text-[12px] text-[hsl(0_0%_70%)]">{selected.proposed_action.reason}</p>
        </AppSurface>
      )}

      <div className="space-y-2">
        {selected.proposed_action?.impact && (
          <AppSurface level={1} className="p-3">
            <p className="text-[10px] text-[hsl(0_0%_45%)] mb-1">Impact</p>
            <p className="text-[12px] text-[hsl(0_0%_80%)]">{selected.proposed_action.impact}</p>
          </AppSurface>
        )}
        {selected.proposed_action?.ifApproved && (
          <AppSurface level={1} className="p-3 border-l-2 border-l-[hsl(152_55%_48%)]">
            <p className="text-[10px] text-[hsl(0_0%_45%)] mb-1">If Approved</p>
            <p className="text-[12px] text-[hsl(0_0%_80%)]">{selected.proposed_action.ifApproved}</p>
          </AppSurface>
        )}
        {selected.proposed_action?.ifDelayed && (
          <AppSurface level={1} className="p-3 border-l-2 border-l-[hsl(38_85%_58%)]">
            <p className="text-[10px] text-[hsl(0_0%_45%)] mb-1">If Delayed</p>
            <p className="text-[12px] text-[hsl(0_0%_80%)]">{selected.proposed_action.ifDelayed}</p>
          </AppSurface>
        )}
      </div>

      {selected.status === "pending" && (
        <div className="flex gap-2">
          <TrustBoundary
            pillar="finance"
            actionKey="finance.approval.approve"
            riskTier={selected.proposed_action?.risk === "high" ? "critical" : "high"}
            reversible={false}
            impactSummary={selected.action_summary}
            payload={{
              approvalId: selected.id,
              amount: selected.proposed_action?.amount,
              linkedTo: selected.proposed_action?.linkedTo,
            }}
            onConfirm={async () => handleApprove()}
          >
            {({ run, busy }) => (
              <ActionCard
                title={busy ? "Recording…" : "Approve"}
                description="Confirm this financial action"
                accentColor="hsl(152 55% 48%)"
                onApprove={run}
                className="flex-1"
              />
            )}
          </TrustBoundary>
          <TrustBoundary
            pillar="finance"
            actionKey="finance.approval.reject"
            riskTier="medium"
            reversible={true}
            impactSummary={selected.action_summary}
            payload={{ approvalId: selected.id }}
            onConfirm={async () => handleReject()}
          >
            {({ run, busy }) => (
              <ActionCard
                title={busy ? "Recording…" : "Reject"}
                description="Decline this action"
                accentColor="hsl(0 70% 55%)"
                onApprove={run}
                className="flex-1"
              />
            )}
          </TrustBoundary>
        </div>
      )}
    </div>
  ) : (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <Shield className="h-8 w-8 mx-auto text-[hsl(0_0%_30%)]" />
        <p className="text-[13px] text-[hsl(0_0%_50%)]">Select an action to review</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-[hsl(0_0%_100%/0.04)] animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] -m-4">
      <SplitWorkspace
        list={listPane}
        detail={detailPane}
        hasSelection={!!selected}
        defaultSplit={40}
      />
    </div>
  );
};

export default MoneyApprovals;
