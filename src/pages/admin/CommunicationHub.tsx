// ═══════════════════════════════════════════════════════════════
// SITA OS — Communication Architecture Hub
// Unified view of all API domains, commands, events, and channels
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
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
import { useCommands, useCreateCommand, useApproveCommand, useDenyCommand, useCancelCommand } from "@/hooks/use-os-api";
import { useSystemStatus, useSystemHealth } from "@/hooks/use-os-api";
import { useSecurityPosture, useSecurityPendingApprovals, useEmergencyLock } from "@/hooks/use-os-api";
import { useNotifications, useNotificationManager } from "@/hooks/use-os-api";
import { usePolicies, usePolicyManager } from "@/hooks/use-os-api";
import { useManagedApps, useAppManager } from "@/hooks/use-os-api";
import { useUnifiedTimeline, useAuditTimeline } from "@/hooks/use-os-api";
import { useSyncStatus, useSyncControl } from "@/hooks/use-os-api";
import { useUpdateControl, useUpdateHistory } from "@/hooks/use-os-api";
import { channelManager } from "@/lib/services/realtime-gateway/resilient-channel";
import type { CommandStatus } from "@/lib/api/os-api-client";

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
  const { data: status, isLoading: statusLoading } = useSystemStatus();
  const { data: health } = useSystemHealth();

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Health", value: (status as any)?.health || "—", icon: Activity, color: "text-emerald-400" },
          { label: "Devices", value: (status as any)?.devices ?? "—", icon: Globe, color: "text-blue-400" },
          { label: "Active Commands", value: (status as any)?.active_commands ?? "—", icon: Terminal, color: "text-purple-400" },
          { label: "Incidents", value: (status as any)?.incidents ?? "—", icon: AlertTriangle, color: "text-amber-400" },
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
            {((health as any)?.subsystems || []).map((sub: any) => (
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
  const { data: posture } = useSecurityPosture();
  const { data: approvals = [] } = useSecurityPendingApprovals();
  const emergencyLock = useEmergencyLock();

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
            <p className="text-lg font-bold capitalize">{(posture as any)?.posture || "Normal"}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">Pending Approvals</span>
            </div>
            <p className="text-lg font-bold">{(posture as any)?.pending_approvals ?? approvals.length}</p>
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
            {((posture as any)?.devices || []).map((device: any) => (
              <div key={device.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${device.trust_level === "trusted" ? "bg-emerald-400" : device.trust_level === "revoked" ? "bg-red-400" : "bg-amber-400"}`} />
                  <span className="text-sm">{device.device_name || device.id?.slice(0, 12)}</span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-white/[0.03]">{device.trust_level}</Badge>
              </div>
            ))}
            {(!posture || ((posture as any)?.devices || []).length === 0) && (
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
    create.mutate(newPolicy as any);
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
              {/* Timeline line */}
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
            { value: "system", label: "System", icon: Activity },
            { value: "security", label: "Security", icon: Shield },
            { value: "policies", label: "Policies", icon: FileText },
            { value: "apps", label: "Apps", icon: Box },
            { value: "timeline", label: "Timeline", icon: Clock },
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
          <TabsContent value="system"><SystemPanel /></TabsContent>
          <TabsContent value="security"><SecurityPanel /></TabsContent>
          <TabsContent value="policies"><PoliciesPanel /></TabsContent>
          <TabsContent value="apps"><AppsPanel /></TabsContent>
          <TabsContent value="timeline"><TimelinePanel /></TabsContent>
          <TabsContent value="api"><ApiDomainsPanel /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
