import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Route, MousePointer, Eye } from "lucide-react";
import LTSubNav from "@/platform/admin/components/admin/LTSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const LT06RouteInteractionTruth = () => {
  const { data: routeRecords } = useQuery({
    queryKey: ["route-truth-all"],
    queryFn: async () => {
      const { data } = await fromTable("route_truth_records").select("*").order("verified_at", { ascending: false }).limit(200);
      return data ?? [];
    },
  });

  const uniqueRoutes = [...new Set(routeRecords?.map((r: Record<string, any>) => r.route) ?? [])];
  const passingRoutes = uniqueRoutes.filter(route => {
    const latest = routeRecords?.find((r: Record<string, any>) => r.route === route);
    return latest?.status === "pass";
  });

  return (
    <div className="space-y-6 p-6">
      <LTSubNav />
<div>
        <h1 className="text-2xl font-bold">P0 Route & Interaction Truth</h1>
        <p className="text-sm text-muted-foreground">Top critical paths and whether they work</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-1">Verified Routes</div>
            <div className="text-3xl font-bold">{uniqueRoutes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-1">Passing</div>
            <div className="text-3xl font-bold text-green-600">{passingRoutes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-1">Failing</div>
            <div className="text-3xl font-bold text-destructive">{uniqueRoutes.length - passingRoutes.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Route className="h-5 w-5" />Route Truth Grid</CardTitle></CardHeader>
        <CardContent>
          {routeRecords && routeRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground">
                  <th className="p-2">Route</th><th className="p-2">Interaction</th><th className="p-2">Status</th><th className="p-2">Mode</th><th className="p-2">Latency</th><th className="p-2">Verified</th>
                </tr></thead>
                <tbody>
                  {routeRecords.slice(0, 30).map((r: Record<string, any>) => (
                    <tr key={r.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono text-xs">{r.route}</td>
                      <td className="p-2">{r.interaction_type}</td>
                      <td className="p-2"><Badge variant={r.status === "pass" ? "default" : "destructive"}>{r.status}</Badge></td>
                      <td className="p-2"><Badge variant="outline">{r.provider_mode}</Badge></td>
                      <td className="p-2">{r.latency_ms ? `${r.latency_ms}ms` : "—"}</td>
                      <td className="p-2 text-xs text-muted-foreground">{new Date(r.verified_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No route truth records. Run probes or E2E tests to populate.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LT06RouteInteractionTruth;
