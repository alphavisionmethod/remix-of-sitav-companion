import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Rocket, CheckCircle2, AlertTriangle, Shield, Clock, ArrowRight, RotateCcw, Activity, GitBranch, Eye, TrendingUp } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const DEMO_ENVIRONMENTS = [
  { env: "Production", status: "healthy" as const, confidence: 94, version: "v2.14.3", deployedAt: "Apr 4, 14:22", drift: "none", rollbackTo: "v2.14.2" },
  { env: "Staging", status: "warning" as const, confidence: 78, version: "v2.15.0-rc1", deployedAt: "Apr 5, 09:45", drift: "2 config diffs", rollbackTo: "v2.14.3" },
  { env: "Preview", status: "healthy" as const, confidence: 88, version: "v2.15.0-rc2", deployedAt: "Apr 5, 10:12", drift: "none", rollbackTo: "v2.15.0-rc1" },
];

const DEMO_RELEASE_GATES = [
  { gate: "Unit Tests", status: "pass" as const, detail: "1,247/1,247 passing", required: true },
  { gate: "Integration Tests", status: "pass" as const, detail: "89/89 passing", required: true },
  { gate: "Auth Smoke Test", status: "pass" as const, detail: "Login + OAuth + session refresh verified", required: true },
  { gate: "Core Flow Smoke", status: "pass" as const, detail: "Business, Money, Concierge flows verified", required: true },
  { gate: "Performance Budget", status: "fail" as const, detail: "Admin shell LCP 3.2s — budget 1.5s", required: true },
  { gate: "Accessibility Audit", status: "warning" as const, detail: "2 AA violations in admin sidebar", required: false },
  { gate: "Security Scan", status: "pass" as const, detail: "0 critical, 1 low advisory", required: true },
  { gate: "Design Consistency", status: "pass" as const, detail: "92% design token compliance", required: false },
  { gate: "API Contract Check", status: "pass" as const, detail: "All endpoints match schema", required: true },
  { gate: "Rollback Plan", status: "pass" as const, detail: "Automated rollback to v2.14.2 ready", required: true },
  { gate: "Data Migration", status: "pass" as const, detail: "No pending migrations", required: true },
  { gate: "Feature Flag Review", status: "pass" as const, detail: "3 flags reviewed, 1 scheduled sunset", required: false },
];

const DEMO_ROLLOUT_HISTORY = [
  { version: "v2.14.3", env: "Production", at: "Apr 4, 14:22", status: "live" as const, confidence: 94, gates: "11/12 pass", issues: 0 },
  { version: "v2.14.2", env: "Production", at: "Apr 2, 11:05", status: "replaced" as const, confidence: 91, gates: "12/12 pass", issues: 1 },
  { version: "v2.14.1", env: "Production", at: "Mar 30, 16:40", status: "replaced" as const, confidence: 88, gates: "10/12 pass", issues: 0 },
  { version: "v2.14.0", env: "Production", at: "Mar 28, 09:15", status: "rolled_back" as const, confidence: 62, gates: "8/12 pass", issues: 3 },
  { version: "v2.13.5", env: "Production", at: "Mar 25, 14:30", status: "replaced" as const, confidence: 95, gates: "12/12 pass", issues: 0 },
];

const DEMO_ROLLBACK_OPTIONS = [
  { target: "v2.14.2", risk: "low", impact: "Reverts 1 edge function update + 3 UI fixes", estimated: "< 2 min", dataLoss: "None" },
  { target: "v2.14.1", risk: "medium", impact: "Reverts 5 edge functions + projection cache changes", estimated: "< 5 min", dataLoss: "None" },
  { target: "v2.13.5", risk: "high", impact: "Reverts 12 features + 2 schema-dependent changes", estimated: "< 10 min", dataLoss: "Possible projection staleness" },
];

const DEMO_PROMOTION_EVIDENCE = [
  { check: "All required gates passing", met: true },
  { check: "Staging soak time > 4 hours", met: false, detail: "Currently 35 minutes" },
  { check: "No active P0 incidents", met: true },
  { check: "Performance within SLO", met: false, detail: "Admin shell LCP exceeds budget" },
  { check: "Security review complete", met: true },
  { check: "QA sign-off", met: true },
  { check: "Rollback plan verified", met: true },
];

const AIReleasesCenter = () => {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("readiness");
  const passCount = DEMO_RELEASE_GATES.filter(g => g.status === "pass").length;
  const totalRequired = DEMO_RELEASE_GATES.filter(g => g.required).length;
  const requiredPass = DEMO_RELEASE_GATES.filter(g => g.required && g.status === "pass").length;

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <AdminPageHeader icon={Rocket} title="Release Center" subtitle="Readiness gates, rollout history, promotion evidence, rollback options" accent="trust" />

      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Gates Passing", v: `${passCount}/${DEMO_RELEASE_GATES.length}`, c: passCount === DEMO_RELEASE_GATES.length ? "text-[hsl(var(--trust-safe))]" : "text-amber-500" },
          { l: "Required Gates", v: `${requiredPass}/${totalRequired}`, c: requiredPass === totalRequired ? "text-[hsl(var(--trust-safe))]" : "text-destructive" },
          { l: "Release Confidence", v: "78%", c: "text-amber-500" },
          { l: "Promotable", v: requiredPass === totalRequired ? "Yes" : "No", c: requiredPass === totalRequired ? "text-[hsl(var(--trust-safe))]" : "text-destructive" },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className={`text-xl font-bold ${c.c}`}>{c.v}</p>
            <p className="text-[11px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="readiness"><Shield className="h-3.5 w-3.5 mr-1" />Readiness</TabsTrigger>
          <TabsTrigger value="environments"><GitBranch className="h-3.5 w-3.5 mr-1" />Environments</TabsTrigger>
          <TabsTrigger value="history"><Activity className="h-3.5 w-3.5 mr-1" />History</TabsTrigger>
          <TabsTrigger value="rollback"><RotateCcw className="h-3.5 w-3.5 mr-1" />Rollback</TabsTrigger>
          <TabsTrigger value="promotion"><TrendingUp className="h-3.5 w-3.5 mr-1" />Promotion</TabsTrigger>
        </TabsList>

        <TabsContent value="readiness" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {DEMO_RELEASE_GATES.map(g => (
              <div key={g.gate} className={`rounded-xl border p-3 ${
                g.status === "pass" ? "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5" :
                g.status === "fail" ? "border-destructive/20 bg-destructive/5" :
                "border-amber-500/20 bg-amber-500/5"
              }`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {g.status === "pass" ? <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" /> :
                   g.status === "fail" ? <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> :
                   <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                  <span className="text-xs font-semibold">{g.gate}</span>
                  {g.required && <Badge variant="outline" className="text-[8px] ml-auto">Required</Badge>}
                </div>
                <p className="text-[10px] text-muted-foreground">{g.detail}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="environments" className="space-y-3 mt-4">
          {DEMO_ENVIRONMENTS.map(e => (
            <div key={e.env} className="rounded-xl border border-border/40 bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${e.status === "healthy" ? "bg-[hsl(var(--trust-safe))]" : "bg-amber-500"}`} />
                  <span className="text-sm font-semibold">{e.env}</span>
                  <Badge variant="outline" className="text-[10px]">{e.version}</Badge>
                </div>
                <Badge variant={e.status === "healthy" ? "default" : "outline"}>{e.confidence}%</Badge>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Deployed: {e.deployedAt}</span><span>Drift: {e.drift}</span><span>Rollback: {e.rollbackTo}</span>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left p-3">Version</th><th className="text-left p-3">Deployed</th><th className="text-center p-3">Gates</th><th className="text-center p-3">Confidence</th><th className="text-center p-3">Issues</th><th className="text-center p-3">Status</th>
              </tr></thead>
              <tbody>{DEMO_ROLLOUT_HISTORY.map(r => (
                <tr key={r.version + r.at} className="border-b border-border/20">
                  <td className="p-3 font-medium font-mono">{r.version}</td>
                  <td className="p-3">{r.at}</td>
                  <td className="p-3 text-center">{r.gates}</td>
                  <td className="p-3 text-center font-bold">{r.confidence}%</td>
                  <td className="p-3 text-center">{r.issues}</td>
                  <td className="p-3 text-center"><Badge variant={r.status === "live" ? "default" : r.status === "rolled_back" ? "destructive" : "secondary"} className="text-[10px]">{r.status}</Badge></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="rollback" className="space-y-3 mt-4">
          {DEMO_ROLLBACK_OPTIONS.map(r => (
            <div key={r.target} className={`rounded-xl border bg-card p-4 ${r.risk === "high" ? "border-destructive/30" : r.risk === "medium" ? "border-amber-500/30" : "border-border/40"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Rollback to {r.target}</span>
                </div>
                <Badge variant={r.risk === "high" ? "destructive" : r.risk === "medium" ? "outline" : "default"}>{r.risk} risk</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Impact: {r.impact}</span><span>Estimated: {r.estimated}</span>
                <span>Data Loss: {r.dataLoss}</span>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="promotion" className="mt-4">
          <div className="rounded-xl border border-border/40 bg-card p-4 mb-4">
            <div className="flex items-center gap-2 mb-3"><TrendingUp className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Staging → Production Promotion Evidence</span></div>
            <div className="space-y-2">
              {DEMO_PROMOTION_EVIDENCE.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  {p.met ? <CheckCircle2 className="h-4 w-4 text-[hsl(var(--trust-safe))]" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
                  <span className="text-sm">{p.check}</span>
                  {p.detail && <span className="text-xs text-destructive ml-auto">{p.detail}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className={`rounded-xl border p-4 text-center ${DEMO_PROMOTION_EVIDENCE.every(p => p.met) ? "border-[hsl(var(--trust-safe))]/30 bg-[hsl(var(--trust-safe))]/5" : "border-destructive/30 bg-destructive/5"}`}>
            <p className={`text-sm font-semibold ${DEMO_PROMOTION_EVIDENCE.every(p => p.met) ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
              {DEMO_PROMOTION_EVIDENCE.every(p => p.met) ? "✓ Ready to promote" : `⚠ ${DEMO_PROMOTION_EVIDENCE.filter(p => !p.met).length} checks not met — promotion blocked`}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIReleasesCenter;
