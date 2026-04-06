// ═══════════════════════════════════════════════════════════════
// SITA OS — AIT01: AI Team Overview Board
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getWorkforceRoles, getRecentInvocations, getWorkforceStats } from "@/lib/services/ai-workforce/workforce-orchestrator";
import { Bot, DollarSign, Zap, Clock, Shield, Activity } from "lucide-react";

export default function AIT01TeamOverview() {
  const { data: stats } = useQuery({
    queryKey: ["ai-workforce-stats"],
    queryFn: getWorkforceStats,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["ai-workforce-roles"],
    queryFn: getWorkforceRoles,
  });

  const { data: invocations = [] } = useQuery({
    queryKey: ["ai-workforce-invocations"],
    queryFn: () => getRecentInvocations(20),
  });

  const metrics = [
    { label: "Active Roles", value: stats?.activeRoles ?? 0, icon: Bot, color: "text-primary" },
    { label: "Total Invocations", value: stats?.totalInvocations ?? 0, icon: Zap, color: "text-amber-400" },
    { label: "Completed", value: stats?.completedCount ?? 0, icon: Activity, color: "text-emerald-400" },
    { label: "Pending", value: stats?.pendingCount ?? 0, icon: Clock, color: "text-muted-foreground" },
    { label: "Total Cost", value: `$${((stats?.totalCostCents ?? 0) / 100).toFixed(2)}`, icon: DollarSign, color: "text-amber-400" },
    { label: "Avg Latency", value: `${stats?.avgLatencyMs ?? 0}ms`, icon: Shield, color: "text-blue-400" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" /> AIT01 — AI Team Overview
        </h1>
        <p className="text-muted-foreground mt-1">Internal AI engineering workforce status and activity</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4 text-center">
              <m.icon className={`h-5 w-5 mx-auto mb-1 ${m.color}`} />
              <div className="text-xl font-bold">{m.value}</div>
              <div className="text-xs text-muted-foreground">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">AI Workforce Roles</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {roles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No roles registered yet. Seed workforce roles to begin.</p>
            ) : roles.map(r => (
              <div key={r.id} className="flex items-center justify-between p-2 rounded border">
                <div>
                  <div className="font-medium text-sm">{r.display_name}</div>
                  <div className="text-xs text-muted-foreground">{r.purpose.slice(0, 60)}</div>
                </div>
                <div className="flex gap-1">
                  <Badge variant={r.is_active ? "default" : "secondary"} className="text-xs">
                    {r.launch_stage}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{r.default_model_tier}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {invocations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invocations yet. The AI team is idle.</p>
            ) : invocations.slice(0, 10).map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-2 rounded border">
                <div>
                  <div className="font-medium text-sm">{inv.role_key} → {inv.task_type}</div>
                  <div className="text-xs text-muted-foreground">{inv.output_summary?.slice(0, 50) ?? "Pending..."}</div>
                </div>
                <Badge variant={inv.status === "completed" ? "default" : inv.status === "failed" ? "destructive" : "secondary"} className="text-xs">
                  {inv.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
