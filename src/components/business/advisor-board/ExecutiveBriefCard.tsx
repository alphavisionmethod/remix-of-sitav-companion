import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, DollarSign, Shield, Activity } from "lucide-react";
import type { ProfitabilityBrief } from "@/domains/engines/business-profitability-engine";

interface Props {
  brief: ProfitabilityBrief;
}

export function ExecutiveBriefCard({ brief }: Props) {
  const h = brief.healthScore;
  const healthColor = h.overall > 70 ? "152 55% 48%" : h.overall > 50 ? "38 85% 58%" : "0 65% 50%";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[hsl(0_0%_100%/0.06)] bg-gradient-to-br from-[hsl(265_55%_58%/0.06)] to-[hsl(220_40%_8%/0.5)] p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-display font-bold text-foreground">Executive Brief</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.06)]">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(${healthColor})` }} />
          <span className="text-xs font-bold tabular-nums" style={{ color: `hsl(${healthColor})` }}>{h.overall}</span>
          <span className="text-[9px] text-muted-foreground">/ 100</span>
        </div>
      </div>

      <p className="text-xs font-semibold mb-2" style={{ color: `hsl(${healthColor})` }}>{brief.headline}</p>
      <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">{brief.executiveSummary}</p>

      {/* Quick metrics strip */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: TrendingUp, label: "Revenue", value: h.revenue, color: "265 55% 58%" },
          { icon: DollarSign, label: "Cash", value: h.cash, color: "152 55% 48%" },
          { icon: AlertTriangle, label: "Retention", value: h.retention, color: "38 85% 58%" },
          { icon: Activity, label: "Capacity", value: h.capacity, color: "200 60% 55%" },
        ].map(m => (
          <div key={m.label} className="rounded-lg bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.04)] p-2 text-center">
            <m.icon className="h-3 w-3 mx-auto mb-1" style={{ color: `hsl(${m.color})` }} />
            <p className="text-sm font-bold tabular-nums" style={{ color: `hsl(${m.color})` }}>{m.value}</p>
            <p className="text-[8px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
