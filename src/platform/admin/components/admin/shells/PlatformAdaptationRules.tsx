import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Monitor, Smartphone, Cloud, Shield, Zap, Eye, Bell,
  CheckCircle, AlertTriangle, Lock, ArrowRight
} from "lucide-react";
import { WhyTooltip } from "./WhyTooltip";
import { useDataMode } from "@/contexts/DataModeContext";

interface AdaptationRule {
  id: string;
  category: string;
  osRule: string;
  appRule: string;
  cloudRole: string;
  active: boolean;
}

const RULES: AdaptationRule[] = [
  { id: "ar-1", category: "Speed Priority", osRule: "Prioritize local execution speed and cache hits", appRule: "Prioritize trust clarity and control responsiveness", cloudRole: "Coordinate state — not latency-critical", active: true },
  { id: "ar-2", category: "Complexity Handling", osRule: "Hide global complexity — show local context only", appRule: "Show aggregated status and fleet-level overview", cloudRole: "Compute aggregations and anomaly detection", active: true },
  { id: "ar-3", category: "Confirmation Flow", osRule: "Minimal confirmation for local actions", appRule: "Confirmation-heavy for remote and destructive actions", cloudRole: "Evaluate risk and determine confirmation requirement", active: true },
  { id: "ar-4", category: "Error Display", osRule: "Show recoverable errors inline, queue retries", appRule: "Show errors as alerts with recommended next steps", cloudRole: "Classify error severity and generate remediation", active: true },
  { id: "ar-5", category: "Offline Behavior", osRule: "Continue working — queue changes locally", appRule: "Show degraded state — indicate offline limitations", cloudRole: "Reconcile queued state upon reconnection", active: true },
  { id: "ar-6", category: "Notification Routing", osRule: "Ambient, non-intrusive OS-level notifications", appRule: "Prominent alerts for trust, security, approval events", cloudRole: "Route notifications by urgency and platform", active: true },
  { id: "ar-7", category: "Trust Display", osRule: "Contextual badges — subtle, in-flow", appRule: "Authoritative shields — prominent, action-oriented", cloudRole: "Compute trust scores and policy evaluations", active: true },
  { id: "ar-8", category: "Data Presentation", osRule: "Immersive workspace — data embedded in context", appRule: "Dashboard cards — data aggregated for overview", cloudRole: "Store canonical data — serve appropriate views", active: true },
  { id: "ar-9", category: "Action Language", osRule: "Direct: Open, Run, Edit, Save, Continue", appRule: "Supervisory: Approve, Deny, Lock, Monitor, Send", cloudRole: "Evaluative: Validate, Resolve, Coordinate, Score", active: true },
  { id: "ar-10", category: "Recovery Flow", osRule: "Auto-retry, local cache fallback, queue for later", appRule: "Alert user, show rollback options, escalation path", cloudRole: "Orchestrate recovery sequence, verify integrity", active: true },
];

interface ExclusiveFeature {
  label: string;
  description: string;
}

const OS_EXCLUSIVE: ExclusiveFeature[] = [
  { label: "App Execution", description: "Run native and web apps in windowed environment" },
  { label: "Workspace Immersion", description: "Deep spatial continuity and context preservation" },
  { label: "Local Performance Tuning", description: "Device-specific optimization without cloud" },
  { label: "Creative Flow", description: "Uninterrupted editing, composing, and building" },
  { label: "File Access", description: "Direct device-local file system interaction" },
  { label: "Continuity Destination", description: "Receive workspace handoffs from other devices" },
];

const APP_EXCLUSIVE: ExclusiveFeature[] = [
  { label: "Device Trust Approvals", description: "Authorize new and untrusted devices" },
  { label: "Emergency Device Control", description: "Lock, freeze, and revoke remotely" },
  { label: "Security Timeline", description: "Full security event and trust audit history" },
  { label: "Cross-Device Status Map", description: "Fleet visibility and health overview" },
  { label: "Remote Session Revoke", description: "Terminate sessions on any device" },
  { label: "Command Approvals", description: "Approve/deny high-risk admin commands" },
];

const CLOUD_EXCLUSIVE: ExclusiveFeature[] = [
  { label: "Canonical State", description: "Single source of truth for all data" },
  { label: "Sync Conflict Resolution", description: "Deterministic reconciliation of competing edits" },
  { label: "Trust Scoring", description: "Continuous risk and trust evaluation" },
  { label: "Policy Evaluation", description: "Enforce governance rules across all surfaces" },
  { label: "Command Planning", description: "Orchestrate multi-step action sequences" },
  { label: "Event Correlation", description: "Cross-service incident and pattern detection" },
];

function ExclusiveList({ items, icon: Icon, color }: { items: ExclusiveFeature[]; icon: React.ElementType; color: string }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-start gap-2.5"
        >
          <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", color)} />
          <div>
            <p className="text-xs font-medium text-foreground">{item.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface CopyPair {
  os: string;
  app: string;
  rationale: string;
}

const UX_COPY_PAIRS: CopyPair[] = [
  { os: "Open", app: "Approve", rationale: "OS performs direct actions; App grants authorization" },
  { os: "Continue", app: "Deny", rationale: "OS preserves continuity; App exercises control authority" },
  { os: "Run", app: "Control", rationale: "OS executes processes; App oversees and steers" },
  { os: "Save", app: "Lock", rationale: "OS persists local state; App restricts access" },
  { os: "Restore", app: "Revoke", rationale: "OS recovers state; App removes trust/access" },
  { os: "Resume", app: "Monitor", rationale: "OS continues interrupted work; App observes and tracks" },
  { os: "Install", app: "Review", rationale: "OS deploys locally; App evaluates and audits" },
  { os: "Improve locally", app: "Send command", rationale: "OS optimizes on-device; App dispatches remote instructions" },
];

interface VisibilityItem {
  label: string;
  description: string;
}

const OS_VISIBILITY: VisibilityItem[] = [
  { label: "Local status", description: "CPU, memory, disk, network health indicators" },
  { label: "Work continuity", description: "Open windows, active workspace, recent files" },
  { label: "Local sync state", description: "Upload/download progress, pending changes" },
  { label: "Contextual trust messages", description: "Subtle trust badges on apps and files" },
  { label: "App/runtime state", description: "Running processes, app performance metrics" },
  { label: "Update/install progress", description: "Local installation and update stages" },
];

const APP_VISIBILITY: VisibilityItem[] = [
  { label: "Account-wide view", description: "Holistic account health and status overview" },
  { label: "Device fleet view", description: "All trusted devices with status and trust level" },
  { label: "Trust/security state", description: "Security posture, active alerts, trust scores" },
  { label: "Command history", description: "Recent commands, their outcomes, and receipts" },
  { label: "Pending approvals", description: "Actions awaiting user authorization" },
  { label: "Rollout/update overview", description: "Fleet-wide update status and rollout rings" },
  { label: "Remote action results", description: "Outcomes of remotely issued commands" },
];

export function PlatformAdaptationRules() {
  const { isDemoMode } = useDataMode();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Platform Adaptation Rules
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          How the ecosystem adapts behavior based on surface: OS (execution), App (control), Cloud (truth)
        </p>
      </div>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/[0.03]">
          <TabsTrigger value="rules" className="gap-1.5 text-xs">
            <Zap className="h-3.5 w-3.5" /> Adaptation Rules
          </TabsTrigger>
          <TabsTrigger value="exclusive" className="gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5" /> Exclusive Features
          </TabsTrigger>
          <TabsTrigger value="copy" className="gap-1.5 text-xs">
            <ArrowRight className="h-3.5 w-3.5" /> UX Copy
          </TabsTrigger>
          <TabsTrigger value="visibility" className="gap-1.5 text-xs">
            <Eye className="h-3.5 w-3.5" /> Visibility Rules
          </TabsTrigger>
        </TabsList>

        {/* Adaptation Rules Tab */}
        <TabsContent value="rules" className="mt-3">
          <Card className="border-white/[0.06] bg-white/[0.03]">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Category</th>
                      <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                        <div className="flex items-center gap-1"><Monitor className="h-3 w-3 text-blue-400" /> OS Behavior</div>
                      </th>
                      <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                        <div className="flex items-center gap-1"><Smartphone className="h-3 w-3 text-purple-400" /> App Behavior</div>
                      </th>
                      <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                        <div className="flex items-center gap-1"><Cloud className="h-3 w-3 text-cyan-400" /> Cloud Role</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isDemoMode ? RULES : [] as typeof RULES).map((rule, i) => (
                      <tr key={rule.id} className={cn("border-b border-white/[0.04]", i % 2 === 0 && "bg-white/[0.01]")}>
                        <td className="px-4 py-2.5 font-medium text-foreground whitespace-nowrap">{rule.category}</td>
                        <td className="px-4 py-2.5 text-blue-300/80">{rule.osRule}</td>
                        <td className="px-4 py-2.5 text-purple-300/80">{rule.appRule}</td>
                        <td className="px-4 py-2.5 text-cyan-300/80">{rule.cloudRole}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exclusive Features Tab */}
        <TabsContent value="exclusive" className="mt-3">
          <Tabs defaultValue="os" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/[0.03]">
              <TabsTrigger value="os" className="gap-1.5 text-xs"><Monitor className="h-3.5 w-3.5" /> OS Exclusive</TabsTrigger>
              <TabsTrigger value="app" className="gap-1.5 text-xs"><Smartphone className="h-3.5 w-3.5" /> App Exclusive</TabsTrigger>
              <TabsTrigger value="cloud" className="gap-1.5 text-xs"><Cloud className="h-3.5 w-3.5" /> Cloud Exclusive</TabsTrigger>
            </TabsList>
            <TabsContent value="os" className="mt-3">
              <Card className="border-blue-500/10 bg-blue-500/[0.02]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-blue-400" />
                    <span className="text-foreground">OS-Exclusive Features</span>
                    <Badge variant="outline" className="text-[8px] text-blue-400 border-blue-500/20">Execution Surface</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent><ExclusiveList items={OS_EXCLUSIVE} icon={Monitor} color="text-blue-400" /></CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="app" className="mt-3">
              <Card className="border-purple-500/10 bg-purple-500/[0.02]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-purple-400" />
                    <span className="text-foreground">App-Exclusive Features</span>
                    <Badge variant="outline" className="text-[8px] text-purple-400 border-purple-500/20">Control Surface</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent><ExclusiveList items={APP_EXCLUSIVE} icon={Smartphone} color="text-purple-400" /></CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="cloud" className="mt-3">
              <Card className="border-cyan-500/10 bg-cyan-500/[0.02]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-cyan-400" />
                    <span className="text-foreground">Cloud-Exclusive Features</span>
                    <Badge variant="outline" className="text-[8px] text-cyan-400 border-cyan-500/20">Truth Fabric</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent><ExclusiveList items={CLOUD_EXCLUSIVE} icon={Cloud} color="text-cyan-400" /></CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* UX Copy Separation Tab */}
        <TabsContent value="copy" className="mt-3">
          <Card className="border-white/[0.06] bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                UX Copy Separation Rules
                <WhyTooltip explanation="Different words reinforce different architectural roles. OS uses 'doing' language (Open, Run, Save). App uses 'authority' language (Approve, Lock, Revoke). This emotional distinction prevents platform confusion." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      <th className="px-4 py-2.5 text-center text-[9px] uppercase tracking-wider text-muted-foreground font-medium w-[35%]">
                        <div className="flex items-center justify-center gap-1"><Monitor className="h-3 w-3 text-blue-400" /> OS Language</div>
                      </th>
                      <th className="px-2 py-2.5 text-center w-[30%]">
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Architectural Rationale</span>
                      </th>
                      <th className="px-4 py-2.5 text-center text-[9px] uppercase tracking-wider text-muted-foreground font-medium w-[35%]">
                        <div className="flex items-center justify-center gap-1"><Smartphone className="h-3 w-3 text-purple-400" /> App Language</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {UX_COPY_PAIRS.map((pair, i) => (
                      <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className={cn("border-b border-white/[0.04]", i % 2 === 0 && "bg-white/[0.01]")}>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className="text-xs px-3 py-1 text-blue-400 border-blue-500/20 bg-blue-500/5 font-semibold">{pair.os}</Badge>
                        </td>
                        <td className="px-2 py-3 text-center">
                          <span className="text-[9px] text-muted-foreground leading-relaxed">{pair.rationale}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className="text-xs px-3 py-1 text-purple-400 border-purple-500/20 bg-purple-500/5 font-semibold">{pair.app}</Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visibility Rules Tab */}
        <TabsContent value="visibility" className="mt-3">
          <Card className="border-white/[0.06] bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                Visibility Rules per Surface
                <WhyTooltip explanation="OS shows local, contextual information. App shows global, account-centric oversight. This separation ensures the right information appears on the right surface." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* OS Visibility */}
                <Card className="border-blue-500/10 bg-blue-500/[0.02]">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-blue-400" />
                      <CardTitle className="text-xs font-semibold text-blue-400">OS Shows</CardTitle>
                      <Badge variant="outline" className="text-[8px] text-blue-400 border-blue-500/20 ml-auto">{OS_VISIBILITY.length} items</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <div className="space-y-1.5">
                      {OS_VISIBILITY.map((item, i) => (
                        <motion.div key={item.label} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                          <CheckCircle className="h-3 w-3 mt-0.5 text-blue-400 shrink-0" />
                          <div>
                            <p className="text-[10px] font-medium text-foreground">{item.label}</p>
                            <p className="text-[8px] text-muted-foreground">{item.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* App Visibility */}
                <Card className="border-purple-500/10 bg-purple-500/[0.02]">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-purple-400" />
                      <CardTitle className="text-xs font-semibold text-purple-400">App Shows</CardTitle>
                      <Badge variant="outline" className="text-[8px] text-purple-400 border-purple-500/20 ml-auto">{APP_VISIBILITY.length} items</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <div className="space-y-1.5">
                      {APP_VISIBILITY.map((item, i) => (
                        <motion.div key={item.label} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                          <CheckCircle className="h-3 w-3 mt-0.5 text-purple-400 shrink-0" />
                          <div>
                            <p className="text-[10px] font-medium text-foreground">{item.label}</p>
                            <p className="text-[8px] text-muted-foreground">{item.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Authority Flow Diagram */}
      <Card className="border-white/[0.06] bg-white/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            Authority Flow Model
            <WhyTooltip explanation="For every action: OS executes, Cloud decides/validates, App approves/controls. This tri-layer model prevents any single surface from having unchecked authority." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4 py-4">
            {[
              { label: "OS", sublabel: "Execute", icon: Monitor, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
              { label: "Cloud", sublabel: "Decide", icon: Cloud, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
              { label: "App", sublabel: "Approve", icon: Smartphone, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
            ].map((node, i) => (
              <div key={node.label} className="flex items-center gap-4">
                <div className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border", node.bg)}>
                  <node.icon className={cn("h-8 w-8", node.color)} />
                  <span className={cn("text-sm font-semibold", node.color)}>{node.label}</span>
                  <span className="text-[10px] text-muted-foreground">{node.sublabel}</span>
                </div>
                {i < 2 && <ArrowRight className="h-5 w-5 text-muted-foreground/40" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
