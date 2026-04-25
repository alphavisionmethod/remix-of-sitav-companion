import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleDomainBadge, BudgetClassBadge, LaunchHonestyBadge } from "./AIWorkforceBadge";
import { StatusPill } from "./AIWorkforceStatusPill";
import { Bot, DollarSign, Zap } from "lucide-react";

interface Props {
  role: {
    role_key: string;
    display_name: string;
    domain_family?: string;
    budget_class: string;
    launch_honesty_class?: string;
    is_active: boolean;
    total_invocations: number;
    total_cost_cents: number;
    health_state?: string;
  };
  onClick?: () => void;
}

export function AIWorkforceRoleCard({ role, onClick }: Props) {
  return (
    <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            {role.display_name}
          </CardTitle>
          <StatusPill status={role.health_state || "healthy"} type="health" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <RoleDomainBadge domain={role.domain_family || "general"} />
          <BudgetClassBadge budgetClass={role.budget_class} />
          <LaunchHonestyBadge cls={role.launch_honesty_class || "internal_only"} />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {role.total_invocations} runs</span>
          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> ${(role.total_cost_cents / 100).toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
