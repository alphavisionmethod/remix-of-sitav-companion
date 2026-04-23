import { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, CheckCircle, XCircle, Clock, Shield, AlertTriangle, ArrowRight, GitBranch, Server, Activity, Eye, Globe, Lock, Zap, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const ENVIRONMENTS: any[] = [];

type GateStatus = "passed" | "failed" | "pending" | "skipped" | "blocked";
type RingStatus = "deployed" | "canary" | "staging" | "blocked" | "pending";

interface DeploymentRing {
  name: string;
  status: RingStatus;
  version: string;
  deployedAt?: string;
  health: number;
  instances: number;
  errorRate: number;
}

interface PromotionGate {
  name: string;
  status: GateStatus;
  description: string;
  evidence?: string;
  checkedAt?: string;
  blocker?: boolean;
}

const GATE_ICONS: Record<GateStatus, { icon: typeof CheckCircle; color: string }> = {
  passed: { icon: CheckCircle, color: "text-emerald-400" },
  failed: { icon: XCircle, color: "text-red-400" },
  pending: { icon: Clock, color: "text-amber-400" },
  skipped: { icon: ArrowRight, color: "text-muted-foreground" },
  blocked: { icon: Lock, color: "text-red-400" },
};

const RING_COLORS: Record<RingStatus, string> = {
  deployed: "bg-emerald-500",
  canary: "bg-amber-500",
  staging: "bg-blue-500",
  blocked: "bg-red-500",
  pending: "bg-muted-foreground",
};

export default function DeploymentTruthCenter() {
  const [tab, setTab] = useState("rings");

  const passedGates = ([] as any[]).filter(g => g.status === "passed").length;
  const totalGates = ([] as any[]).length;
  const blockers = ([] as any[]).filter(g => g.blocker && g.status !== "passed");
  const promotionReady = blockers.length === 0;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Deployment Truth Center</h1>
            <p className="text-sm text-muted-foreground">Ring progression, promotion gates, environment readiness, and deployment evidence</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={promotionReady ? "default" : "destructive"} className="gap-1">
              {promotionReady ? <CheckCircle className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {promotionReady ? "Ready to Promote" : `${blockers.length} Blocker${blockers.length > 1 ? "s" : ""}`}
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Gates Passed", value: `${passedGates}/${totalGates}`, color: passedGates === totalGates ? "text-emerald-400" : "text-foreground" },
          { label: "Blockers", value: blockers.length, color: blockers.length > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "Current Version", value: "v2.13.0", color: "text-foreground" },
          { label: "Canary Health", value: "96%", color: "text-amber-400" },
        ].map((k, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={cn("text-xl font-bold", k.color)}>{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          {[
            { value: "rings", label: "Ring Progression", icon: Rocket },
            { value: "gates", label: "Promotion Gates", icon: Shield },
            { value: "environments", label: "Environments", icon: Server },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="rings">
            {/* Ring visualization */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              {([] as any[]).map((ring, ri) => (
                <div key={ring.name} className="flex items-center gap-2">
                  <Card className={cn("min-w-[180px] bg-card/50 border-border/50", ring.status === "blocked" && "border-red-500/30")}>
                    <CardContent className="p-3 text-center">
                      <div className={cn("w-3 h-3 rounded-full mx-auto mb-2", RING_COLORS[ring.status])} />
                      <p className="text-xs font-medium text-foreground">{ring.name}</p>
                      <p className="text-[10px] font-mono text-primary">{ring.version}</p>
                      <Badge variant="outline" className="text-[8px] mt-1 capitalize">{ring.status}</Badge>
                      {ring.deployedAt && <p className="text-[9px] text-muted-foreground mt-1">{ring.deployedAt}</p>}
                    </CardContent>
                  </Card>
                  {ri < ([] as any[]).length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </div>
              ))}
            </div>

            {/* Ring details */}
            <div className="space-y-3">
              {([] as any[]).map(ring => (
                <Card key={ring.name} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2.5 h-2.5 rounded-full", RING_COLORS[ring.status])} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{ring.name}</p>
                          <p className="text-[10px] font-mono text-muted-foreground">{ring.version}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-xs">
                        <div className="text-center"><p className="font-bold text-foreground">{ring.health}%</p><p className="text-[9px] text-muted-foreground">Health</p></div>
                        <div className="text-center"><p className="font-bold text-foreground">{ring.instances}</p><p className="text-[9px] text-muted-foreground">Instances</p></div>
                        <div className="text-center"><p className={cn("font-bold", ring.errorRate > 0.5 ? "text-amber-400" : "text-emerald-400")}>{ring.errorRate}%</p><p className="text-[9px] text-muted-foreground">Error Rate</p></div>
                        <Progress value={ring.health} className="w-20 h-1.5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gates">
            <h3 className="text-sm font-semibold mb-4">Promotion Gates — {passedGates}/{totalGates} passed</h3>
            <Progress value={(passedGates / totalGates) * 100} className="h-2 mb-4" />
            <div className="space-y-2">
              {([] as any[]).map((gate, i) => {
                const gcfg = GATE_ICONS[gate.status];
                const GIcon = gcfg.icon;
                return (
                  <Card key={i} className={cn("bg-card/50 border-border/50", gate.blocker && gate.status !== "passed" && "border-red-500/20")}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GIcon className={cn("w-4 h-4", gcfg.color)} />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium text-foreground">{gate.name}</p>
                              {gate.blocker && <Badge variant="destructive" className="text-[8px]">Blocker</Badge>}
                            </div>
                            <p className="text-[10px] text-muted-foreground">{gate.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-[10px]">
                          {gate.evidence && <span className="text-muted-foreground">{gate.evidence}</span>}
                          {gate.checkedAt && <span className="text-muted-foreground">{gate.checkedAt}</span>}
                          <Badge variant="outline" className={cn("text-[9px] capitalize", gcfg.color)}>{gate.status}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="environments">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {([] as any[]).map(env => (
                <Card key={env.name} className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{env.name}</CardTitle>
                      <Badge variant={env.status === "healthy" ? "default" : "destructive"} className="text-[9px] capitalize">{env.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: "Version", value: env.version },
                      { label: "Uptime", value: env.uptime },
                      { label: "Last Deploy", value: env.lastDeploy },
                    ].map(r => (
                      <div key={r.label} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{r.label}</span>
                        <span className="text-foreground font-mono">{r.value}</span>
                      </div>
                    ))}
                    <div className="flex gap-1 flex-wrap">{env.features.map(f => <Badge key={f} variant="outline" className="text-[8px]">{f}</Badge>)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
