import RCPSubNav from "@/components/admin/RCPSubNav";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRouteHeatmapData, type RealityState, type LaunchCriticality } from "@/runtimes/reality/reality-audit-registry";

const stateColors: Record<RealityState, string> = {
  presentational: "bg-red-500/20 border-red-500/40 text-red-400",
  simulated: "bg-amber-500/20 border-amber-500/40 text-amber-400",
  persisted: "bg-blue-500/20 border-blue-500/40 text-blue-400",
  proven: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
};

const stateDots: Record<RealityState, string> = {
  presentational: "bg-red-500",
  simulated: "bg-amber-500",
  persisted: "bg-blue-500",
  proven: "bg-emerald-500",
};

const RCP07RouteHeatmap = () => {
  const navigate = useNavigate();
  const heatmap = useMemo(() => getRouteHeatmapData(), []);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <RCPSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Map className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Route Reality Heatmap</h1>
          <p className="text-sm text-muted-foreground">Visual map of all routes by domain, color-coded by reality state</p>
        </div>
      </div>

      {/* CriticalityLegend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {(["presentational", "simulated", "persisted", "proven"] as RealityState[]).map(s => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${stateDots[s]}`} />
            <span className="capitalize">{s}</span>
          </div>
        ))}
        <div className="border-l border-border pl-4 flex items-center gap-3">
          <span className="flex items-center gap-1"><Badge variant="destructive" className="text-[9px] h-4">P0</Badge> Launch blocker</span>
          <span className="flex items-center gap-1"><Badge variant="secondary" className="text-[9px] h-4">P1</Badge> Important</span>
          <span className="flex items-center gap-1"><Badge variant="outline" className="text-[9px] h-4">P2</Badge> Low priority</span>
        </div>
      </div>

      {/* RouteHeatmapCanvas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {heatmap.map(({ domain, routes }) => {
          const count = routes.filter(r => r.hasMock).length;
          return (
            <Card key={domain} className={count === routes.length ? "border-red-500/20" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm capitalize">{domain}</CardTitle>
                  {count > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400">
                      <AlertTriangle className="h-3 w-3" /> {count} mock-backed
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {routes.map(r => (
                    <div key={r.route}
                      className={`flex items-center justify-between p-2 rounded border cursor-pointer hover:opacity-80 transition-opacity ${stateColors[r.state]}`}
                      onClick={() => navigate("/admin/reality-audit")}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${stateDots[r.state]}`} />
                        <div>
                          <div className="text-xs font-medium">{r.name}</div>
                          <div className="text-[10px] font-mono opacity-70">{r.route}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {r.hasMock && <AlertTriangle className="h-3 w-3 text-amber-400" />}
                        <Badge variant={r.criticality === "P0" ? "destructive" : r.criticality === "P1" ? "secondary" : "outline"} className="text-[9px] h-4">{r.criticality}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* LaunchImpactOverlay */}
      <Card className="border-red-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400" /> Launch Impact Overlay — P0 Mock-Backed Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {heatmap.flatMap(h => h.routes).filter(r => r.criticality === "P0" && r.hasMock).map(r => (
              <div key={r.route} className="p-2 rounded bg-red-500/10 border border-red-500/20 text-center">
                <div className="text-xs font-medium">{r.name}</div>
                <div className="text-[10px] font-mono text-muted-foreground">{r.route}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RCP07RouteHeatmap;
