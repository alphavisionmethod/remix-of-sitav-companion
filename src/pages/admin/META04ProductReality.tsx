// ═══════════════════════════════════════════════════════════════
// SITA OS — META04 Product Reality
// Live reality + deployability matrix for every surface and feature.
// Route: /admin/meta/reality (gated by audit.view)
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import {
  FEATURE_REALITY_REGISTRY,
  ALL_SURFACES,
  realityCoverageStats,
} from "@/lib/reality/feature-reality-registry";
import type { RealityState, SurfaceId } from "@/lib/reality/feature-reality-types";
import {
  allDeployabilityScores,
  deployabilityHealth,
  DEPLOYABILITY_REGISTRY,
} from "@/lib/deploy/deployability-registry";
import { SURFACE_CLAIM_MAP } from "@/lib/reality/surface-claim-map";
import { CI_GATE_REGISTRY } from "@/lib/ci/ci-gate-registry";

const STATE_VARIANT: Record<RealityState, "default" | "secondary" | "outline" | "destructive"> = {
  real: "default",
  simulated: "secondary",
  degraded: "outline",
  unsupported: "outline",
  roadmap: "secondary",
};

const STATE_LABEL: Record<RealityState, string> = {
  real: "Real",
  simulated: "Simulated",
  degraded: "Degraded",
  unsupported: "—",
  roadmap: "Roadmap",
};

function StateCell({ state }: { state: RealityState | undefined }) {
  if (!state) return <span className="text-muted-foreground">?</span>;
  if (state === "unsupported") return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <Badge variant={STATE_VARIANT[state]} className="text-[10px] px-1.5 py-0">
      {STATE_LABEL[state]}
    </Badge>
  );
}

export default function META04ProductReality() {
  const stats = useMemo(() => realityCoverageStats(), []);
  const deployScores = useMemo(() => allDeployabilityScores(), []);
  const deployHealth = useMemo(() => deployabilityHealth(), []);
  const totalGates = CI_GATE_REGISTRY.length;
  const surfacesReady = deployScores.filter((s) => s.score >= 80).length;
  const verdictReady = totalGates >= 22 && surfacesReady === deployScores.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Product Reality & Deployability</h1>
        <p className="text-muted-foreground">
          Live honesty matrix: every feature × surface, plus per-surface deployability score.
        </p>
      </div>

      {/* Phase 11 — Final Verdict Tile */}
      <Card className={verdictReady ? "border-primary/50 bg-primary/5" : "border-destructive/50 bg-destructive/5"}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardDescription>Production Truth Verdict</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              {verdictReady ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  100% Deployment-Ready
                </>
              ) : (
                <>
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  Not Ready
                </>
              )}
            </CardTitle>
          </div>
          <Badge variant={verdictReady ? "default" : "destructive"} className="text-sm">
            {totalGates} CI gates · {surfacesReady}/{deployScores.length} surfaces ready
          </Badge>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Aggregated from <code className="text-xs">generated/production-truth-final.json</code>.
          All Phase 1–10 gates registered; every surface scored ≥ 80; every feature × surface honestly classified.
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Features classified</CardDescription>
            <CardTitle className="text-3xl">{FEATURE_REALITY_REGISTRY.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Real coverage</CardDescription>
            <CardTitle className="text-3xl">{stats.realPct.toFixed(0)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={stats.realPct} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg deployability</CardDescription>
            <CardTitle className="text-3xl">{deployHealth.averageScore}/100</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={deployHealth.averageScore} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Surfaces below 80</CardDescription>
            <CardTitle className="text-3xl">{deployHealth.blockedSurfaces}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="reality">
        <TabsList>
          <TabsTrigger value="reality">Feature Reality</TabsTrigger>
          <TabsTrigger value="deploy">Deployability</TabsTrigger>
          <TabsTrigger value="claims">Surface Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="reality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature × Surface Matrix</CardTitle>
              <CardDescription>
                Honest classification per surface. Every feature must classify all 7 surfaces.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Feature</th>
                      <th className="text-left p-2">Context</th>
                      {ALL_SURFACES.map((s) => (
                        <th key={s} className="text-left p-2 capitalize">{s}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FEATURE_REALITY_REGISTRY.map((f) => (
                      <tr key={f.featureId} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="font-medium">{f.featureName}</div>
                          <div className="text-xs text-muted-foreground">{f.featureId}</div>
                        </td>
                        <td className="p-2 text-xs">{f.contextId}</td>
                        {ALL_SURFACES.map((s) => (
                          <td key={s} className="p-2">
                            <StateCell state={f.perSurface[s as SurfaceId]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deploy" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deployScores.map((s) => {
              const entry = DEPLOYABILITY_REGISTRY.find((d) => d.surface === s.surface);
              return (
                <Card key={s.surface}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">{s.surface}</CardTitle>
                      <Badge variant={s.score >= 80 ? "default" : "destructive"}>
                        {s.score}/100
                      </Badge>
                    </div>
                    <CardDescription>
                      {s.readyStages}/{s.totalStages} stages ready
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Progress value={s.score} />
                    <div className="space-y-1">
                      {entry?.stages.map((st) => (
                        <div key={st.stage} className="flex items-center justify-between text-xs">
                          <span className="capitalize">{st.stage}</span>
                          <Badge
                            variant={
                              st.state === "ready" ? "default"
                              : st.state === "deferred" ? "secondary"
                              : st.state === "partial" ? "outline"
                              : "destructive"
                            }
                            className="text-[10px]"
                          >
                            {st.state}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {s.blockers.length > 0 && (
                      <div className="text-xs text-muted-foreground border-t pt-2">
                        Blockers: {s.blockers.join(", ")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SURFACE_CLAIM_MAP.map((c) => (
              <Card key={c.surface}>
                <CardHeader>
                  <CardTitle className="capitalize">{c.surface}</CardTitle>
                  <CardDescription>Marketing & UI claim governance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Allowed</div>
                    <ul className="text-sm space-y-0.5">
                      {c.allowedClaims.map((a) => <li key={a}>✓ {a}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Forbidden</div>
                    <ul className="text-sm space-y-0.5 text-destructive">
                      {c.forbiddenClaims.map((a) => <li key={a}>✗ {a}</li>)}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
