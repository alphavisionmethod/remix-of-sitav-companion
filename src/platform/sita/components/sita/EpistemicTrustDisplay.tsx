// ═══════════════════════════════════════════════════════════════
// SITA OS — EpistemicTrustDisplay
// Renders trust metadata from AI responses inline
// Evidence grades, caveats, grounding, assumptions, negative receipts
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ShieldCheck, ShieldAlert, AlertTriangle, ChevronDown, ChevronUp,
  XCircle, CheckCircle, FileWarning, Lightbulb, Activity
} from "lucide-react";
import type { TrustEnrichedResponse } from "@/lib/ai/ai-capability-client";

type TrustMetadata = NonNullable<TrustEnrichedResponse["trustMetadata"]>;

interface EpistemicTrustDisplayProps {
  trustMetadata: TrustMetadata;
  compact?: boolean;
  className?: string;
}

// Evidence grade color mapping using semantic tokens
const GRADE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  A: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400", label: "Verified" },
  B: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", label: "Trusted" },
  C: { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400", label: "Observed" },
  D: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", label: "Stale" },
  F: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", label: "No Evidence" },
};

function EvidenceGradeBadge({ grade }: { grade: string }) {
  const style = GRADE_STYLES[grade] || GRADE_STYLES.F;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[10px] font-bold", style.bg, style.text)}>
      <ShieldCheck className="h-2.5 w-2.5" />
      Grade {grade} · {style.label}
    </span>
  );
}

function GroundingBadge({ passed, violations }: { passed?: boolean; violations?: number }) {
  if (passed === undefined) return null;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[10px] font-medium",
      passed
        ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
        : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
    )}>
      {passed ? <CheckCircle className="h-2.5 w-2.5" /> : <AlertTriangle className="h-2.5 w-2.5" />}
      {passed ? "Grounded" : `${violations ?? 0} ungrounded`}
    </span>
  );
}

function SentinelBadge({ healthy, violations }: { healthy?: boolean; violations?: number }) {
  if (healthy === undefined) return null;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[10px] font-medium",
      healthy
        ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
        : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
    )}>
      <Activity className="h-2.5 w-2.5" />
      {healthy ? "Sentinel OK" : `${violations ?? 0} violations`}
    </span>
  );
}

function PipelineBadge({ used }: { used: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[10px] font-medium",
      used
        ? "bg-primary/10 text-primary border-primary/20"
        : "bg-muted text-muted-foreground border-border"
    )}>
      {used ? <ShieldCheck className="h-2.5 w-2.5" /> : <ShieldAlert className="h-2.5 w-2.5" />}
      {used ? "Pipeline" : "Direct"}
    </span>
  );
}

export function EpistemicTrustDisplay({ trustMetadata, compact = false, className }: EpistemicTrustDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tm = trustMetadata;

  const hasCaveats = (tm.caveats?.length ?? 0) > 0;
  const hasAssumptions = (tm.assumptions?.length ?? 0) > 0;
  const hasNegativeReceipt = !!tm.negativeReceipt;
  const hasDetails = hasCaveats || hasAssumptions || hasNegativeReceipt;

  // Compact inline badges
  if (compact) {
    return (
      <div className={cn("flex flex-wrap items-center gap-1", className)}>
        <PipelineBadge used={tm.pipelineUsed} />
        {tm.evidenceGrade && <EvidenceGradeBadge grade={tm.evidenceGrade} />}
        <GroundingBadge passed={tm.groundingPassed} violations={tm.groundingViolations} />
        <SentinelBadge healthy={tm.sentinelHealthy} violations={tm.sentinelViolations} />
        {hasCaveats && (
          <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-1.5 py-px text-[10px] font-medium text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="h-2.5 w-2.5" />
            {tm.caveats!.length} caveat{tm.caveats!.length > 1 ? "s" : ""}
          </span>
        )}
        {hasNegativeReceipt && (
          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-1.5 py-px text-[10px] font-medium text-red-600 dark:text-red-400">
            <XCircle className="h-2.5 w-2.5" />
            Blocked
          </span>
        )}
      </div>
    );
  }

  // Full display with collapsible details
  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Badge row */}
      <div className="flex flex-wrap items-center gap-1">
        <PipelineBadge used={tm.pipelineUsed} />
        {tm.evidenceGrade && <EvidenceGradeBadge grade={tm.evidenceGrade} />}
        <GroundingBadge passed={tm.groundingPassed} violations={tm.groundingViolations} />
        <SentinelBadge healthy={tm.sentinelHealthy} violations={tm.sentinelViolations} />
      </div>

      {/* Expandable details */}
      {hasDetails && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {hasCaveats && `${tm.caveats!.length} caveat${tm.caveats!.length > 1 ? "s" : ""}`}
            {hasCaveats && hasAssumptions && " · "}
            {hasAssumptions && `${tm.assumptions!.length} assumption${tm.assumptions!.length > 1 ? "s" : ""}`}
            {hasNegativeReceipt && " · Refusal details"}
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-2 mt-1.5">
            {/* Caveats */}
            {hasCaveats && (
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-2 space-y-1">
                <p className="text-[10px] font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Caveats
                </p>
                {tm.caveats!.map((c, i) => (
                  <p key={i} className="text-[10px] text-muted-foreground leading-tight">• {c}</p>
                ))}
              </div>
            )}

            {/* Assumptions */}
            {hasAssumptions && (
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-2 space-y-1">
                <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" /> Assumptions
                </p>
                {tm.assumptions!.map((a, i) => (
                  <div key={i} className="text-[10px] text-muted-foreground leading-tight">
                    <span>• {a.statement}</span>
                    <span className="ml-1 opacity-60">({Math.round(a.confidence * 100)}% confidence, {a.impact} impact)</span>
                  </div>
                ))}
              </div>
            )}

            {/* Negative Receipt */}
            {hasNegativeReceipt && tm.negativeReceipt && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2 space-y-1.5">
                <p className="text-[10px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                  <FileWarning className="h-3 w-3" /> Refusal Receipt
                </p>
                <p className="text-[10px] text-muted-foreground">{tm.negativeReceipt.blockedDescription}</p>
                <div className="flex flex-wrap gap-1">
                  {tm.negativeReceipt.refusalReasons.map((r) => (
                    <Badge key={r} variant="outline" className="text-[9px] h-4">{r}</Badge>
                  ))}
                </div>
                {tm.negativeReceipt.suggestedActions.length > 0 && (
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-medium text-muted-foreground">Suggested actions:</p>
                    {tm.negativeReceipt.suggestedActions.map((sa, i) => (
                      <p key={i} className="text-[9px] text-muted-foreground">→ {sa.action}: {sa.description}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
