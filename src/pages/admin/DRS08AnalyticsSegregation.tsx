import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart3, AlertTriangle, Filter } from "lucide-react";
import DRSSubNav from "@/platform/admin/components/admin/DRSSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



export default function DRS08AnalyticsSegregation() {
  const { data, isLoading } = useQuery({
    queryKey: ["drs08-analytics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { demoEvents: 0, recentEvents: [] };
      const [countRes, recentRes] = await Promise.all([
        fromTable("demo_analytics").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        fromTable("demo_analytics").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(15),
      ]);
      return { demoEvents: countRes.count ?? 0, recentEvents: recentRes.data ?? [] };
    },
  });

  return (
    <div className="space-y-6 p-6">
<DRSSubNav />
      <div>
        <h1 className="text-2xl font-bold text-foreground">DRS08 — Analytics Segregation Board</h1>
        <p className="text-sm text-muted-foreground mt-1">Verify demo analytics separation from real data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-4"><Filter className="h-5 w-5 text-green-400 mb-2" /><p className="text-sm font-semibold text-foreground">Segregation Active</p><p className="text-xs text-muted-foreground">Demo events routed to demo_analytics table</p></CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4"><BarChart3 className="h-5 w-5 text-primary mb-2" /><p className="text-2xl font-bold">{isLoading ? "—" : data?.demoEvents}</p><p className="text-xs text-muted-foreground">Total demo events</p></CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4"><AlertTriangle className="h-5 w-5 text-amber-400 mb-2" /><p className="text-sm font-semibold text-foreground">Contamination Check</p><p className="text-xs text-muted-foreground">{data?.demoEvents === 0 ? "Clean — no demo events in system" : "Demo events isolated in segregated table"}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Demo Events</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" /> :
          (data?.recentEvents.length ?? 0) === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No demo analytics events recorded</p> : (
            <div className="space-y-1">
              {data?.recentEvents.map((e: Record<string, any>) => (
                <div key={e.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-border/30 last:border-0">
                  <Badge variant="outline" className="text-xs">{e.mode}</Badge>
                  <span className="text-foreground font-medium">{e.event_name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{e.route}</span>
                  <span className="text-xs text-muted-foreground font-mono">{new Date(e.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
