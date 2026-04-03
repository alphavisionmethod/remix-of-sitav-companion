import { useState } from "react";
import { motion } from "framer-motion";
import { X, Play, Check, XCircle, Undo2, Sparkles, AlertTriangle, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompanion } from "@/hooks/use-companion";
import { cn } from "@/lib/utils";
import type { FeatureProposal } from "@/lib/core-services/feature-proposal-engine";

const RISK_STYLES: Record<string, { color: string; icon: typeof Shield }> = {
  low: { color: "text-trust-safe", icon: Shield },
  medium: { color: "text-sita-gold", icon: AlertTriangle },
  high: { color: "text-trust-high-impact", icon: AlertTriangle },
  critical: { color: "text-destructive", icon: XCircle },
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  simulated: "Simulated",
  previewed: "Previewed",
  approved: "Approved",
  rejected: "Rejected",
  executed: "Executed",
  "rolled-back": "Rolled Back",
};

export const FeatureProposalPanel = ({ onClose }: { onClose: () => void }) => {
  const { proposals, simulateProposal, approveProposal, rejectProposal, executeProposal } = useCompanion();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (id: string, action: () => Promise<void>) => {
    setLoading(id);
    await action();
    setLoading(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed inset-x-0 bottom-12 z-50 mx-auto max-w-lg px-4"
    >
      <div className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sita-purple" />
            <h3 className="text-sm font-semibold text-foreground">Feature Proposals</h3>
            <span className="px-1.5 py-0.5 rounded-full bg-sita-purple/20 text-sita-purple text-[10px] font-bold">
              {proposals.length}
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Proposals list */}
        <div className="max-h-80 overflow-y-auto scrollbar-thin">
          {proposals.length === 0 ? (
            <div className="p-6 text-center">
              <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No proposals yet. SITA will suggest features based on your usage.</p>
            </div>
          ) : (
            proposals.map((p) => (
              <ProposalCard
                key={p.id}
                proposal={p}
                isLoading={loading === p.id}
                onSimulate={() => handleAction(p.id, () => simulateProposal(p.id))}
                onApprove={() => handleAction(p.id, () => approveProposal(p.id))}
                onReject={() => rejectProposal(p.id)}
                onExecute={() => handleAction(p.id, () => executeProposal(p.id))}
              />
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

function ProposalCard({
  proposal,
  isLoading,
  onSimulate,
  onApprove,
  onReject,
  onExecute,
}: {
  proposal: FeatureProposal;
  isLoading: boolean;
  onSimulate: () => void;
  onApprove: () => void;
  onReject: () => void;
  onExecute: () => void;
}) {
  const riskStyle = RISK_STYLES[proposal.risk] || RISK_STYLES.low;
  const RiskIcon = riskStyle.icon;

  return (
    <div className="p-3 border-b border-border/20 last:border-b-0 hover:bg-secondary/20 transition-colors">
      <div className="flex items-start gap-2">
        <RiskIcon className={cn("w-4 h-4 mt-0.5 shrink-0", riskStyle.color)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-xs font-semibold text-foreground truncate">{proposal.title}</h4>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-secondary text-muted-foreground shrink-0">
              {STATUS_LABELS[proposal.status]}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-1">{proposal.description}</p>
          <p className="text-[10px] text-muted-foreground/70 italic">{proposal.reasoning}</p>

          {/* Simulation results */}
          {proposal.simulation && (
            <div className="mt-2 p-2 rounded bg-secondary/30 text-[10px] space-y-0.5">
              <div className={cn("font-medium", proposal.simulation.passed ? "text-trust-safe" : "text-destructive")}>
                Simulation: {proposal.simulation.passed ? "Passed ✓" : "Failed ✗"}
              </div>
              <div className="text-muted-foreground">{proposal.simulation.estimatedImpact}</div>
              {proposal.simulation.warnings.map((w, i) => (
                <div key={i} className="text-sita-gold">⚠ {w}</div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1.5 mt-2">
            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-sita-purple" />}

            {proposal.status === "draft" && (
              <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 gap-1" onClick={onSimulate} disabled={isLoading}>
                <Play className="w-3 h-3" /> Simulate
              </Button>
            )}
            {["simulated", "previewed"].includes(proposal.status) && (
              <>
                <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 gap-1 text-trust-safe" onClick={onApprove} disabled={isLoading || !proposal.simulation?.passed}>
                  <Check className="w-3 h-3" /> Approve
                </Button>
                <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 gap-1 text-destructive" onClick={onReject} disabled={isLoading}>
                  <XCircle className="w-3 h-3" /> Reject
                </Button>
              </>
            )}
            {proposal.status === "approved" && (
              <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 gap-1 text-sita-purple" onClick={onExecute} disabled={isLoading}>
                <Sparkles className="w-3 h-3" /> Execute
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
