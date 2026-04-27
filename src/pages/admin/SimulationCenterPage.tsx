import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimulationEngine } from "@/platform/orchestration/hooks/useSimulationEngine";
import { FlaskConical, Zap, TrendingUp, Users } from "lucide-react";

export default function SimulationCenterPage() {
  const engine = useSimulationEngine();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Simulation Center</h1>
        <p className="text-muted-foreground">Scenario runner, dry-run executor, chaos orchestrator, digital twins</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FlaskConical className="h-4 w-4" /> Scenarios</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-500">Ready</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4" /> Dry-Run</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-500">Online</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" /> What-If</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-500">Active</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Digital Twins</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">0</p></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scenarios">
        <TabsList>
          <TabsTrigger value="scenarios">Scenario Runner</TabsTrigger>
          <TabsTrigger value="dryrun">Dry-Run</TabsTrigger>
          <TabsTrigger value="whatif">What-If</TabsTrigger>
          <TabsTrigger value="chaos">Chaos Engineering</TabsTrigger>
          <TabsTrigger value="twins">Digital Twins</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios">
          <Card>
            <CardHeader><CardTitle>Scenario Pack Runner</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Execute scenario packs with structured events, assertions, and expected outcomes.
                Supports parallel and sequential execution modes with resource usage tracking.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {["rollout_failure", "sync_conflict", "trust_attack", "budget_reduction", "network_degradation"].map(s => (
                  <Badge key={s} variant="outline">{s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dryrun">
          <Card>
            <CardHeader><CardTitle>Dry-Run Executor</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Simulate commands, policies, rollouts, and approvals without side effects. 
                Predict blast radius, data risk, and financial impact before execution.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatif">
          <Card>
            <CardHeader><CardTitle>What-If Analysis</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Project metric changes at 30/90/180 day horizons. Compare tradeoff options with 
                Pareto-optimal selection, sensitivity analysis, and Monte Carlo confidence intervals.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chaos">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-4 w-4" /> Chaos Engineering</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Run chaos scripts with kill, slow, corrupt, and partition actions. 
                Automatic safety checks, blast radius tracking, and resilience scoring.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="twins">
          <Card>
            <CardHeader><CardTitle>Digital Twin Manager</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Create and manage digital twins of users, devices, and systems. 
                Track drift scores, sync status, and auto-reconciliation capabilities.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card>
            <CardHeader><CardTitle>Simulation Verification</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Compare predicted vs actual outcomes. Track accuracy, calibration, direction correctness, 
                and magnitude accuracy across all simulation runs.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
