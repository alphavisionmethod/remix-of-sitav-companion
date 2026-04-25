import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, Shield, Layers, BarChart3, Activity } from "lucide-react";
import DRSSubNav from "@/platform/admin/components/admin/DRSSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



function useModeSummary() {
  return useQuery({
    queryKey: ["drs-overview"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const [resolutions, scenarios, providers, policies] = await Promise.all([
        fromTable("reality_mode_resolutions").select("resolved_mode, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
        fromTable("demo_scenarios").select("id, name, status, active, category").eq("user_id", user.id),
        fromTable("mode_aware_providers").select("domain, current_version").eq("user_id", user.id),
        fromTable("demo_policy_profiles").select("id, name, ai_execution_mode").eq("user_id", user.id),
      ]);
      const modeDistribution: Record<string, number> = {};
      for (const r of resolutions.data ?? []) {
        modeDistribution[r.resolved_mode] = (modeDistribution[r.resolved_mode] ?? 0) + 1;
      }
      return { modeDistribution, scenarios: scenarios.data ?? [], providers: providers.data ?? [], policies: policies.data ?? [], recentResolutions: (resolutions.data ?? []).slice(0, 10) };
    },
    staleTime: 30_000,
  });
}

export default function DRS01RealityModeOverview() {
  const { data, isLoading } = useModeSummary();
  if (isLoading) return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const total = Object.values(data?.modeDistribution ?? {}).reduce((s, n) => s + n, 0);

  return (
    <div className="space-y-6 p-6">
<DRSSubNav />
      <div>
        <h1 className="text-2xl font-bold text-foreground">DRS01 — Reality Mode Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Executive overview of real vs demo runtime</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {["real", "demo", "sandbox", "dev_demo"].map(mode => (
          <Card key={mode}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <div className={`h-2 w-2 rounded-full ${mode === "real" ? "bg-green-400" : mode === "demo" ? "bg-amber-400" : "bg-blue-400"}`} />
                <span className="text-sm font-semibold text-foreground capitalize">{mode.replace("_", " ")}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{data?.modeDistribution[mode] ?? 0}</p>
              <p className="text-xs text-muted-foreground">resolutions ({total > 0 ? Math.round(((data?.modeDistribution[mode] ?? 0) / total) * 100) : 0}%)</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Layers className="h-4 w-4" /> Scenarios</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data?.scenarios.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">{data?.scenarios.filter((s: Record<string, any>) => s.active).length ?? 0} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4" /> Providers</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data?.providers.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">domains registered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Policy Profiles</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data?.policies.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">demo safety profiles</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" /> Recent Mode Resolutions</CardTitle></CardHeader>
        <CardContent>
          {(data?.recentResolutions?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No mode resolutions recorded yet</p>
          ) : (
            <div className="space-y-1">
              {data?.recentResolutions.map((r: any, i: number) => (
                <div key={i} className="flex items-center gap-3 text-sm py-1 border-b border-border/30 last:border-0">
                  <Badge variant="outline" className="text-xs">{r.resolved_mode}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">{new Date(r.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
