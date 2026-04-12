import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { TrustBadge } from "@/components/sita/TrustBadge";

export interface AdvisorInsight {
  role: string;
  message: string;
  linkedItems?: string[];
  confidence: "high" | "medium" | "low";
}

export const ConciergeAdvisorInsightCard = ({ insight, className }: { insight: AdvisorInsight; className?: string }) => (
  <motion.div
    className={cn(
      "rounded-2xl border border-border/30 p-4 relative overflow-hidden",
      "bg-gradient-to-br from-primary/[0.04] via-accent/[0.03] to-transparent",
      className
    )}
    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-accent/[0.02] pointer-events-none" />
    <div className="relative">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 p-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-foreground">{insight.role}</p>
          <p className="text-[9px] text-muted-foreground">Concierge Intelligence</p>
        </div>
        <TrustBadge level={insight.confidence === "high" ? "verified" : "review"} label={insight.confidence} size="sm" />
      </div>
      <p className="text-xs text-foreground/90 leading-relaxed">{insight.message}</p>
      {insight.linkedItems && insight.linkedItems.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {insight.linkedItems.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-primary/8 px-2 py-0.5 text-[9px] text-primary font-medium">
              <ArrowRight className="h-2.5 w-2.5" />{item}
            </span>
          ))}
        </div>
      )}
    </div>
  </motion.div>
);
