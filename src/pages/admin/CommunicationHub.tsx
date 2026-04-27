// ═══════════════════════════════════════════════════════════════
// SITA OS — Communication Architecture Hub
// Unified view of all API domains, commands, events, and channels
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Terminal, Send, Radio, Shield, Bell, Activity, Globe,
  Layers, Network, Cpu, Database, Lock, Eye, RefreshCw,
  CheckCircle2, XCircle, Clock, AlertTriangle, Zap,
  ArrowRight, Play, Pause, RotateCcw, FileText,
  Box, Settings, Search, ChevronRight
} from "lucide-react";
import { useCommands, useCreateCommand, useApproveCommand, useDenyCommand, useCancelCommand } from "@/platform/sita/hooks/use-os-api";
import { useSystemStatus, useSystemHealth } from "@/platform/sita/hooks/use-os-api";
import { useSecurityPosture, useSecurityPendingApprovals, useEmergencyLock } from "@/platform/sita/hooks/use-os-api";
import { useNotifications, useNotificationManager } from "@/platform/sita/hooks/use-os-api";
import { usePolicies, usePolicyManager } from "@/platform/sita/hooks/use-os-api";
import { useManagedApps, useAppManager } from "@/platform/sita/hooks/use-os-api";
import { useUnifiedTimeline, useAuditTimeline } from "@/platform/sita/hooks/use-os-api";
import { useSyncStatus, useSyncConflicts, useSyncControl } from "@/platform/sita/hooks/use-os-api";
import { useUpdateControl, useUpdateHistory } from "@/platform/sita/hooks/use-os-api";
import { channelManager } from "@/lib/services/realtime-gateway/resilient-channel";
import { useWsEventStream, useWsConnectionStatus, useWsEventRate } from "@/hooks/use-unified-ws";
import type { WsEventEnvelope, WsEventScope } from "@/packages/contracts/core/ws-event-envelope";
import type { CommandStatus } from "@/lib/api/os-api-client";

// ── Local view-model interfaces (jsonb columns return as Json from DB) ──
interface SystemStatusVM {
  health?: string;
  devices?: number | string;
  active_commands?: number | string;
  incidents?: number | string;
}
interface SubsystemHealthVM { name: string; status: string }
interface SystemHealthVM { subsystems?: SubsystemHealthVM[] }
interface SecurityDeviceVM { id: string; device_name?: string; trust_level: string }
interface SecurityPostureVM {
  posture?: string;
  pending_approvals?: number;
  devices?: SecurityDeviceVM[];
}
interface SyncStatusVM { sync_status?: string; ledger?: unknown[] }
interface NewPolicyVM {
  policy_key: string;
  display_name: string;
  description: string;
  scope: string;
  domain: string;
}

// ── Status Helpers ─────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { color: string; icon: typeof CheckCircle2; label: string }> = {
  created: { color: "bg-blue-500/20 text-blue-400", icon: Clock, label: "Created" },
  planning: { color: "bg-cyan-500/20 text-cyan-400", icon: Cpu, label: "Planning" },
  awaiting_approval: { color: "bg-amber-500/20 text-amber-400", icon: Clock, label: "Awaiting Approval" },
  approved: { color: "bg-green-500/20 text-green-400", icon: CheckCircle2, label: "Approved" },
  dispatched: { color: "bg-indigo-500/20 text-indigo-400", icon: Send, label: "Dispatched" },
  running: { color: "bg-purple-500/20 text-purple-400", icon: Activity, label: "Running" },
  verifying: { color: "bg-teal-500/20 text-teal-400", icon: Eye, label: "Verifying" },
  completed: { color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle2, label: "Completed" },
  failed: { color: "bg-red-500/20 text-red-400", icon: XCircle, label: "Failed" },
  rolled_back: { color: "bg-orange-500/20 text-orange-400", icon: RotateCcw, label: "Rolled Back" },
  denied: { color: "bg-rose-500/20 text-rose-400", icon: XCircle, label: "Denied" },
  canceled: { color: "bg-zinc-500/20 text-zinc-400", icon: XCircle, label: "Canceled" },
};

function CommandStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.created;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`${config.color} border-0 gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// ── Commands Tab ───────────────────────────────────────────────

function CommandsPanel() {
  const { data: commands = [], isLoading } = useCommands({ limit: 50 });
  const createCommand = useCreateCommand();
  const approveCommand = useApproveCommand();
  const denyCommand = useDenyCommand();
  const cancelCommand = useCancelCommand();
  const [commandText, setCommandText] = useState("");
  const [targetDevice, setTargetDevice] = useState("");

  const handleSubmit = () => {
    if (!commandText.trim()) return;
    createCommand.mutate({
      command: commandText,
      target: targetDevice ? { device_id: targetDevice } : undefined,
      origin: "admin_console",
    });
    setCommandText("");
  };

  return (
    <div className="space-y-4">
      {/* Command Input */}
      <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            Submit Command
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Enter command (natural language or structured)..."
            value={commandText}
            onChange={e => setCommandText(e.target.value)}
            className="bg-black/20 border-white/[0.06] min-h-[80px] resize-none font-mono text-sm"
          />
          <div className="flex gap-2">
            <Input
              placeholder="Target device ID (optional)"
              value={targetDevice}
              onChange={e => setTargetDevice(e.target.value)}
              className="bg-black/20 border-white/[0.06] flex-1 font-mono text-sm"
            />
            <Button
              onClick={handleSubmit}
              disabled={!commandText.trim() || createCommand.isPending}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20"
            >
              <Send className="h-4 w-4 mr-2" />
              {createCommand.isPending ? "Sending..." : "Execute"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Command List */}
      <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Command History</CardTitle>
            <Badge variant="outline" className="bg-white/[0.03] border-white/[0.06]">
              {commands.length} commands
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading commands...
              </div>
            ) : commands.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Terminal className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No commands yet</p>
                <p className="text-xs opacity-60">Submit a command above to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {commands.map((cmd: any) => (
                  <motion.div
                    key={cmd.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono truncate">{cmd.command_text || cmd.command_type}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(cmd.created_at).toLocaleString()}
                          </span>
                          {cmd.target_device_id && (
                            <Badge variant="outline" className="text-[10px] h-4 bg-white/[0.03]">
                              {cmd.target_device_id.slice(0, 8)}...
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[10px] h-4 bg-white/[0.03]">
                            {cmd.origin}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <CommandStatusBadge status={cmd.status} />
                        {cmd.status === "awaiting_approval" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-emerald-400 hover:bg-emerald-500/10"
                              onClick={() => approveCommand.mutate(cmd.id)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-red-400 hover:bg-red-500/10"
                              onClick={() => denyCommand.mutate(cmd.id)}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                        {["created", "planning", "dispatched", "running"].includes(cmd.status) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-muted-foreground hover:text-red-400"
                            onClick={() => cancelCommand.mutate(cmd.id)}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ── System Status Tab ──────────────────────────────────────────

function SystemPanel() {
  const { data: statusRaw, isLoading: statusLoading } = useSystemStatus();
  const { data: healthRaw } = useSystemHealth();
  const status = statusRaw as SystemStatusVM | undefined;
  const health = healthRaw as SystemHealthVM | undefined;

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Health", value: status?.health || "—", icon: Activity, color: "text-emerald-400" },
          { label: "Devices", value: status?.devices ?? "—", icon: Globe, color: "text-blue-400" },
          { label: "Active Commands", value: status?.active_commands ?? "—", icon: Terminal, color: "text-purple-400" },
          { label: "Incidents", value: status?.incidents ?? "—", icon: AlertTriangle, color: "text-amber-400" },
        ].map((item) => (
          <Card key={item.label} className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <p className="text-2xl font-bold tracking-tight">{statusLoading ? "..." : item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subsystem Health */}
      <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Subsystem Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(health?.subsystems ?? []).map((sub) => (
              <div key={sub.name} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className={`h-2.5 w-2.5 rounded-full ${sub.status === "healthy" ? "bg-emerald-400" : sub.status === "degraded" ? "bg-amber-400" : "bg-red-400"}`} />
                <div>
                  <p className="text-sm font-medium capitalize">{sub.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{sub.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Channel Stats */}
      <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary" />
            WebSocket Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const stats = channelManager.getStats();
            return (
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Total", value: stats.total, color: "text-foreground" },
                  { label: "Connected", value: stats.connected, color: "text-emerald-400" },
                  { label: "Reconnecting", value: stats.reconnecting, color: "text-amber-400" },
                  { label: "Errored", value: stats.errored, color: "text-red-400" },
                ].map(s => (
                  <div key={s.label} className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Security Tab ───────────────────────────────────────────────

function SecurityPanel() {
  const { data: postureRaw } = useSecurityPosture();
  const { data: approvals = [] } = useSecurityPendingApprovals();
  const emergencyLock = useEmergencyLock();
  const posture = postureRaw as SecurityPostureVM | undefined;

  return (
    <div className="space-y-4">
      {/* Security Posture */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-muted-foreground">Posture</span>
            </div>
            <p className="text-lg font-bold capitalize">{posture?.posture || "Normal"}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">Pending Approvals</span>
            </div>
            <p className="text-lg font-bold">{posture?.pending_approvals ?? approvals.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-red-400" />
              <span className="text-xs text-muted-foreground">Emergency</span>
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="w-full mt-1"
              onClick={() => emergencyLock.mutate(undefined)}
              disabled={emergencyLock.isPending}
            >
              <Lock className="h-3.5 w-3.5 mr-1" />
              {emergencyLock.isPending ? "Locking..." : "Emergency Lock All"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Trust Devices */}
      <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Trusted Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(posture?.devices ?? []).map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${device.trust_level === "trusted" ? "bg-emerald-400" : device.trust_level === "revoked" ? "bg-red-400" : "bg-amber-400"}`} />
                  <span className="text-sm">{device.device_name || device.id?.slice(0, 12)}</span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-white/[0.03]">{device.trust_level}</Badge>
              </div>
            ))}
            {(!posture || (posture.devices ?? []).length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-6">No devices registered</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Policies Tab ───────────────────────────────────────────────

function PoliciesPanel() {
  const { data: policies = [], isLoading } = usePolicies();
  const { create } = usePolicyManager();
  const [showCreate, setShowCreate] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ policy_key: "", display_name: "", description: "", scope: "global", domain: "general" });

  const handleCreate = () => {
    create.mutate(newPolicy satisfies NewPolicyVM);
    setNewPolicy({ policy_key: "", display_name: "", description: "", scope: "global", domain: "general" });
    setShowCreate(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{policies.length} policies defined</p>
        <Button size="sm" variant="outline" onClick={() => setShowCreate(!showCreate)} className="bg-white/[0.03] border-white/[0.06]">
          <Settings className="h-3.5 w-3.5 mr-1" /> {showCreate ? "Cancel" : "New Policy"}
        </Button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Policy key" value={newPolicy.policy_key} onChange={e => setNewPolicy(p => ({ ...p, policy_key: e.target.value }))} className="bg-black/20 border-white/[0.06]" />
                  <Input placeholder="Display name" value={newPolicy.display_name} onChange={e => setNewPolicy(p => ({ ...p, display_name: e.target.value }))} className="bg-black/20 border-white/[0.06]" />
                </div>
                <Input placeholder="Description" value={newPolicy.description} onChange={e => setNewPolicy(p => ({ ...p, description: e.target.value }))} className="bg-black/20 border-white/[0.06]" />
                <Button size="sm" onClick={handleCreate} disabled={!newPolicy.policy_key || !newPolicy.display_name || create.isPending}>
                  Create Policy
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading...
              </div>
            ) : policies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No policies defined</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {policies.map((policy: any) => (
                  <div key={policy.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{policy.display_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{policy.description || policy.policy_key}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px] h-4 bg-white/[0.03]">{policy.scope}</Badge>
                          <Badge variant="outline" className="text-[10px] h-4 bg-white/[0.03]">{policy.domain}</Badge>
                          <Badge variant="outline" className="text-[10px] h-4 bg-white/[0.03]">P{policy.priority}</Badge>
                        </div>
                      </div>
                      <Badge variant="outline" className={policy.enabled ? "bg-emerald-500/20 text-emerald-400 border-0" : "bg-zinc-500/20 text-zinc-400 border-0"}>
                        {policy.enabled ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Apps Tab ───────────────────────────────────────────────────

function AppsPanel() {
  const { data: apps = [], isLoading } = useManagedApps();
  const { install, remove } = useAppManager();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{apps.length} managed apps</p>
      </div>

      <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading...
              </div>
            ) : apps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Box className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No managed apps</p>
                <p className="text-xs opacity-60">Apps installed on your devices will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {apps.map((app: any) => (
                  <div key={app.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Box className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{app.display_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">v{app.version}</span>
                            <Badge variant="outline" className="text-[10px] h-4 bg-white/[0.03]">{app.trust_level}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] border-0 ${app.health_status === "healthy" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                          {app.health_status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-red-400 hover:bg-red-500/10"
                          onClick={() => remove.mutate(app.id)}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Sync Tab ──────────────────────────────────────────────────

function SyncPanel() {
  const { data: syncStatusRaw } = useSyncStatus();
  const { data: conflicts = [] } = useSyncConflicts();
  const { trigger, pause, resume, resolveConflict } = useSyncControl();
  const syncStatus = syncStatusRaw as SyncStatusVM | undefined;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Status", value: syncStatus?.sync_status || "Healthy", icon: RefreshCw, color: "text-teal-400" },
          { label: "Conflicts", value: conflicts.length, icon: AlertTriangle, color: conflicts.length > 0 ? "text-amber-400" : "text-emerald-400" },
          { label: "Ledger", value: syncStatus?.ledger?.length ?? 0, icon: Database, color: "text-blue-400" },
          { label: "Last Sync", value: "—", icon: Clock, color: "text-muted-foreground" },
        ].map(item => (
          <Card key={item.label} className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <p className="text-xl font-bold tracking-tight">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" />
            Sync Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => trigger.mutate(undefined)} disabled={trigger.isPending}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20">
              <Play className="h-3.5 w-3.5 mr-1" /> {trigger.isPending ? "Syncing..." : "Trigger Sync"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => pause.mutate(undefined)} disabled={pause.isPending}
              className="bg-white/[0.03] border-white/[0.06]">
              <Pause className="h-3.5 w-3.5 mr-1" /> Pause
            </Button>
            <Button size="sm" variant="outline" onClick={() => resume.mutate(undefined)} disabled={resume.isPending}
              className="bg-white/[0.03] border-white/[0.06]">
              <Play className="h-3.5 w-3.5 mr-1" /> Resume
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conflicts */}
      <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Sync Conflicts
            </CardTitle>
            <Badge variant="outline" className="bg-white/[0.03] border-white/[0.06]">{conflicts.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {conflicts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No conflicts</p>
                <p className="text-xs opacity-60">All data is in sync</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conflicts.map((c: any) => (
                  <div key={c.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{c.object_type || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{c.conflict_type || "merge"} • {new Date(c.created_at).toLocaleString()}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-emerald-400 hover:bg-emerald-500/10"
                        onClick={() => resolveConflict.mutate({ conflictId: c.id, resolution: "accept_remote" })}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Resolve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Notifications Tab ─────────────────────────────────────────

function NotificationsPanel() {
  const { data: notifications = [], isLoading } = useNotifications();
  const { markRead, takeAction } = useNotificationManager();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{notifications.length} notifications</p>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button size="sm" variant="outline" className="bg-white/[0.03] border-white/[0.06]"
              onClick={() => { markRead.mutate(selectedIds); setSelectedIds([]); }}>
              <Eye className="h-3.5 w-3.5 mr-1" /> Mark {selectedIds.length} Read
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No notifications</p>
                <p className="text-xs opacity-60">You're all caught up</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {notifications.map((notif: any) => (
                  <motion.div key={notif.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`p-4 hover:bg-white/[0.02] transition-colors cursor-pointer ${!notif.read ? "border-l-2 border-l-primary" : ""} ${selectedIds.includes(notif.id) ? "bg-primary/5" : ""}`}
                    onClick={() => toggleSelect(notif.id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px] h-4 bg-white/[0.03] capitalize">{notif.channel || notif.type || "system"}</Badge>
                          {!notif.read && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </div>
                        <p className="text-sm font-medium">{notif.title || "Notification"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body || notif.message || ""}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                      </div>
                      {notif.action_url && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 shrink-0 text-primary hover:bg-primary/10"
                          onClick={(e) => { e.stopPropagation(); takeAction.mutate({ id: notif.id, action: "open" }); }}>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Updates Tab ───────────────────────────────────────────────

function UpdatesPanel() {
  const { data: history = [] } = useUpdateHistory();
  const { install, rollback } = useUpdateControl();
  const [targetDevice, setTargetDevice] = useState("");

  return (
    <div className="space-y-4">
      {/* Install / Rollback */}
      <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Update Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Target device ID" value={targetDevice} onChange={e => setTargetDevice(e.target.value)}
            className="bg-black/20 border-white/[0.06] font-mono text-sm" />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { if (targetDevice) install.mutate({ deviceId: targetDevice }); }}
              disabled={!targetDevice || install.isPending}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20">
              <Zap className="h-3.5 w-3.5 mr-1" /> {install.isPending ? "Installing..." : "Install Update"}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => { if (targetDevice) rollback.mutate(targetDevice); }}
              disabled={!targetDevice || rollback.isPending}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> {rollback.isPending ? "Rolling back..." : "Rollback"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Update History
            </CardTitle>
            <Badge variant="outline" className="bg-white/[0.03] border-white/[0.06]">{history.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[350px]">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Zap className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No update history</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((entry: any) => (
                  <div key={entry.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium font-mono">{entry.command_text || entry.command_type}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(entry.created_at).toLocaleString()}</p>
                      </div>
                      <CommandStatusBadge status={entry.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Audit Tab ─────────────────────────────────────────────────

function AuditPanel() {
  const { data: events = [], isLoading } = useAuditTimeline();

  const severityColor: Record<string, string> = {
    low: "bg-blue-500/20 text-blue-400",
    medium: "bg-amber-500/20 text-amber-400",
    high: "bg-orange-500/20 text-orange-400",
    critical: "bg-red-500/20 text-red-400",
  };

  return (
    <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Audit Trail
          </CardTitle>
          <Badge variant="outline" className="bg-white/[0.03] border-white/[0.06]">{events.length} events</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading...
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Eye className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No audit events</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event: any) => (
                <motion.div key={event.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{event.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-[10px] h-4 border-0 ${severityColor[event.severity] || severityColor.low}`}>
                          {event.severity}
                        </Badge>
                        {event.plane && <Badge variant="outline" className="text-[10px] h-4 bg-white/[0.03]">{event.plane}</Badge>}
                        {event.target_type && <Badge variant="outline" className="text-[10px] h-4 bg-white/[0.03]">{event.target_type}</Badge>}
                      </div>
                      {event.justification && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{event.justification}</p>}
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 shrink-0">{new Date(event.created_at).toLocaleString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ── Timeline Tab ───────────────────────────────────────────────

function TimelinePanel() {
  const { data: timeline = [], isLoading } = useUnifiedTimeline();

  const typeConfig: Record<string, { icon: typeof Activity; color: string }> = {
    command: { icon: Terminal, color: "text-purple-400" },
    activity: { icon: Activity, color: "text-blue-400" },
    audit: { icon: Eye, color: "text-amber-400" },
  };

  return (
    <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Unified Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading...
            </div>
          ) : timeline.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Clock className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No events yet</p>
            </div>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 bottom-2 w-px bg-white/[0.06]" />
              <div className="space-y-3">
                {timeline.map((event: any, idx: number) => {
                  const cfg = typeConfig[event.type] || typeConfig.activity;
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={event.id || idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="relative"
                    >
                      <div className={`absolute -left-4 top-1.5 h-3 w-3 rounded-full border-2 border-background ${cfg.color.replace("text-", "bg-")}`} />
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                          <Badge variant="outline" className="text-[10px] h-4 bg-white/[0.03] capitalize">{event.type}</Badge>
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {new Date(event.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">
                          {event.command_text || event.event_type || event.action || event.object_name || "Event"}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ── API Domains Overview ───────────────────────────────────────

function ApiDomainsPanel() {
  const domains = [
    { name: "Auth", path: "/auth", icon: Lock, color: "text-emerald-400", endpoints: ["GET /me", "POST /step-up", "POST /device/verify"] },
    { name: "Devices", path: "/devices", icon: Globe, color: "text-blue-400", endpoints: ["GET /", "POST /register", "POST /{id}/lock", "POST /{id}/wipe"] },
    { name: "Commands", path: "/commands", icon: Terminal, color: "text-purple-400", endpoints: ["GET /", "POST /", "POST /simulate", "POST /{id}/approve"] },
    { name: "AI", path: "/ai", icon: Cpu, color: "text-cyan-400", endpoints: ["POST /chat", "POST /analyze", "GET /suggestions", "POST /explain"] },
    { name: "System", path: "/system", icon: Activity, color: "text-indigo-400", endpoints: ["GET /status", "GET /health", "GET /metrics", "GET /anomalies"] },
    { name: "Sync", path: "/sync", icon: RefreshCw, color: "text-teal-400", endpoints: ["GET /status", "POST /trigger", "POST /pause", "GET /conflicts"] },
    { name: "Security", path: "/security", icon: Shield, color: "text-red-400", endpoints: ["GET /status", "POST /approve", "POST /emergency/lock"] },
    { name: "Notifications", path: "/notifications", icon: Bell, color: "text-amber-400", endpoints: ["GET /", "POST /read", "GET /preferences"] },
    { name: "Audit", path: "/audit", icon: Eye, color: "text-rose-400", endpoints: ["GET /events", "GET /events/{id}"] },
    { name: "Timeline", path: "/timeline", icon: Clock, color: "text-pink-400", endpoints: ["GET /"] },
    { name: "Updates", path: "/updates", icon: Zap, color: "text-orange-400", endpoints: ["GET /", "POST /install", "POST /rollback", "GET /history"] },
    { name: "Policies", path: "/policies", icon: FileText, color: "text-lime-400", endpoints: ["GET /", "POST /", "PUT /{id}", "POST /simulate"] },
    { name: "Apps", path: "/apps", icon: Box, color: "text-fuchsia-400", endpoints: ["GET /", "POST /install", "POST /remove", "GET /{id}/health"] },
    { name: "Logs", path: "/logs", icon: Database, color: "text-sky-400", endpoints: ["GET /", "GET /{id}"] },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {domains.map((domain) => (
        <Card key={domain.name} className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl hover:bg-white/[0.05] transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-9 w-9 rounded-lg bg-white/[0.04] flex items-center justify-center`}>
                <domain.icon className={`h-4.5 w-4.5 ${domain.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium">{domain.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{domain.path}</p>
              </div>
            </div>
            <div className="space-y-1">
              {domain.endpoints.map((ep) => (
                <div key={ep} className="flex items-center gap-1.5">
                  <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/50" />
                  <span className="text-[11px] text-muted-foreground font-mono">{ep}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LIVE STREAM TAB
// ═══════════════════════════════════════════════════════════════

const SCOPE_COLORS: Record<string, string> = {
  system: "bg-blue-500/20 text-blue-400",
  command: "bg-purple-500/20 text-purple-400",
  security: "bg-red-500/20 text-red-400",
  sync: "bg-cyan-500/20 text-cyan-400",
  device: "bg-amber-500/20 text-amber-400",
  update: "bg-emerald-500/20 text-emerald-400",
  ai: "bg-violet-500/20 text-violet-400",
  healing: "bg-teal-500/20 text-teal-400",
  notification: "bg-yellow-500/20 text-yellow-400",
  timeline: "bg-indigo-500/20 text-indigo-400",
  audit: "bg-zinc-500/20 text-zinc-400",
  admin: "bg-rose-500/20 text-rose-400",
};

const RISK_COLORS: Record<string, string> = {
  none: "bg-zinc-500/20 text-zinc-400",
  low: "bg-green-500/20 text-green-400",
  medium: "bg-amber-500/20 text-amber-400",
  high: "bg-orange-500/20 text-orange-400",
  critical: "bg-red-500/20 text-red-400",
};

const ALL_SCOPES: WsEventScope[] = [
  "system", "command", "security", "sync", "device",
  "update", "ai", "healing", "notification", "timeline", "audit",
];

function LiveStreamPanel() {
  const { events, clear } = useWsEventStream(["*"], 200);
  const { state, isConnected, metrics } = useWsConnectionStatus();
  const rate = useWsEventRate();
  const [scopeFilter, setScopeFilter] = useState<Set<WsEventScope>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<WsEventEnvelope | null>(null);

  const filtered = useMemo(() => {
    if (scopeFilter.size === 0) return events;
    return events.filter((e) => scopeFilter.has(e.scope));
  }, [events, scopeFilter]);

  const toggleScope = (scope: WsEventScope) => {
    setScopeFilter((prev) => {
      const next = new Set(prev);
      if (next.has(scope)) next.delete(scope); else next.add(scope);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Connection Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : state === "reconnecting" ? "bg-amber-400 animate-pulse" : "bg-red-400"}`} />
          <span className="text-sm font-medium capitalize">{state}</span>
          <Badge variant="outline" className="text-xs">{rate.toFixed(1)} evt/s</Badge>
          <Badge variant="outline" className="text-xs">{metrics.eventCount} total</Badge>
          {metrics.lastLatencyMs !== null && (
            <Badge variant="outline" className="text-xs">{metrics.lastLatencyMs}ms latency</Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={clear}>
          <RotateCcw className="h-3.5 w-3.5 mr-1" /> Clear
        </Button>
      </div>

      {/* Scope Filter Chips */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_SCOPES.map((scope) => (
          <button
            key={scope}
            onClick={() => toggleScope(scope)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              scopeFilter.size === 0 || scopeFilter.has(scope)
                ? SCOPE_COLORS[scope] ?? "bg-zinc-500/20 text-zinc-400"
                : "bg-white/[0.03] text-muted-foreground opacity-40"
            }`}
          >
            {scope}
          </button>
        ))}
      </div>

      {/* Event Stream + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Live Events ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="divide-y divide-white/[0.04]">
                {filtered.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    <Radio className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Waiting for events...
                  </div>
                )}
                {filtered.map((evt) => (
                  <button
                    key={evt.event_id}
                    onClick={() => setSelectedEvent(evt)}
                    className={`w-full text-left px-4 py-2.5 hover:bg-white/[0.03] transition-colors ${
                      selectedEvent?.event_id === evt.event_id ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${SCOPE_COLORS[evt.scope] ?? ""} border-0 text-[10px]`}>
                          {evt.scope}
                        </Badge>
                        <span className="text-xs font-mono text-foreground">{evt.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {evt.risk_level !== "none" && (
                          <Badge variant="outline" className={`${RISK_COLORS[evt.risk_level] ?? ""} border-0 text-[10px]`}>
                            {evt.risk_level}
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {evt.actor_type}:{evt.actor_id} → {evt.source}
                    </p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detail Panel */}
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Event Detail</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEvent ? (
              <div className="space-y-3 text-xs">
                {([
                  ["Event ID", selectedEvent.event_id],
                  ["Type", selectedEvent.type],
                  ["Scope", selectedEvent.scope],
                  ["Risk", selectedEvent.risk_level],
                  ["Correlation", selectedEvent.correlation_id],
                  ["Actor", `${selectedEvent.actor_type}:${selectedEvent.actor_id}`],
                  ["Source", selectedEvent.source],
                  ["Timestamp", selectedEvent.timestamp],
                  ["Seq", String(selectedEvent.seq ?? "—")],
                  ["Device", selectedEvent.device_id ?? "—"],
                  ["Domain", selectedEvent.domain ?? "—"],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label}>
                    <span className="text-muted-foreground">{label}:</span>
                    <span className="ml-2 font-mono text-foreground break-all">{value}</span>
                  </div>
                ))}
                <div>
                  <span className="text-muted-foreground">Payload:</span>
                  <pre className="mt-1 p-2 rounded bg-white/[0.03] overflow-auto text-[10px] max-h-48 font-mono">
                    {JSON.stringify(selectedEvent.payload, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Select an event to view details</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// OBSERVABILITY TAB
// ═══════════════════════════════════════════════════════════════

function ObservabilityPanel() {
  const { state, metrics, activeScopes } = useWsConnectionStatus();
  const rate = useWsEventRate();

  const metricCards = [
    { label: "Connection State", value: state, icon: Radio, color: state === "connected" ? "text-emerald-400" : "text-amber-400" },
    { label: "Total Events", value: metrics.eventCount.toLocaleString(), icon: Activity, color: "text-blue-400" },
    { label: "Event Rate", value: `${rate.toFixed(1)}/s`, icon: Zap, color: "text-purple-400" },
    { label: "Connects", value: metrics.connectCount, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Disconnects", value: metrics.disconnectCount, icon: XCircle, color: "text-red-400" },
    { label: "Reconnects", value: metrics.reconnectCount, icon: RefreshCw, color: "text-amber-400" },
    { label: "Last Latency", value: metrics.lastLatencyMs !== null ? `${metrics.lastLatencyMs}ms` : "—", icon: Clock, color: "text-cyan-400" },
    { label: "Stale Corrections", value: metrics.staleCorrections, icon: AlertTriangle, color: "text-orange-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metricCards.map((card) => (
          <Card key={card.label} className="bg-white/[0.02] border-white/[0.06]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <card.icon className={`h-4 w-4 ${card.color}`} />
                <span className={`text-lg font-bold ${card.color}`}>{String(card.value)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Subscriptions */}
      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Active Subscriptions by Scope
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {activeScopes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active scoped subscriptions (wildcard active)</p>
            ) : (
              activeScopes.map((scope) => (
                <Badge key={scope} variant="outline" className={`${SCOPE_COLORS[scope] ?? ""} border-0`}>
                  {scope}
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connection Timeline */}
      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            Connection Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Uptime</span>
              <span className="font-mono">
                {metrics.connectionStartedAt
                  ? `${Math.floor((Date.now() - metrics.connectionStartedAt) / 60_000)}m`
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Event</span>
              <span className="font-mono">
                {metrics.lastEventAt
                  ? new Date(metrics.lastEventAt).toLocaleTimeString()
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Reconnect Success Rate</span>
              <span className="font-mono">
                {metrics.reconnectCount > 0
                  ? `${Math.round((metrics.connectCount / (metrics.connectCount + metrics.reconnectCount)) * 100)}%`
                  : "100%"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Duplicate Suppressed</span>
              <span className="font-mono">{metrics.staleCorrections}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function CommunicationHub() {
  const [activeTab, setActiveTab] = useState("commands");

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Network className="h-5 w-5 text-primary" />
            </div>
            Communication Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Unified API Gateway • Commands • Events • Real-Time Channels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
            Gateway Online
          </Badge>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/[0.03] border border-white/[0.06] p-1 h-auto flex-wrap">
          {[
            { value: "commands", label: "Commands", icon: Terminal },
            { value: "live", label: "Live Stream", icon: Radio },
            { value: "system", label: "System", icon: Activity },
            { value: "security", label: "Security", icon: Shield },
            { value: "sync", label: "Sync", icon: RefreshCw },
            { value: "notifications", label: "Notifications", icon: Bell },
            { value: "updates", label: "Updates", icon: Zap },
            { value: "policies", label: "Policies", icon: FileText },
            { value: "apps", label: "Apps", icon: Box },
            { value: "audit", label: "Audit", icon: Eye },
            { value: "timeline", label: "Timeline", icon: Clock },
            { value: "observability", label: "Observability", icon: Activity },
            { value: "api", label: "API Domains", icon: Network },
          ].map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary gap-1.5 text-xs"
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="commands"><CommandsPanel /></TabsContent>
          <TabsContent value="live"><LiveStreamPanel /></TabsContent>
          <TabsContent value="system"><SystemPanel /></TabsContent>
          <TabsContent value="security"><SecurityPanel /></TabsContent>
          <TabsContent value="sync"><SyncPanel /></TabsContent>
          <TabsContent value="notifications"><NotificationsPanel /></TabsContent>
          <TabsContent value="updates"><UpdatesPanel /></TabsContent>
          <TabsContent value="policies"><PoliciesPanel /></TabsContent>
          <TabsContent value="apps"><AppsPanel /></TabsContent>
          <TabsContent value="audit"><AuditPanel /></TabsContent>
          <TabsContent value="timeline"><TimelinePanel /></TabsContent>
          <TabsContent value="observability"><ObservabilityPanel /></TabsContent>
          <TabsContent value="api"><ApiDomainsPanel /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
