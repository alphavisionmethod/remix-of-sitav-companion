// ═══════════════════════════════════════════════════════════════
// SITA OS — Intelligence Differentiation Layer Admin Dashboard
// Observability for: Decision Engine, Context Graph, Device Mesh,
// Action Safety, Explainability, Workspace Intelligence
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Shield, Monitor, Eye, Zap, TrendingUp, Clock, Activity,
  CheckCircle, AlertTriangle, XCircle, Cpu, Network, Lock
} from "lucide-react";

// ── Demo Metrics ──────────────────────────────────────────────
const decisionMetrics = {
  totalDecisions: 1842,
  avgConfidence: 0.87,
  acceptanceRate: 0.73,
  explainRequests: 214,
  topDomains: [
    { domain: "finance", decisions: 612, confidence: 0.91 },
    { domain: "business", decisions: 534, confidence: 0.86 },
    { domain: "concierge", decisions: 401, confidence: 0.84 },
    { domain: "system", decisions: 295, confidence: 0.89 },
  ],
};

const contextMetrics = {
  signalCount: 14,
  avgFreshness: 0.92,
  snapshotsToday: 847,
  staleSignals: 1,
  signals: [
    { name: "time_of_day", freshness: 1.0, source: "system" },
    { name: "active_mode", freshness: 1.0, source: "sita-modes" },
    { name: "cognitive_load", freshness: 0.95, source: "attention-os" },
    { name: "device_type", freshness: 1.0, source: "device-mesh" },
    { name: "workspace", freshness: 0.88, source: "workspace-intelligence" },
    { name: "network_state", freshness: 0.98, source: "system" },
    { name: "battery_level", freshness: 0.75, source: "hal" },
    { name: "recent_apps", freshness: 0.82, source: "ambient-context" },
  ],
};

const meshMetrics = {
  totalDevices: 127,
  activeMeshes: 43,
  avgDevicesPerUser: 2.8,
  handoffsToday: 34,
  deviceBreakdown: [
    { type: "desktop", count: 48, role: "anchor" },
    { type: "laptop", count: 38, role: "portable" },
    { type: "mobile", count: 31, role: "sensor" },
    { type: "tablet", count: 10, role: "display" },
  ],
};

const safetyMetrics = {
  totalClassified: 486,
  passive: 312,
  assisted: 104,
  activeReversible: 52,
  highRisk: 18,
  blockedActions: 7,
  overrideRequests: 3,
};

const explainabilityMetrics = {
  totalExplanations: 214,
  avgHelpfulRating: 4.2,
  topCategories: [
    { category: "Trust Score", count: 67, avgRating: 4.4 },
    { category: "Recommendation", count: 58, avgRating: 4.1 },
    { category: "Automation", count: 47, avgRating: 4.3 },
    { category: "Block Reason", count: 42, avgRating: 3.9 },
  ],
};

const workspaceMetrics = {
  activeWorkspaces: 5,
  automationsConfigured: 23,
  policyOverrides: 8,
  switchSuggestions: 156,
  acceptedSuggestions: 112,
};

// ── Metric Card ──────────────────────────────────────────────
function MetricCard({ title, value, subtitle, icon: Icon, trend }: {
  title: string; value: string | number; subtitle?: string;
  icon: typeof Brain; trend?: "up" | "down" | "stable";
}) {
  return (
    <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[11px] text-white/50 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
          </div>
          <div className="p-2 rounded-lg bg-white/[0.05]">
            <Icon className="h-5 w-5 text-sita-purple" />
          </div>
        </div>
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <TrendingUp className={`h-3 w-3 ${trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400 rotate-180" : "text-white/30"}`} />
            <span className={`text-[10px] ${trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-white/30"}`}>
              {trend === "up" ? "+12% this week" : trend === "down" ? "-5% this week" : "Stable"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Safety Distribution Bar ──────────────────────────────────
function SafetyDistributionBar() {
  const total = safetyMetrics.totalClassified;
  const segments = [
    { label: "Passive", count: safetyMetrics.passive, color: "bg-emerald-500" },
    { label: "Assisted", count: safetyMetrics.assisted, color: "bg-blue-500" },
    { label: "Active", count: safetyMetrics.activeReversible, color: "bg-amber-500" },
    { label: "High-Risk", count: safetyMetrics.highRisk, color: "bg-red-500" },
  ];

  return (
    <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-white/80 flex items-center gap-2">
          <Shield className="h-4 w-4 text-sita-gold" />
          Action Safety Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex h-4 rounded-full overflow-hidden bg-white/[0.05]">
          {segments.map(seg => (
            <div
              key={seg.label}
              className={`${seg.color} transition-all`}
              style={{ width: `${(seg.count / total) * 100}%` }}
            />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {segments.map(seg => (
            <div key={seg.label} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <div className={`h-2 w-2 rounded-full ${seg.color}`} />
                <span className="text-[10px] text-white/50">{seg.label}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{seg.count}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5 text-red-400" />
            <span className="text-xs text-white/60">{safetyMetrics.blockedActions} blocked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs text-white/60">{safetyMetrics.overrideRequests} override requests</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Context Signal Table ─────────────────────────────────────
function ContextSignalTable() {
  return (
    <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-white/80 flex items-center gap-2">
          <Eye className="h-4 w-4 text-cyan-400" />
          Context Graph Signals
          <Badge variant="outline" className="text-[10px] border-white/10 text-white/50 ml-auto">
            {contextMetrics.staleSignals} stale
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {contextMetrics.signals.map(sig => (
            <div key={sig.name} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors">
              <div className={`h-2 w-2 rounded-full ${sig.freshness > 0.9 ? "bg-emerald-400" : sig.freshness > 0.7 ? "bg-amber-400" : "bg-red-400"}`} />
              <span className="text-xs text-white/70 font-mono flex-1">{sig.name}</span>
              <span className="text-[10px] text-white/40">{sig.source}</span>
              <span className="text-xs text-white/60 w-12 text-right">{Math.round(sig.freshness * 100)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Device Mesh Overview ─────────────────────────────────────
function DeviceMeshOverview() {
  return (
    <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-white/80 flex items-center gap-2">
          <Network className="h-4 w-4 text-blue-400" />
          Device Mesh Topology
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {meshMetrics.deviceBreakdown.map(dev => (
          <div key={dev.type} className="flex items-center gap-3">
            <Monitor className="h-4 w-4 text-white/40" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/70 capitalize">{dev.type}</span>
                <span className="text-xs text-white/50">{dev.count} devices</span>
              </div>
              <Progress value={(dev.count / meshMetrics.totalDevices) * 100} className="h-1.5" />
            </div>
            <Badge variant="outline" className="text-[9px] border-white/10 text-white/40">
              {dev.role}
            </Badge>
          </div>
        ))}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-white/40">Handoffs today</span>
          <span className="text-sm font-semibold text-sita-gold">{meshMetrics.handoffsToday}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Explainability Ratings ───────────────────────────────────
function ExplainabilityRatings() {
  return (
    <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-white/80 flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-400" />
          Explainability Quality
          <span className="ml-auto text-lg font-bold text-sita-gold">
            {explainabilityMetrics.avgHelpfulRating}/5
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {explainabilityMetrics.topCategories.map(cat => (
          <div key={cat.category} className="flex items-center gap-3 py-1.5">
            <span className="text-xs text-white/60 flex-1">{cat.category}</span>
            <span className="text-[10px] text-white/40">{cat.count} requests</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(star => (
                <div key={star} className={`h-2 w-2 rounded-full ${star <= Math.round(cat.avgRating) ? "bg-sita-gold" : "bg-white/10"}`} />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Workspace Intelligence Stats ─────────────────────────────
function WorkspaceIntelligenceStats() {
  return (
    <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-white/80 flex items-center gap-2">
          <Cpu className="h-4 w-4 text-emerald-400" />
          Workspace Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-lg bg-white/[0.03]">
            <p className="text-xl font-bold text-foreground">{workspaceMetrics.activeWorkspaces}</p>
            <p className="text-[10px] text-white/40">Active Workspaces</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/[0.03]">
            <p className="text-xl font-bold text-foreground">{workspaceMetrics.automationsConfigured}</p>
            <p className="text-[10px] text-white/40">Automations</p>
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Switch suggestions</span>
            <span className="text-white/70">{workspaceMetrics.switchSuggestions}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Accepted</span>
            <span className="text-emerald-400">{workspaceMetrics.acceptedSuggestions} ({Math.round((workspaceMetrics.acceptedSuggestions / workspaceMetrics.switchSuggestions) * 100)}%)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Policy overrides</span>
            <span className="text-amber-400">{workspaceMetrics.policyOverrides}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Admin Dashboard ─────────────────────────────────────
export default function IntelligenceLayerAdmin() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="min-h-screen bg-[hsl(220_18%_4%)] text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-sita-purple/20 to-blue-500/20 border border-white/[0.06]">
                <Brain className="h-6 w-6 text-sita-purple" />
              </div>
              Intelligence Differentiation Layer
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Observability for Decision Engine, Context Graph, Device Mesh, Safety, Explainability & Workspace Intelligence
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              All Systems Healthy
            </Badge>
            <Badge variant="outline" className="border-white/10 text-white/50">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <MetricCard title="Decisions" value={decisionMetrics.totalDecisions.toLocaleString()} subtitle="This period" icon={Brain} trend="up" />
          <MetricCard title="Avg Confidence" value={`${Math.round(decisionMetrics.avgConfidence * 100)}%`} subtitle="Decision engine" icon={Shield} trend="stable" />
          <MetricCard title="Mesh Devices" value={meshMetrics.totalDevices} subtitle={`${meshMetrics.activeMeshes} meshes`} icon={Monitor} trend="up" />
          <MetricCard title="Context Signals" value={contextMetrics.signalCount} subtitle={`${Math.round(contextMetrics.avgFreshness * 100)}% fresh`} icon={Eye} />
          <MetricCard title="Safety Actions" value={safetyMetrics.totalClassified} subtitle={`${safetyMetrics.blockedActions} blocked`} icon={Lock} />
          <MetricCard title="Explanations" value={explainabilityMetrics.totalExplanations} subtitle={`${explainabilityMetrics.avgHelpfulRating}/5 rating`} icon={Zap} trend="up" />
        </div>

        {/* Tabbed Content */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-white/[0.03] border border-white/[0.06]">
            <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-white/[0.08]">Overview</TabsTrigger>
            <TabsTrigger value="decisions" className="text-xs data-[state=active]:bg-white/[0.08]">Decision Engine</TabsTrigger>
            <TabsTrigger value="context" className="text-xs data-[state=active]:bg-white/[0.08]">Context Graph</TabsTrigger>
            <TabsTrigger value="mesh" className="text-xs data-[state=active]:bg-white/[0.08]">Device Mesh</TabsTrigger>
            <TabsTrigger value="safety" className="text-xs data-[state=active]:bg-white/[0.08]">Action Safety</TabsTrigger>
            <TabsTrigger value="explain" className="text-xs data-[state=active]:bg-white/[0.08]">Explainability</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <SafetyDistributionBar />
              <ContextSignalTable />
              <DeviceMeshOverview />
              <ExplainabilityRatings />
              <WorkspaceIntelligenceStats />
              {/* Decision Domain Breakdown */}
              <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white/80 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-sita-gold" />
                    Decision Engine by Domain
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {decisionMetrics.topDomains.map(d => (
                    <div key={d.domain} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/60 capitalize">{d.domain}</span>
                        <span className="text-white/40">{d.decisions} decisions · {Math.round(d.confidence * 100)}% conf</span>
                      </div>
                      <Progress value={(d.decisions / decisionMetrics.totalDecisions) * 100} className="h-1.5" />
                    </div>
                  ))}
                  <div className="pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">Acceptance rate</span>
                      <span className="text-emerald-400 font-semibold">{Math.round(decisionMetrics.acceptanceRate * 100)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="decisions" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white/80">Decision Engine Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-white/[0.03]">
                      <p className="text-3xl font-bold text-foreground">{decisionMetrics.totalDecisions.toLocaleString()}</p>
                      <p className="text-[10px] text-white/40 mt-1">Total Decisions</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-white/[0.03]">
                      <p className="text-3xl font-bold text-emerald-400">{Math.round(decisionMetrics.avgConfidence * 100)}%</p>
                      <p className="text-[10px] text-white/40 mt-1">Avg Confidence</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-white/[0.03]">
                      <p className="text-3xl font-bold text-sita-gold">{Math.round(decisionMetrics.acceptanceRate * 100)}%</p>
                      <p className="text-[10px] text-white/40 mt-1">Acceptance Rate</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-white/[0.03]">
                      <p className="text-3xl font-bold text-blue-400">{decisionMetrics.explainRequests}</p>
                      <p className="text-[10px] text-white/40 mt-1">Explain Requests</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {decisionMetrics.topDomains.map(d => (
                <Card key={d.domain} className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-foreground capitalize">{d.domain}</h3>
                      <Badge variant="outline" className="border-white/10 text-white/50">{d.decisions} decisions</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/50">Confidence</span>
                        <span className="text-emerald-400">{Math.round(d.confidence * 100)}%</span>
                      </div>
                      <Progress value={d.confidence * 100} className="h-1.5" />
                      <div className="flex justify-between text-xs">
                        <span className="text-white/50">Volume share</span>
                        <span className="text-white/60">{Math.round((d.decisions / decisionMetrics.totalDecisions) * 100)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="context" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ContextSignalTable />
              <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white/80">Context Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-4 rounded-lg bg-white/[0.03]">
                      <p className="text-2xl font-bold text-foreground">{contextMetrics.snapshotsToday}</p>
                      <p className="text-[10px] text-white/40">Snapshots Today</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-white/[0.03]">
                      <p className="text-2xl font-bold text-emerald-400">{Math.round(contextMetrics.avgFreshness * 100)}%</p>
                      <p className="text-[10px] text-white/40">Avg Freshness</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                    <p className="text-xs text-white/50 mb-2">Freshness Distribution</p>
                    <div className="flex h-3 rounded-full overflow-hidden bg-white/[0.05]">
                      <div className="bg-emerald-500" style={{ width: "75%" }} />
                      <div className="bg-amber-500" style={{ width: "15%" }} />
                      <div className="bg-red-500" style={{ width: "10%" }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/30 mt-1">
                      <span>Fresh (&gt;90%)</span>
                      <span>Aging (70-90%)</span>
                      <span>Stale (&lt;70%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="mesh" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DeviceMeshOverview />
              <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white/80">Mesh Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-lg bg-white/[0.03]">
                      <p className="text-xl font-bold text-foreground">{meshMetrics.activeMeshes}</p>
                      <p className="text-[10px] text-white/40">Active Meshes</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/[0.03]">
                      <p className="text-xl font-bold text-sita-gold">{meshMetrics.avgDevicesPerUser}</p>
                      <p className="text-[10px] text-white/40">Avg Devices/User</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/[0.03]">
                      <p className="text-xl font-bold text-emerald-400">{meshMetrics.handoffsToday}</p>
                      <p className="text-[10px] text-white/40">Handoffs Today</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.03]">
                    <p className="text-xs text-white/50 mb-2">Mesh Trust Status</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Fully trusted</span>
                        <span className="text-emerald-400">89%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Pending verification</span>
                        <span className="text-amber-400">8%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Quarantined</span>
                        <span className="text-red-400">3%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="safety" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SafetyDistributionBar />
              <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white/80">Safety Enforcement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {[
                      { label: "Pre-execution validations", value: safetyMetrics.totalClassified, status: "ok" },
                      { label: "Trust threshold blocks", value: safetyMetrics.blockedActions, status: "warn" },
                      { label: "Override requests", value: safetyMetrics.overrideRequests, status: "alert" },
                      { label: "Rollback-capable actions", value: safetyMetrics.activeReversible, status: "ok" },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02]">
                        <div className="flex items-center gap-2">
                          {item.status === "ok" ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> :
                           item.status === "warn" ? <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> :
                           <XCircle className="h-3.5 w-3.5 text-red-400" />}
                          <span className="text-xs text-white/60">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="explain" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ExplainabilityRatings />
              <WorkspaceIntelligenceStats />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
