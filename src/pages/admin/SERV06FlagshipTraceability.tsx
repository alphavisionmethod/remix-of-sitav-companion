// ═══════════════════════════════════════════════════════════════
// SITA OS — SERV06: Flagship Loop Traceability Board
// ═══════════════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getRoutesByFlagshipLoop } from "@/lib/core-services/service-registry/route-to-service-inventory";
import { getDomainsByFlagshipLoop, SERVICE_OWNERSHIP_REGISTRY } from "@/lib/core-services/service-registry/service-ownership-registry";
import { FLAGSHIP_LOOP_SEEDS } from "@/lib/core-services/flagship-loops/flagship-loop-service";
import { Layers, Route, Database, AlertTriangle, CheckCircle } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function SERV06FlagshipTraceability() {
  return (
    <div className="space-y-6 p-6" data-testid="serv06-board">
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" />
          SERV06 — Flagship Loop Traceability
        </h1>
        <p className="text-muted-foreground mt-1">
          Architecture coherence mapped to product priorities — routes, services, and proof per loop
        </p>
      </div>

      <div className="space-y-6">
        {FLAGSHIP_LOOP_SEEDS.map((loop) => {
          const routes = getRoutesByFlagshipLoop(loop.loop_key);
          const domains = getDomainsByFlagshipLoop(loop.loop_key);
          const totalActions = routes.reduce((s, r) => s + r.actions.length, 0);
          const canonicalActions = routes.reduce(
            (s, r) => s + r.actions.filter((a) => a.isCanonical).length, 0
          );
          const shadowRoutes = routes.filter((r) => r.shadowServiceRisk !== "low");
          const highConfidence = routes.filter((r) => r.canonicalPathConfidence === "high");
          const traceScore = routes.length > 0
            ? Math.round((highConfidence.length / routes.length) * 100)
            : 0;

          return (
            <Card key={loop.loop_key} className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{loop.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{loop.launch_claim_status}</Badge>
                    <Badge className={
                      traceScore >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                      traceScore >= 50 ? "bg-amber-500/20 text-amber-400" :
                      "bg-red-500/20 text-red-400"
                    }>
                      Trace: {traceScore}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold">{routes.length}</div>
                    <div className="text-xs text-muted-foreground">Routes Traced</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{domains.length}</div>
                    <div className="text-xs text-muted-foreground">Domains</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{totalActions}</div>
                    <div className="text-xs text-muted-foreground">Actions</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-emerald-400">{canonicalActions}</div>
                    <div className="text-xs text-muted-foreground">Canonical</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-amber-400">{shadowRoutes.length}</div>
                    <div className="text-xs text-muted-foreground">Shadow Risk</div>
                  </div>
                </div>

                <Progress value={traceScore} className="h-2" />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium mb-2 flex items-center gap-1">
                      <Route className="h-3 w-3" /> Routes
                    </div>
                    <div className="space-y-1">
                      {routes.map((r) => (
                        <div key={r.routeKey} className="flex items-center gap-2 text-xs">
                          {r.canonicalPathConfidence === "high" ? (
                            <CheckCircle className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-amber-400" />
                          )}
                          <span className="font-mono">{r.routePath}</span>
                          {r.shadowServiceRisk !== "low" && (
                            <Badge variant="destructive" className="text-xs">shadow</Badge>
                          )}
                        </div>
                      ))}
                      {routes.length === 0 && (
                        <div className="text-xs text-muted-foreground italic">No routes inventoried yet</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium mb-2 flex items-center gap-1">
                      <Database className="h-3 w-3" /> Services
                    </div>
                    <div className="space-y-1">
                      {domains.map((d) => (
                        <div key={d.domain} className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="text-xs">{d.primaryService}</Badge>
                          <span className="text-muted-foreground">({d.displayName})</span>
                        </div>
                      ))}
                      {loop.primary_services.filter(
                        (s) => !domains.some((d) => d.primaryService === s)
                      ).map((s) => (
                        <div key={s} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <AlertTriangle className="h-3 w-3 text-amber-400" />
                          <span className="font-mono">{s}</span>
                          <span className="italic">— not in domain registry</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
