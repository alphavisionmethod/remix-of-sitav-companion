import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Rocket, CheckCircle2, AlertTriangle, Shield, Clock, ArrowRight, RotateCcw, Activity, GitBranch, Eye, TrendingUp } from "lucide-react";
import { useAIEngDomain } from "@/hooks/use-ai-engineering-data";
import { DEMO_ADMIN_ENVIRONMENTS_A_I_RELEASES_CENTER as DEMO_ENVIRONMENTS, DEMO_ADMIN_RELEASE_GATES_A_I_RELEASES_CENTER as DEMO_RELEASE_GATES, DEMO_PROMOTION_EVIDENCE, DEMO_ROLLBACK_OPTIONS, DEMO_ROLLOUT_HISTORY } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const AIReleasesCenter = () => {
  const { isDemo } = useAIEngDomain("efficiencyScores", DEMO_RELEASE_GATES);
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("readiness");
  const passCount = (isDemoMode ? DEMO_RELEASE_GATES : [] as typeof DEMO_RELEASE_GATES).filter(g => g.status === "pass").length;
  const totalRequired = (isDemoMode ? DEMO_RELEASE_GATES : [] as typeof DEMO_RELEASE_GATES).filter(g => g.required).length;
  const requiredPass = (isDemoMode ? DEMO_RELEASE_GATES : [] as typeof DEMO_RELEASE_GATES).filter(g => g.required && g.status === "pass").length;

  return (
    <div className="space-y-6 p-6">
<AdminPageHeader icon={Rocket} title="Release Center" subtitle="Readiness gates, rollout history, promotion evidence, rollback options" accent="trust" />

      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Gates Passing", v: `${passCount}/${(isDemoMode ? DEMO_RELEASE_GATES : [] as typeof DEMO_RELEASE_GATES).length}`, c: passCount === (isDemoMode ? DEMO_RELEASE_GATES : [] as typeof DEMO_RELEASE_GATES).length ? "text-[hsl(var(--trust-safe))]" : "text-amber-500" },
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
            {(isDemoMode ? DEMO_RELEASE_GATES : [] as typeof DEMO_RELEASE_GATES).map(g => (
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
          {(isDemoMode ? DEMO_ENVIRONMENTS : [] as typeof DEMO_ENVIRONMENTS).map(e => (
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
            <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left p-3">Version</th><th className="text-left p-3">Deployed</th><th className="text-center p-3">Gates</th><th className="text-center p-3">Confidence</th><th className="text-center p-3">Issues</th><th className="text-center p-3">Status</th>
              </tr></thead>
              <tbody>{(isDemoMode ? DEMO_ROLLOUT_HISTORY : [] as typeof DEMO_ROLLOUT_HISTORY).map(r => (
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
          </div>
        </TabsContent>

        <TabsContent value="rollback" className="space-y-3 mt-4">
          {(isDemoMode ? DEMO_ROLLBACK_OPTIONS : [] as typeof DEMO_ROLLBACK_OPTIONS).map(r => (
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
              {(isDemoMode ? DEMO_PROMOTION_EVIDENCE : [] as typeof DEMO_PROMOTION_EVIDENCE).map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  {p.met ? <CheckCircle2 className="h-4 w-4 text-[hsl(var(--trust-safe))]" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
                  <span className="text-sm">{p.check}</span>
                  {p.detail && <span className="text-xs text-destructive ml-auto">{p.detail}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className={`rounded-xl border p-4 text-center ${(isDemoMode ? DEMO_PROMOTION_EVIDENCE : [] as typeof DEMO_PROMOTION_EVIDENCE).every(p => p.met) ? "border-[hsl(var(--trust-safe))]/30 bg-[hsl(var(--trust-safe))]/5" : "border-destructive/30 bg-destructive/5"}`}>
            <p className={`text-sm font-semibold ${(isDemoMode ? DEMO_PROMOTION_EVIDENCE : [] as typeof DEMO_PROMOTION_EVIDENCE).every(p => p.met) ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
              {(isDemoMode ? DEMO_PROMOTION_EVIDENCE : [] as typeof DEMO_PROMOTION_EVIDENCE).every(p => p.met) ? "✓ Ready to promote" : `⚠ ${(isDemoMode ? DEMO_PROMOTION_EVIDENCE : [] as typeof DEMO_PROMOTION_EVIDENCE).filter(p => !p.met).length} checks not met — promotion blocked`}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIReleasesCenter;
