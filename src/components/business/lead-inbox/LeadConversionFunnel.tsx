import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { InboxItem } from "./mock-inbox-data";
import type { LeadScoreResult } from "@/domains/engines/lead-scoring-engine";

interface Props {
  items: InboxItem[];
  scoreMap: Map<string, LeadScoreResult>;
  className?: string;
}

const STAGES = [
  { key: "new", label: "New Leads", color: "hsl(var(--primary))" },
  { key: "qualified", label: "Qualified", color: "hsl(var(--accent))" },
  { key: "proposal", label: "Proposal Ready", color: "hsl(var(--sita-gold))" },
  { key: "won", label: "Won / Accepted", color: "hsl(var(--trust-safe))" },
];

export const LeadConversionFunnel = ({ items, scoreMap, className }: Props) => {
  const counts = {
    new: items.filter(i => i.triage_status === "new" || i.triage_status === "reviewing").length,
    qualified: items.filter(i => {
      const s = scoreMap.get(i.id);
      return s && s.priorityScore >= 60 && i.triage_status !== "accepted" && i.triage_status !== "rejected";
    }).length,
    proposal: items.filter(i => i.quote_requested || i.suggested_route === "quote" || i.suggested_route === "consult").length,
    won: items.filter(i => i.triage_status === "accepted").length,
  };

  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <div className={cn("rounded-2xl border border-border/40 bg-card p-5", className)}>
      <p className="text-xs font-semibold text-foreground mb-4">Conversion Funnel</p>
      <div className="space-y-2">
        {STAGES.map((stage, i) => {
          const count = counts[stage.key as keyof typeof counts];
          const widthPct = Math.max(12, (count / maxCount) * 100);
          return (
            <div key={stage.key} className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground w-20 text-right shrink-0">{stage.label}</span>
              <div className="flex-1 h-8 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="h-full rounded-lg flex items-center justify-end pr-3 relative overflow-hidden"
                  style={{ backgroundColor: stage.color, opacity: 0.85 }}
                >
                  <span className="text-[11px] font-bold text-background tabular-nums relative z-10">{count}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Conversion rates */}
      <div className="flex justify-between mt-4 pt-3 border-t border-border/20">
        {counts.new > 0 && (
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Qualify Rate</p>
            <p className="text-xs font-bold text-foreground">{Math.round((counts.qualified / counts.new) * 100)}%</p>
          </div>
        )}
        {counts.qualified > 0 && (
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Proposal Rate</p>
            <p className="text-xs font-bold text-foreground">{Math.round((counts.proposal / counts.qualified) * 100)}%</p>
          </div>
        )}
        {counts.proposal > 0 && (
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Win Rate</p>
            <p className="text-xs font-bold text-foreground">{Math.round((counts.won / Math.max(counts.proposal, 1)) * 100)}%</p>
          </div>
        )}
      </div>
    </div>
  );
};
