// ═══════════════════════════════════════════════════════════════
// SITA OS — Cross-Advisor Reasoning View
// Shows multi-advisor contribution to recommendations
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { Users, Star, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CoordinatedRecommendation } from "@/domains/engines/cross-advisor-coordinator";
import { BUSINESS_ADVISORS } from "@/domains/engines/business-advisor-personas";

interface Props {
  recommendations: CoordinatedRecommendation[];
  onSelect?: (rec: CoordinatedRecommendation) => void;
}

function getAdvisorMeta(id: string) {
  return BUSINESS_ADVISORS.find(a => a.id === id) ?? { displayName: id, emoji: "🤖", colorAccent: "200 60% 55%" };
}

function CategoryBadge({ category }: { category: CoordinatedRecommendation["category"] }) {
  const colors: Record<string, string> = {
    revenue: "38 85% 58%",
    operations: "200 60% 55%",
    client: "152 55% 48%",
    finance: "330 65% 55%",
    strategy: "265 55% 58%",
    team: "280 60% 60%",
    general: "0 0% 50%",
  };
  return (
    <Badge variant="outline" className="text-[7px] px-1 py-0" style={{ borderColor: `hsl(${colors[category] ?? colors.general})`, color: `hsl(${colors[category] ?? colors.general})` }}>
      {category}
    </Badge>
  );
}

export function CrossAdvisorReasoningView({ recommendations, onSelect }: Props) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-6 w-6 mx-auto text-muted-foreground/30 mb-2" />
        <p className="text-[10px] text-muted-foreground">No coordinated recommendations yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Users className="h-4 w-4 text-[hsl(265_55%_58%)]" />
        <h3 className="text-sm font-display font-bold text-foreground">Cross-Advisor Synthesis</h3>
        <span className="text-[10px] text-muted-foreground">{recommendations.length} coordinated items</span>
      </div>

      {recommendations.map((rec, i) => {
        const primary = getAdvisorMeta(rec.primaryAdvisorId);
        const contributors = rec.contributingAdvisors.filter(c => c.role === "supporting");

        return (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card
              className="border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] cursor-pointer hover:border-[hsl(265_55%_58%/0.2)] transition-colors"
              onClick={() => onSelect?.(rec)}
            >
              <CardContent className="p-3">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={rec.category} />
                    <Badge variant={rec.urgency === "critical" ? "destructive" : "secondary"} className="text-[7px] px-1 py-0">
                      {rec.urgency}
                    </Badge>
                    {rec.consensusScore > 1 && (
                      <Badge variant="outline" className="text-[7px] px-1 py-0 border-[hsl(38_85%_58%)] text-[hsl(38_85%_58%)]">
                        <Star className="h-2 w-2 mr-0.5" />
                        {rec.deduplicatedFrom.length} advisors agree
                      </Badge>
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground">{Math.round(rec.confidence * 100)}%</span>
                </div>

                {/* Title & Summary */}
                <h4 className="text-xs font-semibold text-foreground mb-1">{rec.title}</h4>
                <p className="text-[10px] text-muted-foreground mb-2.5">{rec.mergedSummary}</p>

                {/* Advisor Contributions */}
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)]">
                    <span className="text-[10px]">{primary.emoji}</span>
                    <span className="text-[9px] font-medium text-foreground">{primary.displayName}</span>
                    <Badge variant="outline" className="text-[6px] px-0.5 py-0 border-[hsl(265_55%_58%)] text-[hsl(265_55%_58%)]">
                      lead
                    </Badge>
                  </div>
                  {contributors.map(c => {
                    const meta = getAdvisorMeta(c.advisorId);
                    return (
                      <div key={c.advisorId} className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.05)]">
                        <span className="text-[9px]">{meta.emoji}</span>
                        <span className="text-[8px] text-muted-foreground">{meta.displayName}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                {rec.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rec.suggestedActions.slice(0, 3).map((action, j) => (
                      <span key={j} className="text-[8px] text-muted-foreground bg-[hsl(0_0%_100%/0.03)] px-1.5 py-0.5 rounded">
                        → {action}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
