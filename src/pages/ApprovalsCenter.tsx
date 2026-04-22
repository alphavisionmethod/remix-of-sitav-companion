import { useAuth } from "@/contexts/AuthContext";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaButton, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { StateBadge } from "@/components/sita/StateBadge";
import { useApprovals } from "@/hooks/use-sita-data";
import { useApprovalQueue } from "@/hooks/use-brain-core";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useGlobalSearch } from "@/platform/search";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { EmptyState } from "@/components/sita/EmptyState";
import {
  Shield, CheckCircle, XCircle, Clock, AlertTriangle, Brain, Eye, Zap,
  ThumbsUp, ThumbsDown, MessageSquare, ChevronDown, ChevronUp
} from "lucide-react";
const ApprovalsCenter = () => {
  const { isDemo } = useAuth();
  const isDemoMode = isDemo;
  const { data: approvals = [], isLoading } = useApprovals();
  const { approve, reject } = useApprovalQueue();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { results: relatedResults, search: runRelatedSearch, clearResults: clearRelated } = useGlobalSearch();
  // Keep cross-domain related items in sync with the typed query.
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery.trim().length >= 2) runRelatedSearch(searchQuery);
      else clearRelated();
    }, 250);
    return () => clearTimeout(t);
  }, [searchQuery, runRelatedSearch, clearRelated]);

  const pending = approvals.filter((a: Record<string, any>) => a.status === "pending");
  const decided = approvals.filter((a: Record<string, any>) => a.status !== "pending");

  const handleApprove = (id: string) => {
    if (isDemoMode) return;
    approve(id, "Approved via Approvals Center");
  };

  const handleReject = (id: string) => {
    if (isDemoMode) return;
    reject(id, rejectionReason || "Rejected via Approvals Center");
    setRejectionReason("");
    setExpandedId(null);
  };

  const handleGenerateSample = async () => {
    try {
      const { generateSampleRecommendation } = await import("@/lib/services/rex/recommendation-engine");
      await generateSampleRecommendation();
    } catch (e) {
      console.error("[ApprovalsCenter] sample generation failed:", e);
    }
  };

  return (
    <motion.div className="mx-auto max-w-5xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
<SitaPageHeader
        title="Approvals Center"
        subtitle="Review and approve SITA-recommended actions before execution"
        actions={
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${isDemoMode ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"}`}>
            <div className={`h-2 w-2 rounded-full ${isDemoMode ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
            {isDemoMode ? "Demo" : "Live"}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Pending" value={pending.length} icon={Clock} className="gradient-sita-subtle" />
        <KPITile label="Approved (30d)" value={decided.filter((a: Record<string, any>) => a.status === "approved").length} icon={CheckCircle} />
        <KPITile label="Rejected (30d)" value={decided.filter((a: Record<string, any>) => a.status === "rejected").length} icon={XCircle} />
        <KPITile label="Total Decided" value={decided.length} sub="All time" icon={Zap} />
      </div>

      {/* Trust Ladder */}
      <SitaCard hover={false} className="p-5">
        <SitaCardTitle>Trust Execution Ladder</SitaCardTitle>
        <p className="text-xs text-muted-foreground mt-1 mb-4">Actions progress through trust levels before execution</p>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {["Observe", "Suggest", "Simulate", "Approval", "Execute", "Verified"].map((step, i) => (
            <div key={step} className="flex items-center gap-1">
              <div className={`rounded-lg px-3 py-2 text-[11px] font-semibold whitespace-nowrap ${
                i <= 3 ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary text-muted-foreground border border-border"
              }`}>
                {step}
              </div>
              {i < 5 && <div className="text-muted-foreground text-xs">→</div>}
            </div>
          ))}
        </div>
      </SitaCard>

      {/* Pending Approvals */}
      <SitaSectionHeader title={`Pending Approvals (${pending.length})`} subtitle="These actions need your review before SITA can execute them" />

      {pending.length === 0 ? (
        <EmptyState
          variant="contextual"
          icon={CheckCircle}
          title="All caught up"
          description="No pending approvals right now. SITA-recommended actions awaiting your review will appear here."
        />
      ) : (
        <div className="space-y-3">
          {pending.map((approval: any, i: number) => {
            const isExpanded = expandedId === approval.id;
            const confidence = approval.proposed_action?.confidence || 0.7;
            const riskLevel = approval.risk_level || (confidence < 0.5 ? "high" : confidence < 0.8 ? "medium" : "low");

            return (
              <motion.div key={approval.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <SitaCard hover={false} lane="action" className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <TrustBadge level={riskLevel === "high" ? "degraded" : riskLevel === "medium" ? "review" : "verified"} label={`Risk: ${riskLevel}`} size="sm" />
                        <StateBadge state="approval-requested" size="sm" />
                        {approval.domain && (
                          <span className="text-[10px] text-muted-foreground bg-secondary rounded px-1.5 py-0.5 capitalize">{approval.domain}</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground mt-2">{approval.action_summary}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Confidence: {Math.round(confidence * 100)}% · {new Date(approval.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleApprove(approval.id)} className="flex items-center gap-1.5 rounded-lg bg-trust-verified/10 px-3 py-2 text-xs font-semibold text-trust-verified hover:bg-trust-verified/20 transition-colors">
                        <ThumbsUp className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button onClick={() => setExpandedId(isExpanded ? null : approval.id)} className="flex items-center gap-1.5 rounded-lg bg-urgency-high/10 px-3 py-2 text-xs font-semibold text-urgency-high hover:bg-urgency-high/20 transition-colors">
                        <ThumbsDown className="h-3.5 w-3.5" /> Reject
                      </button>
                      <button onClick={() => setExpandedId(isExpanded ? null : approval.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors">
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 pt-4 border-t border-border space-y-3">
                      {approval.proposed_action?.actions && (
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Proposed Actions</p>
                          {(approval.proposed_action.actions as Array<{ type: string; description?: string }>).map((action: any, j: number) => (
                            <div key={j} className="flex items-center gap-2 text-xs text-foreground py-1">
                              <Zap className="h-3 w-3 text-accent" />
                              {action.description || action.type}
                            </div>
                          ))}
                        </div>
                      )}
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Rejection Reason (optional)</label>
                        <input
                          value={rejectionReason}
                          onChange={e => setRejectionReason(e.target.value)}
                          placeholder="Why are you rejecting this?"
                          className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground focus:border-primary/40 focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <SitaButton variant="primary" size="sm" onClick={() => handleApprove(approval.id)}>
                          <CheckCircle className="h-3 w-3" /> Approve & Execute
                        </SitaButton>
                        <SitaButton variant="secondary" size="sm" onClick={() => handleReject(approval.id)}>
                          <XCircle className="h-3 w-3" /> Reject
                        </SitaButton>
                      </div>
                    </motion.div>
                  )}
                </SitaCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Recent Decisions */}
      {decided.length > 0 && (
        <>
          <SitaSectionHeader title="Recent Decisions" />
          <div className="space-y-2">
            {decided.slice(0, 5).map((d: any, i: number) => (
              <SitaCard key={i} hover={false} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {d.status === "approved" ? (
                      <CheckCircle className="h-4 w-4 text-trust-verified" />
                    ) : (
                      <XCircle className="h-4 w-4 text-urgency-high" />
                    )}
                    <p className="text-xs text-foreground">{d.action_summary}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{d.decided_at ? new Date(d.decided_at).toLocaleDateString() : ""}</span>
                </div>
              </SitaCard>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ApprovalsCenter;
