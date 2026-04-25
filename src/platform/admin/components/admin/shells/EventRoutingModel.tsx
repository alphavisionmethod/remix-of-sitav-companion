import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Monitor, Smartphone, Cloud, Radio, CheckCircle, XCircle,
  ArrowRight, Activity, Layers, Shield, AlertTriangle, RefreshCw,
  Cpu, Zap, Lock, FileText, Bell, Eye
} from "lucide-react";
import { WhyTooltip } from "./WhyTooltip";

interface EventType {
  name: string;
  icon: React.ElementType;
  description: string;
}

const OS_EVENTS: EventType[] = [
  { name: "file.changed", icon: FileText, description: "Local file modification detected by OS watcher" },
  { name: "app.crashed", icon: AlertTriangle, description: "Application process terminated unexpectedly" },
  { name: "update.started", icon: Zap, description: "System update download/installation initiated" },
  { name: "update.completed", icon: CheckCircle, description: "System update successfully applied" },
  { name: "sync.job-started", icon: RefreshCw, description: "Local sync client begins upload/download cycle" },
  { name: "sync.job-failed", icon: XCircle, description: "Sync operation failed — timeout, network, or conflict" },
  { name: "trust.enforcement-triggered", icon: Shield, description: "Local trust policy restriction activated" },
  { name: "process.killed", icon: Cpu, description: "Process terminated — OOM, user action, or policy" },
  { name: "optimization.completed", icon: Activity, description: "Local performance tuning cycle finished" },
  { name: "repair.step-completed", icon: CheckCircle, description: "Local repair action step executed successfully" },
  { name: "hardware.state-changed", icon: Monitor, description: "Hardware status change — battery, network, peripherals" },
];

const CLOUD_EVENTS: EventType[] = [
  { name: "command.planned", icon: Radio, description: "Command parsed and execution plan created" },
  { name: "approval.requested", icon: Lock, description: "Approval request sent to App for risky action" },
  { name: "approval.denied", icon: XCircle, description: "User denied approval request in App" },
  { name: "rollout.changed", icon: Zap, description: "Rollout ring expanded, paused, or rolled back" },
  { name: "trust.score-changed", icon: Shield, description: "Device or account trust score recalculated" },
  { name: "sync.conflict-resolved", icon: RefreshCw, description: "Cloud resolved competing file modifications" },
  { name: "device.revoked", icon: AlertTriangle, description: "Device trust revoked — sessions invalidated" },
  { name: "update.available", icon: Zap, description: "New update available for device cohort" },
  { name: "policy.changed", icon: FileText, description: "Governance policy updated across ecosystem" },
  { name: "verification.failed", icon: XCircle, description: "Post-execution verification check failed" },
  { name: "rollback.triggered", icon: Activity, description: "Automated or manual rollback initiated" },
];

const APP_EVENTS: EventType[] = [
  { name: "approval.granted", icon: CheckCircle, description: "User approved risky action in App" },
  { name: "command.initiated", icon: Radio, description: "User initiated command from App control surface" },
  { name: "command.canceled", icon: XCircle, description: "User canceled pending command before execution" },
  { name: "emergency.activated", icon: AlertTriangle, description: "Emergency authority mode activated" },
  { name: "notification.opened", icon: Bell, description: "User opened and acknowledged notification" },
  { name: "control.action-selected", icon: Smartphone, description: "User selected control action in device view" },
  { name: "authority.session-started", icon: Lock, description: "Remote authority session opened for device" },
  { name: "authority.session-ended", icon: Shield, description: "Remote authority session closed / expired" },
];

interface InfraItem {
  label: string;
  description: string;
  status: "implemented" | "planned" | "required";
}

const INFRA_CHECKLIST: InfraItem[] = [
  { label: "Event IDs", description: "Globally unique identifier for every event instance", status: "implemented" },
  { label: "Correlation IDs", description: "Link related events across the command lifecycle", status: "implemented" },
  { label: "Actor/Source Tags", description: "Identify which surface or service emitted the event", status: "implemented" },
  { label: "Trust Tags", description: "Attach current trust level of the actor/device at event time", status: "implemented" },
  { label: "Risk Tags", description: "Classify event risk level for routing and alerting", status: "implemented" },
  { label: "Visibility Scope", description: "Define which surfaces should see this event (OS, App, Admin)", status: "implemented" },
  { label: "Audit Linkage", description: "Reference to audit trail entry for compliance and review", status: "implemented" },
  { label: "Retry/Idempotency", description: "Support safe retry with deduplication keys", status: "implemented" },
];

const STATUS_COLORS = {
  implemented: "text-emerald-400 border-emerald-500/20",
  planned: "text-amber-400 border-amber-500/20",
  required: "text-blue-400 border-blue-500/20",
};

function EventColumn({ title, icon: Icon, color, bg, border, events }: {
  title: string; icon: React.ElementType; color: string; bg: string; border: string; events: EventType[];
}) {
  return (
    <Card className={cn("border", border, bg)}>
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", color)} />
          <CardTitle className={cn("text-xs font-semibold", color)}>{title}</CardTitle>
          <Badge variant="outline" className={cn("text-[8px] px-1 py-0 ml-auto", color, border)}>
            {events.length} events
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="space-y-1">
          {events.map((event, i) => (
            <motion.div
              key={event.name}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/[0.03] transition-colors group"
            >
              <event.icon className={cn("h-3 w-3 mt-0.5 shrink-0", color)} />
              <div className="flex-1 min-w-0">
                <code className="text-[10px] font-mono text-foreground">{event.name}</code>
                <p className="text-[8px] text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">{event.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function EventRoutingModel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" />
          Event Routing Model
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Complete event taxonomy across OS, Cloud, and App surfaces — the architectural glue of the ecosystem
        </p>
      </div>

      {/* Event Flow Diagram */}
      <Card className="border-white/[0.06] bg-white/[0.03]">
        <CardContent className="py-4 px-4">
          <div className="flex items-center justify-center gap-4">
            {[
              { label: "OS Emits", count: OS_EVENTS.length, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: Monitor },
              { label: "Cloud Emits", count: CLOUD_EVENTS.length, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30", icon: Cloud },
              { label: "App Emits", count: APP_EVENTS.length, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", icon: Smartphone },
            ].map((node, i) => (
              <div key={node.label} className="flex items-center gap-4">
                <div className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl border", node.bg, node.border)}>
                  <node.icon className={cn("h-6 w-6", node.color)} />
                  <span className={cn("text-xs font-semibold", node.color)}>{node.label}</span>
                  <span className="text-lg font-bold text-foreground">{node.count}</span>
                </div>
                {i < 2 && <ArrowRight className="h-4 w-4 text-muted-foreground/30" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Three-Column Event Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <EventColumn title="OS Events" icon={Monitor} color="text-blue-400" bg="bg-blue-500/[0.02]" border="border-blue-500/10" events={OS_EVENTS} />
        <EventColumn title="Cloud Events" icon={Cloud} color="text-cyan-400" bg="bg-cyan-500/[0.02]" border="border-cyan-500/10" events={CLOUD_EVENTS} />
        <EventColumn title="App Events" icon={Smartphone} color="text-purple-400" bg="bg-purple-500/[0.02]" border="border-purple-500/10" events={APP_EVENTS} />
      </div>

      {/* Infrastructure Checklist */}
      <Card className="border-white/[0.06] bg-white/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Event Infrastructure Checklist
            <WhyTooltip explanation="Every event in the system must include these infrastructure properties for full traceability, audit compliance, and safe retry behavior." />
            <Badge variant="outline" className="text-[8px] text-emerald-400 border-emerald-500/20 ml-auto">
              {INFRA_CHECKLIST.filter(i => i.status === "implemented").length}/{INFRA_CHECKLIST.length} implemented
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {INFRA_CHECKLIST.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle className={cn("h-3 w-3", item.status === "implemented" ? "text-emerald-400" : "text-amber-400")} />
                  <span className="text-[10px] font-semibold text-foreground">{item.label}</span>
                </div>
                <p className="text-[8px] text-muted-foreground leading-relaxed">{item.description}</p>
                <Badge variant="outline" className={cn("text-[7px] px-1 py-0 mt-1", STATUS_COLORS[item.status])}>
                  {item.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
