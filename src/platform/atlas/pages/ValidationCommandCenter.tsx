import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaCard";
import { ValidationScorecard } from "@/platform/sita/components/sita/truth/ValidationScorecard";
import { LaunchBlockerPanel, type LaunchBlocker } from "@/platform/sita/components/sita/truth/LaunchBlockerPanel";
import { DegradedStateBanner } from "@/platform/sita/components/sita/truth/DegradedStateBanner";
import {
  CheckCircle, XCircle, AlertTriangle, Play, Shield, Activity, Rocket,
  FileCheck, BarChart3, AlertOctagon, Clock, Zap, GitBranch, Layers, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const testSuites = [
  { name: "Unit Tests", total: 42, passed: 42, failed: 0, pending: 0, duration: "4.2s" },
  { name: "Integration Tests", total: 18, passed: 18, failed: 0, pending: 0, duration: "12.8s" },
  { name: "E2E — Auth Flows", total: 6, passed: 6, failed: 0, pending: 0, duration: "28s" },
  { name: "E2E — Approval Chain", total: 4, passed: 4, failed: 0, pending: 0, duration: "15s" },
  { name: "E2E — Admin Mutations", total: 8, passed: 7, failed: 1, pending: 0, duration: "22s" },
  { name: "E2E — Deployment Promotion", total: 3, passed: 3, failed: 0, pending: 0, duration: "18s" },
  { name: "E2E — Replay/Rollback", total: 5, passed: 4, failed: 0, pending: 1, duration: "20s" },
  { name: "Degraded State Honesty", total: 4, passed: 4, failed: 0, pending: 0, duration: "8s" },
  { name: "Projection Freshness", total: 6, passed: 5, failed: 1, pending: 0, duration: "10s" },
  { name: "Connector Recovery", total: 3, passed: 3, failed: 0, pending: 0, duration: "14s" },
  { name: "Launch Ring Validation", total: 10, passed: 9, failed: 0, pending: 1, duration: "30s" },
];

const totalTests = testSuites.reduce((s, t) => s + t.total, 0);
const totalPassed = testSuites.reduce((s, t) => s + t.passed, 0);
const totalFailed = testSuites.reduce((s, t) => s + t.failed, 0);

const readinessItems = [
  { name: "Auth E2E verified", status: "pass" as const, weight: 10 },
  { name: "RLS policies enforced", status: "pass" as const, weight: 10 },
  { name: "Admin mutations receipted", status: "pass" as const, weight: 8 },
  { name: "Approval bypass blocked", status: "pass" as const, weight: 10 },
  { name: "Projection freshness < 5min", status: "fail" as const, weight: 6 },
  { name: "All connectors healthy", status: "pass" as const, weight: 5 },
  { name: "Secret rotation current", status: "pass" as const, weight: 8 },
  { name: "DR restore tested", status: "pass" as const, weight: 7 },
  { name: "Performance budget met", status: "pending" as const, weight: 6 },
  { name: "Canary deployment clean", status: "pending" as const, weight: 8 },
  { name: "Error rate < 0.1%", status: "pass" as const, weight: 7 },
  { name: "Load test passed", status: "pending" as const, weight: 5 },
];

const blockers: LaunchBlocker[] = [
  { id: "b1", title: "Admin mutation E2E test failing", severity: "high", domain: "testing", resolved: false, evidence: "1 test in E2E — Admin Mutations suite" },
  { id: "b2", title: "Projection freshness exceeds threshold", severity: "medium", domain: "truth", resolved: false, evidence: "cross-domain-kpis and digital-presence projections" },
  { id: "b3", title: "Performance budget not validated", severity: "medium", domain: "deployment", resolved: false },
  { id: "b4", title: "Canary deployment not started", severity: "high", domain: "deployment", resolved: false },
  { id: "b5", title: "RLS on all tables verified", severity: "critical", domain: "security", resolved: true, evidence: "89/89 tables" },
  { id: "b6", title: "Auth flow E2E passing", severity: "critical", domain: "testing", resolved: true, evidence: "6/6 tests" },
];

const criticalFlows = [
  { flow: "User Registration → Profile → First Use", steps: 5, verified: true, lastRun: "2m ago" },
  { flow: "Login → Session → Protected Route", steps: 3, verified: true, lastRun: "2m ago" },
  { flow: "Create Invoice → Approval → Send", steps: 6, verified: true, lastRun: "5m ago" },
  { flow: "Connector Auth → Sync → Health Check", steps: 4, verified: true, lastRun: "8m ago" },
  { flow: "Admin Toggle → Receipt → Audit", steps: 3, verified: true, lastRun: "10m ago" },
  { flow: "Advisor Request → Response → Feedback", steps: 4, verified: true, lastRun: "12m ago" },
  { flow: "Deployment → Ring Promotion → Rollback", steps: 5, verified: false, lastRun: "never" },
];

const crossDomainFlows = [
  { from: "Investment Office", to: "Receipt Service", flow: "Trade Execution → Receipt", tested: true, lastRun: "5m ago" },
  { from: "Revenue Office", to: "Automation Engine", flow: "Campaign → Automation Trigger", tested: true, lastRun: "8m ago" },
  { from: "Revenue Office", to: "Receipt Service", flow: "Invoice → Payment → Receipt", tested: true, lastRun: "3m ago" },
  { from: "Digital Presence", to: "Revenue Office", flow: "Lead Capture → CRM Entry", tested: true, lastRun: "10m ago" },
  { from: "Concierge", to: "Calendar", flow: "Task → Calendar Event → Reminder", tested: true, lastRun: "15m ago" },
  { from: "Advisor Board", to: "Approval Service", flow: "AI Action → Approval Gate", tested: true, lastRun: "6m ago" },
  { from: "Connector Gateway", to: "Projection Engine", flow: "Sync → Projection Update", tested: false, lastRun: "never" },
  { from: "Auth Service", to: "Profile + Roles", flow: "Signup → Profile → Role Assignment", tested: true, lastRun: "2m ago" },
];

const testRunHistory = [
  { timestamp: "2026-04-10 14:30", total: 109, passed: 107, failed: 2, duration: "3m 12s", trigger: "Push to main" },
  { timestamp: "2026-04-10 12:15", total: 109, passed: 106, failed: 3, duration: "3m 28s", trigger: "Push to main" },
  { timestamp: "2026-04-10 09:00", total: 108, passed: 108, failed: 0, duration: "3m 05s", trigger: "Scheduled" },
  { timestamp: "2026-04-09 18:45", total: 108, passed: 107, failed: 1, duration: "3m 10s", trigger: "Push to main" },
  { timestamp: "2026-04-09 14:20", total: 107, passed: 107, failed: 0, duration: "2m 58s", trigger: "Push to main" },
];

const archGateCompliance = [
  { gate: "No circular imports", status: "pass" as const, evidence: "0 cycles detected" },
  { gate: "Max component depth ≤ 5", status: "pass" as const, evidence: "Deepest: 4 levels" },
  { gate: "No direct Supabase calls outside hooks", status: "pass" as const, evidence: "All queries through custom hooks" },
  { gate: "RLS on every public table", status: "pass" as const, evidence: "89/89 tables verified" },
  { gate: "Edge functions < 50KB", status: "pass" as const, evidence: "Largest: 32KB" },
  { gate: "No hardcoded secrets", status: "pass" as const, evidence: "0 secrets in source" },
  { gate: "Semantic color tokens only", status: "fail" as const, evidence: "3 files use direct colors" },
];

export default function ValidationCommandCenter() {
  const [tab, setTab] = useState("coverage");
  const passRate = Math.round((totalPassed / totalTests) * 100);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-6 p-6">
<SitaPageHeader title="Validation Command Center" subtitle="Test coverage, cross-domain E2E flows, readiness scoring, launch blockers, architecture gates, and test history" />

      {totalFailed > 0 && (
        <DegradedStateBanner severity="warning" reason={`${totalFailed} test(s) failing — launch readiness affected`} impact="Admin mutation E2E and projection freshness tests" dismissible />
      )}

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Tests", value: totalTests, color: "text-foreground" },
          { label: "Pass Rate", value: `${passRate}%`, color: passRate >= 95 ? "text-green-400" : "text-amber-400" },
          { label: "Failed", value: totalFailed, color: totalFailed > 0 ? "text-red-400" : "text-green-400" },
          { label: "Blockers", value: blockers.filter(b => !b.resolved).length, color: "text-red-400" },
          { label: "Cross-Domain", value: `${crossDomainFlows.filter(f => f.tested).length}/${crossDomainFlows.length}`, color: "text-blue-400" },
          { label: "Arch Gates", value: `${archGateCompliance.filter(g => g.status === "pass").length}/${archGateCompliance.length}`, color: "text-green-400" },
        ].map((k, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5 flex-wrap">
          {[
            { value: "coverage", label: "Test Coverage", icon: CheckCircle },
            { value: "crossdomain", label: "Cross-Domain", icon: GitBranch },
            { value: "readiness", label: "Readiness", icon: Rocket },
            { value: "blockers", label: "Blockers", icon: AlertOctagon },
            { value: "flows", label: "Critical Flows", icon: Zap },
            { value: "history", label: "Run History", icon: Clock },
            { value: "archgates", label: "Arch Gates", icon: Shield },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 space-y-3">
          <TabsContent value="coverage">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold">Test Suites ({testSuites.length})</h3>
              <Button variant="ghost" size="sm" className="text-[10px] gap-1 h-6"><Play className="w-3 h-3" /> Run All</Button>
            </div>
            {testSuites.map(suite => (
              <div key={suite.name} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  {suite.failed > 0 ? <XCircle className="w-4 h-4 text-red-400" /> :
                   suite.pending > 0 ? <Clock className="w-4 h-4 text-amber-400" /> :
                   <CheckCircle className="w-4 h-4 text-green-400" />}
                  <div>
                    <p className="text-xs font-medium text-foreground">{suite.name}</p>
                    <p className="text-[10px] text-muted-foreground">{suite.passed}/{suite.total} passed • {suite.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(suite.passed / suite.total) * 100} className="w-20 h-1.5" />
                  {suite.failed > 0 && <Badge variant="destructive" className="text-[8px]">{suite.failed} failed</Badge>}
                  {suite.pending > 0 && <Badge variant="secondary" className="text-[8px]">{suite.pending} pending</Badge>}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="crossdomain">
            <h3 className="text-xs font-semibold mb-3">Cross-Domain E2E Flow Matrix</h3>
            <div className="space-y-2">
              {crossDomainFlows.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    {f.tested ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[8px]">{f.from}</Badge>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-[8px]">{f.to}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{f.flow} • Last: {f.lastRun}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={f.tested ? "default" : "destructive"} className="text-[9px]">{f.tested ? "Verified" : "Untested"}</Badge>
                    <Button variant="ghost" size="sm" className="text-[10px] h-5 gap-0.5"><Play className="w-2.5 h-2.5" />Run</Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="readiness">
            <ValidationScorecard title="Production Readiness Score" items={readinessItems} />
          </TabsContent>

          <TabsContent value="blockers">
            <LaunchBlockerPanel blockers={blockers} />
          </TabsContent>

          <TabsContent value="flows">
            <h3 className="text-xs font-semibold mb-3">Critical Flow Verification</h3>
            {criticalFlows.map(flow => (
              <div key={flow.flow} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  {flow.verified ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                  <div>
                    <p className="text-xs font-medium text-foreground">{flow.flow}</p>
                    <p className="text-[10px] text-muted-foreground">{flow.steps} steps • Last run: {flow.lastRun}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={flow.verified ? "default" : "destructive"} className="text-[9px]">{flow.verified ? "Verified" : "Unverified"}</Badge>
                  <Button variant="ghost" size="sm" className="text-[10px] h-5 gap-0.5"><Play className="w-2.5 h-2.5" />Run</Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="history">
            <h3 className="text-xs font-semibold mb-3">Test Run History</h3>
            <div className="space-y-2">
              {testRunHistory.map((run, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    {run.failed === 0 ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    <div>
                      <p className="text-xs font-medium text-foreground">{run.timestamp}</p>
                      <p className="text-[10px] text-muted-foreground">{run.passed}/{run.total} passed • {run.duration} • {run.trigger}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(run.passed / run.total) * 100} className="w-16 h-1.5" />
                    {run.failed > 0 && <Badge variant="destructive" className="text-[8px]">{run.failed} failed</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="archgates">
            <h3 className="text-xs font-semibold mb-3">Architecture Gate Compliance</h3>
            <div className="space-y-1.5">
              {archGateCompliance.map(g => (
                <div key={g.gate} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    {g.status === "pass" ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                    <div>
                      <p className="text-[10px] font-medium text-foreground">{g.gate}</p>
                      <p className="text-[9px] text-muted-foreground">{g.evidence}</p>
                    </div>
                  </div>
                  <Badge variant={g.status === "pass" ? "default" : "destructive"} className="text-[9px] capitalize">{g.status}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}