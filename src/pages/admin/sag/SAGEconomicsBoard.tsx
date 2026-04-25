import { motion } from "framer-motion";
import { DollarSign, TrendingUp, PieChart, AlertTriangle, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePortfolioAllocations, useTaskRequests, useGatewayStats } from "@/hooks/use-sag-data";
import { ALLOCATION_CLASSES } from "@/lib/sovereign-ai-gateway/types";
import SAGSubNav from "@/platform/admin/components/admin/SAGSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const SAGEconomicsBoard = () => {
  const { data: allocations = [] } = usePortfolioAllocations();
  const { data: tasks = [] } = useTaskRequests();
  const { data: stats } = useGatewayStats();
  const s = stats || { totalCost: 0, totalRequests: 0 };

  const totalBudget = allocations.reduce((s: number,  a: Record<string, any>) => s + (a.budget_cents || 0), 0);
  const totalSpent = allocations.reduce((s: number,  a: Record<string, any>) => s + (a.spent_cents || 0), 0);
  const costPerRequest = s.totalRequests > 0 ? s.totalCost / s.totalRequests : 0;

  // Domain spend
  const domainSpend: Record<string, number> = {};
  tasks.forEach((t: Record<string, any>) => { if (t.domain) domainSpend[t.domain] = (domainSpend[t.domain] || 0) + (t.cost_actual_cents || 0); });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
<SAGSubNav />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="h-6 w-6 text-primary" /> SAG06 — Inference Economics Board</h1>
        <p className="text-muted-foreground mt-1">Manage cost, value, and AI portfolio allocation</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">${(s.totalCost / 100).toFixed(2)}</p><p className="text-xs text-muted-foreground">Total AI Spend</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">${(totalBudget / 100).toFixed(2)}</p><p className="text-xs text-muted-foreground">Total Budget</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{costPerRequest.toFixed(1)}¢</p><p className="text-xs text-muted-foreground">Avg Cost/Request</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : 0}%</p><p className="text-xs text-muted-foreground">Budget Used</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Portfolio Allocation Board</CardTitle></CardHeader>
        <CardContent>
          {allocations.length === 0 ? (
            <div className="grid grid-cols-7 gap-3">
              {ALLOCATION_CLASSES.map(ac => (
                <div key={ac} className="text-center p-3 border rounded-lg">
                  <p className="text-xs font-medium capitalize">{ac.replace(/_/g, ' ')}</p>
                  <p className="text-lg font-bold text-muted-foreground">$0</p>
                  <p className="text-[10px] text-muted-foreground">Not configured</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {allocations.map((a: Record<string, any>) => {
                const pct = a.budget_cents > 0 ? (a.spent_cents / a.budget_cents) * 100 : 0;
                return (
                  <div key={a.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium capitalize">{a.allocation_class?.replace(/_/g, ' ')}{a.domain ? ` · ${a.domain}` : ''}</span>
                      <span>${(a.spent_cents / 100).toFixed(2)} / ${(a.budget_cents / 100).toFixed(2)}</span>
                    </div>
                    <Progress value={Math.min(pct, 100)} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Spend by Domain</CardTitle></CardHeader>
          <CardContent>
            {Object.keys(domainSpend).length === 0 ? <p className="text-sm text-muted-foreground">No domain spend data yet</p> :
              Object.entries(domainSpend).sort((a, b) => b[1] - a[1]).map(([domain, cost]) => (
                <div key={domain} className="flex justify-between py-1 border-b last:border-0">
                  <span className="text-sm">{domain}</span>
                  <Badge variant="outline">{(cost / 100).toFixed(2)}¢</Badge>
                </div>
              ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Premium Spend Justification</CardTitle></CardHeader>
          <CardContent>
            {tasks.filter((t: Record<string, any>) => t.model_chosen?.includes('pro') || t.model_chosen?.includes('premium')).length === 0 ?
              <p className="text-sm text-muted-foreground">No premium model usage yet. Premium models require explicit justification.</p> :
              <div className="space-y-2">
                {tasks.filter((t: Record<string, any>) => t.model_chosen?.includes('pro') || t.model_chosen?.includes('premium')).slice(0, 5).map((t: Record<string, any>) => (
                  <div key={t.id} className="flex justify-between text-sm">
                    <span>{t.capability_id || t.task_class}</span>
                    <Badge variant="outline">{t.cost_actual_cents}¢</Badge>
                  </div>
                ))}
              </div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SAGEconomicsBoard;
