import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain, AlertTriangle, CheckCircle2, Shield, Zap, Clock, TrendingUp,
  Users, Wrench, Eye, RotateCcw, Sparkles, Activity, ArrowUpRight,
  Bug, Gauge, Rocket, ShieldCheck, FileCheck, Target
} from "lucide-react";

// ── Executive Layer Data ──
const EXEC_CARDS = [
  { label: "Issues Need Attention", value: 12, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Fixes Ready", value: 4, icon: Wrench, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10" },
  { label: "Auto-Heals Applied", value: 3, icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
  { label: "Release Confidence", value: "82%", icon: Rocket, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10" },
  { label: "Regressions Prevented", value: 7, icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10" },
  { label: "Approvals Waiting", value: 2, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
];

const ACTIVE_GOALS = [
  { goal: "Reduce admin shell load time to < 1.2s", progress: 68, owner: "Performance Optimizer", status: "in_progress" },
  { goal: "Achieve 95% test coverage on core flows", progress: 82, owner: "QA Engineer", status: "in_progress" },
  { goal: "Zero critical accessibility violations", progress: 91, owner: "Frontend Engineer", status: "in_progress" },
  { goal: "Resolve all P0 incident backlog", progress: 100, owner: "Reliability Engineer", status: "done" },
];

const RECENT_ACTIONS = [
  { action: "Auto-fixed broken route mapping /admin/durability", agent: "Error Fixer", time: "12m ago", type: "auto-heal" as const },
  { action: "Proposed layout improvement for Mission Control header", agent: "Design Engineer", time: "28m ago", type: "proposal" as const },
  { action: "Reverted bad feature flag for revenue-office sidebar", agent: "Reliability Engineer", time: "1h ago", type: "rollback" as const },
  { action: "Generated regression tests for approval flow", agent: "QA Engineer", time: "2h ago", type: "improvement" as const },
  { action: "Patched stale projection cache invalidation", agent: "Backend Engineer", time: "3h ago", type: "fix" as const },
  { action: "Blocked risky schema migration — escalated to human", agent: "Security Reviewer", time: "4h ago", type: "blocked" as const },
];

const INCIDENTS = [
  { title: "Elevated error rate on /api/projections", severity: "high" as const, duration: "18m", assigned: "Reliability Engineer" },
  { title: "Stale cache serving old brand kit colors", severity: "medium" as const, duration: "42m", assigned: "Backend Engineer" },
];

const ENVIRONMENTS = [
  { env: "Production", status: "healthy" as const, confidence: 94, deployedAt: "2h ago", drift: "none" },
  { env: "Staging", status: "warning" as const, confidence: 78, deployedAt: "35m ago", drift: "2 config diffs" },
  { env: "Preview", status: "healthy" as const, confidence: 88, deployedAt: "12m ago", drift: "none" },
];

const AIEngineeringBoard = () => {
  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={Brain}
        title="AI Engineering Board"
        subtitle="Your AI engineering department — goals, fixes, healing, approvals, and release confidence"
        accent="primary"
      >
        <div className="flex items-center gap-2">
          <Link to="/admin/ai-team-roster">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted/50 gap-1"><Users className="h-3 w-3" /> Team Roster</Badge>
          </Link>
          <Link to="/admin/ai-fix-center">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted/50 gap-1"><Bug className="h-3 w-3" /> Fix Center</Badge>
          </Link>
          <Link to="/admin/ai-self-healing">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted/50 gap-1"><Sparkles className="h-3 w-3" /> Self-Healing</Badge>
          </Link>
        </div>
      </AdminPageHeader>

      {/* Executive Layer — Simple Cards */}
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

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview"><Activity className="h-3.5 w-3.5 mr-1" />Overview</TabsTrigger>
          <TabsTrigger value="goals"><Target className="h-3.5 w-3.5 mr-1" />Goals</TabsTrigger>
          <TabsTrigger value="activity"><Zap className="h-3.5 w-3.5 mr-1" />Activity</TabsTrigger>
          <TabsTrigger value="environments"><Shield className="h-3.5 w-3.5 mr-1" />Environments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Active Incidents */}
          {INCIDENTS.length > 0 && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <AlertTriangle className="h-4 w-4" /> Active Incidents
              </div>
              {INCIDENTS.map(inc => (
                <div key={inc.title} className="rounded-lg border border-border/40 bg-card p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{inc.title}</p>
                    <p className="text-xs text-muted-foreground">Assigned: {inc.assigned} · Duration: {inc.duration}</p>
                  </div>
                  <Badge variant={inc.severity === "high" ? "destructive" : "outline"}>{inc.severity}</Badge>
                </div>
              ))}
            </div>
          )}

          {/* Release Confidence */}
          <div className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Release Confidence</span>
              </div>
              <span className="text-2xl font-bold text-[hsl(var(--trust-safe))]">82%</span>
            </div>
            <Progress value={82} className="h-2" />
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span>Tests: 94% pass</span>
              <span>Build: clean</span>
              <span>Security: 1 advisory</span>
              <span>Accessibility: 2 warnings</span>
              <span>Performance: within SLO</span>
            </div>
          </div>

          {/* Recent AI Team Activity */}
          <div className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Recent AI Team Activity</span>
            </div>
            <div className="space-y-2">
              {RECENT_ACTIONS.slice(0, 5).map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${
                    a.type === "auto-heal" ? "bg-[hsl(var(--trust-safe))]" :
                    a.type === "rollback" ? "bg-amber-500" :
                    a.type === "blocked" ? "bg-destructive" :
                    a.type === "proposal" ? "bg-primary" : "bg-[hsl(var(--trust-safe))]"
                  }`} />
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

        <TabsContent value="goals" className="space-y-3 mt-4">
          {ACTIVE_GOALS.map(g => (
            <div key={g.goal} className="rounded-xl border border-border/40 bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{g.goal}</span>
                <Badge variant={g.status === "done" ? "default" : "outline"}>{g.status === "done" ? "Complete" : `${g.progress}%`}</Badge>
              </div>
              <Progress value={g.progress} className="h-1.5 mb-2" />
              <p className="text-xs text-muted-foreground">Owner: {g.owner}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="activity" className="space-y-2 mt-4">
          {RECENT_ACTIONS.map((a, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-4 flex items-start gap-3">
              <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${
                a.type === "auto-heal" ? "bg-[hsl(var(--trust-safe))]" :
                a.type === "rollback" ? "bg-amber-500" :
                a.type === "blocked" ? "bg-destructive" :
                a.type === "proposal" ? "bg-primary" : "bg-[hsl(var(--trust-safe))]"
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{a.action}</p>
                <p className="text-xs text-muted-foreground mt-1">{a.agent} · {a.time}</p>
              </div>
              <Badge variant="outline" className="shrink-0">{a.type}</Badge>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="environments" className="space-y-3 mt-4">
          {ENVIRONMENTS.map(e => (
            <div key={e.env} className="rounded-xl border border-border/40 bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${e.status === "healthy" ? "bg-[hsl(var(--trust-safe))]" : "bg-amber-500"}`} />
                  <span className="text-sm font-semibold">{e.env}</span>
                </div>
                <Badge variant={e.status === "healthy" ? "default" : "outline"}>{e.confidence}% confidence</Badge>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Deployed: {e.deployedAt}</span>
                <span>Drift: {e.drift}</span>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Team Roster", icon: Users, path: "/admin/ai-team-roster" },
          { label: "Mission Center", icon: Target, path: "/admin/ai-missions" },
          { label: "Fix Center", icon: Bug, path: "/admin/ai-fix-center" },
          { label: "Design Studio", icon: Eye, path: "/admin/ai-design-studio" },
          { label: "Self-Healing", icon: Sparkles, path: "/admin/ai-self-healing" },
          { label: "Learning Center", icon: TrendingUp, path: "/admin/ai-learning" },
          { label: "Approval Desk", icon: FileCheck, path: "/admin/ai-approvals" },
          { label: "Release Readiness", icon: Rocket, path: "/admin/launch-readiness" },
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
