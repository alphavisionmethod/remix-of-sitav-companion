import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Receipt, ShieldCheck, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ConciergeProofChip, type ProofStatus } from "./ConciergeProofChip";

export interface ReceiptRecord {
  id: string;
  action: string;
  timestamp: string;
  result: string;
  verification: ProofStatus;
  details?: string;
  who?: string;
  category?: string;
  linkedItem?: string;
}

export const ConciergeReceiptViewer = ({ records, className }: { records: ReceiptRecord[]; className?: string }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <motion.div
      className={cn("rounded-2xl border border-border/50 bg-card p-4", className)}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="h-4 w-4 text-accent" />
        <p className="text-xs font-semibold text-foreground">Receipt & Proof Viewer</p>
        <span className="ml-auto text-[10px] text-muted-foreground">{records.length} records</span>
      </div>
      <div className="space-y-1.5">
        {records.map(r => {
          const expanded = expandedId === r.id;
          return (
            <div key={r.id} className="rounded-lg border border-border/20 overflow-hidden">
              <button
                onClick={() => setExpandedId(expanded ? null : r.id)}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 hover:bg-secondary/20 transition-colors text-left"
              >
                {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground truncate">{r.action}</p>
                  <p className="text-[9px] text-muted-foreground">{r.timestamp}{r.who ? ` · ${r.who}` : ""}</p>
                </div>
                <ConciergeProofChip status={r.verification} />
              </button>
              {expanded && (
                <div className="px-3 pb-3 pt-1 border-t border-border/10 space-y-1">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-muted-foreground">Result:</span>
                    <span className="text-foreground font-medium">{r.result}</span>
                  </div>
                  {r.details && <p className="text-[10px] text-foreground/80">{r.details}</p>}
                  {r.category && (
                    <span className="inline-block rounded-md bg-secondary px-1.5 py-px text-[9px] text-muted-foreground">{r.category}</span>
                  )}
                  {r.linkedItem && <p className="text-[9px] text-primary">↗ {r.linkedItem}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
