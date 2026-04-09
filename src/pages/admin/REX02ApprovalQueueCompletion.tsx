import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle2, ShieldAlert, Timer } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useDataMode } from "@/contexts/DataModeContext";



function useApprovalQueueStats() {
  return useQuery({
    queryKey: ["rex02-approval-queue-stats"],
    queryFn: async () => {
      const { data, error } = await fromTable("ai_workforce_approval_queue")
        .select("status, risk_tier, created_at, resolved_at, updated_at");
      if (error) throw error;
      const items = data || [];
      const pending = items.filter((i: Record<string, any>) => i.status === "pending");
      const highRiskPending = pending.filter((i: Record<string, any>) => i.risk_tier === "critical" || i.risk_tier === "elevated");
      const resolved = items.filter((i: Record<string, any>) => i.resolved_at);
      const avgLatencyMs = resolved.length > 0
        ? resolved.reduce((acc: number,  i: Record<string, any>) => {
            const created = new Date(i.created_at).getTime();
            const resolvedAt = new Date(i.resolved_at).getTime();
            return acc + (resolvedAt - created);
          }, 0) / resolved.length
        : 0;
      const aging = pending.filter((i: Record<string, any>) => {
        const age = Date.now() - new Date(i.created_at).getTime();
        return age > 24 * 60 * 60 * 1000; // older than 24h
      });
      return {
        total: items.length,
        pending: pending.length,
        highRiskPending: highRiskPending.length,
        resolved: resolved.length,
        aging: aging.length,
        avgLatencyHours: Math.round(avgLatencyMs / (1000 * 60 * 60) * 10) / 10,
        items: pending.slice(0, 10),
      };
    },
    staleTime: 15_000,
  });
}

export default function REX02ApprovalQueueCompletion() {
  const { isDemoMode } = useDataMode();
  const { data: stats, isLoading } = useApprovalQueueStats();

  const cards = [
    { label: "Pending", value: stats?.pending || 0, icon: Clock, color: "text-amber-400" },
    { label: "High-Risk Pending", value: stats?.highRiskPending || 0, icon: ShieldAlert, color: "text-destructive" },
    { label: "Aging (>24h)", value: stats?.aging || 0, icon: AlertTriangle, color: "text-orange-400" },
    { label: "Resolved", value: stats?.resolved || 0, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Avg Decision (hrs)", value: stats?.avgLatencyHours || 0, icon: Timer, color: "text-blue-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">REX02 — Approval Queue Completion</h1>
        <p className="text-muted-foreground">Queue health, aging, bottlenecks, and decision latency.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <card.icon className={`h-5 w-5 mx-auto mb-2 ${card.color}`} />
              <p className="text-2xl font-bold text-foreground">{isLoading ? "—" : card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-foreground">Pending Items (Top 10)</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (stats?.items || []).length === 0 ? (
            <p className="text-muted-foreground">No pending items.</p>
          ) : (
            <div className="space-y-2">
              {(stats?.items || []).map((item: Record<string, any>) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.action_type || "Unknown action"}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant={item.risk_tier === "critical" ? "destructive" : "outline"}>
                    {item.risk_tier || "standard"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
