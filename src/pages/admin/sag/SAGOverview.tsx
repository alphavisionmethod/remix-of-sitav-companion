import { motion } from "framer-motion";
import { Brain, Zap, DollarSign, Shield, RotateCcw, Database, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGatewayStats, useTaskRequests, useProviderHealth } from "@/modules/business/hooks/use-sag-data";
import SAGSubNav from "@/platform/admin/components/admin/SAGSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const SAGOverview = () => {
  const { data: stats } = useGatewayStats();
  const { data: tasks = [] } = useTaskRequests();
  const { data: health = [] } = useProviderHealth();
  const s = stats || { totalRequests: 0, totalCost: 0, cacheHitRate: 0, fallbackRate: 0, providers: {}, premiumRate: 0, violations: 0, receipts: 0 };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
<SAGSubNav />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-primary" /> SAG01 — Sovereign AI Gateway Overview</h1>
        <p className="text-muted-foreground mt-1">Executive overview of the multi-provider inference runtime</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: s.totalRequests, icon: Zap, color: 'text-primary' },
          { label: 'Total Cost', value: `$${(s.totalCost / 100).toFixed(2)}`, icon: DollarSign, color: 'text-green-500' },
          { label: 'Cache/Reuse Rate', value: `${(s.cacheHitRate * 100).toFixed(0)}%`, icon: Database, color: 'text-blue-500' },
          { label: 'Premium Usage', value: `${(s.premiumRate * 100).toFixed(0)}%`, icon: TrendingUp, color: 'text-orange-500' },
        ].map((m, i) => (
          <Card key={i}><CardContent className="pt-4 flex items-center gap-3">
            <m.icon className={`h-5 w-5 ${m.color}`} />
            <div><p className="text-2xl font-bold">{m.value}</p><p className="text-xs text-muted-foreground">{m.label}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Provider Distribution</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(s.providers).length === 0 ? <p className="text-sm text-muted-foreground">No requests yet</p> :
              Object.entries(s.providers).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([p, count]) => (
                <div key={p} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{p}</span>
                  <Badge variant="outline">{count as number}</Badge>
                </div>
              ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Efficiency Metrics</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><div className="flex justify-between text-sm mb-1"><span>Cache Hit Rate</span><span>{(s.cacheHitRate * 100).toFixed(0)}%</span></div><Progress value={s.cacheHitRate * 100} className="h-2" /></div>
            <div><div className="flex justify-between text-sm mb-1"><span>Fallback Rate</span><span>{(s.fallbackRate * 100).toFixed(0)}%</span></div><Progress value={s.fallbackRate * 100} className="h-2" /></div>
            <div><div className="flex justify-between text-sm mb-1"><span>Premium Usage</span><span>{(s.premiumRate * 100).toFixed(0)}%</span></div><Progress value={s.premiumRate * 100} className="h-2" /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">System Health</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm"><span>Provider Health Records</span><Badge variant="outline">{health.length}</Badge></div>
            <div className="flex justify-between text-sm"><span>Inference Receipts</span><Badge variant="outline">{s.receipts}</Badge></div>
            <div className="flex justify-between text-sm"><span>Active Violations</span><Badge variant={s.violations > 0 ? "destructive" : "outline"}>{s.violations}</Badge></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Inference Activity</CardTitle></CardHeader>
        <CardContent>
          {tasks.length === 0 ? <p className="text-center py-6 text-muted-foreground">No AI task requests yet. All inference will be tracked here.</p> :
            <div className="space-y-2">
              {tasks.slice(0, 10).map((t: Record<string, any>) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-primary" />
                    <span className="text-sm font-medium">{t.capability_id || t.task_class}</span>
                    <span className="text-xs text-muted-foreground">{t.provider_chosen}/{t.model_chosen}</span>
                  </div>
                  <div className="flex gap-2">
                    {t.cache_hit && <Badge className="bg-blue-500/10 text-blue-500 text-xs">Cached</Badge>}
                    {t.fallback_used && <Badge className="bg-yellow-500/10 text-yellow-500 text-xs">Fallback</Badge>}
                    <Badge variant="outline" className="text-xs">{t.cost_actual_cents}¢</Badge>
                    <Badge variant="outline" className="text-xs">{t.status}</Badge>
                  </div>
                </div>
              ))}
            </div>}
        </CardContent>
      </Card>
    </div>
  );
};

export default SAGOverview;
