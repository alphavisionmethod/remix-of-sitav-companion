import { motion } from "framer-motion";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { BusinessHealthScore } from "@/domains/engines/business-profitability-engine";

interface Props {
  score: BusinessHealthScore;
}

export function BusinessHealthScoreCard({ score }: Props) {
  const color = score.overall > 70 ? "152 55% 48%" : score.overall > 50 ? "38 85% 58%" : "0 65% 50%";
  const TrendIcon = score.trend === "improving" ? TrendingUp : score.trend === "declining" ? TrendingDown : Minus;

  const dimensions = [
    { label: "Revenue", value: score.revenue },
    { label: "Margin", value: score.margin },
    { label: "Cash", value: score.cash },
    { label: "Capacity", value: score.capacity },
    { label: "Retention", value: score.retention },
    { label: "Growth", value: score.growth },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4" style={{ color: `hsl(${color})` }} />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Business Health</span>
        <div className="ml-auto flex items-center gap-1">
          <TrendIcon className="h-3 w-3" style={{ color: `hsl(${color})` }} />
          <span className="text-[9px] capitalize" style={{ color: `hsl(${color})` }}>{score.trend}</span>
        </div>
      </div>

      {/* Big score */}
      <div className="text-center mb-3">
        <p className="text-4xl font-bold font-display tabular-nums" style={{ color: `hsl(${color})` }}>{score.overall}</p>
        <p className="text-[9px] text-muted-foreground">/ 100</p>
      </div>

      {/* Sparkline approximation */}
      <div className="flex items-end justify-center gap-1 mb-3 h-6">
        {score.sparkline.map((v, i) => (
          <div
            key={i}
            className="w-3 rounded-sm transition-all"
            style={{
              height: `${Math.max(4, (v / 100) * 24)}px`,
              backgroundColor: `hsl(${color} / ${i === score.sparkline.length - 1 ? 0.8 : 0.3})`,
            }}
          />
        ))}
      </div>

      {/* Dimension bars */}
      <div className="space-y-1.5">
        {dimensions.map(d => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="text-[8px] text-muted-foreground w-14 text-right">{d.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-[hsl(0_0%_100%/0.05)]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${d.value}%`, backgroundColor: `hsl(${d.value > 70 ? "152 55% 48%" : d.value > 50 ? "38 85% 58%" : "0 65% 50%"})` }}
              />
            </div>
            <span className="text-[8px] font-bold tabular-nums text-muted-foreground w-6 text-right">{d.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
