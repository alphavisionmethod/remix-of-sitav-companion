import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RoleDomainBadge, BudgetClassBadge, AutonomyBadge, LaunchHonestyBadge } from "./AIWorkforceBadge";
import { StatusPill } from "./AIWorkforceStatusPill";
import { Bot, DollarSign, Zap, Clock, TrendingUp, AlertTriangle } from "lucide-react";

interface Props {
  role: any;
  health?: any;
  recentInvocations?: any[];
  open: boolean;
  onClose: () => void;
}

export function AIWorkforceRoleDetailDrawer({ role, health, recentInvocations = [], open, onClose }: Props) {
  if (!role) return null;

  const avgCost = recentInvocations.length > 0
    ? recentInvocations.reduce((s, i) => s + (i.cost_cents || 0), 0) / recentInvocations.length : 0;
  const successRate = recentInvocations.length > 0
    ? Math.round((recentInvocations.filter(i => i.status === "success" || i.status === "completed").length / recentInvocations.length) * 100) : 0;
  const fallbackRate = recentInvocations.length > 0
    ? Math.round((recentInvocations.filter(i => i.fallback_occurred).length / recentInvocations.length) * 100) : 0;

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            {role.display_name}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-1.5">
            <RoleDomainBadge domain={role.domain_family || "general"} />
            <BudgetClassBadge budgetClass={role.budget_class} />
            <AutonomyBadge level={role.autonomy_level || "recommend_only"} />
            <LaunchHonestyBadge cls={role.launch_honesty_class || "internal_only"} />
          </div>

          <p className="text-sm text-muted-foreground">{role.purpose || role.description || "No description"}</p>

          <div className="grid grid-cols-2 gap-3">
            <Card><CardContent className="p-3 text-center"><div className="text-xs text-muted-foreground">Health</div><StatusPill status={health?.health_state || "healthy"} type="health" /></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><div className="text-xs text-muted-foreground">Total Runs</div><div className="text-lg font-bold">{role.total_invocations}</div></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><div className="text-xs text-muted-foreground">Total Cost</div><div className="text-lg font-bold">${(role.total_cost_cents / 100).toFixed(2)}</div></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><div className="text-xs text-muted-foreground">Avg Cost</div><div className="text-lg font-bold">${(avgCost / 100).toFixed(3)}</div></CardContent></Card>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs"><span>Success Rate</span><span>{successRate}%</span></div>
            <Progress value={successRate} className="h-2" />
            <div className="flex justify-between text-xs"><span>Fallback Rate</span><span>{fallbackRate}%</span></div>
            <Progress value={fallbackRate} className="h-2" />
          </div>

          {recentInvocations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {recentInvocations.slice(0, 10).map(inv => (
                  <div key={inv.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/50">
                    <span className="truncate mr-2">{inv.task_type || inv.capability_key}</span>
                    <div className="flex items-center gap-2">
                      <StatusPill status={inv.status} type="invocation" />
                      <span className="font-mono">${((inv.cost_cents || 0) / 100).toFixed(3)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
