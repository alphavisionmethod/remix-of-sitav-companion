// ═══════════════════════════════════════════════════════════════
// SITA OS — SurfaceTrustStrip
// Inline trust metadata display for data-driven surfaces
// Shows evidence grade, data sources, assumptions, and freshness
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ShieldCheck, ChevronDown, ChevronUp, Lightbulb, Database,
  AlertTriangle, Clock, CheckCircle
} from "lucide-react";

export type EvidenceGrade = "A" | "B" | "C" | "D" | "F";

export interface SurfaceAssumption {
  statement: string;
  impact?: "high" | "medium" | "low";
}

export interface SurfaceTrustConfig {
  /** Evidence grade for this surface's data (A=verified, B=trusted, C=observed, D=stale, F=none) */
  evidenceGrade: EvidenceGrade;
  /** Human-readable label for the grade */
  gradeLabel?: string;
  /** Where the data comes from */
  dataSources: string[];
  /** Assumptions underlying the displayed data */
  assumptions?: SurfaceAssumption[];
  /** When data was last refreshed */
  lastRefreshed?: Date | null;
  /** Optional caveats */
  caveats?: string[];
}

const GRADE_STYLES: Record<EvidenceGrade, { bg: string; text: string; border: string; label: string }> = {
  A: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400", border: "border-green-500/20", label: "Verified" },
  B: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20", label: "Trusted" },
  C: { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-500/20", label: "Observed" },
  D: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500/20", label: "Stale" },
  F: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", border: "border-red-500/20", label: "No Evidence" },
};

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface SurfaceTrustStripProps {
  config: SurfaceTrustConfig;
  className?: string;
}

export function SurfaceTrustStrip({ config, className }: SurfaceTrustStripProps) {
  const [open, setOpen] = useState(false);
  const grade = GRADE_STYLES[config.evidenceGrade];
  const hasAssumptions = (config.assumptions?.length ?? 0) > 0;
  const hasCaveats = (config.caveats?.length ?? 0) > 0;
  const hasDetails = hasAssumptions || hasCaveats;

  return (
    <div className={cn("rounded-xl border bg-card/50 px-3 py-2", className)}>
      {/* Badge row */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Evidence grade */}
        <span className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
          grade.bg, grade.text, grade.border,
        )}>
          <ShieldCheck className="h-2.5 w-2.5" />
          Grade {config.evidenceGrade} · {config.gradeLabel || grade.label}
        </span>

        {/* Data sources */}
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          <Database className="h-2.5 w-2.5" />
          {config.dataSources.length} source{config.dataSources.length !== 1 ? "s" : ""}
        </span>

        {/* Freshness */}
        {config.lastRefreshed && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            <Clock className="h-2.5 w-2.5" />
            {timeAgo(config.lastRefreshed)}
          </span>
        )}

        {/* Assumptions count badge */}
        {hasAssumptions && (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
            <Lightbulb className="h-2.5 w-2.5" />
            {config.assumptions!.length} assumption{config.assumptions!.length > 1 ? "s" : ""}
          </span>
        )}

        {/* Caveats count badge */}
        {hasCaveats && (
          <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="h-2.5 w-2.5" />
            {config.caveats!.length} caveat{config.caveats!.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Expandable details */}
      {hasDetails && (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            View details
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-2 mt-2">
            {/* Data sources */}
            <div className="rounded-lg border border-border bg-muted/30 p-2">
              <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                <Database className="h-3 w-3" /> Data Sources
              </p>
              <div className="flex flex-wrap gap-1">
                {config.dataSources.map((src, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-foreground">
                    <CheckCircle className="h-2 w-2 text-trust-verified" />
                    {src}
                  </span>
                ))}
              </div>
            </div>

            {/* Assumptions */}
            {hasAssumptions && (
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-2 space-y-1">
                <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" /> Assumptions
                </p>
                {config.assumptions!.map((a, i) => (
                  <div key={i} className="text-[10px] text-muted-foreground leading-tight">
                    <span>• {a.statement}</span>
                    {a.impact && <span className="ml-1 opacity-60">({a.impact} impact)</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Caveats */}
            {hasCaveats && (
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-2 space-y-1">
                <p className="text-[10px] font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Caveats
                </p>
                {config.caveats!.map((c, i) => (
                  <p key={i} className="text-[10px] text-muted-foreground leading-tight">• {c}</p>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
