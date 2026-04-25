import { usePolicyDecision } from "@/hooks/use-policy-decision";
import { AdminControlPlaneShell as AdminShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, CheckCircle, XCircle, Clock, AlertTriangle, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BoardAPI } from "@/lib/services/board-api-client";

export default function AdvisorActionApprovalAdmin() {
  const __policy = usePolicyDecision({ domain: "admin", riskClass: "R4", actor: "platform-admin" }); void __policy;
  const actionsQuery = useQuery({ queryKey: ["admin-actions"], queryFn: () => BoardAPI.listActions(100) });
  const toolsQuery = useQuery({ queryKey: ["admin-tools"], queryFn: () => BoardAPI.listToolExecutions(100) });

  const actions = actionsQuery.data?.actions ?? [];
  const tools = toolsQuery.data?.executions ?? [];

  const proposed = actions.filter(a => a.status === "proposed");
  const approved = actions.filter(a => a.status === "approved");
  const executed = actions.filter(a => a.status === "executed" || a.status === "completed");
  const failed = actions.filter(a => a.status === "failed");

  return (
    <AdminShell contextScope="Action & Approval Admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Action & Approval Admin
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Inspect actions, approvals, tool executions, and proof</p>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {[
            { icon: Clock, label: "Proposed", count: proposed.length, color: "text-muted-foreground" },
            { icon: CheckCircle, label: "Approved", count: approved.length, color: "text-[hsl(var(--chart-2))]" },
            { icon: Zap, label: "Executed", count: executed.length, color: "text-primary" },
            { icon: XCircle, label: "Failed", count: failed.length, color: "text-destructive" },
            { icon: AlertTriangle, label: "Tool Runs", count: tools.length, color: "text-[hsl(38_85%_58%)]" },
          ].map(({ icon: Icon, label, count, color }) => (
            <Card key={label} className="p-3 text-center">
              <Icon className={`h-4 w-4 mx-auto ${color}`} />
              <p className="text-lg font-bold mt-1">{count}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="proposed">
          <TabsList>
            <TabsTrigger value="proposed">Proposed ({proposed.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
            <TabsTrigger value="executed">Executed ({executed.length})</TabsTrigger>
            <TabsTrigger value="failed">Failed ({failed.length})</TabsTrigger>
            <TabsTrigger value="tools">Tools ({tools.length})</TabsTrigger>
          </TabsList>
          {["proposed", "approved", "executed", "failed"].map(tab => (
            <TabsContent key={tab} value={tab} className="space-y-2 mt-3">
              {actions.filter(a => tab === "executed" ? (a.status === "executed" || a.status === "completed") : a.status === tab).map(a => (
                <Card key={a.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground">{a.advisor_id} · {a.domain} · {a.risk_tier}</p>
                    </div>
                    <Badge variant={a.risk_tier === "critical" ? "destructive" : "secondary"} className="text-[9px]">
                      {a.risk_tier}
                    </Badge>
                  </div>
                  {a.error_message && <p className="text-[10px] text-destructive mt-1">{a.error_message}</p>}
                </Card>
              ))}
              {actions.filter(a => tab === "executed" ? (a.status === "executed" || a.status === "completed") : a.status === tab).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No {tab} actions</p>
              )}
            </TabsContent>
          ))}
          <TabsContent value="tools" className="space-y-2 mt-3">
            {tools.map(t => (
              <Card key={t.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">{t.tool_name} — {t.operation}</p>
                    <p className="text-[10px] text-muted-foreground">{t.advisor_id} · {t.tool_category} · {t.status}</p>
                  </div>
                  <Badge variant={t.status === "failed" ? "destructive" : "secondary"} className="text-[9px]">{t.approval_state}</Badge>
                </div>
              </Card>
            ))}
            {tools.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No tool executions</p>}
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  );
}
