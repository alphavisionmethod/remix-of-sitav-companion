import { cn } from "@/lib/utils";
import { ShieldCheck, Play, X, AlertTriangle, Eye } from "lucide-react";
import { useState } from "react";

interface ApprovalGateProps {
  title: string;
  description?: string;
  riskLevel?: "low" | "medium" | "high";
  policyContext?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onSimulate?: () => void;
  status?: "pending" | "approved" | "rejected" | "simulating";
  className?: string;
}

const riskColors = {
  low: "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5",
  medium: "border-[hsl(var(--sita-gold))]/20 bg-[hsl(var(--sita-gold))]/5",
  high: "border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/5",
};

const riskBadge = {
  low: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]",
  medium: "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]",
  high: "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]",
};

export const ApprovalGate = ({
  title, description, riskLevel = "medium", policyContext,
  onApprove, onReject, onSimulate, status = "pending", className
}: ApprovalGateProps) => {
  const [confirming, setConfirming] = useState(false);

  const handleApprove = () => {
    if (riskLevel === "high" && !confirming) {
      setConfirming(true);
      return;
    }
    onApprove?.();
    setConfirming(false);
  };

  return (
    <div className={cn(
      "rounded-xl border p-4 transition-all duration-200",
      riskColors[riskLevel],
      status === "approved" && "border-[hsl(var(--trust-safe))]/30 bg-[hsl(var(--trust-safe))]/5",
      status === "rejected" && "border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 opacity-60",
      className
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
            <h4 className="text-sm font-semibold text-foreground truncate">{title}</h4>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", riskBadge[riskLevel])}>
              {riskLevel} risk
            </span>
          </div>
          {description && <p className="text-xs text-muted-foreground ml-6">{description}</p>}
          {policyContext && (
            <p className="text-[10px] text-muted-foreground/70 ml-6 mt-1 italic">Policy: {policyContext}</p>
          )}
        </div>
      </div>

      {status === "pending" && (
        <div className="flex items-center gap-2 mt-3 ml-6">
          {onSimulate && (
            <button onClick={onSimulate} className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-secondary/80">
              <Eye className="h-3 w-3" /> Simulate
            </button>
          )}
          <button onClick={handleApprove} className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors",
            confirming
              ? "bg-[hsl(var(--destructive))] text-white animate-pulse"
              : "bg-[hsl(var(--trust-safe))]/15 text-[hsl(var(--trust-safe))] hover:bg-[hsl(var(--trust-safe))]/25"
          )}>
            <ShieldCheck className="h-3 w-3" /> {confirming ? "Confirm Approve" : "Approve"}
          </button>
          {onReject && (
            <button onClick={() => { onReject(); setConfirming(false); }} className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--destructive))]/10 px-3 py-1.5 text-[11px] font-medium text-[hsl(var(--destructive))] transition-colors hover:bg-[hsl(var(--destructive))]/20">
              <X className="h-3 w-3" /> Reject
            </button>
          )}
        </div>
      )}

      {status === "approved" && (
        <div className="flex items-center gap-2 mt-3 ml-6 text-[11px] font-medium text-[hsl(var(--trust-safe))]">
          <ShieldCheck className="h-3.5 w-3.5" /> Approved
        </div>
      )}

      {status === "rejected" && (
        <div className="flex items-center gap-2 mt-3 ml-6 text-[11px] font-medium text-[hsl(var(--destructive))]">
          <X className="h-3.5 w-3.5" /> Rejected
        </div>
      )}
    </div>
  );
};
