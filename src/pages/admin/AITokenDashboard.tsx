import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gauge, DollarSign, Cpu, TrendingUp, Users, Zap } from "lucide-react";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function AITokenDashboard() {
  const { isAdmin, loading: adminLoading } = useRequireAdmin();

  const { data: usage } = useQuery({
    queryKey: ["ai-token-usage-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_token_usage")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      return data || [];
    },
    enabled: isAdmin,
  });

  const { data: budgets } = useQuery({
    queryKey: ["ai-budgets-admin"],
    queryFn: async () => {
      const { data } = await supabase.from("user_ai_budgets").select("*");
      return data || [];
    },
    enabled: isAdmin,
  });

  if (adminLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (!isAdmin) return null;

  const records = usage || [];
  const totalTokens = records.reduce((s, r) => s + (r.input_tokens || 0) + (r.output_tokens || 0), 0);
  const totalCost = records.reduce((s, r) => s + (Number(r.cost_cents) || 0), 0);
  const uniqueUsers = new Set(records.map(r => r.user_id)).size;
  const uniqueAdvisors = new Set(records.map(r => r.advisor_id)).size;

  // By advisor breakdown
  const byAdvisor: Record<string, { tokens: number; cost: number; calls: number }> = {};
  records.forEach(r => {
    const a = r.advisor_id || "unknown";
    if (!byAdvisor[a]) byAdvisor[a] = { tokens: 0, cost: 0, calls: 0 };
    byAdvisor[a].tokens += (r.input_tokens || 0) + (r.output_tokens || 0);
    byAdvisor[a].cost += Number(r.cost_cents) || 0;
    byAdvisor[a].calls += 1;
  });

  const advisorList = Object.entries(byAdvisor)
    .sort((a, b) => b[1].cost - a[1].cost)
    .slice(0, 10);

  const maxAdvisorCost = Math.max(...advisorList.map(([, v]) => v.cost), 1);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Gauge className="h-6 w-6 text-primary" /> AI Token Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">Monitor AI spend across all users and advisors</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase">Total Tokens</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{(totalTokens / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase">Total Cost</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${(totalCost / 100).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase">Active Users</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{uniqueUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="h-4 w-4 text-purple-500" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase">Advisors Used</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{uniqueAdvisors}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Advisor */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Cost by Advisor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {advisorList.map(([name, stats]) => (
              <div key={name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground capitalize">{name}</span>
                  <span className="text-muted-foreground">${(stats.cost / 100).toFixed(2)} · {stats.calls} calls</span>
                </div>
                <Progress value={(stats.cost / maxAdvisorCost) * 100} className="h-1.5" />
              </div>
            ))}
            {advisorList.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No usage data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Budgets */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">User Budgets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(budgets || []).slice(0, 10).map(b => {
              const pct = b.limit_cost_cents > 0 ? (Number(b.used_cost_cents) / b.limit_cost_cents) * 100 : 0;
              return (
                <div key={b.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">{b.user_id.slice(0, 8)}...</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">${(Number(b.used_cost_cents) / 100).toFixed(2)} / ${(b.limit_cost_cents / 100).toFixed(2)}</span>
                      {pct > 80 && <Badge variant="destructive" className="text-[9px] px-1">High</Badge>}
                    </div>
                  </div>
                  <Progress value={Math.min(pct, 100)} className="h-1.5" />
                </div>
              );
            })}
            {(!budgets || budgets.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No budgets configured</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
