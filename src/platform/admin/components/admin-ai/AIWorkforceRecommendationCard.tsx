import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleDomainBadge, RiskTierBadge, BudgetClassBadge } from "./AIWorkforceBadge";
import { StatusPill } from "./AIWorkforceStatusPill";
import { Lightbulb, ChevronRight, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Recommendation {
  id: string;
  title: string;
  severity: string;
  risk_tier?: string;
  recommendation_type?: string;
  domain?: string;
  status: string;
  estimated_impact?: string;
  budget_impact_class?: string;
  created_at: string;
}

interface Props {
  recommendation: Recommendation;
  onAccept?: () => void;
  onReject?: () => void;
  onDefer?: () => void;
  onDetail?: () => void;
}

export function AIWorkforceRecommendationCard({ recommendation, onAccept, onReject, onDefer, onDetail }: Props) {
  const r = recommendation;
  const isHighRisk = r.risk_tier === "critical" || r.risk_tier === "elevated" || r.severity === "critical" || r.severity === "high";

  return (
    <Card className={isHighRisk ? "border-destructive/30" : undefined}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lightbulb className={`h-4 w-4 ${isHighRisk ? "text-destructive" : "text-amber-500"}`} />
            {r.title}
          </CardTitle>
          <StatusPill status={r.status} type="recommendation" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {r.domain && <RoleDomainBadge domain={r.domain} />}
          {r.risk_tier && <RiskTierBadge tier={r.risk_tier} />}
          {r.budget_impact_class && <BudgetClassBadge budgetClass={r.budget_impact_class} />}
          <Badge variant="outline" className="text-xs">{r.severity}</Badge>
          {r.recommendation_type && <Badge variant="secondary" className="text-xs">{r.recommendation_type.replace(/_/g, " ")}</Badge>}
        </div>

        {r.estimated_impact && (
          <p className="text-xs text-muted-foreground">{r.estimated_impact}</p>
        )}

        <div className="flex items-center gap-2">
          {r.status === "new" || r.status === "reviewing" ? (
            <>
              <Button size="sm" variant="default" className="h-7 text-xs" onClick={onAccept}>
                <CheckCircle2 className="h-3 w-3 mr-1" /> Accept
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onReject}>Reject</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onDefer}>Defer</Button>
            </>
          ) : null}
          <Button size="sm" variant="ghost" className="h-7 text-xs ml-auto" onClick={onDetail}>
            Detail <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
