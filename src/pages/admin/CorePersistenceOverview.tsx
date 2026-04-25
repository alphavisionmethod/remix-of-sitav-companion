import CPSSubNav from "@/platform/admin/components/admin/CPSSubNav";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Database, Activity, Brain, Shield, Link2, RotateCcw, AlertTriangle, CheckCircle, Server, HardDrive } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchPersistedEvents, fetchDeadLetters, getPersistedTopicCounts,
  fetchScopedMemory, getScopedMemoryStats,
  fetchPolicyEvaluations, getPolicyEvaluationStats,
  fetchActionLineage, findStuckActions,
  fetchIntelligenceAssets, getAssetStats,
} from "@/data/persistence";
import { PageSkeleton } from "@/platform/sita/components/sita/PageSkeleton";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

function HealthCard({ title, icon: Icon, status, detail, count }: { title: string; icon: React.ElementType; status: "healthy" | "warning" | "error"; detail: string; count?: number }) {
  const colors = { healthy: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5", warning: "text-amber-400 border-amber-500/30 bg-amber-500/5", error: "text-red-400 border-red-500/30 bg-red-500/5" };
  return (
    <motion.div variants={fade}>
<Card className={`border ${colors[status]}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <Icon className={`h-5 w-5 ${status === "healthy" ? "text-emerald-400" : status === "warning" ? "text-amber-400" : "text-red-400"}`} />
            <Badge variant={status === "healthy" ? "default" : "destructive"} className="text-[10px]">{status}</Badge>
          </div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">{detail}</p>
          {count !== undefined && <p className="text-lg font-bold text-foreground mt-1">{count.toLocaleString()}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function CorePersistenceOverview() {
  const { data: events } = useQuery({ queryKey: ["cps-events"], queryFn: () => fetchPersistedEvents({ limit: 500 }), staleTime: 30000 });
  const { data: deadLetters } = useQuery({ queryKey: ["cps-dl"], queryFn: () => fetchDeadLetters(100), staleTime: 30000 });
  const { data: memStats } = useQuery({ queryKey: ["cps-mem"], queryFn: getScopedMemoryStats, staleTime: 30000 });
  const { data: policyStats } = useQuery({ queryKey: ["cps-policy"], queryFn: getPolicyEvaluationStats, staleTime: 30000 });
  const { data: actions } = useQuery({ queryKey: ["cps-actions"], queryFn: () => fetchActionLineage({ limit: 500 }), staleTime: 30000 });
  const { data: stuckActions } = useQuery({ queryKey: ["cps-stuck"], queryFn: () => findStuckActions(), staleTime: 30000 });
  const { data: assetStats } = useQuery({ queryKey: ["cps-assets"], queryFn: getAssetStats, staleTime: 30000 });
  const { data: topicCounts } = useQuery({ queryKey: ["cps-topics"], queryFn: getPersistedTopicCounts, staleTime: 30000 });

  const eventCount = events?.length ?? 0;
  const dlCount = deadLetters?.length ?? 0;
  const memTotal = memStats?.total ?? 0;
  const policyTotal = policyStats?.total ?? 0;
  const actionCount = actions?.length ?? 0;
  const stuckCount = stuckActions?.length ?? 0;
  const assetTotal = assetStats?.total ?? 0;
  const topicKeys = Object.keys(topicCounts ?? {});

  const overallHealth = dlCount > 10 || stuckCount > 5 ? "warning" : "healthy";

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <CPSSubNav />
      <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
        <motion.div variants={fade}>
          <div className="flex items-center gap-3 mb-1">
            <Database className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Core Persistence Overview</h1>
            <Badge variant={overallHealth === "healthy" ? "default" : "destructive"} className="ml-2">{overallHealth}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Executive overview of the OS persistence substrate — events, memory, policy, actions, intelligence</p>
        </motion.div>

        {/* Health Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <HealthCard icon={Activity} title="EventBus" status={eventCount > 0 ? "healthy" : "warning"} detail={`${topicKeys.length} topics tracked`} count={eventCount} />
          <HealthCard icon={Brain} title="Memory" status={memTotal > 0 ? "healthy" : "warning"} detail={`${Object.keys(memStats?.byScope ?? {}).length} scopes active`} count={memTotal} />
          <HealthCard icon={Shield} title="Policy Ledger" status={policyTotal > 0 ? "healthy" : "warning"} detail={`${policyStats?.recentDenials ?? 0} recent denials`} count={policyTotal} />
          <HealthCard icon={Link2} title="Action Lineage" status={stuckCount === 0 ? "healthy" : "warning"} detail={`${stuckCount} stuck actions`} count={actionCount} />
          <HealthCard icon={HardDrive} title="Intelligence" status={assetTotal > 0 ? "healthy" : "warning"} detail={`${assetStats?.totalReuses ?? 0} total reuses`} count={assetTotal} />
        </div>

        {/* Domain Coverage & DLQ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div variants={fade}>
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Event Topic Distribution</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {topicKeys.length === 0 && <p className="text-xs text-muted-foreground">No events persisted yet</p>}
                {topicKeys.slice(0, 10).map(topic => (
                  <div key={topic} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-40 truncate">{topic}</span>
                    <Progress value={Math.min(100, ((topicCounts?.[topic] ?? 0) / Math.max(1, eventCount)) * 100)} className="flex-1 h-2" />
                    <span className="text-xs font-mono text-foreground w-8 text-right">{topicCounts?.[topic]}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fade}>
            <Card className={`border-border/50 ${dlCount > 0 ? "border-amber-500/30 bg-amber-500/5" : "bg-card/50"}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${dlCount > 0 ? "text-amber-400" : "text-muted-foreground"}`} />
                  Dead Letter Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{dlCount}</p>
                <p className="text-xs text-muted-foreground mt-1">{dlCount === 0 ? "No failed events — all clear" : `${dlCount} events need attention`}</p>
                {(deadLetters ?? []).slice(0, 5).map((dl, i) => (
                  <div key={dl.id ?? i} className="flex items-center gap-2 mt-2 text-xs">
                    <Badge variant="outline" className="text-[10px]">{dl.topic}</Badge>
                    <span className="text-muted-foreground truncate">{dl.source}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Replay & Continuity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div variants={fade}>
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><RotateCcw className="h-4 w-4 text-primary" />Replay Readiness</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{eventCount > 0 ? "Ready" : "No Data"}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{eventCount} events available for replay</p>
                <Progress value={eventCount > 0 ? 100 : 0} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fade}>
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Server className="h-4 w-4 text-primary" />Memory Scopes</CardTitle></CardHeader>
              <CardContent>
                {Object.entries(memStats?.byScope ?? {}).length === 0 && <p className="text-xs text-muted-foreground">No scoped memory yet</p>}
                {Object.entries(memStats?.byScope ?? {}).map(([scope, count]) => (
                  <div key={scope} className="flex justify-between text-xs py-1 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground capitalize">{scope}</span>
                    <span className="font-mono text-foreground">{count as number}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2">{memStats?.superseded ?? 0} superseded entries</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fade}>
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />Policy by Effect</CardTitle></CardHeader>
              <CardContent>
                {Object.entries(policyStats?.byEffect ?? {}).length === 0 && <p className="text-xs text-muted-foreground">No evaluations yet</p>}
                {Object.entries(policyStats?.byEffect ?? {}).map(([effect, count]) => (
                  <div key={effect} className="flex justify-between text-xs py-1 border-b border-border/30 last:border-0">
                    <Badge variant={effect === "deny" ? "destructive" : "outline"} className="text-[10px]">{effect}</Badge>
                    <span className="font-mono text-foreground">{count as number}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Lineage completeness */}
        <motion.div variants={fade}>
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Lineage Completeness</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Events Persisted", val: eventCount, ok: eventCount > 0 },
                  { label: "Memory Entries", val: memTotal, ok: memTotal > 0 },
                  { label: "Policy Decisions", val: policyTotal, ok: policyTotal > 0 },
                  { label: "Action Records", val: actionCount, ok: actionCount > 0 },
                ].map(item => (
                  <div key={item.label} className="text-center">
                    {item.ok ? <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" /> : <AlertTriangle className="h-5 w-5 text-amber-400 mx-auto" />}
                    <p className="text-lg font-bold text-foreground mt-1">{item.val}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
