import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { TrendingUp, Brain, AlertTriangle, CheckCircle2, RotateCcw, Sparkles, Target, Users } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const PATTERNS = [
  { pattern: "Route mapping errors recur after lazy-import refactors", frequency: "4x in 30 days", domain: "Frontend", confidence: 88, severity: "high", improvement: "Added pre-commit route validation check", status: "implemented" as const },
  { pattern: "Feature flag rollbacks within 2 hours of activation", frequency: "5x in 30 days", domain: "Deployment", confidence: 82, severity: "medium", improvement: "Proposed canary rollout requirement for all flags", status: "proposed" as const },
  { pattern: "CDN cache staleness after brand kit mutations", frequency: "Weekly", domain: "Infrastructure", confidence: 91, severity: "medium", improvement: "Auto-invalidate cache on brand kit save", status: "implemented" as const },
  { pattern: "Operator overrides approval threshold for low-risk changes", frequency: "8x in 30 days", domain: "Governance", confidence: 76, severity: "low", improvement: "Lower approval threshold for low-risk auto-heals", status: "proposed" as const },
  { pattern: "Test flakiness in approval workflow suite", frequency: "3x in 14 days", domain: "QA", confidence: 84, severity: "medium", improvement: "Identified timing-dependent assertions, propose retries", status: "in_review" as const },
  { pattern: "UI regression in admin cards after design updates", frequency: "2x in 14 days", domain: "Design", confidence: 79, severity: "medium", improvement: "Add visual regression snapshots for admin surfaces", status: "proposed" as const },
];

const OUTCOMES = [
  { recommendation: "Add mutex lock on projection rebuilds", accepted: true, outcome: "success", impact: "Eliminated 14 concurrent rebuild errors", confidence_delta: "+8%" },
  { recommendation: "Canary rollout for sidebar feature flag", accepted: true, outcome: "success", impact: "Caught rendering bug before 100% rollout", confidence_delta: "+5%" },
  { recommendation: "Raise prices 10% on premium tier", accepted: false, outcome: "rejected", impact: "User chose conservative approach", confidence_delta: "-2%" },
  { recommendation: "Auto-fix broken /admin/durability route", accepted: true, outcome: "success", impact: "Route restored in 12 seconds", confidence_delta: "+3%" },
  { recommendation: "Disable brand-kit preview caching", accepted: true, outcome: "partial", impact: "Fixed staleness but increased load by 200ms", confidence_delta: "+1%" },
];

const CALIBRATION = [
  { agent: "Error Fixer", accuracy: 91, falsePositives: 3, missedIssues: 1, trend: "improving" as const },
  { agent: "QA Engineer", accuracy: 88, falsePositives: 5, missedIssues: 2, trend: "stable" as const },
  { agent: "Design Engineer", accuracy: 79, falsePositives: 8, missedIssues: 1, trend: "improving" as const },
  { agent: "Reliability Engineer", accuracy: 93, falsePositives: 2, missedIssues: 0, trend: "stable" as const },
  { agent: "Performance Optimizer", accuracy: 74, falsePositives: 6, missedIssues: 3, trend: "declining" as const },
  { agent: "Security Reviewer", accuracy: 96, falsePositives: 1, missedIssues: 0, trend: "stable" as const },
];

const AILearningCenter = () => {
  const [tab, setTab] = useState("patterns");

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <AdminPageHeader icon={TrendingUp} title="Learning & Improvement Center" subtitle="What the AI team learned — patterns, outcomes, calibration, and permanent improvements" accent="primary" />

      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Patterns Discovered", v: PATTERNS.length },
          { l: "Improvements Implemented", v: PATTERNS.filter(p => p.status === "implemented").length },
          { l: "Recommendations Tracked", v: OUTCOMES.length },
          { l: "Avg Agent Accuracy", v: `${Math.round(CALIBRATION.reduce((a,c) => a + c.accuracy, 0) / CALIBRATION.length)}%` },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className="text-xl font-bold">{c.v}</p>
            <p className="text-[11px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="patterns"><Brain className="h-3.5 w-3.5 mr-1" />Patterns</TabsTrigger>
          <TabsTrigger value="outcomes"><Target className="h-3.5 w-3.5 mr-1" />Outcomes</TabsTrigger>
          <TabsTrigger value="calibration"><Users className="h-3.5 w-3.5 mr-1" />Agent Calibration</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-2 mt-4">
          {PATTERNS.map((p, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{p.pattern}</span>
                <Badge variant={p.status === "implemented" ? "default" : "outline"}>{p.status}</Badge>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                <span>{p.domain}</span><span>Frequency: {p.frequency}</span><span>Confidence: {p.confidence}%</span>
              </div>
              <div className="rounded-lg bg-primary/5 p-2">
                <p className="text-xs text-primary">→ {p.improvement}</p>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-2 mt-4">
          {OUTCOMES.map((o, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-4 flex items-center gap-3">
              {o.outcome === "success" ? <CheckCircle2 className="h-4 w-4 text-[hsl(var(--trust-safe))] shrink-0" /> :
               o.outcome === "rejected" ? <RotateCcw className="h-4 w-4 text-muted-foreground shrink-0" /> :
               <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />}
              <div className="flex-1">
                <p className="text-sm font-medium">{o.recommendation}</p>
                <p className="text-xs text-muted-foreground">{o.impact}</p>
              </div>
              <div className="text-right shrink-0">
                <Badge variant={o.accepted ? "default" : "secondary"}>{o.accepted ? "Accepted" : "Rejected"}</Badge>
                <p className={`text-xs mt-1 ${o.confidence_delta.startsWith("+") ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>{o.confidence_delta}</p>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="calibration" className="space-y-2 mt-4">
          {CALIBRATION.map((c, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{c.agent}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={c.trend === "improving" ? "default" : c.trend === "declining" ? "destructive" : "outline"}>{c.trend}</Badge>
                  <span className="text-sm font-bold">{c.accuracy}%</span>
                </div>
              </div>
              <Progress value={c.accuracy} className="h-1.5 mb-2" />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>False Positives: {c.falsePositives}</span>
                <span>Missed Issues: {c.missedIssues}</span>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AILearningCenter;
