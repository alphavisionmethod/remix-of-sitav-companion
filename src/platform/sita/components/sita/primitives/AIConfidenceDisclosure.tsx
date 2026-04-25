// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Confidence Disclosure
// Standardized AI output framing with confidence and source
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { getAICopy, type AIOutputType } from "@/lib/ux-trust/microcopy-system";
import { Brain, AlertTriangle, FlaskConical, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AIConfidenceDisclosureProps {
  confidence: number;
  outputType?: AIOutputType;
  isSimulated?: boolean;
  sourceSummary?: string;
  modelUsed?: string;
  className?: string;
  compact?: boolean;
}

const LEVEL_STYLES = {
  high: { bg: "bg-trust-safe/10", text: "text-trust-safe", border: "border-trust-safe/20" },
  medium: { bg: "bg-sita-gold/10", text: "text-sita-gold", border: "border-sita-gold/20" },
  low: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  unknown: { bg: "bg-muted/50", text: "text-muted-foreground", border: "border-border" },
} as const;

export function AIConfidenceDisclosure({
  confidence,
  outputType = "suggestion",
  isSimulated = false,
  sourceSummary,
  modelUsed,
  className,
  compact = false,
}: AIConfidenceDisclosureProps) {
  const copy = getAICopy({ confidence, outputType, isSimulated, sourceSummary, modelUsed });
  const style = LEVEL_STYLES[copy.confidenceLevel];

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", style.text, className)}>
            <Brain className="h-3 w-3" />
            {copy.type} · {copy.confidencePercent}%
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-64 text-xs">
          <p className="font-medium">{copy.label}</p>
          {copy.sourceNote && <p className="text-muted-foreground mt-1">{copy.sourceNote}</p>}
          {copy.reviewMessage && <p className="text-amber-400 mt-1">{copy.reviewMessage}</p>}
          {copy.simulatedNote && <p className="text-destructive mt-1">{copy.simulatedNote}</p>}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-3 text-xs space-y-1.5",
        style.bg, style.border,
        className
      )}
      role="status"
      aria-label={`AI ${copy.type}: ${copy.confidencePercent}% confidence`}
    >
      <div className="flex items-center justify-between">
        <span className={cn("flex items-center gap-1.5 font-semibold", style.text)}>
          <Brain className="h-3.5 w-3.5" />
          {copy.label}
        </span>
        <span className={cn("text-[10px] font-mono", style.text)}>
          {copy.confidencePercent}%
        </span>
      </div>

      {copy.sourceNote && (
        <p className="text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3 shrink-0" />
          {copy.sourceNote}
        </p>
      )}

      {copy.reviewMessage && (
        <p className="text-amber-400 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          {copy.reviewMessage}
        </p>
      )}

      {copy.simulatedNote && (
        <p className="text-destructive flex items-center gap-1">
          <FlaskConical className="h-3 w-3 shrink-0" />
          {copy.simulatedNote}
        </p>
      )}
    </div>
  );
}
