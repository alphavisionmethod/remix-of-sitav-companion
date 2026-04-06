import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Brain, AlertTriangle, CheckCircle2, Shield, Zap, Clock, TrendingUp,
  Users, Wrench, Eye, RotateCcw, Sparkles, Activity, ArrowUpRight,
  Bug, Gauge, Rocket, ShieldCheck, FileCheck, Target, Palette,
  GitBranch, Network, History, MessageSquare, BookOpen, FileText, XCircle,
  Plug, ArrowDown, ArrowUp, Minus, Star
} from "lucide-react";
import { generateChiefSynthesis } from "@/lib/ai-engineering";
import { getIntegrationHealthSummary, getIntegrationsByCategory } from "@/lib/ai-engineering/platform-integration";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

// ═══════════════════════════════════════════════════════════════
// DATA — Engineering Overview Band
// ═══════════════════════════════════════════════════════════════
const OVERVIEW_BAND = [
  { label: "Open Issues", value: 12, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Critical Issues", value: 2, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  { label: "Active Missions", value: 5, icon: Target, color: "text-primary", bg: "bg-primary/10" },
  { label: "Self-Heal Rate", value: "92%", icon: Sparkles, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10" },
  { label: "Release Confidence", value: "82%", icon: Rocket, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10" },
  { label: "Regression Risk", value: "Low", icon: Shield, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10" },
  { label: "Verification Health", value: "94%", icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10" },
  { label: "Approvals Waiting", value: 2, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
];

// Needs Attention
const ATTENTION_ITEMS = [
  { title: "Elevated 500 errors on /api/projections/rebuild", type: "critical-issue", severity: "critical" as const, agent: "Reliability Engineer", time: "18m" },
  { title: "Admin shell LCP 3.2s — exceeds 1.5s budget", type: "regression", severity: "high" as const, agent: "Performance Optimizer", time: "4h" },
  { title: "Failed self-heal: layout restore caused secondary shift", type: "failed-heal", severity: "medium" as const, agent: "Self-Healing Supervisor", time: "1d" },
  { title: "Release gate failing: Performance Budget", type: "release-gate", severity: "high" as const, agent: "Release Manager", time: "35m" },
  { title: "Projection cache fix — awaiting approval", type: "blocked-change", severity: "high" as const, agent: "Backend Engineer", time: "2h" },
];

// Agent Signal Rail
const AGENT_SIGNALS = [
  { name: "Engineering Lead", signal: "Coordinating shell performance sprint", confidence: 92, autonomy: "supervised", escalation: false, tasks: 3 },
  { name: "Backend Engineer", signal: "Projection mutex lock ready for review", confidence: 88, autonomy: "draft-only", escalation: false, tasks: 2 },
  { name: "Frontend Engineer", signal: "Accessibility sweep — 2 violations remaining", confidence: 85, autonomy: "supervised", escalation: false, tasks: 4 },
  { name: "Design Engineer", signal: "Admin header redesign proposed", confidence: 79, autonomy: "draft-only", escalation: false, tasks: 2 },
  { name: "QA Engineer", signal: "Generated 8 new regression tests", confidence: 91, autonomy: "auto-low-risk", escalation: false, tasks: 3 },
  { name: "Error Fixer", signal: "Analyzing projection error cluster — 14 signals", confidence: 84, autonomy: "supervised", escalation: true, tasks: 5 },
  { name: "Reliability Engineer", signal: "Monitoring elevated error rate", confidence: 90, autonomy: "auto-low-risk", escalation: false, tasks: 2 },
  { name: "Security Reviewer", signal: "Schema migration risk — escalated to human", confidence: 87, autonomy: "observe-only", escalation: true, tasks: 1 },
  { name: "Performance Optimizer", signal: "Admin shell lazy import analysis", confidence: 76, autonomy: "supervised", escalation: false, tasks: 2 },
  { name: "Release Manager", signal: "Staging promotion blocked — perf gate", confidence: 82, autonomy: "supervised", escalation: false, tasks: 1 },
  { name: "Self-Healing Supervisor", signal: "Cache auto-heal verified ✓", confidence: 88, autonomy: "auto-low-risk", escalation: false, tasks: 3 },
  { name: "Learning Analyst", signal: "New pattern: flag rollbacks within 2h", confidence: 71, autonomy: "observe-only", escalation: false, tasks: 1 },
  { name: "Docs Engineer", signal: "Deployment runbook updated", confidence: 93, autonomy: "auto-low-risk", escalation: false, tasks: 0 },
];

// Mission Lane
const MISSIONS = [
  { title: "Fix projection cache corruption", agent: "Backend Engineer", progress: 75, status: "ready_for_approval", blocker: "Awaiting human approval", confidence: 87 },
  { title: "Reduce admin shell load time to <1.2s", agent: "Performance Optimizer", progress: 68, status: "in_progress", blocker: null, confidence: 76 },
  { title: "Achieve 95% test coverage on core flows", agent: "QA Engineer", progress: 82, status: "in_progress", blocker: null, confidence: 91 },
  { title: "Zero critical accessibility violations", agent: "Frontend Engineer", progress: 91, status: "in_progress", blocker: null, confidence: 85 },
  { title: "Add smoke gates for critical flows", agent: "Release Manager", progress: 45, status: "in_progress", blocker: null, confidence: 82 },
];

// Self-Healing Lane
const HEAL_STATS = { attempted: 12, verified: 11, blocked: 3, rolledBack: 1 };
const RECENT_HEALS = [
  { action: "Restarted unhealthy projection worker", time: "12m ago", verified: true },
  { action: "Reverted bad feature flag: revenue-sidebar-v2", time: "1h ago", verified: true },
  { action: "Auto-fixed broken route /admin/durability", time: "2h ago", verified: true },
  { action: "Invalidated stale brand-kit CDN cache", time: "4h ago", verified: true },
];

// Learning Lane
const LEARNING_HIGHLIGHTS = [
  { type: "pattern", detail: "Feature flag rollbacks cluster within 2h of activation", confidence: 82 },
  { type: "optimization", detail: "Error Fixer accuracy improved +4% after lazy-import checks", confidence: 91 },
  { type: "rejected", detail: "Design proposal using hardcoded colors — rejected 2x", confidence: 79 },
  { type: "root-cause", detail: "Projection failures correlate with config concurrency changes", confidence: 84 },
];

// What Changed Lane
const CHANGES = [
  { action: "Auto-fixed broken route /admin/durability", agent: "Error Fixer", time: "12m ago", type: "auto-heal" as const },
  { action: "Proposed layout improvement for Mission Control header", agent: "Design Engineer", time: "28m ago", type: "proposal" as const },
  { action: "Reverted bad feature flag for revenue-office sidebar", agent: "Reliability Engineer", time: "1h ago", type: "rollback" as const },
  { action: "Generated regression tests for approval flow", agent: "QA Engineer", time: "2h ago", type: "improvement" as const },
  { action: "Patched stale projection cache invalidation", agent: "Backend Engineer", time: "3h ago", type: "fix" as const },
  { action: "Blocked risky schema migration — escalated to human", agent: "Security Reviewer", time: "4h ago", type: "blocked" as const },
  { action: "Updated deployment runbook with new smoke gate", agent: "Documentation Engineer", time: "6h ago", type: "improvement" as const },
  { action: "Release confidence: 78% → 82% after test additions", agent: "Release Manager", time: "7h ago", type: "improvement" as const },
];

// Environments + Release Gates
const ENVIRONMENTS = [
  { env: "Production", status: "healthy" as const, confidence: 94, deployedAt: "2h ago", drift: "none", version: "v2.14.3" },
  { env: "Staging", status: "warning" as const, confidence: 78, deployedAt: "35m ago", drift: "2 config diffs", version: "v2.15.0-rc1" },
  { env: "Preview", status: "healthy" as const, confidence: 88, deployedAt: "12m ago", drift: "none", version: "v2.15.0-rc2" },
];

const RELEASE_GATES = [
  { gate: "Unit Tests", status: "pass" as const, detail: "1,247/1,247 passing" },
  { gate: "Integration Tests", status: "pass" as const, detail: "89/89 passing" },
  { gate: "Auth Smoke Test", status: "pass" as const, detail: "Login + OAuth verified" },
  { gate: "Performance Budget", status: "warning" as const, detail: "Admin shell LCP 3.2s (budget: 1.5s)" },
  { gate: "Accessibility Audit", status: "warning" as const, detail: "2 AA violations remaining" },
  { gate: "Security Scan", status: "pass" as const, detail: "0 critical, 1 advisory" },
  { gate: "Design Consistency", status: "pass" as const, detail: "92% token compliance" },
  { gate: "Rollback Plan", status: "pass" as const, detail: "Automated rollback configured" },
];

const typeDotColor = (type: string) =>
  type === "auto-heal" ? "bg-[hsl(var(--trust-safe))]" :
  type === "rollback" ? "bg-amber-500" :
  type === "blocked" ? "bg-destructive" :
  type === "proposal" ? "bg-primary" : "bg-[hsl(var(--trust-safe))]";

const attentionColor = (severity: string) =>
  severity === "critical" ? "border-destructive/30 bg-destructive/5" :
  severity === "high" ? "border-amber-500/30 bg-amber-500/5" :
  "border-border/40 bg-card";

const AIEngineeringBoard = () => {
  const [tab, setTab] = useState("overview");

  const chiefSynthesis = useMemo(() => generateChiefSynthesis({
    activeMissions: 5, blockedMissions: 1, completedMissions: 12,
    criticalIssues: 2, selfHealSuccessRate: 92, releaseConfidence: 82,
    topRisk: "Projection cache corruption affecting admin dashboards",
    topOpportunity: "Self-healing maturity allows expanding auto-heal to low-risk UI fixes",
    agentDisagreements: [
      { topic: "Admin shell optimization approach", positions: [
        { agent: "Performance Optimizer", position: "Lazy imports + Suspense boundaries" },
        { agent: "Frontend Engineer", position: "Route-level code splitting first" },
      ]},
    ],
  }), []);

  const integrationHealth = useMemo(() => getIntegrationHealthSummary(), []);

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <AdminPageHeader icon={Brain} title="AI Engineering Board" subtitle="Your AI engineering department — goals, fixes, healing, approvals, and release confidence" accent="primary" />

      {/* ── Chief Engineering Synthesis ── */}
      <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold">Chief Engineering Synthesis</span>
          </div>
          <div className="flex items-center gap-2">
            {chiefSynthesis.releaseConfidenceDirection === "rising" && <ArrowUp className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />}
            {chiefSynthesis.releaseConfidenceDirection === "falling" && <ArrowDown className="h-3.5 w-3.5 text-destructive" />}
            {chiefSynthesis.releaseConfidenceDirection === "stable" && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
            <Badge variant="outline" className="text-xs">Release: {chiefSynthesis.releaseConfidenceScore}%</Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-primary">What Matters Now</p>
            <p className="text-sm">{chiefSynthesis.whatMattersNow}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-primary">Next Best Action</p>
            <p className="text-sm">{chiefSynthesis.nextBestOperatorAction}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-destructive">Biggest Risk</p>
            <p className="text-sm">{chiefSynthesis.biggestRisk}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[hsl(var(--trust-safe))]">Biggest Opportunity</p>
            <p className="text-sm">{chiefSynthesis.biggestOpportunity}</p>
          </div>
        </div>
        {chiefSynthesis.agentDisagreements.length > 0 && (
          <div className="rounded-lg bg-background/50 p-3 space-y-1">
            <p className="text-xs font-semibold text-amber-500">Agent Disagreements</p>
            {chiefSynthesis.agentDisagreements.map((d, i) => (
              <div key={i} className="text-xs">
                <span className="font-medium">{d.topic}:</span>{" "}
                {d.positions.map((p, j) => (
                  <span key={j}>{j > 0 && " vs "}<span className="text-muted-foreground">{p.agent}:</span> {p.position}</span>
                ))}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>Active: {chiefSynthesis.missionSummary.active}</span>
          <span>Blocked: {chiefSynthesis.missionSummary.blocked}</span>
          <span>Completed: {chiefSynthesis.missionSummary.completed}</span>
          <span>Critical: {chiefSynthesis.criticalIssueCount}</span>
          <span>Self-Heal: {chiefSynthesis.selfHealHealth}</span>
        </div>
      </div>

      {/* A. Engineering Overview Band */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {OVERVIEW_BAND.map(c => (
          <div key={c.label} className="rounded-xl border border-border/40 bg-card p-3 text-center">
            <div className={`mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg ${c.bg}`}>
              <c.icon className={`h-3.5 w-3.5 ${c.color}`} />
            </div>
            <p className="text-lg font-bold leading-none">{c.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{c.label}</p>
          </div>
        ))}
      </div>

      {/* 6-Tab Architecture */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview"><Activity className="h-3.5 w-3.5 mr-1" />Overview</TabsTrigger>
          <TabsTrigger value="team"><Users className="h-3.5 w-3.5 mr-1" />AI Team</TabsTrigger>
          <TabsTrigger value="missions"><Target className="h-3.5 w-3.5 mr-1" />Missions</TabsTrigger>
          <TabsTrigger value="fixes"><Bug className="h-3.5 w-3.5 mr-1" />Fixes</TabsTrigger>
          <TabsTrigger value="healing"><Sparkles className="h-3.5 w-3.5 mr-1" />Self-Healing</TabsTrigger>
          <TabsTrigger value="releases"><Rocket className="h-3.5 w-3.5 mr-1" />Releases</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* B. Needs Attention Lane */}
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <AlertTriangle className="h-4 w-4" /> Needs Attention ({ATTENTION_ITEMS.length})
              </div>
            </div>
            {ATTENTION_ITEMS.map((item, i) => (
              <div key={i} className={`rounded-lg border p-3 ${attentionColor(item.severity)}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium">{item.title}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={item.severity === "critical" ? "destructive" : "outline"} className="text-[10px]">{item.severity}</Badge>
                    <span className="text-[10px] text-muted-foreground">{item.time}</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">{item.agent} · {item.type.replace(/-/g, " ")}</p>
              </div>
            ))}
          </div>

          {/* D. Mission Progress Lane */}
          <div className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Active Missions</span></div>
              <Link to="/admin/ai-missions" className="text-xs text-primary hover:underline flex items-center gap-1">Mission Center <ArrowUpRight className="h-3 w-3" /></Link>
            </div>
            <div className="space-y-2">
              {MISSIONS.map(m => (
                <div key={m.title} className="rounded-lg border border-border/20 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{m.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{m.confidence}%</span>
                      <Badge variant={m.status === "ready_for_approval" ? "outline" : "secondary"} className="text-[10px]">
                        {m.status === "ready_for_approval" ? "Awaiting Approval" : "In Progress"}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={m.progress} className="h-1 mb-1" />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{m.agent}</span>
                    {m.blocker && <span className="text-amber-500">⚠ {m.blocker}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* E. Self-Healing Lane */}
          <div className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[hsl(var(--trust-safe))]" /><span className="text-sm font-semibold">Self-Healing</span></div>
              <Link to="/admin/ai-self-healing" className="text-xs text-primary hover:underline flex items-center gap-1">Self-Healing Center <ArrowUpRight className="h-3 w-3" /></Link>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { l: "Attempted", v: HEAL_STATS.attempted, c: "text-foreground" },
                { l: "Verified", v: HEAL_STATS.verified, c: "text-[hsl(var(--trust-safe))]" },
                { l: "Blocked", v: HEAL_STATS.blocked, c: "text-amber-500" },
                { l: "Rolled Back", v: HEAL_STATS.rolledBack, c: "text-destructive" },
              ].map(s => (
                <div key={s.l} className="text-center">
                  <p className={`text-lg font-bold ${s.c}`}>{s.v}</p>
                  <p className="text-[10px] text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {RECENT_HEALS.map((h, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border/10 last:border-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))] shrink-0" />
                  <span className="text-xs flex-1 truncate">{h.action}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{h.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* F. Learning Lane */}
          <div className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Learning Highlights</span></div>
              <Link to="/admin/ai-learning" className="text-xs text-primary hover:underline flex items-center gap-1">Learning Center <ArrowUpRight className="h-3 w-3" /></Link>
            </div>
            <div className="space-y-2">
              {LEARNING_HIGHLIGHTS.map((l, i) => (
                <div key={i} className="rounded-lg bg-muted/20 p-2.5 flex items-start gap-2">
                  <Badge variant="outline" className="text-[9px] shrink-0 mt-0.5">{l.type}</Badge>
                  <div className="flex-1">
                    <p className="text-xs">{l.detail}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{l.confidence}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* G. What Changed Lane */}
          <div className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">What Changed</span></div>
              <Link to="/admin/ai-time-machine" className="text-xs text-primary hover:underline flex items-center gap-1">Time Machine <ArrowUpRight className="h-3 w-3" /></Link>
            </div>
            <div className="space-y-1">
              {CHANGES.slice(0, 6).map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${typeDotColor(a.type)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{a.action}</p>
                    <p className="text-[10px] text-muted-foreground">{a.agent} · {a.time}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{a.type}</Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 2: AI TEAM ── */}
        <TabsContent value="team" className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">{AGENT_SIGNALS.length} specialists · {AGENT_SIGNALS.filter(t => t.escalation).length} escalated</p>
            <Link to="/admin/ai-team-roster" className="text-xs text-primary hover:underline flex items-center gap-1">Full Roster <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {AGENT_SIGNALS.map(t => (
              <div key={t.name} className={`rounded-xl border p-3 flex items-center gap-3 ${t.escalation ? "border-amber-500/30 bg-amber-500/5" : "border-border/40 bg-card"}`}>
                <div className={`h-2 w-2 rounded-full shrink-0 ${t.escalation ? "bg-amber-500" : t.tasks > 0 ? "bg-[hsl(var(--trust-safe))]" : "bg-muted-foreground/30"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    {t.escalation && <Badge variant="destructive" className="text-[10px]">Escalated</Badge>}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{t.signal}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{t.confidence}%</p>
                  <p className="text-[10px] text-muted-foreground">{t.tasks} tasks</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── TAB 3: MISSIONS ── */}
        <TabsContent value="missions" className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">{MISSIONS.length} active missions</p>
            <Link to="/admin/ai-missions" className="text-xs text-primary hover:underline flex items-center gap-1">Mission Center <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-2">
            {MISSIONS.map(m => (
              <div key={m.title} className="rounded-xl border border-border/40 bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{m.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={m.status === "ready_for_approval" ? "outline" : "secondary"} className="text-[10px]">
                      {m.status === "ready_for_approval" ? "Awaiting Approval" : `${m.progress}%`}
                    </Badge>
                  </div>
                </div>
                <Progress value={m.progress} className="h-1.5 mb-1.5" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{m.agent}</span>
                  <span>Confidence: {m.confidence}%</span>
                  {m.blocker && <span className="text-amber-500">⚠ {m.blocker}</span>}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── TAB 4: FIXES ── */}
        <TabsContent value="fixes" className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">7 active issues · 3 auto-fix eligible</p>
            <Link to="/admin/ai-fix-center" className="text-xs text-primary hover:underline flex items-center gap-1">Fix Center <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-2">
            {[
              { title: "Elevated 500 errors on /api/projections/rebuild", severity: "critical", confidence: 87, autoFix: false },
              { title: "Broken navigation on /admin/durability", severity: "high", confidence: 96, autoFix: true },
              { title: "Slow page load on Revenue Office (>3s)", severity: "high", confidence: 78, autoFix: false },
              { title: "Accessibility: missing aria-labels on sidebar", severity: "medium", confidence: 94, autoFix: true },
              { title: "Visual drift: card border radius inconsistency", severity: "low", confidence: 92, autoFix: true },
            ].map(f => (
              <div key={f.title} className={`rounded-xl border bg-card p-3 flex items-center gap-3 ${f.severity === "critical" ? "border-destructive/30" : f.severity === "high" ? "border-amber-500/30" : "border-border/40"}`}>
                <Bug className={`h-4 w-4 shrink-0 ${f.severity === "critical" ? "text-destructive" : f.severity === "high" ? "text-amber-500" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0"><p className="text-sm truncate">{f.title}</p></div>
                <div className="flex items-center gap-2 shrink-0">
                  {f.autoFix && <Badge variant="outline" className="text-[10px] text-[hsl(var(--trust-safe))]">auto-fix</Badge>}
                  <Badge variant={f.severity === "critical" ? "destructive" : "outline"} className="text-[10px]">{f.severity}</Badge>
                  <span className="text-xs font-bold">{f.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── TAB 5: SELF-HEALING ── */}
        <TabsContent value="healing" className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">{HEAL_STATS.verified} healed · {HEAL_STATS.blocked} blocked</p>
            <Link to="/admin/ai-self-healing" className="text-xs text-primary hover:underline flex items-center gap-1">Self-Healing Center <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { l: "Attempted", v: HEAL_STATS.attempted, c: "text-foreground" },
              { l: "Verified ✓", v: HEAL_STATS.verified, c: "text-[hsl(var(--trust-safe))]" },
              { l: "Blocked", v: HEAL_STATS.blocked, c: "text-amber-500" },
              { l: "Rolled Back", v: HEAL_STATS.rolledBack, c: "text-destructive" },
            ].map(s => (
              <div key={s.l} className="rounded-xl border border-border/40 bg-card p-3 text-center">
                <p className={`text-xl font-bold ${s.c}`}>{s.v}</p>
                <p className="text-[10px] text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {RECENT_HEALS.map((h, i) => (
              <div key={i} className="rounded-xl border border-border/40 bg-card p-3 flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--trust-safe))] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{h.action}</p>
                  <p className="text-[10px] text-muted-foreground">{h.time}</p>
                </div>
                {h.verified && <Badge variant="outline" className="text-[10px] text-[hsl(var(--trust-safe))]">Verified</Badge>}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── TAB 6: RELEASES ── */}
        <TabsContent value="releases" className="space-y-4 mt-4">
          <div className="space-y-2">
            {ENVIRONMENTS.map(e => (
              <div key={e.env} className="rounded-xl border border-border/40 bg-card p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${e.status === "healthy" ? "bg-[hsl(var(--trust-safe))]" : "bg-amber-500"}`} />
                    <span className="text-sm font-semibold">{e.env}</span>
                    <Badge variant="outline" className="text-[10px]">{e.version}</Badge>
                  </div>
                  <Badge variant={e.status === "healthy" ? "default" : "outline"}>{e.confidence}% confidence</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Deployed: {e.deployedAt} · Drift: {e.drift}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center gap-2 mb-3"><Shield className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Release Gates</span></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {RELEASE_GATES.map(g => (
                <div key={g.gate} className={`rounded-lg border p-3 ${g.status === "pass" ? "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5" : "border-amber-500/20 bg-amber-500/5"}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {g.status === "pass" ? <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                    <span className="text-xs font-semibold">{g.gate}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{g.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <Link to="/admin/ai-releases" className="rounded-xl border border-border/40 bg-card p-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
            <Rocket className="h-4 w-4 text-primary" /><span className="text-sm font-medium">Full Release Center</span><ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
          </Link>
        </TabsContent>
      </Tabs>

      {/* ── Platform Integration Status ── */}
      <div className="rounded-xl border border-border/40 bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Plug className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Platform Integrations</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[hsl(var(--trust-safe))]">{integrationHealth.healthy} connected</span>
            <span className="text-muted-foreground">· {integrationHealth.crossReferenceCount} data flows</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {(Object.entries(integrationHealth.byCategory) as [string, { total: number; healthy: number }][]).map(([cat, data]) => (
            <div key={cat} className="rounded-lg border border-border/20 p-2.5 text-center">
              <p className="text-xs font-bold">{data.healthy}/{data.total}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{cat.replace(/-/g, " ")}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Team Roster", icon: Users, path: "/admin/ai-team-roster" },
          { label: "Mission Center", icon: Target, path: "/admin/ai-missions" },
          { label: "Fix Center", icon: Bug, path: "/admin/ai-fix-center" },
          { label: "Design Studio", icon: Palette, path: "/admin/ai-design-studio" },
          { label: "Self-Healing", icon: Sparkles, path: "/admin/ai-self-healing" },
          { label: "Learning Center", icon: TrendingUp, path: "/admin/ai-learning" },
          { label: "Approval Desk", icon: FileCheck, path: "/admin/ai-approvals" },
          { label: "Release Center", icon: Rocket, path: "/admin/ai-releases" },
          { label: "Root Cause Graph", icon: Network, path: "/admin/ai-root-cause" },
          { label: "Design Diff Theater", icon: Eye, path: "/admin/ai-design-diffs" },
          { label: "Time Machine", icon: History, path: "/admin/ai-time-machine" },
          { label: "Agent Debate", icon: MessageSquare, path: "/admin/ai-agent-debate" },
          { label: "Change Plans", icon: FileCheck, path: "/admin/ai-change-plans" },
          { label: "Boundary Controls", icon: Shield, path: "/admin/ai-boundary-controls" },
          { label: "Self-Learning Ledger", icon: BookOpen, path: "/admin/ai-self-learning" },
          { label: "Evidence Bundles", icon: FileText, path: "/admin/ai-evidence-bundles" },
        ].map(l => (
          <Link key={l.label} to={l.path} className="rounded-xl border border-border/40 bg-card p-3 flex items-center gap-3 hover:bg-muted/30 transition-colors cursor-pointer">
            <l.icon className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium">{l.label}</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AIEngineeringBoard;
