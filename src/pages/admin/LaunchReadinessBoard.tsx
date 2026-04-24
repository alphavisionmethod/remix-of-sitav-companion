import { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, CheckCircle, XCircle, Clock, AlertTriangle, Shield, Lock, Eye, ArrowRight, Target, BarChart3, Zap, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const READINESS_CHECKS: any[] = [];

type BlockerSeverity = "critical" | "high" | "medium" | "low";
type BlockerStatus = "open" | "in-progress" | "resolved" | "accepted-risk";

interface LaunchBlocker {
  id: string;
  title: string;
  severity: BlockerSeverity;
  status: BlockerStatus;
  domain: string;
  owner: string;
  description: string;
  evidenceMissing?: string[];
  unblockSteps?: string[];
  ringImpact: string[];
  createdAt: string;
}

interface ReadinessCheck {
  category: string;
  checks: { name: string; status: "pass" | "fail" | "warning" | "skip"; detail: string }[];
}

const SEV_CONFIG: Record<BlockerSeverity, { color: string; bg: string }> = {
  critical: { color: "text-red-400", bg: "bg-red-500/10" },
  high: { color: "text-orange-400", bg: "bg-orange-500/10" },
  medium: { color: "text-amber-400", bg: "bg-amber-500/10" },
  low: { color: "text-blue-400", bg: "bg-blue-500/10" },
};

const STATUS_ICON: Record<BlockerStatus, { icon: typeof CheckCircle; color: string }> = {
  open: { icon: AlertTriangle, color: "text-red-400" },
  "in-progress": { icon: Clock, color: "text-amber-400" },
  resolved: { icon: CheckCircle, color: "text-emerald-400" },
  "accepted-risk": { icon: Shield, color: "text-blue-400" },
};

const CHECK_ICON: Record<string, { icon: typeof CheckCircle; color: string }> = {
  pass: { icon: CheckCircle, color: "text-emerald-400" },
  fail: { icon: XCircle, color: "text-red-400" },
  warning: { icon: AlertTriangle, color: "text-amber-400" },
  skip: { icon: ArrowRight, color: "text-muted-foreground" },
};

export default function LaunchReadinessBoard() {
  const [tab, setTab] = useState("blockers");

  const openBlockers = ([] as never[]).filter(b => b.status === "open").length;
  const allChecks = ([] as never[]).flatMap(r => r.checks);
  const passedChecks = allChecks.filter(c => c.status === "pass").length;
  const totalChecks = allChecks.length;
  const readinessScore = Math.round((passedChecks / totalChecks) * 100);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Launch Readiness Board</h1>
            <p className="text-sm text-muted-foreground">Launch blockers, environment readiness, promotion eligibility, and evidence gaps</p>
          </div>
          <Badge variant={openBlockers === 0 ? "default" : "destructive"} className="gap-1 text-sm px-3 py-1">
            {openBlockers === 0 ? <CheckCircle className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {openBlockers === 0 ? "Launch Ready" : `${openBlockers} Blocker${openBlockers > 1 ? "s" : ""}`}
          </Badge>
        </div>
      </motion.div>

      {/* Readiness gauge */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Readiness Score", value: `${readinessScore}%`, color: readinessScore >= 90 ? "text-emerald-400" : readinessScore >= 70 ? "text-amber-400" : "text-red-400" },
          { label: "Checks Passed", value: `${passedChecks}/${totalChecks}`, color: "text-foreground" },
          { label: "Open Blockers", value: openBlockers, color: openBlockers > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "Accepted Risks", value: ([] as never[]).filter(b => b.status === "accepted-risk").length, color: "text-blue-400" },
        ].map((k, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={cn("text-xl font-bold", k.color)}>{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Progress value={readinessScore} className="h-2" />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          {[
            { value: "blockers", label: `Blockers (${([] as never[]).length})`, icon: AlertTriangle },
            { value: "readiness", label: "Readiness Checks", icon: CheckCircle },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="blockers">
            <div className="space-y-3">
              {([] as never[]).map((blocker, idx) => {
                const sevCfg = SEV_CONFIG[blocker.severity];
                const stCfg = STATUS_ICON[blocker.status];
                const StIcon = stCfg.icon;

                return (
                  <motion.div key={blocker.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <Card className={cn("bg-card/50 border-border/50", blocker.status === "open" && blocker.severity === "critical" && "border-red-500/30")}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono text-muted-foreground">{blocker.id}</span>
                              <Badge variant="outline" className={cn("text-[9px]", sevCfg.color)}>{blocker.severity}</Badge>
                              <Badge variant="outline" className={cn("text-[9px]", stCfg.color)}><StIcon className="w-2.5 h-2.5 mr-1" />{blocker.status}</Badge>
                              <Badge variant="outline" className="text-[8px]">{blocker.domain}</Badge>
                            </div>
                            <p className="text-sm font-medium text-foreground">{blocker.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{blocker.description}</p>

                            {blocker.evidenceMissing && blocker.evidenceMissing.length > 0 && (
                              <div className="mt-2">
                                <p className="text-[10px] text-red-400 font-medium">Missing Evidence:</p>
                                <div className="flex gap-1 mt-0.5">{blocker.evidenceMissing.map(e => <Badge key={e} variant="outline" className="text-[8px] text-red-400 border-red-500/30">{e}</Badge>)}</div>
                              </div>
                            )}

                            {blocker.unblockSteps && (
                              <div className="mt-2">
                                <p className="text-[10px] text-muted-foreground font-medium">Unblock Steps:</p>
                                <ol className="list-decimal list-inside text-[10px] text-muted-foreground mt-0.5">{blocker.unblockSteps.map(s => <li key={s}>{s}</li>)}</ol>
                              </div>
                            )}

                            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                              <span>Owner: {blocker.owner}</span>
                              <span>Ring Impact: {blocker.ringImpact.join(", ")}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="readiness">
            <div className="space-y-4">
              {([] as never[]).map(category => {
                const passed = category.checks.filter(c => c.status === "pass").length;
                return (
                  <Card key={category.category} className="bg-card/50 border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{category.category}</CardTitle>
                        <span className="text-xs text-muted-foreground">{passed}/{category.checks.length} passed</span>
                      </div>
                      <Progress value={(passed / category.checks.length) * 100} className="h-1.5" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {category.checks.map(check => {
                        const cfg = CHECK_ICON[check.status];
                        const CIcon = cfg.icon;
                        return (
                          <div key={check.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/10">
                            <div className="flex items-center gap-2">
                              <CIcon className={cn("w-3.5 h-3.5", cfg.color)} />
                              <span className="text-xs text-foreground">{check.name}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{check.detail}</span>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
