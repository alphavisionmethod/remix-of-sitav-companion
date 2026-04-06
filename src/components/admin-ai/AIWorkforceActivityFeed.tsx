import { StatusPill } from "./AIWorkforceStatusPill";
import { BudgetClassBadge } from "./AIWorkforceBadge";
import { Clock, DollarSign, Zap, AlertTriangle } from "lucide-react";

interface InvocationItem {
  id: string;
  role_key: string;
  task_type?: string;
  status: string;
  budget_class?: string;
  cost_cents?: number;
  tokens_used?: number;
  latency_ms?: number;
  fallback_occurred?: boolean;
  used_cached_output?: boolean;
  created_at: string;
}

interface Props {
  invocations: InvocationItem[];
  maxItems?: number;
}

export function AIWorkforceActivityFeed({ invocations, maxItems = 20 }: Props) {
  const items = invocations.slice(0, maxItems);

  return (
    <div className="space-y-1.5">
      {items.map(inv => (
        <div key={inv.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <StatusPill status={inv.status} type="invocation" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {inv.role_key?.replace(/_/g, " ")} → {inv.task_type?.replace(/_/g, " ") || "task"}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(inv.created_at).toLocaleString()}
                {inv.used_cached_output && <span className="text-emerald-500">• cached</span>}
                {inv.fallback_occurred && <span className="text-amber-500">• fallback</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs shrink-0">
            {inv.budget_class && <BudgetClassBadge budgetClass={inv.budget_class} />}
            <span className="font-mono flex items-center gap-0.5">
              <DollarSign className="h-3 w-3" />{((inv.cost_cents || 0) / 100).toFixed(3)}
            </span>
            {inv.latency_ms != null && (
              <span className="font-mono text-muted-foreground">{inv.latency_ms}ms</span>
            )}
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="text-center text-muted-foreground py-8 text-sm">No activity yet</div>
      )}
    </div>
  );
}
