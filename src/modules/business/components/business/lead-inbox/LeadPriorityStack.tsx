import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SitaCard } from "@/platform/sita/components/sita/SitaCard";
import { LeadPriorityBadge } from "./LeadPriorityBadge";
import { LeadHeatIndicator } from "./LeadHeatIndicator";
import { LeadConfidenceDisplay } from "./LeadConfidenceDisplay";
import { PriorityEvolutionTimeline } from "./PriorityEvolutionTimeline";
import { LeadSourceBadge } from "./LeadSourceBadge";
import type { LeadScoreResult } from "@/domains/engines/lead-scoring-engine";
import type { InboxItem } from "./mock-inbox-data";
import type { LeadSource } from "./LeadSourceBadge";
import { Zap, Star, ChevronRight } from "lucide-react";

const initials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

interface Props {
  items: InboxItem[];
  scores: Map<string, LeadScoreResult>;
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onExplain: (id: string) => void;
  maxItems?: number;
}

export const LeadPriorityStack = ({ items, scores, selectedId, onSelect, onExplain, maxItems = 10 }: Props) => {
  // Sort items by score
  const ranked = [...items]
    .filter(i => i.triage_status !== "accepted" && i.triage_status !== "rejected")
    .sort((a, b) => {
      const sa = scores.get(a.id)?.priorityScore ?? 0;
      const sb = scores.get(b.id)?.priorityScore ?? 0;
      return sb - sa;
    })
    .slice(0, maxItems);

  if (ranked.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
          <Star className="h-3.5 w-3.5 text-primary" />
        </div>
        <h3 className="font-display text-sm font-bold text-foreground">Priority Stack</h3>
        <span className="text-[10px] text-muted-foreground">· Top {ranked.length} leads ranked by scoring engine</span>
      </div>

      <div className="space-y-1.5">
        {ranked.map((item, index) => {
          const score = scores.get(item.id);
          if (!score) return null;
          const isSelected = selectedId === item.id;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              layout
            >
              <SitaCard
                onClick={() => onSelect(item.id)}
                selected={isSelected}
                lane={score.priorityTier === "critical-now" ? "action" : score.boardroomWorthy ? "opportunity" : undefined}
                className="p-0 group relative overflow-hidden cursor-pointer"
              >
                {/* Rank badge */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-7 flex items-center justify-center text-xs font-bold tabular-nums",
                  index === 0 ? "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]" :
                  index < 3 ? "bg-primary/5 text-primary" :
                  "bg-muted/20 text-muted-foreground"
                )}>
                  #{index + 1}
                </div>

                <div className="pl-9 pr-3 py-3 flex items-center gap-3">
                  {/* Avatar */}
                  <div className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold border-2",
                    score.priorityTier === "critical-now" ? "border-[hsl(var(--urgency-critical))] text-[hsl(var(--urgency-critical))]" :
                    score.priorityTier === "high-priority" ? "border-[hsl(var(--urgency-high))] text-[hsl(var(--urgency-high))]" :
                    "border-border text-muted-foreground"
                  )}>
                    {initials(item.contact_name)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground truncate">{item.contact_name}</p>
                      {item.company && <span className="text-[10px] text-muted-foreground truncate">· {item.company}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <LeadPriorityBadge tier={score.priorityTier} size="xs" />
                      <LeadHeatIndicator heat={score.heatStatus} size="xs" />
                      <LeadSourceBadge source={item.source as LeadSource} size="xs" />
                    </div>
                  </div>

                  {/* Score + trend */}
                  <div className="text-right shrink-0 space-y-1">
                    <div className={cn(
                      "font-display text-lg font-bold tabular-nums",
                      score.priorityScore >= 75 ? "text-[hsl(var(--trust-safe))]" :
                      score.priorityScore >= 50 ? "text-[hsl(var(--sita-gold))]" :
                      "text-muted-foreground"
                    )}>
                      {score.priorityScore}
                    </div>
                    <PriorityEvolutionTimeline
                      heat={score.heatStatus}
                      staleRisk={score.staleRisk}
                      priorityScore={score.priorityScore}
                      compact
                    />
                  </div>

                  {/* Explain button */}
                  <button
                    onClick={e => { e.stopPropagation(); onExplain(item.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-all"
                    title="View score breakdown"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Next action whisper */}
                {score.nextBestAction && (
                  <div className="pl-9 pr-3 pb-2 flex items-center gap-1.5">
                    <Zap className="h-2.5 w-2.5 text-accent shrink-0" />
                    <p className="text-[10px] text-accent/70 truncate">{score.nextBestAction}</p>
                  </div>
                )}
              </SitaCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
