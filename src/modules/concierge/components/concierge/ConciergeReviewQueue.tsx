import { GlassCard } from "@/platform/sita/components/sita/PremiumPageComponents";
import { Eye, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export interface ReviewItem {
  id: string;
  title: string;
  reason: string;
  urgency: "high" | "medium" | "low";
  onReview?: () => void;
}

const urgencyDot = { high: "bg-destructive", medium: "bg-amber-500", low: "bg-chart-2" };

export function ConciergeReviewQueue({ items }: { items: ReviewItem[] }) {
  if (items.length === 0) return null;

  return (
    <GlassCard glow="none" className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold text-foreground">Needs Your Review</p>
        <span className="ml-auto text-[10px] bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">{items.length}</span>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            className="flex items-center gap-3 rounded-xl bg-secondary/20 border border-border/15 px-3 py-2.5 group"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div className={`h-2 w-2 rounded-full shrink-0 ${urgencyDot[item.urgency]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-foreground truncate">{item.title}</p>
              <p className="text-[9px] text-muted-foreground">{item.reason}</p>
            </div>
            {item.onReview && (
              <button onClick={item.onReview} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
