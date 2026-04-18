// ═══════════════════════════════════════════════════════════════
// SITA OS — Morning Executive Brief
// Premium daily briefing surface with health pulse and priorities
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { Sun, Sunrise, Moon, TrendingUp, AlertTriangle, DollarSign, Clock, Zap, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProfitabilityBrief } from "@/domains/engines/business-profitability-engine";
import type { ProfitLoopSummary } from "@/domains/engines/continuous-profit-engine";
import type { BusinessContextSnapshot } from "@/domains/engines/business-context-graph";
import type { AIRecommendation } from "@/hooks/useBusinessAdvisorBoard";

interface Props {
  brief: ProfitabilityBrief;
  profitSummary: ProfitLoopSummary;
  context: BusinessContextSnapshot;
  recommendations: AIRecommendation[];
  onApproveAction?: (rec: AIRecommendation) => void;
  onDismiss?: () => void;
}

function getGreeting(): { icon: React.ReactNode; text: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { icon: <Sunrise className="h-5 w-5 text-[hsl(38_85%_58%)]" />, text: "Good morning" };
  if (hour < 17) return { icon: <Sun className="h-5 w-5 text-[hsl(38_85%_58%)]" />, text: "Good afternoon" };
  return { icon: <Moon className="h-5 w-5 text-[hsl(265_55%_58%)]" />, text: "Good evening" };
}

export function MorningExecutiveBrief({ brief, profitSummary, context, recommendations, onApproveAction, onDismiss }: Props) {
  const greeting = getGreeting();
  const topRecs = recommendations.filter(r => r.urgency === "critical" || r.urgency === "high").slice(0, 3);
  const topAction = recommendations[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Greeting Header */}
      <Card className="bg-gradient-to-br from-[hsl(265_55%_58%/0.08)] to-[hsl(38_85%_58%/0.05)] border-[hsl(265_55%_58%/0.15)]">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {greeting.icon}
              <div>
                <h2 className="text-lg font-display font-bold text-foreground">{greeting.text}</h2>
                <p className="text-[10px] text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
            {onDismiss && (
              <Button variant="ghost" size="sm" className="text-[10px] text-muted-foreground" onClick={onDismiss}>
                Skip to Board →
              </Button>
            )}
          </div>

          {/* Health Pulse */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: "Business Health", value: brief.healthScore.overall, color: brief.healthScore.overall >= 70 ? "hsl(152 55% 48%)" : "hsl(38 85% 58%)" },
              { label: "Cash Clarity", value: context.performance.cashClarityScore, color: context.performance.cashClarityScore >= 70 ? "hsl(152 55% 48%)" : "hsl(38 85% 58%)" },
              { label: "Client Health", value: context.performance.clientHealthScore, color: context.performance.clientHealthScore >= 70 ? "hsl(152 55% 48%)" : "hsl(0 65% 50%)" },
              { label: "Execution", value: context.performance.executionConsistencyScore, color: context.performance.executionConsistencyScore >= 70 ? "hsl(152 55% 48%)" : "hsl(38 85% 58%)" },
            ].map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="text-center"
              >
                <div className="text-xl font-display font-bold" style={{ color: metric.color }}>{metric.value}</div>
                <div className="text-[9px] text-muted-foreground">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Priorities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {topRecs.map((rec, i) => (
          <motion.div
            key={`${rec.advisorId}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Card className="border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] h-full">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Badge variant={rec.urgency === "critical" ? "destructive" : "secondary"} className="text-[8px] px-1.5 py-0">
                    {rec.urgency}
                  </Badge>
                  <span className="text-[9px] text-muted-foreground">{Math.round(rec.confidence * 100)}% confident</span>
                </div>
                <h3 className="text-xs font-semibold text-foreground mb-1 line-clamp-2">{rec.title}</h3>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{rec.summary}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Financial Pulse */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-3.5 w-3.5 text-[hsl(38_85%_58%)]" />
              <span className="text-[10px] font-medium text-foreground">Revenue at Risk</span>
            </div>
            <div className="text-lg font-display font-bold text-[hsl(0_65%_50%)]">
              ${profitSummary.totalAtRisk.toLocaleString()}
            </div>
            <p className="text-[9px] text-muted-foreground">{profitSummary.unresolvedSignals} unresolved signals</p>
          </CardContent>
        </Card>
        <Card className="border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3.5 w-3.5 text-[hsl(265_55%_58%)]" />
              <span className="text-[10px] font-medium text-foreground">Cash Runway</span>
            </div>
            <div className="text-lg font-display font-bold text-foreground">
              {brief.cashPressure.cashRunwayDays} days
            </div>
            <p className="text-[9px] text-muted-foreground">{brief.cashPressure.reserveLevel} reserves</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action */}
      {topAction && (
        <Card className="border-[hsl(265_55%_58%/0.2)] bg-[hsl(265_55%_58%/0.05)]">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-[hsl(265_55%_58%)]" />
              <div>
                <p className="text-xs font-medium text-foreground">{topAction.title}</p>
                <p className="text-[9px] text-muted-foreground">SITA can handle this now</p>
              </div>
            </div>
            <Button
              size="sm"
              className="text-[10px] h-7 bg-[hsl(265_55%_58%)] hover:bg-[hsl(265_55%_48%)] text-white"
              onClick={() => onApproveAction?.(topAction)}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Approve
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
