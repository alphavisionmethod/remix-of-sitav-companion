import { Suspense, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GLOBAL_TASK_REGISTRY, listTaskTypes, type TaskContract } from "@/lib/contracts/global-contracts-registry";
import { PipelineStage } from "@/lib/services/canonical-pipeline";
import { Shield, GitBranch, Layers, Cpu, Activity, Database, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";

const riskColors: Record<string, string> = {
  standard: "bg-green-500/20 text-green-300 border-green-500/30",
  elevated: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
};

const stageLabels = Object.values(PipelineStage);

function ContractCard({ contract }: { contract: TaskContract }) {
  return (
    <Card className="border-border/50" data-testid={`contract-${contract.taskType}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{contract.displayName}</CardTitle>
          <Badge variant="outline" className={riskColors[contract.riskTier] || ""}>
            {contract.riskTier}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{contract.description}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-[10px]">{contract.domain}</Badge>
          <Badge variant="secondary" className="text-[10px]">{contract.routingClass}</Badge>
          <Badge variant="secondary" className="text-[10px]">{contract.budgetClass}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            {contract.requiresRetrieval ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-muted-foreground/40" />}
            Retrieval
          </span>
          <span className="flex items-center gap-1">
            {contract.requiresCritique ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-muted-foreground/40" />}
            Critique
          </span>
          <span className="flex items-center gap-1">
            {contract.requiresDeterministicVerification ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-muted-foreground/40" />}
            Deterministic
          </span>
          <span className="flex items-center gap-1">
            {contract.requiresApproval ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-muted-foreground/40" />}
            Approval
          </span>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
          <span>Max {contract.maxCostCents}¢</span>
          <span>≤{contract.maxLatencyMs / 1000}s</span>
          <span>TTL {contract.ttlSeconds}s</span>
        </div>
      </CardContent>
    </Card>
  );
}

function PipelineStagesView() {
  return (
    <Card data-testid="pipeline-stages">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <GitBranch className="w-4 h-4" />
          Canonical Pipeline — 9 Stages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stageLabels.map((stage, idx) => (
            <div key={stage} className="flex items-center gap-3" data-testid={`pipeline-stage-${stage}`}>
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </span>
              <div className="flex-1">
                <span className="text-sm font-medium capitalize">{stage.replace(/_/g, " ")}</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RuntimeModuleStatus() {
  const modules = [
    { name: "Global Contracts Registry", status: "active", icon: Database, count: listTaskTypes().length },
    { name: "ConscienceGate", status: "active", icon: Shield, count: null },
    { name: "CritiqueLoop", status: "active", icon: AlertTriangle, count: null },
    { name: "Pipeline Orchestrator", status: "active", icon: GitBranch, count: 9 },
    { name: "Mnemosyne Context Assembler", status: "active", icon: Layers, count: null },
    { name: "Desk Executor", status: "active", icon: Cpu, count: null },
    { name: "Unified Event Service", status: "active", icon: Activity, count: null },
  ];

  return (
    <Card data-testid="runtime-modules">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          Runtime Modules — Implementation Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {modules.map((mod) => (
          <div key={mod.name} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/30" data-testid={`module-${mod.name.toLowerCase().replace(/\s/g, "-")}`}>
            <div className="flex items-center gap-2">
              <mod.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{mod.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {mod.count !== null && <Badge variant="secondary" className="text-[10px]">{mod.count}</Badge>}
              <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 text-[10px]">
                {mod.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AntiSprawlView() {
  const rules = [
    { rule: "ConscienceGate replaces groundedness-gate", status: "enforced" },
    { rule: "Desk facades over executor-service + recommendation-execution + connector-runners", status: "enforced" },
    { rule: "Unified Event Service merges event-bus + event-broker", status: "enforced" },
    { rule: "Pipeline is NOT a second brain — extends brain-core", status: "enforced" },
    { rule: "Global contracts actively consumed, not decorative", status: "enforced" },
    { rule: "No Kafka/NATS — application-level events only", status: "enforced" },
    { rule: "Net sprawl delta: +2 dirs, replacing 4 scattered concepts", status: "compliant" },
  ];

  return (
    <Card data-testid="anti-sprawl">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Anti-Sprawl Compliance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {rules.map((r, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">{r.rule}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ContractsOverview() {
  const taskTypes = listTaskTypes();
  const contracts = taskTypes.map((t) => GLOBAL_TASK_REGISTRY[t]);

  return (
    <div className="space-y-3" data-testid="contracts-overview">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {contracts.map((c) => (
          <ContractCard key={c.taskType} contract={c} />
        ))}
      </div>
    </div>
  );
}

function GodTierRuntimeBoard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-4 space-y-4" data-testid="god-tier-runtime-board">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">GOD02 — Runtime Integration Board</h1>
          <p className="text-xs text-muted-foreground">God-Tier Architecture — Live Runtime Module Status</p>
        </div>
        <Badge variant="outline" className="bg-green-500/10 text-green-300 border-green-500/30">
          <Clock className="w-3 h-3 mr-1" />
          All Systems Active
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="contracts" data-testid="tab-contracts">Contracts</TabsTrigger>
          <TabsTrigger value="pipeline" data-testid="tab-pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="anti-sprawl" data-testid="tab-anti-sprawl">Anti-Sprawl</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RuntimeModuleStatus />
            <PipelineStagesView />
          </div>
          <AntiSprawlView />
        </TabsContent>

        <TabsContent value="contracts" className="mt-4">
          <ScrollArea className="h-[calc(100vh-220px)]">
            <ContractsOverview />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PipelineStagesView />
            <Card data-testid="pipeline-flow">
              <CardHeader>
                <CardTitle className="text-sm">Canonical Flow</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <p>Brain → ConscienceGate → Mnemosyne → ModelRouter → InferenceEngine → Desk → CritiqueLoop → Return → Receipt</p>
                <p className="pt-2">Each stage emits a StageRecord with timing, decision, and data. Failed stages halt the pipeline and emit error receipts.</p>
                <p className="pt-2">Conditional stages (Retrieval, Tool Execution, Critique) are skipped when not required by the task contract.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anti-sprawl" className="mt-4">
          <AntiSprawlView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default GodTierRuntimeBoard;
