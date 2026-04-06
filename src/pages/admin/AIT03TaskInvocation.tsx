// ═══════════════════════════════════════════════════════════════
// SITA OS — AIT03: Task Invocation Console
// Real workforce execution through sovereign AI gateway
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getWorkforceRoles } from "@/lib/services/ai-workforce/workforce-orchestrator";
import { executeWorkforceTask, type WorkforceExecutionResult } from "@/lib/ai/workforce-executor";
import { AIWorkforceInvocationPanel } from "@/components/ai/AIWorkforceInvocationPanel";
import { Terminal, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const TASK_TYPES = [
  { key: "summarize", label: "Summarize" },
  { key: "diagnose", label: "Diagnose" },
  { key: "classify", label: "Classify" },
  { key: "audit", label: "Audit" },
  { key: "recommend", label: "Recommend" },
  { key: "investigate", label: "Investigate" },
  { key: "produce_remediation_plan", label: "Remediation Plan" },
  { key: "generate_digest", label: "Generate Digest" },
];

const BUDGET_POSTURES = [
  { key: "economy_admin", label: "Economy (cheapest)" },
  { key: "balanced_admin", label: "Balanced" },
  { key: "premium_architecture", label: "Premium (architecture)" },
];

export default function AIT03TaskInvocation() {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [budgetPosture, setBudgetPosture] = useState("economy_admin");
  const [inputText, setInputText] = useState("");
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<WorkforceExecutionResult | null>(null);

  const { data: roles = [] } = useQuery({
    queryKey: ["ai-workforce-roles"],
    queryFn: getWorkforceRoles,
  });

  const handleInvoke = async () => {
    if (!selectedRole || !selectedTask) {
      toast.error("Select a role and task type");
      return;
    }
    if (!inputText.trim()) {
      toast.error("Provide input/scope for the task");
      return;
    }

    setExecuting(true);
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Authentication required");
        setExecuting(false);
        return;
      }

      const execResult = await executeWorkforceTask(user.id, {
        roleKey: selectedRole,
        taskType: selectedTask,
        inputSummary: inputText,
        budgetClass: budgetPosture,
      });

      setResult(execResult);

      if (execResult.response.status.startsWith("success_")) {
        toast.success(`Task completed — ${(execResult.costCents / 100).toFixed(3)}¢`);
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
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Terminal className="h-6 w-6 text-primary" /> AIT03 — Task Invocation Console
        </h1>
        <p className="text-muted-foreground mt-1">Invoke AI workforce tasks through the sovereign gateway with role, budget, and scope controls</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Invoke Task</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">AI Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger><SelectValue placeholder="Select role..." /></SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r.role_key} value={r.role_key}>{r.display_name}</SelectItem>
                  ))}
                  {roles.length === 0 && (
                    <>
                      <SelectItem value="chief_architect">Chief Architect</SelectItem>
                      <SelectItem value="runtime_truth_analyst">Runtime Truth Analyst</SelectItem>
                      <SelectItem value="ai_governance_engineer">AI Governance Engineer</SelectItem>
                      <SelectItem value="budget_efficiency_analyst">Budget Analyst</SelectItem>
                      <SelectItem value="remediation_planner">Remediation Planner</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Task Type</label>
              <Select value={selectedTask} onValueChange={setSelectedTask}>
                <SelectTrigger><SelectValue placeholder="Select task..." /></SelectTrigger>
                <SelectContent>
                  {TASK_TYPES.map(t => (
                    <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Budget Posture</label>
              <Select value={budgetPosture} onValueChange={setBudgetPosture}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BUDGET_POSTURES.map(b => (
                    <SelectItem key={b.key} value={b.key}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Input / Scope</label>
            <Textarea
              placeholder="Describe what you want the AI role to analyze, audit, or produce..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">{budgetPosture}</Badge>
              {selectedRole && <Badge variant="secondary" className="text-xs">{selectedRole}</Badge>}
            </div>
            <Button onClick={handleInvoke} disabled={executing} className="gap-2">
              {executing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {executing ? "Executing..." : "Invoke"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <AIWorkforceInvocationPanel
          result={result}
          onRetry={handleInvoke}
        />
      )}
    </div>
  );
}
