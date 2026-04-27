import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRealityClassifications } from "@/platform/runtime/hooks/useRealityClassifications";
import { Map, Eye, Cpu, Shield, CheckCircle2 } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const STATE_BG: Record<string, string> = {
  presentational: "bg-muted/60 border-muted-foreground/20",
  simulated: "bg-yellow-500/15 border-yellow-500/30",
  persisted: "bg-blue-500/15 border-blue-500/30",
  proven: "bg-emerald-500/15 border-emerald-500/30",
};
const STATE_TEXT: Record<string, string> = { presentational: "text-muted-foreground", simulated: "text-yellow-400", persisted: "text-blue-400", proven: "text-emerald-400" };

export default function RouteRealityHeatmap() {
  const { data: classifications = [] } = useRealityClassifications();

  const domainGroups = useMemo(() => {
    const map: Record<string, typeof classifications> = {};
    classifications.forEach(c => {
      if (!map[c.domain]) map[c.domain] = [];
      map[c.domain].push(c);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [classifications]);

  return (
    <div className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold">Route Reality Heatmap</h1>
        <p className="text-sm text-muted-foreground">Visual map of all routes by reality state — RCP07</p>
      </div>

      {/* Legend */}
      <div className="flex gap-4">
        {[
          { state: "presentational", icon: Eye, label: "Presentational" },
          { state: "simulated", icon: Cpu, label: "Simulated" },
          { state: "persisted", icon: Shield, label: "Persisted" },
          { state: "proven", icon: CheckCircle2, label: "Proven" },
        ].map(l => (
          <div key={l.state} className={`flex items-center gap-1 text-xs ${STATE_TEXT[l.state]}`}>
            <l.icon className="h-3 w-3" />{l.label}
          </div>
        ))}
      </div>

      {domainGroups.length === 0 && (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No classifications yet — add features in the Reality Matrix</CardContent></Card>
      )}

      {domainGroups.map(([domain, items]) => (
        <Card key={domain}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Map className="h-4 w-4" />{domain}
              <Badge variant="outline" className="ml-auto">{items.length} routes</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {items.map(c => (
                <div key={c.id} className={`border rounded-lg p-3 ${STATE_BG[c.classification]}`}>
                  <div className="text-sm font-medium truncate">{c.feature_name}</div>
                  <div className="text-xs font-mono text-muted-foreground truncate">{c.route_path}</div>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline" className={`text-[10px] ${STATE_TEXT[c.classification]}`}>{c.classification}</Badge>
                    {c.launch_impact === "blocking" && <Badge variant="destructive" className="text-[10px]">Blocker</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
