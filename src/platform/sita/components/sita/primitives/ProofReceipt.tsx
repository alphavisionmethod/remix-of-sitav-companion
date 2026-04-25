import { cn } from "@/lib/utils";
import { Receipt, ShieldCheck, Clock, AlertTriangle, ChevronDown, ChevronRight, Hash, RotateCcw } from "lucide-react";
import { useState } from "react";

interface ProofStep {
  label: string;
  detail?: string;
  status: "completed" | "pending" | "failed";
  timestamp?: string;
}

interface ProofReceiptProps {
  title: string;
  hash?: string;
  verification: "verified" | "pending" | "failed" | "rolled-back";
  timestamp: string;
  actor?: string;
  steps?: ProofStep[];
  className?: string;
}

const verificationConfig = {
  verified: { icon: ShieldCheck, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10", label: "Verified" },
  pending: { icon: Clock, color: "text-[hsl(var(--sita-gold))]", bg: "bg-[hsl(var(--sita-gold))]/10", label: "Pending" },
  failed: { icon: AlertTriangle, color: "text-[hsl(var(--destructive))]", bg: "bg-[hsl(var(--destructive))]/10", label: "Failed" },
  "rolled-back": { icon: RotateCcw, color: "text-muted-foreground", bg: "bg-secondary", label: "Rolled Back" },
};

export const ProofReceipt = ({ title, hash, verification, timestamp, actor, steps, className }: ProofReceiptProps) => {
  const [expanded, setExpanded] = useState(false);
  const config = verificationConfig[verification];
  const Icon = config.icon;

  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden transition-all duration-200 hover:border-border/80", className)}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("rounded-lg p-2 shrink-0", config.bg)}>
            <Receipt className={cn("h-4 w-4", config.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-foreground truncate">{title}</h4>
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", config.bg, config.color)}>
                <Icon className="h-3 w-3" /> {config.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[11px] text-muted-foreground">{timestamp}</span>
              {actor && <span className="text-[11px] text-muted-foreground">by {actor}</span>}
            </div>
            {hash && (
              <div className="flex items-center gap-1.5 mt-2">
                <Hash className="h-3 w-3 text-muted-foreground/50" />
                <code className="text-[10px] font-mono text-muted-foreground/60 truncate">{hash}</code>
              </div>
            )}
          </div>
        </div>
      </div>

      {steps && steps.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center gap-2 border-t border-border px-4 py-2 text-[11px] font-medium text-muted-foreground hover:bg-secondary/30 transition-colors"
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Execution Chain ({steps.length} steps)
          </button>
          {expanded && (
            <div className="border-t border-border px-4 py-3 space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 ml-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "h-2 w-2 rounded-full mt-1.5",
                      step.status === "completed" ? "bg-[hsl(var(--trust-safe))]" : step.status === "failed" ? "bg-[hsl(var(--destructive))]" : "bg-muted-foreground/30"
                    )} />
                    {i < steps.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-[11px] font-medium text-foreground">{step.label}</p>
                    {step.detail && <p className="text-[10px] text-muted-foreground">{step.detail}</p>}
                    {step.timestamp && <p className="text-[10px] text-muted-foreground/50 mt-0.5">{step.timestamp}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
