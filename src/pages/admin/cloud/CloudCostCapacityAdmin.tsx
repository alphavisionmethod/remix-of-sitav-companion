import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, HardDrive, Users, BarChart3, Layers } from "lucide-react";
import { cloudLifecycleService } from "@/lib/cloud-backbone/cloud-lifecycle-service";
import { cloudStorageService } from "@/lib/cloud-backbone/cloud-storage-service";
import type { StorageTier } from "@/lib/cloud-backbone/cloud-lifecycle-service";

export function CloudCostCapacityAdmin() {
  const [tiers, setTiers] = useState<StorageTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cloudLifecycleService.getTiers().then(t => { setTiers(t); setLoading(false); });
  }, []);

  const storageHealth = cloudStorageService.getHealthReport();
  const usagePct = storageHealth.totalQuotaBytes > 0
    ? Math.round((storageHealth.totalUsedBytes / storageHealth.totalQuotaBytes) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cost & Capacity</h1>
          <p className="text-sm text-muted-foreground">Storage costs, growth trends, per-plan capacity</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Storage", value: cloudStorageService.formatBytes(storageHealth.totalUsedBytes), icon: HardDrive },
          { label: "Active Users", value: storageHealth.totalUsers, icon: Users },
          { label: "Usage", value: `${usagePct}%`, icon: BarChart3 },
          { label: "Tiers Active", value: tiers.filter(t => t.status === "active").length, icon: Layers },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Capacity Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-primary" /> Platform Capacity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Used: {cloudStorageService.formatBytes(storageHealth.totalUsedBytes)}</span>
              <span className="font-medium">Quota: {cloudStorageService.formatBytes(storageHealth.totalQuotaBytes)}</span>
            </div>
            <Progress value={usagePct} className="h-3" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
              <p className="text-xs text-muted-foreground">Projected 30-day growth</p>
              <p className="text-lg font-bold text-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-emerald-400" /> +12.3%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
              <p className="text-xs text-muted-foreground">Est. Monthly Cost</p>
              <p className="text-lg font-bold text-foreground">$142.50</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Costs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Storage Tier Costs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tiers.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${t.tier_key === "hot" ? "bg-red-400" : t.tier_key === "warm" ? "bg-amber-400" : t.tier_key === "cold" ? "bg-blue-400" : "bg-cyan-400"}`} />
                <div>
                  <p className="text-sm font-medium">{t.display_name}</p>
                  <p className="text-xs text-muted-foreground">Retrieval: {t.retrieval_latency_ms < 1000 ? `${t.retrieval_latency_ms}ms` : `${(t.retrieval_latency_ms / 3600000).toFixed(1)}h`}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">${(t.cost_per_gb_cents / 100).toFixed(3)}/GB</p>
                <Badge variant={t.status === "active" ? "default" : "secondary"} className="text-xs">{t.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
