import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreItem { name: string; status: "pass" | "fail" | "pending"; weight: number }
interface Props { title: string; items: ScoreItem[]; className?: string }

export function ValidationScorecard({ title, items, className }: Props) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  const passed = items.filter(i => i.status === "pass").reduce((s, i) => s + i.weight, 0);
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
  const icons = { pass: CheckCircle, fail: XCircle, pending: Clock };
  const colors = { pass: "text-green-400", fail: "text-red-400", pending: "text-muted-foreground" };

  return (
    <Card className={cn("bg-card/50 border-border/50", className)}>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground">{title}</p>
          <span className={cn("text-sm font-bold", pct >= 80 ? "text-green-400" : pct >= 50 ? "text-amber-400" : "text-red-400")}>{pct}%</span>
        </div>
        <Progress value={pct} className="h-1.5" />
        <div className="space-y-1">
          {items.map(item => {
            const Icon = icons[item.status];
            return (
              <div key={item.name} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <Icon className={cn("w-2.5 h-2.5", colors[item.status])} />
                  <span className="text-foreground">{item.name}</span>
                </div>
                <span className="text-muted-foreground">w:{item.weight}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
