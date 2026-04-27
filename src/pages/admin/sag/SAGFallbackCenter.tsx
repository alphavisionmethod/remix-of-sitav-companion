import { motion } from "framer-motion";
import { Shield, ArrowRight, AlertTriangle, Wifi, WifiOff, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRoutingPolicies, useProviderHealth, useTaskRequests } from "@/modules/business/hooks/use-sag-data";
import { PROVIDERS } from "@/lib/sovereign-ai-gateway/types";
import SAGSubNav from "@/platform/admin/components/admin/SAGSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
const SAGFallbackCenter = () => {
  const { data: policies = [] } = useRoutingPolicies();
  const { data: health = [] } = useProviderHealth();
  const { data: tasks = [] } = useTaskRequests();
  const fallbackTasks = tasks.filter((t: Record<string, any>) => t.fallback_used);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
<SAGSubNav />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-primary" /> SAG10 — Fallback & Continuity Center</h1>
        <p className="text-muted-foreground mt-1">Inspect continuity strategies and provider resilience</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{policies.filter((p: Record<string, any>) => p.fallback_provider || p.fallback_chain?.length > 0).length}</p><p className="text-xs text-muted-foreground">Policies with Fallback</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{fallbackTasks.length}</p><p className="text-xs text-muted-foreground">Fallback Activations</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-green-500">{health.filter((h: Record<string, any>) => (h.availability || 0) >= 0.99).length}</p><p className="text-xs text-muted-foreground">Healthy Providers</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-destructive">{health.filter((h: Record<string, any>) => h.incident_status !== 'none').length}</p><p className="text-xs text-muted-foreground">Provider Incidents</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Fallback Strategy Types</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {([] as any[]).map(s => (
              <div key={s.id} className="p-3 border rounded-lg text-center">
                <span className="text-2xl">{s.icon}</span>
                <p className="text-xs font-medium mt-1">{s.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Provider Failover Status</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {PROVIDERS.filter(p => p.id !== 'local' && p.id !== 'specialist').map(provider => {
              const h = health.find((r: Record<string, any>) => r.provider === provider.id);
              const isHealthy = !h || Number((h as Record<string, unknown>).availability) >= 0.95;
              return (
                <div key={provider.id} className={`p-3 border rounded-lg ${isHealthy ? 'border-green-500/30' : 'border-destructive/30'}`}>
                  <div className="flex items-center gap-2">
                    {isHealthy ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-destructive" />}
                    <span className="font-medium text-sm">{provider.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{isHealthy ? 'Operational' : 'Degraded'}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-semibold">Recent Fallback Activations</h2>
        {fallbackTasks.length === 0 ?
          <Card><CardContent className="py-8 text-center text-muted-foreground">No fallback activations recorded. Fallbacks activate when primary providers are unavailable.</CardContent></Card> :
          fallbackTasks.slice(0, 10).map((t: Record<string, any>) => (
            <Card key={t.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-yellow-500" /><span className="text-sm">{t.capability_id || t.task_class}</span></div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">Primary: {t.provider_chosen}</Badge>
                  <Badge className="bg-yellow-500/10 text-yellow-500 text-xs">Fallback: {t.fallback_provider}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default SAGFallbackCenter;
