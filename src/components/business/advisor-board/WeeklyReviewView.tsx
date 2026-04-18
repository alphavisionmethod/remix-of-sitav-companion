import { motion } from "framer-motion";
import { Calendar, TrendingUp, AlertTriangle, DollarSign, Users, Activity } from "lucide-react";
import type { ProfitabilityBrief } from "@/domains/engines/business-profitability-engine";

interface Props {
  brief: ProfitabilityBrief;
}

export function WeeklyReviewView({ brief }: Props) {
  const h = brief.healthScore;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-[hsl(265_55%_58%/0.1)] bg-gradient-to-r from-[hsl(265_55%_58%/0.06)] to-transparent p-6">
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="h-6 w-6 text-[hsl(265_55%_58%)]" />
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">Weekly Operating Review</h2>
            <p className="text-[10px] text-muted-foreground">Week of {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{brief.headline}</p>
      </div>

      {/* Dimension grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: TrendingUp, label: "Revenue Health", score: h.revenue, color: "265 55% 58%" },
          { icon: DollarSign, label: "Cash Position", score: h.cash, color: "152 55% 48%" },
          { icon: Users, label: "Client Retention", score: h.retention, color: "200 60% 55%" },
          { icon: Activity, label: "Operational Capacity", score: h.capacity, color: "180 50% 50%" },
          { icon: AlertTriangle, label: "Margin Health", score: h.margin, color: "38 85% 58%" },
          { icon: TrendingUp, label: "Growth Potential", score: h.growth, color: "330 65% 55%" },
        ].map(d => (
          <div key={d.label} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3">
            <div className="flex items-center gap-2 mb-2">
              <d.icon className="h-3.5 w-3.5" style={{ color: `hsl(${d.color})` }} />
              <span className="text-[9px] text-muted-foreground">{d.label}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold font-display tabular-nums" style={{ color: `hsl(${d.color})` }}>{d.score}</span>
              <span className="text-[9px] text-muted-foreground mb-1">/ 100</span>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-[hsl(0_0%_100%/0.05)]">
              <div className="h-full rounded-full" style={{ width: `${d.score}%`, backgroundColor: `hsl(${d.color})` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Key takeaways */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Key Takeaways</h3>
        <div className="space-y-2">
          <p className="text-[10px] text-foreground">• {brief.executiveSummary}</p>
          {brief.cashPressure.actions.map((a, i) => (
            <p key={i} className="text-[10px] text-muted-foreground">• {a}</p>
          ))}
          {brief.capacitySignal.teamGaps.map((g, i) => (
            <p key={i} className="text-[10px] text-muted-foreground">• {g}</p>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
