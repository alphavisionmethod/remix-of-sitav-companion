import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Bug, AlertTriangle, CheckCircle2, Wrench, Shield, RotateCcw, Sparkles, FileCheck, Eye, Code, Server, Layout } from "lucide-react";
import { useAIEngDomain } from "@/hooks/use-ai-engineering-data";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const severityColors: Record<string, string> = {
  critical: "border-destructive/30 bg-destructive/5",
  high: "border-amber-500/30 bg-amber-500/5",
  medium: "border-border/40",
  low: "border-border/40",
};

const blastRadiusColors: Record<string, string> = {
  isolated: "text-[hsl(var(--trust-safe))]",
  component: "text-primary",
  surface: "text-amber-500",
  "cross-surface": "text-destructive",
  "platform-wide": "text-destructive",
};

const AIFixCenter = () => {
const FIXES: any[] = [];
  const { data: fixes, isDemo } = useAIEngDomain("fixes", FIXES);
  const [expanded, setExpanded] = useState<number | null>(1);
  const [tab, setTab] = useState("all");
  const [view, setView] = useState("severity");

  const filtered = tab === "all" ? fixes :
    tab === "critical" ? fixes.filter((f: any) => f.severity === "critical") :
    tab === "auto-fix" ? fixes.filter((f: any) => f.autoFixEligible) :
    tab === "approval" ? fixes.filter((f: any) => f.approvalNeeded) :
    fixes;

  const sorted = view === "severity" ? filtered :
    view === "confidence" ? [...filtered].sort((a: any, b: any) => b.confidence - a.confidence) :
    view === "blast" ? [...filtered].sort((a: any, b: any) => {
      const order = ["isolated", "component", "surface", "cross-surface", "platform-wide"];
      return order.indexOf(b.blastRadius) - order.indexOf(a.blastRadius);
    }) :
    filtered;

  return (
    <div className="space-y-6 p-6">
<AdminPageHeader icon={Bug} title="Fix Center" subtitle="Issue clusters, root cause analysis, patches, blast radius, auto-fix eligibility, and rollback readiness" accent="destructive" />

      <div className="grid grid-cols-6 gap-2">
        {[
          { l: "Critical", v: fixes.filter((f: any) => f.severity === "critical").length, c: "text-destructive" },
          { l: "High", v: fixes.filter((f: any) => f.severity === "high").length, c: "text-amber-500" },
          { l: "Medium", v: fixes.filter((f: any) => f.severity === "medium").length, c: "text-foreground" },
          { l: "Low", v: fixes.filter((f: any) => f.severity === "low").length, c: "text-muted-foreground" },
          { l: "Auto-Fix Eligible", v: fixes.filter((f: any) => f.autoFixEligible).length, c: "text-[hsl(var(--trust-safe))]" },
          { l: "Avg Confidence", v: `${Math.round(fixes.reduce((a: number, f: any) => a + (f.confidence || 0), 0) / Math.max(fixes.length, 1))}%`, c: "text-primary" },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-3 text-center">
            <p className={`text-lg font-bold ${c.c}`}>{c.v}</p>
            <p className="text-[10px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All Issues</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
            <TabsTrigger value="auto-fix">Auto-Fix</TabsTrigger>
            <TabsTrigger value="approval">Needs Approval</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-1">
          {(["severity", "confidence", "blast"] as const).map(v => (
            <Badge key={v} variant={view === v ? "default" : "outline"} className="text-[10px] cursor-pointer" onClick={() => setView(v)}>
              By {v}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((f: any) => (
          <div key={f.id} className={`rounded-xl border bg-card transition-all overflow-hidden ${severityColors[f.severity] || ""}`}>
            <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === f.id ? null : f.id)}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Bug className={`h-4 w-4 ${f.severity === "critical" ? "text-destructive" : f.severity === "high" ? "text-amber-500" : "text-muted-foreground"}`} />
                  <span className="text-sm font-semibold">{f.title}</span>
                  <Badge variant={f.severity === "critical" ? "destructive" : "outline"} className="text-[10px]">{f.severity}</Badge>
                  {f.autoFixEligible && <Badge variant="outline" className="text-[10px] text-[hsl(var(--trust-safe))] border-[hsl(var(--trust-safe))]/30">Auto-fix eligible</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${blastRadiusColors[f.blastRadius] || ""}`}>{f.blastRadius}</Badge>
                  <span className="text-sm font-bold">{f.confidence}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{f.area} · {f.cluster} similar errors · {f.reproducibility} · {f.environment}</p>
            </div>

            {expanded === f.id && (
              <div className="px-4 pb-4 space-y-4 border-t border-border/20 pt-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Root Cause</p>
                    <p className="text-sm">{f.rootCause}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Suggested Patch</p>
                    <p className="text-sm font-mono text-primary">{f.patch}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Blast Radius</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[9px] text-muted-foreground mb-1">Routes</p>
                      <div className="flex flex-wrap gap-1">
                        {f.affectedRoutes?.map((r: string) => <Badge key={r} variant="outline" className="text-[9px] font-mono">{r}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground mb-1">Components</p>
                      <div className="flex flex-wrap gap-1">
                        {f.affectedComponents?.map((c: string) => <Badge key={c} variant="outline" className="text-[9px]">{c}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground mb-1">Services</p>
                      <div className="flex flex-wrap gap-1">
                        {f.affectedServices?.map((s: string) => <Badge key={s} variant="outline" className="text-[9px]">{s}</Badge>)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><FileCheck className="h-3 w-3" /> {f.testImpact}</span>
                  <span className="flex items-center gap-1">{f.approvalNeeded ? <AlertTriangle className="h-3 w-3 text-amber-500" /> : <CheckCircle2 className="h-3 w-3 text-[hsl(var(--trust-safe))]" />} {f.approvalNeeded ? "Approval needed" : "No approval needed"}</span>
                  <span className="flex items-center gap-1"><RotateCcw className="h-3 w-3" /> {f.rollbackSafe ? "Rollback safe" : "No rollback"}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Reproducibility: {f.reproducibility}</span>
                  <span className="flex items-center gap-1"><Server className="h-3 w-3" /> Env: {f.environment}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-muted-foreground">Confidence</span>
                      <span className="text-xs font-bold">{f.confidence}%</span>
                    </div>
                    <Progress value={f.confidence} className="h-1.5" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIFixCenter;
