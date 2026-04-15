// ═══════════════════════════════════════════════════════════════
// SITA OS — Data Flow Map Admin
// Visual mapping of data flows between planes and services
// ═══════════════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, User, Shield, Wrench, Smartphone, RefreshCw,
  HardDrive, Bell, FileText, Lock, Globe, Activity
} from "lucide-react";

interface DataFlow {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
  planes: string[];
  category: string;
}

interface FlowStep {
  actor: string;
  action: string;
  target: string;
  plane: string;
  icon: typeof User;
}

const FLOWS: DataFlow[] = [
  {
    id: "user-signin",
    name: "User Sign-In",
    description: "User authenticates on OS → session created → device enrolled → sync started",
    category: "identity",
    planes: ["product", "shared-core"],
    steps: [
      { actor: "OS Client", action: "authenticate", target: "User BFF", plane: "product", icon: User },
      { actor: "User BFF", action: "validate", target: "Auth Service", plane: "shared-core", icon: Lock },
      { actor: "Auth Service", action: "create session", target: "Session Store", plane: "shared-core", icon: Shield },
      { actor: "User BFF", action: "enroll device", target: "Device Service", plane: "shared-core", icon: Smartphone },
      { actor: "Device Service", action: "emit event", target: "Event Bus", plane: "shared-core", icon: Activity },
    ],
  },
  {
    id: "admin-device-revoke",
    name: "Admin Revokes Device",
    description: "Admin initiates device revocation → safety check → audit → user notified",
    category: "admin-action",
    planes: ["control", "shared-core", "product"],
    steps: [
      { actor: "Admin UI", action: "request revoke", target: "Admin BFF", plane: "control", icon: Shield },
      { actor: "Admin BFF", action: "safety check", target: "Safety Rails", plane: "control", icon: Wrench },
      { actor: "Safety Rails", action: "dry-run preview", target: "Admin", plane: "control", icon: FileText },
      { actor: "Admin BFF", action: "revoke device", target: "Device Service", plane: "shared-core", icon: Smartphone },
      { actor: "Device Service", action: "audit log", target: "Audit Service", plane: "shared-core", icon: FileText },
      { actor: "Notification Router", action: "notify user", target: "User", plane: "product", icon: Bell },
    ],
  },
  {
    id: "sync-preference-change",
    name: "User Changes Sync Preference",
    description: "User updates sync settings → policy updated → sync service reconfigured",
    category: "sync",
    planes: ["product", "shared-core"],
    steps: [
      { actor: "OS Settings", action: "update preference", target: "User BFF", plane: "product", icon: User },
      { actor: "User BFF", action: "update policy", target: "Policy Service", plane: "shared-core", icon: Globe },
      { actor: "Policy Service", action: "emit change", target: "Event Bus", plane: "shared-core", icon: Activity },
      { actor: "Sync Service", action: "reconfigure", target: "Sync Engine", plane: "shared-core", icon: RefreshCw },
    ],
  },
  {
    id: "support-repair",
    name: "Support Triggers Repair",
    description: "Support console → Admin BFF → repair orchestration → worker → audit + notification",
    category: "support",
    planes: ["control", "shared-core", "product"],
    steps: [
      { actor: "Support Console", action: "trigger repair", target: "Admin BFF", plane: "control", icon: Wrench },
      { actor: "Admin BFF", action: "create job", target: "Workflow Engine", plane: "shared-core", icon: Activity },
      { actor: "Workflow Engine", action: "execute", target: "Repair Worker", plane: "shared-core", icon: Wrench },
      { actor: "Repair Worker", action: "write audit", target: "Audit Service", plane: "shared-core", icon: FileText },
      { actor: "Notification Router", action: "notify user", target: "User", plane: "product", icon: Bell },
    ],
  },
  {
    id: "quota-warning",
    name: "Quota Warning Flow",
    description: "Quota service detects threshold → event emitted → user and admin notified",
    category: "storage",
    planes: ["shared-core", "product", "control"],
    steps: [
      { actor: "Quota Service", action: "threshold check", target: "Event Bus", plane: "shared-core", icon: HardDrive },
      { actor: "Notification Router", action: "route to user", target: "User Notifications", plane: "product", icon: Bell },
      { actor: "Notification Router", action: "route to admin", target: "Admin Alerts", plane: "control", icon: Shield },
    ],
  },
];

const PLANE_COLORS: Record<string, string> = {
  control: "border-destructive/30 bg-destructive/5",
  product: "border-primary/30 bg-primary/5",
  "shared-core": "border-amber-500/30 bg-amber-500/5",
};

const PLANE_BADGE: Record<string, string> = {
  control: "bg-destructive/20 text-destructive",
  product: "bg-primary/20 text-primary",
  "shared-core": "bg-amber-500/20 text-amber-400",
};

const CAT_COLORS: Record<string, string> = {
  identity: "bg-blue-500/20 text-blue-400",
  "admin-action": "bg-destructive/20 text-destructive",
  sync: "bg-emerald-500/20 text-emerald-400",
  support: "bg-amber-500/20 text-amber-400",
  storage: "bg-purple-500/20 text-purple-400",
};

export function DataFlowMapAdmin() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Data Flow Map</h2>
          <p className="text-sm text-muted-foreground">End-to-end data flows across planes and services with correlation awareness</p>
        </div>
        <div className="ml-auto flex gap-1.5">
          {(["product", "shared-core", "control"] as const).map((p) => (
            <Badge key={p} className={`text-[9px] capitalize ${PLANE_BADGE[p]}`}>{p}</Badge>
          ))}
        </div>
      </div>

      {FLOWS.map((flow) => (
        <Card key={flow.id} className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{flow.name}</CardTitle>
              <Badge className={`text-[9px] ${CAT_COLORS[flow.category] ?? ""}`}>{flow.category}</Badge>
            </div>
            <CardDescription>{flow.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {flow.steps.map((step, i) => {
                const Icon = step.icon;
                const planeColor = PLANE_COLORS[step.plane] ?? "";
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 text-center text-[10px] font-mono text-muted-foreground/60">{i + 1}</div>
                    <div className={`flex-1 flex items-center gap-2 p-2.5 rounded-lg border ${planeColor}`}>
                      <div className="h-6 w-6 rounded-md bg-muted/30 flex items-center justify-center shrink-0">
                        <Icon className="h-3.5 w-3.5 text-foreground/70" />
                      </div>
                      <span className="text-xs font-medium min-w-[100px]">{step.actor}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground">{step.action}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-xs font-medium">{step.target}</span>
                      <Badge className={`text-[8px] ml-auto ${PLANE_BADGE[step.plane] ?? ""}`}>{step.plane}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
