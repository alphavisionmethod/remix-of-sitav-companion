// ═══════════════════════════════════════════════════════════════
// SITA OS — Drag Index Radar Chart
// 14-dimension operational friction radar with evidence-backed
// scores and actionable recommendations. Uses Recharts.
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { useDragIndex, useDragRecommendations } from "@/platform/governance/hooks/use-meta-governance";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Gauge, ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OSEntityScope as EntityScope } from "@/packages/contracts";
import type { DragDimension } from "@/packages/contracts";

const DIMENSION_SHORT: Record<DragDimension, string> = {
  tool_switching: "Tool Switch",
  queue_size: "Queue",
  follow_up_debt: "Follow-up",
  notification_fatigue: "Notif Fatigue",
  context_switching: "Context Switch",
  duplicate_work: "Duplicates",
  stale_opportunity: "Stale Opps",
  blocked_approval: "Blocked Approvals",
  manual_work: "Manual Work",
  calendar_overload: "Calendar",
  coordination_imbalance: "Coordination",
  trust_friction: "Trust Friction",
  role_ambiguity: "Role Ambiguity",
  founder_dependency: "Founder Dep.",
};

interface DragIndexRadarProps {
  entityScope: EntityScope;
}


export function DragIndexRadar({ entityScope }: DragIndexRadarProps) {
  const dragIndex = useDragIndex(entityScope);
  const recommendations = useDragRecommendations(entityScope);

  const radarData = dragIndex.dimensions.map(d => ({
    dimension: DIMENSION_SHORT[d.dimension],
    score: Math.round(d.score * 100),
    fullMark: 100,
  }));

  const compositePercent = Math.round(dragIndex.compositeScore * 100);
  const severity = compositePercent > 60 ? "critical" : compositePercent > 35 ? "warning" : "info";

  return (
    <SitaCard hover={false} className="space-y-4">
      <div className="flex items-center justify-between">
        <SitaCardTitle sub="Operational friction across 14 dimensions">
          <span className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            Operational Drag Index
          </span>
        </SitaCardTitle>
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-mono",
            severity === "critical" ? "border-urgency-critical/40 text-urgency-critical" :
            severity === "warning" ? "border-accent/40 text-accent" :
            "border-trust-safe/40 text-trust-safe"
          )}
        >
          {compositePercent}% drag
        </Badge>
      </div>

      {/* Radar chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }}
            />
            <Radar
              name="Drag"
              dataKey="score"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Top recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Top Recommendations
          </p>
          {recommendations.slice(0, 3).map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-lg border border-border p-2.5 hover:border-primary/20 transition-colors"
            >
              <Zap className={cn(
                "h-3.5 w-3.5 shrink-0",
                rec.priority === "critical" ? "text-urgency-critical" :
                rec.priority === "high" ? "text-urgency-high" : "text-accent"
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{rec.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{rec.description}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                <span>-{Math.round(rec.estimatedReduction * 100)}%</span>
                {rec.actionRoute && <ArrowRight className="h-3 w-3" />}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </SitaCard>
  );
}

export default DragIndexRadar;
