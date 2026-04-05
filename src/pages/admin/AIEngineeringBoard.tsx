import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain, AlertTriangle, CheckCircle2, Shield, Zap, Clock, TrendingUp,
  Users, Wrench, Eye, RotateCcw, Sparkles, Activity, ArrowUpRight,
  Bug, Gauge, Rocket, ShieldCheck, FileCheck, Target, Palette,
  GitBranch, Network, History, MessageSquare, BookOpen
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// EXECUTIVE LAYER — What operators see first
// ═══════════════════════════════════════════════════════════════
const EXEC_CARDS = [
  { label: "Issues Need Attention", value: 12, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Fixes Ready", value: 4, icon: Wrench, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10" },
  { label: "Auto-Heals Applied", value: 3, icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
  { label: "Release Confidence", value: "82%", icon: Rocket, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10" },
  { label: "Quality Score", value: "87", icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10" },
  { label: "Approvals Waiting", value: 2, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
];

const INCIDENTS = [
  { title: "Elevated error rate on /api/projections", severity: "high" as const, duration: "18m", assigned: "Reliability Engineer", rootCause: "Cache invalidation race" },
  { title: "Stale cache serving old brand kit colors", severity: "medium" as const, duration: "42m", assigned: "Backend Engineer", rootCause: "CDN TTL too long" },
];

const REGRESSIONS = [
  { area: "Admin Shell", metric: "LCP", before: "1.1s", after: "3.2s", change: "+191%", detected: "2h ago", cause: "Synchronous imports added" },
  { area: "Approval Flow", metric: "Test Pass Rate", before: "100%", after: "94%", change: "-6%", detected: "4h ago", cause: "Timing-dependent assertions" },
];

const RECENT_ACTIONS = [
  { action: "Auto-fixed broken route mapping /admin/durability", agent: "Error Fixer", time: "12m ago", type: "auto-heal" as const },
  { action: "Proposed layout improvement for Mission Control header", agent: "Design Engineer", time: "28m ago", type: "proposal" as const },
  { action: "Reverted bad feature flag for revenue-office sidebar", agent: "Reliability Engineer", time: "1h ago", type: "rollback" as const },
  { action: "Generated regression tests for approval flow", agent: "QA Engineer", time: "2h ago", type: "improvement" as const },
  { action: "Patched stale projection cache invalidation", agent: "Backend Engineer", time: "3h ago", type: "fix" as const },
  { action: "Blocked risky schema migration — escalated to human", agent: "Security Reviewer", time: "4h ago", type: "blocked" as const },
  { action: "Standardized card border-radius across admin surfaces", agent: "Design Engineer", time: "5h ago", type: "auto-heal" as const },
  { action: "Updated deployment runbook with new smoke gate", agent: "Documentation Engineer", time: "6h ago", type: "improvement" as const },
];

const ACTIVE_GOALS = [
  { goal: "Reduce admin shell load time to < 1.2s", progress: 68, owner: "Performance Optimizer", status: "in_progress", deadline: "Apr 12" },
  { goal: "Achieve 95% test coverage on core flows", progress: 82, owner: "QA Engineer", status: "in_progress", deadline: "Apr 15" },
  { goal: "Zero critical accessibility violations", progress: 91, owner: "Frontend Engineer", status: "in_progress", deadline: "Apr 10" },
  { goal: "Resolve all P0 incident backlog", progress: 100, owner: "Reliability Engineer", status: "done", deadline: "Done" },
  { goal: "Add smoke gates for all critical flows", progress: 45, owner: "Release Manager", status: "in_progress", deadline: "Apr 20" },
];

const TEAM_SUMMARY = [
  { name: "Engineering Lead", focus: "Sprint coordination", status: "active" as const, tasks: 3, confidence: 92 },
  { name: "Backend Engineer", focus: "Projection cache fix", status: "active" as const, tasks: 2, confidence: 88 },
  { name: "Frontend Engineer", focus: "Accessibility sweep", status: "active" as const, tasks: 4, confidence: 85 },
  { name: "Design Engineer", focus: "Header redesign proposal", status: "active" as const, tasks: 2, confidence: 79 },
  { name: "QA Engineer", focus: "Regression test gen", status: "active" as const, tasks: 3, confidence: 91 },
  { name: "Error Fixer", focus: "Projection error analysis", status: "escalated" as const, tasks: 5, confidence: 84 },
  { name: "Reliability Engineer", focus: "Incident monitoring", status: "active" as const, tasks: 2, confidence: 90 },
  { name: "Security Reviewer", focus: "Migration risk review", status: "escalated" as const, tasks: 1, confidence: 87 },
  { name: "Performance Optimizer", focus: "Admin shell perf", status: "active" as const, tasks: 2, confidence: 76 },
  { name: "Release Manager", focus: "Staging promotion eval", status: "active" as const, tasks: 1, confidence: 82 },
  { name: "Self-Healing Supervisor", focus: "Cache auto-heal verification", status: "active" as const, tasks: 3, confidence: 88 },
  { name: "Learning Analyst", focus: "Regression pattern analysis", status: "active" as const, tasks: 1, confidence: 71 },
  { name: "Docs Engineer", focus: "Runbook update", status: "idle" as const, tasks: 0, confidence: 93 },
];

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

const AIEngineeringBoard = () => {
  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={Brain}
        title="AI Engineering Board"
        subtitle="Your AI engineering department — goals, fixes, healing, approvals, and release confidence"
        accent="primary"
      />

      {/* Executive Layer */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {EXEC_CARDS.map(c => (
          <div key={c.label} className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${c.bg}`}>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </div>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-[11px] text-muted-foreground leading-tight mt-1">{c.label}</p>
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
          {/* Active Incidents */}
          {INCIDENTS.length > 0 && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <AlertTriangle className="h-4 w-4" /> Active Incidents ({INCIDENTS.length})
              </div>
              {INCIDENTS.map(inc => (
                <div key={inc.title} className="rounded-lg border border-border/40 bg-card p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{inc.title}</span>
                    <Badge variant={inc.severity === "high" ? "destructive" : "outline"}>{inc.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Assigned: {inc.assigned} · Duration: {inc.duration} · Root cause: {inc.rootCause}</p>
                </div>
              ))}
            </div>
          )}

          {/* Regressions Detected */}
          {REGRESSIONS.length > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-500">
                <TrendingUp className="h-4 w-4" /> Regressions Detected ({REGRESSIONS.length})
              </div>
              {REGRESSIONS.map(r => (
                <div key={r.area + r.metric} className="rounded-lg border border-border/40 bg-card p-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{r.area} — {r.metric}</span>
                    <p className="text-xs text-muted-foreground">{r.before} → {r.after} ({r.change}) · {r.detected}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-destructive">{r.cause}</Badge>
                </div>
              ))}
            </div>
          )}

          {/* Release Confidence */}
          <div className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Rocket className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Release Confidence</span></div>
              <span className="text-2xl font-bold text-[hsl(var(--trust-safe))]">82%</span>
            </div>
            <Progress value={82} className="h-2" />
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
              <span>Tests: 94% pass</span><span>Build: clean</span><span>Security: 1 advisory</span>
              <span>Accessibility: 2 warnings</span><span>Performance: 1 SLO breach</span><span>Design: 92% consistent</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">What Changed Recently</span></div>
              <Link to="/admin/ai-learning" className="text-xs text-primary hover:underline">View all →</Link>
            </div>
            <div className="space-y-1">
              {RECENT_ACTIONS.slice(0, 6).map((a, i) => (
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
            <p className="text-sm text-muted-foreground">13 specialists · {TEAM_SUMMARY.filter(t => t.status === "escalated").length} escalated</p>
            <Link to="/admin/ai-team-roster" className="text-xs text-primary hover:underline flex items-center gap-1">Full Roster <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {TEAM_SUMMARY.map(t => (
              <div key={t.name} className={`rounded-xl border p-3 flex items-center gap-3 ${t.status === "escalated" ? "border-amber-500/30 bg-amber-500/5" : "border-border/40 bg-card"}`}>
                <div className={`h-2 w-2 rounded-full shrink-0 ${t.status === "active" ? "bg-[hsl(var(--trust-safe))]" : t.status === "escalated" ? "bg-amber-500" : "bg-muted-foreground/30"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{t.focus}</p>
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
            <p className="text-sm text-muted-foreground">{ACTIVE_GOALS.length} active goals</p>
            <Link to="/admin/ai-missions" className="text-xs text-primary hover:underline flex items-center gap-1">Mission Center <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-2">
            {ACTIVE_GOALS.map(g => (
              <div key={g.goal} className="rounded-xl border border-border/40 bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{g.goal}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{g.deadline}</span>
                    <Badge variant={g.status === "done" ? "default" : "outline"}>{g.status === "done" ? "Complete" : `${g.progress}%`}</Badge>
                  </div>
                </div>
                <Progress value={g.progress} className="h-1.5 mb-1" />
                <p className="text-xs text-muted-foreground">Owner: {g.owner}</p>
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{f.title}</p>
                </div>
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
            <p className="text-sm text-muted-foreground">6 healed this week · 3 blocked</p>
            <Link to="/admin/ai-self-healing" className="text-xs text-primary hover:underline flex items-center gap-1">Self-Healing Center <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-2">
            {[
              { action: "Restarted unhealthy projection rebuild worker", time: "12m ago", verified: true },
              { action: "Reverted bad feature flag: revenue-sidebar-v2", time: "1h ago", verified: true },
              { action: "Auto-fixed broken route /admin/durability", time: "2h ago", verified: true },
              { action: "Invalidated stale brand-kit CDN cache", time: "4h ago", verified: true },
              { action: "Retried stuck connector sync job (Stripe)", time: "6h ago", verified: true },
            ].map((h, i) => (
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
          {/* Environments */}
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

          {/* Release Gates */}
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

      {/* Quick Links — Wow Features + Deep Dives */}
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
