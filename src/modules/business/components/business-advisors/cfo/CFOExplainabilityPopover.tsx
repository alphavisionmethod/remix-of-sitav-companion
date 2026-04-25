// ═══════════════════════════════════════════════════════════════
// SITA OS — CFO Advisor Explainability Popover
//
// Renders per-recommendation transparency: exact data sources,
// assumptions used, and the calculation steps that produced the
// flag. Reusable across all CFO recommendation rows. Read-only,
// no advisor calls — purely a glass-box UI primitive.
// ═══════════════════════════════════════════════════════════════

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, Database, Calculator, ListTree } from "lucide-react";

export interface ExplainabilitySource {
  /** Logical table name (e.g. "invoices") */
  table: string;
  /** Why this table was queried */
  purpose: string;
  /** Number of rows scanned for this slice */
  rowCount?: number;
  /** ISO of last record updated_at, when known */
  asOf?: string | null;
}

export interface ExplainabilityStep {
  /** One short label, e.g. "Filter overdue" */
  label: string;
  /** Plain-English description of what the step does */
  detail: string;
  /** Optional concrete output, e.g. "8 invoices, total $12,400" */
  output?: string;
}

export interface CFOExplainability {
  /** One-line subject for the popover header */
  subject: string;
  /** RLS-scoped tables used as inputs */
  sources: ExplainabilitySource[];
  /** Plain-English assumptions / thresholds in play */
  assumptions: string[];
  /** Ordered calc steps from raw rows → flagged result */
  steps: ExplainabilityStep[];
  /** Optional audit footer (e.g. "Snapshot taken 2025-01-01T...") */
  footer?: string;
}

interface Props {
  data: CFOExplainability;
  /** Optional aria-label override for the trigger */
  triggerLabel?: string;
}

/**
 * CFOExplainabilityPopover — clickable info badge that explains
 * the exact data sources, assumptions, and steps behind any CFO
 * recommendation row. Glass-box transparency, no AI involvement.
 */
export function CFOExplainabilityPopover({ data, triggerLabel }: Props) {
  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex h-5 items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={triggerLabel ?? `Explain how this was computed: ${data.subject}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Info className="h-3 w-3" />
        Why?
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-[320px] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border bg-muted/30 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Why this recommendation?
          </p>
          <p className="text-xs font-medium leading-snug mt-0.5">{data.subject}</p>
        </div>

        <ScrollArea className="max-h-[360px]">
          <div className="p-3 space-y-3">
            <section>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                <Database className="h-3 w-3" /> Data sources ({data.sources.length})
              </p>
              <ul className="space-y-1.5">
                {data.sources.map((s, i) => (
                  <li
                    key={`${s.table}-${i}`}
                    className="rounded-md border border-border/60 bg-background px-2 py-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-[11px] font-mono font-medium">{s.table}</code>
                      {typeof s.rowCount === "number" && (
                        <Badge variant="outline" className="text-[10px] h-4">
                          {s.rowCount} row{s.rowCount === 1 ? "" : "s"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                      {s.purpose}
                    </p>
                    {s.asOf && (
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                        Latest: {new Date(s.asOf).toLocaleString()}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            {data.assumptions.length > 0 && (
              <section>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                  <ListTree className="h-3 w-3" /> Assumptions
                </p>
                <ul className="space-y-1">
                  {data.assumptions.map((a, i) => (
                    <li key={i} className="text-[11px] leading-snug flex gap-1.5">
                      <span className="text-muted-foreground shrink-0">•</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                <Calculator className="h-3 w-3" /> Calculation steps
              </p>
              <ol className="space-y-1.5">
                {data.steps.map((step, i) => (
                  <li
                    key={i}
                    className="rounded-md border border-border/60 bg-background px-2 py-1.5"
                  >
                    <div className="flex items-start gap-2">
                      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium leading-snug">{step.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                          {step.detail}
                        </p>
                        {step.output && (
                          <p className="text-[10px] font-mono text-foreground/80 mt-1 px-1.5 py-0.5 rounded bg-muted/60 inline-block">
                            → {step.output}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {data.footer && (
              <p className="text-[10px] text-muted-foreground/70 pt-1 border-t border-border/40">
                {data.footer}
              </p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
