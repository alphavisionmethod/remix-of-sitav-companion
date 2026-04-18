import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AdvisorPersona } from "@/domains/engines/business-advisor-personas";
import type { AIRecommendation } from "@/hooks/useBusinessAdvisorBoard";

interface Props {
  advisors: AdvisorPersona[];
  recommendations: AIRecommendation[];
  selectedId: string | null;
  onSelect: (advisor: AdvisorPersona) => void;
}

export function AdvisorPresenceBar({ advisors, recommendations, selectedId, onSelect }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3"
    >
      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">Board of Advisors</p>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {advisors.map((advisor, i) => {
          const rec = recommendations.find(r => r.advisorId === advisor.id);
          const hasRec = !!rec;
          const urgencyDot = rec?.urgency === "critical" ? "0 65% 50%" : rec?.urgency === "high" ? "38 85% 58%" : rec?.urgency === "medium" ? "265 55% 58%" : "152 55% 48%";

          return (
            <motion.button
              key={advisor.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
              onClick={() => onSelect(advisor)}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all min-w-[72px]",
                "hover:bg-[hsl(0_0%_100%/0.05)]",
                selectedId === advisor.id && "bg-[hsl(0_0%_100%/0.06)] ring-1 ring-[hsl(265_55%_58%/0.3)]"
              )}
            >
              <div className="relative">
                <img
                  src={advisor.portraitUrl}
                  alt={advisor.displayName}
                  className="w-10 h-10 rounded-full object-cover border-2"
                  style={{ borderColor: `hsl(${advisor.colorAccent} / 0.4)` }}
                />
                {hasRec && (
                  <div
                    className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background"
                    style={{ backgroundColor: `hsl(${urgencyDot})` }}
                  />
                )}
              </div>
              <span className="text-[8px] text-muted-foreground text-center leading-tight line-clamp-1 w-full">
                {advisor.displayName.split(" ")[0]}
              </span>
              {hasRec && (
                <span className="text-[7px] font-bold tabular-nums" style={{ color: `hsl(${advisor.colorAccent})` }}>
                  {rec.confidence}%
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
