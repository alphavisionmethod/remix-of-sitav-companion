import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReleaseEngine } from "@/platform/orchestration/hooks/useReleaseEngine";
import { Rocket, Shield, GitBranch, Activity } from "lucide-react";

export default function ReleaseEngineeringPage() {
  const engine = useReleaseEngine();
  const [rollout, setRollout] = useState<ReturnType<typeof engine.planRollout> | null>(null);

  const handlePlanRollout = () => {
    const plan = engine.planRollout("2.1.0", {
      previousVersion: "2.0.0",
      initialCanaryPercent: 5,
      expansionSteps: [10, 25, 50, 100],
      observationMinutes: 30,
      autoPromote: false,
      ownerId: "system",
    });
    setRollout(plan);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Release Engineering</h1>
          <p className="text-muted-foreground">Rollout planning, health scoring, compatibility, and regression detection</p>
        </div>
        <Button onClick={handlePlanRollout} className="gap-2">
          <Rocket className="h-4 w-4" /> Plan New Rollout
        </Button>
      </div>

      <Tabs defaultValue="rollout">
        <TabsList>
          <TabsTrigger value="rollout">Rollout Planner</TabsTrigger>
          <TabsTrigger value="health">Health Scorer</TabsTrigger>
          <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
          <TabsTrigger value="regressions">Regressions</TabsTrigger>
        </TabsList>

        <TabsContent value="rollout" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Rocket className="h-4 w-4" /> Active Rollouts</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{rollout ? 1 : 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Gates Passed</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{rollout ? rollout.feature_flags.length : 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" /> Health Score</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{rollout ? `${(rollout.health_score * 100).toFixed(0)}%` : "—"}</p></CardContent>
            </Card>
          </div>
          {rollout && (
            <Card>
              <CardHeader><CardTitle>Current Rollout: {rollout.release_version}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{rollout.phase}</Badge>
                  <Badge variant="secondary">{rollout.strategy}</Badge>
                  <span className="text-sm text-muted-foreground">Reach: {rollout.current_reach_percent}%</span>
                </div>
                <p className="text-sm text-muted-foreground">{rollout.expansion_rules.length} expansion steps configured</p>
                <p className="text-sm text-muted-foreground">{rollout.abort_conditions.length} abort conditions active</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4" /> Release Health Scoring</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Score release health by comparing error rates, latency, and crash rates against thresholds.
                Decisions: <Badge variant="outline">expand</Badge> <Badge variant="secondary">hold</Badge> <Badge variant="destructive">rollback</Badge>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compatibility" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><GitBranch className="h-4 w-4" /> Compatibility Matrix</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Build and check cross-component compatibility matrices. Validate release gates before deployment.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regressions" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" /> Regression Detection</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Statistical regression detection with t-tests, baseline comparison, and automated root cause analysis.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
