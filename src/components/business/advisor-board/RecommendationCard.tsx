import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AIRecommendation } from "@/hooks/useBusinessAdvisorBoard";
import { BUSINESS_ADVISORS } from "@/domains/engines/business-advisor-personas";

interface Props {
  recommendation: AIRecommendation;
  onConvertToAction: (rec: AIRecommendation) => void;
  index: number;
}

const urgencyColor: Record<string, string> = {
  critical: "0 65% 50%",
  high: "38 85% 58%",
  medium: "265 55% 58%",
  low: "152 55% 48%",
};

export function RecommendationCard({ recommendation, onConvertToAction, index }: Props) {
  const advisor = BUSINESS_ADVISORS.find(a => a.id === recommendation.advisorId);
  const color = urgencyColor[recommendation.urgency] ?? "0 0% 50%";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 hover:bg-[hsl(0_0%_100%/0.04)] transition-colors"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-2">
        {advisor && (
          <img src={advisor.portraitUrl} alt={advisor.displayName} className="w-8 h-8 rounded-full object-cover border" style={{ borderColor: `hsl(${advisor.colorAccent} / 0.4)` }} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: `hsl(${color})` }}>
              {recommendation.urgency}
            </span>
            <span className="text-[8px] text-muted-foreground">{advisor?.displayName ?? recommendation.advisorId}</span>
          </div>
          <p className="text-xs font-semibold text-foreground">{recommendation.title}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold tabular-nums" style={{ color: `hsl(${advisor?.colorAccent ?? "265 55% 58%"})` }}>
            {recommendation.confidence}%
          </p>
          <p className="text-[7px] text-muted-foreground">confidence</p>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">{recommendation.summary}</p>

      {/* Actions */}
      <div className="space-y-1 mb-3">
        {recommendation.suggestedActions.map((a, i) => (
          <p key={i} className="text-[9px] text-muted-foreground flex items-center gap-1.5">
            <ArrowRight className="h-2 w-2 shrink-0" style={{ color: `hsl(${advisor?.colorAccent ?? "265 55% 58%"})` }} />
            {a}
          </p>
        ))}
      </div>

      {/* Risk flags */}
      {recommendation.riskFlags && recommendation.riskFlags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {recommendation.riskFlags.map((f, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded text-[8px] bg-[hsl(0_65%_50%/0.08)] text-[hsl(0_65%_60%)] border border-[hsl(0_65%_50%/0.15)]">
              {f}
            </span>
          ))}
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="w-full h-7 text-[10px] border border-[hsl(265_55%_58%/0.2)] hover:bg-[hsl(265_55%_58%/0.08)]"
        onClick={() => onConvertToAction(recommendation)}
      >
        <Zap className="h-3 w-3 mr-1 text-[hsl(265_55%_58%)]" /> Convert to Action
      </Button>
    </motion.div>
  );
}
