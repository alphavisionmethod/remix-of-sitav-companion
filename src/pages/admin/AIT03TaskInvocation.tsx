// ═══════════════════════════════════════════════════════════════
// SITA OS — AIT03: Task Invocation Console (Full Spec)
// Role + task + scope + budget + urgency + mode + cost estimate
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AITSubNav from "@/components/admin/AITSubNav";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWorkforceRoles } from "@/lib/core-services/ai-workforce/workforce-orchestrator";
import { executeWorkforceTask, type WorkforceExecutionResult } from "@/lib/ai/workforce-executor";
import { AIWorkforceInvocationPanel } from "@/components/ai/AIWorkforceInvocationPanel";
import { Terminal, Play, Loader2, DollarSign, AlertTriangle, Clock, Save, History, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_BUDGET_POSTURES, DEMO_SCOPE_DOMAINS, DEMO_TASK_TYPES } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

export default function AIT03TaskInvocation() {
  const { isDemoMode } = useDataMode();
const [selectedRole, setSelectedRole] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [budgetPosture, setBudgetPosture] = useState("economy_admin");
  const [urgency, setUrgency] = useState("normal");
  const [scopeDomain, setScopeDomain] = useState("");
  const [inputText, setInputText] = useState("");
  const [traceRequired, setTraceRequired] = useState(true);
  const [receiptRequired, setReceiptRequired] = useState(true);
  const [mode, setMode] = useState("real");
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<WorkforceExecutionResult | null>(null);
  const [history, setHistory] = useState<WorkforceExecutionResult[]>([]);

  const { data: roles = [] } = useQuery({ queryKey: ["ai-workforce-roles"], queryFn: getWorkforceRoles });

  const selectedBudget = (isDemoMode ? DEMO_BUDGET_POSTURES : [] as typeof DEMO_BUDGET_POSTURES).find(b => b.key === budgetPosture);
  const selectedTaskMeta = (isDemoMode ? DEMO_TASK_TYPES : [] as typeof DEMO_TASK_TYPES).find(t => t.key === selectedTask);
  const selectedRoleMeta = roles.find(r => r.role_key === selectedRole);
  const isApprovalNeeded = selectedRoleMeta?.approval_required || selectedTask === "propose";

  const handleInvoke = async () => {
    if (!selectedRole || !selectedTask) { toast.error("Select a role and task type"); return; }
    if (!inputText.trim()) { toast.error("Provide input/scope"); return; }

    setExecuting(true);
    setResult(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Authentication required"); setExecuting(false); return; }

      const execResult = await executeWorkforceTask(user.id, {
        roleKey: selectedRole,
        taskType: selectedTask,
        inputSummary: `[Domain: ${scopeDomain || "general"}] [Urgency: ${urgency}] [Mode: ${mode}]\n\n${inputText}`,
        budgetClass: budgetPosture,
        scope: scopeDomain,
      });

      setResult(execResult);
      setHistory(prev => [execResult, ...prev.slice(0, 9)]);

      if (execResult.response.status.startsWith("success_")) {
        toast.success(`Task completed — $${(execResult.costCents / 100).toFixed(3)}`);
      } else {
        toast.warning(`Task returned: ${execResult.response.status}`);
      }
    } catch (err) {
      toast.error("Execution failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <AITSubNav />
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Terminal className="h-6 w-6 text-primary" /> AIT03 — Task Invocation Console
        </h1>
        <p className="text-muted-foreground mt-1">Invoke AI workforce tasks with role, budget, scope, and governance controls</p>
      </div>

      <Tabs defaultValue="invoke">
        <TabsList>
          <TabsTrigger value="invoke">Invoke</TabsTrigger>
          <TabsTrigger value="history">History ({history.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="invoke" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Task Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Row 1: Role + Task + Budget */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">AI Role</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger><SelectValue placeholder="Select role..." /></SelectTrigger>
                    <SelectContent>
                      {roles.map(r => <SelectItem key={r.role_key} value={r.role_key}>{r.display_name}</SelectItem>)}
                      {roles.length === 0 && (
                        <>
                          <SelectItem value="chief_architect">Chief Architect</SelectItem>
                          <SelectItem value="runtime_truth_analyst">Runtime Truth Analyst</SelectItem>
                          <SelectItem value="ai_governance_engineer">AI Governance Engineer</SelectItem>
                          <SelectItem value="budget_efficiency_analyst">Budget Analyst</SelectItem>
                          <SelectItem value="remediation_planner">Remediation Planner</SelectItem>
                          <SelectItem value="connector_ops_engineer">Connector Ops Engineer</SelectItem>
                          <SelectItem value="quality_launch_engineer">Quality/Launch Engineer</SelectItem>
                          <SelectItem value="data_schema_engineer">Data/Schema Engineer</SelectItem>
                          <SelectItem value="device_surface_engineer">Device/Surface Engineer</SelectItem>
                          <SelectItem value="incident_drift_analyst">Incident/Drift Analyst</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Task Type</label>
                  <Select value={selectedTask} onValueChange={setSelectedTask}>
                    <SelectTrigger><SelectValue placeholder="Select task..." /></SelectTrigger>
                    <SelectContent>
                      {(isDemoMode ? DEMO_TASK_TYPES : [] as typeof DEMO_TASK_TYPES).map(t => <SelectItem key={t.key} value={t.key}>{t.label} — {t.desc}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Budget Posture</label>
                  <Select value={budgetPosture} onValueChange={setBudgetPosture}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(isDemoMode ? DEMO_BUDGET_POSTURES : [] as typeof DEMO_BUDGET_POSTURES).map(b => <SelectItem key={b.key} value={b.key}>{b.icon} {b.label} ({b.costBand})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Scope + Urgency + Mode */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Scope Domain</label>
                  <Select value={scopeDomain} onValueChange={setScopeDomain}>
                    <SelectTrigger><SelectValue placeholder="Optional scope..." /></SelectTrigger>
                    <SelectContent>
                      {(isDemoMode ? DEMO_SCOPE_DOMAINS : [] as typeof DEMO_SCOPE_DOMAINS).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Urgency</label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Mode</label>
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real">Real</SelectItem>
                      <SelectItem value="demo">Demo (no side effects)</SelectItem>
                      <SelectItem value="internal_test">Internal Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Toggles */}
              <div className="flex items-center gap-6 text-xs">
                <div className="flex items-center gap-2"><Switch checked={traceRequired} onCheckedChange={setTraceRequired} /><span>Trace required</span></div>
                <div className="flex items-center gap-2"><Switch checked={receiptRequired} onCheckedChange={setReceiptRequired} /><span>Receipt required</span></div>
              </div>

              {/* Input */}
              <div>
                <label className="text-xs font-medium mb-1 block">Input / Scope Description</label>
                <Textarea placeholder="Describe what you want the AI role to analyze, audit, or produce..." value={inputText} onChange={e => setInputText(e.target.value)} rows={5} />
              </div>

              {/* Pre-execution info bar */}
              <div className="flex items-center justify-between p-3 rounded border bg-muted/20">
                <div className="flex items-center gap-3 text-xs">
                  <Badge variant="outline" className="gap-1"><DollarSign className="h-3 w-3" />{selectedBudget?.costBand ?? "—"}</Badge>
                  {selectedRoleMeta && <Badge variant="secondary">{selectedRoleMeta.default_model_tier}</Badge>}
                  {isApprovalNeeded && <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Approval needed</Badge>}
                  {selectedTaskMeta && <Badge variant="outline">{selectedTaskMeta.label}</Badge>}
                  <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />{urgency}</Badge>
                </div>
                <Button onClick={handleInvoke} disabled={executing} className="gap-2">
                  {executing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {executing ? "Executing..." : "Invoke Task"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && <AIWorkforceInvocationPanel result={result} onRetry={handleInvoke} />}
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          {history.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No task history this session.</CardContent></Card>
          ) : history.map((h, i) => (
            <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setResult(h)}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">{h.roleKey.replace(/_/g, " ")}</span>
                    <Badge variant="outline" className="text-[10px]">{h.taskType}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono">${(h.costCents / 100).toFixed(3)}</span>
                    <Badge variant={h.response.status.startsWith("success") ? "default" : "destructive"} className="text-[10px]">{h.response.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
