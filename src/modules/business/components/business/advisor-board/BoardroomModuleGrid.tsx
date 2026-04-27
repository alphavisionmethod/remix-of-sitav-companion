import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, DollarSign, Users, Settings, Target, Lightbulb, ListChecks, Shield, Activity } from "lucide-react";
import type { ProfitabilityBrief } from "@/domains/engines/business-profitability-engine";
import type { AIRecommendation } from "@/modules/business/hooks/useBusinessAdvisorBoard";
import type { BusinessAction } from "@/domains/engines/business-action-pipeline";

interface Props {
  brief: ProfitabilityBrief;
  recommendations: AIRecommendation[];
  actionQueue: BusinessAction[];
}

function ModuleCard({ icon: Icon, title, value, subtitle, color, delay }: {
  icon: React.ElementType; title: string; value: string | number; subtitle: string; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 hover:bg-[hsl(0_0%_100%/0.04)] transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" style={{ color: `hsl(${color})` }} />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
      </div>
      <p className="text-xl font-bold font-display tabular-nums" style={{ color: `hsl(${color})` }}>{value}</p>
      <p className="text-[9px] text-muted-foreground mt-0.5">{subtitle}</p>
    </motion.div>
  );
}

export function BoardroomModuleGrid({ brief, recommendations, actionQueue }: Props) {
  const highUrgency = recommendations.filter(r => r.urgency === "critical" || r.urgency === "high");
  const totalLeakValue = brief.topLeaks.reduce((s, l) => s + l.estimatedLoss, 0);
  const totalOpportunityValue = brief.opportunities.reduce((s, o) => s + o.estimatedValue, 0);

  const modules = [
    { icon: Target, title: "Today", value: brief.topLeaks.length + recommendations.length, subtitle: "items need attention", color: "265 55% 58%" },
    { icon: AlertTriangle, title: "At Risk", value: highUrgency.length, subtitle: "high-priority alerts", color: "0 65% 50%" },
    { icon: TrendingUp, title: "Revenue", value: `$${(totalLeakValue / 1000).toFixed(0)}K`, subtitle: "at risk across pipeline", color: "38 85% 58%" },
    { icon: DollarSign, title: "Cash", value: `${brief.cashPressure.cashRunwayDays}d`, subtitle: `runway · ${brief.cashPressure.reserveLevel}`, color: "152 55% 48%" },
    { icon: Users, title: "Clients", value: brief.retentionRisk.atRiskClients.length, subtitle: "at-risk accounts", color: "200 60% 55%" },
    { icon: Settings, title: "Operations", value: `${brief.capacitySignal.utilizationPercent}%`, subtitle: "capacity utilization", color: "180 50% 50%" },
    { icon: Users, title: "Team", value: brief.capacitySignal.missedCommitments, subtitle: "missed commitments", color: "280 45% 60%" },
    { icon: Lightbulb, title: "Opportunities", value: `$${(totalOpportunityValue / 1000).toFixed(0)}K`, subtitle: `${brief.opportunities.length} identified`, color: "330 65% 55%" },
    { icon: ListChecks, title: "Recommendations", value: recommendations.length, subtitle: "advisor recommendations", color: "265 55% 58%" },
    { icon: Shield, title: "Action Queue", value: actionQueue.length, subtitle: "pending actions", color: "152 55% 48%" },
    { icon: Activity, title: "Health Score", value: brief.healthScore.overall, subtitle: brief.healthScore.trend, color: brief.healthScore.overall > 70 ? "152 55% 48%" : "38 85% 58%" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {modules.map((m, i) => (
        <ModuleCard key={m.title} {...m} delay={0.1 + i * 0.03} />
      ))}
    </div>
  );
}
