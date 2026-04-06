import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LaunchHonestyBadge, RoleDomainBadge } from "./AIWorkforceBadge";
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

interface LaunchEntry {
  id: string;
  role_id?: string;
  task_id?: string;
  launch_honesty_class: string;
  public_claim_allowed: boolean;
  notes?: string;
  last_verified_at?: string;
  role_name?: string;
  task_name?: string;
  domain?: string;
}

interface Props {
  entries: LaunchEntry[];
}

export function AIWorkforceLaunchTruthBoard({ entries }: Props) {
  const byClass: Record<string, LaunchEntry[]> = {};
  entries.forEach(e => {
    const cls = e.launch_honesty_class || "internal_only";
    if (!byClass[cls]) byClass[cls] = [];
    byClass[cls].push(e);
  });

  const classOrder = ["internal_only", "real_internal", "demo_governed", "partial", "planned"];
  const classIcons: Record<string, React.ReactNode> = {
    internal_only: <Clock className="h-4 w-4 text-muted-foreground" />,
    real_internal: <CheckCircle2 className="h-4 w-4 text-blue-400" />,
    demo_governed: <AlertTriangle className="h-4 w-4 text-amber-400" />,
    partial: <AlertTriangle className="h-4 w-4 text-orange-400" />,
    planned: <XCircle className="h-4 w-4 text-muted-foreground" />,
  };

  return (
    <div className="space-y-4">
      {classOrder.map(cls => {
        const items = byClass[cls] || [];
        if (items.length === 0) return null;
        return (
          <Card key={cls}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {classIcons[cls]}
                {cls.replace(/_/g, " ")} ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                    <div className="flex items-center gap-2">
                      {item.domain && <RoleDomainBadge domain={item.domain} />}
                      <span>{item.role_name || item.task_name || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <LaunchHonestyBadge cls={item.launch_honesty_class} />
                      {item.public_claim_allowed && <Badge variant="outline" className="text-xs text-emerald-500">Public OK</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
      {entries.length === 0 && (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No launch honesty entries configured</CardContent></Card>
      )}
    </div>
  );
}
