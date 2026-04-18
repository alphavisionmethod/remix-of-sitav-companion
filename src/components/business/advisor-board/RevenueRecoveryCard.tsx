import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GrowthOpportunity } from "@/domains/engines/business-profitability-engine";

interface Props {
  opportunities: GrowthOpportunity[];
  onConvert?: (opp: GrowthOpportunity) => void;
}

export function RevenueRecoveryCard({ opportunities, onConvert }: Props) {
  if (opportunities.length === 0) return null;

  const totalValue = opportunities.reduce((s, o) => s + o.estimatedValue, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[hsl(152_55%_48%/0.15)] bg-gradient-to-br from-[hsl(152_55%_48%/0.04)] to-transparent p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[hsl(152_55%_48%)]" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Growth Opportunities</span>
        </div>
        <span className="text-sm font-bold text-[hsl(152_55%_48%)]">${(totalValue / 1000).toFixed(1)}K potential</span>
      </div>

      <div className="space-y-2">
        {opportunities.slice(0, 4).map((opp, i) => (
          <motion.div
            key={opp.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.04)]"
          >
            <ArrowUpRight className="h-3 w-3 text-[hsl(152_55%_48%)] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-foreground truncate">{opp.title}</p>
              <p className="text-[8px] text-muted-foreground">{opp.source} · {Math.round(opp.confidence * 100)}% confidence</p>
            </div>
            <span className="text-[10px] font-bold tabular-nums text-[hsl(152_55%_48%)]">${opp.estimatedValue.toLocaleString()}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
