import { cn } from "@/lib/utils";
import type { ConfidenceLevel } from "@/domains/business";
import { CONFIDENCE_META } from "@/domains/engines/lead-scoring-engine";
import { Shield, ShieldAlert, ShieldQuestion } from "lucide-react";

const confIcon: Record<ConfidenceLevel, typeof Shield> = {
  strong: Shield, moderate: ShieldAlert, low: ShieldQuestion,
};

const confStyle: Record<ConfidenceLevel, string> = {
  strong: "text-[hsl(var(--trust-safe))]",
  moderate: "text-[hsl(var(--sita-gold))]",
  low: "text-[hsl(var(--trust-degraded))]",
};

interface Props {
  level: ConfidenceLevel;
  score: number;
  compact?: boolean;
  className?: string;
}

export const LeadConfidenceDisplay = ({ level, score, compact = false, className }: Props) => {
  const Icon = confIcon[level];
  const meta = CONFIDENCE_META[level];

  if (compact) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium", confStyle[level], className)}>
        <Icon className="h-3 w-3" />
        {meta.label.split(" ")[0]}
      </span>
    );
  }

  return (
    <div className={cn("flex items-start gap-2", className)}>
      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", confStyle[level])} />
      <div>
        <p className={cn("text-xs font-semibold", confStyle[level])}>{meta.label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{meta.description}</p>
        <div className="mt-1.5 h-1.5 w-24 rounded-full bg-muted/30 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", confStyle[level].replace("text-", "bg-"))}
            style={{ width: `${score}%`, backgroundColor: level === "strong" ? "hsl(var(--trust-safe))" : level === "moderate" ? "hsl(var(--sita-gold))" : "hsl(var(--trust-degraded))" }}
          />
        </div>
      </div>
    </div>
  );
};
