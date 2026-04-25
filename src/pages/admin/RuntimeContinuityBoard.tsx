import { useState, useEffect } from "react";
import CPSSubNav from "@/platform/admin/components/admin/CPSSubNav";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, CheckCircle, XCircle, RefreshCw, Shield, Brain, Database, GitBranch, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchPersistedEvents, getScopedMemoryStats, getPolicyEvaluationStats,
  fetchActionLineage, getAssetStats, loadAllEngineStates,
} from "@/data/persistence";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

interface ContinuityCheck {
  name: string;
  icon: React.ElementType;
  status: "pass" | "fail" | "warning" | "checking";
  detail: string;
  survivesRefresh: boolean;
}

export default function RuntimeContinuityBoard() {
  const [checks, setChecks] = useState<ContinuityCheck[]>([]);
  const [running, setRunning] = useState(false);

  const { data: events = [] } = useQuery({ queryKey: ["cont-events"], queryFn: () => fetchPersistedEvents({ limit: 1 }), staleTime: 60000 });
  const { data: memStats } = useQuery({ queryKey: ["cont-mem"], queryFn: getScopedMemoryStats, staleTime: 60000 });
  const { data: polStats } = useQuery({ queryKey: ["cont-pol"], queryFn: getPolicyEvaluationStats, staleTime: 60000 });
  const { data: actions = [] } = useQuery({ queryKey: ["cont-actions"], queryFn: () => fetchActionLineage({ limit: 1 }), staleTime: 60000 });
  const { data: assetStats } = useQuery({ queryKey: ["cont-assets"], queryFn: getAssetStats, staleTime: 60000 });
  const { data: engineStates } = useQuery({ queryKey: ["cont-engine"], queryFn: loadAllEngineStates, staleTime: 60000 });

  const runChecks = () => {
    setRunning(true);
    const results: ContinuityCheck[] = [
      { name: "Event Durability", icon: Activity, status: events.length > 0 ? "pass" : "warning", detail: events.length > 0 ? `${events.length}+ events in durable store` : "No events persisted yet", survivesRefresh: events.length > 0 },
      { name: "Memory Hydration", icon: Brain, status: (memStats?.total ?? 0) > 0 ? "pass" : "warning", detail: (memStats?.total ?? 0) > 0 ? `${memStats!.total} entries across ${Object.keys(memStats!.byScope).length} scopes` : "No memory to hydrate", survivesRefresh: (memStats?.total ?? 0) > 0 },
      { name: "Policy Retrieval", icon: Shield, status: (polStats?.total ?? 0) > 0 ? "pass" : "warning", detail: (polStats?.total ?? 0) > 0 ? `${polStats!.total} decisions retrievable` : "No policy decisions stored", survivesRefresh: (polStats?.total ?? 0) > 0 },
      { name: "Action Lineage", icon: GitBranch, status: actions.length > 0 ? "pass" : "warning", detail: actions.length > 0 ? `${actions.length}+ action records with full lineage` : "No action records yet", survivesRefresh: actions.length > 0 },
      { name: "Intelligence Assets", icon: Zap, status: (assetStats?.total ?? 0) > 0 ? "pass" : "warning", detail: (assetStats?.total ?? 0) > 0 ? `${assetStats!.total} reusable artifacts` : "No intelligence artifacts", survivesRefresh: (assetStats?.total ?? 0) > 0 },
      { name: "Engine State", icon: Database, status: Object.keys(engineStates ?? {}).length > 0 ? "pass" : "warning", detail: Object.keys(engineStates ?? {}).length > 0 ? `${Object.keys(engineStates!).length} engines with saved state` : "No engine state saved", survivesRefresh: Object.keys(engineStates ?? {}).length > 0 },
    ];
    setChecks(results);
    setTimeout(() => setRunning(false), 500);
  };

  useEffect(() => { runChecks(); }, [events, memStats, polStats, actions, assetStats, engineStates]);

  const passCount = checks.filter(c => c.status === "pass").length;
  const totalCount = checks.length || 1;
  const confidencePct = (passCount / totalCount) * 100;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <CPSSubNav />
<motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }} className="space-y-4">
        <motion.div variants={fade} className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Runtime Continuity Board</h1>
          <Badge variant={confidencePct >= 80 ? "default" : confidencePct >= 50 ? "secondary" : "destructive"}>
            {confidencePct.toFixed(0)}% continuity
          </Badge>
          <Button variant="outline" size="sm" onClick={runChecks} disabled={running} className="ml-auto">
            <RefreshCw className={`h-3 w-3 mr-1 ${running ? "animate-spin" : ""}`} />Re-check
          </Button>
        </motion.div>

        {/* Confidence gauge */}
        <motion.div variants={fade}>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Reconstruction Confidence</span>
                <span>{passCount}/{totalCount} systems verified</span>
              </div>
              <Progress value={confidencePct} className="h-4" />
              <p className="text-xs text-muted-foreground mt-2">
                {confidencePct >= 80 ? "Platform state can be reliably reconstructed across sessions" :
                 confidencePct >= 50 ? "Partial continuity — some systems need activation" :
                 "Low continuity — platform state is mostly ephemeral"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Survival Matrix */}
        <motion.div variants={fade} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {checks.map(check => (
            <Card key={check.name} className={`border-border/50 ${check.status === "pass" ? "bg-emerald-500/5 border-emerald-500/20" : check.status === "fail" ? "bg-red-500/5 border-red-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <check.icon className={`h-5 w-5 ${check.status === "pass" ? "text-emerald-400" : check.status === "fail" ? "text-red-400" : "text-amber-400"}`} />
                  <div className="flex items-center gap-1">
                    {check.survivesRefresh ? (
                      <Badge className="text-[9px] bg-emerald-500/20 text-emerald-400">survives refresh</Badge>
                    ) : (
                      <Badge className="text-[9px] bg-amber-500/20 text-amber-400">ephemeral</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground">{check.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{check.detail}</p>
                <div className="mt-2 flex items-center gap-1">
                  {check.status === "pass" ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-amber-400" />}
                  <span className="text-[10px] text-muted-foreground">{check.status === "pass" ? "Verified" : "Needs data"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Session Survival Summary */}
        <motion.div variants={fade}>
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Session Survival Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">{checks.filter(c => c.survivesRefresh).length}/{totalCount}</p>
                  <p className="text-xs text-muted-foreground">Survive Refresh</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{passCount}/{totalCount}</p>
                  <p className="text-xs text-muted-foreground">Verified Active</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{Object.keys(engineStates ?? {}).length}</p>
                  <p className="text-xs text-muted-foreground">Engine States Saved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{confidencePct >= 80 ? "✓" : "⚠"}</p>
                  <p className="text-xs text-muted-foreground">OS Substrate {confidencePct >= 80 ? "Durable" : "Partial"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
