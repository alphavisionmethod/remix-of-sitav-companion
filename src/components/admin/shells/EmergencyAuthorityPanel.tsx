import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldAlert, Lock, Pause, UserX, Snowflake, LogOut, ShieldOff,
  AlertTriangle, CheckCircle, Clock, Eye, Activity
} from "lucide-react";
import { SafetyConfirmDialog } from "./SafetyConfirmDialog";
import type { SafetyAction } from "./SafetyConfirmDialog";
import { WhyTooltip } from "./WhyTooltip";

interface EmergencyAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  safetyAction: SafetyAction;
  lastUsed?: string;
  status: "ready" | "active" | "cooldown";
}

const EMERGENCY_ACTIONS: EmergencyAction[] = [
  {
    id: "em-lock", label: "Lock Device", description: "Immediately lock a specific device remotely. All sessions suspended.",
    icon: Lock, color: "text-red-400", bgColor: "bg-red-500/10",
    safetyAction: {
      title: "Remote Device Lock", description: "This will immediately lock the target device, suspending all active sessions and requiring re-authentication.",
      riskLevel: "high", affectedSystems: ["device-service", "auth-service", "session-service"],
      affectedUsers: "Single device user", rollbackAvailable: true, rollbackDescription: "Unlock via App approval within 24 hours.",
      estimatedDuration: "< 5 seconds",
    },
    lastUsed: "Never", status: "ready",
  },
  {
    id: "em-sync", label: "Pause Sync", description: "Halt all sync operations globally. Data remains safe, changes queue locally.",
    icon: Pause, color: "text-amber-400", bgColor: "bg-amber-500/10",
    safetyAction: {
      title: "Emergency Sync Pause", description: "All sync operations will be paused globally. Local changes will queue and resume when sync is restored.",
      riskLevel: "high", affectedSystems: ["sync-service", "storage-service"],
      affectedUsers: "All users", rollbackAvailable: true, rollbackDescription: "Resume sync with one click. Queued changes will reconcile automatically.",
      estimatedDuration: "Immediate",
    },
    lastUsed: "3 days ago", status: "ready",
  },
  {
    id: "em-trust", label: "Revoke Trust", description: "Remove trust designation from a device. It must re-authenticate through the full trust flow.",
    icon: ShieldOff, color: "text-orange-400", bgColor: "bg-orange-500/10",
    safetyAction: {
      title: "Revoke Device Trust", description: "The target device will lose its trusted status. The user must complete the full re-verification flow including App approval.",
      riskLevel: "critical", affectedSystems: ["trust-service", "auth-service", "device-service"],
      affectedUsers: "Single device", rollbackAvailable: false, rollbackDescription: "Device must complete full re-trust flow.",
      estimatedDuration: "< 2 seconds",
    },
    lastUsed: "Never", status: "ready",
  },
  {
    id: "em-freeze", label: "Account Freeze", description: "Freeze entire account. All sessions terminated, all sync paused, all approvals blocked.",
    icon: Snowflake, color: "text-cyan-400", bgColor: "bg-cyan-500/10",
    safetyAction: {
      title: "Emergency Account Freeze", description: "The entire account will be frozen. All active sessions will be terminated, sync paused, and new approvals blocked until manually restored.",
      riskLevel: "critical", affectedSystems: ["auth-service", "session-service", "sync-service", "approval-service"],
      affectedUsers: "All account users and devices", rollbackAvailable: true, rollbackDescription: "Unfreeze requires dual approval from admin.",
      estimatedDuration: "< 10 seconds",
    },
    lastUsed: "Never", status: "ready",
  },
  {
    id: "em-signout", label: "Force Sign-Out", description: "Sign out all sessions across all devices immediately.",
    icon: LogOut, color: "text-purple-400", bgColor: "bg-purple-500/10",
    safetyAction: {
      title: "Force Sign-Out Everywhere", description: "All active sessions across all devices will be immediately invalidated. Users must re-authenticate.",
      riskLevel: "critical", affectedSystems: ["auth-service", "session-service"],
      affectedUsers: "All users on all devices", rollbackAvailable: false,
      estimatedDuration: "< 5 seconds",
    },
    lastUsed: "Never", status: "ready",
  },
  {
    id: "em-approvals", label: "Freeze Approvals", description: "Block all pending and new approval requests. Nothing gets approved until lifted.",
    icon: UserX, color: "text-pink-400", bgColor: "bg-pink-500/10",
    safetyAction: {
      title: "Freeze Approval Queue", description: "All pending approvals will be held and no new approvals will be processed until the freeze is lifted.",
      riskLevel: "high", affectedSystems: ["approval-service", "governance-engine"],
      affectedUsers: "All pending approval requesters", rollbackAvailable: true, rollbackDescription: "Unfreeze restores normal approval flow. No requests are lost.",
      estimatedDuration: "Immediate",
    },
    lastUsed: "Never", status: "ready",
  },
];

export function EmergencyAuthorityPanel() {
  const [confirmAction, setConfirmAction] = useState<EmergencyAction | null>(null);
  const [recentActions, setRecentActions] = useState<Array<{ id: string; action: string; time: string; result: string }>>([
    { id: "ra-1", action: "Sync Pause", time: "3 days ago", result: "Resolved — resumed after investigation" },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-400" />
            Emergency Authority
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            High-priority emergency controls. Every action requires confirmation and is fully audited.
          </p>
        </div>
        <Badge variant="outline" className="text-[9px] bg-red-500/5 text-red-400 border-red-500/20">
          <AlertTriangle className="h-2.5 w-2.5 mr-1" /> App-Exclusive Actions
        </Badge>
      </div>

      {/* Warning Banner */}
      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent className="p-3 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          <p className="text-xs text-foreground">
            These are emergency controls reserved for the App/Admin control surface. Each action goes through
            typed confirmation, dual approval for critical operations, and generates an immutable audit receipt.
          </p>
        </CardContent>
      </Card>

      {/* Emergency Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {EMERGENCY_ACTIONS.map((action, i) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={cn(
              "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] transition-all group",
              action.status === "active" && "ring-1 ring-red-500/40",
              action.status === "cooldown" && "opacity-60"
            )}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", action.bgColor)}>
                    <action.icon className={cn("h-5 w-5", action.color)} />
                  </div>
                  <Badge variant="outline" className={cn("text-[8px]",
                    action.status === "ready" ? "text-emerald-400 border-emerald-500/20" :
                    action.status === "active" ? "text-red-400 border-red-500/20 animate-pulse" :
                    "text-muted-foreground"
                  )}>
                    {action.status === "ready" ? "Ready" : action.status === "active" ? "Active" : "Cooldown"}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground">{action.label}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{action.description}</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[9px] text-muted-foreground">Last used: {action.lastUsed}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("h-7 text-[10px] gap-1", action.color)}
                    onClick={() => setConfirmAction(action)}
                    disabled={action.status === "cooldown"}
                  >
                    <action.icon className="h-3 w-3" />
                    Execute
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Live Trust State */}
      <Card className="border-white/[0.06] bg-white/[0.03]">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-primary" /> Live Trust State
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Trusted Devices", value: "12", status: "healthy" },
              { label: "Active Sessions", value: "8", status: "healthy" },
              { label: "Pending Approvals", value: "2", status: "warning" },
              { label: "Frozen Items", value: "0", status: "healthy" },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{item.label}</span>
                <p className={cn("text-lg font-bold mt-0.5",
                  item.status === "healthy" ? "text-emerald-400" : "text-amber-400"
                )}>{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Emergency Actions */}
      <Card className="border-white/[0.06] bg-white/[0.03]">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-muted-foreground" /> Recent Emergency Actions
          </h3>
          <div className="space-y-2">
            {recentActions.map(ra => (
              <div key={ra.id} className="flex items-center gap-3 text-xs p-2 rounded-lg bg-white/[0.02]">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="font-medium text-foreground">{ra.action}</span>
                <span className="text-muted-foreground">{ra.time}</span>
                <span className="text-muted-foreground/60 ml-auto text-[10px]">{ra.result}</span>
              </div>
            ))}
            {recentActions.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No emergency actions used recently</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Safety Confirm Dialog */}
      {confirmAction && (
        <SafetyConfirmDialog
          open={!!confirmAction}
          onOpenChange={open => { if (!open) setConfirmAction(null); }}
          action={confirmAction.safetyAction}
          onConfirm={() => {
            setRecentActions(prev => [{
              id: `ra-${Date.now()}`,
              action: confirmAction.label,
              time: "Just now",
              result: "Executed successfully",
            }, ...prev]);
            setConfirmAction(null);
          }}
        />
      )}
    </div>
  );
}
