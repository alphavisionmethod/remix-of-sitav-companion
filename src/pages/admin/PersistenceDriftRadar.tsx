import CPSSubNav from "@/platform/admin/components/admin/CPSSubNav";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Radar, AlertTriangle, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchPersistedEvents, getScopedMemoryStats, getPolicyEvaluationStats, fetchActionLineage, getAssetStats } from "@/data/persistence";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

interface DriftItem {
  area: string;
  category: "event" | "memory" | "policy" | "action" | "receipt" | "replay";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  remediation: string;
}

export default function PersistenceDriftRadar() {
  const { data: events = [] } = useQuery({ queryKey: ["drift-events"], queryFn: () => fetchPersistedEvents({ limit: 1 }), staleTime: 60000 });
  const { data: memStats } = useQuery({ queryKey: ["drift-mem"], queryFn: getScopedMemoryStats, staleTime: 60000 });
  const { data: polStats } = useQuery({ queryKey: ["drift-pol"], queryFn: getPolicyEvaluationStats, staleTime: 60000 });
  const { data: actions = [] } = useQuery({ queryKey: ["drift-actions"], queryFn: () => fetchActionLineage({ limit: 1 }), staleTime: 60000 });
  const { data: assetStats } = useQuery({ queryKey: ["drift-assets"], queryFn: getAssetStats, staleTime: 60000 });

  const gaps: DriftItem[] = [];

  if (events.length === 0) gaps.push({ area: "EventBus", category: "event", severity: "medium", description: "No events persisted yet — EventBus persistence not exercised", remediation: "Trigger platform actions to generate durable events" });
  if ((memStats?.total ?? 0) === 0) gaps.push({ area: "MemoryService", category: "memory", severity: "medium", description: "No scoped memory persisted — memory continuity not established", remediation: "Store memory entries to establish continuity" });
  if ((polStats?.total ?? 0) === 0) gaps.push({ area: "PolicyEngine", category: "policy", severity: "low", description: "No policy evaluations persisted — only trivial allows may be occurring", remediation: "Trigger high-risk or finance operations to exercise policy persistence" });
  if (actions.length === 0) gaps.push({ area: "ActionStateMachine", category: "action", severity: "medium", description: "No action lineage records — canonical lifecycle not exercised", remediation: "Run workflows to create action state records" });
  if ((assetStats?.total ?? 0) === 0) gaps.push({ area: "Intelligence Assets", category: "replay", severity: "low", description: "No intelligence artifacts persisted", remediation: "Generate intelligence recommendations to populate library" });

  const criticalGaps = gaps.filter(g => g.severity === "critical").length;
  const highGaps = gaps.filter(g => g.severity === "high").length;
  const totalAreas = 6;
  const coveredAreas = totalAreas - gaps.length;
  const coveragePct = (coveredAreas / totalAreas) * 100;

  const overallHealth = criticalGaps > 0 ? "critical" : highGaps > 0 ? "warning" : gaps.length > 2 ? "attention" : "healthy";

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <CPSSubNav />
<motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }} className="space-y-4">
        <motion.div variants={fade} className="flex items-center gap-3">
          <Radar className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Persistence Drift Radar</h1>
          <Badge variant={overallHealth === "healthy" ? "default" : "destructive"}>{overallHealth}</Badge>
        </motion.div>

        {/* Coverage Overview */}
        <motion.div variants={fade}>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Persistence Coverage</span>
                <span>{coveragePct.toFixed(0)}% ({coveredAreas}/{totalAreas} areas)</span>
              </div>
              <Progress value={coveragePct} className="h-3" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Drift Heatmap */}
        <motion.div variants={fade} className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { area: "Events", ok: events.length > 0, icon: "📡" },
            { area: "Memory", ok: (memStats?.total ?? 0) > 0, icon: "🧠" },
            { area: "Policy", ok: (polStats?.total ?? 0) > 0, icon: "🛡️" },
            { area: "Actions", ok: actions.length > 0, icon: "⚡" },
            { area: "Intelligence", ok: (assetStats?.total ?? 0) > 0, icon: "💡" },
            { area: "Receipts", ok: true, icon: "📄" },
          ].map(item => (
            <Card key={item.area} className={`border-border/50 ${item.ok ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
              <CardContent className="p-3 flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.area}</p>
                  <p className="text-xs text-muted-foreground">{item.ok ? "Covered" : "Gap detected"}</p>
                </div>
                {item.ok ? <CheckCircle className="h-4 w-4 text-emerald-400 ml-auto" /> : <AlertTriangle className="h-4 w-4 text-amber-400 ml-auto" />}
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Gap List */}
        {gaps.length > 0 && (
          <motion.div variants={fade}>
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" />Detected Gaps ({gaps.length})</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {gaps.map((gap, i) => (
                  <div key={i} className="border-b border-border/20 pb-2 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={gap.severity === "critical" ? "destructive" : "outline"} className="text-[10px]">{gap.severity}</Badge>
                      <span className="text-sm font-medium text-foreground">{gap.area}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{gap.description}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                      <ArrowRight className="h-3 w-3" />{gap.remediation}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {gaps.length === 0 && (
          <motion.div variants={fade}>
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">No persistence drift detected</p>
                <p className="text-xs text-muted-foreground">All core substrate areas are covered</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
