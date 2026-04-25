import { motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle2, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProviderHealth } from "@/hooks/use-sag-data";
import { PROVIDERS } from "@/lib/sovereign-ai-gateway/types";
import SAGSubNav from "@/platform/admin/components/admin/SAGSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const SAGProviderHealth = () => {
  const { data: health = [], isLoading } = useProviderHealth();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
<SAGSubNav />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6 text-primary" /> SAG04 — Provider Adapter Health Center</h1>
        <p className="text-muted-foreground mt-1">Monitor runtime health of all AI providers and models</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{health.length}</p><p className="text-xs text-muted-foreground">Health Records</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-green-500">{health.filter((h: Record<string, any>) => (h.availability || 0) >= 0.99).length}</p><p className="text-xs text-muted-foreground">Healthy Providers</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-destructive">{health.filter((h: Record<string, any>) => h.incident_status !== 'none').length}</p><p className="text-xs text-muted-foreground">Active Incidents</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {PROVIDERS.map(provider => {
          const records = health.filter((h: Record<string, any>) => h.provider === provider.id);
          const avgAvail = records.length ? records.reduce((s: number,  r: Record<string, any>) => s + (r.availability || 0), 0) / records.length : 1;
          const hasIncident = records.some((r: Record<string, any>) => r.incident_status !== 'none');
          return (
            <Card key={provider.id} className={hasIncident ? 'border-destructive/30' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  {avgAvail >= 0.95 ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-destructive" />}
                  {provider.name}
                  {hasIncident && <Badge variant="destructive" className="text-xs">Incident</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm"><span>Availability</span><span>{(avgAvail * 100).toFixed(1)}%</span></div>
                <Progress value={avgAvail * 100} className="h-2" />
                {records.length > 0 ? records.map((r: Record<string, any>) => (
                  <div key={r.id} className="text-xs text-muted-foreground border-t pt-2 mt-2 space-y-1">
                    <div className="flex justify-between"><span>Model: {r.model || 'all'}</span><span>Latency: {r.avg_latency_ms?.toFixed(0) || '—'}ms</span></div>
                    <div className="flex justify-between"><span>Error Rate: {((r.error_rate || 0) * 100).toFixed(1)}%</span><span>Rate Limit: {((r.rate_limit_pressure || 0) * 100).toFixed(0)}%</span></div>
                    <div className="flex justify-between"><span>Requests: {r.total_requests || 0}</span><span>Structured: {((r.structured_output_success_rate || 0) * 100).toFixed(0)}%</span></div>
                  </div>
                )) : <p className="text-xs text-muted-foreground">No health data yet</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SAGProviderHealth;
