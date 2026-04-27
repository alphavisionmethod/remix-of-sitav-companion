import { usePolicyDecision } from "@/platform/trust/hooks/use-policy-decision";
import { AdminControlPlaneShell as AdminShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Play, Loader2, Zap, Shield, Activity } from "lucide-react";
import { useAdvisorAgents } from "@/platform/advisors/hooks/use-advisor-agents";
import { AdvisorAgentCard } from "@/platform/admin/components/admin/advisor-agents/AdvisorAgentCard";
import { AdvisorActionQueue } from "@/platform/admin/components/admin/advisor-agents/AdvisorActionQueue";
import { toast } from "sonner";

export default function AdvisorAgentDashboard() {
  const __policy = usePolicyDecision({ domain: "admin", riskClass: "R4", actor: "platform-admin" }); void __policy;
  const {
    agents, actions, isLoading, seedAgents, seedingAgents,
    toggleAgent, updateAutonomy, approveAction, rejectAction,
    invokeLoop, invoking,
  } = useAdvisorAgents();

  const activeCount = agents.filter(a => a.is_active).length;
  const pendingActions = actions.filter(a => a.status === "proposed").length;
  const totalInvocations = agents.reduce((s, a) => s + a.invocations_today, 0);

  const handleInvoke = (advisorId?: string) => {
    invokeLoop(advisorId);
    toast.info(advisorId ? `Running ${advisorId}...` : "Running all advisors...");
  };

  return (
    <AdminShell contextScope="Advisor Agent Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              Advisor Agents
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Autonomous AI agents that proactively monitor and act across your domains
            </p>
          </div>
          <div className="flex items-center gap-2">
            {agents.length === 0 && (
              <Button onClick={() => seedAgents()} disabled={seedingAgents}>
                {seedingAgents ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Zap className="h-4 w-4 mr-1" />}
                Initialize Agents
              </Button>
            )}
            {agents.length > 0 && (
              <Button variant="outline" onClick={() => handleInvoke()} disabled={invoking}>
                {invoking ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                Run All
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{agents.length}</p>
              <p className="text-xs text-muted-foreground">Total Agents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{pendingActions}</p>
              <p className="text-xs text-muted-foreground">Pending Actions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{totalInvocations}</p>
              <p className="text-xs text-muted-foreground">Invocations Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="agents">
          <TabsList>
            <TabsTrigger value="agents" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Agents ({agents.length})
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Action Queue ({actions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : agents.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Bot className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-1">No Advisor Agents</p>
                  <p className="text-sm mb-4">Initialize the 6 domain advisor agents to get started</p>
                  <Button onClick={() => seedAgents()} disabled={seedingAgents}>
                    {seedingAgents ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Zap className="h-4 w-4 mr-1" />}
                    Initialize All 6 Agents
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <AdvisorAgentCard
                    key={agent.id}
                    agent={agent}
                    onToggle={(id, active) => toggleAgent({ id, is_active: active })}
                    onAutonomyChange={(id, level) => updateAutonomy({ id, autonomy_level: level })}
                    onInvoke={(advisorId) => handleInvoke(advisorId)}
                    invoking={invoking}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="actions" className="mt-4">
            <AdvisorActionQueue
              actions={actions}
              onApprove={(id) => { approveAction(id); toast.success("Action approved"); }}
              onReject={(id) => { rejectAction(id); toast.info("Action rejected"); }}
            />
          </TabsContent>
        </Tabs>

        {/* Security Info */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <Shield className="h-4 w-4 text-primary" />
              9-Gate Security Pipeline
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-9 gap-2 text-xs text-center">
              {["Identity", "Scope", "Budget", "Policy", "Confidence", "Simulation", "Receipt", "Rate Limit", "Kill Switch"].map((gate) => (
                <Badge key={gate} variant="outline" className="text-[10px] py-1">{gate}</Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Every advisor action passes through all 9 security gates before execution. No bypasses allowed.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
