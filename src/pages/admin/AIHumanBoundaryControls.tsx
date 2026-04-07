import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Shield, Eye, FileEdit, Sparkles, CheckCircle2, Lock, AlertTriangle, Users, Wrench, Palette, Bug, Gauge, BookOpen, Rocket, ShieldCheck, Brain } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

type AutonomyLevel = "observe_only" | "draft_only" | "safe_auto_heal" | "approval_required" | "never_automate";

const AUTONOMY_LABELS: Record<AutonomyLevel, { label: string; icon: typeof Eye; color: string; bg: string; description: string }> = {
  observe_only: { label: "Observe Only", icon: Eye, color: "text-muted-foreground", bg: "bg-muted", description: "Agent watches and reports. No proposals, no changes." },
  draft_only: { label: "Draft Only", icon: FileEdit, color: "text-primary", bg: "bg-primary/10", description: "Agent can propose changes as drafts. Never auto-applies." },
  safe_auto_heal: { label: "Safe Auto-Heal", icon: Sparkles, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10", description: "Agent can auto-apply low-risk, verified fixes within policy." },
  approval_required: { label: "Approval Required", icon: CheckCircle2, color: "text-amber-500", bg: "bg-amber-500/10", description: "Agent proposes. Human must approve before any change applies." },
  never_automate: { label: "Never Automate", icon: Lock, color: "text-destructive", bg: "bg-destructive/10", description: "Fully manual. Agent provides no proposals for this scope." },
};

interface AgentBoundary {
  agent: string;
  icon: typeof Bug;
  autonomy: AutonomyLevel;
  scope: string;
  lastOverride?: string;
}

interface MissionBoundary {
  missionType: string;
  defaultAutonomy: AutonomyLevel;
  overridable: boolean;
  rationale: string;
}

interface ChangeTypeBoundary {
  changeType: string;
  maxAutonomy: AutonomyLevel;
  requiresSimulation: boolean;
  requiresCanary: boolean;
  rationale: string;
}

const DEMO_AGENT_BOUNDARIES: AgentBoundary[] = [
  { agent: "Engineering Lead", icon: Brain, autonomy: "approval_required", scope: "Sprint coordination, cross-agent synthesis" },
  { agent: "Backend Engineer", icon: Wrench, autonomy: "draft_only", scope: "APIs, services, data models, runtime" },
  { agent: "Frontend Engineer", icon: Wrench, autonomy: "draft_only", scope: "Routes, components, state, rendering" },
  { agent: "Design Engineer", icon: Palette, autonomy: "draft_only", scope: "Layouts, visual consistency, dark mode" },
  { agent: "QA Engineer", icon: ShieldCheck, autonomy: "safe_auto_heal", scope: "Test generation, regression checks, coverage" },
  { agent: "Error Fixer", icon: Bug, autonomy: "safe_auto_heal", scope: "Stack traces, runtime errors, patches" },
  { agent: "Reliability Engineer", icon: Shield, autonomy: "safe_auto_heal", scope: "Incidents, health, retries, recovery", lastOverride: "Apr 4 — escalated flag revert to auto-heal" },
  { agent: "Security Reviewer", icon: Lock, autonomy: "observe_only", scope: "Permissions, policies, secrets, posture" },
  { agent: "Performance Optimizer", icon: Gauge, autonomy: "draft_only", scope: "Latency, caching, rendering cost" },
  { agent: "Documentation Engineer", icon: BookOpen, autonomy: "safe_auto_heal", scope: "Docs, changelogs, runbooks" },
  { agent: "Release Manager", icon: Rocket, autonomy: "approval_required", scope: "Release readiness, promotion, rollout" },
  { agent: "Self-Healing Supervisor", icon: Sparkles, autonomy: "safe_auto_heal", scope: "Auto-fix rules, verification, boundaries" },
  { agent: "Learning Analyst", icon: Brain, autonomy: "observe_only", scope: "Pattern detection, routing improvements" },
];

const DEMO_MISSION_BOUNDARIES: MissionBoundary[] = [
  { missionType: "Fix broken route", defaultAutonomy: "safe_auto_heal", overridable: true, rationale: "Isolated, low-risk, easily verifiable" },
  { missionType: "Performance optimization", defaultAutonomy: "draft_only", overridable: true, rationale: "Can have subtle cascading effects" },
  { missionType: "Design improvement", defaultAutonomy: "approval_required", overridable: false, rationale: "Visual changes need human judgment" },
  { missionType: "Incident resolution", defaultAutonomy: "approval_required", overridable: true, rationale: "High urgency but high blast radius" },
  { missionType: "Security hardening", defaultAutonomy: "never_automate", overridable: false, rationale: "Security changes must be human-reviewed" },
  { missionType: "Schema/migration change", defaultAutonomy: "never_automate", overridable: false, rationale: "Data-affecting changes are irreversible" },
  { missionType: "Test generation", defaultAutonomy: "safe_auto_heal", overridable: true, rationale: "Tests are additive, zero production risk" },
  { missionType: "Documentation update", defaultAutonomy: "safe_auto_heal", overridable: true, rationale: "Non-functional, easily reversible" },
  { missionType: "Feature flag change", defaultAutonomy: "approval_required", overridable: true, rationale: "User-facing behavior change" },
  { missionType: "Core routing change", defaultAutonomy: "approval_required", overridable: false, rationale: "Affects all surfaces and navigation" },
];

const DEMO_CHANGE_TYPE_BOUNDARIES: ChangeTypeBoundary[] = [
  { changeType: "UI copy/label fix", maxAutonomy: "safe_auto_heal", requiresSimulation: false, requiresCanary: false, rationale: "Minimal risk, instantly verifiable" },
  { changeType: "Component style change", maxAutonomy: "draft_only", requiresSimulation: false, requiresCanary: false, rationale: "Visual impact needs review" },
  { changeType: "Route mapping fix", maxAutonomy: "safe_auto_heal", requiresSimulation: false, requiresCanary: false, rationale: "Isolated, verifiable via route test" },
  { changeType: "API endpoint change", maxAutonomy: "approval_required", requiresSimulation: true, requiresCanary: true, rationale: "Breaking change risk" },
  { changeType: "Database schema change", maxAutonomy: "never_automate", requiresSimulation: true, requiresCanary: true, rationale: "Irreversible data impact" },
  { changeType: "Auth/permissions change", maxAutonomy: "never_automate", requiresSimulation: true, requiresCanary: false, rationale: "Security-critical" },
  { changeType: "Feature flag toggle", maxAutonomy: "approval_required", requiresSimulation: false, requiresCanary: true, rationale: "User-facing behavior" },
  { changeType: "Cache invalidation", maxAutonomy: "safe_auto_heal", requiresSimulation: false, requiresCanary: false, rationale: "Safe, self-healing eligible" },
  { changeType: "Config value change", maxAutonomy: "approval_required", requiresSimulation: true, requiresCanary: false, rationale: "Can have cascading effects" },
  { changeType: "Broad layout redesign", maxAutonomy: "approval_required", requiresSimulation: true, requiresCanary: true, rationale: "Visual regression risk across surfaces" },
];

const AIHumanBoundaryControls = () => {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("agents");

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <AdminPageHeader icon={Shield} title="Human Boundary Controls" subtitle="Per-agent, per-mission, and per-change-type autonomy configuration — what can run automatically vs. what needs you" accent="trust" />

      <div className="grid grid-cols-5 gap-2">
        {(Object.entries(AUTONOMY_LABELS) as [AutonomyLevel, typeof AUTONOMY_LABELS[AutonomyLevel]][]).map(([key, val]) => (
          <div key={key} className={`rounded-xl border border-border/40 p-3 text-center ${val.bg}`}>
            <val.icon className={`h-4 w-4 mx-auto mb-1 ${val.color}`} />
            <p className={`text-xs font-semibold ${val.color}`}>{val.label}</p>
            <p className="text-[9px] text-muted-foreground mt-1 leading-tight">{val.description}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="agents"><Users className="h-3.5 w-3.5 mr-1" />Per Agent</TabsTrigger>
          <TabsTrigger value="missions"><Rocket className="h-3.5 w-3.5 mr-1" />Per Mission Type</TabsTrigger>
          <TabsTrigger value="changes"><Wrench className="h-3.5 w-3.5 mr-1" />Per Change Type</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-2 mt-4">
          {DEMO_AGENT_BOUNDARIES.map(a => {
            const level = AUTONOMY_LABELS[a.autonomy];
            return (
              <div key={a.agent} className="rounded-xl border border-border/40 bg-card p-3 flex items-center gap-3">
                <a.icon className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{a.agent}</span>
                    <Badge className={`text-[10px] ${level.bg} ${level.color} border-0`}>{level.label}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{a.scope}</p>
                  {a.lastOverride && <p className="text-[10px] text-amber-500 mt-0.5">Override: {a.lastOverride}</p>}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="missions" className="space-y-2 mt-4">
          {DEMO_MISSION_BOUNDARIES.map(m => {
            const level = AUTONOMY_LABELS[m.defaultAutonomy];
            return (
              <div key={m.missionType} className="rounded-xl border border-border/40 bg-card p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{m.missionType}</span>
                    <Badge className={`text-[10px] ${level.bg} ${level.color} border-0`}>{level.label}</Badge>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{m.overridable ? "Overridable" : "Locked"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{m.rationale}</p>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="changes" className="mt-4">
          <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left p-3">Change Type</th>
                <th className="text-center p-3">Max Autonomy</th>
                <th className="text-center p-3">Simulation</th>
                <th className="text-center p-3">Canary</th>
                <th className="text-left p-3">Rationale</th>
              </tr></thead>
              <tbody>{DEMO_CHANGE_TYPE_BOUNDARIES.map(c => {
                const level = AUTONOMY_LABELS[c.maxAutonomy];
                return (
                  <tr key={c.changeType} className="border-b border-border/20">
                    <td className="p-3 font-medium">{c.changeType}</td>
                    <td className="p-3 text-center"><Badge className={`text-[10px] ${level.bg} ${level.color} border-0`}>{level.label}</Badge></td>
                    <td className="p-3 text-center">{c.requiresSimulation ? <CheckCircle2 className="h-3.5 w-3.5 text-primary mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="p-3 text-center">{c.requiresCanary ? <CheckCircle2 className="h-3.5 w-3.5 text-primary mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="p-3 text-muted-foreground">{c.rationale}</td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Policy Summary */}
      <div className="rounded-xl border border-border/40 bg-card p-4">
        <div className="flex items-center gap-2 mb-3"><Shield className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Safety Policy Summary</span></div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-destructive/5 border border-destructive/10 p-3">
            <p className="font-semibold text-destructive mb-1">Never Auto-Apply</p>
            <ul className="space-y-0.5 text-muted-foreground">
              <li>• Database schema changes</li>
              <li>• Auth/permissions changes</li>
              <li>• Security hardening</li>
              <li>• Core business logic changes</li>
            </ul>
          </div>
          <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-3">
            <p className="font-semibold text-amber-500 mb-1">Always Require Approval</p>
            <ul className="space-y-0.5 text-muted-foreground">
              <li>• Broad layout redesigns</li>
              <li>• Feature flag changes</li>
              <li>• API endpoint changes</li>
              <li>• Incident resolution actions</li>
            </ul>
          </div>
          <div className="rounded-lg bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/10 p-3">
            <p className="font-semibold text-[hsl(var(--trust-safe))] mb-1">Safe Auto-Heal Eligible</p>
            <ul className="space-y-0.5 text-muted-foreground">
              <li>• Broken route fixes</li>
              <li>• Cache invalidation</li>
              <li>• Feature flag reverts (on error spike)</li>
              <li>• Test generation</li>
              <li>• Documentation updates</li>
            </ul>
          </div>
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
            <p className="font-semibold text-primary mb-1">Verification Required For All</p>
            <ul className="space-y-0.5 text-muted-foreground">
              <li>• Type-check must pass</li>
              <li>• Security scan must pass</li>
              <li>• Policy compliance must pass</li>
              <li>• Rollback plan must exist</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHumanBoundaryControls;
