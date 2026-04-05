import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertOctagon, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LaunchBlocker { id: string; title: string; severity: "critical" | "high" | "medium"; domain: string; resolved: boolean; evidence?: string }
interface Props { blockers: LaunchBlocker[]; className?: string }

export function LaunchBlockerPanel({ blockers, className }: Props) {
  const active = blockers.filter(b => !b.resolved);
  return (
    <Card className={cn("bg-card/50 border-border/50", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-2">
          <AlertOctagon className={cn("w-4 h-4", active.length > 0 ? "text-red-400" : "text-green-400")} />
          Launch Blockers ({active.length} active)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {blockers.map(b => (
          <div key={b.id} className={cn("flex items-center justify-between p-2 rounded", b.resolved ? "bg-green-500/5" : "bg-red-500/5")}>
            <div className="flex items-center gap-2">
              {b.resolved ? <CheckCircle className="w-3 h-3 text-green-400" /> : <AlertOctagon className="w-3 h-3 text-red-400" />}
              <div>
                <p className="text-[10px] font-medium text-foreground">{b.title}</p>
                <p className="text-[9px] text-muted-foreground">{b.domain}{b.evidence ? ` • ${b.evidence}` : ""}</p>
              </div>
            </div>
            <Badge variant={b.resolved ? "default" : "destructive"} className="text-[8px] capitalize">{b.severity}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
