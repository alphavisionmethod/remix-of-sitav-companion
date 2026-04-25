import { motion } from "framer-motion";
import { Sun, Moon, Target, AlertTriangle, TrendingUp } from "lucide-react";
import type { ProfitabilityBrief } from "@/domains/engines/business-profitability-engine";
import type { AIRecommendation } from "@/hooks/useBusinessAdvisorBoard";

interface Props {
  brief: ProfitabilityBrief;
  recommendations: AIRecommendation[];
}

export function DailyBriefView({ brief, recommendations }: Props) {
  const hour = new Date().getHours();
  const isMorning = hour < 12;
  const greeting = isMorning ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const Icon = isMorning ? Sun : Moon;

  const topRecs = recommendations.filter(r => r.urgency === "high" || r.urgency === "critical").slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Greeting */}
      <div className="rounded-2xl border border-[hsl(265_55%_58%/0.1)] bg-gradient-to-r from-[hsl(265_55%_58%/0.06)] to-transparent p-6">
        <div className="flex items-center gap-3 mb-3">
          <Icon className="h-6 w-6 text-[hsl(38_85%_58%)]" />
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">{greeting}</h2>
            <p className="text-[10px] text-muted-foreground">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{brief.executiveSummary}</p>
      </div>

      {/* Today's priorities */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-[hsl(265_55%_58%)]" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Today's Priorities</span>
        </div>
        <div className="space-y-2">
          {brief.topLeaks.slice(0, 3).map((leak, i) => (
            <div key={leak.id} className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(0_0%_100%/0.02)]">
              <span className="text-[10px] font-bold text-[hsl(265_55%_58%)] w-5">{i + 1}.</span>
              <div className="flex-1">
                <p className="text-[10px] font-medium text-foreground">{leak.title}</p>
                <p className="text-[8px] text-muted-foreground">{leak.suggestedAction}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical advisor alerts */}
      {topRecs.length > 0 && (
        <div className="rounded-xl border border-[hsl(38_85%_58%/0.15)] bg-[hsl(38_85%_58%/0.04)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-[hsl(38_85%_58%)]" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Advisor Alerts</span>
          </div>
          <div className="space-y-2">
            {topRecs.map(r => (
              <div key={r.advisorId} className="p-2 rounded-lg bg-[hsl(0_0%_100%/0.02)]">
                <p className="text-[10px] font-semibold text-foreground">{r.title}</p>
                <p className="text-[9px] text-muted-foreground">{r.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health snapshot */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-[hsl(152_55%_48%)]" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Health Snapshot</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-[hsl(0_0%_100%/0.03)] p-2">
            <p className="text-lg font-bold text-[hsl(152_55%_48%)]">{brief.healthScore.overall}</p>
            <p className="text-[8px] text-muted-foreground">Overall</p>
          </div>
          <div className="rounded-lg bg-[hsl(0_0%_100%/0.03)] p-2">
            <p className="text-lg font-bold text-[hsl(38_85%_58%)]">{brief.cashPressure.cashRunwayDays}d</p>
            <p className="text-[8px] text-muted-foreground">Cash Runway</p>
          </div>
          <div className="rounded-lg bg-[hsl(0_0%_100%/0.03)] p-2">
            <p className="text-lg font-bold text-[hsl(0_65%_50%)]">{brief.retentionRisk.atRiskClients.length}</p>
            <p className="text-[8px] text-muted-foreground">At Risk</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
