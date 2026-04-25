import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { LeakItem } from "@/domains/engines/business-profitability-engine";

interface Props {
  leaks: LeakItem[];
}

const severityColor: Record<string, string> = {
  critical: "0 65% 50%",
  high: "38 85% 58%",
  medium: "265 55% 58%",
  low: "200 60% 55%",
};

export function ProfitLeakCard({ leaks }: Props) {
  if (leaks.length === 0) return null;

  const totalLoss = leaks.reduce((s, l) => s + l.estimatedLoss, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[hsl(0_65%_50%/0.15)] bg-gradient-to-br from-[hsl(0_65%_50%/0.04)] to-transparent p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[hsl(0_65%_50%)]" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Revenue Leaks</span>
        </div>
        <span className="text-sm font-bold text-[hsl(0_65%_50%)]">${(totalLoss / 1000).toFixed(1)}K at risk</span>
      </div>

      <div className="space-y-2">
        {leaks.slice(0, 4).map((leak, i) => (
          <motion.div
            key={leak.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.04)]"
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(${severityColor[leak.severity]})` }} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-foreground truncate">{leak.title}</p>
              <p className="text-[8px] text-muted-foreground">{leak.description}</p>
            </div>
            <span className="text-[10px] font-bold tabular-nums text-[hsl(0_65%_50%)]">${leak.estimatedLoss.toLocaleString()}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
