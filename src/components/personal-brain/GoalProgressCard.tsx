import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import type { PbGoal } from "./hooks/usePbGoals";

interface GoalProgressCardProps {
  goals: PbGoal[];
  loading: boolean;
}

export function GoalProgressCard({ goals, loading }: GoalProgressCardProps) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Target className="h-4 w-4 text-primary" />
            Active goals
          </h2>
          <Badge variant="outline" className="text-[10px]">
            {goals.length}
          </Badge>
        </div>
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading goals…</p>
        ) : goals.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No active goals yet. Goals captured in onboarding land here.
          </p>
        ) : (
          <ul className="space-y-3">
            {goals.slice(0, 5).map((g) => (
              <li key={g.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-medium text-foreground">{g.title}</span>
                  <span className="text-muted-foreground">{g.progress_pct}%</span>
                </div>
                <Progress value={g.progress_pct} className="h-1.5" />
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground capitalize">
                  <span>{g.kind}</span>
                  <span>·</span>
                  <span>{g.horizon_days}-day horizon</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}