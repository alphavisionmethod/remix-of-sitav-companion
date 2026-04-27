import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRecoveryPermissions } from "@/platform/auth/hooks/useRecoveryPermissions";
import { RecoveryJobMonitor } from "@/platform/admin/components/admin/recovery/RecoveryJobMonitor";
import { WebhookReplayPanel } from "@/platform/admin/components/admin/recovery/WebhookReplayPanel";
import { DiagnosticExportAuditPanel } from "@/platform/admin/components/admin/recovery/DiagnosticExportAudit";
import { RecoveryActionCard } from "@/platform/admin/components/admin/recovery/RecoveryActionCard";
import { ShieldAlert, Activity, RefreshCw, FileText, Wrench, Lock } from "lucide-react";

export default function RecoveryOpsCenter() {
  const { canView, canExecute, isLoading, permissions, userId } = useRecoveryPermissions();
  const [activeTab, setActiveTab] = useState("jobs");

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground text-sm">Checking permissions…</div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-20">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="py-12 text-center space-y-3">
            <Lock className="h-10 w-10 text-muted-foreground mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">Access Denied</h2>
            <p className="text-sm text-muted-foreground">
              Recovery Operations requires <code className="text-xs bg-secondary px-1 py-0.5 rounded">support.view</code> permission.
              Contact your administrator to request access.
            </p>
            <p className="text-xs text-muted-foreground">
              Your current permissions: {permissions.length === 0 ? "none" : permissions.join(", ")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const operatorId = userId ?? "unknown";

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShieldAlert className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recovery Operations Center</h1>
          <p className="text-sm text-muted-foreground">
            Background jobs, webhook replay, diagnostic exports, and recovery actions
            {!canExecute && (
              <span className="ml-2 text-yellow-400 text-xs">
                (read-only — <code className="text-[10px]">admin.recovery</code> required to execute)
              </span>
            )}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/30">
          <TabsTrigger value="jobs" className="text-xs gap-1"><Activity className="h-3 w-3" /> Job Monitor</TabsTrigger>
          <TabsTrigger value="actions" className="text-xs gap-1"><Wrench className="h-3 w-3" /> Recovery Actions</TabsTrigger>
          <TabsTrigger value="webhooks" className="text-xs gap-1"><RefreshCw className="h-3 w-3" /> Webhook Replay</TabsTrigger>
          <TabsTrigger value="diagnostics" className="text-xs gap-1"><FileText className="h-3 w-3" /> Diagnostic Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="mt-4">
          <RecoveryJobMonitor />
        </TabsContent>

        <TabsContent value="actions" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RecoveryActionCard
              actionType="workflow-retry"
              label="Retry Failed Workflows"
              description="Re-execute all failed workflow runs from their last successful step"
              icon={<RefreshCw className="h-4 w-4 text-primary" />}
              riskLevel="medium"
              operatorId={operatorId}
              canExecute={canExecute}
            />
            <RecoveryActionCard
              actionType="cache-flush"
              label="Flush Stale Caches"
              description="Clear all runtime caches including model routing, capability registry, and config"
              icon={<Activity className="h-4 w-4 text-primary" />}
              riskLevel="low"
              operatorId={operatorId}
              canExecute={canExecute}
            />
            <RecoveryActionCard
              actionType="connection-reset"
              label="Reset Stuck Connections"
              description="Force-close and re-establish connections to external providers"
              icon={<Wrench className="h-4 w-4 text-primary" />}
              riskLevel="medium"
              operatorId={operatorId}
              canExecute={canExecute}
            />
            <RecoveryActionCard
              actionType="queue-drain"
              label="Drain Dead-Letter Queue"
              description="Process or archive all items stuck in the dead-letter queue"
              icon={<FileText className="h-4 w-4 text-primary" />}
              riskLevel="high"
              operatorId={operatorId}
              canExecute={canExecute}
            />
            <RecoveryActionCard
              actionType="data-reconciliation"
              label="Data Reconciliation"
              description="Compare and reconcile records between primary store and replicas"
              icon={<ShieldAlert className="h-4 w-4 text-primary" />}
              riskLevel="high"
              operatorId={operatorId}
              canExecute={canExecute}
            />
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-4">
          <WebhookReplayPanel operatorId={operatorId} canExecute={canExecute} />
        </TabsContent>

        <TabsContent value="diagnostics" className="mt-4">
          <DiagnosticExportAuditPanel operatorId={operatorId} canExecute={canExecute} />
        </TabsContent>
      </Tabs>
    </div>
  );
}